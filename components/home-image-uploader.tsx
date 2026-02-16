"use client"

import type React from "react"
import { useState } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"

interface HomePageImageUploadProps {
  onImageUploaded: (imageUrl: string) => void
}

export function HomePageImageUpload({ onImageUploaded }: HomePageImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Невалиден файл",
        description: "Моля, изберете изображение.",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/admin/home-images/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image")
      }

      onImageUploaded(data.imageUrl)
      toast({
        title: "Успешно качване",
        description: "Изображението беше качено успешно.",
      })
      // Reset state after successful upload
      setSelectedFile(null)
      setPreviewUrl(null)
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Грешка при качване",
        description: error instanceof Error ? error.message : "Възникна грешка.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center">
            {previewUrl ? (
              <div className="relative w-full h-48 mb-4">
                <Image src={previewUrl || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md">
                <Upload className="h-12 w-12 text-gray-400" />
              </div>
            )}

            <div className="flex flex-col items-center w-full">
              <label
                htmlFor="home-image-file-upload"
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md w-full text-center"
              >
                {previewUrl ? "Избери друго изображение" : "Избери изображение"}
              </label>
              <input
                id="home-image-file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {previewUrl && (
            <div className="flex space-x-2">
              <Button onClick={handleUpload} disabled={isUploading} className="flex-1 bg-green-600 hover:bg-green-700">
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Качване...
                  </>
                ) : (
                  "Качи изображението"
                )}
              </Button>
              <Button onClick={handleCancel} variant="outline" disabled={isUploading} className="flex-1 bg-transparent">
                <X className="h-4 w-4 mr-2" />
                Отказ
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
