import { NextResponse } from "next/server"
import { ECONT_CONFIG, fetchEcontCities } from "@/lib/econt-api"
import type { EcontCity } from "@/lib/econt-api"

// Hardcoded production credentials
const ECONT_USERNAME = "bobikab04@gmail.com"
const ECONT_PASSWORD = "Bobi04077812@"

let citiesCache: { data: any; timestamp: number } | null = null
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

function getCachedCities() {
  if (!citiesCache) return null

  const now = Date.now()
  if (now - citiesCache.timestamp > CACHE_DURATION) {
    citiesCache = null
    return null
  }

  return citiesCache.data
}

function setCachedCities(data: any) {
  citiesCache = {
    data,
    timestamp: Date.now(),
  }
}

export async function GET() {
  try {
    console.log("🏙️ API: Starting cities fetch...")

    const cachedData = getCachedCities()
    if (cachedData) {
      console.log("✅ API: Returning cached cities data")
      return NextResponse.json(cachedData)
    }

    const cities = await fetchEcontCities()
    console.log(`✅ API: Successfully fetched ${cities.length} cities`)

    setCachedCities(cities)

    return NextResponse.json(cities)
  } catch (error: any) {
    console.error("❌ API: Error in /api/econt/cities route:", error.message)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cities",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  console.log("🎯 Starting Econt Cities API call...")

  try {
    const cachedData = getCachedCities()
    if (cachedData) {
      console.log("✅ API: Returning cached cities data")
      return NextResponse.json(cachedData)
    }

    const body = await request.json().catch(() => ({}))
    const { countryCode = "BGR" } = body

    console.log(`📍 Fetching cities for country: ${countryCode}`)

    // Try multiple endpoints in order of preference
    const endpoints = [
      {
        name: "Legacy XML Service",
        url: ECONT_CONFIG.PRODUCTION.LEGACY_XML,
        method: "legacy",
      },
      {
        name: "Production SOAP",
        url: ECONT_CONFIG.PRODUCTION.SOAP_ENDPOINT,
        method: "soap",
      },
      {
        name: "Demo SOAP",
        url: ECONT_CONFIG.DEMO.SOAP_ENDPOINT,
        method: "soap",
      },
    ]

    let lastError = null

    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying ${endpoint.name}: ${endpoint.url}`)

        let response: Response
        let requestBody: string

        if (endpoint.method === "legacy") {
          // Legacy XML format
          requestBody = `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <client>
    <username>${escapeXml(ECONT_USERNAME)}</username>
    <password>${escapeXml(ECONT_PASSWORD)}</password>
  </client>
  <request_type>cities</request_type>
  <cities>
    <country_code>${escapeXml(countryCode)}</country_code>
  </cities>
</request>`

          response = await fetch(endpoint.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
              Accept: "text/xml, application/xml, text/plain",
              "User-Agent": "Mozilla/5.0 (compatible; EcontAPI/1.0)",
              "Cache-Control": "no-cache",
            },
            body: `xml=${encodeURIComponent(requestBody)}`,
          })
        } else {
          // SOAP format
          requestBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetCities xmlns="http://tempuri.org/">
      <username>${ECONT_USERNAME}</username>
      <password>${ECONT_PASSWORD}</password>
      <countryCode>${countryCode}</countryCode>
    </GetCities>
  </soap:Body>
</soap:Envelope>`

          response = await fetch(endpoint.url, {
            method: "POST",
            headers: {
              "Content-Type": "text/xml; charset=utf-8",
              SOAPAction: "http://tempuri.org/GetCities",
              "User-Agent": "Mozilla/5.0 (compatible; EcontAPI/1.0)",
            },
            body: requestBody,
          })
        }

        console.log(`📡 Response status: ${response.status}`)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const responseText = await response.text()
        console.log(`📄 Response length: ${responseText.length} characters`)
        console.log(`📄 Response preview: ${responseText.substring(0, 500)}...`)

        // Check if response is HTML/JavaScript (error page)
        if (responseText.includes("<html") || responseText.includes("<script") || responseText.includes("<!DOCTYPE")) {
          console.log(`❌ ${endpoint.name} returned HTML instead of XML`)
          throw new Error("Received HTML response instead of XML")
        }

        // Parse XML response
        const cities = parseEcontCitiesResponse(responseText)

        if (cities && cities.length > 0) {
          console.log(`✅ ${endpoint.name} SUCCESS! Found ${cities.length} cities`)
          setCachedCities(cities)
          return NextResponse.json(cities)
        } else {
          console.log(`⚠️ ${endpoint.name} returned empty cities list`)
          throw new Error("No cities found in response")
        }
      } catch (error: any) {
        console.log(`❌ ${endpoint.name} failed:`, error.message)
        lastError = error
        continue
      }
    }

    // If all endpoints failed
    console.log("🚨 All endpoints failed!")
    return NextResponse.json(
      {
        error: "All endpoints failed or returned invalid responses",
        details: lastError?.message || "Unknown error",
        endpoints: endpoints.map((e) => e.name),
      },
      { status: 500 },
    )
  } catch (error: any) {
    console.error("🚨 Critical error in /api/econt/cities route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function parseEcontCitiesResponse(xmlText: string): EcontCity[] {
  try {
    console.log("🔍 Parsing XML response for cities...")

    const cities: EcontCity[] = []

    // Method 1: Look for <e> elements (Econt legacy format)
    let cityMatches = xmlText.match(/<e[^>]*>[\s\S]*?<\/e>/g)
    if (!cityMatches) {
      // Method 2: Look for <city> elements
      cityMatches = xmlText.match(/<city[^>]*>[\s\S]*?<\/city>/g)
    }
    if (!cityMatches) {
      // Method 3: Look for <City> elements (SOAP format)
      cityMatches = xmlText.match(/<City[^>]*>[\s\S]*?<\/City>/g)
    }

    if (cityMatches) {
      console.log(`📋 Found ${cityMatches.length} city elements`)

      cityMatches.forEach((cityXml, index) => {
        try {
          const id = extractXmlValue(cityXml, "id") || extractXmlValue(cityXml, "ID") || String(index)
          const name = extractXmlValue(cityXml, "name") || extractXmlValue(cityXml, "Name") || ""
          const nameEn = extractXmlValue(cityXml, "name_en") || extractXmlValue(cityXml, "NameEn")
          const postCode = extractXmlValue(cityXml, "post_code") || extractXmlValue(cityXml, "PostCode") || ""

          if (id && name) {
            cities.push({
              id: String(id),
              name: String(name),
              nameEn: nameEn ? String(nameEn) : undefined,
              postCode: String(postCode),
              countryCode: "BGR",
            })
          }
        } catch (err) {
          console.warn(`⚠️ Failed to parse city ${index}:`, err)
        }
      })
    }

    console.log(`🎉 Successfully parsed ${cities.length} cities`)
    return cities
  } catch (error: any) {
    console.error("❌ Error parsing cities XML:", error)
    return []
  }
}

function extractXmlValue(xml: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}[^>]*>([^<]*)<\/${tagName}>`, "i")
  const match = xml.match(regex)
  return match ? match[1].trim() : null
}
