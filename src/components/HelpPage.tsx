import React, { useState } from "react";
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Mail, 
  MessageSquare,
  Send,
  Home,
  Package,
  Monitor,
  Calendar,
  TrendingUp,
  Search,
  ShoppingCart,
  BarChart3,
  Settings,
  Bell,
  History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

interface FAQItem {
  question: string;
  answer: string;
}

interface FeatureGuide {
  icon: React.ReactNode;
  title: string;
  description: string;
  steps?: string[];
}

export function HelpPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const faqItems: FAQItem[] = [
    {
      question: "Как создать новую установку?",
      answer: "Перейдите на страницу 'Установки' и нажмите кнопку '+' или 'Создать установку'. Выберите мероприятие (опционально), зону, номер стойки, ноутбук и принтеры. После заполнения всех полей установка будет создана автоматически.",
    },
    {
      question: "Как списать расходные материалы?",
      answer: "На странице 'Расходники' выберите нужный материал. Используйте кнопки '+5' или '-5' для быстрого изменения, либо нажмите 'Изменить' для точного указания количества. Можно вводить значения с знаками '+' или '-' для изменения относительно текущего остатка.",
    },
    {
      question: "Как найти нужное оборудование?",
      answer: "Используйте страницу 'Поиск' (иконка лупы в верхней панели) или перейдите в раздел 'Оборудование' и используйте фильтры по типу оборудования (ноутбуки, принтеры Brother, принтеры Godex).",
    },
    {
      question: "Что делать при низком остатке расходников?",
      answer: "Система автоматически отправит уведомление (иконка колокольчика в верхней панели). Вы также можете увидеть предупреждение в разделе 'Расходники' с красной меткой 'Низкий остаток'.",
    },
    {
      question: "Как посмотреть историю использования оборудования?",
      answer: "Откройте детали оборудования на странице 'Оборудование', выберите конкретный ноутбук или принтер, и просмотрите раздел 'История перемещений' с полной информацией о всех установках.",
    },
    {
      question: "Как работают уведомления?",
      answer: "Уведомления появляются автоматически при: низком остатке расходников (ниже минимума), мероприятиях, которые скоро начнутся (в течение 24 часов), и долгих активных установках (более 7 дней). Нажмите на иконку колокольчика, чтобы просмотреть все уведомления.",
    },
  ];

  const featureGuides: FeatureGuide[] = [
    {
      icon: <Home className="h-5 w-5" />,
      title: "Главная страница",
      description: "Обзорная информация о системе",
      steps: [
        "Просмотр общей статистики: активные установки, доступные ноутбуки, мероприятия",
        "Быстрый доступ к созданию новой установки",
        "Просмотр недавней активности команды",
        "Навигация по основным разделам"
      ]
    },
    {
      icon: <Package className="h-5 w-5" />,
      title: "Установки",
      description: "Управление установками оборудования",
      steps: [
        "Создание новой установки: выберите мероприятие, зону, стойку, ноутбук и принтеры",
        "Просмотр всех активных установок с фильтрацией по зонам",
        "Завершение установки после окончания мероприятия",
        "Просмотр детальной информации по каждой установке"
      ]
    },
    {
      icon: <Monitor className="h-5 w-5" />,
      title: "Оборудование",
      description: "Управление техникой",
      steps: [
        "Просмотр списка всех ноутбуков (1-25)",
        "Просмотр принтеров Brother (1-28)",
        "Просмотр принтеров Godex (1-21)",
        "Просмотр истории использования каждого устройства",
        "Проверка текущего статуса оборудования"
      ]
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "Мероприятия",
      description: "Планирование и управление мероприятиями",
      steps: [
        "Создание нового мероприятия с указанием названия, дат, локации",
        "Выбор зон для мероприятия",
        "Планирование необходимого оборудования",
        "Просмотр активных и завершенных мероприятий",
        "Завершение мероприятия после окончания"
      ]
    },
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      title: "Расходники",
      description: "Управление расходными материалами",
      steps: [
        "Просмотр остатков расходников Brother и Godex",
        "Быстрое изменение количества (+5/-5)",
        "Точное указание количества через диалог",
        "Отслеживание минимального остатка",
        "Визуальная индикация низкого остатка"
      ]
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Статистика",
      description: "Аналитика и отчеты",
      steps: [
        "Просмотр статистики по зонам",
        "Анализ использования оборудования",
        "Отчеты по мероприятиям",
        "Статистика по пользователям"
      ]
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: "Поиск",
      description: "Быстрый поиск по системе",
      steps: [
        "Поиск установок по номеру стойки",
        "Поиск оборудования по номеру",
        "Фильтрация результатов",
        "Переход к детальной информации"
      ]
    },
    {
      icon: <Bell className="h-5 w-5" />,
      title: "Уведомления",
      description: "Система уведомлений",
      steps: [
        "Автоматические уведомления о низком остатке расходников",
        "Уведомления о предстоящих мероприятиях",
        "Уведомления о долгих активных установках",
        "Отметка уведомлений как прочитанных",
        "Счетчик непрочитанных уведомлений"
      ]
    },
    {
      icon: <History className="h-5 w-5" />,
      title: "История изменений",
      description: "Журнал всех действий",
      steps: [
        "Просмотр всех действий пользователей",
        "Группировка по датам",
        "Детальная информация о каждом действии",
        "Отображение аватаров пользователей"
      ]
    },
    {
      icon: <Settings className="h-5 w-5" />,
      title: "Настройки",
      description: "Профиль и параметры",
      steps: [
        "Просмотр профиля Telegram",
        "Информация о версии приложения",
        "Открытие бота в чате",
        "Поделиться приложением"
      ]
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Форма отправлена:", formData);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Помощь</h2>
        <p className="text-sm text-muted-foreground">Руководство по использованию и поддержка</p>
      </div>

      {/* Гайд по функционалу */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Руководство по функционалу</h3>
        <div className="space-y-3">
          {featureGuides.map((guide, index) => (
            <Card key={index} className="border-border/40 bg-card/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-primary/10 p-2">
                    {guide.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm">{guide.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{guide.description}</p>
                  </div>
                </div>
              </CardHeader>
              {guide.steps && guide.steps.length > 0 && (
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {guide.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      <Separator className="bg-border/40" />

      {/* FAQ */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Частые вопросы</h3>
        <div className="space-y-2">
          {faqItems.map((item, index) => (
            <Card key={index} className="border-border/40 bg-card/50">
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                className="w-full"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-md bg-primary/10 p-1.5">
                        <HelpCircle className="h-4 w-4 text-primary" />
                      </div>
                      <CardTitle className="text-left text-sm">{item.question}</CardTitle>
                    </div>
                    {expandedFAQ === index ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </button>
              {expandedFAQ === index && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{item.answer}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Контакты */}
      <Card className="border-border/40 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Контакты поддержки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-xs text-muted-foreground">vp.panteleev@expoforum.ru</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Telegram</p>
              <p className="text-xs text-muted-foreground">@tribul8ion</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Форма обратной связи */}
      <Card className="border-border/40 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Обратная связь</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                placeholder="Ваше имя"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Сообщение</Label>
              <Textarea
                id="message"
                placeholder="Опишите ваш вопрос или предложение..."
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full shadow-sm">
              <Send className="mr-2 h-4 w-4" />
              Отправить
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
