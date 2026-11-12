import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

const MAX_RECIPIENTS = 500
const MAX_MESSAGE_LENGTH = 10_000

interface InfobipMessageStatus {
  status?: { name?: string }
}

function getInfobipConfig() {
  const baseUrlValue = process.env.INFOBIP_BASE_URL?.trim()
  const apiKey = process.env.INFOBIP_API_KEY?.trim()
  const sender = process.env.INFOBIP_VIBER_SENDER?.trim()
  const missing: string[] = []

  if (!baseUrlValue) missing.push("INFOBIP_BASE_URL")
  if (!apiKey) missing.push("INFOBIP_API_KEY")
  if (!sender) missing.push("INFOBIP_VIBER_SENDER")
  if (missing.length > 0) return { config: null, missing }

  try {
    const parsedBaseUrl = new URL(
      baseUrlValue!.startsWith("https://") ? baseUrlValue! : `https://${baseUrlValue}`,
    )
    const isInfobipHost =
      parsedBaseUrl.hostname === "api.infobip.com" || parsedBaseUrl.hostname.endsWith(".api.infobip.com")

    if (
      parsedBaseUrl.protocol !== "https:" ||
      !isInfobipHost ||
      parsedBaseUrl.username ||
      parsedBaseUrl.password ||
      (parsedBaseUrl.pathname !== "/" && parsedBaseUrl.pathname !== "")
    ) {
      return { config: null, missing: ["INFOBIP_BASE_URL (use your HTTPS Infobip API host)"] }
    }

    return {
      config: { baseUrl: parsedBaseUrl.origin, apiKey: apiKey!, sender: sender! },
      missing: [],
    }
  } catch {
    return { config: null, missing: ["INFOBIP_BASE_URL (invalid URL)"] }
  }
}

export async function GET() {
  const { config, missing } = getInfobipConfig()
  return NextResponse.json({ provider: "Infobip", configured: Boolean(config), missing })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Невалидна заявка" }, { status: 400 })
  }

  const year = Number(body.year)
  const currentYear = new Date().getFullYear()
  const campaignName = typeof body.campaignName === "string" ? body.campaignName.trim() : ""
  const message = typeof body.message === "string" ? body.message.trim() : ""

  if (!Number.isInteger(year) || year < 2000 || year > currentYear) {
    return NextResponse.json({ error: "Невалидна година на аудиторията" }, { status: 400 })
  }
  if (!campaignName || campaignName.length > 100) {
    return NextResponse.json({ error: "Добавете име на кампанията (до 100 знака)" }, { status: 400 })
  }
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `Съобщението трябва да е до ${MAX_MESSAGE_LENGTH} знака` }, { status: 400 })
  }

  const { config, missing } = getInfobipConfig()
  if (!config) {
    return NextResponse.json(
      { error: "Infobip не е конфигуриран за изпращане.", missing },
      { status: 503 },
    )
  }

  try {
    const recipients = await sql`
      WITH order_contacts AS (
        SELECT REGEXP_REPLACE(COALESCE(customer_phone, ''), '[^0-9]', '', 'g') AS phone_key
        FROM simple_orders
        WHERE created_at >= MAKE_DATE(${year}, 1, 1)
          AND created_at < MAKE_DATE(${year + 1}, 1, 1)
          AND LENGTH(REGEXP_REPLACE(COALESCE(customer_phone, ''), '[^0-9]', '', 'g')) BETWEEN 7 AND 15
        GROUP BY 1
      )
      SELECT order_contacts.phone_key AS "phoneKey"
      FROM order_contacts
      INNER JOIN admin_viber_marketing_consent AS consent
        ON consent.phone_key = order_contacts.phone_key
      WHERE consent.marketing_opt_in = TRUE
      ORDER BY order_contacts.phone_key
      LIMIT ${MAX_RECIPIENTS + 1}
    `

    if (recipients.length === 0) {
      return NextResponse.json({ error: "Няма съгласили се получатели за избраната година." }, { status: 400 })
    }
    if (recipients.length > MAX_RECIPIENTS) {
      return NextResponse.json(
        { error: `Аудиторията надвишава лимита от ${MAX_RECIPIENTS}. Намалете списъка и изпратете отделни кампании.` },
        { status: 400 },
      )
    }

    const infobipResponse = await fetch(`${config.baseUrl}/viber/2/messages`, {
      method: "POST",
      headers: {
        Authorization: `App ${config.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            sender: config.sender,
            destinations: recipients.map((recipient) => ({ to: recipient.phoneKey })),
            content: { text: message, type: "TEXT" },
          },
        ],
      }),
      signal: AbortSignal.timeout(60_000),
      cache: "no-store",
    })

    const providerData = await infobipResponse.json().catch(() => null)
    if (!infobipResponse.ok) {
      return NextResponse.json(
        {
          error: `Infobip rejected the campaign (HTTP ${infobipResponse.status}). Check the sender, Viber service approval, and API permissions in Infobip.`,
        },
        { status: 502 },
      )
    }

    const messages = Array.isArray(providerData?.messages)
      ? (providerData.messages as InfobipMessageStatus[])
      : []
    const statusCounts = messages.reduce<Record<string, number>>((counts, item) => {
      const status = item.status?.name || "UNKNOWN"
      counts[status] = (counts[status] || 0) + 1
      return counts
    }, {})

    return NextResponse.json({
      success: true,
      campaignName,
      bulkId: typeof providerData?.bulkId === "string" ? providerData.bulkId : null,
      submittedCount: messages.length || recipients.length,
      statusCounts,
    })
  } catch {
    return NextResponse.json(
      { error: "Изпращането не получи потвърждение от Infobip. Проверете статуса в Infobip преди повторен опит, за да избегнете дублиране." },
      { status: 502 },
    )
  }
}
