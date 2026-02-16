import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query, params = [] } = body

    if (!query) {
      return NextResponse.json({ success: false, error: "Query is required" }, { status: 400 })
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

    console.log("Executing direct query:", query, "with params:", params)

    // Използваме sql.unsafe за изпълнение на произволни заявки
    const result = await sql.unsafe(query, params)

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error("Error executing direct query:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to execute query",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
