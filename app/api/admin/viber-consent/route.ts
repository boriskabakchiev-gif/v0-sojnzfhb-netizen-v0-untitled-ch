import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

async function ensureConsentTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_viber_marketing_consent (
      phone_key TEXT PRIMARY KEY,
      phone TEXT NOT NULL,
      marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
      consent_recorded_at TIMESTAMPTZ,
      consent_note TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

export async function GET(request: NextRequest) {
  const year = Number(request.nextUrl.searchParams.get("year"))
  const currentYear = new Date().getFullYear()

  if (!Number.isInteger(year) || year < 2000 || year > currentYear) {
    return NextResponse.json({ error: "Невалидна година" }, { status: 400 })
  }

  try {
    await ensureConsentTable()
    const contacts = await sql`
      WITH order_contacts AS (
        SELECT
          REGEXP_REPLACE(COALESCE(customer_phone, ''), '[^0-9]', '', 'g') AS phone_key,
          MAX(NULLIF(BTRIM(customer_phone), '')) AS phone,
          MAX(NULLIF(BTRIM(customer_name), '')) AS name,
          MAX(NULLIF(BTRIM(customer_email), '')) AS email,
          COUNT(*)::int AS order_count,
          MAX(created_at) AS last_order_at
        FROM simple_orders
        WHERE created_at >= MAKE_DATE(${year}, 1, 1)
          AND created_at < MAKE_DATE(${year + 1}, 1, 1)
          AND LENGTH(REGEXP_REPLACE(COALESCE(customer_phone, ''), '[^0-9]', '', 'g')) BETWEEN 7 AND 15
        GROUP BY 1
      )
      SELECT
        order_contacts.phone_key AS "phoneKey",
        order_contacts.phone,
        order_contacts.name,
        order_contacts.email,
        order_contacts.order_count AS "orderCount",
        order_contacts.last_order_at AS "lastOrderAt",
        COALESCE(consent.marketing_opt_in, FALSE) AS "marketingOptIn",
        consent.consent_recorded_at AS "consentRecordedAt",
        consent.consent_note AS "consentNote"
      FROM order_contacts
      LEFT JOIN admin_viber_marketing_consent AS consent
        ON consent.phone_key = order_contacts.phone_key
      ORDER BY order_contacts.name NULLS LAST, order_contacts.phone
    `

    return NextResponse.json({ contacts, count: contacts.length, year })
  } catch (error) {
    console.error("Error loading Viber consent contacts:", error)
    return NextResponse.json({ error: "Грешка при зареждане на контактите" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const year = Number(body.year)
    const currentYear = new Date().getFullYear()
    const optedIn = body.optedIn
    const rawPhoneKeys = body.phoneKeys
    const consentNote = typeof body.consentNote === "string" ? body.consentNote.trim() : ""

    if (!Number.isInteger(year) || year < 2000 || year > currentYear) {
      return NextResponse.json({ error: "Невалидна година" }, { status: 400 })
    }
    if (typeof optedIn !== "boolean" || !Array.isArray(rawPhoneKeys) || rawPhoneKeys.length === 0 || rawPhoneKeys.length > 500) {
      return NextResponse.json({ error: "Невалиден списък с контакти" }, { status: 400 })
    }
    if (optedIn && (!consentNote || consentNote.length > 500)) {
      return NextResponse.json({ error: "Посочете източник или основание за съгласието (до 500 знака)" }, { status: 400 })
    }

    const phoneKeys = [...new Set(rawPhoneKeys.map((value: unknown) => String(value).replace(/\D/g, "")))]
    if (phoneKeys.some((phoneKey) => phoneKey.length < 7 || phoneKey.length > 15)) {
      return NextResponse.json({ error: "Невалиден телефонен номер" }, { status: 400 })
    }

    await ensureConsentTable()
    const updated = await sql`
      WITH order_contacts AS (
        SELECT
          REGEXP_REPLACE(COALESCE(customer_phone, ''), '[^0-9]', '', 'g') AS phone_key,
          MAX(NULLIF(BTRIM(customer_phone), '')) AS phone
        FROM simple_orders
        WHERE created_at >= MAKE_DATE(${year}, 1, 1)
          AND created_at < MAKE_DATE(${year + 1}, 1, 1)
          AND LENGTH(REGEXP_REPLACE(COALESCE(customer_phone, ''), '[^0-9]', '', 'g')) BETWEEN 7 AND 15
        GROUP BY 1
      ),
      selected AS (
        SELECT jsonb_array_elements_text(${JSON.stringify(phoneKeys)}::jsonb) AS phone_key
      ),
      saved AS (
        INSERT INTO admin_viber_marketing_consent (
          phone_key, phone, marketing_opt_in, consent_recorded_at, consent_note, updated_at
        )
        SELECT
          order_contacts.phone_key,
          order_contacts.phone,
          ${optedIn},
          CASE WHEN ${optedIn} THEN NOW() ELSE NULL END,
          ${consentNote || "Съгласието е оттеглено от администратор"},
          NOW()
        FROM order_contacts
        INNER JOIN selected ON selected.phone_key = order_contacts.phone_key
        ON CONFLICT (phone_key) DO UPDATE SET
          phone = EXCLUDED.phone,
          marketing_opt_in = EXCLUDED.marketing_opt_in,
          consent_recorded_at = EXCLUDED.consent_recorded_at,
          consent_note = EXCLUDED.consent_note,
          updated_at = NOW()
        RETURNING phone_key
      )
      SELECT COUNT(*)::int AS "updatedCount" FROM saved
    `

    return NextResponse.json({ success: true, updatedCount: updated[0]?.updatedCount ?? 0 })
  } catch (error) {
    console.error("Error updating Viber marketing consent:", error)
    return NextResponse.json({ error: "Грешка при записване на съгласието" }, { status: 500 })
  }
}
