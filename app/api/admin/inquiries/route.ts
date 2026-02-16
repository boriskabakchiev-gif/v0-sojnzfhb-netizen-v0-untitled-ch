import { NextResponse, type NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const searchTerm = searchParams.get("search") || ""
    const statusFilter = searchParams.get("status") || "all"

    const offset = (page - 1) * limit

    const whereClauses = []
    const queryParams: (string | number)[] = []
    let paramIndex = 1

    if (searchTerm) {
      whereClauses.push(
        `(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR subject ILIKE $${paramIndex} OR message ILIKE $${paramIndex})`,
      )
      queryParams.push(`%${searchTerm}%`)
      paramIndex++
    }

    if (statusFilter !== "all") {
      whereClauses.push(`status = $${paramIndex}`)
      queryParams.push(statusFilter)
      paramIndex++
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : ""

    const inquiriesQuery = `
      SELECT 
        id,
        name,
        email,
        subject,
        message,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM contact_inquiries
      ${whereString}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    queryParams.push(limit, offset)

    const inquiries = await sql.unsafe(inquiriesQuery, queryParams as any)

    const countQuery = `
      SELECT COUNT(*) FROM contact_inquiries
      ${whereString}
    `
    // Need to adjust queryParams for count (remove limit and offset)
    const countQueryParams = queryParams.slice(0, paramIndex - 1)
    const totalCountResult = await sql.unsafe(countQuery, countQueryParams as any)
    const totalCount = Number.parseInt(totalCountResult[0]?.count || "0")

    return NextResponse.json({
      inquiries: inquiries || [],
      count: totalCount,
    })
  } catch (error) {
    console.error("Error fetching contact inquiries:", error)
    return NextResponse.json({ error: "Failed to fetch contact inquiries" }, { status: 500 })
  }
}
