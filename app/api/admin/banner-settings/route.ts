import { NextResponse } from "next/server"
import { getBannerSettings, updateBannerSettings, toggleBannerVisibility } from "@/lib/db"

export async function GET() {
  try {
    const settings = await getBannerSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Failed to fetch banner settings:", error)
    return NextResponse.json({ error: "Failed to fetch banner settings" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { start_date, end_date, message, is_visible } = body

    if (!start_date || !end_date || !message || typeof is_visible !== "boolean") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await updateBannerSettings({ start_date, end_date, message, is_visible })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error("Failed to update banner settings:", error)
    return NextResponse.json({ error: "Failed to update banner settings" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { is_visible } = body

    if (typeof is_visible !== "boolean") {
      return NextResponse.json({ error: "is_visible must be a boolean" }, { status: 400 })
    }

    const result = await toggleBannerVisibility(is_visible)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to toggle banner visibility:", error)
    return NextResponse.json({ error: "Failed to toggle banner visibility" }, { status: 500 })
  }
}
