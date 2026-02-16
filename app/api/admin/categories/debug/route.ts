import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    // Проверка на структурата на таблицата
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'categories'
      ORDER BY ordinal_position
    `

    // Вземане на примерни данни
    const sampleData = await sql`
      SELECT * FROM categories LIMIT 5
    `

    // Проверка на всички таблици в базата данни
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    return NextResponse.json({
      success: true,
      tableStructure: tableInfo,
      sampleData: sampleData,
      allTables: tables,
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error in debug endpoint",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
