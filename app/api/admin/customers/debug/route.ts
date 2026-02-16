import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("Debug: Проверяваме връзката с базата данни...")

    // Проверяваме дали таблицата customers съществува
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'customers'
    `

    console.log("Table check result:", tableCheck)

    if (tableCheck.length === 0) {
      // Създаваме таблицата ако не съществува
      await sql`
        CREATE TABLE IF NOT EXISTS customers (
          id SERIAL PRIMARY KEY,
          objectid VARCHAR(255) UNIQUE NOT NULL,
          storename VARCHAR(255),
          companyname VARCHAR(255),
          phone VARCHAR(50),
          type VARCHAR(50) DEFAULT 'standard',
          discountpercent VARCHAR(10) DEFAULT '0',
          createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          pending BOOLEAN DEFAULT true,
          deleted BOOLEAN DEFAULT false,
          createdbyadmin BOOLEAN DEFAULT false
        )
      `

      return NextResponse.json({
        message: "Таблицата customers е създадена",
        tableCreated: true,
        totalRecords: 0,
      })
    }

    // Получаваме структурата на таблицата
    const schema = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'customers'
      ORDER BY ordinal_position
    `

    // Получаваме броя записи
    const count = await sql`SELECT COUNT(*) as total FROM customers`

    // Получаваме първите 5 записа за пример
    const sample = await sql`SELECT * FROM customers ORDER BY createdat DESC LIMIT 5`

    return NextResponse.json({
      tableExists: true,
      schema: schema,
      totalRecords: count[0]?.total || 0,
      sampleData: sample,
    })
  } catch (error) {
    console.error("Debug грешка:", error)
    return NextResponse.json(
      {
        error: "Грешка при проверка на таблицата",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
