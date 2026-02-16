import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us | Madix Groundbaits",
  description:
    "Contact Madix Groundbaits for questions about our fishing products. Phone: +359 894 352204, Email: info@madiks.bg",
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
