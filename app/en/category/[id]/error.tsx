"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertCircle, Home, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EnglishCategoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Category page error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex items-center justify-center p-4">
      <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-6">
          We encountered an error while loading this category. Please try again or return to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild variant="outline" className="flex items-center gap-2 bg-transparent">
            <Link href="/en">
              <Home className="h-4 w-4" />
              Go to homepage
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
