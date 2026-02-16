"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Category page error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">Грешка при зареждане на категорията</h1>
        <p className="mb-6">Възникна проблем при зареждане на данните за тази категория.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => reset()} className="bg-blue-600 hover:bg-blue-700 text-white">
            Опитай отново
          </Button>
          <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
            <Link href="/">Към началната страница</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
