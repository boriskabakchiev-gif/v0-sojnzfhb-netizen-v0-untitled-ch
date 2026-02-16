import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log("Извличане на статистики за dashboard...")

    // Брой чакащи клиенти
    const pendingCustomersResult = await sql`
      SELECT COUNT(*) as count
      FROM customers
      WHERE pending = true AND (deleted = false OR deleted IS NULL)
    `
    const pendingCustomers = Number.parseInt(pendingCustomersResult[0]?.count || "0")

    // Брой активни клиенти
    const activeCustomersResult = await sql`
      SELECT COUNT(*) as count
      FROM customers
      WHERE pending = false AND (deleted = false OR deleted IS NULL)
    `
    const activeCustomers = Number.parseInt(activeCustomersResult[0]?.count || "0")

    // Брой продукти
    const productsResult = await sql`
      SELECT COUNT(*) as count
      FROM new_products
      WHERE deleted = false OR deleted IS NULL
    `
    const totalProducts = Number.parseInt(productsResult[0]?.count || "0")

    // Брой категории
    const categoriesResult = await sql`
      SELECT COUNT(*) as count
      FROM categories
      WHERE deleted = false OR deleted IS NULL
    `
    const totalCategories = Number.parseInt(categoriesResult[0]?.count || "0")

    // Последни регистрирани клиенти (топ 5)
    const recentCustomers = await sql`
      SELECT 
        "Document ID" as id,
        objectid,
        storename,
        companyname,
        createdat,
        pending
      FROM customers
      WHERE deleted = false OR deleted IS NULL
      ORDER BY createdat DESC
      LIMIT 5
    `

    console.log(`Dashboard статистики: ${pendingCustomers} чакащи, ${activeCustomers} активни клиенти`)

    return NextResponse.json({
      pendingCustomers,
      activeCustomers,
      totalProducts,
      totalCategories,
      recentCustomers: recentCustomers.map((customer) => ({
        id: customer.id,
        email: customer.objectid,
        name: customer.storename || customer.companyname || "Неизвестен",
        date: customer.createdat,
        status: customer.pending ? "Чака одобрение" : "Активен",
      })),
    })
  } catch (error) {
    console.error("Грешка при извличане на dashboard статистики:", error)
    return NextResponse.json(
      {
        error: "Грешка при извличане на статистики",
        pendingCustomers: 0,
        activeCustomers: 0,
        totalProducts: 0,
        totalCategories: 0,
        recentCustomers: [],
      },
      { status: 500 },
    )
  }
}
