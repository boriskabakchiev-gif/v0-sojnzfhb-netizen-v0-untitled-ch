"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardStats {
  productCount: number
  categoryCount: number
  subcategoryCount: number
  avgPrice: string
  monthlyData: any[]
}

const AdminPanel = () => {
  const [stats, setStats] = useState<DashboardStats>({
    productCount: 0,
    categoryCount: 0,
    subcategoryCount: 0,
    avgPrice: "0",
    monthlyData: [],
  })
  const [pendingCustomers, setPendingCustomers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [recentCustomers, setRecentCustomers] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Използваме новия API за dashboard статистики
        const response = await fetch("/api/admin/dashboard-stats")
        const data = await response.json()

        if (response.ok) {
          setPendingCustomers(data.pendingCustomers)
          setStats({
            productCount: data.totalProducts,
            categoryCount: data.totalCategories,
            subcategoryCount: 0, // Можем да добавим това по-късно
            avgPrice: "0", // Можем да добавим това по-късно
            monthlyData: [], // Можем да добавим това по-късно
          })

          // Задаваме recent customers данните
          setRecentCustomers(data.recentCustomers)
        } else {
          throw new Error(data.error || "Грешка при зареждане на данни")
        }
      } catch (error) {
        console.error("Грешка при зареждане на dashboard данни:", error)
        toast({
          title: "Грешка",
          description: "Възникна проблем при зареждане на данните",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-5">Административен панел</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Общо продукти</CardTitle>
            <CardDescription>Брой на всички продукти в магазина</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.productCount}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Общо категории</CardTitle>
            <CardDescription>Брой на всички категории продукти</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.categoryCount}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Чакащи клиенти</CardTitle>
            <CardDescription>Брой на клиентите, чакащи одобрение</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-5 w-20" /> : <div className="text-2xl font-bold">{pendingCustomers}</div>}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Последни регистрации</CardTitle>
        </CardHeader>
        <CardContent>
          {recentCustomers.length > 0 ? (
            <div className="space-y-3">
              {recentCustomers.map((customer) => (
                <div key={customer.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                  <Badge className={customer.status === "Чака одобрение" ? "bg-yellow-500" : "bg-green-500"}>
                    {customer.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Няма последни регистрации</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminPanel
