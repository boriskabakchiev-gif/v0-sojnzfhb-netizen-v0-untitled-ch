import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const emptyStringToNullNumber = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
  z.number().nullable().optional(),
)
const emptyStringToNull = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? null : String(val)),
  z.string().nullable().optional(),
)

const SubcategoryAddSchema = z.object({
  cateid: z.string().uuid("ID на категорията трябва да е валиден UUID."),
  title: z.string().min(1, "Името на подкатегорията е задължително."),
  title_en: z.string().min(1, "Английското име на подкатегорията е задължително."),
  description: emptyStringToNull,
  description_en: emptyStringToNull,
  photourl: z.string().url("Невалиден URL за снимка.").or(z.literal("")).nullable().optional(),
  deleted: z.boolean().optional().default(false),
  objectid: emptyStringToNull,
  option: emptyStringToNull,
  pricefrom: emptyStringToNullNumber,
  retailerpricefrom: emptyStringToNullNumber,
  searchable: emptyStringToNull,
  wholesalerpricefrom: emptyStringToNullNumber,
})

export async function POST(request: Request) {
  console.log("--- EXECUTING API: /admin/subcategories/add - Updated with title_en and description_en (v6) ---")
  try {
    const body = await request.json()
    const transformedBody = {
      ...body,
      photourl: body.photourl === "" ? null : body.photourl,
    }

    console.log(
      "API /admin/subcategories/add - Received body for validation:",
      JSON.stringify(transformedBody, null, 2),
    )

    const validationResult = SubcategoryAddSchema.safeParse(transformedBody)

    if (!validationResult.success) {
      console.error(
        "API /admin/subcategories/add - Validation failed. Input:",
        JSON.stringify(transformedBody, null, 2),
        "Errors:",
        JSON.stringify(validationResult.error.flatten(), null, 2),
      )
      return NextResponse.json(
        { success: false, error: "Невалидни данни.", details: validationResult.error.flatten() },
        { status: 400 },
      )
    }

    const {
      cateid,
      title,
      title_en,
      description,
      description_en,
      photourl: validatedPhotoUrl,
      deleted,
      objectid,
      option,
      pricefrom,
      retailerpricefrom,
      searchable,
      wholesalerpricefrom,
    } = validationResult.data

    const categoryExistsResult = await sql`SELECT "Document ID" FROM categories WHERE "Document ID" = ${cateid}`
    if (categoryExistsResult.length === 0) {
      console.warn(`API /admin/subcategories/add - Category with ID ${cateid} not found.`)
      return NextResponse.json(
        {
          success: false,
          error: `Грешка: Избраната категория (ID: ${cateid}) не съществува. Моля, изберете валидна категория.`,
        },
        { status: 400 },
      )
    }
    console.log(`API /admin/subcategories/add - Category ${cateid} exists. Proceeding with subcategory insert.`)

    const newDocumentId = crypto.randomUUID()
    const now = new Date().toISOString()

    // Define columns and values, including title_en and description_en
    const columns = [
      `"Document ID"`,
      `"cateid"`,
      `"title"`,
      `"title_en"`,
      `"description"`,
      `"description_en"`,
      `"photourl"`,
      `"deleted"`,
      `"createdat"`,
      `"objectid"`,
      `"option"`,
      `"pricefrom"`,
      `"retailerpricefrom"`,
      `"searchable"`,
      `"wholesalerpricefrom"`,
    ]
    const valuesArray = [
      newDocumentId,
      cateid,
      title,
      title_en,
      description,
      description_en,
      validatedPhotoUrl,
      deleted,
      now,
      objectid,
      option,
      pricefrom,
      retailerpricefrom,
      searchable,
      wholesalerpricefrom,
    ]

    const placeholders = valuesArray.map((_, i) => `$${i + 1}`).join(", ")
    const queryString = `INSERT INTO subcategories (${columns.join(", ")}) VALUES (${placeholders}) RETURNING "Document ID", title, title_en;`

    console.log("API /admin/subcategories/add - Executing SQL with sql.query:", queryString)
    console.log("API /admin/subcategories/add - With values:", JSON.stringify(valuesArray, null, 2))

    const result = await sql.query(queryString, valuesArray)

    console.log(
      "API /admin/subcategories/add - SQL execution result (from sql.query):",
      JSON.stringify(result, null, 2),
    )

    if (result && Array.isArray(result) && result.length > 0 && result[0] && result[0]["Document ID"]) {
      console.log(
        "API /admin/subcategories/add - Successfully inserted subcategory:",
        JSON.stringify(result[0], null, 2),
      )

      // Invalidate cache for pages that show subcategories
      try {
        revalidatePath("/")
        revalidatePath("/en")
        revalidatePath("/categories")
        revalidatePath("/en/categories")
        revalidatePath("/admin-panel/categories")
        console.log("API /admin/subcategories/add - Cache invalidated successfully")
      } catch (cacheError) {
        console.warn("API /admin/subcategories/add - Cache invalidation failed:", cacheError)
      }

      return NextResponse.json({
        success: true,
        message: "Подкатегорията е добавена успешно.",
        subcategory: result[0],
      })
    } else {
      console.warn(
        "API /admin/subcategories/add - Insert failed or did not return expected array of data. Actual result from DB (using sql.query):",
        JSON.stringify(result, null, 2),
      )
      return NextResponse.json(
        {
          success: false,
          error:
            "Неуспешно добавяне на подкатегорията в базата данни (SQL заявката не върна очаквания масив от резултати). Проверете логовете за повече детайли относно 'Actual result'.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("API /admin/subcategories/add - Server error:", error)
    let pgErrorCode = null
    let errorMessage = error instanceof Error ? error.message : "Неизвестна сървърна грешка."

    if (error && typeof error === "object" && "code" in error && typeof error.code === "string") {
      pgErrorCode = error.code
      if (pgErrorCode === "42703") {
        // Undefined column
        errorMessage = `Колоната, която се опитвате да използвате, не съществува в таблицата. ${errorMessage}`
      } else if (pgErrorCode === "23502") {
        errorMessage = `Нарушение на NOT NULL ограничение. ${errorMessage}`
      } else if (pgErrorCode === "23503") {
        errorMessage = `Нарушение на FOREIGN KEY ограничение. ${errorMessage}`
      } else if (pgErrorCode === "23505") {
        errorMessage = `Нарушение на UNIQUE ограничение. ${errorMessage}`
      }
    }

    const userMessage = `Грешка при добавяне на подкатегория: ${errorMessage}${pgErrorCode ? ` (DB Код: ${pgErrorCode})` : ""}`
    return NextResponse.json(
      { success: false, error: userMessage, details: error instanceof Error ? error.stack : undefined },
      { status: 500 },
    )
  }
}
