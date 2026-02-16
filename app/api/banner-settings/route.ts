import { NextResponse } from "next/server"
import { getBannerSettings } from "@/lib/db"

export async function GET() {
  try {
    const settings = await getBannerSettings()
    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        start_date: "23.12.2025",
        end_date: "04.01.2026",
        message: "От {start_date} до {end_date} няма да приемаме заявки!",
        is_visible: false,
      })
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Failed to fetch banner settings:", error)
    return NextResponse.json({ error: "Failed to fetch banner settings" }, { status: 500 })
  }
}
