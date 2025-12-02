import { QrCode, Camera, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface QRScannerModalProps {
  open: boolean;
  onClose: () => void;
}

export function QRScannerModal({ open, onClose }: QRScannerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            QR-сканер
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="border-border/40 bg-card/50">
            <CardContent className="flex aspect-square items-center justify-center p-6">
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                  <Camera className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Наведите камеру на QR-код</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    QR-код со стойкой или оборудованием
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Что можно сканировать:</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 rounded-md bg-muted/30 p-2">
                <QrCode className="h-4 w-4 text-primary" />
                <p className="text-xs">QR-код стойки (быстрый доступ)</p>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-muted/30 p-2">
                <QrCode className="h-4 w-4 text-primary" />
                <p className="text-xs">QR-код оборудования (детали)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Отмена
            </Button>
            <Button className="shadow-sm">
              <Camera className="mr-2 h-4 w-4" />
              Открыть камеру
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
