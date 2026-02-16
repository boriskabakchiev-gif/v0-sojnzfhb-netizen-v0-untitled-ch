export interface EcontCity {
  id: string
  name: string
  postCode: string
  nameEn?: string
  countryCode?: string
}

export interface EcontOffice {
  id: string
  name: string
  address: string
  phone: string
  cityId?: string
  cityName?: string
  workBegin?: string
  workEnd?: string
  workBeginSaturday?: string
  workEndSaturday?: string
  isMachine?: boolean
  location?: {
    latitude: number
    longitude: number
  }
  nameEn?: string
}

// Hardcoded production credentials
const ECONT_USERNAME = "bobikab04@gmail.com"
const ECONT_PASSWORD = "Bobi04077812@"

export const ECONT_CONFIG = {
  PRODUCTION: {
    SERVICE_TOOL: "https://ee.econt.com/services/Nomenclatures/NomenclaturesService.svc",
    SOAP_ENDPOINT: "https://ee.econt.com/services/Nomenclatures/NomenclaturesService.svc",
    LEGACY_XML: "https://www.econt.com/e-econt/xml_service_tool.php",
  },
  DEMO: {
    SERVICE_TOOL: "https://demo.econt.com/ee/services/Nomenclatures/NomenclaturesService.svc",
    SOAP_ENDPOINT: "https://demo.econt.com/ee/services/Nomenclatures/NomenclaturesService.svc",
    LEGACY_XML: "https://demo.econt.com/e-econt/xml_service_tool.php",
  },
}

export async function fetchEcontCities(): Promise<EcontCity[]> {
  console.log("🏙️ Starting Econt cities fetch...")

  const endpoints = [
    {
      name: "Production Legacy XML",
      url: ECONT_CONFIG.PRODUCTION.LEGACY_XML,
      type: "xml" as const,
    },
    {
      name: "Production SOAP",
      url: ECONT_CONFIG.PRODUCTION.SOAP_ENDPOINT,
      type: "soap" as const,
    },
    {
      name: "Demo Legacy XML",
      url: ECONT_CONFIG.DEMO.LEGACY_XML,
      type: "xml" as const,
    },
    {
      name: "Demo SOAP",
      url: ECONT_CONFIG.DEMO.SOAP_ENDPOINT,
      type: "soap" as const,
    },
  ]

  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 Trying ${endpoint.name}: ${endpoint.url}`)

      if (endpoint.type === "xml") {
        const xmlRequestBody = `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <client>
    <username>${escapeXml(ECONT_USERNAME)}</username>
    <password>${escapeXml(ECONT_PASSWORD)}</password>
  </client>
  <request_type>cities</request_type>
  <cities>
    <country_code>BGR</country_code>
  </cities>
</request>`

        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
            Accept: "text/xml, application/xml, text/plain",
            "User-Agent": "Mozilla/5.0 (compatible; EcontAPI/1.0)",
          },
          body: `xml=${encodeURIComponent(xmlRequestBody)}`,
        })

        console.log(`📡 ${endpoint.name} Response:`, response.status, response.statusText)

        if (!response.ok) {
          console.log(`❌ ${endpoint.name} failed with status:`, response.status)
          continue
        }

        const xmlText = await response.text()
        console.log(`📄 ${endpoint.name} Response preview:`, xmlText.substring(0, 200))

        if (xmlText.includes("<html") || xmlText.includes("javascript")) {
          console.log(`⚠️ ${endpoint.name} returned HTML/JS instead of XML`)
          continue
        }

        const cities = parseXMLCities(xmlText)
        if (cities.length > 0) {
          console.log(`✅ ${endpoint.name} success! Found ${cities.length} cities`)
          return cities
        }
      } else if (endpoint.type === "soap") {
        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetCities xmlns="http://tempuri.org/">
      <username>${ECONT_USERNAME}</username>
      <password>${ECONT_PASSWORD}</password>
      <countryCode>BGR</countryCode>
    </GetCities>
  </soap:Body>
</soap:Envelope>`

        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "text/xml; charset=utf-8",
            SOAPAction: "http://tempuri.org/GetCities",
            Accept: "application/xml, text/xml",
          },
          body: soapEnvelope,
        })

        console.log(`📡 ${endpoint.name} SOAP Response:`, response.status, response.statusText)

        if (!response.ok) {
          console.log(`❌ ${endpoint.name} SOAP failed with status:`, response.status)
          continue
        }

        const xmlText = await response.text()
        console.log(`📄 ${endpoint.name} SOAP Response preview:`, xmlText.substring(0, 200))

        if (xmlText.includes("<html") || xmlText.includes("javascript")) {
          console.log(`⚠️ ${endpoint.name} returned HTML/JS instead of XML`)
          continue
        }

        const cities = parseSOAPCities(xmlText)
        if (cities.length > 0) {
          console.log(`✅ ${endpoint.name} SOAP success! Found ${cities.length} cities`)
          return cities
        }
      }
    } catch (error) {
      console.error(`❌ ${endpoint.name} error:`, error)
      continue
    }
  }

  console.error("🚨 All Econt cities endpoints failed!")
  throw new Error("All endpoints failed or returned invalid responses")
}

