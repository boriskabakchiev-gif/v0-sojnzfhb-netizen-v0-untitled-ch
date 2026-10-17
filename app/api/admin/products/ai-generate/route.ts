import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { neon } from "@neondatabase/serverless"

export const maxDuration = 60

function getSql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured")
  return neon(process.env.DATABASE_URL)
}

export async function POST(request: Request) {
  try {
    const { imageUrl, hint } = await request.json()
    if (!imageUrl) return Response.json({ error: "Липсва снимка на продукта." }, { status: 400 })

    const sql = getSql()
    const examples = await sql`
      SELECT title, title_en, description, description_en, price, wholesalerprice, retailerprice,
             europe_price, price_eur, wholesalerprice_eur, retailerprice_eur, europe_price_eur,
             sku, barcode, seo_meta_title, seo_meta_description, seo_focus_keyword
      FROM new_products
      WHERE (deleted = false OR deleted IS NULL)
      ORDER BY createdat DESC NULLS LAST
      LIMIT 20
    `

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system: `Ти си продуктов редактор за MADIX Groundbaits. Анализирай снимката и кратката бележка, после върни САМО валиден JSON без markdown. Използвай български за title и description и английски за title_en и description_en. Учи се от примерните записи за стил, структура и ценови диапазон, но не копирай стойности без причина. Никога не измисляй баркод; остави го празен, ако не се вижда ясно. Цените са предложения и трябва да бъдат прегледани от администратор. JSON ключове: title, title_en, description, description_en, price, wholesalerprice, retailerprice, europe_price, price_eur, wholesalerprice_eur, retailerprice_eur, europe_price_eur, sku, barcode, seo_meta_title, seo_meta_description, seo_focus_keyword, seo_alt_text, price_note. Цените да са числа или null.`,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Кратка бележка от администратора: ${String(hint ?? "") || "няма"}\n\nПримерни съществуващи продукти:\n${JSON.stringify(examples)}` },
            { type: "image", image: imageUrl },
          ],
        },
      ],
    })

    const cleaned = result.text.trim().replace(/^```json\s*/, "").replace(/\s*```$/, "")
    return Response.json({ success: true, product: JSON.parse(cleaned) })
  } catch (error) {
    console.error("[v0] AI product generation error:", error)
    return Response.json({ error: "Неуспешно генериране на продукта. Проверете OpenAI настройките и опитайте отново." }, { status: 500 })
  }
}
