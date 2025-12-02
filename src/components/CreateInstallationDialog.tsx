"use client"

import { useState, useMemo } from "react"
import { Plus, ArrowLeft, ArrowRight, Calendar, Check, Layers, Monitor, Printer, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { StepProgress } from "./ui/progress"
import { Card, CardContent } from "./ui/card"
import { Separator } from "./ui/separator"
import { toast } from "sonner"
import { useInstallations } from "../hooks/useInstallations"
import { useTelegramAuth } from "../hooks/useTelegramAuth"
import { useEvents } from "../hooks/useEvents"
import { activityApi } from "../lib/api"
import { frontendAnalyticsApi } from "../lib/api/analytics"
import { getUserAvatarUrl } from "../utils/avatarUtils"

interface CreateInstallationDialogProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

const ZONES = ["C", "D", "E", "F", "G", "H"] as const
const ZONE_RANGES = {
  C: { start: 3, end: 7 },
  D: { start: 1, end: 10 },
  E: { start: 12, end: 21 },
  F: { start: 28, end: 51 },
  G: { start: 57, end: 80 },
  H: { start: 86, end: 109 },
} as const

const LAPTOPS = Array.from({ length: 25 }, (_, i) => i + 1)
const BROTHER_PRINTERS = Array.from({ length: 28 }, (_, i) => i + 1)
const GODEX_PRINTERS = Array.from({ length: 21 }, (_, i) => i + 1)

type Step =
  | "mode"
  | "event"
  | "zone"
  | "booth"
  | "laptop"
  | "printer-type"
  | "printer-number"
  | "second-printer-type"
  | "second-printer-number"
  | "bulk-config"
  | "bulk-summary"
type PrinterType = "none" | "brother" | "godex"
type InstallationMode = "single" | "bulk"

interface BulkRackConfig {
  rack: string
  laptop: number | null
  printerType: PrinterType
  printerNumber: number | null
  secondPrinterType: PrinterType
  secondPrinterNumber: number | null
}

const STEP_ORDER: Step[] = [
  "mode",
  "event",
  "zone",
  "booth",
  "laptop",
  "printer-type",
  "printer-number",
  "second-printer-type",
  "second-printer-number",
]
const STEP_LABELS = ["Режим", "Событие", "Зона", "Стойки", "Оборудование"]

export function CreateInstallationDialog({ open, onClose, onSuccess }: CreateInstallationDialogProps) {
  const [mode, setMode] = useState<InstallationMode>("single")
  const [step, setStep] = useState<Step>("mode")
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null)
  const [selectedZone, setSelectedZone] = useState<string>("")
  const [selectedBooth, setSelectedBooth] = useState<string>("")
  const [selectedLaptop, setSelectedLaptop] = useState<number | null>(null)
  const [printerType, setPrinterType] = useState<PrinterType>("none")
  const [selectedPrinter, setSelectedPrinter] = useState<number | null>(null)
  const [secondPrinterType, setSecondPrinterType] = useState<PrinterType>("none")
  const [selectedSecondPrinter, setSelectedSecondPrinter] = useState<number | null>(null)
  const [laptopPage, setLaptopPage] = useState(0)
  const [printerPage, setPrinterPage] = useState(0)
  const [secondPrinterPage, setSecondPrinterPage] = useState(0)

  const [selectedBooths, setSelectedBooths] = useState<string[]>([])
  const [bulkConfigs, setBulkConfigs] = useState<BulkRackConfig[]>([])
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const itemsPerPage = 5

  const { user } = useTelegramAuth()
  const { createInstallation, installations } = useInstallations()
  const { events } = useEvents()

  const currentStepIndex = useMemo(() => {
    if (mode === "bulk") {
      switch (step) {
        case "mode":
          return 0
        case "event":
          return 1
        case "zone":
          return 2
        case "booth":
          return 3
        case "bulk-config":
        case "bulk-summary":
          return 4
        default:
          return 0
      }
    }
    switch (step) {
      case "mode":
        return 0
      case "event":
        return 1
      case "zone":
        return 2
      case "booth":
        return 3
      case "laptop":
      case "printer-type":
      case "printer-number":
      case "second-printer-type":
      case "second-printer-number":
        return 4
      default:
        return 0
    }
  }, [step, mode])

  // Получаем активные мероприятия
  const activeEvents = events.filter((e) => e.status === "active" || e.status === "upcoming")

  // Получаем список занятых стоек
  const occupiedRacks = new Set(installations.map((inst) => inst.rack))

  // Получаем список занятых ноутбуков
  const occupiedLaptops = new Set(
    installations
      .map((inst) => inst.laptop)
      .filter(Boolean)
      .map((l) => Number(l)),
  )

  const sessionOccupiedLaptops = useMemo(() => {
    const set = new Set(occupiedLaptops)
    bulkConfigs.forEach((config, idx) => {
      if (idx !== currentConfigIndex && config.laptop) {
        set.add(config.laptop)
      }
    })
    return set
  }, [occupiedLaptops, bulkConfigs, currentConfigIndex])

  // Получаем список занятых принтеров Brother
  const occupiedBrotherPrinters = new Set(
    installations
      .filter((inst) => inst.printer_type === "brother" && inst.printer_number)
      .map((inst) => inst.printer_number!),
  )

  // Получаем список занятых принтеров Godex
  const occupiedGodexPrinters = new Set(
    installations
      .filter((inst) => inst.printer_type === "godex" && inst.printer_number)
      .map((inst) => inst.printer_number!),
  )

  // Получаем список занятых вторых принтеров
  const occupiedSecondBrotherPrinters = new Set(
    installations
      .filter((inst) => inst.second_printer_type === "brother" && inst.second_printer_number)
      .map((inst) => inst.second_printer_number!),
  )

  const occupiedSecondGodexPrinters = new Set(
    installations
      .filter((inst) => inst.second_printer_type === "godex" && inst.second_printer_number)
      .map((inst) => inst.second_printer_number!),
  )

  const sessionOccupiedBrother = useMemo(() => {
    const set = new Set([...occupiedBrotherPrinters, ...occupiedSecondBrotherPrinters])
    bulkConfigs.forEach((config, idx) => {
      if (idx !== currentConfigIndex) {
        if (config.printerType === "brother" && config.printerNumber) set.add(config.printerNumber)
        if (config.secondPrinterType === "brother" && config.secondPrinterNumber) set.add(config.secondPrinterNumber)
      }
    })
    return set
  }, [occupiedBrotherPrinters, occupiedSecondBrotherPrinters, bulkConfigs, currentConfigIndex])

  const sessionOccupiedGodex = useMemo(() => {
    const set = new Set([...occupiedGodexPrinters, ...occupiedSecondGodexPrinters])
    bulkConfigs.forEach((config, idx) => {
      if (idx !== currentConfigIndex) {
        if (config.printerType === "godex" && config.printerNumber) set.add(config.printerNumber)
        if (config.secondPrinterType === "godex" && config.secondPrinterNumber) set.add(config.secondPrinterNumber)
      }
    })
    return set
  }, [occupiedGodexPrinters, occupiedSecondGodexPrinters, bulkConfigs, currentConfigIndex])

  // Получаем зоны для мероприятия
  const getEventZones = (eventId: number): (typeof ZONES)[number][] => {
    const event = events.find((e) => e.id === eventId)
    if (!event?.zones || event.zones.length === 0) return [...ZONES]
    return event.zones.filter((z) => ZONES.includes(z as (typeof ZONES)[number])) as (typeof ZONES)[number][]
  }

  const handleClose = () => {
    setMode("single")
    setStep("mode")
    setSelectedEvent(null)
    setSelectedZone("")
    setSelectedBooth("")
    setSelectedLaptop(null)
    setPrinterType("none")
    setSelectedPrinter(null)
    setSecondPrinterType("none")
    setSelectedSecondPrinter(null)
    setLaptopPage(0)
    setPrinterPage(0)
    setSecondPrinterPage(0)
    setSelectedBooths([])
    setBulkConfigs([])
    setCurrentConfigIndex(0)
    setIsSubmitting(false)
    onClose()
  }

  const handleSubmitSingle = async () => {
    if (!selectedZone || !selectedBooth || selectedLaptop === null) return

    const startTime = performance.now()

    try {
      await createInstallation({
        rack: `${selectedZone}${selectedBooth}`,
        laptop: selectedLaptop,
        printer_type: printerType !== "none" ? printerType : null,
        printer_number: selectedPrinter || null,
        second_printer_type: secondPrinterType !== "none" ? secondPrinterType : null,
        second_printer_number: selectedSecondPrinter || null,
        event_id: selectedEvent || undefined,
      })

      // Формируем описание оборудования
      let equipmentDesc = `Ноутбук #${selectedLaptop}`
      if (printerType !== "none" && selectedPrinter) {
        equipmentDesc += `, ${printerType === "brother" ? "Brother" : "Godex"} #${selectedPrinter}`
      }
      if (secondPrinterType !== "none" && selectedSecondPrinter) {
        equipmentDesc += `, ${secondPrinterType === "brother" ? "Brother" : "Godex"} #${selectedSecondPrinter}`
      }

      // Получаем аватар пользователя
      let avatarUrl: string | null = null
      if (user?.id) {
        try {
          avatarUrl = await getUserAvatarUrl(user.id, user.photo_url)
        } catch (avatarError) {
          console.error("Error getting avatar URL:", avatarError)
        }
      }

      // Логируем активность
      try {
        await activityApi.create({
          user_id: user?.id?.toString() || "",
          username: user?.username || user?.first_name || "Unknown",
          action_type: "create_installation",
          item_type: "installation",
          item_name: `Стойка ${selectedZone}${selectedBooth}`,
          avatar_url: avatarUrl || undefined,
        })
      } catch (activityError) {
        console.error("Error logging activity:", activityError)
      }

      // Логируем аналитику фронтенда
      const responseTime = Math.round(performance.now() - startTime)
      try {
        await frontendAnalyticsApi.logAction(
          "create_installation",
          {
            rack: `${selectedZone}${selectedBooth}`,
            laptop: selectedLaptop,
            printer_type: printerType !== "none" ? printerType : null,
            printer_number: selectedPrinter || null,
            second_printer_type: secondPrinterType !== "none" ? secondPrinterType : null,
            second_printer_number: selectedSecondPrinter || null,
            event_id: selectedEvent || null,
          },
          user?.id,
          user?.username,
          responseTime,
        )
      } catch (analyticsError) {
        console.error("Error logging frontend analytics:", analyticsError)
      }

      toast.success(`Установка ${selectedZone}${selectedBooth} создана`, {
        description: equipmentDesc,
      })

      window.dispatchEvent(new Event("activityNeedsUpdate"))

      if (onSuccess) {
        onSuccess()
      }

      handleClose()
    } catch (error) {
      console.error("Error creating installation:", error)
    }
  }

  const handleSubmitBulk = async () => {
    if (bulkConfigs.length === 0) return

    // Проверяем что все конфиги валидны
    const invalidConfigs = bulkConfigs.filter((c) => !c.laptop)
    if (invalidConfigs.length > 0) {
      toast.error("Не все стойки настроены", {
        description: `Укажите ноутбуки для: ${invalidConfigs.map((c) => c.rack).join(", ")}`,
      })
      return
    }

    setIsSubmitting(true)
    const startTime = performance.now()
    let successCount = 0
    let errorCount = 0

    for (const config of bulkConfigs) {
      try {
        await createInstallation({
          rack: config.rack,
          laptop: config.laptop!,
          printer_type: config.printerType !== "none" ? config.printerType : null,
          printer_number: config.printerNumber || null,
          second_printer_type: config.secondPrinterType !== "none" ? config.secondPrinterType : null,
          second_printer_number: config.secondPrinterNumber || null,
          event_id: selectedEvent || undefined,
        })
        successCount++
      } catch (error) {
        console.error(`Error creating installation for ${config.rack}:`, error)
        errorCount++
      }
    }

    // Получаем аватар пользователя
    let avatarUrl: string | null = null
    if (user?.id) {
      try {
        avatarUrl = await getUserAvatarUrl(user.id, user.photo_url)
      } catch (avatarError) {
        console.error("Error getting avatar URL:", avatarError)
      }
    }

    // Логируем активность
    try {
      await activityApi.create({
        user_id: user?.id?.toString() || "",
        username: user?.username || user?.first_name || "Unknown",
        action_type: "create_installation",
        item_type: "installation",
        item_name: `Массовое создание: ${successCount} установок`,
        avatar_url: avatarUrl || undefined,
      })
    } catch (activityError) {
      console.error("Error logging activity:", activityError)
    }

    // Логируем аналитику
    const responseTime = Math.round(performance.now() - startTime)
    try {
      await frontendAnalyticsApi.logAction(
        "bulk_create_installation",
        {
          count: successCount,
          event_id: selectedEvent || null,
          racks: bulkConfigs.map((c) => c.rack),
        },
        user?.id,
        user?.username,
        responseTime,
      )
    } catch (analyticsError) {
      console.error("Error logging frontend analytics:", analyticsError)
    }

    if (successCount > 0) {
      toast.success(`Создано ${successCount} установок`, {
        description: errorCount > 0 ? `${errorCount} ошибок` : undefined,
      })
    }

    if (errorCount > 0 && successCount === 0) {
      toast.error("Ошибка создания установок")
    }

    window.dispatchEvent(new Event("activityNeedsUpdate"))

    if (onSuccess) {
      onSuccess()
    }

    setIsSubmitting(false)
    handleClose()
  }

  const getBoothNumbers = () => {
    if (!selectedZone) return []
    const range = ZONE_RANGES[selectedZone as keyof typeof ZONE_RANGES]
    return Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start + i)
  }

  const getPaginatedItems = (items: number[], page: number) => {
    const start = page * itemsPerPage
    return items.slice(start, start + itemsPerPage)
  }

  const getTotalPages = (items: number[]) => Math.ceil(items.length / itemsPerPage)

  const initBulkConfigs = () => {
    const configs: BulkRackConfig[] = selectedBooths.map((booth) => ({
      rack: `${selectedZone}${booth}`,
      laptop: null,
      printerType: "none",
      printerNumber: null,
      secondPrinterType: "none",
      secondPrinterNumber: null,
    }))
    setBulkConfigs(configs)
    setCurrentConfigIndex(0)
  }

  const updateCurrentConfig = (updates: Partial<BulkRackConfig>) => {
    setBulkConfigs((prev) =>
      prev.map((config, idx) => (idx === currentConfigIndex ? { ...config, ...updates } : config)),
    )
  }

  const renderStepContent = () => {
    switch (step) {
      case "mode":
        return (
          <div className="space-y-3 animate-fade-in">
            <Label className="text-base">Выберите режим создания</Label>
            <div className="grid gap-3">
              <Button
                variant="outline"
                className="h-auto justify-start p-4 transition-all hover:scale-[1.01] hover:border-primary bg-transparent"
                onClick={() => {
                  setMode("single")
                  setStep("event")
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Monitor className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Одиночная установка</div>
                    <div className="text-xs text-muted-foreground">1 стойка, 1 ноутбук, до 2 принтеров</div>
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto justify-start p-4 transition-all hover:scale-[1.01] hover:border-primary bg-transparent"
                onClick={() => {
                  setMode("bulk")
                  setStep("event")
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-tertiary/10 p-2">
                    <Layers className="h-5 w-5 text-tertiary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Массовая установка</div>
                    <div className="text-xs text-muted-foreground">Несколько стоек с оборудованием</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        )

      case "event":
        return (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep("mode")} className="hover:bg-primary/10">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Label className="text-base">Выберите мероприятие</Label>
            </div>
            <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-1">
              <Button
                variant={selectedEvent === null ? "default" : "outline"}
                className="h-auto justify-start p-4 transition-all hover:scale-[1.01]"
                onClick={() => {
                  setSelectedEvent(null)
                  setStep("zone")
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary-foreground/20 p-2">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Без мероприятия</div>
                    <div className="text-xs opacity-70">Быстрая установка</div>
                  </div>
                </div>
              </Button>
              {activeEvents.map((event, index) => (
                <Button
                  key={event.id}
                  variant={selectedEvent === event.id ? "default" : "outline"}
                  className="h-auto justify-start p-4 transition-all hover:scale-[1.01]"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => {
                    setSelectedEvent(event.id || null)
                    setStep("zone")
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="rounded-lg bg-tertiary/20 p-2">
                      <Calendar className="h-5 w-5 text-tertiary" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium truncate">{event.name}</div>
                      <div className="text-xs opacity-70 truncate">{event.location}</div>
                    </div>
                    {event.status === "upcoming" && (
                      <Badge variant="outline" className="shrink-0">
                        Скоро
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )

      case "zone":
        const availableZones = selectedEvent ? getEventZones(selectedEvent) : ZONES
        return (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep("event")} className="hover:bg-primary/10">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Label className="text-base">Выберите зону</Label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {availableZones.map((zone, index) => (
                <Button
                  key={zone}
                  variant={selectedZone === zone ? "default" : "outline"}
                  className="h-20 transition-all hover:scale-[1.02] hover:shadow-md"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => {
                    setSelectedZone(zone)
                    setSelectedBooth("")
                    setSelectedBooths([])
                    setStep("booth")
                  }}
                >
                  <div className="text-center">
                    <div className="text-xl font-bold">{zone}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {ZONE_RANGES[zone as keyof typeof ZONE_RANGES].start}-
                      {ZONE_RANGES[zone as keyof typeof ZONE_RANGES].end}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )

      case "booth":
        const boothNumbers = getBoothNumbers()

        if (mode === "bulk") {
          return (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setStep("zone")} className="hover:bg-primary/10">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Label className="text-base">Выберите стойки в зоне {selectedZone}</Label>
              </div>
              <p className="text-xs text-muted-foreground">Выбрано: {selectedBooths.length} стоек</p>
              <div className="grid grid-cols-4 gap-2 max-h-[250px] overflow-y-auto pr-1">
                {boothNumbers.map((num, index) => {
                  const rack = `${selectedZone}${num}`
                  const isOccupied = occupiedRacks.has(rack)
                  const isSelected = selectedBooths.includes(String(num))
                  return (
                    <Button
                      key={num}
                      variant={isSelected ? "default" : "outline"}
                      disabled={isOccupied}
                      className={`h-12 transition-all ${isOccupied ? "opacity-40" : "hover:scale-[1.02]"}`}
                      style={{ animationDelay: `${index * 0.02}s` }}
                      onClick={() => {
                        if (!isOccupied) {
                          setSelectedBooths((prev) =>
                            prev.includes(String(num)) ? prev.filter((b) => b !== String(num)) : [...prev, String(num)],
                          )
                        }
                      }}
                    >
                      <span className="font-semibold">{num}</span>
                      {isSelected && <Check className="h-3 w-3 ml-1" />}
                    </Button>
                  )
                })}
              </div>
              {selectedBooths.length > 0 && (
                <Button
                  className="w-full"
                  onClick={() => {
                    initBulkConfigs()
                    setStep("bulk-config")
                  }}
                >
                  Далее: настроить оборудование ({selectedBooths.length})
                </Button>
              )}
            </div>
          )
        }

        // Single mode - оригинальное поведение
        return (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep("zone")} className="hover:bg-primary/10">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Label className="text-base">Стойка в зоне {selectedZone}</Label>
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {boothNumbers.map((num, index) => {
                const rack = `${selectedZone}${num}`
                const isOccupied = occupiedRacks.has(rack)
                return (
                  <Button
                    key={num}
                    variant={selectedBooth === String(num) ? "default" : "outline"}
                    disabled={isOccupied}
                    className={`h-12 transition-all ${isOccupied ? "opacity-40" : "hover:scale-[1.02]"}`}
                    style={{ animationDelay: `${index * 0.02}s` }}
                    onClick={() => {
                      if (!isOccupied) {
                        setSelectedBooth(String(num))
                        setStep("laptop")
                      }
                    }}
                  >
                    <span className="font-semibold">{num}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        )

      case "bulk-config":
        const currentConfig = bulkConfigs[currentConfigIndex]
        if (!currentConfig) return null

        return (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (currentConfigIndex > 0) {
                      setCurrentConfigIndex(currentConfigIndex - 1)
                    } else {
                      setStep("booth")
                    }
                  }}
                  className="hover:bg-primary/10"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Label className="text-base">Стойка {currentConfig.rack}</Label>
              </div>
              <Badge variant="secondary">
                {currentConfigIndex + 1} / {bulkConfigs.length}
              </Badge>
            </div>

            {/* Прогресс по стойкам */}
            <div className="flex gap-1">
              {bulkConfigs.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    idx < currentConfigIndex ? "bg-primary" : idx === currentConfigIndex ? "bg-primary/50" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Выбор ноутбука */}
            <div className="space-y-2">
              <Label className="text-sm">Ноутбук</Label>
              <div className="grid grid-cols-5 gap-2">
                {LAPTOPS.slice(0, 15).map((num) => {
                  const isOccupied = sessionOccupiedLaptops.has(num)
                  const isSelected = currentConfig.laptop === num
                  return (
                    <Button
                      key={num}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      disabled={isOccupied}
                      className={`h-10 ${isOccupied ? "opacity-40" : ""}`}
                      onClick={() => updateCurrentConfig({ laptop: num })}
                    >
                      #{num}
                    </Button>
                  )
                })}
              </div>
              <div className="grid grid-cols-5 gap-2">
                {LAPTOPS.slice(15).map((num) => {
                  const isOccupied = sessionOccupiedLaptops.has(num)
                  const isSelected = currentConfig.laptop === num
                  return (
                    <Button
                      key={num}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      disabled={isOccupied}
                      className={`h-10 ${isOccupied ? "opacity-40" : ""}`}
                      onClick={() => updateCurrentConfig({ laptop: num })}
                    >
                      #{num}
                    </Button>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Выбор принтера */}
            <div className="space-y-2">
              <Label className="text-sm">Принтер 1</Label>
              <div className="flex gap-2">
                <Button
                  variant={currentConfig.printerType === "none" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => updateCurrentConfig({ printerType: "none", printerNumber: null })}
                >
                  Нет
                </Button>
                <Button
                  variant={currentConfig.printerType === "brother" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => updateCurrentConfig({ printerType: "brother" })}
                >
                  Brother
                </Button>
                <Button
                  variant={currentConfig.printerType === "godex" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => updateCurrentConfig({ printerType: "godex" })}
                >
                  Godex
                </Button>
              </div>
              {currentConfig.printerType !== "none" && (
                <div className="grid grid-cols-7 gap-1.5 max-h-[100px] overflow-y-auto">
                  {(currentConfig.printerType === "brother" ? BROTHER_PRINTERS : GODEX_PRINTERS).map((num) => {
                    const isOccupied =
                      currentConfig.printerType === "brother"
                        ? sessionOccupiedBrother.has(num)
                        : sessionOccupiedGodex.has(num)
                    const isSelected = currentConfig.printerNumber === num
                    return (
                      <Button
                        key={num}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        disabled={isOccupied}
                        className={`h-8 text-xs ${isOccupied ? "opacity-40" : ""}`}
                        onClick={() => updateCurrentConfig({ printerNumber: num })}
                      >
                        {num}
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Второй принтер */}
            {currentConfig.printerType !== "none" && currentConfig.printerNumber && (
              <div className="space-y-2">
                <Label className="text-sm">Принтер 2 (опционально)</Label>
                <div className="flex gap-2">
                  <Button
                    variant={currentConfig.secondPrinterType === "none" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => updateCurrentConfig({ secondPrinterType: "none", secondPrinterNumber: null })}
                  >
                    Нет
                  </Button>
                  <Button
                    variant={currentConfig.secondPrinterType === "brother" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => updateCurrentConfig({ secondPrinterType: "brother" })}
                  >
                    Brother
                  </Button>
                  <Button
                    variant={currentConfig.secondPrinterType === "godex" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => updateCurrentConfig({ secondPrinterType: "godex" })}
                  >
                    Godex
                  </Button>
                </div>
                {currentConfig.secondPrinterType !== "none" && (
                  <div className="grid grid-cols-7 gap-1.5 max-h-[80px] overflow-y-auto">
                    {(currentConfig.secondPrinterType === "brother" ? BROTHER_PRINTERS : GODEX_PRINTERS).map((num) => {
                      const isOccupied =
                        currentConfig.secondPrinterType === "brother"
                          ? sessionOccupiedBrother.has(num)
                          : sessionOccupiedGodex.has(num)
                      const isSelected = currentConfig.secondPrinterNumber === num
                      return (
                        <Button
                          key={num}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          disabled={isOccupied}
                          className={`h-8 text-xs ${isOccupied ? "opacity-40" : ""}`}
                          onClick={() => updateCurrentConfig({ secondPrinterNumber: num })}
                        >
                          {num}
                        </Button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Навигация */}
            <div className="flex gap-2 pt-2">
              {currentConfigIndex < bulkConfigs.length - 1 ? (
                <Button
                  className="flex-1"
                  disabled={!currentConfig.laptop}
                  onClick={() => setCurrentConfigIndex(currentConfigIndex + 1)}
                >
                  Следующая стойка
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button className="flex-1" disabled={!currentConfig.laptop} onClick={() => setStep("bulk-summary")}>
                  Проверить и создать
                  <Check className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        )

      case "bulk-summary":
        return (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentConfigIndex(bulkConfigs.length - 1)
                  setStep("bulk-config")
                }}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Label className="text-base">Проверьте установки</Label>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
              {bulkConfigs.map((config, idx) => (
                <Card key={config.rack} className="border-border/40 bg-card/50">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">Стойка {config.rack}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Monitor className="h-3 w-3" />
                          Ноутбук #{config.laptop}
                          {config.printerType !== "none" && config.printerNumber && (
                            <>
                              <span className="text-muted-foreground/50">|</span>
                              <Printer className="h-3 w-3" />
                              {config.printerType === "brother" ? "Brother" : "Godex"} #{config.printerNumber}
                            </>
                          )}
                          {config.secondPrinterType !== "none" && config.secondPrinterNumber && (
                            <>
                              <span className="text-muted-foreground/50">+</span>
                              {config.secondPrinterType === "brother" ? "Brother" : "Godex"} #
                              {config.secondPrinterNumber}
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          setBulkConfigs((prev) => prev.filter((_, i) => i !== idx))
                          if (bulkConfigs.length <= 1) {
                            setStep("booth")
                            setSelectedBooths([])
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            <div className="bg-primary/5 rounded-lg p-3 text-center">
              <div className="text-2xl font-semibold text-primary">{bulkConfigs.length}</div>
              <div className="text-xs text-muted-foreground">установок будет создано</div>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={isSubmitting || bulkConfigs.some((c) => !c.laptop)}
              onClick={handleSubmitBulk}
            >
              {isSubmitting ? "Создание..." : `Создать ${bulkConfigs.length} установок`}
            </Button>
          </div>
        )

      case "laptop":
        const laptopItems = getPaginatedItems(LAPTOPS, laptopPage)
        const laptopTotalPages = getTotalPages(LAPTOPS)
        return (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep("booth")} className="hover:bg-primary/10">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Label className="text-base">Выберите ноутбук</Label>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-2">
                {laptopItems.map((num, index) => {
                  const isOccupied = occupiedLaptops.has(num)
                  return (
                    <Button
                      key={num}
                      variant={selectedLaptop === num ? "default" : "outline"}
                      disabled={isOccupied}
                      className={`h-12 transition-all ${isOccupied ? "opacity-40" : "hover:scale-[1.02]"}`}
                      style={{ animationDelay: `${index * 0.03}s` }}
                      onClick={() => {
                        if (!isOccupied) {
                          setSelectedLaptop(num)
                          setStep("printer-type")
                        }
                      }}
                    >
                      #{num}
                    </Button>
                  )
                })}
              </div>
              {laptopTotalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLaptopPage((p) => Math.max(0, p - 1))}
                    disabled={laptopPage === 0}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {laptopPage + 1} / {laptopTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLaptopPage((p) => Math.min(laptopTotalPages - 1, p + 1))}
                    disabled={laptopPage === laptopTotalPages - 1}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )

      case "printer-type":
        return (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep("laptop")} className="hover:bg-primary/10">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Label className="text-base">Нужен принтер?</Label>
            </div>
            <div className="grid gap-3">
              <Button
                variant={printerType === "none" ? "default" : "outline"}
                className="h-14 justify-start transition-all hover:scale-[1.01]"
                onClick={() => {
                  setPrinterType("none")
                  handleSubmitSingle()
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Check className="h-5 w-5" />
                  </div>
                  <span>Без принтера</span>
                </div>
              </Button>
              <Button
                variant={printerType === "brother" ? "default" : "outline"}
                className="h-14 justify-start transition-all hover:scale-[1.01]"
                onClick={() => {
                  setPrinterType("brother")
                  setStep("printer-number")
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-tertiary/20 p-2">
                    <span className="text-sm font-bold text-tertiary">B</span>
                  </div>
                  <span>Brother принтер</span>
                </div>
              </Button>
              <Button
                variant={printerType === "godex" ? "default" : "outline"}
                className="h-14 justify-start transition-all hover:scale-[1.01]"
                onClick={() => {
                  setPrinterType("godex")
                  setStep("printer-number")
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-warning/20 p-2">
                    <span className="text-sm font-bold text-warning">G</span>
                  </div>
                  <span>Godex принтер</span>
                </div>
              </Button>
            </div>
          </div>
        )

      case "printer-number":
        const printers = printerType === "brother" ? BROTHER_PRINTERS : GODEX_PRINTERS
        const printerItems = getPaginatedItems(printers, printerPage)
        const printerTotalPages = getTotalPages(printers)
        return (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep("printer-type")} className="hover:bg-primary/10">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Label className="text-base">Выберите {printerType === "brother" ? "Brother" : "Godex"}</Label>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-2">
                {printerItems.map((num, index) => {
                  const isOccupied =
                    printerType === "brother" ? occupiedBrotherPrinters.has(num) : occupiedGodexPrinters.has(num)
                  return (
                    <Button
                      key={num}
                      variant={selectedPrinter === num ? "default" : "outline"}
                      disabled={isOccupied}
                      className={`h-12 transition-all ${isOccupied ? "opacity-40" : "hover:scale-[1.02]"}`}
                      style={{ animationDelay: `${index * 0.03}s` }}
                      onClick={() => {
                        if (!isOccupied) {
                          setSelectedPrinter(num)
                          setStep("second-printer-type")
                        }
                      }}
                    >
                      #{num}
                    </Button>
                  )
                })}
              </div>
              {printerTotalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPrinterPage((p) => Math.max(0, p - 1))}
                    disabled={printerPage === 0}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {printerPage + 1} / {printerTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPrinterPage((p) => Math.min(printerTotalPages - 1, p + 1))}
                    disabled={printerPage === printerTotalPages - 1}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )

      case "second-printer-type":
        return (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("printer-number")}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Label className="text-base">Добавить второй принтер?</Label>
            </div>
            <div className="grid gap-3">
              <Button
                variant={secondPrinterType === "none" ? "default" : "outline"}
                className="h-14 justify-start transition-all hover:scale-[1.01]"
                onClick={() => {
                  setSecondPrinterType("none")
                  handleSubmitSingle()
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Check className="h-5 w-5" />
                  </div>
                  <span>Один принтер достаточно</span>
                </div>
              </Button>
              <Button
                variant={secondPrinterType === "brother" ? "default" : "outline"}
                className="h-14 justify-start transition-all hover:scale-[1.01]"
                onClick={() => {
                  setSecondPrinterType("brother")
                  setStep("second-printer-number")
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-tertiary/20 p-2">
                    <span className="text-sm font-bold text-tertiary">B</span>
                  </div>
                  <span>Добавить Brother</span>
                </div>
              </Button>
              <Button
                variant={secondPrinterType === "godex" ? "default" : "outline"}
                className="h-14 justify-start transition-all hover:scale-[1.01]"
                onClick={() => {
                  setSecondPrinterType("godex")
                  setStep("second-printer-number")
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-warning/20 p-2">
                    <span className="text-sm font-bold text-warning">G</span>
                  </div>
                  <span>Добавить Godex</span>
                </div>
              </Button>
            </div>
          </div>
        )

      case "second-printer-number":
        const secondPrinters = secondPrinterType === "brother" ? BROTHER_PRINTERS : GODEX_PRINTERS
        const secondPrinterItems = getPaginatedItems(secondPrinters, secondPrinterPage)
        const secondPrinterTotalPages = getTotalPages(secondPrinters)
        return (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("second-printer-type")}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Label className="text-base">Второй {secondPrinterType === "brother" ? "Brother" : "Godex"}</Label>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-2">
                {secondPrinterItems.map((num, index) => {
                  const isOccupiedAsSecond =
                    secondPrinterType === "brother"
                      ? occupiedSecondBrotherPrinters.has(num)
                      : occupiedSecondGodexPrinters.has(num)
                  const isOccupiedAsFirst =
                    secondPrinterType === "brother" ? occupiedBrotherPrinters.has(num) : occupiedGodexPrinters.has(num)
                  const isOccupied = isOccupiedAsSecond || isOccupiedAsFirst

                  return (
                    <Button
                      key={num}
                      variant={selectedSecondPrinter === num ? "default" : "outline"}
                      disabled={isOccupied}
                      className={`h-12 transition-all ${isOccupied ? "opacity-40" : "hover:scale-[1.02]"}`}
                      style={{ animationDelay: `${index * 0.03}s` }}
                      onClick={() => {
                        if (!isOccupied) {
                          setSelectedSecondPrinter(num)
                          handleSubmitSingle()
                        }
                      }}
                    >
                      #{num}
                    </Button>
                  )
                })}
              </div>
              {secondPrinterTotalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSecondPrinterPage((p) => Math.max(0, p - 1))}
                    disabled={secondPrinterPage === 0}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {secondPrinterPage + 1} / {secondPrinterTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSecondPrinterPage((p) => Math.min(secondPrinterTotalPages - 1, p + 1))}
                    disabled={secondPrinterPage === secondPrinterTotalPages - 1}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {mode === "bulk" ? <Layers className="h-5 w-5 text-tertiary" /> : <Plus className="h-5 w-5 text-primary" />}
            {mode === "bulk" ? "Массовая установка" : "Новая установка"}
          </DialogTitle>
          <DialogDescription>
            {mode === "bulk" ? "Создайте несколько установок за один раз" : "Выберите оборудование для стойки"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-shrink-0 pb-2">
          <StepProgress currentStep={currentStepIndex} totalSteps={5} labels={STEP_LABELS} />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">{renderStepContent()}</div>
      </DialogContent>
    </Dialog>
  )
}