export async function fetchEcontOffices(cityId: string): Promise<EcontOffice[]> {
  console.log(`🏢 Starting Econt offices fetch for city: ${cityId}`)

  const endpoints = [
    {
      name: "Production Legacy XML",
      url: ECONT_CONFIG.PRODUCTION.LEGACY_XML,
      type: "xml" as const,
    },
    {
      name: "Production SOAP",
      url: ECONT_CONFIG.PRODUCTION.SOAP_ENDPOINT,
      type: "soap" as const,
    },
    {
      name: "Demo SOAP",
      url: ECONT_CONFIG.DEMO.SOAP_ENDPOINT,
      type: "soap" as const,
    },
  ]

  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 Trying ${endpoint.name}: ${endpoint.url}`)

      if (endpoint.type === "xml") {
        const xmlRequestBody = `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <client>
    <username>${escapeXml(ECONT_USERNAME)}</username>
    <password>${escapeXml(ECONT_PASSWORD)}</password>
  </client>
  <request_type>offices</request_type>
  <offices>
    <city_id>${escapeXml(cityId)}</city_id>
  </offices>
</request>`

        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
            Accept: "text/xml, application/xml, text/plain",
            "User-Agent": "Mozilla/5.0 (compatible; EcontAPI/1.0)",
          },
          body: `xml=${encodeURIComponent(xmlRequestBody)}`,
        })

        console.log(`📡 ${endpoint.name} Response:`, response.status, response.statusText)

        if (!response.ok) {
          console.log(`❌ ${endpoint.name} failed with status:`, response.status)
          continue
        }

        const xmlText = await response.text()
        console.log(`📄 ${endpoint.name} Response preview:`, xmlText.substring(0, 200))

        if (xmlText.includes("<html") || xmlText.includes("javascript")) {
          console.log(`⚠️ ${endpoint.name} returned HTML/JS instead of XML`)
          continue
        }

        const offices = parseXMLOffices(xmlText)
        if (offices.length > 0) {
          console.log(`✅ ${endpoint.name} success! Found ${offices.length} offices`)
          return offices
        }
      } else if (endpoint.type === "soap") {
        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetOffices xmlns="http://tempuri.org/">
      <username>${ECONT_USERNAME}</username>
      <password>${ECONT_PASSWORD}</password>
      <cityId>${cityId}</cityId>
    </GetOffices>
  </soap:Body>
</soap:Envelope>`

        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "text/xml; charset=utf-8",
            SOAPAction: "http://tempuri.org/GetOffices",
            Accept: "application/xml, text/xml",
          },
          body: soapEnvelope,
        })

        console.log(`📡 ${endpoint.name} Response:`, response.status, response.statusText)

        if (!response.ok) {
          console.log(`❌ ${endpoint.name} failed with status:`, response.status)
          continue
        }

        const xmlText = await response.text()
        console.log(`📄 ${endpoint.name} Response preview:`, xmlText.substring(0, 200))

        if (xmlText.includes("<html") || xmlText.includes("javascript")) {
          console.log(`⚠️ ${endpoint.name} returned HTML/JS instead of XML`)
          continue
        }

        const offices = parseSOAPOffices(xmlText)
        if (offices.length > 0) {
          console.log(`✅ ${endpoint.name} success! Found ${offices.length} offices`)
          return offices
        }
      }
    } catch (error) {
      console.error(`❌ ${endpoint.name} error:`, error)
      continue
    }
  }

  console.error(`🚨 All Econt offices endpoints failed for city: ${cityId}`)
  throw new Error("All endpoints failed or returned invalid responses")
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function parseXMLCities(xmlText: string): EcontCity[] {
  try {
    console.log("🔍 Parsing XML cities...")
    const cities: EcontCity[] = []

    // Try different XML parsing approaches
    const cityMatches = xmlText.match(/<e[^>]*>[\s\S]*?<\/e>/gi) || xmlText.match(/<city[^>]*>[\s\S]*?<\/city>/gi) || []
    console.log(`📊 Found ${cityMatches.length} city matches`)

    for (const cityMatch of cityMatches) {
      const idMatch = cityMatch.match(/<id[^>]*>(.*?)<\/id>/i)
      const nameMatch = cityMatch.match(/<name[^>]*>(.*?)<\/name>/i)
      const postCodeMatch =
        cityMatch.match(/<post_code[^>]*>(.*?)<\/post_code>/i) || cityMatch.match(/<postcode[^>]*>(.*?)<\/postcode>/i)

      if (idMatch && nameMatch) {
        cities.push({
          id: String(idMatch[1]).trim(),
          name: String(nameMatch[1]).trim(),
          postCode: String(postCodeMatch?.[1] || "").trim(),
          countryCode: "BGR",
        })
      }
    }

    console.log(`✅ Parsed ${cities.length} cities from XML`)
    return cities
  } catch (error) {
    console.error("❌ Error parsing XML cities:", error)
    return []
  }
}

