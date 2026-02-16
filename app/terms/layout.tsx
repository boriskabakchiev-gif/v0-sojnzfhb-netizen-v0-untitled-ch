import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Общи условия | МАДИКС",
  description:
    "Общи условия за ползване на онлайн магазина на МАДИКС ЕООД - условия за поръчки, доставка, плащания и гаранции.",
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
