"use client"

import { useState, useMemo } from "react"
import { Monitor, Printer, Tag, Eye, Package, MapPin } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Skeleton } from "./ui/skeleton"
import { useEquipment } from "../hooks/useEquipment"
import { useInstallations } from "../hooks/useInstallations"

interface Equipment {
  id: number
  name: string
  model: string
  type: "laptop" | "brother" | "godex"
  status: "available" | "in-use" | "maintenance"
  usageCount: number
  currentLocation?: string | null
}

interface EquipmentPageProps {
  onViewDetails?: (type: "laptop" | "brother" | "godex", id: number) => void
}

export function EquipmentPage({ onViewDetails }: EquipmentPageProps) {
  const [activeTab, setActiveTab] = useState("laptops")

  const { laptops, brotherPrinters, godexPrinters, loading } = useEquipment()
  const { installations } = useInstallations()

  // Формируем единый массив оборудования с информацией о текущих установках
  const equipment: Equipment[] = useMemo(() => {
    return [
      ...laptops.map((laptop) => {
        const installation = installations.find(
          (inst) => inst.laptop === laptop.id || inst.laptop.toString() === laptop.id.toString(),
        )
        return {
          id: laptop.id,
          name: laptop.name || `Ноутбук #${laptop.id}`,
          model: laptop.specification || laptop.model || "Не указано",
          type: "laptop" as const,
          status: installation
            ? ("in-use" as const)
            : ((laptop.status?.toLowerCase() === "available"
                ? "available"
                : laptop.status?.toLowerCase() === "in-use"
                  ? "in-use"
                  : "maintenance") as "available" | "in-use" | "maintenance"),
          usageCount: 0,
          currentLocation: installation?.rack || null,
        }
      }),
      ...brotherPrinters.map((printer) => {
        const installation = installations.find(
          (inst) => inst.printer_type === "brother" && inst.printer_number === printer.id,
        )
        return {
          id: printer.id,
          name: printer.name || `Brother #${printer.id}`,
          model: printer.model || "Brother QL-820NWB",
          type: "brother" as const,
          status: installation
            ? ("in-use" as const)
            : ((printer.status?.toLowerCase() === "available"
                ? "available"
                : printer.status?.toLowerCase() === "in-use"
                  ? "in-use"
                  : "maintenance") as "available" | "in-use" | "maintenance"),
          usageCount: 0,
          currentLocation: installation?.rack || null,
        }
      }),
      ...godexPrinters.map((printer) => {
        const installation = installations.find(
          (inst) => inst.printer_type === "godex" && inst.printer_number === printer.id,
        )
        return {
          id: printer.id,
          name: printer.name || `Godex #${printer.id}`,
          model: printer.model || "Godex G500",
          type: "godex" as const,
          status: installation
            ? ("in-use" as const)
            : ((printer.status?.toLowerCase() === "available"
                ? "available"
                : printer.status?.toLowerCase() === "in-use"
                  ? "in-use"
                  : "maintenance") as "available" | "in-use" | "maintenance"),
          usageCount: 0,
          currentLocation: installation?.rack || null,
        }
      }),
    ]
  }, [laptops, brotherPrinters, godexPrinters, installations])

  const filteredEquipment = equipment.filter((item) => {
    if (activeTab === "laptops") return item.type === "laptop"
    if (activeTab === "brother") return item.type === "brother"
    if (activeTab === "godex") return item.type === "godex"
    return true
  })

  const statusConfig = {
    available: { variant: "default" as const, bg: "bg-success/10", text: "text-success", label: "Свободен" },
    "in-use": { variant: "secondary" as const, bg: "bg-warning/10", text: "text-warning", label: "Используется" },
    maintenance: {
      variant: "destructive" as const,
      bg: "bg-destructive/10",
      text: "text-destructive",
      label: "На обслуживании",
    },
  }

  const typeConfig = {
    laptop: { icon: Monitor, color: "primary", label: "Ноутбук" },
    brother: { icon: Printer, color: "tertiary", label: "Brother" },
    godex: { icon: Tag, color: "warning", label: "Godex" },
  }

  const getIcon = (type: "laptop" | "brother" | "godex") => {
    const config = typeConfig[type]
    const Icon = config.icon
    return <Icon className={`h-5 w-5 text-${config.color}`} />
  }

  return (
    <div className="space-y-4">
      <h2 className="animate-fade-in">Оборудование</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-slide-up">
        <TabsList className="w-full">
          <TabsTrigger value="laptops" className="flex-1">
            <Monitor className="mr-1.5 h-4 w-4" />
            Ноутбуки
          </TabsTrigger>
          <TabsTrigger value="brother" className="flex-1">
            <Printer className="mr-1.5 h-4 w-4" />
            Brother
          </TabsTrigger>
          <TabsTrigger value="godex" className="flex-1">
            <Tag className="mr-1.5 h-4 w-4" />
            Godex
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="border-border/40 bg-card/50 overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-32 animate-shimmer" />
                <Skeleton className="h-4 w-full animate-shimmer" />
                <Skeleton className="h-4 w-full animate-shimmer" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredEquipment.length === 0 ? (
        <Card className="border-border/40 bg-card/50 animate-scale-in">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted/50 p-5 mb-4">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-base font-medium text-foreground">Нет оборудования</p>
            <p className="text-sm text-muted-foreground mt-1">В этой категории пока нет устройств</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredEquipment.map((item, index) => {
            const config = typeConfig[item.type]
            const status = statusConfig[item.status]

            return (
              <Card
                key={item.id}
                className="border-border/40 bg-card/50 hover:bg-card/80 transition-all duration-200 hover:shadow-md group relative overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Цветная левая полоска */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-${config.color}/60 group-hover:bg-${config.color} transition-colors`}
                />

                <CardHeader className="pb-3 pl-5">
                  <div className="flex items-start gap-3">
                    <Avatar className={`h-10 w-10 shadow-sm ring-2 ring-${config.color}/20`}>
                      <AvatarFallback className={`bg-${config.color}/10`}>{getIcon(item.type)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base truncate">{item.name}</CardTitle>
                        <Badge variant={status.variant} className="shadow-sm shrink-0">
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pb-3 pl-5">
                  <p className="text-sm text-muted-foreground">{item.model}</p>
                  {item.currentLocation && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="rounded-lg bg-primary/10 p-1 shadow-sm">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-foreground font-medium">Стойка {item.currentLocation}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pl-5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all bg-transparent"
                    onClick={() => onViewDetails?.(item.type, item.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Детали
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
