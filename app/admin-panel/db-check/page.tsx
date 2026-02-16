"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Check, X, Database, Table, AlertTriangle } from "lucide-react"

export default function DbCheckPage() {
  const [dbInfo, setDbInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkDatabase = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/admin/db-check")
      const data = await response.json()

      setDbInfo(data)
    } catch (err) {
      console.error("Error checking database:", err)
      setError("Грешка при проверка на базата данни")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkDatabase()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Проверка на базата данни</h1>
        <Button onClick={checkDatabase} disabled={loading}>
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Проверка...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" /> Обнови
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 p-4 rounded-md">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {loading && !dbInfo ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="h-8 w-8 animate-spin text-red-500" />
        </div>
      ) : dbInfo ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" /> Връзка с базата данни
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Статус на връзката:</span>
                  <span className={dbInfo.success ? "text-green-500" : "text-red-500"}>
                    {dbInfo.success ? (
                      <span className="flex items-center">
                        <Check className="mr-1 h-4 w-4" /> Успешна
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <X className="mr-1 h-4 w-4" /> Неуспешна
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>DATABASE_URL:</span>
                  <span className={dbInfo.environment.DATABASE_URL ? "text-green-500" : "text-red-500"}>
                    {dbInfo.environment.DATABASE_URL ? (
                      <span className="flex items-center">
                        <Check className="mr-1 h-4 w-4" /> Налично
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <X className="mr-1 h-4 w-4" /> Липсва
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>POSTGRES_URL:</span>
                  <span className={dbInfo.environment.POSTGRES_URL ? "text-green-500" : "text-yellow-500"}>
                    {dbInfo.environment.POSTGRES_URL ? (
                      <span className="flex items-center">
                        <Check className="mr-1 h-4 w-4" /> Налично
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <AlertTriangle className="mr-1 h-4 w-4" /> Липсва (не е задължително)
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Брой таблици:</span>
                  <span>{dbInfo.database.tables}</span>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Налични таблици:</h3>
                  <div className="bg-gray-800 p-3 rounded-md text-sm overflow-auto max-h-40">
                    {dbInfo.database.tablesList.map((table: string) => (
                      <div key={table} className="mb-1">
                        <Table className="inline-block mr-2 h-4 w-4" /> {table}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Table className="mr-2 h-5 w-5" /> Таблици за продукти и категории
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <span className={dbInfo.products.tableExists ? "text-green-500" : "text-red-500"}>
                      {dbInfo.products.tableExists ? (
                        <Check className="mr-1 h-4 w-4" />
                      ) : (
                        <X className="mr-1 h-4 w-4" />
                      )}
                    </span>
                    Таблица new_products
                  </h3>

                  {dbInfo.products.tableExists ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span>Брой записи:</span>
                        <span>{dbInfo.products.count}</span>
                      </div>

                      <h4 className="text-sm font-medium mb-1">Колони:</h4>
                      <div className="bg-gray-800 p-3 rounded-md text-sm overflow-auto max-h-40">
                        {dbInfo.products.columns.map((column: string) => (
                          <div key={column} className="mb-1">
                            {column}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="bg-red-900/20 border border-red-800 p-3 rounded-md text-sm">
                      Таблицата new_products не съществува в базата данни!
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <span className={dbInfo.categories.tableExists ? "text-green-500" : "text-red-500"}>
                      {dbInfo.categories.tableExists ? (
                        <Check className="mr-1 h-4 w-4" />
                      ) : (
                        <X className="mr-1 h-4 w-4" />
                      )}
                    </span>
                    Таблица categories
                  </h3>

                  {dbInfo.categories.tableExists ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span>Брой записи:</span>
                        <span>{dbInfo.categories.count}</span>
                      </div>

                      <h4 className="text-sm font-medium mb-1">Колони:</h4>
                      <div className="bg-gray-800 p-3 rounded-md text-sm overflow-auto max-h-40">
                        {dbInfo.categories.columns.map((column: string) => (
                          <div key={column} className="mb-1">
                            {column}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="bg-red-900/20 border border-red-800 p-3 rounded-md text-sm">
                      Таблицата categories не съществува в базата данни!
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
