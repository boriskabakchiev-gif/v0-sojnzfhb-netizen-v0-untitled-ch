"use server"

import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get("file") as File

    if (!file || file.size === 0) {
      return { success: false, error: "No file provided" }
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: "Невалиден тип файл. Моля, качете JPEG, PNG, WebP или GIF изображение.",
      }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "Файлът е твърде голям. Максималният размер е 5MB.",
      }
    }

    // Generate a unique filename with a clean name
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, "-").toLowerCase()
    const filename = `${timestamp}-${originalName}`

    console.log(`Качване на файл: ${filename} (${file.size} байта, ${file.type})`)

    // Upload to Vercel Blob
    const blob = await put(`products/${filename}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true, // Add a random suffix to ensure uniqueness
    })

    console.log("Файлът е качен успешно:", blob.url)

    // Revalidate the products page to show the new image
    revalidatePath("/admin/products")

    return {
      success: true,
      url: blob.url,
      filename: blob.pathname,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    return {
      success: false,
      error: `Error uploading file: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
