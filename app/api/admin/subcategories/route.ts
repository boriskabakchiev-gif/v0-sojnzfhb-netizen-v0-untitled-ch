import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const categoryId = searchParams.get("categoryId") || searchParams.get("cateid")
    const limit = Number.parseInt(searchParams.get("limit") || "1000")
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")

    console.log(
      `Извличане на подкатегории: id=${id}, categoryId=${categoryId}, limit=${limit}, search=${search}, page=${page}`,
    )

    if (id) {
      // Заявка за конкретна подкатегория
      console.log(`Извличане на подкатегория с ID: ${id}`)

      const subcategory = await sql`
        SELECT * FROM subcategories
        WHERE "Document ID" = ${id}
      `

      console.log(`Намерена подкатегория:`, subcategory.length > 0 ? "Да" : "Не")

      if (!subcategory || subcategory.length === 0) {
        return NextResponse.json({ success: false, error: "Подкатегорията не е намерена" }, { status: 404 })
      }

      return NextResponse.json({ success: true, subcategories: subcategory })
    } else {
      // Заявка за списък с подкатегории
      console.log(`Извличане на списък с подкатегории за категория: ${categoryId}`)

      let subcategories = []
      let total = 0

      if (categoryId && categoryId !== "all" && categoryId !== "") {
        // Филтриране по конкретна категория
        console.log(`Филтриране по категория: ${categoryId}`)

        if (search) {
          subcategories = await sql`
            SELECT 
              "Document ID" as id,
              title,
              description,
              photourl,
              pricefrom,
              cateid,
              createdat,
              deleted
            FROM subcategories
            WHERE cateid = ${categoryId} 
            AND title ILIKE ${"%" + search + "%"} 
            AND (deleted = false OR deleted IS NULL)
            ORDER BY title
            LIMIT ${limit}
          `
          const countResult = await sql`
            SELECT COUNT(*) as total 
            FROM subcategories 
            WHERE cateid = ${categoryId} 
            AND title ILIKE ${"%" + search + "%"} 
            AND (deleted = false OR deleted IS NULL)
          `
          total = Number.parseInt(countResult[0]?.total || "0")
        } else {
          subcategories = await sql`
            SELECT 
              "Document ID" as id,
              title,
              description,
              photourl,
              pricefrom,
              cateid,
              createdat,
              deleted
            FROM subcategories
            WHERE cateid = ${categoryId} 
            AND (deleted = false OR deleted IS NULL)
            ORDER BY title
            LIMIT ${limit}
          `
          const countResult = await sql`
            SELECT COUNT(*) as total 
            FROM subcategories 
            WHERE cateid = ${categoryId} 
            AND (deleted = false OR deleted IS NULL)
          `
          total = Number.parseInt(countResult[0]?.total || "0")
        }
      } else {
        // Всички подкатегории (само ако няма зададена категория)
        console.log("Извличане на всички подкатегории")

        if (search) {
          subcategories = await sql`
            SELECT 
              "Document ID" as id,
              title,
              description,
              photourl,
              pricefrom,
              cateid,
              createdat,
              deleted
            FROM subcategories
            WHERE title ILIKE ${"%" + search + "%"} 
            AND (deleted = false OR deleted IS NULL)
            ORDER BY title
            LIMIT ${limit}
          `
          const countResult = await sql`
            SELECT COUNT(*) as total 
            FROM subcategories 
            WHERE title ILIKE ${"%" + search + "%"} 
            AND (deleted = false OR deleted IS NULL)
          `
          total = Number.parseInt(countResult[0]?.total || "0")
        } else {
          subcategories = await sql`
            SELECT 
              "Document ID" as id,
              title,
              description,
              photourl,
              pricefrom,
              cateid,
              createdat,
              deleted
            FROM subcategories
            WHERE (deleted = false OR deleted IS NULL)
            ORDER BY title
            LIMIT ${limit}
          `
          const countResult = await sql`
            SELECT COUNT(*) as total 
            FROM subcategories 
            WHERE (deleted = false OR deleted IS NULL)
          `
          total = Number.parseInt(countResult[0]?.total || "0")
        }
      }

      console.log(`Намерени подкатегории за категория ${categoryId}: ${subcategories.length}`)

      // Обогатяваме подкатегориите с информация за категорията и брой продукти
      const enrichedSubcategories = await Promise.all(
        subcategories.map(async (subcategory) => {
          try {
            // Извличаме информация за категорията
            let categoryTitle = "Неизвестна категория"
            if (subcategory.cateid) {
              const categoryResult = await sql`
                SELECT title FROM categories WHERE "Document ID" = ${subcategory.cateid}
              `
              if (categoryResult.length > 0) {
                categoryTitle = categoryResult[0].title
              }
            }

            // Брой продукти в подкатегорията
            const productsResult = await sql`
              SELECT COUNT(*) as count
              FROM new_products
              WHERE subcateid = ${subcategory.id} AND (deleted = false OR deleted IS NULL)
            `
            const productCount = Number.parseInt(productsResult[0]?.count || "0")

            return {
              ...subcategory,
              categoryTitle,
              productCount,
              status: subcategory.deleted ? "Деактивирана" : "Активна",
            }
          } catch (error) {
            console.error(`Грешка при обогатяване на подкатегория ${subcategory.id}:`, error)
            return {
              ...subcategory,
              categoryTitle: "Неизвестна категория",
              productCount: 0,
              status: subcategory.deleted ? "Деактивирана" : "Активна",
            }
          }
        }),
      )

      return NextResponse.json({
        success: true,
        subcategories: enrichedSubcategories,
        pagination: {
          total: total,
          page: page,
          limit: limit,
          totalPages: Math.ceil(total / limit),
        },
      })
    }
  } catch (error) {
    console.error("Error fetching subcategories:", error)
    const errorMessage = error instanceof Error ? error.message : "Неизвестна грешка"

    return NextResponse.json(
      {
        success: false,
        error: `Грешка при зареждане на подкатегориите: ${errorMessage}`,
        details: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, photourl, pricefrom, cateid } = body

    // Валидация
    if (!title) {
      return NextResponse.json({ error: "Заглавието е задължително" }, { status: 400 })
    }

    if (!cateid) {
      return NextResponse.json({ error: "Категорията е задължителна" }, { status: 400 })
    }

    console.log("Adding subcategory:", { title, description, photourl, pricefrom, cateid })

    // Добавяне на подкатегорията
    const result = await sql`
      INSERT INTO subcategories (title, description, photourl, pricefrom, cateid)
      VALUES (${title}, ${description || null}, ${photourl || null}, ${pricefrom ? Number.parseFloat(pricefrom) : null}, ${cateid})
      RETURNING "Document ID" as id
    `

    if (result && result.length > 0) {
      console.log("Subcategory added successfully:", result[0])
      return NextResponse.json({
        success: true,
        message: "Подкатегорията е добавена успешно",
        id: result[0].id,
      })
    } else {
      return NextResponse.json({ error: "Грешка при добавяне на подкатегорията" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error adding subcategory:", error)
    return NextResponse.json(
      {
        error: `Грешка при добавяне на подкатегорията: ${error instanceof Error ? error.message : "Неизвестна грешка"}`,
      },
      { status: 500 },
    )
  }
}
