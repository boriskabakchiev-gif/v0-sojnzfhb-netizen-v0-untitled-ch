import { sql } from "@/lib/db"
import { ProductionDashboard } from "@/components/production-dashboard"

export default async function DashboardPage() {
  // Productions will be fetched client-side with proper employee filtering
  const [productionLines, partners] = await Promise.all([
    sql`
      SELECT id, name 
      FROM production_lines 
      WHERE active = true 
      ORDER BY name
    `,
    sql`
      SELECT id, name 
      FROM employees 
      WHERE active = true 
      ORDER BY name
    `,
  ])

  return <ProductionDashboard initialProductions={[]} productionLines={productionLines} partners={partners} />
}
