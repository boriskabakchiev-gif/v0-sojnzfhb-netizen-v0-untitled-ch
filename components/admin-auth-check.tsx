"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Shield } from "lucide-react"

interface AdminAuthCheckProps {
  children: React.ReactNode
}

export function AdminAuthCheck({ children }: AdminAuthCheckProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth check on login page
    if (pathname === "/admin/login") {
      setIsLoading(false)
      setIsAuthenticated(true)
      return
    }

    const checkAuth = () => {
      try {
        const adminSession = localStorage.getItem("adminSession")

        if (!adminSession) {
          console.log("No admin session found, redirecting to login")
          router.push("/admin/login")
          return
        }

        const session = JSON.parse(adminSession)

        if (!session || !session.isLoggedIn || session.role !== "admin") {
          console.log("Invalid session, redirecting to login")
          localStorage.removeItem("adminSession")
          router.push("/admin/login")
          return
        }

        // Check if session is expired (24 hours)
        const sessionTime = session.time
        const currentTime = new Date().getTime()
        const timeDiff = currentTime - sessionTime

        if (timeDiff >= 24 * 60 * 60 * 1000) {
          console.log("Session expired, redirecting to login")
          localStorage.removeItem("adminSession")
          router.push("/admin/login")
          return
        }

        // Valid session
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Auth check error:", error)
        localStorage.removeItem("adminSession")
        router.push("/admin/login")
      } finally {
        setIsLoading(false)
      }
    }

    // Use a small timeout to ensure client-side execution
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Shield className="h-12 w-12 text-red-500 animate-pulse mb-4" />
          <h2 className="text-xl font-medium text-white">Проверка на достъпа...</h2>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
