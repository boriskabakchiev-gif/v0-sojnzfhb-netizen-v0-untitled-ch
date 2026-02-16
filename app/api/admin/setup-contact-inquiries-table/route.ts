import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'new', -- e.g., new, read, replied, archived
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
    // Add a trigger to update updated_at timestamp
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `
    // Check if trigger exists before creating
    const triggerExists = await sql`
      SELECT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'update_contact_inquiries_updated_at'
      );
    `
    if (!triggerExists[0].exists) {
      await sql`
        CREATE TRIGGER update_contact_inquiries_updated_at
        BEFORE UPDATE ON contact_inquiries
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `
    }

    return NextResponse.json({
      message: "Table contact_inquiries created or already exists successfully, and updated_at trigger ensured.",
    })
  } catch (error) {
    console.error("Error setting up contact_inquiries table:", error)
    return NextResponse.json({ error: "Failed to setup contact_inquiries table" }, { status: 500 })
  }
}
