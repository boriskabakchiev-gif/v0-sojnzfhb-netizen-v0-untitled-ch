import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const employeeId = request.headers.get("x-employee-id")

    if (!employeeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get today's date
    const today = new Date().toISOString().split("T")[0]

    // Fetch today's tasks for the employee
    const tasks = await sql`
      SELECT 
        det.id,
        det.target_date,
        det.daily_target,
        det.product_id,
        det.production_line_id,
        np.title as product_name,
        pl.name as production_line_name
      FROM daily_employee_targets det
      LEFT JOIN new_products np ON det.product_id = np.objectid
      LEFT JOIN production_lines pl ON det.production_line_id = pl.id
      WHERE det.employee_id = ${employeeId}
        AND det.target_date = ${today}::date
      ORDER BY det.created_at ASC
    `

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("[v0] Error fetching employee tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}
