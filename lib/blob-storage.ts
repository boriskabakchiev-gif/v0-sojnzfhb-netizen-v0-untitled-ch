import { put, del, list } from "@vercel/blob"
import { nanoid } from "nanoid"
// Assuming you might have a db import here if updateProductImageUrl interacts with a DB
// import { sql } from "@/lib/db"; // Example, adjust if your db setup is different

// Функция за качване на изображение в Blob Store
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  try {
    // Генерираме уникално име за файла
    const filename = `product-${productId}-${nanoid(6)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`

    // Качваме файла в Blob Store
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false, // Important: if you want predictable URLs based on filename
    })

    console.log(`Uploaded product image to Blob Store: ${blob.url}`)
    return blob.url
  } catch (error) {
    console.error("Error uploading product image to Blob Store:", error)
    throw new Error("Failed to upload product image")
  }
}

// Функция за изтриване на изображение от Blob Store
export async function deleteProductImage(url: string): Promise<void> {
  try {
    await del(url)
    console.log(`Deleted product image from Blob Store: ${url}`)
  } catch (error) {
    console.error("Error deleting product image from Blob Store:", error)
    throw new Error("Failed to delete product image")
  }
}

// Функция за получаване на списък с всички изображения на продукт
export async function getProductImages(productId: string): Promise<string[]> {
  try {
    const { blobs } = await list({ prefix: `product-${productId}` })
    return blobs.map((blob) => blob.url)
  } catch (error) {
    console.error("Error listing product images from Blob Store:", error)
    return []
  }
}

// Функция за обновяване на URL на изображение в базата данни
// Уверете се, че имате правилна настройка за връзка с базата данни тук.
// Този пример предполага, че имате @/lib/db с експортиран sql клиент.
export async function updateProductImageUrl(productId: string, imageUrl: string): Promise<boolean> {
  try {
    // const { sql } = await import("@/lib/db") // Adjust this import based on your actual DB setup
    // await sql.query(
    //   `
    //   UPDATE new_products
    //   SET photourl = $1
    //   WHERE objectid = $2
    //   `,
    //   [imageUrl, productId],
    // );
    console.log(`Mock DB Update: Product ${productId} with new image URL: ${imageUrl}`) // Current mock
    // Замени горния console.log с реалната логика за обновяване на базата данни.
    return true
  } catch (error) {
    console.error(`Error updating product ${productId} image URL:`, error)
    return false
  }
}
