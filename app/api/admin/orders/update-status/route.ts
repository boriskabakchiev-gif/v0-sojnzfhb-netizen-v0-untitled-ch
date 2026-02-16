import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { orderId, status } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ["new", "processing", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update the order status
    await sql`
      UPDATE simple_orders
      SET status = ${status}
      WHERE id = ${orderId}
    `

    return NextResponse.json({ success: true, message: "Order status updated successfully" })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
  }
}
