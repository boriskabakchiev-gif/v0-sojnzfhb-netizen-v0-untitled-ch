import { NextResponse } from "next/server"
import { testDatabaseConnection } from "@/lib/actions"

export async function GET() {
  try {
    const result = await testDatabaseConnection()

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Неуспешна връзка с базата данни",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in test-db API route:", error)

    // Ensure we always return a properly formatted JSON object
    return NextResponse.json(
      {
        success: false,
        error:
          "Грешка при тестване на връзката с базата данни: " +
          (error instanceof Error ? error.message : "Неизвестна грешка"),
      },
      { status: 500 },
    )
  }
}
