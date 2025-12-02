import React, { useState, useEffect } from "react";
import { ArrowLeft, Monitor, MapPin, Printer, Tag, Info, Network } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { equipmentApi, Laptop, BrotherPrinter, GodexPrinter } from "../lib/api";
import { useInstallations } from "../hooks/useInstallations";

interface EquipmentDetailPageProps {
  onBack: () => void;
  equipmentType?: "laptop" | "brother" | "godex";
  equipmentId?: number;
}

export function EquipmentDetailPage({ 
  onBack, 
  equipmentType = "laptop", 
  equipmentId = 15 
}: EquipmentDetailPageProps) {
  const [equipment, setEquipment] = useState<Laptop | BrotherPrinter | GodexPrinter | null>(null);
  const [loading, setLoading] = useState(true);
  const { installations } = useInstallations();

  // Загружаем данные оборудования
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        let data;
        if (equipmentType === 'laptop') {
          data = await equipmentApi.getLaptop(equipmentId);
        } else if (equipmentType === 'brother') {
          data = await equipmentApi.getBrotherPrinter(equipmentId);
        } else {
          data = await equipmentApi.getGodexPrinter(equipmentId);
        }
        setEquipment(data);
      } catch (error) {
        console.error('Error fetching equipment:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEquipment();
  }, [equipmentType, equipmentId]);

  // Иконка по типу
  const Icon = equipmentType === 'laptop' ? Monitor : equipmentType === 'brother' ? Printer : Tag;

  // Получаем текущую установку для этого оборудования
  const currentInstallation = installations.find(inst => {
    if (equipmentType === 'laptop') {
      return inst.laptop === equipmentId || inst.laptop.toString() === equipmentId.toString();
    }
    return inst.printer_type === equipmentType && inst.printer_number === equipmentId;
  });

  const statusLabels = {
    "in-use": "Используется",
    available: "Свободен",
    maintenance: "На обслуживании",
  };

  const statusColors = {
    "in-use": "default",
    available: "secondary",
    maintenance: "outline",
  } as const;

  if (loading || !equipment) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h2>Детали оборудования</h2>
          </div>
        </div>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Формируем данные для отображения
  const equipmentStatus = (equipment.status?.toLowerCase() === "available" ? "available" : 
                           equipment.status?.toLowerCase() === "in-use" ? "in-use" : 
                           "maintenance") as "available" | "in-use" | "maintenance";

  const equipmentName = equipment.name || `№${equipment.id}`;
  const equipmentModel = equipment.model || "Не указано";
  const equipmentSpecs = equipmentType === 'laptop' 
    ? (equipment as Laptop).specification || equipmentModel
    : equipmentModel;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2>Детали оборудования</h2>
        </div>
      </div>

      {/* Основная информация */}
      <Card className="border-border/40 bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{equipmentName}</CardTitle>
                <p className="text-sm text-muted-foreground">{equipmentModel}</p>
              </div>
            </div>
            <Badge variant={statusColors[equipmentStatus]} className="shadow-sm">
              {statusLabels[equipmentStatus]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Технические характеристики */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Характеристики</span>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-sm">{equipmentSpecs}</p>
            </div>
          </div>

          <Separator />

          {/* Сетевые данные */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Network className="h-4 w-4" />
              <span>Сетевые данные</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="mb-1 text-xs text-muted-foreground">Серийный номер</p>
                <p className="text-sm font-medium">{equipment.serial_number || "Не указан"}</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="mb-1 text-xs text-muted-foreground">MAC адрес</p>
                <p className="text-sm font-medium font-mono">{equipment.mac_address || "Не указан"}</p>
              </div>
            </div>
            {equipmentType === 'brother' && (equipment as BrotherPrinter).ip_address && (
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="mb-1 text-xs text-muted-foreground">IP адрес (резерв)</p>
                <p className="text-sm font-medium font-mono">{(equipment as BrotherPrinter).ip_address}</p>
                <p className="text-xs text-muted-foreground mt-1">Подсети: 10.2.60.*, 10.9.60.*, 10.17.60.*, 10.25.60.*</p>
              </div>
            )}
            {equipmentType === 'godex' && (equipment as GodexPrinter).ip_address && (
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="mb-1 text-xs text-muted-foreground">IP адрес (резерв)</p>
                <p className="text-sm font-medium font-mono">{(equipment as GodexPrinter).ip_address}</p>
                <p className="text-xs text-muted-foreground mt-1">Подсети: 10.2.60.*, 10.9.60.*, 10.17.60.*, 10.25.60.*</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Текущее размещение */}
          {currentInstallation && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Текущее размещение</span>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <p className="text-sm font-medium">Стойка {currentInstallation.rack}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Действия */}
      <div className="grid gap-2">
        {equipmentStatus === "available" && (
          <Button className="w-full shadow-sm" size="lg">
            <MapPin className="mr-2 h-4 w-4" />
            Назначить на стойку
          </Button>
        )}
        {equipmentStatus === "in-use" && (
          <Button variant="outline" className="w-full" size="lg">
            Завершить использование
          </Button>
        )}
      </div>
    </div>
  );
}
