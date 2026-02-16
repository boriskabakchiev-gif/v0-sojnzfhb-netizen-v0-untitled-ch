import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Get the table structure
    const tableInfo = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'customers'
    `

    // Get a sample customer to see the actual data
    const sampleCustomer = await sql`
      SELECT * FROM customers LIMIT 1
    `

    return NextResponse.json({
      success: true,
      tableStructure: tableInfo,
      sampleCustomer: sampleCustomer[0] || null,
    })
  } catch (error) {
    console.error("Error getting DB structure:", error)
    return NextResponse.json(
      {
        error: "Error getting DB structure",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
