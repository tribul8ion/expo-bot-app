import React from "react";
import { User, Info, ChevronRight, MessageSquare, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { useTelegramAuth } from "../hooks/useTelegramAuth";
import { Badge } from "./ui/badge";
import { APP_VERSION, BUILD_DATE, BUILD_NUMBER } from "../config/version";

export function SettingsPage() {
  const { user, initData, isTelegram, avatarUrl } = useTelegramAuth();

  const handleOpenBot = () => {
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink("https://t.me/exporeg_bot", {
        try_instant_view: true
      });
    } else {
      window.open("https://t.me/exporeg_bot", "_blank");
    }
  };

  const getInitials = () => {
    if (!user) return "U";
    const firstName = user.first_name?.[0] || "";
    const lastName = user.last_name?.[0] || "";
    return (firstName + lastName).toUpperCase() || "U";
  };

  const getFullName = () => {
    if (!user) return "Пользователь";
    return [user.first_name, user.last_name].filter(Boolean).join(" ") || "Пользователь";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Настройки</h2>
        <p className="text-sm text-muted-foreground">Профиль и информация об аккаунте</p>
      </div>

      {/* Профиль Telegram */}
      <Card className="border-border/40 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Профиль Telegram</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16">
              {avatarUrl && (
                <AvatarImage src={avatarUrl} alt={getFullName()} />
              )}
              <AvatarFallback className="bg-primary/10 text-lg text-primary">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{getFullName()}</p>
                {user?.is_premium && (
                  <Badge variant="secondary" className="text-xs">⭐ Premium</Badge>
                )}
              </div>
              {user?.username && (
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              )}
              {!user?.username && (
                <p className="text-xs text-muted-foreground">ID: {user?.id}</p>
              )}
              {isTelegram && (
                <p className="text-xs text-green-500/70 mt-1">✓ Подключено через Telegram</p>
              )}
              {!isTelegram && (
                <p className="text-xs text-yellow-500/70 mt-1">⚠ Тестовый режим</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Взаимодействие с ботом */}
      <Card className="border-border/40 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Взаимодействие</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button 
            onClick={handleOpenBot}
            className="flex w-full items-center justify-between transition-colors hover:text-primary"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Открыть бота в чате</p>
                <p className="text-xs text-muted-foreground">Использовать расширенные возможности</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
          <Separator className="bg-border/40" />
          <button 
            onClick={() => window.open("https://t.me/share/url?url=https://example.com&text=ExpoBot", "_blank")}
            className="flex w-full items-center justify-between transition-colors hover:text-primary"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <ExternalLink className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Поделиться приложением</p>
                <p className="text-xs text-muted-foreground">Скопировать ссылку на приложение</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>

      {/* О приложении */}
      <Card className="border-border/40 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">О приложении</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <Info className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">ExpoBot</p>
              <div className="space-y-1 mt-1">
                <p className="text-xs text-muted-foreground">Версия: {APP_VERSION}</p>
                <p className="text-xs text-muted-foreground">Билд: #{BUILD_NUMBER}</p>
                <p className="text-xs text-muted-foreground">Дата сборки: {BUILD_DATE}</p>
              </div>
            </div>
          </div>
          <Separator className="bg-border/40" />
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Система управления оборудованием для выставок и мероприятий.</p>
            <p className="text-xs">Разработано для удобного контроля установок техники, расходных материалов и мероприятий.</p>
          </div>
        </CardContent>
      </Card>

      {/* Выход (скрыто в Telegram, показываем только в dev режиме) */}
      {!window.Telegram?.WebApp && (
        <Button variant="destructive" className="w-full">
          Выйти из аккаунта
        </Button>
      )}
    </div>
  );
}
