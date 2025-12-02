import { Calendar, MapPin, Monitor, Printer, Tag, Package, FileText, Download, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner";
import { useInstallations } from "../hooks/useInstallations";
import { useEquipment } from "../hooks/useEquipment";

interface Event {
  id: number;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  booths: number;
  laptops: number;
  brotherPrinters: number;
  godexPrinters: number;
}

interface EventDetailDialogProps {
  open: boolean;
  onClose: () => void;
  event: Event | null;
}

export function EventDetailDialog({ open, onClose, event }: EventDetailDialogProps) {
  const { installations } = useInstallations();
  const { laptops, brotherPrinters, godexPrinters } = useEquipment();

  if (!event) return null;

  // Получаем установки для этого мероприятия
  const eventInstallations = installations.filter(inst => inst.event_id === event.id);

  // Форматируем установки с реальными именами оборудования
  const formattedInstallations = eventInstallations.map(inst => {
    const laptop = laptops.find(l => l.id === Number(inst.laptop));
    const laptopName = laptop?.name || `Ноутбук #${inst.laptop}`;
    
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
    
    return {
      booth: inst.rack,
      equipment: printerInfo ? `${laptopName} • ${printerInfo}` : laptopName
    };
  });

  const handleGeneratePDF = () => {
    toast.success("PDF отчет", {
      description: `Отчет по мероприятию "${event.name}" будет загружен`,
    });
  };

  const totalEquipment = event.laptops + event.brotherPrinters + event.godexPrinters;
  const usedEquipment = formattedInstallations.length;
  const equipmentProgress = totalEquipment > 0 ? (usedEquipment / totalEquipment) * 100 : 0;

  const statusColors = {
    upcoming: "outline",
    active: "default",
    completed: "secondary",
  } as const;

  const statusLabels = {
    upcoming: "Запланировано",
    active: "Активно",
    completed: "Завершено",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle>{event.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                {event.location}
              </DialogDescription>
            </div>
            <Badge variant={statusColors[event.status]}>
              {statusLabels[event.status]}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Даты мероприятия */}
          <Card className="border-border/40 bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded bg-primary/10 p-2">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Период проведения</p>
                  <p className="font-medium">
                    {event.startDate} — {event.endDate}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Планируемое оборудование */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Планируемое оборудование</h4>
              <Badge variant="outline">
                {totalEquipment} единиц
              </Badge>
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card/50 p-3">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary" />
                  <span className="text-sm">Ноутбуки</span>
                </div>
                <span className="text-sm font-medium">{event.laptops} шт</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card/50 p-3">
                <div className="flex items-center gap-2">
                  <Printer className="h-4 w-4 text-primary" />
                  <span className="text-sm">Brother принтеры</span>
                </div>
                <span className="text-sm font-medium">{event.brotherPrinters} шт</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card/50 p-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="text-sm">Godex принтеры</span>
                </div>
                <span className="text-sm font-medium">{event.godexPrinters} шт</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Установленные стойки */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Установленные стойки ({formattedInstallations.length})</h4>
            {formattedInstallations.length === 0 ? (
              <Card className="border-border/40 bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <Info className="mb-2 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">
                    На это мероприятие ещё не установлено ни одной стойки
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {formattedInstallations.map((inst, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-border/40 bg-card/50 p-3 text-sm"
                  >
                    <span className="font-medium">Стойка {inst.booth}</span>
                    <span className="text-muted-foreground">{inst.equipment}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Действия */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleGeneratePDF}
            >
              <Download className="mr-2 h-4 w-4" />
              PDF отчет
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="mr-2 h-4 w-4" />
              Экспорт данных
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
