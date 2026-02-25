import { NextResponse } from "next/server"
import { executeQueryWithRetry, dbInitialized } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

// Helper to get the site base URL
function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "https://www.madiks.bg"
}

// Convert BGN to EUR (1 EUR = 1.96 BGN)
function convertBgnToEur(bgnPrice: number): string {
  return (bgnPrice / 1.96).toFixed(2)
}

// Escape XML special characters
function escapeXml(str: string | null | undefined): string {
  if (!str) return ""
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

/**
 * Meta Product Catalog Feed (XML/RSS format)
 * 
 * This endpoint generates an XML feed compatible with Meta Business Suite / Commerce Manager.
 * 
 * Usage in Meta Business Suite:
 * 1. Go to Commerce Manager > Catalog > Data Sources
 * 2. Add Data Feed > Scheduled Feed
 * 3. Enter URL: https://www.madiks.bg/api/meta-product-feed
 * 4. Set schedule (e.g., every hour or daily)
 * 
 * Supports optional query parameters:
 * - ?format=csv  - Returns CSV format instead of XML
 * - ?currency=EUR - Prices in EUR (default: BGN)
 */
export async function GET(request: Request) {
  try {
    if (!dbInitialized) {
      return new NextResponse("Database not initialized", { status: 503 })
    }

    const url = new URL(request.url)
    const format = url.searchParams.get("format") || "xml"
    const currency = url.searchParams.get("currency")?.toUpperCase() || "BGN"
    const siteUrl = getSiteUrl()

    // Fetch all active products with category and subcategory info
    const products = await executeQueryWithRetry(`
      SELECT 
        p.objectid,
        p."Document ID" as doc_id,
        p.title,
        p.title_en,
        p.description,
        p.price,
        p.retailerprice,
        p.wholesalerprice,
        p.europe_price,
        p.photourl,
        p.cateid,
        p.subcateid,
        p.createdat,
        p.updatedat,
        c.title as category_name,
        c.title_en as category_name_en,
        s.title as subcategory_name,
        s.title_en as subcategory_name_en
      FROM new_products p
      LEFT JOIN categories c ON p.cateid = c."Document ID"
      LEFT JOIN subcategories s ON p.subcateid = s."Document ID"
      WHERE (p.deleted = false OR p.deleted IS NULL)
        AND p.price IS NOT NULL
        AND p.title IS NOT NULL
      ORDER BY p.title ASC
    `)

    if (!products || products.length === 0) {
      if (format === "csv") {
        return new NextResponse("id,title,description,availability,condition,price,link,image_link,brand\n", {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": "attachment; filename=meta-product-feed.csv",
          },
        })
      }
      return new NextResponse(generateEmptyXml(), {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
        },
      })
    }

    if (format === "csv") {
      return generateCsvResponse(products, siteUrl, currency)
    }

    return generateXmlResponse(products, siteUrl, currency)
  } catch (error) {
    console.error("META FEED: Error generating product feed:", error)
    return new NextResponse("Error generating product feed", { status: 500 })
  }
}

function generateEmptyXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:g="http://base.google.com/ns/1.0">
  <title>Madiks Groundbaits - Product Feed</title>
  <link rel="self" href="https://www.madiks.bg/api/meta-product-feed"/>
  <updated>${new Date().toISOString()}</updated>
