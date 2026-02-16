"use client"

export interface Employee {
  id: number
  name: string
}

export function getCurrentEmployee(): Employee | null {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem("currentEmployee")
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("currentEmployee")
  }
}
