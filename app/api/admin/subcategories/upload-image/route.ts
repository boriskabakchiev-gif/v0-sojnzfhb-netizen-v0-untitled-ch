import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    console.log("Upload image API called")

    const formData = await request.formData()
    const file = formData.get("file") as File
    const subcategoryId = formData.get("subcategoryId") as string

    console.log("File:", file?.name, "Size:", file?.size)
    console.log("Subcategory ID:", subcategoryId)

    if (!file) {
      return NextResponse.json({ success: false, error: "Няма избран файл" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "Файлът трябва да бъде изображение" }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Файлът е твърде голям. Максимален размер: 5MB" },
        { status: 400 },
      )
    }

    // Upload to Vercel Blob
    console.log("Uploading to Vercel Blob...")
    const blob = await put(file.name, file, {
      access: "public",
    })

    console.log("Blob uploaded:", blob.url)

    // Update database if subcategoryId is provided
    if (subcategoryId) {
      console.log("Updating database with new image URL...")

      const updateResult = await sql.query(
        'UPDATE subcategories SET photourl = $1, updatedat = NOW() WHERE "Document ID" = $2',
        [blob.url, subcategoryId],
      )

      console.log("Database update result:", updateResult)

      if (updateResult.rowCount === 0) {
        console.warn("No rows updated - subcategory might not exist")
      }
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
      message: "Снимката беше качена успешно",
    })
  } catch (error) {
    console.error("Error in upload-image API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Грешка при качване на снимката",
      },
      { status: 500 },
    )
  }
}