</feed>`
}

function generateXmlResponse(products: any[], siteUrl: string, currency: string): NextResponse {
  const items = products.map((product) => {
    const productId = product.objectid || product.doc_id
    const price = Number(product.price) || 0
    const displayPrice = currency === "EUR" ? convertBgnToEur(price) : price.toFixed(2)
    const displayCurrency = currency === "EUR" ? "EUR" : "BGN"
    
    // Build product URL - using objectid for the product page
    const productUrl = `${siteUrl}/product/${encodeURIComponent(productId)}`
    
    // Build image URL
    let imageUrl = product.photourl || ""
    if (imageUrl && !imageUrl.startsWith("http")) {
      imageUrl = `${siteUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`
    }

    // Build category path: "Category > Subcategory"
    const categoryParts: string[] = []
    if (product.category_name) categoryParts.push(product.category_name)
    if (product.subcategory_name) categoryParts.push(product.subcategory_name)
    const productType = categoryParts.join(" > ") || "Риболовни принадлежности"

    // Build description - use description or fall back to title
    const description = product.description || product.title || ""
    // Meta requires description to be between 1-9999 characters
    const truncatedDescription = description.substring(0, 9999)

    // Sale price if applicable (wholesale price as an example, if lower than standard price)
    let salePriceXml = ""
    if (product.retailerprice && Number(product.retailerprice) < price && Number(product.retailerprice) > 0) {
      const salePrice = currency === "EUR"
        ? convertBgnToEur(Number(product.retailerprice))
        : Number(product.retailerprice).toFixed(2)
      salePriceXml = `    <g:sale_price>${salePrice} ${displayCurrency}</g:sale_price>`
    }

    return `  <entry>
    <g:id>${escapeXml(productId)}</g:id>
    <g:title>${escapeXml(product.title)}</g:title>
    <g:description>${escapeXml(truncatedDescription)}</g:description>
    <g:link>${escapeXml(productUrl)}</g:link>
    <g:image_link>${escapeXml(imageUrl)}</g:image_link>
    <g:availability>in stock</g:availability>
    <g:price>${displayPrice} ${displayCurrency}</g:price>
${salePriceXml ? salePriceXml + "\n" : ""}    <g:condition>new</g:condition>
    <g:brand>Madiks</g:brand>
    <g:product_type>${escapeXml(productType)}</g:product_type>
    <g:google_product_category>3379</g:google_product_category>
    <g:custom_label_0>${escapeXml(product.category_name || "")}</g:custom_label_0>
    <g:custom_label_1>${escapeXml(product.subcategory_name || "")}</g:custom_label_1>
  </entry>`
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:g="http://base.google.com/ns/1.0">
  <title>Madiks Groundbaits - Product Feed</title>
  <link rel="self" href="${siteUrl}/api/meta-product-feed"/>
  <updated>${new Date().toISOString()}</updated>
${items.join("\n")}
</feed>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}

function generateCsvResponse(products: any[], siteUrl: string, currency: string): NextResponse {
  const headers = [
    "id",
    "title",
    "description",
    "availability",
    "condition",
    "price",
    "sale_price",
    "link",
    "image_link",
    "brand",
    "product_type",
    "google_product_category",
    "custom_label_0",
    "custom_label_1",
  ]

  const rows = products.map((product) => {
    const productId = product.objectid || product.doc_id
    const price = Number(product.price) || 0
    const displayPrice = currency === "EUR" ? convertBgnToEur(price) : price.toFixed(2)
    const displayCurrency = currency === "EUR" ? "EUR" : "BGN"
    
    const productUrl = `${siteUrl}/product/${encodeURIComponent(productId)}`

    let imageUrl = product.photourl || ""
    if (imageUrl && !imageUrl.startsWith("http")) {
      imageUrl = `${siteUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`
    }

    const categoryParts: string[] = []
    if (product.category_name) categoryParts.push(product.category_name)
    if (product.subcategory_name) categoryParts.push(product.subcategory_name)
    const productType = categoryParts.join(" > ") || "Риболовни принадлежности"

    const description = (product.description || product.title || "").substring(0, 9999)

    let salePrice = ""
    if (product.retailerprice && Number(product.retailerprice) < price && Number(product.retailerprice) > 0) {
      salePrice = currency === "EUR"
        ? `${convertBgnToEur(Number(product.retailerprice))} ${displayCurrency}`
        : `${Number(product.retailerprice).toFixed(2)} ${displayCurrency}`
    }

    return [
      csvEscape(productId),
      csvEscape(product.title),
      csvEscape(description),
      "in stock",
      "new",
      `${displayPrice} ${displayCurrency}`,
      salePrice,
      csvEscape(productUrl),
      csvEscape(imageUrl),
      "Madiks",
      csvEscape(productType),
      "3379",
      csvEscape(product.category_name || ""),
      csvEscape(product.subcategory_name || ""),
    ].join(",")
  })

  const csv = [headers.join(","), ...rows].join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=meta-product-feed.csv",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}

function csvEscape(value: string | null | undefined): string {
  if (!value) return '""'
  const str = String(value)
  // If the value contains commas, quotes, or newlines, wrap in quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return `"${str}"`
}
