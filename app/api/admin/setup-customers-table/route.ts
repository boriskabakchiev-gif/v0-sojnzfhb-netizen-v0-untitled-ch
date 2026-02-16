import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Проверяваме дали таблицата customers съществува
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'customers'
      ) as exists;
    `

    const tableExists = tableCheck[0]?.exists || false

    if (!tableExists) {
      // Създаваме таблицата, ако не съществува
      await sql`
        CREATE TABLE customers (
          "Document ID" TEXT PRIMARY KEY,
          objectid TEXT UNIQUE NOT NULL,
          storename TEXT NOT NULL,
          companyname TEXT,
          phone TEXT,
          type TEXT DEFAULT 'standard',
          discountpercent TEXT DEFAULT '0',
          password TEXT,
          pending BOOLEAN DEFAULT false,
          deleted BOOLEAN DEFAULT false,
          createdbyadmin BOOLEAN DEFAULT true
        );
      `

      return NextResponse.json({
        success: true,
        message: "Таблицата customers е създадена успешно",
      })
    }

    // Проверяваме дали колоната type съществува
    const typeColumnCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'type'
      ) as exists;
    `

    const typeColumnExists = typeColumnCheck[0]?.exists || false

    if (!typeColumnExists) {
      // Добавяме колоната type, ако не съществува
      await sql`
        ALTER TABLE customers 
        ADD COLUMN type TEXT DEFAULT 'standard';
      `
    }

    return NextResponse.json({
      success: true,
      message: "Таблицата customers е проверена и актуализирана успешно",
      tableExists,
      typeColumnExists,
    })
  } catch (error) {
    console.error("Грешка при настройка на таблицата customers:", error)
    return NextResponse.json(
      {
        error: "Грешка при настройка на таблицата customers",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
