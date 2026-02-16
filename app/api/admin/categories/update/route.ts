import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function PUT(request: NextRequest) {
  try {
    console.log("=== Categories Update API Called ===")

    const body = await request.json()
    console.log("Request body:", body)

    const { id, ...updateData } = body

    if (!id) {
      console.error("No category ID provided")
      return NextResponse.json({ success: false, error: "Category ID is required" }, { status: 400 })
    }

    // Remove computed fields that shouldn't be updated
    const fieldsToRemove = ["productCount", "subcategoryCount", "status"]
    fieldsToRemove.forEach((field) => delete updateData[field])

    console.log("Category ID:", id)
    console.log("Update data after cleanup:", updateData)

    // Build dynamic UPDATE query
    const updateFields = Object.keys(updateData)
    if (updateFields.length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 })
    }

    // Create SET clause dynamically
    const setClause = updateFields.map((field, index) => `"${field}" = $${index + 2}`).join(", ")
    const values = [id, ...updateFields.map((field) => updateData[field])]

    const query = `
      UPDATE categories 
      SET ${setClause}, "updatedat" = CURRENT_TIMESTAMP
      WHERE "Document ID" = $1
      RETURNING *
    `

    console.log("Executing query:", query)
    console.log("With values:", values)

    const result = await sql.query(query, values)

    if (result.length === 0) {
      console.error("No category found with ID:", id)
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    console.log("Update successful:", result[0])

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category: result[0],
    })
  } catch (error) {
    console.error("Error updating category:", error)

    let errorMessage = "Failed to update category"
    if (error instanceof Error) {
      errorMessage = error.message

      // Handle specific database errors
      if (error.message.includes("column") && error.message.includes("does not exist")) {
        errorMessage = "One or more fields do not exist in the database"
      } else if (error.message.includes("violates not-null constraint")) {
        errorMessage = "Required field cannot be empty"
      } else if (error.message.includes("violates unique constraint")) {
        errorMessage = "A category with this information already exists"
      }
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

// Also support POST for backward compatibility
export async function POST(request: NextRequest) {
  return PUT(request)
}
