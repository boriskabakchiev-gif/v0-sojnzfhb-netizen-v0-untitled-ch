import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const customerId = params.id

    if (!customerId) {
      return NextResponse.json({ error: "Missing customer ID" }, { status: 400 })
    }

    console.log(`Checking customer with ID: ${customerId}`)

    // Get the customer data
    const customer = await sql`
      SELECT * FROM customers
      WHERE "Document ID" = ${customerId}
    `

    if (customer.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    console.log("Customer data:", customer[0])
    console.log("All customer fields:", Object.keys(customer[0]))
    console.log("Pending status:", customer[0].pending)

    return NextResponse.json({
      success: true,
      customer: customer[0],
      fields: Object.keys(customer[0]),
      pendingStatus: customer[0].pending,
    })
  } catch (error) {
    console.error("Error checking customer:", error)
    return NextResponse.json(
      {
        error: "Error checking customer",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
