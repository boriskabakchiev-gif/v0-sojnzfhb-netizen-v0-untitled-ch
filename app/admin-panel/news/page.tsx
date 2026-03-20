"use client"

import { useState, useEffect, useTransition } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import {
  Trash2,
  Loader2,
  Pencil,
  Save,
  X,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Plus,
  Star,
  GripVertical,
  Link2,
  ImageIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface NewsItem {
  id: number
  title: string
  title_en: string | null
  summary: string | null
  summary_en: string | null
  content: string | null
  content_en: string | null
  image_url: string | null
  link_url: string | null
  is_active: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

const emptyNews: Omit<NewsItem, "id" | "created_at" | "updated_at"> = {
  title: "",
  title_en: "",
  summary: "",
  summary_en: "",
  content: "",
  content_en: "",
  image_url: "",
  link_url: "",
  is_active: true,
  is_featured: false,
  sort_order: 0,
}

export default function ManageNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState(emptyNews)
  const { toast } = useToast()

  const fetchNews = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/news")
      if (!response.ok) throw new Error("Failed to fetch news")
      const data = await response.json()
      const sorted = (data || []).sort((a: NewsItem, b: NewsItem) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      setNews(sorted)
    } catch (error) {
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на новините.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const handleOpenDialog = (item?: NewsItem) => {
    if (item) {
      setEditingNews(item)
      setFormData({
        title: item.title,
        title_en: item.title_en || "",
        summary: item.summary || "",
        summary_en: item.summary_en || "",
        content: item.content || "",
        content_en: item.content_en || "",
        image_url: item.image_url || "",
        link_url: item.link_url || "",
        is_active: item.is_active,
        is_featured: item.is_featured,
        sort_order: item.sort_order,
      })
    } else {
      setEditingNews(null)
      setFormData(emptyNews)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingNews(null)
    setFormData(emptyNews)
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Грешка",
        description: "Заглавието е задължително.",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      try {
        const url = editingNews ? `/api/admin/news/${editingNews.id}` : "/api/admin/news"
        const method = editingNews ? "PUT" : "POST"

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (!response.ok) throw new Error("Failed to save news")

        toast({
          title: "Успех",
          description: editingNews ? "Новината е обновена." : "Новината е добавена.",
        })
        handleCloseDialog()
        fetchNews()
      } catch (error) {
        toast({
          title: "Грешка",
          description: "Неуспешно записване на новината.",
          variant: "destructive",
        })
      }
    })
  }

  const handleToggleActive = (id: number, currentActive: boolean) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/news/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: !currentActive }),
        })
        if (!response.ok) throw new Error("Failed to toggle active")
        toast({
          title: "Успех",
          description: !currentActive ? "Новината е активирана." : "Новината е деактивирана.",
        })
        fetchNews()
      } catch (error) {
        toast({
          title: "Грешка",
          description: "Неуспешна промяна на статуса.",
          variant: "destructive",
        })
      }
    })
  }

  const handleToggleFeatured = (id: number, currentFeatured: boolean) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/news/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_featured: !currentFeatured }),
        })
        if (!response.ok) throw new Error("Failed to toggle featured")
        toast({
          title: "Успех",
          description: !currentFeatured ? "Новината е отбелязана като важна." : "Новината вече не е важна.",
        })
        fetchNews()
      } catch (error) {
        toast({
          title: "Грешка",
          description: "Неуспешна промяна на статуса.",
          variant: "destructive",
        })
      }
    })
  }

  const handleDelete = (id: number) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете тази новина?")) return
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/news/${id}`, { method: "DELETE" })
        if (!response.ok) throw new Error("Failed to delete news")
        toast({ title: "Успех", description: "Новината е изтрита." })
        fetchNews()
      } catch (error) {
        toast({
          title: "Грешка",
          description: "Неуспешно изтриване на новината.",
          variant: "destructive",
        })
      }
    })
  }

  const handleMoveSortOrder = (id: number, direction: "up" | "down") => {
    const currentIndex = news.findIndex((item) => item.id === id)
    if (currentIndex === -1) return
    if (direction === "up" && currentIndex === 0) return
    if (direction === "down" && currentIndex === news.length - 1) return

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    const currentItem = news[currentIndex]
    const swapItem = news[swapIndex]

    const currentOrder = currentItem.sort_order ?? currentIndex
    const swapOrder = swapItem.sort_order ?? swapIndex

    startTransition(async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch(`/api/admin/news/${currentItem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sort_order: swapOrder }),
          }),
          fetch(`/api/admin/news/${swapItem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sort_order: currentOrder }),
          }),
        ])
        if (!res1.ok || !res2.ok) throw new Error("Failed to update sort order")
        toast({ title: "Успех", description: "Редът е обновен." })
        fetchNews()
      } catch (error) {
        toast({
          title: "Грешка",
          description: "Неуспешна промяна на реда.",
          variant: "destructive",
        })
      }
    })
  }

  const activeCount = news.filter((item) => item.is_active).length
  const featuredCount = news.filter((item) => item.is_featured).length

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Управление на новини</CardTitle>
              <CardDescription>
                Добавете и управлявайте новини, които ще се показват на началната страница.
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добави новина
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingNews ? "Редактиране на новина" : "Добавяне на новина"}</DialogTitle>
                  <DialogDescription>
                    {editingNews ? "Редактирайте информацията за новината." : "Попълнете информацията за новата новина."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Заглавие (BG) *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Въведете заглавие"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title_en">Заглавие (EN)</Label>
                      <Input
                        id="title_en"
                        value={formData.title_en || ""}
                        onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                        placeholder="Enter title"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="summary">Резюме (BG)</Label>
                      <Textarea
                        id="summary"
                        value={formData.summary || ""}
                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                        placeholder="Кратко описание на новината"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="summary_en">Резюме (EN)</Label>
                      <Textarea
                        id="summary_en"
                        value={formData.summary_en || ""}
                        onChange={(e) => setFormData({ ...formData, summary_en: e.target.value })}
                        placeholder="Short description"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image_url">URL на снимка</Label>
                    <div className="flex gap-2">
                      <Input
                        id="image_url"
                        value={formData.image_url || ""}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                      <Button type="button" variant="outline" size="icon">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="link_url">Линк (при клик)</Label>
                    <Input
                      id="link_url"
                      value={formData.link_url || ""}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      placeholder="https://example.com/page или /category/1"
                    />
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label>Активна</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                      />
                      <Label>Важна</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Отказ
                  </Button>
                  <Button onClick={handleSubmit} disabled={isPending}>
                    {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingNews ? "Запази" : "Добави"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Активни новини</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Важни новини</p>
              <p className="text-2xl font-bold">{featuredCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <EyeOff className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Общо новини</p>
              <p className="text-2xl font-bold">{news.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* News List */}
      <Card>
        <CardHeader>
          <CardTitle>Всички новини</CardTitle>
          <CardDescription>
            Управлявайте новините - включете/изключете, подредете и редактирайте.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : news.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Няма добавени новини. Добавете нова новина по-горе.
            </p>
          ) : (
            <div className="space-y-4">
              {news.map((item, index) => (
                <Card
                  key={item.id}
                  className={`overflow-hidden transition-all ${
                    item.is_active
                      ? item.is_featured
                        ? "border-amber-300 bg-amber-50/30"
                        : "border-green-300 bg-green-50/30"
                      : "border-gray-200 opacity-75"
                  }`}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image Preview */}
                    <div className="relative w-full md:w-48 lg:w-56 aspect-video md:aspect-square flex-shrink-0 bg-gray-100">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?text=No+Image"
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <ImageIcon className="h-12 w-12" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 flex gap-1">
                        {item.is_active && (
                          <Badge className="bg-green-600 text-white">Активна</Badge>
                        )}
                        {item.is_featured && (
                          <Badge className="bg-amber-500 text-white">Важна</Badge>
                        )}
                        {!item.is_active && (
                          <Badge variant="secondary">Неактивна</Badge>
                        )}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex-1 p-4 space-y-3">
                      {/* Title and summary */}
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                        {item.summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.summary}</p>
                        )}
                      </div>

                      {/* Toggle controls */}
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.is_active}
                              onCheckedChange={() => handleToggleActive(item.id, item.is_active)}
                              disabled={isPending}
                            />
                            <Label className="text-sm">Активна</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.is_featured}
                              onCheckedChange={() => handleToggleFeatured(item.id, item.is_featured)}
                              disabled={isPending}
                            />
                            <Label className="text-sm">Важна</Label>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mr-1">Ред:</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleMoveSortOrder(item.id, "up")}
                            disabled={index === 0 || isPending}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleMoveSortOrder(item.id, "down")}
                            disabled={index === news.length - 1 || isPending}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Link info */}
                      {item.link_url && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Link2 className="h-3 w-3" />
                          <span className="line-clamp-1">{item.link_url}</span>
                        </div>
                      )}

                      {/* Bottom row */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-muted-foreground">
                          Добавена: {new Date(item.created_at).toLocaleDateString("bg-BG")}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(item)}
                            disabled={isPending}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Редактирай
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            disabled={isPending}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Изтрий
                          </Button>
                        </div>
                      </div>
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
