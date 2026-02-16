import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ success: false, error: "Query is required" }, { status: 400 })
    }

    console.log("Executing query:", query)

    // Get database URL from environment variables
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL

    if (!dbUrl) {
      console.error("No database URL found in environment variables")
      return NextResponse.json(
        {
          success: false,
          error: "Database connection string not found. Please check your environment variables.",
        },
        { status: 500 },
      )
    }

    // Create SQL client
    const sql = neon(dbUrl)

    // Execute the query
    const result = await sql.unsafe(query)
    console.log("Raw result from database:", result)
    console.log("Result type:", typeof result)
    console.log("Is result an array?", Array.isArray(result))

    // Handle different result formats from neon
    const responseData: any = {
      success: true,
    }

    if (Array.isArray(result)) {
      // If result is directly an array (most common case)
      responseData.result = result
      responseData.rows = result
      responseData.rowCount = result.length
    } else if (result && typeof result === "object") {
      // If result is an object with properties
      responseData.result = result.rows || result
      responseData.rows = result.rows || result
      responseData.rowCount = result.rowCount || (result.rows ? result.rows.length : 0)
      responseData.command = result.command
    } else {
      // Fallback
      responseData.result = result
      responseData.rows = []
      responseData.rowCount = 0
    }

    console.log("Sending response:", responseData)

    return NextResponse.json(responseData)
  } catch (error: any) {
    console.error("Error executing query:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to execute query",
      },
      { status: 500 },
    )
  }
}
