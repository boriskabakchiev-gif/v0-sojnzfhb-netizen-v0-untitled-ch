import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { productName, productionLineId, partnerEmployeeId, quantity, productionDate, notes } = body
    const productionId = id

    // Get current employee from headers
    const currentEmployee = request.headers.get("x-employee-id")

    if (!currentEmployee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the production belongs to the current employee
    const existingProduction = await sql`
      SELECT employee_id FROM productions WHERE id = ${productionId}
    `

    if (existingProduction.length === 0) {
      return NextResponse.json({ error: "Production not found" }, { status: 404 })
    }

    if (existingProduction[0].employee_id.toString() !== currentEmployee) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await sql`
      UPDATE productions 
      SET 
        product_name = ${productName},
        production_line_id = ${productionLineId},
        partner_employee_id = ${partnerEmployeeId},
        quantity = ${quantity},
        production_date = ${productionDate},
        notes = ${notes},
        updated_at = NOW()
      WHERE id = ${productionId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating production:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const productionId = id
    const currentEmployee = request.headers.get("x-employee-id")

    if (!currentEmployee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the production belongs to the current employee
    const existingProduction = await sql`
      SELECT employee_id FROM productions WHERE id = ${productionId}
    `

    if (existingProduction.length === 0) {
      return NextResponse.json({ error: "Production not found" }, { status: 404 })
    }

    if (existingProduction[0].employee_id.toString() !== currentEmployee) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await sql`
      DELETE FROM productions WHERE id = ${productionId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting production:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
