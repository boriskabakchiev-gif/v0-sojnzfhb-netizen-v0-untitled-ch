import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const returns = await sql`SELECT * FROM order_returns ORDER BY created_at DESC`
    return NextResponse.json(returns)
  } catch (error) {
    console.error("Error fetching order returns:", error)
    return NextResponse.json({ message: "Failed to fetch order returns", error }, { status: 500 })
  }
}
