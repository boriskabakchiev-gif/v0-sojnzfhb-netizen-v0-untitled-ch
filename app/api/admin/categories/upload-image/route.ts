import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "Няма избран файл" }, { status: 400 })
    }

    // Проверяваме размера на файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Файлът е твърде голям. Максимален размер: 5MB" },
        { status: 400 },
      )
    }

    // Проверяваме типа на файла
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "Моля, изберете валиден файл с изображение" }, { status: 400 })
    }

    // Генерираме уникално име за файла
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop() || "jpg"
    const fileName = `categories/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`

    // Качваме файла в Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
    })

    console.log("Файлът беше качен успешно:", blob.url)

    return NextResponse.json({
      success: true,
      url: blob.url,
      message: "Снимката беше качена успешно",
    })
  } catch (error) {
    console.error("Грешка при качване на снимката:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Грешка при качване на снимката",
        details: error instanceof Error ? error.message : "Неизвестна грешка",
      },
      { status: 500 },
    )
  }
}
