import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = cookies()

    // Изтриваме auth_token бисквитката
    cookieStore.delete("auth_token")

    return NextResponse.json({
      success: true,
      message: "Успешен изход",
    })
  } catch (error) {
    console.error("Грешка при изход:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Грешка при изход",
      },
      { status: 500 },
    )
  }
}
