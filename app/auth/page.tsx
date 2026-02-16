import { LoginForm } from "@/components/login-form"
// import { RegisterForm } from "@/components/register-form" // Премахваме RegisterForm
import { Suspense } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function AuthPage({ searchParams }: { searchParams: { tab?: string } }) {
  // Тъй като вече няма таб за регистрация тук, defaultTab винаги ще е 'login'
  // или можем да премахнем логиката за табове изцяло, ако остава само логин.
  // Засега ще запазя структурата с Tabs, но само с един таб.

  return (
    <div className="container flex min-h-screen w-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <Card className="shadow-xl dark:bg-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Вход в системата</CardTitle>
            <CardDescription>Въведете вашите данни за достъп.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Suspense fallback={<div className="text-center p-4">Зареждане на формата за вход...</div>}>
              <LoginForm />
            </Suspense>
            <div className="mt-6 text-center text-sm">
              Нямате акаунт?{" "}
              <Link href="/account" className="font-medium text-yellow-600 hover:text-yellow-500">
                Регистрирайте се тук
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
