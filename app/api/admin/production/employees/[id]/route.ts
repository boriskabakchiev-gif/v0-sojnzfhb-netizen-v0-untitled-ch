import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log("[v0] PATCH request received for employee", id)

  try {
    const body = await request.json()
    console.log("[v0] Request body:", body)

    const { active, name, salary_level_id } = body
    const employeeId = Number.parseInt(id)

    if (isNaN(employeeId)) {
      console.log("[v0] Invalid employee ID")
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 })
    }

    // Build the update based on what fields are provided
    if (active !== undefined) {
      console.log("[v0] Updating active status to:", active)
      await sql`UPDATE employees SET active = ${active}, updated_at = NOW() WHERE id = ${employeeId}`
    }

    if (name !== undefined && salary_level_id !== undefined) {
      const salaryLevelValue = salary_level_id === "none" || salary_level_id === null ? null : Number(salary_level_id)
      console.log("[v0] Updating name and salary_level_id:", { name, salaryLevelValue })
      await sql`UPDATE employees SET name = ${name}, salary_level_id = ${salaryLevelValue}, updated_at = NOW() WHERE id = ${employeeId}`
      console.log("[v0] Update completed successfully")
    } else if (name !== undefined) {
      console.log("[v0] Updating only name:", name)
      await sql`UPDATE employees SET name = ${name}, updated_at = NOW() WHERE id = ${employeeId}`
    } else if (salary_level_id !== undefined) {
      const salaryLevelValue = salary_level_id === "none" || salary_level_id === null ? null : Number(salary_level_id)
      console.log("[v0] Updating only salary_level_id:", salaryLevelValue)
      await sql`UPDATE employees SET salary_level_id = ${salaryLevelValue}, updated_at = NOW() WHERE id = ${employeeId}`
    }

    // Fetch the updated employee
    console.log("[v0] Fetching updated employee data")
    const result =
      await sql`SELECT id, name, active, salary_level_id, created_at FROM employees WHERE id = ${employeeId}`

    console.log("[v0] Query result:", result)

    if (result.length === 0) {
      console.log("[v0] Employee not found after update")
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    console.log("[v0] Returning updated employee:", result[0])
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Error updating employee:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      {
        error: "Failed to update employee",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const employeeId = Number.parseInt(id)

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 })
    }

    // Delete the employee
    await sql`DELETE FROM employees WHERE id = ${employeeId}`

    return NextResponse.json({ success: true, message: "Employee deleted successfully" })
  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 })
  }
}
