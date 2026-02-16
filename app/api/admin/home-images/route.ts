import { NextResponse } from "next/server"
import { getHomePageImages } from "@/lib/db"

export async function GET() {
  try {
    const images = await getHomePageImages()
    return NextResponse.json(images)
  } catch (error) {
    console.error("Failed to fetch home page images:", error)
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
  }
}
