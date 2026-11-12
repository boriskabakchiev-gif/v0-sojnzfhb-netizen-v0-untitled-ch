import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  const yearParam = request.nextUrl.searchParams.get("year")
  const year = Number(yearParam)
  const unregisteredOnly = request.nextUrl.searchParams.get("unregisteredOnly") === "true"
  const currentYear = new Date().getFullYear()

  if (!Number.isInteger(year) || year < 2000 || year > currentYear) {
    return NextResponse.json({ error: "Невалидна година" }, { status: 400 })
  }

  try {
    const customers = await sql`
      WITH order_contacts AS (
        SELECT
          COALESCE(
            NULLIF(LOWER(BTRIM(customer_phone)), ''),
            NULLIF(LOWER(BTRIM(customer_email)), ''),
            NULLIF(LOWER(BTRIM(customer_name)), '')
          ) AS customer_key,
          MAX(NULLIF(BTRIM(customer_name), '')) AS name,
          MAX(NULLIF(BTRIM(customer_email), '')) AS email,
          MAX(NULLIF(BTRIM(customer_phone), '')) AS phone,
          COUNT(*)::int AS order_count,
          MAX(created_at) AS last_order_at
        FROM simple_orders
        WHERE created_at >= MAKE_DATE(${year}, 1, 1)
          AND created_at < MAKE_DATE(${year + 1}, 1, 1)
          AND (
            NULLIF(BTRIM(customer_phone), '') IS NOT NULL
            OR NULLIF(BTRIM(customer_email), '') IS NOT NULL
            OR NULLIF(BTRIM(customer_name), '') IS NOT NULL
          )
        GROUP BY 1
      )
      SELECT
        contact.name,
        contact.email,
        contact.phone,
        contact.order_count AS "orderCount",
        contact.last_order_at AS "lastOrderAt"
      FROM order_contacts AS contact
      WHERE ${!unregisteredOnly} OR NOT EXISTS (
        SELECT 1
        FROM customers AS customer
        WHERE (customer.deleted = FALSE OR customer.deleted IS NULL)
          AND (
            (contact.email IS NOT NULL AND LOWER(BTRIM(customer.objectid)) = LOWER(BTRIM(contact.email)))
            OR (contact.phone IS NOT NULL AND LOWER(BTRIM(customer.phone)) = LOWER(BTRIM(contact.phone)))
            OR (contact.email IS NOT NULL AND LOWER(BTRIM(customer.phone)) = LOWER(BTRIM(contact.email)))
            OR (contact.phone IS NOT NULL AND LOWER(BTRIM(customer.objectid)) = LOWER(BTRIM(contact.phone)))
          )
      )
      ORDER BY contact.name NULLS LAST, contact.phone NULLS LAST
    `

    return NextResponse.json({ customers, count: customers.length, year, unregisteredOnly })
  } catch (error) {
    console.error("Error exporting order customers:", error)
    return NextResponse.json({ error: "Грешка при генериране на експорта" }, { status: 500 })
  }
}
