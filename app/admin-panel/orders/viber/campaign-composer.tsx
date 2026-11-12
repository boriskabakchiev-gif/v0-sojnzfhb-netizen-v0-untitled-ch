"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Download, MessageCircle, Send, UsersRound } from "lucide-react"

interface CampaignContact {
  phone: string
  name: string | null
  marketingOptIn: boolean
  consentRecordedAt: string | null
}

interface ViberCampaignComposerProps {
  contacts: CampaignContact[]
  year: string
}

interface InfobipStatus {
  provider: string
  configured: boolean
  missing: string[]
}

interface CampaignSendResult {
  bulkId: string | null
  submittedCount: number
  statusCounts: Record<string, number>
}

const statusFetcher = async (url: string): Promise<InfobipStatus> => {
  const response = await fetch(new URL(url, window.location.origin))
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || "Неуспешна проверка на Infobip")
  return data
}

function csvCell(value: string) {
  const safeValue = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${safeValue.replaceAll('"', '""')}"`
}

export function ViberCampaignComposer({ contacts, year }: ViberCampaignComposerProps) {
  const [campaignName, setCampaignName] = useState("")
  const [message, setMessage] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState("")
  const [sendResult, setSendResult] = useState<CampaignSendResult | null>(null)
  const { data: infobip, error: infobipStatusError } = useSWR<InfobipStatus>(
    "/api/admin/viber-campaigns/send",
    statusFetcher,
  )

  const eligibleContacts = useMemo(
    () => contacts.filter((contact) => contact.marketingOptIn),
    [contacts],
  )

  const exportAudience = () => {
    if (eligibleContacts.length === 0) return

    const rows = [
      ["phone", "name", "consent_recorded_at"],
      ...eligibleContacts.map((contact) => [
        contact.phone,
        contact.name || "",
        contact.consentRecordedAt ? new Date(contact.consentRecordedAt).toISOString() : "",
      ]),
    ]
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `viber-consented-audience-${year}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const sendCampaign = async () => {
    if (!campaignName.trim() || !message.trim() || eligibleContacts.length === 0 || !infobip?.configured) return

    setSending(true)
    setSendError("")
    try {
      const response = await fetch(new URL("/api/admin/viber-campaigns/send", window.location.origin), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: Number(year), campaignName: campaignName.trim(), message: message.trim() }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Изпращането е неуспешно")
      setSendResult(result)
      setConfirmOpen(false)
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Изпращането е неуспешно")
      setConfirmOpen(false)
    } finally {
      setSending(false)
    }
  }

  const canSend = Boolean(
    infobip?.configured &&
    campaignName.trim() &&
    message.trim() &&
    eligibleContacts.length > 0 &&
    !sending &&
    !sendResult,
  )

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <MessageCircle className="size-4 text-violet-600" aria-hidden="true" />
            <Badge variant="secondary">Локална чернова</Badge>
          </div>
          <CardTitle>Viber Business Messages</CardTitle>
          <CardDescription className="mt-1 max-w-2xl">
            Подгответе текста и проверете аудиторията. В списъка за кампанията влизат само контакти с изрично записано съгласие. Черновата не се записва.
          </CardDescription>
        </div>
        <div className="flex min-w-52 items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
          <UsersRound className="size-5 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="text-2xl font-semibold leading-none">{eligibleContacts.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">допустими получатели</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="viber-campaign-name">Име на кампанията</Label>
            <Input
              id="viber-campaign-name"
              value={campaignName}
              onChange={(event) => setCampaignName(event.target.value)}
              placeholder="Например: Есенна промоция"
              maxLength={100}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="viber-campaign-message">Текст на съобщението</Label>
            <Textarea
              id="viber-campaign-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Напишете текста, който искате да изпратите…"
              maxLength={10_000}
              className="min-h-36 resize-y"
            />
            <p className="text-right text-xs text-muted-foreground">{message.length} / 10 000 знака</p>
          </div>
          <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Официален доставчик</p>
              <Badge variant={infobip?.configured ? "default" : "secondary"}>
                {infobip?.configured ? "Infobip · ключовете са зададени" : "Infobip · настройка нужна"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Изпращат се само контакти с потвърдено съгласие за промоции. Viber Bot API не се използва.
            </p>
            {!infobip?.configured && (
              <p className="text-xs text-muted-foreground">
                Добавете данните за Infobip API и одобрения Viber sender в настройките на Vercel.
                {infobip?.missing?.length ? ` Липсват: ${infobip.missing.join(", ")}.` : ""}
              </p>
            )}
            {infobipStatusError && <p role="alert" className="text-sm text-destructive">{infobipStatusError.message}</p>}
            <p className="text-xs text-muted-foreground">Потвърдете съгласието и международния формат на номерата. Изпращането може да бъде таксувано от Infobip.</p>
            <Button type="button" disabled={!canSend} className="w-full sm:w-fit" onClick={() => { setSendError(""); setConfirmOpen(true) }}>
              <Send data-icon="inline-start" />
              {sending ? "Изпращане…" : sendResult ? "Кампанията е изпратена" : `Изпрати към ${eligibleContacts.length} съгласили се`}
            </Button>
            {sendError && <p role="alert" className="text-sm text-destructive">{sendError}</p>}
            {sendResult && (
              <div role="status" className="rounded-md border bg-background p-3 text-sm">
                <p className="font-medium">Infobip прие заявката за {sendResult.submittedCount} получатели.</p>
                {sendResult.bulkId && <p className="mt-1 text-xs text-muted-foreground">Bulk ID: {sendResult.bulkId}</p>}
                <p className="mt-1 text-xs text-muted-foreground">Това потвърждава приемане от API, не крайна доставка. Проверете отчетите в Infobip.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-sm font-medium">Преглед</p>
            <div className="min-h-52 rounded-xl border bg-muted/30 p-4">
              <div className="ml-auto max-w-sm rounded-2xl rounded-br-sm bg-violet-600 px-4 py-3 text-sm text-white shadow-sm">
                <p className="mb-2 text-xs font-semibold text-white/80">{campaignName.trim() || "Вашият бизнес"}</p>
                <p className="whitespace-pre-wrap break-words">{message.trim() || "Текстът на вашето съобщение ще се появи тук."}</p>
              </div>
              <p className="mt-3 text-right text-xs text-muted-foreground">Viber preview · само визуализация</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <div>
              <p className="font-medium">Аудитория · {year}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                CSV съдържа само телефон, име и дата на записаното съгласие за контактите с потвърден маркетингов opt-in.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={exportAudience} disabled={eligibleContacts.length === 0}>
              <Download data-icon="inline-start" />
              Експортирай съгласилите се ({eligibleContacts.length})
            </Button>
          </div>
        </div>
      </CardContent>
      <AlertDialog open={confirmOpen} onOpenChange={(open) => { if (!sending) setConfirmOpen(open) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изпращане чрез Infobip?</AlertDialogTitle>
            <AlertDialogDescription>
              Кампанията „{campaignName.trim()}“ ще бъде подадена за {eligibleContacts.length} контакта с записано съгласие за {year} г. Изпращането може да доведе до такси и не може да бъде отменено. При прекъсване проверете статуса в Infobip преди нов опит.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sending}>Отказ</AlertDialogCancel>
            <AlertDialogAction disabled={sending} onClick={(event) => { event.preventDefault(); void sendCampaign() }}>
              {sending ? "Изпращане…" : "Да, изпрати кампанията"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
