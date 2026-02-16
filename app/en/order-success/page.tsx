"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, ShoppingBag, Home, Phone, Mail } from "lucide-react"
import Link from "next/link"

export default function OrderSuccessPageEN() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const orderIdFromUrl = searchParams.get("orderId")
    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl)
    } else {
      // If no order ID, redirect to home after a short delay
      setTimeout(() => {
        router.push("/en")
      }, 3000)
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your trust!</p>
        </div>

        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Order Number:</p>
            <p className="text-xl font-bold text-gray-800">{orderId}</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center text-gray-700">
            <Phone className="h-5 w-5 mr-2 text-blue-500" />
            <span className="text-sm">We will contact you soon</span>
          </div>
          <div className="flex items-center justify-center text-gray-700">
            <Mail className="h-5 w-5 mr-2 text-blue-500" />
            <span className="text-sm">Check your email for confirmation</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full bg-red-500 hover:bg-red-600 text-white">
            <Link href="/en">
              <Home className="h-4 w-4 mr-2" />
              Back to Homepage
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/en">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            For questions contact us at{" "}
            <a href="tel:+359888123456" className="text-blue-600 hover:underline">
              +359 888 123 456
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
