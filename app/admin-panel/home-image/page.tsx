"use client"

import { useState, useEffect, useTransition } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HomePageImageUpload } from "@/components/home-image-uploader"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, Trash2, Loader2, Pencil, Save, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface HomePageImage {
  id: number
  image_url: string
  is_active: boolean
  created_at: string
}

export default function ManageHomePageImage() {
  const [images, setImages] = useState<HomePageImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [editingImageId, setEditingImageId] = useState<number | null>(null)
  const [editedUrl, setEditedUrl] = useState("")
  const { toast } = useToast()

  const fetchImages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/home-images")
      if (!response.ok) throw new Error("Failed to fetch images")
      const data = await response.json()
      setImages(data)
    } catch (error) {
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на снимките.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const handleImageUploaded = (url: string) => {
    toast({
      title: "Успешно качена снимка",
      description: "Обновяване на списъка...",
    })
    fetchImages()
  }

  const handleSetActive = (id: number) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/home-images/${id}/set-active`, {
          method: "PUT",
        })
        if (!response.ok) throw new Error("Failed to set active image")
        toast({ title: "Успех", description: "Снимката е зададена като активна." })
        fetchImages()
      } catch (error) {
        toast({
          title: "Грешка",
          description: "Неуспешно задаване на активна снимка.",
          variant: "destructive",
        })
      }
    })
  }

  const handleDelete = (id: number, url: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/home-images/${id}/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        })
        if (!response.ok) throw new Error("Failed to delete image")
        toast({ title: "Успех", description: "Снимката е изтрита." })
        fetchImages()
      } catch (error) {
        toast({
          title: "Грешка",
          description: "Неуспешно изтриване на снимка.",
          variant: "destructive",
        })
      }
    })
  }

  const handleEditClick = (image: HomePageImage) => {
    setEditingImageId(image.id)
    setEditedUrl(image.image_url)
  }

  const handleCancelEdit = () => {
    setEditingImageId(null)
    setEditedUrl("")
  }

  const handleSaveUrl = (id: number) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/home-images/${id}/update-url`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newUrl: editedUrl }),
        })
        if (!response.ok) throw new Error("Failed to update URL")
        toast({ title: "Успех", description: "URL адресът е обновен." })
        handleCancelEdit()
        fetchImages()
      } catch (error) {
        toast({
          title: "Грешка",
          description: "Неуспешно обновяване на URL адреса.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Управление на главна снимка</CardTitle>
          <CardDescription>
            Качете нова снимка за началната страница или изберете/редактирайте една от съществуващите.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HomePageImageUpload onImageUploaded={handleImageUploaded} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Съществуващи снимки</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : images.length === 0 ? (
            <p className="text-center text-muted-foreground">Няма качени снимки.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <Card key={image.id} className="overflow-hidden flex flex-col">
                  <div className="relative aspect-video">
                    <Image
                      src={image.image_url || "/placeholder.svg"}
                      alt={`Home page image ${image.id}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?text=Invalid+Image"
                      }}
                    />
                    {image.is_active && <Badge className="absolute top-2 right-2 bg-green-600">Активна</Badge>}
                  </div>
                  <div className="p-4 bg-muted/40 space-y-2 flex-grow flex flex-col">
                    {editingImageId === image.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editedUrl}
                          onChange={(e) => setEditedUrl(e.target.value)}
                          disabled={isPending}
                          placeholder="Поставете нов URL адрес"
                        />
                        <div className="flex gap-2">
                          <Button onClick={() => handleSaveUrl(image.id)} disabled={isPending} size="sm">
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                          <Button onClick={handleCancelEdit} disabled={isPending} variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground break-all flex-grow">{image.image_url}</p>
                    )}
                  </div>
                  <div className="p-2 border-t flex flex-wrap gap-2 justify-between items-center">
                    <Button
                      onClick={() => handleSetActive(image.id)}
                      disabled={image.is_active || isPending || editingImageId === image.id}
                      variant="outline"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {image.is_active ? "Активна" : "Направи активна"}
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditClick(image)}
                        disabled={isPending || editingImageId === image.id}
                        variant="outline"
                        size="sm"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(image.id, image.image_url)}
                        disabled={isPending || editingImageId === image.id}
                        variant="destructive"
                        size="sm"
                      >
                        {isPending && editingImageId !== image.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
