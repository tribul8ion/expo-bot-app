import React, { useState, useMemo } from "react";
import { Clock, Package, ShoppingCart, Monitor, Trash2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { useActivity } from "../hooks/useActivity";

// Types are declared in useTelegramAuth.ts to avoid conflicts

interface HistoryItem {
  id: number;
  type: "installation" | "consumable" | "equipment" | "archive";
  user: string;
  avatar_url?: string;
  action: string;
  target: string;
  time: string;
  date: string;
}

export function HistoryPage() {
  const [filter, setFilter] = useState("all");
  const { activities } = useActivity(50);  // Получаем последние 50 активностей

  // Конвертируем ActivityDisplay в HistoryItem для совместимости с существующим интерфейсом
  const historyItems: HistoryItem[] = useMemo(() => {
    return activities.map(activity => {
      // Определяем тип на основе действия
      let type: "installation" | "consumable" | "equipment" | "archive" = "installation";
      if (activity.action.includes("расходник")) {
        type = "consumable";
      } else if (activity.action.includes("ноутбук") || activity.action.includes("принтер")) {
        type = "equipment";
      } else if (activity.action.includes("архивировал") || activity.action.includes("удалил")) {
        type = "archive";
      }
      
      // Форматируем дату - используем created_at если доступно, иначе time
      let date: Date;
      if (activity.created_at) {
        // Используем исходную ISO дату
        date = new Date(activity.created_at);
      } else if (activity.time) {
        // Пробуем парсить отформатированную строку (fallback)
        // Извлекаем дату из строки вида "3 ноября 2025 г. в 18:39"
        try {
          // Пытаемся найти год, месяц, день в строке
          const timeMatch = activity.time.match(/(\d+)\s+(\w+)\s+(\d+)/);
          if (timeMatch) {
            // Простой парсинг для русского формата
            date = new Date(activity.time);
          } else {
            date = new Date();
          }
        } catch {
          date = new Date();
        }
      } else {
        date = new Date();
      }
      
      // Проверяем, что дата валидна
      if (isNaN(date.getTime())) {
        console.warn('Invalid date for activity:', activity);
        date = new Date();
      }
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Сбрасываем время для сравнения
      const activityDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      let dateStr = "Раньше";
      if (activityDate.getTime() === today.getTime()) {
        dateStr = "Сегодня";
      } else if (activityDate.getTime() === yesterday.getTime()) {
        dateStr = "Вчера";
      }
      
      return {
        id: activity.id,
        type,
        user: activity.user,
        avatar_url: activity.avatar_url,
        action: activity.action,
        target: activity.item,
        time: date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        date: dateStr,
      };
    });
  }, [activities]);

  const filteredItems = useMemo(() => {
    return historyItems.filter((item) => {
      if (filter === "all") return true;
      return item.type === filter;
    });
  }, [historyItems, filter]);

  const getIcon = (type: string) => {
    switch (type) {
      case "installation": return <Package className="h-3.5 w-3.5 text-primary" />;
      case "consumable": return <ShoppingCart className="h-3.5 w-3.5 text-primary" />;
      case "equipment": return <Monitor className="h-3.5 w-3.5 text-primary" />;
      case "archive": return <Trash2 className="h-3.5 w-3.5 text-primary" />;
      default: return <Clock className="h-3.5 w-3.5 text-primary" />;
    }
  };

  const groupedItems = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = [];
      }
      acc[item.date].push(item);
      return acc;
    }, {} as Record<string, HistoryItem[]>);
  }, [filteredItems]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-2">История изменений</h2>
        <p className="text-sm text-muted-foreground">Все действия в системе</p>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="installation">
            <Package className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="consumable">
            <ShoppingCart className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="equipment">
            <Monitor className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="archive">
            <Trash2 className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {Object.entries(groupedItems).map(([date, items]) => {
          const itemsList = items as HistoryItem[];
          return (
          <div key={date}>
            <div className="mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">{date}</h3>
            </div>
            <Card className="border-border/40 bg-card/50">
              <CardContent className="p-0">
                {itemsList.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex items-start gap-3 p-4">
                      <Avatar className="h-9 w-9">
                        <AvatarImage 
                          src={item.avatar_url || undefined} 
                          alt={item.user}
                          onError={(e) => {
                            console.warn('Failed to load avatar:', item.avatar_url, 'for user:', item.user);
                            // Скрываем изображение при ошибке загрузки, fallback покажется автоматически
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                          onLoad={() => {
                            console.log('Avatar loaded successfully:', item.avatar_url, 'for user:', item.user);
                          }}
                        />
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {item.user?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">{item.user}</span>{" "}
                          <span className="text-muted-foreground">{item.action}</span>{" "}
                          <span className="font-medium">{item.target}</span>
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="rounded bg-primary/10 p-1">
                            {getIcon(item.type)}
                          </div>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                    </div>
                    {index < itemsList.length - 1 && <Separator className="bg-border/40" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );
        })}
      </div>
    </div>
  );
}
