"use client"

import { useState, useMemo } from "react"
import {
  TrendingUp,
  Package,
  MapPin,
  FileText,
  BarChart3,
  Laptop,
  Printer,
  Download,
  Calendar,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Building2,
  Sparkles,
  Clock,
  Box,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { LoadingState } from "./ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { EmptyState } from "./ui/empty-state"
import { Separator } from "./ui/separator"
import { useInstallations } from "../hooks/useInstallations"
import { useStatistics } from "../hooks/useStatistics"
import { useEquipment } from "../hooks/useEquipment"
import { useEvents } from "../hooks/useEvents"
import { useConsumables } from "../hooks/useConsumables"
import { toast } from "sonner"

// Константы оборудования
const TOTAL_LAPTOPS = 25
const TOTAL_BROTHER_PRINTERS = 28
const TOTAL_GODEX_PRINTERS = 21

function AnimatedProgressBar({
  value,
  max,
  color = "primary",
  label,
  showNumbers = true,
  animationDelay = 0,
}: {
  value: number
  max: number
  color?: "primary" | "tertiary" | "warning" | "success" | "destructive"
  label?: string
  showNumbers?: boolean
  animationDelay?: number
}) {
  const percentage = Math.min((value / max) * 100, 100)
  const colorClasses = {
    primary: "from-primary to-primary/70",
    tertiary: "from-tertiary to-tertiary/70",
    warning: "from-warning to-warning/70",
    success: "from-green-500 to-green-400",
    destructive: "from-destructive to-destructive/70",
  }
  const glowClasses = {
    primary: "shadow-primary/30",
    tertiary: "shadow-tertiary/30",
    warning: "shadow-warning/30",
    success: "shadow-green-500/30",
    destructive: "shadow-destructive/30",
  }

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          {showNumbers && (
            <span className="font-medium">
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div className="w-full h-3 bg-muted/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorClasses[color]} shadow-lg ${glowClasses[color]} transition-all duration-1000 ease-out`}
          style={{
            width: `${percentage}%`,
            animationDelay: `${animationDelay}ms`,
          }}
        />
      </div>
    </div>
  )
}

function EquipmentGridItem({
  number,
  isUsed,
  color = "primary",
  size = "md",
}: {
  number: number
  isUsed: boolean
  color?: "primary" | "tertiary" | "warning"
  size?: "sm" | "md"
}) {
  const colorClasses = {
    primary: isUsed ? "bg-primary text-primary-foreground shadow-primary/30" : "bg-muted/50 text-muted-foreground",
    tertiary: isUsed ? "bg-tertiary text-white shadow-tertiary/30" : "bg-muted/50 text-muted-foreground",
    warning: isUsed ? "bg-warning text-white shadow-warning/30" : "bg-muted/50 text-muted-foreground",
  }
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg flex items-center justify-center font-medium transition-all duration-300 ${colorClasses[color]} ${isUsed ? "shadow-md scale-100" : "scale-95 opacity-60"}`}
    >
      {number}
    </div>
  )
}

function PavilionFillAnimation({
  zone,
  usage,
  maxUsage,
  installations,
}: {
  zone: string
  usage: number
  maxUsage: number
  installations: any[]
}) {
  const percentage = maxUsage > 0 ? (usage / maxUsage) * 100 : 0
  const zoneInstallations = installations.filter((inst) => inst.rack?.startsWith(zone))

  const getColorByPercentage = (pct: number) => {
    if (pct < 25) return { bg: "from-tertiary/20 to-tertiary/5", border: "border-tertiary/50", text: "text-tertiary" }
    if (pct < 50) return { bg: "from-primary/20 to-primary/5", border: "border-primary/50", text: "text-primary" }
    if (pct < 75) return { bg: "from-warning/20 to-warning/5", border: "border-warning/50", text: "text-warning" }
    return { bg: "from-destructive/20 to-destructive/5", border: "border-destructive/50", text: "text-destructive" }
  }

  const colors = getColorByPercentage(percentage)

  return (
    <div className={`relative rounded-xl border-2 ${colors.border} overflow-hidden transition-all duration-500`}>
      {/* Animated fill background */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${colors.bg} transition-all duration-1000 ease-out`}
        style={{ height: `${Math.max(percentage, 10)}%` }}
      />

      <div className="relative p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className={`h-5 w-5 ${colors.text}`} />
            <span className="font-semibold text-lg">Павильон {zone}</span>
          </div>
          <Badge variant="secondary" className="shadow-sm">
            {usage} установок
          </Badge>
        </div>

        {/* Mini progress bar */}
        <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              percentage < 25
                ? "bg-tertiary"
                : percentage < 50
                  ? "bg-primary"
                  : percentage < 75
                    ? "bg-warning"
                    : "bg-destructive"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Список стоек */}
        {zoneInstallations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {zoneInstallations.slice(0, 8).map((inst, idx) => (
              <Badge
                key={inst.id}
                variant="outline"
                className="text-xs animate-scale-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {inst.rack}
              </Badge>
            ))}
            {zoneInstallations.length > 8 && (
              <Badge variant="secondary" className="text-xs">
                +{zoneInstallations.length - 8}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function StatisticsPage() {
  const { installations } = useInstallations()
  const { laptops } = useEquipment()
  const { loading } = useStatistics()
  const { events } = useEvents()
  const { brotherConsumables, godexConsumables } = useConsumables()

  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [showEquipmentPopup, setShowEquipmentPopup] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [selectedEventForReport, setSelectedEventForReport] = useState<number | null>(null)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [showConsumablesPopup, setShowConsumablesPopup] = useState(false)

  const stats = useMemo(() => {
    const totalInstallations = installations.length
    const uniqueRacks = new Set(installations.map((inst) => inst.rack)).size

    // Использование ноутбуков
    const usedLaptops = new Set(installations.map((inst) => Number(inst.laptop)).filter(Boolean))

    // Использование Brother принтеров
    const usedBrotherPrinters = new Set(
      [
        ...installations.filter((inst) => inst.printer_type === "brother").map((inst) => inst.printer_number),
        ...installations
          .filter((inst) => inst.second_printer_type === "brother")
          .map((inst) => inst.second_printer_number),
      ].filter(Boolean),
    )

    // Использование Godex принтеров
    const usedGodexPrinters = new Set(
      [
        ...installations.filter((inst) => inst.printer_type === "godex").map((inst) => inst.printer_number),
        ...installations
          .filter((inst) => inst.second_printer_type === "godex")
          .map((inst) => inst.second_printer_number),
      ].filter(Boolean),
    )

    // Типы принтеров в установках
    const brotherCount = installations.filter(
      (inst) => inst.printer_type === "brother" || inst.second_printer_type === "brother",
    ).length
    const godexCount = installations.filter(
      (inst) => inst.printer_type === "godex" || inst.second_printer_type === "godex",
    ).length
    const noPrinterCount = installations.filter((inst) => !inst.printer_type && !inst.second_printer_type).length

    // Зоны
    const zoneStats: Record<string, number> = {}
    ;["C", "D", "E", "F", "G", "H"].forEach((zone) => {
      zoneStats[zone] = installations.filter((inst) => inst.rack?.startsWith(zone)).length
    })

    return {
      totalInstallations,
      uniqueRacks,
      usedLaptops: usedLaptops.size,
      usedLaptopsSet: usedLaptops,
      usedBrotherPrinters: usedBrotherPrinters.size,
      usedBrotherPrintersSet: usedBrotherPrinters,
      usedGodexPrinters: usedGodexPrinters.size,
      usedGodexPrintersSet: usedGodexPrinters,
      brotherCount,
      godexCount,
      noPrinterCount,
      zoneStats,
      freeLaptops: TOTAL_LAPTOPS - usedLaptops.size,
      freeBrotherPrinters: TOTAL_BROTHER_PRINTERS - usedBrotherPrinters.size,
      freeGodexPrinters: TOTAL_GODEX_PRINTERS - usedGodexPrinters.size,
    }
  }, [installations])

  const consumablesStats = useMemo(() => {
    const brotherTotal = brotherConsumables?.reduce((sum, c) => sum + c.quantity, 0) || 0
    const godexTotal = godexConsumables?.reduce((sum, c) => sum + c.quantity, 0) || 0
    const brotherLow = brotherConsumables?.filter((c) => c.quantity <= (c.min_quantity || 0)).length || 0
    const godexLow = godexConsumables?.filter((c) => c.quantity <= (c.min_quantity || 0)).length || 0

    return {
      brotherTotal,
      godexTotal,
      total: brotherTotal + godexTotal,
      brotherLow,
      godexLow,
      lowCount: brotherLow + godexLow,
      brotherItems: brotherConsumables || [],
      godexItems: godexConsumables || [],
    }
  }, [brotherConsumables, godexConsumables])

  const heatmapZones = ["C", "D", "E", "F", "G", "H"]
  const maxUsage = Math.max(...Object.values(stats.zoneStats), 1)

  const getZoneColor = (usage: number) => {
    const intensity = usage / maxUsage
    if (intensity === 0) return "bg-muted"
    if (intensity < 0.25) return "bg-tertiary"
    if (intensity < 0.5) return "bg-primary"
    if (intensity < 0.75) return "bg-warning"
    return "bg-destructive"
  }

  const zoneInstallations = selectedZone ? installations.filter((inst) => inst.rack?.startsWith(selectedZone)) : []

  const generateMarkdownReport = async (eventId?: number | null) => {
    setGeneratingReport(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const now = new Date()
    const dateStr = now.toLocaleDateString("ru-RU")
    const timeStr = now.toLocaleTimeString("ru-RU")

    let reportInstallations = installations
    let reportTitle = "Общий отчёт по установкам"
    let eventInfo = ""

    if (eventId) {
      const event = events.find((e) => e.id === eventId)
      if (event) {
        reportInstallations = installations.filter((inst) => inst.event_id === eventId)
        reportTitle = `Отчёт по мероприятию: ${event.name}`
        eventInfo = `
## Информация о мероприятии

| Параметр | Значение |
|----------|----------|
| Название | ${event.name} |
| Дата начала | ${event.start_date ? new Date(event.start_date).toLocaleDateString("ru-RU") : "Н/Д"} |
| Дата окончания | ${event.end_date ? new Date(event.end_date).toLocaleDateString("ru-RU") : "Н/Д"} |
| Локация | ${event.location || "Экспофорум"} |
`
      }
    }

    const reportStats = {
      total: reportInstallations.length,
      uniqueRacks: new Set(reportInstallations.map((i) => i.rack)).size,
      laptops: new Set(reportInstallations.map((i) => i.laptop).filter(Boolean)).size,
      brotherPrinters: new Set(
        [
          ...reportInstallations.filter((i) => i.printer_type === "brother").map((i) => i.printer_number),
          ...reportInstallations.filter((i) => i.second_printer_type === "brother").map((i) => i.second_printer_number),
        ].filter(Boolean),
      ).size,
      godexPrinters: new Set(
        [
          ...reportInstallations.filter((i) => i.printer_type === "godex").map((i) => i.printer_number),
          ...reportInstallations.filter((i) => i.second_printer_type === "godex").map((i) => i.second_printer_number),
        ].filter(Boolean),
      ).size,
    }

    const zoneBreakdown = heatmapZones
      .map((zone) => {
        const count = reportInstallations.filter((i) => i.rack?.startsWith(zone)).length
        return `| ${zone} | ${count} |`
      })
      .join("\n")

    const installationsList = reportInstallations
      .map((inst) => {
        const printer1 = inst.printer_type
          ? `${inst.printer_type === "brother" ? "Brother" : "Godex"} #${inst.printer_number}`
          : "—"
        const printer2 = inst.second_printer_type
          ? `${inst.second_printer_type === "brother" ? "Brother" : "Godex"} #${inst.second_printer_number}`
          : "—"
        return `| ${inst.rack} | #${inst.laptop} | ${printer1} | ${printer2} |`
      })
      .join("\n")

    const brotherConsumablesList = consumablesStats.brotherItems
      .map(
        (c) =>
          `| ${c.name} | ${c.quantity} | ${c.min_quantity || 0} | ${c.quantity <= (c.min_quantity || 0) ? "НИЗКИЙ" : "OK"} |`,
      )
      .join("\n")

    const godexConsumablesList = consumablesStats.godexItems
      .map(
        (c) =>
          `| ${c.name} | ${c.quantity} | ${c.min_quantity || 0} | ${c.quantity <= (c.min_quantity || 0) ? "НИЗКИЙ" : "OK"} |`,
      )
      .join("\n")

    const markdown = `# ${reportTitle}

> Сгенерировано: ${dateStr} в ${timeStr}

${eventInfo}

## Общая статистика

| Показатель | Значение |
|------------|----------|
| Всего установок | ${reportStats.total} |
| Уникальных стоек | ${reportStats.uniqueRacks} |
| Ноутбуков задействовано | ${reportStats.laptops} из ${TOTAL_LAPTOPS} |
| Brother принтеров | ${reportStats.brotherPrinters} из ${TOTAL_BROTHER_PRINTERS} |
| Godex принтеров | ${reportStats.godexPrinters} из ${TOTAL_GODEX_PRINTERS} |

## Распределение по павильонам

| Павильон | Количество установок |
|----------|---------------------|
${zoneBreakdown}

## Детализация установок

| Стойка | Ноутбук | Принтер 1 | Принтер 2 |
|--------|---------|-----------|-----------|
${installationsList || "| — | — | — | — |"}

## Расходные материалы

### Brother расходники

| Название | Количество | Минимум | Статус |
|----------|------------|---------|--------|
${brotherConsumablesList || "| — | — | — | — |"}

### Godex расходники

| Название | Количество | Минимум | Статус |
|----------|------------|---------|--------|
${godexConsumablesList || "| — | — | — | — |"}

**Итого расходников:** ${consumablesStats.total} шт (Brother: ${consumablesStats.brotherTotal}, Godex: ${consumablesStats.godexTotal})

${consumablesStats.lowCount > 0 ? `⚠️ **Внимание:** ${consumablesStats.lowCount} позиций с низким остатком!` : "✅ Все расходники в норме"}

## Использование оборудования

### Ноутбуки (${reportStats.laptops}/${TOTAL_LAPTOPS})

**Занятые:** ${
      Array.from(new Set(reportInstallations.map((i) => i.laptop).filter(Boolean)))
        .sort((a, b) => Number(a) - Number(b))
        .map((n) => `#${n}`)
        .join(", ") || "нет"
    }

**Свободные:** ${Array.from({ length: TOTAL_LAPTOPS }, (_, i) => i + 1)
      .filter((n) => !reportInstallations.some((i) => Number(i.laptop) === n))
      .map((n) => `#${n}`)
      .join(", ")}

### Brother принтеры (${reportStats.brotherPrinters}/${TOTAL_BROTHER_PRINTERS})

**Занятые:** ${
      Array.from(
        new Set(
          [
            ...reportInstallations.filter((i) => i.printer_type === "brother").map((i) => i.printer_number),
            ...reportInstallations
              .filter((i) => i.second_printer_type === "brother")
              .map((i) => i.second_printer_number),
          ].filter(Boolean),
        ),
      )
        .sort((a, b) => Number(a) - Number(b))
        .map((n) => `#${n}`)
        .join(", ") || "нет"
    }

### Godex принтеры (${reportStats.godexPrinters}/${TOTAL_GODEX_PRINTERS})

**Занятые:** ${
      Array.from(
        new Set(
          [
            ...reportInstallations.filter((i) => i.printer_type === "godex").map((i) => i.printer_number),
            ...reportInstallations.filter((i) => i.second_printer_type === "godex").map((i) => i.second_printer_number),
          ].filter(Boolean),
        ),
      )
        .sort((a, b) => Number(a) - Number(b))
        .map((n) => `#${n}`)
        .join(", ") || "нет"
    }

---

*Отчёт сформирован автоматически системой управления оборудованием*
`

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const filename = eventId
      ? `report-event-${eventId}-${now.toISOString().split("T")[0]}.md`
      : `report-all-${now.toISOString().split("T")[0]}.md`
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setGeneratingReport(false)
    setShowReportDialog(false)
    toast.success("Отчёт сгенерирован", {
      description: `Файл ${filename} загружен`,
    })
  }

  if (loading) {
    return <LoadingState message="Загрузка статистики..." />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-heading text-xl font-semibold">Статистика</h2>

      {/* Основные карточки */}
      <div className="grid grid-cols-2 gap-4">
        <Card
          className="border-border/40 bg-card/50 shadow-sm hover:shadow-md transition-all duration-200 animate-slide-up stagger-1"
          style={{ opacity: 0 }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Package className="h-4 w-4 text-primary" />
              </div>
              Установки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-semibold font-heading">{stats.totalInstallations}</div>
            <Badge variant="default" className="gap-1 shadow-sm">
              <TrendingUp className="h-3 w-3" />
              Активных
            </Badge>
          </CardContent>
        </Card>

        <Card
          className="border-border/40 bg-card/50 shadow-sm hover:shadow-md transition-all duration-200 animate-slide-up stagger-2"
          style={{ opacity: 0 }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              Стойки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-semibold font-heading">{stats.uniqueRacks}</div>
            <Badge variant="secondary" className="gap-1 shadow-sm">
              Используется
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Использование оборудования */}
      <Card
        className="border-border/40 bg-card/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer animate-slide-up stagger-3"
        style={{ opacity: 0 }}
        onClick={() => setShowEquipmentPopup(true)}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Laptop className="h-4 w-4 text-primary" />
              </div>
              Использование оборудования
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatedProgressBar
            value={stats.usedLaptops}
            max={TOTAL_LAPTOPS}
            color="primary"
            label="Ноутбуки"
            animationDelay={100}
          />
          <AnimatedProgressBar
            value={stats.usedBrotherPrinters}
            max={TOTAL_BROTHER_PRINTERS}
            color="tertiary"
            label="Brother"
            animationDelay={200}
          />
          <AnimatedProgressBar
            value={stats.usedGodexPrinters}
            max={TOTAL_GODEX_PRINTERS}
            color="warning"
            label="Godex"
            animationDelay={300}
          />
        </CardContent>
      </Card>

      <Card
        className="border-border/40 bg-card/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer animate-slide-up stagger-4"
        style={{ opacity: 0 }}
        onClick={() => setShowConsumablesPopup(true)}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-tertiary/10 p-1.5">
                <Box className="h-4 w-4 text-tertiary" />
              </div>
              Расходные материалы
            </div>
            <div className="flex items-center gap-2">
              {consumablesStats.lowCount > 0 && (
                <Badge variant="destructive" className="shadow-sm">
                  {consumablesStats.lowCount} низкий
                </Badge>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-tertiary/5 border border-tertiary/20">
              <div className="text-2xl font-semibold text-tertiary">{consumablesStats.brotherTotal}</div>
              <div className="text-xs text-muted-foreground">Brother</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-warning/5 border border-warning/20">
              <div className="text-2xl font-semibold text-warning">{consumablesStats.godexTotal}</div>
              <div className="text-xs text-muted-foreground">Godex</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Типы принтеров */}
      <Card className="border-border/40 bg-card/50 shadow-sm animate-slide-up stagger-5" style={{ opacity: 0 }}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Printer className="h-4 w-4 text-primary" />
            </div>
            Типы принтеров в установках
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-tertiary shadow-sm shadow-tertiary/30" />
                <span>Brother</span>
              </div>
              <span className="font-medium">{stats.brotherCount}</span>
            </div>
            <div className="h-6 bg-muted/30 rounded-lg overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-tertiary to-tertiary/70 rounded-lg flex items-center transition-all duration-1000 ease-out"
                style={{
                  width:
                    stats.totalInstallations > 0 ? `${(stats.brotherCount / stats.totalInstallations) * 100}%` : "0%",
                }}
              >
                {stats.brotherCount > 0 && <Printer className="h-4 w-4 text-white ml-2" />}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning shadow-sm shadow-warning/30" />
                <span>Godex</span>
              </div>
              <span className="font-medium">{stats.godexCount}</span>
            </div>
            <div className="h-6 bg-muted/30 rounded-lg overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-warning to-warning/70 rounded-lg flex items-center transition-all duration-1000 ease-out"
                style={{
                  width:
                    stats.totalInstallations > 0 ? `${(stats.godexCount / stats.totalInstallations) * 100}%` : "0%",
                }}
              >
                {stats.godexCount > 0 && <Printer className="h-4 w-4 text-white ml-2" />}
              </div>
            </div>
          </div>

          {/* No printer bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted-foreground/50 shadow-sm" />
                <span className="text-muted-foreground">Без принтера</span>
              </div>
              <span className="font-medium text-muted-foreground">{stats.noPrinterCount}</span>
            </div>
            <div className="h-6 bg-muted/30 rounded-lg overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-muted-foreground/50 to-muted-foreground/30 rounded-lg flex items-center transition-all duration-1000 ease-out"
                style={{
                  width:
                    stats.totalInstallations > 0 ? `${(stats.noPrinterCount / stats.totalInstallations) * 100}%` : "0%",
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Тепловая карта */}
      <div className="animate-slide-up stagger-6" style={{ opacity: 0 }}>
        <h3 className="mb-3 text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Тепловая карта по павильонам
        </h3>
        <Card className="border-border/40 bg-card/50 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {heatmapZones.map((zone, index) => (
                <button
                  key={zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`space-y-2 transition-all duration-200 hover:scale-105 active:scale-95 animate-scale-in stagger-${index + 1}`}
                  style={{ opacity: 0 }}
                >
                  <div
                    className={`aspect-square rounded-xl ${getZoneColor(stats.zoneStats[zone])} flex items-center justify-center shadow-md cursor-pointer transition-all duration-200 relative overflow-hidden`}
                  >
                    <div className="text-center text-white relative z-10">
                      <div className="text-2xl font-bold font-heading">{zone}</div>
                      <div className="text-sm opacity-90">{stats.zoneStats[zone]}</div>
                    </div>
                    {stats.zoneStats[zone] > 0 && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-3 text-xs flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-muted shadow-sm" />
                <span className="text-muted-foreground">Пусто</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-tertiary shadow-sm" />
                <span className="text-muted-foreground">Низкая</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-primary shadow-sm" />
                <span className="text-muted-foreground">Средняя</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-destructive shadow-sm" />
                <span className="text-muted-foreground">Высокая</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Кнопка экспорта */}
      <Button
        className="w-full shadow-md hover:shadow-lg transition-all duration-200 animate-slide-up stagger-7"
        size="lg"
        style={{ opacity: 0 }}
        onClick={() => setShowReportDialog(true)}
      >
        <Download className="mr-2 h-4 w-4" />
        Скачать отчёт
      </Button>

      {/* Попап оборудования */}
      <Dialog open={showEquipmentPopup} onOpenChange={setShowEquipmentPopup}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Детальное использование оборудования
            </DialogTitle>
            <DialogDescription>Занятые и свободные единицы по павильонам</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {/* Заполнение павильонов */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Загрузка павильонов
              </h4>
              <div className="grid gap-3">
                {heatmapZones.map((zone, idx) => (
                  <div key={zone} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms`, opacity: 0 }}>
                    <PavilionFillAnimation
                      zone={zone}
                      usage={stats.zoneStats[zone]}
                      maxUsage={maxUsage}
                      installations={installations}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Ноутбуки */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Laptop className="h-4 w-4 text-primary" />
                Ноутбуки ({stats.usedLaptops}/{TOTAL_LAPTOPS})
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: TOTAL_LAPTOPS }, (_, i) => i + 1).map((num) => (
                  <EquipmentGridItem key={num} number={num} isUsed={stats.usedLaptopsSet.has(num)} color="primary" />
                ))}
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <span>Занят: {stats.usedLaptops}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Свободен: {stats.freeLaptops}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Printer className="h-4 w-4 text-tertiary" />
                Brother ({stats.usedBrotherPrinters}/{TOTAL_BROTHER_PRINTERS})
              </h4>
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: TOTAL_BROTHER_PRINTERS }, (_, i) => i + 1).map((num) => (
                  <EquipmentGridItem
                    key={num}
                    number={num}
                    isUsed={stats.usedBrotherPrintersSet.has(num)}
                    color="tertiary"
                    size="sm"
                  />
                ))}
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-tertiary" />
                  <span>Занят: {stats.usedBrotherPrinters}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Свободен: {stats.freeBrotherPrinters}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Printer className="h-4 w-4 text-warning" />
                Godex ({stats.usedGodexPrinters}/{TOTAL_GODEX_PRINTERS})
              </h4>
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: TOTAL_GODEX_PRINTERS }, (_, i) => i + 1).map((num) => (
                  <EquipmentGridItem
                    key={num}
                    number={num}
                    isUsed={stats.usedGodexPrintersSet.has(num)}
                    color="warning"
                    size="sm"
                  />
                ))}
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-warning" />
                  <span>Занят: {stats.usedGodexPrinters}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Свободен: {stats.freeGodexPrinters}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог экспорта */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Экспорт отчёта
            </DialogTitle>
            <DialogDescription>Выберите тип отчёта для скачивания</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            {/* Общий отчёт */}
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4 px-4 bg-transparent"
              onClick={() => generateMarkdownReport(null)}
              disabled={generatingReport}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Общий отчёт</div>
                  <div className="text-xs text-muted-foreground">
                    Все текущие установки ({stats.totalInstallations} шт)
                  </div>
                </div>
              </div>
            </Button>

            {/* По мероприятиям */}
            {events && events.length > 0 && (
              <>
                <div className="text-sm text-muted-foreground pt-2">По мероприятию:</div>
                {events.slice(0, 5).map((event) => {
                  const eventInstallations = installations.filter((i) => i.event_id === event.id).length
                  return (
                    <Button
                      key={event.id}
                      variant="outline"
                      className="w-full justify-start h-auto py-3 px-4 bg-transparent"
                      onClick={() => generateMarkdownReport(event.id)}
                      disabled={generatingReport}
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-secondary p-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-medium text-sm">{event.name}</div>
                          <div className="text-xs text-muted-foreground">{eventInstallations} установок</div>
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </>
            )}

            {generatingReport && (
              <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                <Clock className="h-4 w-4 animate-spin" />
                <span className="text-sm">Генерация отчёта...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showConsumablesPopup} onOpenChange={setShowConsumablesPopup}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Box className="h-5 w-5 text-tertiary" />
              Расходные материалы
            </DialogTitle>
            <DialogDescription>Текущие остатки по всем категориям</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {/* Сводка */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-2xl font-semibold">{consumablesStats.total}</div>
                <div className="text-xs text-muted-foreground">Всего</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-tertiary/10">
                <div className="text-2xl font-semibold text-tertiary">{consumablesStats.brotherTotal}</div>
                <div className="text-xs text-muted-foreground">Brother</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-warning/10">
                <div className="text-2xl font-semibold text-warning">{consumablesStats.godexTotal}</div>
                <div className="text-xs text-muted-foreground">Godex</div>
              </div>
            </div>

            {consumablesStats.lowCount > 0 && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive">
                  <ArrowDownRight className="h-4 w-4" />
                  <span className="font-medium">{consumablesStats.lowCount} позиций с низким остатком</span>
                </div>
              </div>
            )}

            <Separator />

            {/* Brother */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Printer className="h-4 w-4 text-tertiary" />
                Brother расходники
              </h4>
              <div className="space-y-2">
                {consumablesStats.brotherItems.map((item, idx) => {
                  const isLow = item.quantity <= (item.min_quantity || 0)
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isLow ? "bg-destructive/5 border-destructive/20" : "bg-muted/30 border-border/40"
                      } animate-slide-up`}
                      style={{ animationDelay: `${idx * 50}ms`, opacity: 0 }}
                    >
                      <div className="flex items-center gap-2">
                        {isLow && <ArrowDownRight className="h-4 w-4 text-destructive" />}
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isLow ? "text-destructive" : ""}`}>{item.quantity}</span>
                        <span className="text-xs text-muted-foreground">/ мин. {item.min_quantity || 0}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Godex */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Printer className="h-4 w-4 text-warning" />
                Godex расходники
              </h4>
              <div className="space-y-2">
                {consumablesStats.godexItems.map((item, idx) => {
                  const isLow = item.quantity <= (item.min_quantity || 0)
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isLow ? "bg-destructive/5 border-destructive/20" : "bg-muted/30 border-border/40"
                      } animate-slide-up`}
                      style={{ animationDelay: `${idx * 50}ms`, opacity: 0 }}
                    >
                      <div className="flex items-center gap-2">
                        {isLow && <ArrowDownRight className="h-4 w-4 text-destructive" />}
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isLow ? "text-destructive" : ""}`}>{item.quantity}</span>
                        <span className="text-xs text-muted-foreground">/ мин. {item.min_quantity || 0}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Модальное окно для павильона */}
      <Dialog open={!!selectedZone} onOpenChange={(open) => !open && setSelectedZone(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg ${getZoneColor(stats.zoneStats[selectedZone || ""])} flex items-center justify-center text-white font-bold`}
              >
                {selectedZone}
              </div>
              Павильон {selectedZone}
            </DialogTitle>
            <DialogDescription>{zoneInstallations.length} установок</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {zoneInstallations.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Нет установок"
                description="В этом павильоне пока нет активных установок"
                iconColor="muted"
              />
            ) : (
              zoneInstallations.map((inst, index) => {
                const laptop = laptops.find((l) => l.id === inst.laptop || l.id.toString() === inst.laptop?.toString())
                return (
                  <Card
                    key={inst.id}
                    className={`border-border/40 bg-card/50 shadow-sm hover:shadow-md transition-all duration-200 animate-slide-up stagger-${Math.min(index + 1, 8)}`}
                    style={{ opacity: 0 }}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Стойка {inst.rack}</span>
                        <Badge variant="secondary" className="shadow-sm">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Активна
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Laptop className="h-4 w-4" />
                        <span>Ноутбук #{inst.laptop}</span>
                      </div>
                      {(inst.printer_type || inst.second_printer_type) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Printer className="h-4 w-4" />
                          <span>
                            {inst.printer_type &&
                              `${inst.printer_type === "brother" ? "Brother" : "Godex"} #${inst.printer_number}`}
                            {inst.second_printer_type &&
                              `, ${inst.second_printer_type === "brother" ? "Brother" : "Godex"} #${inst.second_printer_number}`}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
