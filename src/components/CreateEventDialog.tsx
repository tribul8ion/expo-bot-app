"use client"

import type React from "react"
import { useState } from "react"
import { Plus, MapPin, Monitor, Printer, Tag } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { toast } from "sonner"
import { Card, CardContent } from "./ui/card"
import { Separator } from "./ui/separator"
import { Badge } from "./ui/badge"
import { useEvents } from "../hooks/useEvents"
import { ZONE_RANGES, type ZoneLetter } from "../lib/api/config"
import { useTelegramAuth } from "../hooks/useTelegramAuth"
import { activityApi } from "../lib/api"
import { getUserAvatarUrl } from "../utils/avatarUtils"

interface CreateEventDialogProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateEventDialog({ open, onClose, onSuccess }: CreateEventDialogProps) {
  const { createEvent, refetch } = useEvents()
  const { user } = useTelegramAuth()
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
    selectedZones: [] as ZoneLetter[],
    laptops: 0,
    brotherPrinters: 0,
    godexPrinters: 0,
  })

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      selectedZones: [],
      laptops: 0,
      brotherPrinters: 0,
      godexPrinters: 0,
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error("Заполните обязательные поля")
      return
    }

    if (formData.selectedZones.length === 0) {
      toast.error("Выберите хотя бы одну зону")
      return
    }

    try {
      const totalEquipment = formData.laptops + formData.brotherPrinters + formData.godexPrinters

      // Формируем строку локации из выбранных зон
      const zoneRanges = formData.selectedZones
        .map((zone) => {
          const range = ZONE_RANGES[zone]
          return `${zone}${range.start}-${zone}${range.end}`
        })
        .join(", ")

      await createEvent({
        name: formData.name,
        event_name: formData.name, // для совместимости со старой схемой
        location: formData.location ? `${formData.location} (${zoneRanges})` : zoneRanges,
        start_date: new Date(formData.startDate).toISOString(),
        end_date: new Date(formData.endDate).toISOString(),
        description: formData.description || null,
        equipment: {
          laptops: formData.laptops,
          brother_printers: formData.brotherPrinters,
          godex_printers: formData.godexPrinters,
        },
        status: "active",
      })

      // Обновляем список событий
      await refetch()

      if (onSuccess) {
        onSuccess()
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

      // Обновляем активность после создания мероприятия
      window.dispatchEvent(new Event("activityNeedsUpdate"))

      // Логируем активность с аватаром
      try {
        await activityApi.create({
          user_id: user?.id?.toString() || "",
          username: user?.username || user?.first_name || "Unknown",
          action_type: "create_event",
          item_type: "event",
          item_name: formData.name,
          avatar_url: avatarUrl || undefined,
        })
      } catch (activityError) {
        console.error("Error logging activity:", activityError)
      }

      toast.success(`Мероприятие "${formData.name}" создано`, {
        description: `${totalEquipment} единиц оборудования запланировано`,
      })

      handleClose()
    } catch (error) {
      console.error("Error creating event:", error)
      toast.error("Ошибка при создании мероприятия")
    }
  }

  const incrementEquipment = (type: "laptops" | "brotherPrinters" | "godexPrinters") => {
    setFormData({ ...formData, [type]: formData[type] + 1 })
  }

  const decrementEquipment = (type: "laptops" | "brotherPrinters" | "godexPrinters") => {
    setFormData({ ...formData, [type]: Math.max(0, formData[type] - 1) })
  }

  const toggleZone = (zone: ZoneLetter) => {
    setFormData({
      ...formData,
      selectedZones: formData.selectedZones.includes(zone)
        ? formData.selectedZones.filter((z) => z !== zone)
        : [...formData.selectedZones, zone],
    })
  }

  const totalEquipment = formData.laptops + formData.brotherPrinters + formData.godexPrinters

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Создать мероприятие
          </DialogTitle>
          <DialogDescription>Укажите информацию о мероприятии и необходимое оборудование</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Основная информация */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Основная информация</h4>

            <div className="space-y-2">
              <Label htmlFor="name">
                Название мероприятия <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Например: Выставка ПМГФ 2025"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Место проведения</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Например: Палыч Экспо"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Зоны установок <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(ZONE_RANGES) as ZoneLetter[]).map((zone) => {
                  const isSelected = formData.selectedZones.includes(zone)
                  const range = ZONE_RANGES[zone]
                  return (
                    <Button
                      key={zone}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className="h-16"
                      onClick={() => toggleZone(zone)}
                    >
                      <div className="text-center">
                        <div className="text-lg font-semibold">Зона {zone}</div>
                        <div className="text-xs opacity-80">
                          {range.start}-{range.end}
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </div>
              {formData.selectedZones.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.selectedZones.map((zone) => (
                    <Badge key={zone} variant="default">
                      Зона {zone}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Дата начала <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">
                  Дата окончания <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                placeholder="Дополнительная информация о мероприятии..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Планирование оборудования */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Планируемое оборудование</h4>

            <Card className="border-border/40 bg-muted/30">
              <CardContent className="p-4 space-y-3">
                {/* Ноутбуки */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded bg-primary/10 p-2">
                      <Monitor className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Ноутбуки</p>
                      <p className="text-xs text-muted-foreground">Всего доступно: 25</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => decrementEquipment("laptops")}
                      disabled={formData.laptops === 0}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-medium">{formData.laptops}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => incrementEquipment("laptops")}
                      disabled={formData.laptops >= 25}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Принтеры Brother */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded bg-primary/10 p-2">
                      <Printer className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Brother принтеры</p>
                      <p className="text-xs text-muted-foreground">Всего доступно: 28</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => decrementEquipment("brotherPrinters")}
                      disabled={formData.brotherPrinters === 0}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-medium">{formData.brotherPrinters}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => incrementEquipment("brotherPrinters")}
                      disabled={formData.brotherPrinters >= 28}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Принтеры Godex */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded bg-primary/10 p-2">
                      <Tag className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Godex принтеры</p>
                      <p className="text-xs text-muted-foreground">Всего доступно: 21</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => decrementEquipment("godexPrinters")}
                      disabled={formData.godexPrinters === 0}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-medium">{formData.godexPrinters}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => incrementEquipment("godexPrinters")}
                      disabled={formData.godexPrinters >= 21}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {totalEquipment > 0 && (
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-center">
                <p className="text-sm text-muted-foreground">Всего оборудования</p>
                <p className="text-2xl font-semibold text-primary">{totalEquipment}</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit">Создать мероприятие</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
