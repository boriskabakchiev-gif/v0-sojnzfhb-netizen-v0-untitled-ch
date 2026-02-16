"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

interface DeleteReturnButtonProps {
  returnId: string
}

export function DeleteReturnButton({ returnId }: DeleteReturnButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/returns/delete/${returnId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete order return")
      }

      toast({
        title: "Успех!",
        description: "Заявката за връщане е изтрита успешно.",
        variant: "default",
      })
      router.refresh() // Revalidate data on the page
    } catch (error: any) {
      toast({
        title: "Грешка!",
        description: error.message || "Възникна грешка при изтриване на заявката.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon" disabled={isLoading}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Изтрий заявка</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Сигурни ли сте?</AlertDialogTitle>
          <AlertDialogDescription>
            Това действие не може да бъде отменено. Това ще изтрие за постоянно тази заявка за връщане от базата данни.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отказ</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Изтриване..." : "Изтрий"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
