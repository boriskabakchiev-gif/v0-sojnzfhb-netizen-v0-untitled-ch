// Fix the schema API route to ensure it always returns valid JSON
import { NextResponse } from "next/server"
import { getTableSchema } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get("table")

    if (!table) {
      return NextResponse.json(
        {
          success: false,
          error: "Table parameter is required",
          columns: [],
        },
        { status: 400 },
      )
    }

    const result = await getTableSchema(table)

    return NextResponse.json({
      success: true,
      columns: result.columns || [],
    })
  } catch (error) {
    console.error(`Error fetching schema:`, error)

    // Return a structured error response
    return NextResponse.json(
      {
        success: false,
        error: `Error fetching schema: ${error instanceof Error ? error.message : "Unknown error"}`,
        columns: [],
      },
      { status: 500 },
    )
  }
}
