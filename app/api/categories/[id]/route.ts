import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    console.log("DELETE заявка получена за категория с ID:", id)

    if (!id) {
      return NextResponse.json({ success: false, error: "ID на категорията е задължително" }, { status: 400 })
    }

    // First, let's check what columns exist in the categories table
    console.log("Проверка на структурата на таблицата categories...")

    try {
      const tableInfo = await sql`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'categories'
        ORDER BY ordinal_position
      `
      console.log("Структура на таблицата categories:", tableInfo)
    } catch (schemaError) {
      console.error("Грешка при проверка на схемата:", schemaError)
    }

    // Check if category exists - try different possible ID column names
    console.log("Търсене на категория с ID:", id)

    let existingCategory
    try {
      // Try with 'id' column first
      existingCategory = await sql`
        SELECT * FROM categories WHERE id = ${id} LIMIT 1
      `
      console.log("Резултат от търсене с 'id':", existingCategory)

      if (existingCategory.length === 0) {
        // Try with 'Document ID' column
        existingCategory = await sql`
          SELECT * FROM categories WHERE "Document ID" = ${id} LIMIT 1
        `
        console.log("Резултат от търсене с 'Document ID':", existingCategory)
      }
    } catch (searchError) {
      console.error("Грешка при търсене на категория:", searchError)
      return NextResponse.json(
        {
          success: false,
          error: "Грешка при търсене на категорията в базата данни",
          details: searchError instanceof Error ? searchError.message : String(searchError),
        },
        { status: 500 },
      )
    }

    if (existingCategory.length === 0) {
      return NextResponse.json({ success: false, error: "Категорията не е намерена" }, { status: 404 })
    }

    console.log("Намерена категория за изтриване:", existingCategory[0])

    // Try to update the category to mark it as deleted
    let result
    try {
      // First try with 'id' column
      result = await sql`
        UPDATE categories 
        SET deleted = true
        WHERE id = ${id}
        RETURNING *
      `
      console.log("Резултат от UPDATE с 'id':", result)

      if (result.length === 0) {
        // Try with 'Document ID' column
        result = await sql`
          UPDATE categories 
          SET deleted = true
          WHERE "Document ID" = ${id}
          RETURNING *
        `
        console.log("Резултат от UPDATE с 'Document ID':", result)
      }
    } catch (updateError) {
      console.error("Грешка при UPDATE на категория:", updateError)

      // If the 'deleted' column doesn't exist, try to add it first
      try {
        console.log("Опит за добавяне на колона 'deleted'...")
        await sql`
          ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false
        `

        // Try the update again
        result = await sql`
          UPDATE categories 
          SET deleted = true
          WHERE id = ${id}
          RETURNING *
        `
        console.log("Резултат след добавяне на колона 'deleted':", result)
      } catch (alterError) {
        console.error("Грешка при добавяне на колона 'deleted':", alterError)
        return NextResponse.json(
          {
            success: false,
            error: "Грешка при актуализиране на структурата на базата данни",
            details: alterError instanceof Error ? alterError.message : String(alterError),
          },
          { status: 500 },
        )
      }
    }

    if (!result || result.length === 0) {
      return NextResponse.json({ success: false, error: "Неуспешно изтриване на категорията" }, { status: 500 })
    }

    console.log("Категорията е успешно маркирана като изтрита:", result[0])

    return NextResponse.json({
      success: true,
      message: "Категорията е успешно изтрита",
      category: result[0],
    })
  } catch (error) {
    console.error("Обща грешка при изтриване на категория:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Вътрешна грешка на сървъра при изтриване на категорията",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
