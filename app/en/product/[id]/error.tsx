"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Product page error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">Something went wrong!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            We encountered an error while loading this product. This might be a temporary issue.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800 font-mono">{error.message}</p>
              {error.digest && <p className="text-xs text-red-600 mt-1">Error ID: {error.digest}</p>}
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/en">
                <Home className="h-4 w-4 mr-2" />
                Go to homepage
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              If the problem persists, please{" "}
              <Link href="/en/contact" className="text-blue-600 hover:text-blue-800 underline">
                contact support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
