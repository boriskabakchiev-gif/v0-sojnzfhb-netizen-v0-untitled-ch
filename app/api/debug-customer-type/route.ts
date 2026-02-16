import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    // Get the current user
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "User not logged in" }, { status: 401 })
    }

    // Get customer details from the database
    const customerResult = await sql`
      SELECT * FROM customers WHERE userid = ${user.id}
    `

    const customer = customerResult.rows[0] || null

    // Get a sample product to test price display
    const productResult = await sql`
      SELECT * FROM new_products LIMIT 1
    `

    const product = productResult.rows[0] || null

    // Return debug information
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        customerType: user.customerType,
        discountPercent: user.discountPercent,
      },
      customer: customer,
      product: product,
      isEuropeanCustomer:
        user.customerType?.toLowerCase() === "european" || user.customerType?.toLowerCase() === "europen",
      priceToShow:
        user.customerType?.toLowerCase() === "european" || user.customerType?.toLowerCase() === "europen"
          ? product?.europe_price
          : product?.price,
    })
  } catch (error) {
    console.error("Error in debug route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
