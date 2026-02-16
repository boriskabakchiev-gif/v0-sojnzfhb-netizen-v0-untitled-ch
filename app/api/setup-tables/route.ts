import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Create a simple orders table
    await sql`
      CREATE TABLE IF NOT EXISTS simple_orders (
        id SERIAL PRIMARY KEY,
        order_id TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_name TEXT,
        customer_phone TEXT,
        delivery_address TEXT,
        total_amount NUMERIC(10,2),
        status TEXT DEFAULT 'new',
        items TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    return NextResponse.json({ success: true, message: "Tables created successfully" })
  } catch (error) {
    console.error("Error setting up tables:", error)
    return NextResponse.json({ error: "Failed to set up tables", details: error.message }, { status: 500 })
  }
}
