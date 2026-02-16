import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Проверяваме наличието на важни променливи на средата
    const envVars = {
      DATABASE_URL: Boolean(process.env.DATABASE_URL),
      POSTGRES_URL: Boolean(process.env.POSTGRES_URL),
      POSTGRES_PRISMA_URL: Boolean(process.env.POSTGRES_PRISMA_URL),
      POSTGRES_URL_NON_POOLING: Boolean(process.env.POSTGRES_URL_NON_POOLING),
      POSTGRES_USER: Boolean(process.env.POSTGRES_USER),
      POSTGRES_HOST: Boolean(process.env.POSTGRES_HOST),
      POSTGRES_PASSWORD: Boolean(process.env.POSTGRES_PASSWORD),
      POSTGRES_DATABASE: Boolean(process.env.POSTGRES_DATABASE),
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_VERCEL_URL: Boolean(process.env.NEXT_PUBLIC_VERCEL_URL), // Добавена проверка за VERCEL_URL
    }

    return NextResponse.json(envVars)
  } catch (error: any) {
    console.error("Error checking environment variables:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to check environment variables",
      },
      { status: 500 },
    )
  }
}
