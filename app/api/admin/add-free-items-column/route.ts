import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if the free_items_count column exists in the simple_orders table
    const checkColumnResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'simple_orders' AND column_name = 'free_items_count'
    `

    // If the column doesn't exist, add it
    if (checkColumnResult.length === 0) {
      await sql`
        ALTER TABLE simple_orders 
        ADD COLUMN free_items_count INTEGER DEFAULT 0
      `
      return NextResponse.json({
        success: true,
        message: "Added free_items_count column to simple_orders table",
      })
    }

    return NextResponse.json({
      success: true,
      message: "free_items_count column already exists in simple_orders table",
    })
  } catch (error) {
    console.error("Error adding free_items_count column:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
