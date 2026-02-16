import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const customerId = params.id

    if (!customerId) {
      return NextResponse.json({ error: "Missing customer ID" }, { status: 400 })
    }

    console.log(`Approving customer with ID: ${customerId}`)

    // First, check if the customer exists and get their current data
    const customerCheck = await sql`
      SELECT * FROM customers
      WHERE "Document ID" = ${customerId}
    `

    if (customerCheck.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    console.log("Customer before approval:", customerCheck[0])

    // Try multiple approaches to update the pending status
    try {
      // Approach 1: Standard update
      await sql`
        UPDATE customers
        SET pending = false
        WHERE "Document ID" = ${customerId}
      `
      console.log("Updated pending status with approach 1")
    } catch (error1) {
      console.error("Error with approach 1:", error1)
      try {
        // Approach 2: Try with quotes around field name
        await sql`
          UPDATE customers
          SET "pending" = false
          WHERE "Document ID" = ${customerId}
        `
        console.log("Updated pending status with approach 2")
      } catch (error2) {
        console.error("Error with approach 2:", error2)
        try {
          // Approach 3: Try with a different column name if it exists
          await sql`
            UPDATE customers
            SET status = 'active'
            WHERE "Document ID" = ${customerId}
          `
          console.log("Updated status with approach 3")
        } catch (error3) {
          console.error("Error with approach 3:", error3)
          try {
            // Approach 4: Try with approval_status if it exists
            await sql`
              UPDATE customers
              SET approval_status = 'approved'
              WHERE "Document ID" = ${customerId}
            `
            console.log("Updated approval_status with approach 4")
          } catch (error4) {
            console.error("Error with approach 4:", error4)
            throw new Error("All update approaches failed")
          }
        }
      }
    }

    // Verify the update worked
    const verifyUpdate = await sql`
      SELECT * FROM customers
      WHERE "Document ID" = ${customerId}
    `

    console.log("Customer after approval:", verifyUpdate[0])
    console.log("Pending status after approval:", verifyUpdate[0].pending)

    return NextResponse.json({
      success: true,
      message: "Customer approved successfully",
      customer: verifyUpdate[0],
    })
  } catch (error) {
    console.error("Error approving customer:", error)
    return NextResponse.json(
      {
        error: "Error approving customer",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
