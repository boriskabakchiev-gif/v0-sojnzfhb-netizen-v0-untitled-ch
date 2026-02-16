"use client"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface BannerSettings {
  id?: number
  start_date: string
  end_date: string
  message: string
  is_visible: boolean
}

export default function BannerSettingsPage() {
  const [settings, setSettings] = useState<BannerSettings>({
    start_date: "23.12.2025",
    end_date: "04.01.2026",
    message: "От {start_date} до {end_date} няма да приемаме заявки!",
    is_visible: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/banner-settings")
      if (!response.ok) throw new Error("Failed to fetch settings")
      const data = await response.json()
      if (data) {
        setSettings(data)
      }
    } catch (error) {
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на настройките.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/banner-settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        })
        if (!response.ok) throw new Error("Failed to update settings")
        toast({ title: "Успех", description: "Настройките са запазени успешно." })
        fetchSettings()
      } catch (error) {
        toast({
          title: "Грешка",
          description: "Неуспешно запазване на настройките.",
          variant: "destructive",
        })
      }
    })
  }

  const handleToggleVisibility = (checked: boolean) => {
    const updatedSettings = { ...settings, is_visible: checked }
    setSettings(updatedSettings)

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/banner-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_visible: checked }),
        })
        if (!response.ok) throw new Error("Failed to toggle visibility")
        toast({
          title: "Успех",
          description: checked ? "Банерът е показан." : "Банерът е скрит.",
        })
      } catch (error) {
        toast({
          title: "Грешка",
          description: "Неуспешна промяна на видимостта.",
          variant: "destructive",
        })
        setSettings({ ...settings, is_visible: !checked })
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Настройки на банер</CardTitle>
          <CardDescription>
            Управлявайте съобщенията на банера за празничните дни. Използвайте {"{start_date}"} и {"{end_date}"} в
            съобщението за автоматично заместване.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/40">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Видимост на банер</Label>
              <p className="text-sm text-muted-foreground">
                {settings.is_visible ? "Банерът е видим на началната страница" : "Банерът е скрит"}
              </p>
            </div>
            <Switch checked={settings.is_visible} onCheckedChange={handleToggleVisibility} disabled={isPending} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Начална дата</Label>
              <Input
                id="start_date"
                value={settings.start_date}
                onChange={(e) => setSettings({ ...settings, start_date: e.target.value })}
                placeholder="дд.мм.гггг"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Крайна дата</Label>
              <Input
                id="end_date"
                value={settings.end_date}
                onChange={(e) => setSettings({ ...settings, end_date: e.target.value })}
                placeholder="дд.мм.гггг"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Съобщение</Label>
            <Textarea
              id="message"
              value={settings.message}
              onChange={(e) => setSettings({ ...settings, message: e.target.value })}
              placeholder="Въведете съобщението за банера..."
              rows={4}
              disabled={isPending}
            />
            <p className="text-sm text-muted-foreground">
              Използвайте {"{start_date}"} и {"{end_date}"} за автоматично заместване с датите по-горе.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-muted/20">
            <Label className="text-sm font-semibold mb-2 block">Визуализация:</Label>
            <p className="text-sm">
              {settings.message.replace("{start_date}", settings.start_date).replace("{end_date}", settings.end_date)}
            </p>
          </div>

          <Button onClick={handleSave} disabled={isPending} className="w-full md:w-auto">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Запази настройките
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
