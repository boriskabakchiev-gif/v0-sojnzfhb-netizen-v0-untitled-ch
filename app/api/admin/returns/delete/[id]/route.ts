import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const sql = neon(process.env.DATABASE_URL!)

    if (!id) {
      return NextResponse.json({ message: "Return ID is required" }, { status: 400 })
    }

    await sql`DELETE FROM order_returns WHERE id = ${id}`

    return NextResponse.json({ message: "Order return deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting order return:", error)
    return NextResponse.json({ message: "Failed to delete order return", error }, { status: 500 })
  }
}
