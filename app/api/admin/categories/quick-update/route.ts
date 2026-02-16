import { NextResponse } from "next/server"
import { quickUpdateCategory } from "@/lib/actions"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const result = await quickUpdateCategory(formData)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in quick update category API route:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update category: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    )
  }
}
