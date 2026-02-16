import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { randomUUID } from "crypto"

export async function GET(req: NextRequest) {
  console.log("[API GET /api/admin/customers] Received request")
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const typeParam = searchParams.get("type") || ""
    const routeParam = searchParams.get("route") || ""

    console.log(
      `[API GET /api/admin/customers] Params: search="${search}", page=${page}, limit=${limit}, type="${typeParam}", route="${routeParam}"`,
    )

    const searchTerm = search ? `%${search.trim().toLowerCase()}%` : null

    const countBaseQuery = `SELECT COUNT(*) as total FROM customers WHERE (deleted = FALSE OR deleted IS NULL)`
    const dataBaseQuery = `
    SELECT 
      "Document ID" as id, objectid, storename, companyname, phone, type, 
      discountpercent, createdat, pending, deleted, createdbyadmin, marshrut
    FROM customers 
    WHERE (deleted = FALSE OR deleted IS NULL) 
  `
    const conditions: string[] = []
    const queryValues: any[] = []
    let paramIndex = 1

    if (searchTerm) {
      conditions.push(
        `(LOWER(storename) ILIKE $${paramIndex} OR LOWER(companyname) ILIKE $${paramIndex} OR LOWER(objectid) ILIKE $${paramIndex} OR LOWER(phone) ILIKE $${paramIndex})`,
      )
      queryValues.push(searchTerm)
      paramIndex++
    }

    if (typeParam && typeParam !== "all") {
      conditions.push(`type = $${paramIndex}`)
      queryValues.push(typeParam)
      paramIndex++
    }

    if (routeParam && routeParam !== "all") {
      conditions.push(`marshrut = $${paramIndex}`)
      queryValues.push(routeParam)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? ` AND ${conditions.join(" AND ")}` : ""
    console.log(`[API GET /api/admin/customers] Where clause: "${whereClause}"`)

    const finalCountQuery = `${countBaseQuery}${whereClause}`
    console.log(
      `[API GET /api/admin/customers] Count Query: "${finalCountQuery}", Values: ${JSON.stringify(queryValues)}`,
    )
    const countQueryResult: any[] = await sql.query(finalCountQuery, queryValues)
    console.log(
      "[API GET /api/admin/customers] Raw Count Query Result (expected array):",
      JSON.stringify(countQueryResult),
    )

    let totalCount = 0
    if (
      Array.isArray(countQueryResult) &&
      countQueryResult.length > 0 &&
      countQueryResult[0] !== null &&
      typeof countQueryResult[0].total !== "undefined"
    ) {
      totalCount = Number(countQueryResult[0].total)
      console.log(`[API GET /api/admin/customers] Parsed total from query: ${totalCount}`)
    } else if (Array.isArray(countQueryResult) && countQueryResult.length === 0) {
      totalCount = 0
      console.log("[API GET /api/admin/customers] Count query returned empty array.")
    } else {
      console.warn(
        "[API GET /api/admin/customers] Count query returned unexpected data or structure:",
        JSON.stringify(countQueryResult),
      )
    }
    console.log(`[API GET /api/admin/customers] Final total count: ${totalCount}`)

    const offset = (page - 1) * limit
    const finalDataQuery = `${dataBaseQuery}${whereClause} ORDER BY createdat DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    const finalQueryValuesData = [...queryValues, limit, offset]
    console.log(
      `[API GET /api/admin/customers] Data Query: "${finalDataQuery}", Values: ${JSON.stringify(finalQueryValuesData)}`,
    )

    const dataQueryResult: any[] = await sql.query(finalDataQuery, finalQueryValuesData)
    console.log(
      "[API GET /api/admin/customers] Raw Data Query Result (expected array):",
      JSON.stringify(dataQueryResult),
    )

    let customers: any[] = []

    if (Array.isArray(dataQueryResult)) {
      console.log(`[API GET /api/admin/customers] Data query returned ${dataQueryResult.length} rows.`)
      customers = dataQueryResult.map((customer: any) => ({
        id: customer.id?.toString() || "",
        objectid: customer.objectid || "",
        storename: customer.storename || "",
        companyname: customer.companyname || "",
        phone: customer.phone || "",
        type: customer.type || "standard",
        discountpercent: customer.discountpercent || "0",
        createdat: customer.createdat || "",
        pending: Boolean(customer.pending),
        deleted: Boolean(customer.deleted),
        createdbyadmin: Boolean(customer.createdbyadmin),
        marshrut: customer.marshrut || null,
      }))
    } else {
      console.warn(
        "[API GET /api/admin/customers] Data query returned unexpected data or not an array:",
        JSON.stringify(dataQueryResult),
      )
    }

    const totalPages = limit > 0 && totalCount > 0 ? Math.ceil(totalCount / limit) : 0
    console.log(
      `[API GET /api/admin/customers] Pagination: total=${totalCount}, pages=${totalPages}, page=${page}, limit=${limit}`,
    )

    return NextResponse.json({
      customers,
      pagination: { total: totalCount, pages: totalPages, page, limit },
    })
  } catch (error) {
    console.error("[API GET /api/admin/customers] Error in try-catch block:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown server error"
    return NextResponse.json({ error: "Грешка при зареждане на клиентите", details: errorMessage }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  console.log("[API POST /api/admin/customers] Received request")
  try {
    const body = await req.json()
    const { objectid, storename, companyname, phone, type, discountpercent, password, pending, deleted, marshrut } =
      body
    console.log("[API POST /api/admin/customers] Request body:", body)

    if (!phone || !storename) {
      console.log("[API POST /api/admin/customers] Validation error: Phone and store name are required.")
      return NextResponse.json({ error: "Телефон и име на магазин са задължителни" }, { status: 400 })
    }

    if (objectid && objectid.trim() !== "") {
      console.log(`[API POST /api/admin/customers] Checking for existing customer with objectid: ${objectid.trim()}`)
      const existingCustomerResult: any[] = await sql.query(
        `SELECT "Document ID" FROM customers WHERE objectid = $1 AND (deleted = FALSE OR deleted IS NULL)`,
        [objectid.trim()],
      )
      console.log(
        "[API POST /api/admin/customers] Existing customer check result (expected array):",
        JSON.stringify(existingCustomerResult),
      )
      if (Array.isArray(existingCustomerResult) && existingCustomerResult.length > 0) {
        console.log("[API POST /api/admin/customers] Customer with this Email/ID already exists.")
        return NextResponse.json({ error: "Клиент с този Имейл / ID вече съществува" }, { status: 400 })
      }
    }

    const documentId = randomUUID()
    // Промяна: Подаваме Date обект директно. Базата данни (след корекция на типа на колоната) ще го обработи правилно.
    const createdAtValue = new Date()

    const insertValues = [
      documentId,
      objectid || null,
      storename,
      companyname || null,
      phone,
      type || "standard",
      String(discountpercent || "0"),
      password || null, // Трябва да се хешира преди запис в реално приложение!
      Boolean(pending),
      Boolean(deleted),
      true, // createdbyadmin
      marshrut || null,
      createdAtValue, // Подаваме Date обекта
    ]
    const insertQuery = `INSERT INTO customers (
      "Document ID", objectid, storename, companyname, phone, type, discountpercent, password, pending, deleted, createdbyadmin, marshrut, createdat
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
    )
    RETURNING "Document ID" as id, marshrut`

    console.log(
      `[API POST /api/admin/customers] Insert Query: "${insertQuery}", Values: ${JSON.stringify(insertValues.map((v) => (v instanceof Date ? v.toISOString() : v)))}`,
    )
    const insertResult: any[] = await sql.query(insertQuery, insertValues)
    console.log(
      "[API POST /api/admin/customers] Raw Insert Query Result (expected array):",
      JSON.stringify(insertResult),
    )

    const createdCustomer = Array.isArray(insertResult) && insertResult.length > 0 ? insertResult[0] : null

    if (!createdCustomer) {
      console.error(
        "[API POST /api/admin/customers] Error: Failed to create customer in database. Insert result:",
        JSON.stringify(insertResult),
      )
      return NextResponse.json(
        { error: "Грешка при създаване на клиента", details: "Неуспешно записване в базата данни." },
        { status: 500 },
      )
    }
    console.log("[API POST /api/admin/customers] Customer created successfully:", JSON.stringify(createdCustomer))
    return NextResponse.json({ success: true, message: "Клиентът е създаден успешно", customer: createdCustomer })
  } catch (error) {
    console.error("[API POST /api/admin/customers] Error in try-catch block:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown server error"
    return NextResponse.json({ error: "Грешка при създаване на клиента", details: errorMessage }, { status: 500 })
  }
}
