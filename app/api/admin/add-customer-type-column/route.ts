import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Check if the type column exists
    const checkColumnResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'customers' AND column_name = 'type'
    `

    if (checkColumnResult.length === 0) {
      // If the column doesn't exist, create it
      await sql`
        ALTER TABLE customers 
        ADD COLUMN type VARCHAR(50) DEFAULT 'standard'
      `
      return NextResponse.json({
        success: true,
        message: "Column 'type' added to customers table",
      })
    }

    // Check if the enum type exists for customer types
    const checkEnumResult = await sql`
      SELECT typname 
      FROM pg_type 
      WHERE typname = 'customer_type'
    `

    if (checkEnumResult.length === 0) {
      // Create the enum type if it doesn't exist
      await sql`
        CREATE TYPE customer_type AS ENUM ('standard', 'retailer', 'wholesaler', 'european', 'distributor')
      `

      // We won't alter the column type to use the enum yet, as it might contain other values
      return NextResponse.json({
        success: true,
        message: "Created customer_type enum",
      })
    }

    // If we get here, the column exists but we might need to update the enum
    // Let's check if 'european' is in the enum type
    const checkEnumValuesResult = await sql`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'customer_type') 
      AND enumlabel = 'european'
    `

    if (checkEnumValuesResult.length === 0) {
      // Add 'european' to the enum
      await sql`
        ALTER TYPE customer_type ADD VALUE 'european'
      `
      return NextResponse.json({
        success: true,
        message: "Added 'european' to customer_type enum",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Customer type system is already set up with 'european' type",
    })
  } catch (error) {
    console.error("Error updating customer type system:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update customer type system",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
