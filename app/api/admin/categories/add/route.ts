import { type NextRequest, NextResponse } from "next/server"
import { executeQueryWithRetry } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Данни за добавяне:", body)

    const { title, title_en, description, description_en, photourl } = body

    // Валидация
    if (!title || !title_en) {
      return NextResponse.json({ error: "Името на категорията (BG и EN) е задължително" }, { status: 400 })
    }

    // Генериране на UUID за Document ID
    const documentId = crypto.randomUUID()
    const currentDate = new Date().toISOString()

    // Добавяне на категорията в базата данни
    const result = await executeQueryWithRetry(
      `
      INSERT INTO categories ("Document ID", title, title_en, description, description_en, photourl, deleted, createdat)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      [documentId, title, title_en, description || null, description_en || null, photourl || null, false, currentDate],
    )

    console.log("Категория добавена успешно:", result[0])

    // Инвалидиране на кеша за категориите
    revalidatePath("/")
    revalidatePath("/en")
    revalidatePath("/categories")
    revalidatePath("/en/categories")

    return NextResponse.json({ success: true, category: result[0] })
  } catch (error) {
    console.error("Error adding category:", error)
    return NextResponse.json({ error: "Грешка при добавяне на категорията" }, { status: 500 })
  }
}
