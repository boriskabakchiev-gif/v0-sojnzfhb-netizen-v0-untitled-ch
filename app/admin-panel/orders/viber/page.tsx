"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, MessageCircle, Search, ShieldAlert, UsersRound } from "lucide-react"

interface ViberContact {
  phoneKey: string
  phone: string
  name: string | null
  email: string | null
  orderCount: number
  lastOrderAt: string | null
  marketingOptIn: boolean
  consentRecordedAt: string | null
  consentNote: string | null
}

interface ContactResponse {
  contacts: ViberContact[]
  count: number
  year: number
}

const fetcher = async (url: string): Promise<ContactResponse> => {
  const response = await fetch(url)
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || "Неуспешно зареждане на контактите")
  return data
}

export default function ViberConsentPage() {
  const { toast } = useToast()
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(String(currentYear))
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [consentNote, setConsentNote] = useState("")
  const [confirmOptIn, setConfirmOptIn] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)

  const { data, error, isLoading, mutate } = useSWR<ContactResponse>(`/api/admin/viber-consent?year=${year}`, fetcher)
  const contacts = data?.contacts ?? []
  const optedInCount = contacts.filter((contact) => contact.marketingOptIn).length
  const selectedKeys = Object.keys(selected).filter((key) => selected[key])

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return contacts.filter((contact) => {
      if (statusFilter === "consented" && !contact.marketingOptIn) return false
      if (statusFilter === "not-consented" && contact.marketingOptIn) return false
      if (!query) return true
      return [contact.name, contact.phone, contact.email].some((value) => value?.toLocaleLowerCase().includes(query))
    })
  }, [contacts, search, statusFilter])

  const allFilteredSelected = filteredContacts.length > 0 && filteredContacts.every((contact) => selected[contact.phoneKey])

  const toggleAll = () => {
    setSelected((previous) => {
      const next = { ...previous }
      filteredContacts.forEach((contact) => {
        if (allFilteredSelected) delete next[contact.phoneKey]
        else next[contact.phoneKey] = true
      })
      return next
    })
  }

  const updateConsent = async () => {
    if (confirmOptIn === null || selectedKeys.length === 0) return
    setSaving(true)
    try {
      const response = await fetch("/api/admin/viber-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: Number(year),
          phoneKeys: selectedKeys,
          optedIn: confirmOptIn,
          consentNote: confirmOptIn ? consentNote.trim() : "Съгласието е оттеглено от администратор",
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Неуспешно записване")
      toast({
        title: "Статусът е записан",
        description: `Обновени са ${result.updatedCount} телефонни номера.`,
      })
      setSelected({})
      if (confirmOptIn) setConsentNote("")
      setConfirmOptIn(null)
      await mutate()
    } catch (updateError) {
      toast({
        title: "Грешка",
        description: updateError instanceof Error ? updateError.message : "Неуспешно записване на съгласието.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="size-4" aria-hidden="true" />
            <span>Поръчки / Viber</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Съгласие за Viber промоции</h1>
          <p className="mt-1 text-sm text-muted-foreground">Контакти с телефон от поръчките през избраната година.</p>
        </div>
        <Select value={year} onValueChange={(value) => { setYear(value); setSelected({}) }}>
          <SelectTrigger className="w-full sm:w-36" aria-label="Година на поръчките">
            <SelectValue placeholder="Година" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Array.from({ length: 7 }, (_, index) => String(currentYear - index)).map((value) => (
                <SelectItem key={value} value={value}>{value}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </header>

      <Card className="border-amber-300 bg-amber-50/70">
        <CardContent className="flex items-start gap-3 p-4">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-700" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-medium text-amber-950">Изпращането е изключено — все още няма избран Viber BSP доставчик.</p>
            <p className="mt-1 text-amber-900/80">Този екран само подготвя списъка и записва изрично потвърдените съгласия за промоции. Номерата без записано съгласие не трябва да се включват в кампания.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <div>
              <CardDescription>Телефони с поръчки през {year} г.</CardDescription>
              <CardTitle className="mt-1 text-3xl">{isLoading ? "—" : data?.count ?? 0}</CardTitle>
            </div>
            <UsersRound className="size-5 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <div>
              <CardDescription>С потвърдено съгласие за промоции</CardDescription>
              <CardTitle className="mt-1 text-3xl">{isLoading ? "—" : optedInCount}</CardTitle>
            </div>
            <CheckCircle2 className="size-5 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Списък с контакти</CardTitle>
          <CardDescription>Съгласието се пази по нормализиран телефон и остава валидно независимо от избраната година.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Търси име, телефон или имейл" className="pl-9" aria-label="Търси контакт" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-56" aria-label="Филтър за съгласие">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Всички контакти</SelectItem>
                  <SelectItem value="consented">Със съгласие</SelectItem>
                  <SelectItem value="not-consented">Без записано съгласие</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-3 lg:flex-row lg:items-end">
            <div className="flex-1">
              <Label htmlFor="consent-note">Източник/основание за съгласието</Label>
              <Textarea
                id="consent-note"
                value={consentNote}
                onChange={(event) => setConsentNote(event.target.value)}
                maxLength={500}
                placeholder="Например: формуляр за маркетингово съгласие, запис в CRM..."
                className="mt-2 min-h-16"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" disabled={selectedKeys.length === 0 || saving} onClick={() => setConfirmOptIn(false)}>
                Оттегли за избраните ({selectedKeys.length})
              </Button>
              <Button disabled={selectedKeys.length === 0 || !consentNote.trim() || saving} onClick={() => setConfirmOptIn(true)}>
                Запиши съгласие ({selectedKeys.length})
              </Button>
            </div>
          </div>

          {error ? (
            <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error.message}</p>
          ) : isLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Зареждане на контактите…</p>
          ) : filteredContacts.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Няма контакти за избраните филтри.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox checked={allFilteredSelected} onCheckedChange={toggleAll} aria-label="Избери всички видими контакти" />
                    </TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Поръчки</TableHead>
                    <TableHead>Промоционално съгласие</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.phoneKey}>
                      <TableCell>
                        <Checkbox
                          checked={Boolean(selected[contact.phoneKey])}
                          onCheckedChange={(checked) => setSelected((previous) => ({ ...previous, [contact.phoneKey]: checked === true }))}
                          aria-label={`Избери ${contact.name || contact.phone}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{contact.name || "Без име"}</div>
                        {contact.email && <div className="text-xs text-muted-foreground">{contact.email}</div>}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{contact.phone}</TableCell>
                      <TableCell>{contact.orderCount}</TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1">
                          <Badge variant={contact.marketingOptIn ? "default" : "secondary"}>
                            {contact.marketingOptIn ? "Потвърдено" : "Няма запис"}
                          </Badge>
                          {contact.consentRecordedAt && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(contact.consentRecordedAt).toLocaleDateString("bg-BG")}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Показани {filteredContacts.length} от {contacts.length} телефона. Използвайте „Избери всички видими контакти“, за да маркирате филтрирания списък наведнъж.</p>
        </CardContent>
      </Card>

      <AlertDialog open={confirmOptIn !== null} onOpenChange={(open) => { if (!open && !saving) setConfirmOptIn(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmOptIn ? "Потвърдете маркетинговото съгласие" : "Оттегляне на съгласие"}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmOptIn
                ? `Ще запишете, че ${selectedKeys.length} избрани контакта са дали изрично съгласие да получават промоции във Viber. Посоченият източник ще бъде запазен.`
                : `Ще изключите ${selectedKeys.length} избрани контакта от бъдещи промоционални кампании.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Назад</AlertDialogCancel>
            <AlertDialogAction disabled={saving} onClick={(event) => { event.preventDefault(); void updateConsent() }}>
              {saving ? "Записване..." : confirmOptIn ? "Потвърждавам съгласието" : "Оттегли съгласието"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
