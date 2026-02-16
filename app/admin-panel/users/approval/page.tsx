"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle, RefreshCw, AlertTriangle, Clock, Info, Store, Phone, Mail, User } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

interface PendingCustomer {
  "Document ID"?: string
  id?: string
  objectid?: string
  storename?: string
  companyname?: string
  phone?: string
  type?: string
  customertype?: string
  customer_type?: string
  createdat?: string
  email?: string
  [key: string]: any // Allow for additional fields
}

export default function AdminUsersApprovalPage() {
  const [pendingCustomers, setPendingCustomers] = useState<PendingCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<PendingCustomer | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchPendingCustomers()
  }, [])

  const fetchPendingCustomers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Добавяме timestamp за избягване на кеширане
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/admin/customers/pending?t=${timestamp}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Грешка при зареждане на чакащи клиенти: ${response.status}`)
      }

      const data = await response.json()
      console.log("Loaded customers data:", data)

      if (data.customers && Array.isArray(data.customers)) {
        // Make sure each customer has an ID
        const customersWithIds = data.customers.map((customer: PendingCustomer) => {
          // Log the customer to see its structure
          console.log("Customer data:", customer)

          // Use Document ID if available, otherwise use id or objectid
          const customerId = customer["Document ID"] || customer.id || customer.objectid

          return {
            ...customer,
            id: customerId,
            "Document ID": customerId,
          }
        })

        setPendingCustomers(customersWithIds)
      } else {
        // Invalid data format received
        setError("Получените данни не са във валиден формат")
        setPendingCustomers([])
      }
    } catch (error) {
      console.error("Error fetching pending customers:", error)
      setError(
        `Възникна грешка при зареждане на чакащи клиенти: ${error instanceof Error ? error.message : "Неизвестна грешка"}`,
      )
      setPendingCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (customerId: string) => {
    if (!customerId) {
      console.error("Cannot approve customer: Missing ID")
      toast({
        title: "Грешка",
        description: "Липсва ID на клиент",
        variant: "destructive",
      })
      return
    }

    try {
      setProcessingId(customerId)

      console.log(`Sending approval request for customer ID: ${customerId}`)

      const response = await fetch(`/api/admin/customers/${customerId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const responseText = await response.text()
      console.log(`Raw response from approval API: ${responseText}`)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Error parsing JSON response:", e)
        throw new Error("Невалиден отговор от сървъра")
      }

      if (!response.ok) {
        throw new Error(data.error || "Грешка при одобряване на клиента")
      }

      toast({
        title: "Успешно",
        description: data.message || "Клиентът беше одобрен успешно",
      })

      // Remove the approved customer from the list
      setPendingCustomers((prev) => prev.filter((customer) => customer.id !== customerId))

      // If the approved customer is currently selected, close the dialog
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(null)
      }
    } catch (error) {
      console.error("Error approving customer:", error)
      toast({
        title: "Грешка",
        description: error instanceof Error ? error.message : "Възникна проблем при одобряване на клиента",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (customerId: string) => {
    if (!customerId) {
      console.error("Cannot reject customer: Missing ID")
      toast({
        title: "Грешка",
        description: "Липсва ID на клиент",
        variant: "destructive",
      })
      return
    }

    try {
      setProcessingId(customerId)

      console.log(`Sending reject request for customer ID: ${customerId}`)

      const response = await fetch(`/api/admin/customers/${customerId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const responseText = await response.text()
      console.log(`Raw response from reject API: ${responseText}`)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Error parsing JSON response:", e)
        throw new Error("Невалиден отговор от сървъра")
      }

      if (!response.ok) {
        throw new Error(data.error || "Грешка при отхвърляне на клиента")
      }

      toast({
        title: "Успешно",
        description: data.message || "Клиентът беше отхвърлен успешно",
      })

      // Remove the rejected customer from the list
      setPendingCustomers((prev) => prev.filter((customer) => customer.id !== customerId))

      // If the rejected customer is currently selected, close the dialog
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(null)
      }
    } catch (error) {
      console.error("Error rejecting customer:", error)
      toast({
        title: "Грешка",
        description: error instanceof Error ? error.message : "Възникна проблем при отхвърляне на клиента",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  // Helper function to get the customer type from any possible field name
  const getCustomerType = (customer: PendingCustomer): string | undefined => {
    return customer.type || customer.customertype || customer.customer_type
  }

  // Функция за превод на тип клиент
  const translateType = (customer: PendingCustomer) => {
    const type = getCustomerType(customer)

    if (!type) return "Не е посочен тип"

    switch (type.toLowerCase()) {
      case "retailer":
        return "Търговец на дребно"
      case "wholesaler":
        return "Търговец на едро"
      case "standard":
        return "Стандартен клиент"
      default:
        return type // Връщаме оригиналния тип, ако не съвпада с нито един от познатите
    }
  }

  // Функция за определяне на цвят на бадж според типа
  const getTypeBadgeColor = (customer: PendingCustomer) => {
    const type = getCustomerType(customer)

    if (!type) return "bg-gray-100 text-gray-800 border-gray-300"

    switch (type.toLowerCase()) {
      case "retailer":
        return "bg-green-100 text-green-800 border-green-300"
      case "wholesaler":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "standard":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-orange-100 text-orange-800 border-orange-300"
    }
  }

  // Функция за форматиране на дата
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Няма данни"

    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("bg-BG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (e) {
      return "Невалидна дата"
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="bg-white shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">Одобрение на клиенти</CardTitle>
              <CardDescription className="text-gray-600">Управлявайте регистрациите на нови клиенти</CardDescription>
            </div>
            <Button variant="outline" onClick={fetchPendingCustomers} disabled={loading} className="bg-white">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Обнови
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Грешка</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : pendingCustomers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Няма чакащи клиенти за одобрение</p>
              <p className="text-sm">Когато клиенти се регистрират, те ще се появят тук за одобрение</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingCustomers.map((customer) => (
                <div key={customer.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">{customer.storename || "Няма име на магазин"}</h3>
                      <div className="text-sm text-gray-500 mt-1">
                        <div className="flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-1" />
                          {customer.phone || "Няма телефон"}
                        </div>
                        <div className="flex items-center mt-1">
                          <Mail className="h-3.5 w-3.5 mr-1" />
                          {customer.email || customer.objectid || "Няма имейл"}
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge className={`font-medium border ${getTypeBadgeColor(customer)}`}>
                          {translateType(customer)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                        onClick={() => handleApprove(customer.id || "")}
                        disabled={processingId === customer.id}
                      >
                        {processingId === customer.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Одобри
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                        onClick={() => handleReject(customer.id || "")}
                        disabled={processingId === customer.id}
                      >
                        {processingId === customer.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        Отхвърли
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <Info className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <span>ID: {customer.id || customer["Document ID"] || "Няма ID"}</span>
                    <span className="ml-4">Дата на регистрация: {formatDate(customer.createdat)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог с детайли за клиента */}
      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Детайли за клиента</DialogTitle>
            <DialogDescription>Пълна информация за кандидатстващия клиент</DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6 py-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Store className="h-5 w-5 mr-2 text-gray-600" />
                  Данни за магазин/компания
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Име на магазин</h4>
                    <p className="text-base font-medium">{selectedCustomer.storename || "Не е посочен"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Име на компания</h4>
                    <p className="text-base">{selectedCustomer.companyname || "Не е посочена"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2 text-gray-600" />
                  Тип клиент
                </h3>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Избран тип</h4>
                  <div className="mt-1">
                    <Badge className={`font-medium border px-3 py-1 ${getTypeBadgeColor(selectedCustomer)}`}>
                      {translateType(selectedCustomer)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {getCustomerType(selectedCustomer)?.toLowerCase() === "retailer" &&
                      "Търговец на дребно - Клиент, който продава директно на крайни потребители. Има достъп до специални цени за търговци на дребно."}
                    {getCustomerType(selectedCustomer)?.toLowerCase() === "wholesaler" &&
                      "Търговец на едро - Клиент, който купува големи количества за препродажба. Има достъп до цени на едро и количествени отстъпки."}
                    {getCustomerType(selectedCustomer)?.toLowerCase() === "standard" &&
                      "Стандартен клиент - Клиент с обикновен акаунт без специални привилегии или отстъпки."}
                    {!getCustomerType(selectedCustomer) ||
                      (!["retailer", "wholesaler", "standard"].includes(
                        getCustomerType(selectedCustomer)?.toLowerCase() || "",
                      ) &&
                        `Клиентът е кандидатствал за тип: ${getCustomerType(selectedCustomer) || "Не е посочен тип"}`)}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-gray-600" />
                  Контактна информация
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Имейл</h4>
                    <p className="text-base">{selectedCustomer.email || selectedCustomer.objectid || "Не е посочен"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Телефон</h4>
                    <p className="text-base font-medium">{selectedCustomer.phone || "Не е посочен"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Допълнителна информация</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">ID на клиента</h4>
                    <p className="text-sm font-mono">
                      {selectedCustomer.id || selectedCustomer["Document ID"] || "Няма ID"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Дата на регистрация</h4>
                    <p className="text-base">{formatDate(selectedCustomer.createdat)}</p>
                  </div>
                </div>

                {/* Показване на всички останали полета, които може да има клиента */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Всички подадени данни:</h4>
                  <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto max-h-40">
                    <pre>{JSON.stringify(selectedCustomer, null, 2)}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline">Затвори</Button>
            </DialogClose>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                onClick={() => {
                  if (selectedCustomer) {
                    handleApprove(selectedCustomer.id || selectedCustomer["Document ID"] || "")
                  }
                }}
                disabled={!selectedCustomer || processingId === selectedCustomer.id}
              >
                {selectedCustomer && processingId === selectedCustomer.id ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Одобри
              </Button>
              <Button
                variant="outline"
                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                onClick={() => {
                  if (selectedCustomer) {
                    handleReject(selectedCustomer.id || selectedCustomer["Document ID"] || "")
                  }
                }}
                disabled={!selectedCustomer || processingId === selectedCustomer.id}
              >
                {selectedCustomer && processingId === selectedCustomer.id ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Отхвърли
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
