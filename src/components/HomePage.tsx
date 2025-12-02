"use client"

import { useEffect } from "react"
import { Plus, Package, Monitor, Calendar, Search, ShoppingCart, BarChart3, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useInstallations } from "../hooks/useInstallations"
import { useEquipment } from "../hooks/useEquipment"
import { useActivity } from "../hooks/useActivity"

interface HomePageProps {
  onCreateInstallation: () => void
  onNavigate?: (page: string) => void
}

export function HomePage({ onCreateInstallation, onNavigate }: HomePageProps) {
  const { installations } = useInstallations()
  const { laptops } = useEquipment()
  const { activities: recentActivities, refetch: refetchActivity } = useActivity(5)

  // Обновляем активность при возврате на страницу и периодически
  useEffect(() => {
    // Обновляем при монтировании
    refetchActivity()

    // Обновляем при возврате фокуса на страницу
    const handleFocus = () => {
      refetchActivity()
    }

    // Обновляем при глобальном событии (после изменений данных)
    const handleActivityUpdate = () => {
      refetchActivity()
    }

    // Периодическое обновление каждые 30 секунд
    const interval = setInterval(() => {
      refetchActivity()
    }, 30000)

    window.addEventListener("focus", handleFocus)
    window.addEventListener("activityNeedsUpdate", handleActivityUpdate)

    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("activityNeedsUpdate", handleActivityUpdate)
    }
  }, [refetchActivity])

  // Вычисляем статистику
  const totalInstallations = installations.length

  // Получаем список ID ноутбуков, которые используются в активных установках
  const occupiedLaptopIds = new Set(
    installations
      .map((inst) => inst.laptop)
      .filter(Boolean)
      .map((l) => Number(l)),
  )

  // Считаем свободные ноутбуки: исключаем те, что используются в установках
  const availableLaptops = laptops.filter((l) => {
    const isOccupied = occupiedLaptopIds.has(l.id)
    const isUnavailable = l.status?.toLowerCase() === "in-use" || l.status?.toLowerCase() === "maintenance"
    // Ноутбук свободен, если он не занят в установке И не имеет статус in-use/maintenance в БД
    return !isOccupied && !isUnavailable
  }).length

  const quickActions = [
    { icon: Search, label: "Найти стойку", page: "search", color: "primary" },
    { icon: ShoppingCart, label: "Расходники", page: "consumables", color: "tertiary" },
    { icon: BarChart3, label: "Статистика", page: "statistics", color: "warning" },
    { icon: Calendar, label: "Мероприятия", page: "events", color: "info" },
  ]

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h2 className="mb-2">Добро пожаловать!</h2>
        <p className="text-muted-foreground">Управляйте оборудованием выставки эффективно</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/40 bg-gradient-to-br from-card to-card/80 relative overflow-hidden animate-slide-up animate-stagger-1">
          {/* Декоративный градиент */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="rounded-lg bg-primary/15 p-2 shadow-sm">
                <Package className="h-4 w-4 text-primary" />
              </div>
              Установки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{totalInstallations}</div>
            <p className="text-xs text-muted-foreground mt-1">Активных сейчас</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-gradient-to-br from-card to-card/80 relative overflow-hidden animate-slide-up animate-stagger-2">
          {/* Декоративный градиент */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-tertiary/20 to-transparent rounded-bl-full" />
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="rounded-lg bg-tertiary/15 p-2 shadow-sm">
                <Monitor className="h-4 w-4 text-tertiary" />
              </div>
              Ноутбуки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{availableLaptops}</div>
            <p className="text-xs text-muted-foreground mt-1">Свободных</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3 animate-slide-up animate-stagger-3">
        <h3 className="text-sm font-medium">Быстрые действия</h3>
        <Button onClick={onCreateInstallation} className="w-full shadow-md hover:shadow-lg" size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Создать установку
        </Button>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <Card
              key={action.page}
              className={`cursor-pointer border-border/40 bg-card/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:border-${action.color}/30 group animate-slide-up`}
              style={{ animationDelay: `${(index + 4) * 0.05}s` }}
              onClick={() => onNavigate?.(action.page)}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div
                  className={`mb-3 rounded-xl bg-${action.color}/10 p-3 transition-all duration-200 group-hover:bg-${action.color}/20 group-hover:scale-110 shadow-sm`}
                >
                  <action.icon className={`h-5 w-5 text-${action.color}`} />
                </div>
                <p className="text-center text-sm font-medium">{action.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="animate-slide-up animate-stagger-4">
        <h3 className="mb-3 text-sm font-medium">Недавняя активность</h3>
        <Card className="border-border/40 bg-card/50 overflow-hidden">
          <CardContent className="p-0">
            {recentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted/50 p-4 mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Нет недавней активности</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Создайте первую установку</p>
              </div>
            ) : (
              recentActivities.map((activity, index) => (
                <div key={activity.id}>
                  <div
                    className="flex items-start gap-3 p-4 transition-colors hover:bg-accent/30"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm">
                      <AvatarImage
                        src={activity.avatar_url || undefined}
                        alt={activity.user}
                        onError={(e) => {
                          console.warn("Failed to load avatar:", activity.avatar_url, "for user:", activity.user)
                          ;(e.target as HTMLImageElement).style.display = "none"
                        }}
                        onLoad={() => {
                          console.log("Avatar loaded successfully:", activity.avatar_url, "for user:", activity.user)
                        }}
                      />
                      <AvatarFallback className="bg-primary/10 text-xs text-primary font-medium">
                        {activity.user?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm leading-snug">
                        <span className="font-medium text-foreground">{activity.user}</span>{" "}
                        <span className="text-muted-foreground">{activity.action}</span>{" "}
                        <span className="font-medium text-foreground">{activity.item}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  {index < recentActivities.length - 1 && <Separator className="bg-border/40" />}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
