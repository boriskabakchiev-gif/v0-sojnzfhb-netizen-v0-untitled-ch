import type React from "react"
import { Inter } from "next/font/google"
import "../globals.css"
import { Sidebar } from "./sidebar"
import { AdminNotificationBanner } from "@/components/admin-notification-banner"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Админ панел | Риболовен магазин",
  description: "Админ панел за управление на риболовен магазин",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body className={`${inter.className} bg-white text-black min-h-screen`}>
        <AdminNotificationBanner />
        <div className="flex min-h-screen">
          <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden md:block">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-black">Админ панел</h1>
            </div>
            <Sidebar items={[]} />
          </aside>
          <main className="flex-1 p-6 bg-white pt-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
