import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

// GET /api/admin/users - Извличане на всички потребители
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const status = searchParams.get("status") || ""

    const offset = (page - 1) * limit

    console.log(
      `Извличане на потребители: страница ${page}, лимит ${limit}, търсене "${search}", роля "${role}", статус "${status}"`,
    )

    // Изграждане на базовата заявка
    let countQuery = `
      SELECT COUNT(*) as count
      FROM users
      WHERE 1=1
    `

    let dataQuery = `
      SELECT 
        id, 
        name, 
        email, 
        role, 
        created_at, 
        approval_status,
        first_name,
        last_name,
        phone,
        is_active,
        email_verified,
        updated_at
      FROM users
      WHERE 1=1
    `

    const queryParams: any[] = []
    let paramIndex = 1

    // Добавяне на условия за търсене
    if (search) {
      const searchCondition = `
        AND (
          name ILIKE $${paramIndex} 
          OR email ILIKE $${paramIndex} 
          OR first_name ILIKE $${paramIndex} 
          OR last_name ILIKE $${paramIndex}
        )
      `
      countQuery += searchCondition
      dataQuery += searchCondition
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    // Филтриране по роля
    if (role) {
      const roleCondition = ` AND role = $${paramIndex}`
      countQuery += roleCondition
      dataQuery += roleCondition
      queryParams.push(role)
      paramIndex++
    }

    // Филтриране по статус
    if (status === "active") {
      const statusCondition = ` AND is_active = $${paramIndex}`
      countQuery += statusCondition
      dataQuery += statusCondition
      queryParams.push(true)
      paramIndex++
    } else if (status === "inactive") {
      const statusCondition = ` AND is_active = $${paramIndex}`
      countQuery += statusCondition
      dataQuery += statusCondition
      queryParams.push(false)
      paramIndex++
    }

    // Добавяне на сортиране и пагинация
    dataQuery += `
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    queryParams.push(limit, offset)

    // Изпълнение на заявките
    const countResult = await sql.unsafe(countQuery, queryParams.slice(0, paramIndex - 1))
    const total = Number.parseInt(countResult[0]?.count || "0")

    const users = await sql.unsafe(dataQuery, queryParams)

    console.log(`Намерени ${users.length} потребители от общо ${total}`)

    return NextResponse.json({
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("Грешка при извличане на потребители:", error)
    return NextResponse.json({ error: "Грешка при извличане на потребители" }, { status: 500 })
  }
}

// POST /api/admin/users - Добавяне на нов потребител
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role, first_name, last_name, phone, is_active, email_verified, approval_status } =
      body

    // Валидация на задължителните полета
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Името, имейлът и паролата са задължителни" }, { status: 400 })
    }

    // Проверка дали имейлът вече съществува
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Потребител с този имейл вече съществува" }, { status: 400 })
    }

    // Добавяне на новия потребител
    const result = await sql`
      INSERT INTO users (
        name, 
        email, 
        password, 
        role, 
        first_name, 
        last_name, 
        phone, 
        is_active, 
        email_verified, 
        approval_status
      ) 
      VALUES (
        ${name}, 
        ${email}, 
        ${password}, 
        ${role || "user"}, 
        ${first_name || null}, 
        ${last_name || null}, 
        ${phone || null}, 
        ${is_active !== undefined ? is_active : true}, 
        ${email_verified !== undefined ? email_verified : false}, 
        ${approval_status || "pending"}
      )
      RETURNING id, name, email, role, created_at
    `

    // Обновяване на кеша
    revalidatePath("/admin-panel/users")

    return NextResponse.json({ success: true, user: result[0] })
  } catch (error) {
    console.error("Грешка при добавяне на потребител:", error)
    return NextResponse.json({ error: "Грешка при добавяне на потребител" }, { status: 500 })
  }
}
