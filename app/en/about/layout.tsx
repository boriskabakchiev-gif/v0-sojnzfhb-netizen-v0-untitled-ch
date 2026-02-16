import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us | Madix Groundbaits",
  description:
    "Learn more about Madix's history, our values and commitment to quality. Manufacturing groundbaits and fishing bait since 1996.",
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
