import { NextResponse, type NextRequest } from "next/server"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "madix-groundbaits-secret-key-2024"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password } = body

    console.log("LOGIN_ROUTE: Attempt for phone:", phone)

    if (!phone || !password) {
      return NextResponse.json({ error: "Моля, въведете телефон и парола" }, { status: 400 })
    }

    // Проверка дали таблицата customers съществува и има колоните phone и password
    try {
      console.log("LOGIN_ROUTE: Checking customers table structure...")
      const tableInfo = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'customers'
      `
      console.log("LOGIN_ROUTE: Table structure:", tableInfo)

      // Проверка за наличие на колоните phone и password
      const hasPhoneColumn = tableInfo.some((col: any) => col.column_name === "phone")
      const hasPasswordColumn = tableInfo.some((col: any) => col.column_name === "password")

      console.log(`LOGIN_ROUTE: Has phone column: ${hasPhoneColumn}, Has password column: ${hasPasswordColumn}`)

      if (!hasPhoneColumn || !hasPasswordColumn) {
        return NextResponse.json(
          {
            error: "Системна грешка: Липсват необходими колони в базата данни.",
            details:
              `Missing columns: ${!hasPhoneColumn ? "phone" : ""} ${!hasPasswordColumn ? "password" : ""}`.trim(),
          },
          { status: 500 },
        )
      }
    } catch (schemaError) {
      console.error("LOGIN_ROUTE: Error checking schema:", schemaError)
    }

    // Извличане на потребителя по телефон
    let users: any[]
    try {
      console.log("LOGIN_ROUTE: Executing SQL query for phone:", phone)
      users = await sql`
        SELECT * FROM customers WHERE phone = ${phone}
      `
      console.log("LOGIN_ROUTE: SQL query completed. Found users:", users.length)

      // Показване на първите няколко колони на намерения потребител за диагностика
      if (users.length > 0) {
        const userSample = { ...users[0] }
        // Скриване на паролата в логовете
        if (userSample.password) userSample.password = "***HIDDEN***"
        console.log("LOGIN_ROUTE: User data sample:", userSample)
      }
    } catch (dbExecError) {
      console.error("LOGIN_ROUTE: Error during SQL execution:", dbExecError)
      return NextResponse.json(
        {
          error: "Грешка при заявка към базата данни. Моля, опитайте отново.",
          details: dbExecError instanceof Error ? dbExecError.message : "SQL execution failed",
        },
        { status: 500 },
      )
    }

    if (!users || users.length === 0) {
      console.log("LOGIN_ROUTE: No user found with phone:", phone)
      return NextResponse.json({ error: "Невалиден телефон или парола" }, { status: 401 })
    }

    const user = users[0]
    console.log("LOGIN_ROUTE: User found with ID:", user.id || user.objectid || "unknown")

    // Проверка дали потребителят чака одобрение
    const isPending = user.pending === true || user.pending === "true" || user.pending === 1
    if (isPending) {
      console.log("LOGIN_ROUTE: User is pending approval:", phone)
      return NextResponse.json(
        {
          error: "Вашият акаунт все още чака одобрение от администратор",
          pending: true,
        },
        { status: 403 },
      )
    }

    // Подробна проверка на паролата с повече логове
    let passwordMatch = false
    console.log("LOGIN_ROUTE: Checking password. Password exists in DB:", !!user.password)

    if (user.password) {
      // Проверка дали паролата е хеширана (bcrypt хешовете започват с $2a$ или $2b$)
      const isBcryptHash =
        typeof user.password === "string" && (user.password.startsWith("$2a$") || user.password.startsWith("$2b$"))

      console.log("LOGIN_ROUTE: Password appears to be bcrypt hash:", isBcryptHash)

      if (isBcryptHash) {
        try {
          passwordMatch = await bcrypt.compare(password, user.password)
          console.log("LOGIN_ROUTE: bcrypt.compare result:", passwordMatch)
        } catch (bcryptError) {
          console.error("LOGIN_ROUTE: Error comparing passwords with bcrypt:", bcryptError)
          // Fallback to direct comparison if bcrypt fails
          passwordMatch = user.password === password
          console.log("LOGIN_ROUTE: Fallback direct comparison result:", passwordMatch)
        }
      } else {
        // Директно сравнение за нехеширани пароли
        passwordMatch = user.password === password
        console.log("LOGIN_ROUTE: Direct password comparison result:", passwordMatch)
      }
    } else {
      // Ако паролата в базата е null/undefined и входящата парола е празна
      passwordMatch = password === ""
      console.log("LOGIN_ROUTE: Empty password check result:", passwordMatch)
    }

    if (!passwordMatch) {
      console.log("LOGIN_ROUTE: Password does not match for phone:", phone)
      return NextResponse.json({ error: "Невалиден телефон или парола" }, { status: 401 })
    }

    // Успешен вход - създаване на токен
    const customerType = user.type || user.customertype || user.customer_type || "standard"
    let discountPercent = user.discountpercent || user.discount_percent || 0

    if (!discountPercent) {
      if (customerType === "wholesaler" || customerType === "едро") discountPercent = 20
      else if (customerType === "retailer" || customerType === "дребно") discountPercent = 10
    }

    const tokenData = {
      id: user.id || user.objectid || user["Document ID"] || user.document_id || "",
      phone: user.phone || "",
      email: user.email || user.objectid || "",
      customerType: customerType,
      storeName: user.storename || user["Store Name"] || user.store_name || "",
      companyName: user.companyname || user["Company Name"] || user.company_name || "",
      name:
        user.name ||
        user.customer_name ||
        `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
        user.storename ||
        user.companyname ||
        "",
      firstName: user.firstname || user["First Name"] || user.first_name || "",
      lastName: user.lastname || user["Last Name"] || user.last_name || "",
      isCustomer: true,
      discountPercent: discountPercent,
      deliveryAddress: user.delivery_address || user.address || "",
      role: user.role || (user.is_admin ? "admin" : "customer"),
    }

    console.log("LOGIN_ROUTE: Creating token with data:", tokenData)
    const token = jwt.sign(tokenData, JWT_SECRET, { expiresIn: "7d" })

    const response = NextResponse.json({ success: true, token, user: tokenData })
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    console.log("LOGIN_ROUTE: Login successful for phone:", phone)
    return response
  } catch (error) {
    console.error("LOGIN_ROUTE: Unhandled error in POST handler:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: "Възникна неочаквана сървърна грешка. Моля, опитайте отново по-късно.",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
