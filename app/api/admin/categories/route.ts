import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Уверете се, че DATABASE_URL е правилно конфигуриран във вашите променливи на средата
const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // Извличаме всички активни категории, подредени по име.
    // Можете да добавите филтър за активни категории, ако имате такова поле, напр. WHERE active = true
    const categoriesData = await sql`
      SELECT 
        "Document ID" as id, 
        title
      FROM categories 
      ORDER BY title ASC
    `

    // Връщаме успешно извлечените категории
    return NextResponse.json({
      success: true,
      categories: categoriesData,
    })
  } catch (error: any) {
    console.error("Error in /api/admin/categories GET handler:", error)
    // Връщаме грешка, ако нещо се обърка
    return NextResponse.json(
      {
        success: false,
        error: "Възникна грешка при извличане на категориите от базата данни.",
        details: error.message, // Може да е полезно за дебъг
      },
      { status: 500 },
    )
  }
}
