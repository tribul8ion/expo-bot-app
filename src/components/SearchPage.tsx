import React, { useState, useMemo } from "react";
import { Search, Package, Monitor, Calendar, ShoppingCart, ArrowRight } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { useInstallations } from "../hooks/useInstallations";
import { useEquipment } from "../hooks/useEquipment";
import { useEvents } from "../hooks/useEvents";
import { useConsumables } from "../hooks/useConsumables";

interface SearchResult {
  id: string;
  type: "booth" | "equipment" | "event" | "consumable";
  title: string;
  subtitle: string;
  status?: string;
  onClick?: () => void;
}

interface SearchPageProps {
  onNavigate?: (page: string, ...args: any[]) => void;
}

export function SearchPage({ onNavigate }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const { installations } = useInstallations();
  const { laptops, brotherPrinters, godexPrinters } = useEquipment();
  const { events } = useEvents();
  const { brotherConsumables, godexConsumables } = useConsumables();

  // Формируем результаты поиска из всех данных
  const allResults: SearchResult[] = useMemo(() => {
    const results: SearchResult[] = [];

    // Стойки
    installations.forEach(inst => {
      // Получаем имя ноутбука
      const laptopName = (() => {
        const laptop = laptops.find(l => l.id === Number(inst.laptop));
        return laptop?.name || `Ноутбук #${inst.laptop}`;
      })();

      // Получаем имена принтеров
      let printerInfo = "";
      if (inst.printer_type && inst.printer_number) {
        const printer = inst.printer_type === "brother" 
          ? brotherPrinters.find(p => p.id === inst.printer_number)
          : godexPrinters.find(p => p.id === inst.printer_number);
        const printerName = printer?.name || `${inst.printer_type === "brother" ? "Brother" : "Godex"} #${inst.printer_number}`;
        printerInfo = printerName;
      }
      
      if (inst.second_printer_type && inst.second_printer_number) {
        const secondPrinter = inst.second_printer_type === "brother" 
          ? brotherPrinters.find(p => p.id === inst.second_printer_number)
          : godexPrinters.find(p => p.id === inst.second_printer_number);
        const secondPrinterName = secondPrinter?.name || `${inst.second_printer_type === "brother" ? "Brother" : "Godex"} #${inst.second_printer_number}`;
        printerInfo += `, ${secondPrinterName}`;
      }
      
      const equipmentDisplay = printerInfo ? `${laptopName}, ${printerInfo}` : laptopName;

      results.push({
        id: `booth-${inst.rack}`,
        type: "booth",
        title: `Стойка ${inst.rack}`,
        subtitle: equipmentDisplay,
        status: "Активна",
        onClick: () => onNavigate?.("installations"),
      });
    });

    // Оборудование
    laptops.forEach(laptop => {
      results.push({
        id: `laptop-${laptop.id}`,
        type: "equipment",
        title: laptop.name || `Ноутбук #${laptop.id}`,
        subtitle: laptop.specification || laptop.model || "Не указано",
        status: laptop.status === "in-use" ? "Используется" : "Доступен",
        onClick: () => onNavigate?.("equipment-detail", "laptop", laptop.id),
      });
    });

    brotherPrinters.forEach(printer => {
      results.push({
        id: `brother-${printer.id}`,
        type: "equipment",
        title: printer.name || `Brother #${printer.id}`,
        subtitle: printer.model || "QL-820NWB",
        status: printer.status === "in-use" ? "Используется" : "Доступен",
        onClick: () => onNavigate?.("equipment-detail", "brother", printer.id),
      });
    });

    godexPrinters.forEach(printer => {
      results.push({
        id: `godex-${printer.id}`,
        type: "equipment",
        title: printer.name || `Godex #${printer.id}`,
        subtitle: printer.model || "G500",
        status: printer.status === "in-use" ? "Используется" : "Доступен",
        onClick: () => onNavigate?.("equipment-detail", "godex", printer.id),
      });
    });

    // Мероприятия
    events.forEach(event => {
      results.push({
        id: `event-${event.id}`,
        type: "event",
        title: event.name,
        subtitle: `${new Date(event.start_date).toLocaleDateString("ru-RU")} - ${new Date(event.end_date).toLocaleDateString("ru-RU")}, ${event.location}`,
        status: event.status === "active" ? "Активно" : event.status === "completed" ? "Завершено" : "Предстоит",
        onClick: () => onNavigate?.("events"),
      });
    });

    // Расходники
    brotherConsumables.forEach(item => {
      results.push({
        id: `brother-consumable-${item.id}`,
        type: "consumable",
        title: item.name,
        subtitle: `${item.quantity} шт в наличии`,
        status: item.quantity <= (item.min_quantity || 0) ? "Низкий остаток" : "В наличии",
        onClick: () => onNavigate?.("consumables"),
      });
    });

    godexConsumables.forEach(item => {
      results.push({
        id: `godex-consumable-${item.id}`,
        type: "consumable",
        title: item.name,
        subtitle: `${item.quantity} шт в наличии`,
        status: item.quantity <= (item.min_quantity || 0) ? "Низкий остаток" : "В наличии",
        onClick: () => onNavigate?.("consumables"),
      });
    });

    return results;
  }, [installations, laptops, brotherPrinters, godexPrinters, events, brotherConsumables, godexConsumables, onNavigate]);

  const filteredResults = useMemo(() => {
    return allResults.filter((result) => {
      const matchesQuery = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          result.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === "all" || result.type === filter;
      return matchesQuery && matchesFilter;
    });
  }, [allResults, searchQuery, filter]);

  const getIcon = (type: string) => {
    switch (type) {
      case "booth": return <Package className="h-4 w-4 text-primary" />;
      case "equipment": return <Monitor className="h-4 w-4 text-primary" />;
      case "event": return <Calendar className="h-4 w-4 text-primary" />;
      case "consumable": return <ShoppingCart className="h-4 w-4 text-primary" />;
      default: return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "booth": return "Стойка";
      case "equipment": return "Оборудование";
      case "event": return "Событие";
      case "consumable": return "Расходник";
      default: return "";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-2">Поиск</h2>
        <p className="text-sm text-muted-foreground">Найдите стойки, оборудование или события</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="booth">Стойки</TabsTrigger>
          <TabsTrigger value="equipment">Оборуд.</TabsTrigger>
          <TabsTrigger value="event">События</TabsTrigger>
          <TabsTrigger value="consumable">Расх.</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        {filteredResults.length === 0 ? (
          <Card className="border-border/40 bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="mb-3 h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Ничего не найдено</p>
            </CardContent>
          </Card>
        ) : (
          filteredResults.map((result) => (
            <Card
              key={result.id}
              className="cursor-pointer border-border/40 bg-card/50 transition-all hover:border-primary/50 hover:bg-card/80"
              onClick={result.onClick}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-md bg-primary/10 p-2">
                  {getIcon(result.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{result.title}</p>
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(result.type)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{result.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  {result.status && (
                    <Badge variant="secondary" className="text-xs">
                      {result.status}
                    </Badge>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
