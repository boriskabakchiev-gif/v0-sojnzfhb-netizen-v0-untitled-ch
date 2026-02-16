import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Създаваме SQL клиент
const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    console.log("Получена заявка за добавяне на продукт")

    // Извличаме данните от заявката
    const data = await request.json()
    console.log("Данни за продукта:", data)

    // Валидираме задължителните полета
    if (!data.title) {
      return NextResponse.json({ success: false, error: "Името на продукта е задължително" }, { status: 400 })
    }

    if (!data.title_en) {
      return NextResponse.json(
        { success: false, error: "Името на продукта на английски е задължително" },
        { status: 400 },
      )
    }

    // Преобразуваме цените към числа
    const price = data.price ? Number.parseFloat(data.price) : null
    const wholesalerprice = data.wholesalerprice ? Number.parseFloat(data.wholesalerprice) : null
    const retailerprice = data.retailerprice ? Number.parseFloat(data.retailerprice) : null
    const europe_price = data.europe_price ? Number.parseFloat(data.europe_price) : null

    // Логваме преобразуваните цени за дебъгване
    console.log("Преобразувани цени:", {
      price,
      wholesalerprice,
      retailerprice,
      europe_price,
      rawEuropePrice: data.europe_price,
    })

    // Генерираме уникален ID за продукта
    const objectid = `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    const documentId = crypto.randomUUID()

    // Записваме продукта в базата данни използвайки tagged template literals
    const result = await sql`
      INSERT INTO new_products (
        objectid, 
        "Document ID", 
        title, 
        title_en,
        description, 
        description_en,
        price, 
        wholesalerprice, 
        retailerprice, 
        europe_price,
        cateid, 
        subcateid, 
        photourl, 
        createdat
      ) VALUES (
        ${objectid}, 
        ${documentId}, 
        ${data.title}, 
        ${data.title_en || ""},
        ${data.description || ""}, 
        ${data.description_en || ""},
        ${price}, 
        ${wholesalerprice}, 
        ${retailerprice}, 
        ${europe_price},
        ${data.cateid === "none" ? null : data.cateid}, 
        ${data.subcateid === "none" ? null : data.subcateid}, 
        ${data.photourl || null}, 
        ${new Date().toISOString()}
      )
      RETURNING objectid, title, title_en, europe_price
    `

    console.log("Резултат от запис:", result)

    // Проверяваме дали europe_price е записано правилно
    if (result.length > 0) {
      console.log("Записана европейска цена:", result[0].europe_price)
      console.log("Записано английско име:", result[0].title_en)
    }

    return NextResponse.json({
      success: true,
      message: "Продуктът беше добавен успешно",
      product: result[0],
    })
  } catch (error) {
    console.error("Error adding product:", error)
    const errorMessage = error instanceof Error ? error.message : "Неизвестна грешка"

    return NextResponse.json(
      {
        success: false,
        error: `Грешка при добавяне на продукта: ${errorMessage}`,
        details: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
    )
  }
}
