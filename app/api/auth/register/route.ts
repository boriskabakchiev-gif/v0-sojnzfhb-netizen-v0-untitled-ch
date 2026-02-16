import { NextResponse, type NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"
import { SignJWT } from "jose"
import { z } from "zod"

const sql = neon(process.env.DATABASE_URL!)

const JWT_SECRET_TEXT = process.env.JWT_SECRET || "madix-groundbaits-secret-key-2024"
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_TEXT)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { storeName, companyName, phone, email, customerType, password, name, firstName, lastName, deliveryAddress } =
      body

    console.log("[v0] Registration attempt with data:", {
      storeName,
      companyName,
      phone,
      email,
      customerType,
      name,
      firstName,
      lastName,
    })

    // Валидация на задължителните полета
    if (!phone || !password || !(name || storeName || companyName || (firstName && lastName))) {
      return NextResponse.json({ error: "Липсват задължителни полета (Име/Фирма, Телефон, Парола)" }, { status: 400 })
    }

    console.log("[v0] Checking for existing phone:", phone)
    const existingPhone = await sql`
      SELECT "Document ID" FROM customers WHERE phone = ${phone};
    `
    console.log("[v0] Existing phone check result:", existingPhone)

    if (existingPhone.length > 0) {
      return NextResponse.json({ error: "Телефонният номер вече е регистриран." }, { status: 409 })
    }

    if (email) {
      console.log("[v0] Checking for existing email:", email)
      const existingEmail = await sql`
        SELECT "Document ID" FROM customers WHERE objectid = ${email};
      `
      console.log("[v0] Existing email check result:", existingEmail)

      if (existingEmail.length > 0) {
        return NextResponse.json({ error: "Имейлът вече е регистриран." }, { status: 409 })
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const documentId = randomUUID()
    const pendingApproval = customerType !== "standard" && customerType !== "редовен" // Редовните клиенти не чакат одобрение

    // Подготовка на имената
    const finalFirstName = firstName || (name ? name.split(" ")[0] : "")
    const finalLastName = lastName || (name ? name.split(" ").slice(1).join(" ") : "")
    const finalName = name || `${finalFirstName} ${finalLastName}`.trim() || storeName || companyName

    const insertData = {
      documentId,
      storeName: storeName || companyName || finalName || null,
      phone,
      objectid: email || phone,
      type: customerType || "standard",
      hashedPassword,
      pendingApproval,
    }

    console.log("[v0] About to insert data:", insertData)

    const insertResult = await sql`
      INSERT INTO customers (
        "Document ID", storename, phone, objectid, type, password, pending
      ) VALUES (
        ${documentId}, 
        ${storeName || companyName || finalName || null}, 
        ${phone}, 
        ${email || phone},
        ${customerType || "standard"}, 
        ${hashedPassword}, 
        ${pendingApproval}
      );
    `

    console.log("[v0] Database insertion result:", insertResult)
    console.log("[v0] Successfully inserted user with ID:", documentId)

    const effectiveCustomerType = customerType || "standard"

    // Ако клиентът не изисква одобрение, логваме го веднага
    if (!pendingApproval) {
      const tokenPayload = {
        id: documentId,
        phone: phone, // Гарантираме, че телефонът е в токена
        email: email || null,
        customerType: effectiveCustomerType,
        storeName: storeName || "",
        companyName: companyName || "",
        name: finalName,
        firstName: finalFirstName,
        lastName: finalLastName,
        isCustomer: true,
        discountPercent: 0, // Начална отстъпка
        deliveryAddress: deliveryAddress || "",
        role: "customer",
      }

      const token = await new SignJWT(tokenPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(JWT_SECRET)

      const response = NextResponse.json({
        success: true,
        pending: false,
        message: "Регистрацията е успешна и сте влезли.",
        user: tokenPayload,
      })
      response.cookies.set("auth_token", token, {
        // Използваме auth_token за консистентност с login
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 дни
        path: "/",
        sameSite: "lax",
      })
      return response
    }

    return NextResponse.json({
      success: true,
      pending: pendingApproval,
      message: pendingApproval ? "Регистрацията е изпратена за одобрение." : "Регистрацията е успешна.",
    })
  } catch (error) {
    console.error("[v0] Registration error details:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    // Проверка дали грешката е от Zod за по-добро съобщение
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Невалидни данни.", details: error.errors }, { status: 400 })
    }
    // Проверка за специфични грешки от базата данни (например уникалност)
    if (error instanceof Error && "code" in error && error.code === "23505") {
      // PostgreSQL unique violation
      return NextResponse.json(
        { error: "Вече съществува потребител с тези данни (телефон или имейл)." },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: "Възникна грешка при регистрацията." }, { status: 500 })
  }
}
