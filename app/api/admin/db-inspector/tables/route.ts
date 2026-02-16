import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
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

    // Използваме sql.unsafe за изпълнение на заявката
    const result = await sql.unsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    // Извличаме имената на таблиците от резултата
    const tables = result.map((row: any) => row.table_name)

    return NextResponse.json({ success: true, tables })
  } catch (error: any) {
    console.error("Error fetching tables:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch tables",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
