import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, productName, quantity, reason } = body

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !productName || !quantity || !reason) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Corrected column name to return_reason
    await sql`
      INSERT INTO order_returns (first_name, last_name, email, phone, product_name, quantity, return_reason)
      VALUES (${firstName}, ${lastName}, ${email}, ${phone}, ${productName}, ${quantity}, ${reason})
    `

    return NextResponse.json({ message: "Return request submitted successfully!" }, { status: 200 })
  } catch (error) {
    console.error("Error submitting return request:", error)
    return NextResponse.json({ message: "Failed to submit return request", error }, { status: 500 })
  }
}
