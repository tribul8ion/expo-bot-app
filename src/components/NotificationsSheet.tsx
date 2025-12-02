"use client"

import React from "react"
import { Bell, AlertTriangle, Package, CheckCircle, CheckCheck, Inbox } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { useNotifications } from "../hooks/useNotifications"
import { Spinner } from "./ui/skeleton"
import { EmptyState } from "./ui/empty-state"

interface NotificationsSheetProps {
  open: boolean
  onClose: () => void
}

export function NotificationsSheet({ open, onClose }: NotificationsSheetProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications()

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Package className="h-4 w-4 text-primary" />
    }
  }

  const groupedNotifications = React.useMemo(() => {
    const groups: Record<string, typeof notifications> = {}
    notifications.forEach((n) => {
      const date = n.time?.includes("назад") ? "Сегодня" : n.time || "Ранее"
      if (!groups[date]) groups[date] = []
      groups[date].push(n)
    })
    return groups
  }, [notifications])

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Уведомления
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 rounded-full px-1.5 text-xs animate-pulse">
                  {unreadCount}
                </Badge>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs">
                <CheckCheck className="h-3 w-3 mr-1" />
                Прочитать все
              </Button>
            )}
          </div>
          <SheetDescription className="sr-only">Список всех уведомлений системы</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="default" />
            <p className="text-sm text-muted-foreground mt-3">Загрузка уведомлений...</p>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Нет уведомлений"
            description="Уведомления появятся при низком остатке расходников, скором начале мероприятий или долгих активных установках"
            iconColor="muted"
          />
        ) : (
          <div className="mt-6 space-y-4">
            {Object.entries(groupedNotifications).map(([date, items]) => (
              <div key={date}>
                <p className="text-xs text-muted-foreground mb-2 font-medium">{date}</p>
                <div className="space-y-2">
                  {items.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`animate-fade-in stagger-${Math.min(index + 1, 8)}`}
                      style={{ opacity: 0 }}
                    >
                      <div
                        className={`rounded-lg border p-3 transition-all duration-200 cursor-pointer 
                          hover:scale-[1.02] hover:shadow-md ${
                            notification.read ? "border-border/40 bg-card/30" : "border-primary/30 bg-card/50 shadow-sm"
                          }`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 rounded-lg p-2 ${
                              notification.type === "warning"
                                ? "bg-destructive/10"
                                : notification.type === "success"
                                  ? "bg-green-500/10"
                                  : "bg-primary/10"
                            }`}
                          >
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium">{notification.title}</p>
                              {!notification.read && (
                                <div className="mt-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground opacity-70">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
