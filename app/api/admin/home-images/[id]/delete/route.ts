import { NextResponse } from "next/server"
import { deleteHomePageImage } from "@/lib/db"
import { del } from "@vercel/blob"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id, 10)
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid image ID" }, { status: 400 })
  }

  try {
    const { url } = await request.json()
    if (!url) {
      return NextResponse.json({ error: "Image URL is required for deletion from blob storage." }, { status: 400 })
    }

    // Първо изтриваме от blob storage
    await del(url)

    // След това изтриваме от базата данни
    const result = await deleteHomePageImage(id)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: `Failed to delete image: ${errorMessage}` }, { status: 500 })
  }
}
