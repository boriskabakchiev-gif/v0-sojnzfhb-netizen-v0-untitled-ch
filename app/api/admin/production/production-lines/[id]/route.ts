import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const lineId = Number.parseInt(id)

    if (isNaN(lineId)) {
      return NextResponse.json({ error: "Invalid production line ID" }, { status: 400 })
    }

    const { name, description, active } = body

    // Build update query based on provided fields
    let result
    if (name !== undefined && description !== undefined) {
      result =
        await sql`UPDATE production_lines SET name = ${name}, description = ${description} WHERE id = ${lineId} RETURNING id, name, description, active, created_at`
    } else if (active !== undefined) {
      // Update active status only
      result =
        await sql`UPDATE production_lines SET active = ${active} WHERE id = ${lineId} RETURNING id, name, description, active, created_at`
    } else {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    if (result.length === 0) {
      return NextResponse.json({ error: "Production line not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating production line:", error)
    return NextResponse.json({ error: "Failed to update production line" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const lineId = Number.parseInt(id)

    if (isNaN(lineId)) {
      return NextResponse.json({ error: "Invalid production line ID" }, { status: 400 })
    }

    // Delete the production line
    await sql`DELETE FROM production_lines WHERE id = ${lineId}`

    return NextResponse.json({ success: true, message: "Production line deleted successfully" })
  } catch (error) {
    console.error("Error deleting production line:", error)
    return NextResponse.json({ error: "Failed to delete production line" }, { status: 500 })
  }
}
