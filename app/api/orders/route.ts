import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Fetch orders from the simple_orders table
    const orders = await sql`
      SELECT * FROM simple_orders
      ORDER BY created_at DESC
    `

    // Process the results
    const processedOrders = orders.map((order) => {
      // Parse the items
      let items = []
      try {
        items = JSON.parse(order.items || "[]")
      } catch (e) {
        console.error("Error parsing items:", e)
      }

      return {
        _id: order.id,
        orderNumber: order.order_id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        customerAddress: order.delivery_address,
        orderDate: order.created_at,
        totalAmount: Number(order.total_amount) || 0,
        paymentMethod: order.payment_method || "cashOnDelivery",
        shippingMethod: order.shipping_method || "standard",
        shippingCost: Number(order.shipping_cost) || 0,
        orderStatus: order.status || "pending",
        items: items.map((item) => ({
          productId: item.id || "",
          name: item.title || item.name || "Неизвестен продукт",
          quantity: item.quantity || 1,
          price: item.price || 0,
        })),
      }
    })

    return NextResponse.json(processedOrders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders", details: error.message }, { status: 500 })
  }
}
