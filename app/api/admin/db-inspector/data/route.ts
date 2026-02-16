import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get("table")
    const limit = searchParams.get("limit") || "50"
    const offset = searchParams.get("offset") || "0"

    if (!table) {
      return NextResponse.json({ success: false, error: "Table name is required" }, { status: 400 })
    }

    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL

    if (!connectionString) {
      return NextResponse.json(
        {
          success: false,
          error: "No database connection string found",
        },
        { status: 500 },
      )
    }

    const sql = neon(connectionString)
    const limitNum = Number.parseInt(limit)
    const offsetNum = Number.parseInt(offset)

    // Използваме безопасен метод за конструиране на заявката
    // Вместо да използваме интерполация на низове, ще използваме параметри
    const query = `SELECT * FROM "${table}" LIMIT $1 OFFSET $2`

    console.log("Executing query:", query, "with params:", [limitNum, offsetNum])

    // Използваме sql.unsafe за изпълнение на заявката с параметри
    const rows = await sql.unsafe(query, [limitNum, offsetNum])

    return NextResponse.json({ success: true, rows })
  } catch (error: any) {
    const { searchParams } = new URL(request.url)
    console.error("Error fetching data:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch data",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        query: `SELECT * FROM "${searchParams?.get("table")}" LIMIT ${searchParams?.get("limit") || "50"} OFFSET ${searchParams?.get("offset") || "0"}`,
      },
      { status: 500 },
    )
  }
}
