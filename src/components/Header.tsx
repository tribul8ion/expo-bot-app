"use client"
import { Boxes, Search, Bell, History, HelpCircle, Settings, MoreVertical } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

interface HeaderProps {
  onSearchClick?: () => void
  onNotificationsClick?: () => void
  onHistoryClick?: () => void
  onHelpClick?: () => void
  onSettingsClick?: () => void
  unreadNotificationsCount?: number
}

export function Header({
  onSearchClick,
  onNotificationsClick,
  onHistoryClick,
  onHelpClick,
  onSettingsClick,
  unreadNotificationsCount = 0,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 shadow-sm">
      <div className="flex h-14 items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md transition-transform duration-200 group-hover:scale-105">
            <Boxes className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <h1 className="font-semibold text-lg tracking-tight">ExpoBot</h1>
        </div>

        <div className="flex items-center gap-1">
          {/* Поиск - основное действие */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={onSearchClick}
            title="Поиск"
          >
            <Search className="h-4.5 w-4.5" />
          </Button>

          {/* Уведомления - основное действие */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 relative hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={onNotificationsClick}
            title="Уведомления"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadNotificationsCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1.5 text-[10px] font-semibold flex items-center justify-center shadow-md animate-pulse-glow"
              >
                {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-accent transition-colors" title="Ещё">
                <MoreVertical className="h-4.5 w-4.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 shadow-lg">
              <DropdownMenuItem onClick={onHistoryClick} className="cursor-pointer gap-3 py-2.5">
                <History className="h-4 w-4 text-muted-foreground" />
                <span>История изменений</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onHelpClick} className="cursor-pointer gap-3 py-2.5">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <span>Помощь</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSettingsClick} className="cursor-pointer gap-3 py-2.5">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>Настройки</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
