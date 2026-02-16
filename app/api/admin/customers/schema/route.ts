import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Получаваме схемата на таблицата customers
    const schemaResult = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'customers' 
      ORDER BY ordinal_position
    `

    // Получаваме и примерен ред за да видим структурата на данните
    const sampleData = await sql`
      SELECT * FROM customers LIMIT 1
    `

    return NextResponse.json({
      schema: schemaResult,
      sampleData: sampleData[0] || null,
      totalColumns: schemaResult.length,
    })
  } catch (error) {
    console.error("Грешка при получаване на схемата:", error)
    return NextResponse.json(
      {
        error: "Грешка при получаване на схемата",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
