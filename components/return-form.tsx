"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ReturnFormProps {
  isEnglish?: boolean
}

export default function ReturnForm({ isEnglish = false }: ReturnFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    productName: "",
    quantity: "",
    reason: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/returns/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message ||
            (isEnglish ? "Failed to submit return request." : "Неуспешно изпращане на заявка за връщане."),
        )
      }

      const result = await response.json()
      toast({
        title: isEnglish ? "Success!" : "Успех!",
        description: result.message,
        variant: "default",
      })
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        productName: "",
        quantity: "",
        reason: "",
      }) // Clear form
    } catch (error: any) {
      toast({
        title: isEnglish ? "Error!" : "Грешка!",
        description:
          error.message ||
          (isEnglish
            ? "An error occurred while submitting the request."
            : "Възникна грешка при изпращане на заявката."),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{isEnglish ? "Product Return Form" : "Форма за връщане на поръчка"}</CardTitle>
        <CardDescription>
          {isEnglish
            ? "Please fill out the form below to request a product return."
            : "Моля, попълнете формата по-долу, за да заявите връщане на продукт."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{isEnglish ? "First Name" : "Име"}</Label>
            <Input id="firstName" value={formData.firstName} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{isEnglish ? "Last Name" : "Фамилия"}</Label>
            <Input id="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{isEnglish ? "Email" : "Имейл"}</Label>
            <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{isEnglish ? "Phone" : "Телефон"}</Label>
            <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="productName">{isEnglish ? "Product Name" : "Име на продукт"}</Label>
            <Input id="productName" value={formData.productName} onChange={handleChange} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="quantity">{isEnglish ? "Quantity" : "Количество"}</Label>
            <Input id="quantity" type="number" value={formData.quantity} onChange={handleChange} required min="1" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="reason">{isEnglish ? "Reason for Return" : "Причина за връщане"}</Label>
            <Textarea id="reason" value={formData.reason} onChange={handleChange} required rows={5} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isEnglish
                ? isSubmitting
                  ? "Submitting..."
                  : "Submit Return Request"
                : isSubmitting
                  ? "Изпращане..."
                  : "Изпрати заявка за връщане"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
