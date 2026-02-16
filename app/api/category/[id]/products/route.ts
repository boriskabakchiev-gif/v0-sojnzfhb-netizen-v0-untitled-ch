import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    console.log(`Извличане на продукти за категория с ID: ${id}`)

    if (!id) {
      return NextResponse.json({ error: "ID на категорията е задължително" }, { status: 400 })
    }

    // Използваме new_products вместо products
    const products = await sql`
      SELECT * FROM new_products 
      WHERE cateid = ${id} 
      AND deleted IS NOT TRUE
      ORDER BY title ASC
    `

    console.log(`Намерени ${products.length} продукта за категория ${id}`)

    return NextResponse.json(products)
  } catch (error) {
    console.error("Грешка при извличане на продукти по категория:", error)
    return NextResponse.json(
      {
        error: "Грешка при извличане на продукти",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
