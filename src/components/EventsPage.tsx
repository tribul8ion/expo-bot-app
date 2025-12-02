"use client"

import { useState } from "react"
import { Calendar, MapPin, Package, Plus, Eye, Trash2, CheckCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { Skeleton } from "./ui/skeleton"
import { CreateEventDialog } from "./CreateEventDialog"
import { EventDetailDialog } from "./EventDetailDialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog"
import { useEvents } from "../hooks/useEvents"
import type { Event as ApiEvent } from "../lib/api/events"
import { useTelegramAuth } from "../hooks/useTelegramAuth"
import { activityApi } from "../lib/api"
import { getUserAvatarUrl } from "../utils/avatarUtils"

interface Event {
  id: number
  name: string
  startDate: string
  endDate: string
  location: string
  booths: number
  laptops: number
  brotherPrinters: number
  godexPrinters: number
  status: "active" | "completed" | "upcoming"
}

export function EventsPage() {
  const [filter, setFilter] = useState("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)

  const { events: apiEvents, loading, completeEvent, deleteEvent, refetch } = useEvents()
  const { user } = useTelegramAuth()

  // Форматируем события из API
  const formatEvent = (apiEvent: ApiEvent): Event => {
    const startDate = apiEvent.start_date
      ? new Date(apiEvent.start_date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
      : ""
    const endDate = apiEvent.end_date
      ? new Date(apiEvent.end_date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
      : ""

    const equipment = apiEvent.equipment || { laptops: 0, brother_printers: 0, godex_printers: 0 }
    const laptops =
      typeof equipment.laptops === "number"
        ? equipment.laptops
        : Array.isArray(equipment.laptops)
          ? equipment.laptops.length
          : 0

    return {
      id: apiEvent.id || 0,
      name: apiEvent.name,
      startDate,
      endDate,
      location: apiEvent.location || "",
      booths: 0, // TODO: вычислить из данных
      laptops,
      brotherPrinters: equipment.brother_printers || 0,
      godexPrinters: equipment.godex_printers || 0,
      status: apiEvent.status || "active",
    }
  }

  const events = apiEvents.map(formatEvent)

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true
    return event.status === filter
  })

  const handleComplete = async (event: Event) => {
    try {
      await completeEvent(event.id)

      // Получаем аватар пользователя
      let avatarUrl: string | null = null
      if (user?.id) {
        try {
          avatarUrl = await getUserAvatarUrl(user.id, user.photo_url)
        } catch (avatarError) {
          console.error("Error getting avatar URL:", avatarError)
        }
      }

      // Логируем активность с аватаром
      try {
        await activityApi.create({
          user_id: user?.id?.toString() || "",
          username: user?.username || user?.first_name || "Unknown",
          action_type: "complete_event",
          item_type: "event",
          item_name: event.name,
          avatar_url: avatarUrl || undefined,
        })
      } catch (activityError) {
        console.error("Error logging activity:", activityError)
      }

      // Обновляем активность после завершения мероприятия
      window.dispatchEvent(new Event("activityNeedsUpdate"))

      setSelectedEvent(null)
    } catch (error) {
      console.error("Error completing event:", error)
    }
  }

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (eventToDelete) {
      try {
        await deleteEvent(eventToDelete.id)

        // Получаем аватар пользователя
        let avatarUrl: string | null = null
        if (user?.id) {
          try {
            avatarUrl = await getUserAvatarUrl(user.id, user.photo_url)
          } catch (avatarError) {
            console.error("Error getting avatar URL:", avatarError)
          }
        }

        // Логируем активность с аватаром
        try {
          await activityApi.create({
            user_id: user?.id?.toString() || "",
            username: user?.username || user?.first_name || "Unknown",
            action_type: "delete_event",
            item_type: "event",
            item_name: eventToDelete.name,
            avatar_url: avatarUrl || undefined,
          })
        } catch (activityError) {
          console.error("Error logging activity:", activityError)
        }

        // Обновляем активность после удаления мероприятия
        window.dispatchEvent(new Event("activityNeedsUpdate"))

        setDeleteDialogOpen(false)
        setEventToDelete(null)
        setSelectedEvent(null)
      } catch (error) {
        console.error("Error deleting event:", error)
      }
    }
  }

  const statusColors = {
    active: "default",
    completed: "secondary",
    upcoming: "outline",
  } as const

  const statusLabels = {
    active: "Активно",
    completed: "Завершено",
    upcoming: "Предстоит",
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>События</h2>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="upcoming">Предстоит</TabsTrigger>
          <TabsTrigger value="active">Активные</TabsTrigger>
          <TabsTrigger value="completed">Завершено</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-border/40 bg-card/50">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="border-border/40 bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="mb-3 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Нет мероприятий</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="border-border/40 bg-card/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <div className="rounded-lg bg-primary/10 p-2 text-xl leading-none">🎪</div>
                    <CardTitle className="text-base">{event.name}</CardTitle>
                  </div>
                  <Badge variant={statusColors[event.status]} className="shadow-sm">
                    {statusLabels[event.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pb-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="rounded bg-primary/10 p-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>
                    {event.startDate} — {event.endDate}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="rounded bg-primary/10 p-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="rounded bg-muted/50 p-1">
                    <Package className="h-3.5 w-3.5" />
                  </div>
                  <span>{event.laptops + event.brotherPrinters + event.godexPrinters} единиц оборудования</span>
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:bg-primary/10 hover:text-primary bg-transparent"
                  onClick={() => setSelectedEvent(event)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Детали
                </Button>
                {event.status === "active" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-secondary/10 hover:text-secondary"
                    onClick={() => handleComplete(event)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDeleteClick(event)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <CreateEventDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          refetch()
        }}
      />

      <EventDetailDialog open={selectedEvent !== null} onClose={() => setSelectedEvent(null)} event={selectedEvent} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить мероприятие?</AlertDialogTitle>
            <AlertDialogDescription>
              Мероприятие "{eventToDelete?.name}" будет удалено безвозвратно. Все установки этого мероприятия будут
              сохранены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
