import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if orders table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'orders'
      ) as exists
    `

    if (!tableExists[0].exists) {
      // Create orders table
      await sql`
        CREATE TABLE orders (
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
      return NextResponse.json({ message: "Orders table created successfully" })
    }

    // Check if customers table exists
    const customersExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'customers'
      ) as exists
    `

    if (!customersExists[0].exists) {
      // Create customers table
      await sql`
        CREATE TABLE customers (
          objectid TEXT PRIMARY KEY,
          storename TEXT,
          companyname TEXT,
          phone TEXT,
          createdat JSONB
        )
      `
      return NextResponse.json({ message: "Customers table created successfully" })
    }

    // Create the simple_orders table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS simple_orders (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(255) UNIQUE NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255),
        customer_phone VARCHAR(50),
        delivery_address TEXT,
        total_amount DECIMAL(10, 2),
        items JSONB,
        free_items_count INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Add any missing columns
    const alterQueries = [
      `ALTER TABLE simple_orders ADD COLUMN IF NOT EXISTS free_items_count INTEGER DEFAULT 0`,
      `ALTER TABLE simple_orders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'`,
      `ALTER TABLE simple_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    ]

    for (const query of alterQueries) {
      try {
        await sql.unsafe(query)
      } catch (error) {
        console.log(`Column might already exist: ${error.message}`)
      }
    }

    // Create an index on order_id for faster lookups
    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_simple_orders_order_id 
        ON simple_orders(order_id)
      `
    } catch (error) {
      console.log("Index might already exist")
    }

    return NextResponse.json({
      success: true,
      message: "Orders table setup completed successfully",
    })
  } catch (error: any) {
    console.error("Error setting up tables:", error)
    return NextResponse.json(
      {
        error: "Failed to set up tables",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
