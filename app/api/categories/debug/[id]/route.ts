import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    console.log("DEBUG заявка за категория с ID:", id)

    // Get table structure
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'categories'
      ORDER BY ordinal_position
    `

    // Try to find the category with different ID approaches
    let categoryById = []
    let categoryByDocumentId = []

    try {
      categoryById = await sql`SELECT * FROM categories WHERE id = ${id} LIMIT 1`
    } catch (e) {
      console.log("Грешка при търсене с 'id':", e)
    }

    try {
      categoryByDocumentId = await sql`SELECT * FROM categories WHERE "Document ID" = ${id} LIMIT 1`
    } catch (e) {
      console.log("Грешка при търсене с 'Document ID':", e)
    }

    // Get all categories to see the structure
    const allCategories = await sql`SELECT * FROM categories LIMIT 5`

    return NextResponse.json({
      success: true,
      debug: {
        searchId: id,
        tableStructure: tableInfo,
        categoryById,
        categoryByDocumentId,
        sampleCategories: allCategories,
      },
    })
  } catch (error) {
    console.error("DEBUG грешка:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Грешка при debug заявката",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
