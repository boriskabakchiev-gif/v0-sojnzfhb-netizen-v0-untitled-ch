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
          connectionString: "Not available",
        },
        { status: 500 },
      )
    }

    // Маскираме паролата в низа за връзка за по-безопасно показване
    const maskedConnectionString = connectionString.replace(/:[^:@]+@/, ":******@")

    const sql = neon(connectionString)

    // Проста заявка за проверка на връзката
    const result = await sql.unsafe("SELECT 1 as connected")

    return NextResponse.json({
      success: true,
      connected: result[0]?.connected === 1,
      connectionString: maskedConnectionString,
    })
  } catch (error: any) {
    console.error("Error testing database connection:", error)

    // Маскираме паролата в низа за връзка за по-безопасно показване
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL
    const maskedConnectionString = connectionString ? connectionString.replace(/:[^:@]+@/, ":******@") : "Not available"

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to connect to database",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        connectionString: maskedConnectionString,
      },
      { status: 500 },
    )
  }
}
