"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, X, ImageIcon } from "lucide-react"

interface ImageUploadProps {
  currentImageUrl?: string | null
  onImageUploaded: (url: string) => void
  onError?: (error: string) => void
  uploadUrl: string
  aspectRatio?: "square" | "portrait" | "landscape"
  className?: string
  subcategoryId?: string
  disabled?: boolean
}

export function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  onError,
  uploadUrl,
  aspectRatio = "square",
  className = "",
  subcategoryId,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  console.log("ImageUpload rendered:", {
    currentImageUrl,
    previewUrl,
    subcategoryId,
    uploadUrl,
  })

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log("File selected:", file.name, file.size, file.type)

    // Validate file
    if (!file.type.startsWith("image/")) {
      const error = "Моля, изберете валиден файл с изображение"
      console.error(error)
      onError?.(error)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      const error = "Файлът е твърде голям. Максимален размер: 5MB"
      console.error(error)
      onError?.(error)
      return
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Upload file
    await uploadFile(file)

    // Cleanup
    URL.revokeObjectURL(objectUrl)
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)

    try {
      console.log("Starting upload...")

      const formData = new FormData()
      formData.append("file", file)

      if (subcategoryId) {
        formData.append("subcategoryId", subcategoryId)
        console.log("Added subcategoryId to form data:", subcategoryId)
      }

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      })

      console.log("Upload response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Upload result:", result)

      if (result.success && result.url) {
        setPreviewUrl(result.url)
        onImageUploaded(result.url)
        console.log("Upload successful, URL:", result.url)
      } else {
        throw new Error(result.error || "Грешка при качване на снимката")
      }
    } catch (error) {
      console.error("Upload error:", error)
      const errorMessage = error instanceof Error ? error.message : "Грешка при качване на снимката"
      onError?.(errorMessage)

      // Reset preview on error
      setPreviewUrl(currentImageUrl || null)
    } finally {
      setIsUploading(false)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageUploaded("")

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "portrait":
        return "aspect-[3/4]"
      case "landscape":
        return "aspect-[4/3]"
      default:
        return "aspect-square"
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Image Preview */}
      <div
        className={`relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden ${getAspectRatioClass()} bg-gray-50`}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl || "/placeholder.svg"}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Image load error:", e)
                setPreviewUrl(null)
              }}
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ImageIcon className="h-12 w-12 mb-2" />
            <p className="text-sm text-center">Няма качена снимка</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Качване...</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="flex-1"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Качване...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {previewUrl ? "Смени снимката" : "Качи снимка"}
            </>
          )}
        </Button>

        {previewUrl && !disabled && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemoveImage}
            disabled={isUploading}
            className="text-red-600 hover:text-red-700 bg-transparent"
          >
            Премахни
          </Button>
        )}
      </div>

      {/* Current URL Display */}
      {previewUrl && (
        <div className="text-xs text-gray-500 break-all bg-gray-50 p-2 rounded">
          <strong>URL:</strong> {previewUrl}
        </div>
      )}
    </div>
  )
}
