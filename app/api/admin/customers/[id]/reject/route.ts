import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const customerId = params.id

    if (!customerId) {
      return NextResponse.json({ error: "Missing customer ID" }, { status: 400 })
    }

    console.log(`Rejecting customer with ID: ${customerId}`)

    // First, check if the customer exists and get their current data
    const customerCheck = await sql`
      SELECT * FROM customers
      WHERE "Document ID" = ${customerId}
    `

    if (customerCheck.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    console.log("Customer before rejection:", customerCheck[0])

    // Update the customer status
    await sql`
      UPDATE customers
      SET deleted = true
      WHERE "Document ID" = ${customerId}
    `

    // Verify the update worked
    const verifyUpdate = await sql`
      SELECT * FROM customers
      WHERE "Document ID" = ${customerId}
    `

    console.log("Customer after rejection:", verifyUpdate[0])

    return NextResponse.json({
      success: true,
      message: "Customer rejected successfully",
      customer: verifyUpdate[0],
    })
  } catch (error) {
    console.error("Error rejecting customer:", error)
    return NextResponse.json(
      {
        error: "Error rejecting customer",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
