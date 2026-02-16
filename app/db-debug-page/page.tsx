// Този файл е за дебъг цели
// Създайте го в app/db-debug-page/page.tsx
import { dbInitialized, getCategories } from "@/lib/db"

export default async function DbDebugPage() {
  const isDbReady = dbInitialized
  let categories = []
  let error = null

  if (isDbReady) {
    try {
      console.log("DbDebugPage: Attempting to fetch categories...")
      categories = await getCategories(true) // true for skipCache
      console.log("DbDebugPage: Categories fetched:", categories.length)
    } catch (e: any) {
      console.error("DbDebugPage: Error fetching categories:", e)
      error = e.message
    }
  } else {
    console.warn("DbDebugPage: Database not initialized, skipping category fetch.")
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Database Debug Page</h1>
      <p>
        <strong>Database Initialized (dbInitialized):</strong>{" "}
        <span style={{ color: isDbReady ? "green" : "red", fontWeight: "bold" }}>{isDbReady ? "Yes" : "No"}</span>
      </p>

      <h2>Categories (fetched directly, skipping cache):</h2>
      {error && <p style={{ color: "red" }}>Error fetching categories: {error}</p>}
      {categories && categories.length > 0 ? (
        <ul>
          {categories.map((cat: any) => (
            <li key={cat.id}>
              {cat.title} (ID: {cat.id})
            </li>
          ))}
        </ul>
      ) : (
        <p>
          {isDbReady ? "No categories found or an error occurred." : "Cannot fetch categories, DB not initialized."}
        </p>
      )}

      <h2>Environment Variables Check:</h2>
      <p>
        <strong>DATABASE_URL is set:</strong> {process.env.DATABASE_URL ? "Yes (exists)" : "No (MISSING!)"}
      </p>
      <p>
        <small>Note: The actual value of DATABASE_URL will not be displayed for security reasons.</small>
      </p>

      <h2>Server Console Logs:</h2>
      <p>
        Please check your server-side console (where you run `npm run dev` or `vercel dev`) for detailed logs from
        `lib/db.ts` prefixed with "LIB/DB.TS:".
      </p>
    </div>
  )
}
