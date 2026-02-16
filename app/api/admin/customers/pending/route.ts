import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("Fetching pending customers")

    // First, let's log the table schema to see the exact column names
    const tableInfo = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'customers'
    `

    console.log("Customers table schema:", tableInfo)

    // Now fetch all pending customers with all columns
    const pendingCustomers = await sql`
      SELECT * 
      FROM customers 
      WHERE pending = true 
      AND (deleted = false OR deleted IS NULL)
      ORDER BY createdat DESC
    `

    console.log("Raw pending customers data:", JSON.stringify(pendingCustomers, null, 2))

    // Map the data to ensure consistent property names
    const formattedCustomers = pendingCustomers.map((customer) => {
      // Check all possible variations of the type field
      const customerType = customer.type || customer.customertype || customer.customer_type || null

      return {
        ...customer,
        // Ensure the type field exists with the correct value
        type: customerType,
      }
    })

    console.log("Formatted customers data:", JSON.stringify(formattedCustomers, null, 2))

    return NextResponse.json({
      success: true,
      customers: formattedCustomers,
      count: formattedCustomers.length,
    })
  } catch (error) {
    console.error("Error fetching pending customers:", error)
    return NextResponse.json(
      {
        error: "Възникна грешка при извличане на чакащи клиенти",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
