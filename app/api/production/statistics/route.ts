import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get("startDate")
    const employeeId = request.headers.get("x-employee-id")

    if (!employeeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] API received startDateParam:", startDateParam)

    let weekStart: Date
    if (startDateParam) {
      const [year, month, day] = startDateParam.split("-").map(Number)
      const selectedDate = new Date(year, month - 1, day)
      weekStart = getMonday(selectedDate)
      console.log("[v0] Parsed selectedDate:", selectedDate)
      console.log("[v0] Calculated weekStart (Monday):", weekStart)
    } else {
      const today = new Date()
      weekStart = getMonday(today)
      console.log("[v0] Using Monday of current week as weekStart:", weekStart)
    }

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const workingDays: string[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(day.getDate() + i)
      const year = day.getFullYear()
      const month = String(day.getMonth() + 1).padStart(2, "0")
      const dayNum = String(day.getDate()).padStart(2, "0")
      workingDays.push(`${year}-${month}-${dayNum}`)
    }

    const employees = await sql`
      SELECT 
        e.id,
        e.name,
        COALESCE(sl.salary_per_day, 50) as base_salary
      FROM employees e
      LEFT JOIN salary_levels sl ON e.salary_level_id = sl.id
      WHERE e.active = true
      ORDER BY e.name
    `

    if (employees.length === 0) {
      return NextResponse.json({
        weekStart: weekStart.toISOString().split("T")[0],
        weekEnd: weekEnd.toISOString().split("T")[0],
        workingDays,
        employees: [],
        productSales: [],
      })
    }

    const productionProducts = await sql`
      SELECT 
        id,
        name,
        daily_target,
        production_line_id,
        sales_value
      FROM production_products
      WHERE active = true
    `

    const dailyPrices = await sql`
      SELECT 
        production_product_id,
        production_line_id,
        price_date,
        price_per_piece
      FROM daily_product_prices
      WHERE price_date >= ${workingDays[0]}::date
        AND price_date <= ${workingDays[6]}::date
    `

    const productions = await sql`
      SELECT 
        p.employee_id,
        p.production_date,
        p.quantity,
        p.product_name,
        p.production_line_id,
        p.partner_employee_id
      FROM productions p
      WHERE p.production_date >= ${workingDays[0]}::date
        AND p.production_date <= ${workingDays[6]}::date
    `

    const productSalesMap = new Map<
      string,
      {
        productName: string
        productId: number
        productionLineId: number
        dailySales: { [date: string]: { quantity: number; value: number; price: number } }
        totalQuantity: number
        totalValue: number
        salesValue: number
        dailyTarget: number
        dailyPrices: { [date: string]: number }
      }
    >()

    productions.forEach((production) => {
      const productionDate = new Date(production.production_date).toLocaleDateString("en-CA", {
        timeZone: "Europe/Sofia",
      })
      const quantity = Number(production.quantity)

      let actualProductId = production.product_name
      let productType = null

      if (production.product_name.startsWith("production-")) {
        actualProductId = production.product_name.replace("production-", "")
        productType = "production"
      } else if (production.product_name.startsWith("online-")) {
        actualProductId = production.product_name.replace("online-", "")
        productType = "online"
      }

      if (productType === "production") {
        const productionProduct = productionProducts.find(
          (pp) => pp.id.toString() === actualProductId && pp.production_line_id === production.production_line_id,
        )

        if (productionProduct && productionProduct.sales_value) {
          const defaultSalesValue = Number(productionProduct.sales_value)
          const dailyTarget = Number(productionProduct.daily_target)
          const key = `${productionProduct.id}-${productionProduct.production_line_id}`

          const dailyPrice = dailyPrices.find(
            (dp) =>
              dp.production_product_id === productionProduct.id &&
              dp.production_line_id === production.production_line_id &&
              new Date(dp.price_date).toLocaleDateString("en-CA", { timeZone: "Europe/Sofia" }) === productionDate,
          )
          const priceForDate = dailyPrice ? Number(dailyPrice.price_per_piece) : defaultSalesValue

          if (!productSalesMap.has(key)) {
            productSalesMap.set(key, {
              productName: productionProduct.name,
              productId: productionProduct.id,
              productionLineId: productionProduct.production_line_id,
              dailySales: {},
              totalQuantity: 0,
              totalValue: 0,
              salesValue: defaultSalesValue,
              dailyTarget: dailyTarget,
              dailyPrices: {},
            })
          }

          const productSales = productSalesMap.get(key)!
          if (!productSales.dailySales[productionDate]) {
            productSales.dailySales[productionDate] = { quantity: 0, value: 0, price: priceForDate }
            productSales.dailyPrices[productionDate] = priceForDate
          }

          productSales.dailySales[productionDate].quantity += quantity
          const totalValue = quantity * priceForDate
          productSales.dailySales[productionDate].value += totalValue
          productSales.totalQuantity += quantity
          productSales.totalValue += totalValue
        }
      }
    })

    productSalesMap.forEach((productSales) => {
      workingDays.forEach((date) => {
        if (!productSales.dailyPrices[date]) {
          // Check if there's a price set for this date
          const dailyPrice = dailyPrices.find(
            (dp) =>
              dp.production_product_id === productSales.productId &&
              dp.production_line_id === productSales.productionLineId &&
              new Date(dp.price_date).toLocaleDateString("en-CA", { timeZone: "Europe/Sofia" }) === date,
          )
          productSales.dailyPrices[date] = dailyPrice ? Number(dailyPrice.price_per_piece) : productSales.salesValue
        }
      })
    })

    const productSales = Array.from(productSalesMap.values())

    const employeeStats = employees.map((employee) => {
      const dailyCoefficients: { [date: string]: number } = {}
      const dailySalaries: { [date: string]: number } = {}
      let totalCoefficient = 0
      let weeklySalary = 0
      let daysWorked = 0

      const baseDailySalary = Number(employee.base_salary)

      workingDays.forEach((date) => {
        const dayProductions = productions.filter((p) => {
          const productionDate = new Date(p.production_date).toLocaleDateString("en-CA", { timeZone: "Europe/Sofia" })
          return (p.employee_id === employee.id || p.partner_employee_id === employee.id) && productionDate === date
        })

        const productionsByProduct = new Map<string, { quantity: number; target: number }>()

        dayProductions.forEach((production) => {
          const quantity = Number(production.quantity)

          let actualProductId = production.product_name
          let productType = null

          if (production.product_name.startsWith("production-")) {
            actualProductId = production.product_name.replace("production-", "")
            productType = "production"
          } else if (production.product_name.startsWith("online-")) {
            actualProductId = production.product_name.replace("online-", "")
            productType = "online"
          }

          if (productType === "production") {
            const productionProduct = productionProducts.find(
              (pp) => pp.id.toString() === actualProductId && pp.production_line_id === production.production_line_id,
            )

            if (productionProduct) {
              const productKey = `${actualProductId}-${production.production_line_id}`
              const dailyTarget = Number(productionProduct.daily_target)

              if (!productionsByProduct.has(productKey)) {
                productionsByProduct.set(productKey, { quantity: 0, target: dailyTarget })
              }

              const productData = productionsByProduct.get(productKey)!
              productData.quantity += quantity
            }
          }
        })

        let coefficient = 0

        productionsByProduct.forEach((productData, productKey) => {
          // Get ALL employee productions for this specific product on this day
          const allDayProductionsForProduct = productions.filter((p) => {
            const productionDate = new Date(p.production_date).toLocaleDateString("en-CA", {
              timeZone: "Europe/Sofia",
            })
            let pActualProductId = p.product_name
            if (p.product_name.startsWith("production-")) {
              pActualProductId = p.product_name.replace("production-", "")
            } else if (p.product_name.startsWith("online-")) {
              pActualProductId = p.product_name.replace("online-", "")
            }
            const pProductKey = `${pActualProductId}-${p.production_line_id}`
            return productionDate === date && pProductKey === productKey
          })

          const totalProductionForDay = allDayProductionsForProduct.reduce((sum, p) => sum + Number(p.quantity), 0)

          // Add this product's contribution to the total coefficient
          // Coefficient per product = total production for the day / product's daily target
          if (productData.target > 0) {
            coefficient += totalProductionForDay / productData.target
          }
        })

        const dailySalary = baseDailySalary * coefficient

        dailyCoefficients[date] = coefficient
        dailySalaries[date] = dailySalary
        totalCoefficient += coefficient
        weeklySalary += dailySalary

        if (coefficient > 0) {
          daysWorked++
        }
      })

      const weeklyAverage = daysWorked > 0 ? totalCoefficient / daysWorked : 0

      return {
        id: employee.id,
        name: employee.name,
        baseSalary: baseDailySalary,
        dailyCoefficients,
        dailySalaries,
        weeklyAverage,
        weeklySalary,
      }
    })

    const weeklyStats = {
      weekStart: weekStart.toISOString().split("T")[0],
      weekEnd: weekEnd.toISOString().split("T")[0],
      workingDays,
      employees: employeeStats,
      productSales,
    }

    return NextResponse.json(weeklyStats)
  } catch (error) {
    console.error("[v0] Error fetching weekly statistics:", error)
    return NextResponse.json({ error: "Грешка при извличане на статистиките" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, productionLineId, date, price } = body

    if (!productId || !productionLineId || !date || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Upsert the daily price
    await sql`
      INSERT INTO daily_product_prices (production_product_id, production_line_id, price_date, price_per_piece, updated_at)
      VALUES (${productId}, ${productionLineId}, ${date}::date, ${price}, CURRENT_TIMESTAMP)
      ON CONFLICT (production_product_id, production_line_id, price_date)
      DO UPDATE SET 
        price_per_piece = ${price},
        updated_at = CURRENT_TIMESTAMP
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating daily price:", error)
    return NextResponse.json({ error: "Грешка при актуализиране на цената" }, { status: 500 })
  }
}
