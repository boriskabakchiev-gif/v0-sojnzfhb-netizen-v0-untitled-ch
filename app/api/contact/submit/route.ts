import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

interface ContactFormData {
  name?: string
  email: string
  subject?: string
  message: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, subject, message }: ContactFormData = body

    if (!email || !message) {
      return NextResponse.json({ error: "Имейл и съобщение са задължителни полета." }, { status: 400 })
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Невалиден имейл адрес." }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO contact_inquiries (name, email, subject, message, status)
      VALUES (${name || null}, ${email}, ${subject || null}, ${message}, 'new')
      RETURNING id, created_at;
    `

    if (!result || result.length === 0 || !result[0].id) {
      console.error("API: /api/contact/submit - Failed to insert inquiry into database. Result:", result)
      throw new Error("Неуспешно записване на запитването в базата данни")
    }

    const inquiryId = result[0].id
    console.log("API: /api/contact/submit - Inquiry submitted successfully:", { inquiryId, email })

    return NextResponse.json({
      success: true,
      inquiryId: inquiryId,
      message: "Вашето запитване беше изпратено успешно!",
      timestamp: result[0].created_at,
    })
  } catch (error: any) {
    console.error("API: /api/contact/submit - Critical error:", error)
    let errorMessage = "Възникна грешка при изпращането на вашето запитване."
    if (error.message) {
      errorMessage += ` Детайли: ${error.message}`
    }
    return NextResponse.json({ error: errorMessage, details: error.stack }, { status: 500 })
  }
}
