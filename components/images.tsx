"use client"

import type React from "react"
import Image from "next/image"

// Компонент за изображение на категория с резервен вариант
export function CategoryImage({
  src,
  alt,
  fallback,
}: {
  src: string
  alt: string
  fallback: React.ReactNode
}) {
  return (
    <>
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <Image src={src || "/placeholder.svg"} alt={alt} fill className="object-cover" />
      </div>
      <div className="category-fallback absolute inset-0 hidden items-center justify-center bg-gray-100 z-10">
        <div className="bg-gray-200 p-4 rounded-full">{fallback}</div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-white/60 to-transparent z-20"></div>
    </>
  )
}

// Компонент за изображение на подкатегория с резервен вариант
export function SubcategoryImage({
  src,
  alt,
  fallback,
}: {
  src: string
  alt: string
  fallback: React.ReactNode
}) {
  return (
    <>
      <Image src={src || "/placeholder.svg"} alt={alt} width={40} height={40} className="object-contain z-0" />
      <div className="subcategory-fallback hidden z-10">{fallback}</div>
    </>
  )
}
