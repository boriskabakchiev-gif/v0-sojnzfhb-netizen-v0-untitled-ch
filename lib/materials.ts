import { sql } from "@/lib/db"
import { RECIPE_SLOTS } from "@/lib/material-categories"

// Parse a product key like "production-45" -> 45. Returns null for online-* or invalid keys.
export function parseProductionProductId(productKey: string | null | undefined): number | null {
  if (!productKey || typeof productKey !== "string") return null
  if (!productKey.startsWith("production-")) return null
  const id = Number.parseInt(productKey.slice("production-".length), 10)
  return Number.isFinite(id) ? id : null
}

type RecipeLine = { materialId: number; qtyPerUnit: number }

// Read the 5 recipe slots for a production product and return only the filled ones.
async function getProductRecipe(productProductId: number): Promise<RecipeLine[]> {
  const rows = await sql`
    SELECT
      label1_material_id, label1_qty,
      label2_material_id, label2_qty,
      sticker_material_id, sticker_qty,
      packaging_material_id, packaging_qty,
      box_material_id, box_qty
    FROM production_products
    WHERE id = ${productProductId}
  `
  if (rows.length === 0) return []
  const r = rows[0]
  const lines: RecipeLine[] = []
  for (const slot of RECIPE_SLOTS) {
    const materialId = r[`${slot.key}_material_id`]
    const qtyPerUnit = Number(r[`${slot.key}_qty`] ?? 0)
    if (materialId != null && qtyPerUnit > 0) {
      lines.push({ materialId: Number(materialId), qtyPerUnit })
    }
  }
  return lines
}

/**
 * Deduct materials for a production record based on its product recipe.
 * Records a ledger movement per material so it can be reversed exactly later.
 * Best-effort: any failure is logged but never thrown, so it can't break production recording.
 */
export async function applyProductionConsumption(
  productionId: number,
  productKey: string | null | undefined,
  producedQuantity: number,
): Promise<void> {
  try {
    const productProductId = parseProductionProductId(productKey)
    if (productProductId == null) return // online products / unknown keys have no recipe
    const qty = Number(producedQuantity)
    if (!Number.isFinite(qty) || qty <= 0) return

    const recipe = await getProductRecipe(productProductId)
    if (recipe.length === 0) return

    for (const line of recipe) {
      const consumed = line.qtyPerUnit * qty
      if (consumed <= 0) continue
      await sql`
        UPDATE materials
        SET stock = stock - ${consumed}, updated_at = NOW()
        WHERE id = ${line.materialId}
      `
      await sql`
        INSERT INTO material_movements (material_id, production_id, change, reason)
        VALUES (${line.materialId}, ${productionId}, ${-consumed}, 'production')
      `
    }
  } catch (error) {
    console.error("[v0] applyProductionConsumption failed:", error)
  }
}

/**
 * Reverse every consumption previously recorded for a production (adds the stock back).
 * Used before editing or when deleting a production, so edits recompute cleanly.
 * Best-effort: failures are logged, never thrown.
 */
export async function reverseProductionConsumption(productionId: number): Promise<void> {
  try {
    // Sum outstanding movements per material for this production and add them back.
    const movements = await sql`
      SELECT material_id, COALESCE(SUM(change), 0) AS total
      FROM material_movements
      WHERE production_id = ${productionId}
      GROUP BY material_id
    `
    for (const m of movements) {
      const total = Number(m.total)
      if (total === 0) continue
      // Adding -total returns the stock to its pre-consumption value.
      await sql`
        UPDATE materials
        SET stock = stock - ${total}, updated_at = NOW()
        WHERE id = ${m.material_id}
      `
      await sql`
        INSERT INTO material_movements (material_id, production_id, change, reason)
        VALUES (${m.material_id}, ${productionId}, ${-total}, 'production_reverse')
      `
    }
  } catch (error) {
    console.error("[v0] reverseProductionConsumption failed:", error)
  }
}

// Count materials at or below their minimum (active only). Used for the sidebar badge.
export async function getLowStockCount(): Promise<number> {
  try {
    const rows = await sql`
      SELECT COUNT(*)::int AS n
      FROM materials
      WHERE active = true AND stock <= min_quantity
    `
    return rows[0]?.n ?? 0
  } catch (error) {
    console.error("[v0] getLowStockCount failed:", error)
    return 0
  }
}
