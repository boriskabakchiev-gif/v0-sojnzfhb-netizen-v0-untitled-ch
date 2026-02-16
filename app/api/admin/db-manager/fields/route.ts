import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const collection = searchParams.get("collection")

  if (!collection) {
    return NextResponse.json(
      {
        success: false,
        error: "Collection name is required",
      },
      { status: 400 },
    )
  }

  try {
    // Get all columns from the specified table
    const result = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = ${collection}
      ORDER BY ordinal_position
    `

    const fields = result.map((row) => row.column_name)

    return NextResponse.json({
      success: true,
      fields,
    })
  } catch (error) {
    console.error(`Error fetching fields for collection ${collection}:`, error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch fields for collection ${collection}`,
      },
      { status: 500 },
    )
  }
}
