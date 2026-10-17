import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { neon } from "@neondatabase/serverless"
import { uploadProductImage } from "@/lib/blob-storage"

export const maxDuration = 120

function getSql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured")
  return neon(process.env.DATABASE_URL)
}

async function createWhiteBackgroundImage(imageUrl: string) {
  const sourceResponse = await fetch(imageUrl)
  if (!sourceResponse.ok) throw new Error("Неуспешно изтегляне на AI снимката")
  const sourceBlob = await sourceResponse.blob()
  const input = new FormData()
  input.append("model", "gpt-image-1")
  input.append("image", new File([sourceBlob], "product-source.png", { type: sourceBlob.type || "image/png" }))
  input.append("prompt", "Remove the entire background from this product photo. Keep the product exactly as it is, centered, sharp, and complete. Place it on a clean pure white background. Do not add text, logos, objects, or change the product packaging.")
  input.append("size", "1024x1024")
  input.append("quality", "high")

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: input,
  })
  if (!response.ok) throw new Error(`OpenAI image processing failed (${response.status})`)
  const data = await response.json()
  const base64 = data?.data?.[0]?.b64_json
  if (!base64) throw new Error("OpenAI не върна обработена снимка")
  return Buffer.from(base64, "base64")
}

export async function POST(request: Request) {
  try {
    const { imageUrl, hint, categories = [], subcategories = [] } = await request.json()
    if (!imageUrl) return NextResponse.json({ error: "Липсва снимка на продукта." }, { status: 400 })
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "OPENAI_API_KEY не е конфигуриран." }, { status: 500 })

    const processedImage = await createWhiteBackgroundImage(imageUrl)
    const processedUrl = await uploadProductImage(new File([processedImage], `ai-product-${Date.now()}.png`, { type: "image/png" }), `ai-${Date.now()}`)
    const sql = getSql()
    const examples = await sql`
      SELECT title, title_en, description, description_en, price, wholesalerprice, retailerprice,
             europe_price, price_eur, wholesalerprice_eur, retailerprice_eur, europe_price_eur,
             sku, barcode, cateid, subcateid, seo_meta_title, seo_meta_description, seo_focus_keyword
      FROM new_products WHERE (deleted = false OR deleted IS NULL)
      ORDER BY createdat DESC NULLS LAST LIMIT 20
    `

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system: `Ти си продуктов редактор за MADIX Groundbaits. Върни САМО валиден JSON без markdown. Използвай български и английски. Използвай примерите за стил и цени, а каталога за точен избор на категория и подкатегория. Избери най-подходящите по смисъл; ако няма подходяща подкатегория, върни празен текст. Цените са предложения за одобрение. Не измисляй баркод. JSON ключове: title,title_en,description,description_en,price,wholesalerprice,retailerprice,europe_price,price_eur,wholesalerprice_eur,retailerprice_eur,europe_price_eur,sku,barcode,category_title,subcategory_title,seo_meta_title,seo_meta_description,seo_focus_keyword,seo_alt_text,price_note. Цените да са числа или null.`,
      messages: [{ role: "user", content: [{ type: "text", text: `Бележка: ${String(hint ?? "") || "няма"}\n\nКатегории: ${JSON.stringify(categories)}\nПодкатегории: ${JSON.stringify(subcategories)}\nПримерни продукти: ${JSON.stringify(examples)}` }, { type: "image", image: processedUrl }] }],
    })
    const cleaned = result.text.trim().replace(/^```json\s*/, "").replace(/\s*```$/, "")
    return NextResponse.json({ success: true, imageUrl: processedUrl, product: JSON.parse(cleaned) })
  } catch (error) {
    console.error("[v0] AI product generation error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Неуспешно генериране на продукта." }, { status: 500 })
  }
}
