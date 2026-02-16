import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET() {
  try {
    // Получаваме информация за текущия потребител
    const user = await getUser()
    const isUserLoggedIn = !!user

    // Проверяваме дали потребителят е европейски
    const isEuropeanCustomer =
      user?.customerType === "european" ||
      user?.customerType === "European" ||
      user?.customerType === "europen" ||
      user?.customerType === "Europen"

    // Връщаме информацията като JSON отговор, без да правим заявка към базата данни
    return NextResponse.json({
      user: {
        isLoggedIn: isUserLoggedIn,
        id: user?.id || null,
        name: user?.name || null,
        customerType: user?.customerType || null,
        isEuropeanCustomer,
      },
      message: "Информация за европейските цени (без данни от базата)",
    })
  } catch (error) {
    console.error("Error in debug-european-prices:", error)
    return NextResponse.json(
      {
        error: "Възникна грешка при извличане на информацията",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
