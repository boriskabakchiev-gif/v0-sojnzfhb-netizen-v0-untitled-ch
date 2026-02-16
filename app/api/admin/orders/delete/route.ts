import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("id")

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Delete the order from the simple_orders table
    await sql`
      DELETE FROM simple_orders
      WHERE id = ${orderId}
    `

    return NextResponse.json({ success: true, message: "Order deleted successfully" })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ error: "Failed to delete order", details: error.message }, { status: 500 })
  }
}
