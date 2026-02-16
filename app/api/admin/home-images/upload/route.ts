import { NextResponse } from "next/server"
import { put, type PutBlobResult } from "@vercel/blob"
import { addHomePageImage } from "@/lib/db"
import { nanoid } from "nanoid"

export async function POST(request: Request): Promise<NextResponse> {
  // 1. Вземане на файла от заявката
  let file: File
  let filename: string
  try {
    const formData = await request.formData()
    const fileFromForm = formData.get("file") as File | null

    if (!fileFromForm) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 })
    }
    file = fileFromForm
    // Генериране на уникално име на файла, за да се избегнат презаписвания
    filename = `${nanoid(10)}-${file.name.replace(/\s/g, "-")}`
  } catch (parseError) {
    console.error("Error parsing form data:", parseError)
    return NextResponse.json({ error: "Failed to parse request body." }, { status: 400 })
  }

  // 2. Качване на файла в Vercel Blob
  let blob: PutBlobResult
  try {
    blob = await put(filename, file, {
      access: "public",
    })
  } catch (uploadError) {
    console.error("Error uploading to Vercel Blob:", uploadError)
    const errorMessage = uploadError instanceof Error ? uploadError.message : "Unknown upload error"
    return NextResponse.json({ error: `File upload failed: ${errorMessage}` }, { status: 500 })
  }

  // 3. Запис на URL адреса в базата данни
  try {
    const dbResult = await addHomePageImage(blob.url)
    if (!dbResult.success) {
      console.error("Database error:", dbResult.error)
      return NextResponse.json(
        { success: false, error: dbResult.error || "Database operation failed." },
        { status: 500 },
      )
    }
    return NextResponse.json({ success: true, imageUrl: blob.url, data: dbResult.data })
  } catch (dbError) {
    console.error("Error saving to database:", dbError)
    return NextResponse.json({ error: "Failed to save image URL to database." }, { status: 500 })
  }
}
