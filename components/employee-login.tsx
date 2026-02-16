"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User } from "lucide-react"

interface Employee {
  id: number
  name: string
}

interface EmployeeLoginProps {
  employees: Employee[]
}

export function EmployeeLogin({ employees }: EmployeeLoginProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!selectedEmployee) return

    setIsLoading(true)

    // Store employee info in localStorage for session management
    const employee = employees.find((emp) => emp.id.toString() === selectedEmployee)
    if (employee) {
      localStorage.setItem("currentEmployee", JSON.stringify(employee))
      router.push("/production/dashboard")
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Изберете служител</label>
        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Изберете служител..." />
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id.toString()}>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {employee.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleLogin}
        disabled={!selectedEmployee || isLoading}
        className="w-full bg-amber-600 hover:bg-amber-700"
      >
        {isLoading ? "Влизане..." : "Влизане в системата"}
      </Button>
    </div>
  )
}
