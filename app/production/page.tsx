import { sql } from "@/lib/db"
import { EmployeeLogin } from "@/components/employee-login"

export default async function ProductionPage() {
  // Fetch all employees for the dropdown
  const employees = await sql`
    SELECT id, name 
    FROM employees 
    WHERE active = true 
    ORDER BY name
  `

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="/images/design-mode/new-madiks.png"
                alt="Madiks Logo"
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Система за производство</h1>
            <p className="text-gray-600">Изберете служител за влизане в системата</p>
          </div>

          <EmployeeLogin employees={employees} />
        </div>
      </div>
    </div>
  )
}
