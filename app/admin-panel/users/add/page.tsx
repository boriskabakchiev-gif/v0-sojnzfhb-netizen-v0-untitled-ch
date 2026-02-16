"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Save, Loader2 } from "lucide-react"

export default function AddCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    objectid: "",
    storename: "",
    companyname: "",
    phone: "",
    marshrut: "", // Добавено поле за маршрут
    type: "standard",
    discountpercent: "0",
    password: "",
    pending: false,
    deleted: false,
    createdbyadmin: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.phone || !formData.storename) {
        toast({
          title: "Грешка",
          description: "Моля, попълнете полетата 'Имена' и 'Телефон'",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const dataToSend = {
        ...formData,
        companyname: formData.companyname || null,
        objectid: formData.objectid || null,
        marshrut: formData.marshrut || null, // Изпращаме null ако е празен стринг
      }

      const response = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Грешка при създаване на клиент")
      }

      toast({ title: "Успешно", description: "Клиентът беше създаден успешно" })
      router.push("/admin-panel/users")
    } catch (error) {
      console.error("Грешка при създаване на клиент:", error)
      toast({
        title: "Грешка",
        description: error instanceof Error ? error.message : "Възникна проблем",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="bg-white shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">Добавяне на клиент</CardTitle>
              <CardDescription className="text-gray-600">Създайте нов клиент</CardDescription>
            </div>
            <Button variant="outline" onClick={() => router.push("/admin-panel/users")} className="bg-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Назад
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Основна информация</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="storename" className="text-gray-700">
                  Имена <span className="text-red-500">*</span>
                </Label>
                <Input id="storename" name="storename" value={formData.storename} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="phone" className="text-gray-700">
                  Телефон <span className="text-red-500">*</span>
                </Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="objectid" className="text-gray-700">
                  Имейл / ID
                </Label>
                <Input id="objectid" name="objectid" type="text" value={formData.objectid} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="companyname" className="text-gray-700">
                  Име на компания
                </Label>
                <Input id="companyname" name="companyname" value={formData.companyname} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="marshrut" className="text-gray-700">
                  Маршрут
                </Label>
                <Input
                  id="marshrut"
                  name="marshrut"
                  value={formData.marshrut}
                  onChange={handleChange}
                  placeholder="Въведете маршрут"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-700">
                  Парола
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="type" className="text-gray-700">
                  Тип клиент
                </Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Изберете тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Стандартен клиент</SelectItem>
                    <SelectItem value="retailer">Търговец на дребно</SelectItem>
                    <SelectItem value="wholesaler">Търговец на едро</SelectItem>
                    <SelectItem value="european">Европейски клиент</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discountpercent" className="text-gray-700">
                  Процент отстъпка (%)
                </Label>
                <Input
                  id="discountpercent"
                  name="discountpercent"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discountpercent}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Статус</h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pending"
                  checked={formData.pending}
                  onCheckedChange={(checked) => handleCheckboxChange("pending", checked as boolean)}
                />
                <Label htmlFor="pending">Изчакващ одобрение</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="deleted"
                  checked={formData.deleted}
                  onCheckedChange={(checked) => handleCheckboxChange("deleted", checked as boolean)}
                />
                <Label htmlFor="deleted">Деактивиран</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.push("/admin-panel/users")}>
                Отказ
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Запазване...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Запази клиент
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
