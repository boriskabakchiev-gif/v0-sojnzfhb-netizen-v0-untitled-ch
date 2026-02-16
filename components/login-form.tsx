"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, Clock } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [pendingMessage, setPendingMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
    if (isPending) setIsPending(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.phone || !formData.password) {
      setError("Моля, попълнете всички полета")
      return
    }

    setIsLoading(true)
    setError(null)
    setIsPending(false)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formData.phone,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.pending) {
          setIsPending(true)
          setPendingMessage(data.message || "Моля, изчакайте одобрение от администратор.")
          return
        }
        throw new Error(data.error || "Възникна грешка при входа")
      }

      // Запазваме токена в cookie
      document.cookie = `auth_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days

      toast({
        title: "Успешен вход",
        description: "Добре дошли отново!",
      })

      // Пренасочване към акаунт страницата
      window.location.href = "/account/dashboard"
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Възникна грешка при входа")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Вход</CardTitle>
        <CardDescription>Влезте във вашия акаунт</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Грешка</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isPending && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Изчакайте одобрение</AlertTitle>
            <AlertDescription className="text-yellow-700">{pendingMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="phone">Телефонен номер</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Въведете телефонен номер"
              disabled={isLoading}
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Използвайте телефонния номер, с който сте се регистрирали
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Парола</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Въведете парола"
              disabled={isLoading}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Вход...
              </>
            ) : (
              "Вход"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm text-muted-foreground">
        Нямате акаунт?{" "}
        <a href="/auth?tab=register" className="text-primary hover:underline">
          Регистрирайте се тук
        </a>
      </CardFooter>
    </Card>
  )
}
