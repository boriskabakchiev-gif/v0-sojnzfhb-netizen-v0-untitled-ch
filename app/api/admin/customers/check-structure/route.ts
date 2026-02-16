import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Извличане на структурата на таблицата customers
    const tableStructure = await sql`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'customers'
      ORDER BY ordinal_position
    `

    // Извличане на примерен запис
    const sampleRecord = await sql`
      SELECT * FROM customers LIMIT 1
    `

    return NextResponse.json({
      success: true,
      structure: tableStructure,
      sampleRecord: sampleRecord.length > 0 ? sampleRecord[0] : null,
      columnNames: tableStructure.map((col: any) => col.column_name),
    })
  } catch (error) {
    console.error("Error checking customers table structure:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check table structure",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
