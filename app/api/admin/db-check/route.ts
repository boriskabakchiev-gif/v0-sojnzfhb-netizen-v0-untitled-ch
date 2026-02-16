import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    console.log("Проверка на връзката с базата данни")

    // Извличаме информация за наличните таблици
    const sql = neon(process.env.DATABASE_URL!)

    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    console.log("Налични таблици:", tables.map((t: any) => t.table_name).join(", "))

    // Проверяваме дали таблицата new_products съществува
    const productsTable = tables.find((t: any) => t.table_name === "new_products")

    // Проверяваме дали таблицата categories съществува
    const categoriesTable = tables.find((t: any) => t.table_name === "categories")

    // Извличаме информация за колоните в таблицата new_products
    let productsColumns = []
    if (productsTable) {
      productsColumns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'new_products'
        ORDER BY ordinal_position
      `
    }

    // Извличаме информация за колоните в таблицата categories
    let categoriesColumns = []
    if (categoriesTable) {
      categoriesColumns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'categories'
        ORDER BY ordinal_position
      `
    }

    // Проверяваме дали можем да извлечем данни от таблицата new_products
    let productsCount = 0
    if (productsTable) {
      const result = await sql`SELECT COUNT(*) as count FROM new_products`
      productsCount = result[0]?.count || 0
    }

    // Проверяваме дали можем да извлечем данни от таблицата categories
    let categoriesCount = 0
    if (categoriesTable) {
      const result = await sql`SELECT COUNT(*) as count FROM categories`
      categoriesCount = result[0]?.count || 0
    }

    return NextResponse.json({
      success: true,
      connection: "OK",
      database: {
        url: process.env.DATABASE_URL ? "Налично" : "Липсва",
        tables: tables.length,
        tablesList: tables.map((t: any) => t.table_name),
      },
      products: {
        tableExists: !!productsTable,
        columns: productsColumns.map((c: any) => `${c.column_name} (${c.data_type})`),
        count: productsCount,
      },
      categories: {
        tableExists: !!categoriesTable,
        columns: categoriesColumns.map((c: any) => `${c.column_name} (${c.data_type})`),
        count: categoriesCount,
      },
      environment: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        POSTGRES_URL: !!process.env.POSTGRES_URL,
        POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
        NODE_ENV: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    console.error("Error checking database connection:", error)
    const errorMessage = error instanceof Error ? error.message : "Неизвестна грешка"

    return NextResponse.json(
      {
        success: false,
        connection: "Failed",
        error: errorMessage,
        details: error instanceof Error ? error.stack : null,
        environment: {
          DATABASE_URL: !!process.env.DATABASE_URL,
          POSTGRES_URL: !!process.env.POSTGRES_URL,
          POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
          NODE_ENV: process.env.NODE_ENV,
        },
      },
      { status: 500 },
    )
  }
}
