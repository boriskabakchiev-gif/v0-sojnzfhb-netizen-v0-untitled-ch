// Hardcoded admin credentials - NOT stored in database
const ADMIN_USERNAME = "ilian"
const ADMIN_PASSWORD = "ilian 123"
const STORAGE_KEY = "statistics_admin_auth"

export function checkAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

export function setAdminSession(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, "true")
  }
}

export function clearAdminSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function isAdminAuthenticated(): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEY) === "true"
  }
  return false
}
