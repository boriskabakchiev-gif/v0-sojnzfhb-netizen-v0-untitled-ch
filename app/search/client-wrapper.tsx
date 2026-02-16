"use client"

import { CartIcon } from "@/components/cart-icon"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Search } from "lucide-react"

interface ClientWrapperProps {
  query: string
}

export function ClientWrapper({ query }: ClientWrapperProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="hidden md:block">
        <form action="/search" className="relative">
          <input
            type="text"
            name="q"
            placeholder="Търсене..."
            defaultValue={query}
            className="w-full px-4 py-2 pl-10 rounded-md bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Button type="submit" className="absolute right-1 top-1 bg-red-600 hover:bg-red-700 py-1 px-3 text-sm">
            Търси
          </Button>
        </form>
      </div>
      <CartIcon />
      <Button asChild className="hidden md:flex bg-red-600 hover:bg-red-700">
        <Link href="/account">Вход</Link>
      </Button>
    </div>
  )
}
