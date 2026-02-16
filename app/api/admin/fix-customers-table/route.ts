import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Проверка дали таблицата customers съществува
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'customers'
      ) as exists
    `

    if (!tableExists[0].exists) {
      // Създаване на таблицата, ако не съществува
      await sql`
        CREATE TABLE customers (
          "Document ID" text PRIMARY KEY,
          objectid text UNIQUE NOT NULL,
          storename text NOT NULL,
          companyname text,
          phone text,
          type text DEFAULT 'standard',
          discountpercent text DEFAULT '0',
          password text,
          createdat timestamp DEFAULT CURRENT_TIMESTAMP,
          pending boolean DEFAULT true,
          deleted boolean DEFAULT false,
          createdbyadmin boolean DEFAULT false,
          ios_token text,
          android_token text,
          storelocation jsonb,
          route text
        )
      `

      return NextResponse.json({
        success: true,
        message: "Таблицата customers беше създадена успешно",
        action: "created",
      })
    }

    // Проверка на типа на колоната createdat
    const columnInfo = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'customers' AND column_name = 'createdat'
    `

    if (columnInfo.length > 0) {
      const createdAtType = columnInfo[0].data_type

      // Ако типът е jsonb, променяме го на timestamp
      if (createdAtType === "jsonb" || createdAtType === "json") {
        await sql`
          ALTER TABLE customers 
          ALTER COLUMN createdat TYPE timestamp USING (now())
        `

        return NextResponse.json({
          success: true,
          message: "Колоната createdat беше променена от jsonb на timestamp",
          action: "altered",
          previousType: createdAtType,
          newType: "timestamp",
        })
      }

      return NextResponse.json({
        success: true,
        message: "Структурата на таблицата е правилна",
        action: "none",
        columnType: createdAtType,
      })
    }

    return NextResponse.json({
      success: false,
      message: "Колоната createdat не беше намерена",
      action: "none",
    })
  } catch (error) {
    console.error("Грешка при проверка/корекция на таблицата customers:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Грешка при проверка/корекция на таблицата customers",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
