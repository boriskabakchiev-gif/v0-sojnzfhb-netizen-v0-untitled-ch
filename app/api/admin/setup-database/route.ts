import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Create orders table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        objectid TEXT PRIMARY KEY,
        orderid TEXT,
        orderby TEXT,
        status TEXT DEFAULT 'new',
        bill TEXT,
        deliveryto TEXT,
        carts JSONB,
        createdat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create customers table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        objectid TEXT PRIMARY KEY,
        storename TEXT,
        companyname TEXT,
        phone TEXT,
        createdat TEXT,
        type TEXT,
        discountpercent NUMERIC
      )
    `

    return NextResponse.json({
      success: true,
      message: "Database tables created successfully",
    })
  } catch (error) {
    console.error("Error setting up database:", error)
    return NextResponse.json(
      {
        error: "Failed to set up database",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
