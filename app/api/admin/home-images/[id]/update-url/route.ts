import { NextResponse } from "next/server"
import { updateHomePageImageUrl } from "@/lib/db"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id, 10)
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid image ID" }, { status: 400 })
  }

  try {
    const { newUrl } = await request.json()
    if (!newUrl) {
      return NextResponse.json({ error: "New URL is required" }, { status: 400 })
    }

    const result = await updateHomePageImageUrl(id, newUrl)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: `Failed to update URL: ${errorMessage}` }, { status: 500 })
  }
}
