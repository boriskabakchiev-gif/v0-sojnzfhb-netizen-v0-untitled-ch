import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Fetch orders from simple_orders table
    const orders = await sql`
      SELECT 
        id,
        order_id as "orderId",
        customer_email as "customerEmail",
        customer_name as "customerName",
        customer_phone as "customerPhone",
        delivery_address as "deliveryAddress",
        total_amount as "totalAmount",
        items,
        free_items_count as "freeItemsCount",
        status,
        created_at as "createdAt"
      FROM simple_orders
      ORDER BY created_at DESC
    `

    console.log(`Fetched ${orders.length} orders from database`)

    // Log sample order items to check category data
    if (orders.length > 0 && orders[0].items) {
      console.log("Sample order items structure:", {
        orderId: orders[0].orderId,
        firstItem: orders[0].items[0],
      })
    }

    return NextResponse.json({
      orders: orders || [],
      count: orders.length,
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
