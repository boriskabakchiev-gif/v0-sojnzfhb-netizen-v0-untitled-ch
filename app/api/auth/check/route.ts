import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth" // Използваме getUser от сървърната част

export async function GET() {
  try {
    const user = await getUser()

    if (user) {
      // Ако има потребител, връщаме данните му
      return NextResponse.json({ isAuthenticated: true, user })
    } else {
      // Ако няма, връщаме null
      return NextResponse.json({ isAuthenticated: false, user: null })
    }
  } catch (error) {
    console.error("Error in /api/auth/check:", error)
    return NextResponse.json({ isAuthenticated: false, user: null, error: "Internal server error" }, { status: 500 })
  }
}
