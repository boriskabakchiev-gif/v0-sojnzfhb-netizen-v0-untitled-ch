import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Get all tables from the database
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    const collections = result.map((row) => row.table_name)

    return NextResponse.json({
      success: true,
      collections,
    })
  } catch (error) {
    console.error("Error fetching collections:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch collections",
      },
      { status: 500 },
    )
  }
}
