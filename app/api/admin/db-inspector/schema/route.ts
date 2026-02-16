import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get("table")

    if (!table) {
      return NextResponse.json({ success: false, error: "Table name is required" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Get table columns and their properties
    const columns = await sql`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM 
        information_schema.columns
      WHERE 
        table_schema = 'public'
        AND table_name = ${table}
      ORDER BY 
        ordinal_position
    `

    return NextResponse.json({ success: true, columns })
  } catch (error: any) {
    console.error("Error fetching schema:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch schema" }, { status: 500 })
  }
}
