import { NextResponse } from "next/server"
import { neon, type NeonQueryFunction } from "@neondatabase/serverless"
import { z } from "zod"

const sql = neon(process.env.DATABASE_URL!)

// Helper to get table columns (cache this in a real app for performance)
async function getTableColumns(db: NeonQueryFunction<false, false>, tableName: string): Promise<string[]> {
  const result = await db`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${tableName};
  `
  return result.map((row: any) => row.column_name)
}

// Zod schema for basic validation (extend as needed)
const SubcategoryUpdateSchema = z
  .object({
    id: z.string().min(1).optional(), // ID from URL params
    title: z.string().min(1).optional(),
    cateid: z.string().min(1).optional(), // Assuming cateid is also string UUID or similar
    description: z.string().nullable().optional(),
    photourl: z.string().url().or(z.string().nullable()).optional(),
    deleted: z.boolean().optional(),
  })
  .catchall(z.any()) // Allow other dynamic fields

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: subcategoryId } = await params
    const body = await request.json()

    console.log("Получена PUT заявка за обновяване на подкатегория:", {
      id: subcategoryId,
      body: JSON.stringify(body, null, 2),
    })

    if (!subcategoryId) {
      return NextResponse.json({ success: false, error: "ID на подкатегорията е задължително." }, { status: 400 })
    }

    const validationResult = SubcategoryUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error.flatten())
      return NextResponse.json(
        { success: false, error: "Невалидни данни.", details: validationResult.error.flatten() },
        { status: 400 },
      )
    }

    const updateData = validationResult.data

    // Remove id from updateData since it's used in WHERE clause
    if (updateData.id) {
      delete updateData.id
    }

    // Fetch valid column names for 'subcategories' table
    const validColumns = await getTableColumns(sql, "subcategories")

    const setClauses: string[] = []
    const values: any[] = []
    let valueIndex = 1

    // Track if updatedat is already added to avoid duplicates
    let updatedatAdded = false

    for (const key in updateData) {
      if (Object.prototype.hasOwnProperty.call(updateData, key) && validColumns.includes(key)) {
        // Skip 'Document ID' from SET clauses, it's used in WHERE
        if (key === "Document ID" || key === "createdat") continue

        // Handle updatedat specially to avoid duplicates
        if (key === "updatedat") {
          if (!updatedatAdded) {
            setClauses.push(`"${key}" = $${valueIndex++}`)
            values.push(updateData[key])
            updatedatAdded = true
          }
          continue
        }

        setClauses.push(`"${key}" = $${valueIndex++}`)
        values.push(updateData[key])
      }
    }

    // Always add updatedat if not already added
    if (validColumns.includes("updatedat") && !updatedatAdded) {
      setClauses.push(`"updatedat" = $${valueIndex++}`)
      values.push(new Date().toISOString())
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ success: false, error: "Няма данни за обновяване." }, { status: 400 })
    }

    values.push(subcategoryId) // Add the ID for the WHERE clause

    const query = `UPDATE subcategories SET ${setClauses.join(", ")} WHERE "Document ID" = $${valueIndex} RETURNING *;`

    console.log("Executing SQL query:", query)
    console.log("With values:", values)

    const result = await sql.unsafe(query, values)

    console.log("Резултат от обновяване:", result)

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Неуспешно обновяване на подкатегорията или подкатегорията не е намерена." },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Подкатегорията беше обновена успешно.",
      subcategory: result[0],
    })
  } catch (error) {
    console.error("Error updating subcategory:", error)
    const errorMessage = error instanceof Error ? error.message : "Неизвестна грешка"
    return NextResponse.json(
      {
        success: false,
        error: `Грешка при обновяване на подкатегорията: ${errorMessage}`,
        details: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
    )
  }
}

// GET method for fetching single subcategory (if needed)
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: subcategoryId } = await params

    if (!subcategoryId) {
      return NextResponse.json({ success: false, error: "ID на подкатегорията е задължително." }, { status: 400 })
    }

    const result = await sql`
      SELECT s.*, c.title as categoryTitle 
      FROM subcategories s
      LEFT JOIN categories c ON s.cateid = c."Document ID"
      WHERE s."Document ID" = ${subcategoryId}
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ success: false, error: "Подкатегорията не е намерена." }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      subcategory: result[0],
    })
  } catch (error) {
    console.error("Error fetching subcategory:", error)
    const errorMessage = error instanceof Error ? error.message : "Неизвестна грешка"
    return NextResponse.json(
      {
        success: false,
        error: `Грешка при зареждане на подкатегорията: ${errorMessage}`,
      },
      { status: 500 },
    )
  }
}
