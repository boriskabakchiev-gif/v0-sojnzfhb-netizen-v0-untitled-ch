"use client"

import Link from "next/link"
import { Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileCallButton() {
  return (
    <div className="mobile-call-button-container">
      <Button
        asChild
        variant="default"
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 md:hidden"
        aria-label="Обадете се сега"
      >
        <Link href="tel:+359894352204">
          <Phone className="h-6 w-6" />
        </Link>
      </Button>
    </div>
  )
}