function parseXMLOffices(xmlText: string): EcontOffice[] {
  try {
    console.log("🔍 Parsing XML offices...")
    const offices: EcontOffice[] = []

    const officeMatches =
      xmlText.match(/<e[^>]*>[\s\S]*?<\/e>/gi) || xmlText.match(/<office[^>]*>[\s\S]*?<\/office>/gi) || []
    console.log(`📊 Found ${officeMatches.length} office matches`)

    for (const officeMatch of officeMatches) {
      const idMatch = officeMatch.match(/<id[^>]*>(.*?)<\/id>/i)
      const nameMatch = officeMatch.match(/<name[^>]*>(.*?)<\/name>/i)
      const addressMatch = officeMatch.match(/<address[^>]*>(.*?)<\/address>/i)
      const phoneMatch = officeMatch.match(/<phone[^>]*>(.*?)<\/phone>/i)
      const workBeginMatch = officeMatch.match(/<work_begin[^>]*>(.*?)<\/work_begin>/i)
      const workEndMatch = officeMatch.match(/<work_end[^>]*>(.*?)<\/work_end>/i)

      if (idMatch && nameMatch) {
        offices.push({
          id: String(idMatch[1]).trim(),
          name: String(nameMatch[1]).trim(),
          address: String(addressMatch?.[1] || "").trim(),
          phone: String(phoneMatch?.[1] || "").trim(),
          workBegin: String(workBeginMatch?.[1] || "09:00").trim(),
          workEnd: String(workEndMatch?.[1] || "18:00").trim(),
        })
      }
    }

    console.log(`✅ Parsed ${offices.length} offices from XML`)
    return offices
  } catch (error) {
    console.error("❌ Error parsing XML offices:", error)
    return []
  }
}

function parseSOAPCities(xmlText: string): EcontCity[] {
  try {
    console.log("🔍 Parsing SOAP cities...")
    const cities: EcontCity[] = []

    // Parse SOAP response
    const cityMatches =
      xmlText.match(/<GetCitiesResult>[\s\S]*?<\/GetCitiesResult>/i) ||
      xmlText.match(/<city[^>]*>[\s\S]*?<\/city>/gi) ||
      []

    console.log(`📊 Found ${cityMatches.length} SOAP city matches`)

    for (const cityMatch of cityMatches) {
      const idMatch = cityMatch.match(/<(?:id|cityid)[^>]*>(.*?)<\/(?:id|cityid)>/i)
      const nameMatch = cityMatch.match(/<(?:name|cityname)[^>]*>(.*?)<\/(?:name|cityname)>/i)
      const postCodeMatch = cityMatch.match(/<(?:postcode|zip|post_code)[^>]*>(.*?)<\/(?:postcode|zip|post_code)>/i)

      if (idMatch && nameMatch) {
        cities.push({
          id: String(idMatch[1]).trim(),
          name: String(nameMatch[1]).trim(),
          postCode: String(postCodeMatch?.[1] || "").trim(),
          countryCode: "BGR",
        })
      }
    }

    console.log(`✅ Parsed ${cities.length} cities from SOAP`)
    return cities
  } catch (error) {
    console.error("❌ Error parsing SOAP cities:", error)
    return []
  }
}

function parseSOAPOffices(xmlText: string): EcontOffice[] {
  try {
    console.log("🔍 Parsing SOAP offices...")
    const offices: EcontOffice[] = []

    const officeMatches =
      xmlText.match(/<GetOfficesResult>[\s\S]*?<\/GetOfficesResult>/i) ||
      xmlText.match(/<office[^>]*>[\s\S]*?<\/office>/gi) ||
      []

    console.log(`📊 Found ${officeMatches.length} SOAP office matches`)

    for (const officeMatch of officeMatches) {
      const idMatch = officeMatch.match(/<(?:id|officeid)[^>]*>(.*?)<\/(?:id|officeid)>/i)
      const nameMatch = officeMatch.match(/<(?:name|officename)[^>]*>(.*?)<\/(?:name|officename)>/i)
      const addressMatch = officeMatch.match(/<(?:address|officeaddress)[^>]*>(.*?)<\/(?:address|officeaddress)>/i)
      const phoneMatch = officeMatch.match(/<(?:phone|officephone)[^>]*>(.*?)<\/(?:phone|officephone)>/i)

      if (idMatch && nameMatch && addressMatch) {
        offices.push({
          id: String(idMatch[1]).trim(),
          name: String(nameMatch[1]).trim(),
          address: String(addressMatch[1]).trim(),
          phone: String(phoneMatch?.[1] || "").trim(),
        })
      }
    }

    console.log(`✅ Parsed ${offices.length} offices from SOAP`)
    return offices
  } catch (error) {
    console.error("❌ Error parsing SOAP offices:", error)
    return []
  }
}
