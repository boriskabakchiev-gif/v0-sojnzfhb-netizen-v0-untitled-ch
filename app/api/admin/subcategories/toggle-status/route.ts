import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Създаваме SQL клиент
const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    console.log("Получена заявка за превключване на статуса на подкатегория")

    // Извличаме данните от заявката
    const data = await request.json()
    console.log("Данни за превключване на статуса:", JSON.stringify(data, null, 2))

    // Валидираме задължителните полета
    if (!data.id) {
      return NextResponse.json({ success: false, error: "ID на подкатегорията е задължително" }, { status: 400 })
    }

    // Първо проверяваме дали подкатегорията съществува
    const existingSubcategory = await sql`
      SELECT "Document ID", title, deleted FROM subcategories WHERE "Document ID" = ${data.id}
    `

    console.log("Съществуваща подкатегория:", existingSubcategory)

    if (!existingSubcategory || existingSubcategory.length === 0) {
      return NextResponse.json({ success: false, error: "Подкатегорията не е намерена" }, { status: 404 })
    }

    // Определяме новия статус (обратен на текущия)
    const currentStatus = existingSubcategory[0].deleted === true
    const newStatus = !currentStatus

    // Обновяваме статуса на подкатегорията
    const result = await sql`
      UPDATE subcategories
      SET deleted = ${newStatus}
      WHERE "Document ID" = ${data.id}
      RETURNING "Document ID", title, deleted
    `

    console.log("Резултат от превключване на статуса:", result)

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Неуспешно превключване на статуса на подкатегорията" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Подкатегорията беше ${newStatus ? "деактивирана" : "активирана"} успешно`,
      subcategory: result[0],
    })
  } catch (error) {
    console.error("Error toggling subcategory status:", error)
    const errorMessage = error instanceof Error ? error.message : "Неизвестна грешка"

    return NextResponse.json(
      {
        success: false,
        error: `Грешка при превключване на статуса на подкатегорията: ${errorMessage}`,
        details: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
    )
  }
}
