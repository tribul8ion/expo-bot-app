import { useState } from "react";
import { Plus, Minus, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Separator } from "./ui/separator";
import { useTelegramAuth } from "../hooks/useTelegramAuth";
import { activityApi } from "../lib/api";
import { frontendAnalyticsApi } from "../lib/api/analytics";
import { getUserAvatarUrl } from "../utils/avatarUtils";

interface EditConsumableDialogProps {
  open: boolean;
  onClose: () => void;
  consumable: {
    id?: number;
    type?: "brother" | "godex";
    name: string;
    quantity: number;
    minimum: number;
    onUpdate?: (quantity: number) => Promise<void>;
  };
}

export function EditConsumableDialog({ open, onClose, consumable }: EditConsumableDialogProps) {
  const { user } = useTelegramAuth();
  const [inputValue, setInputValue] = useState("");
  const [newQuantity, setNewQuantity] = useState(consumable.quantity);
  const [operation, setOperation] = useState<"set" | "add" | "subtract">("set");

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    if (value === "") {
      setNewQuantity(consumable.quantity);
      setOperation("set");
      return;
    }

    // Определяем операцию по первому символу
    if (value.startsWith("+")) {
      const num = parseInt(value.substring(1));
      if (!isNaN(num)) {
        setOperation("add");
        setNewQuantity(consumable.quantity + num);
      }
    } else if (value.startsWith("-")) {
      const num = parseInt(value.substring(1));
      if (!isNaN(num)) {
        setOperation("subtract");
        setNewQuantity(Math.max(0, consumable.quantity - num));
      }
    } else {
      const num = parseInt(value);
      if (!isNaN(num)) {
        setOperation("set");
        setNewQuantity(Math.max(0, num));
      }
    }
  };

  const handleSubmit = async () => {
    if (inputValue === "") {
      toast.error("Введите значение");
      return;
    }

    const startTime = performance.now();
    
    try {
      if (consumable.onUpdate) {
        await consumable.onUpdate(newQuantity);
      }
      
      const change = newQuantity - consumable.quantity;
      let message = "";
      
      if (change > 0) {
        message = `Добавлено ${change} шт`;
      } else if (change < 0) {
        message = `Списано ${Math.abs(change)} шт`;
      } else {
        message = "Без изменений";
      }

      toast.success(`${consumable.name}`, {
        description: message + `. Новый остаток: ${newQuantity} шт`,
      });

      // Получаем аватар пользователя перед логированием активности
      let avatarUrl: string | null = null;
      if (user?.id) {
        try {
          avatarUrl = await getUserAvatarUrl(user.id, user.photo_url);
        } catch (avatarError) {
          console.error("Error getting avatar URL:", avatarError);
        }
      }

      // Создаем запись активности с указанием количества и аватаром
      const oldQuantity = consumable.quantity;
      try {
        const quantityInfo = oldQuantity !== newQuantity
          ? ` (было: ${oldQuantity} → стало: ${newQuantity})`
          : ` (количество: ${newQuantity})`;
        
        await activityApi.create({
          user_id: user?.id?.toString() || "",
          username: user?.username || user?.first_name || "Unknown",
          action_type: "update_consumable",
          item_type: consumable.type || "consumable",
          item_name: `${consumable.name}${quantityInfo}`,
          avatar_url: avatarUrl || undefined,
        });
      } catch (activityError) {
        console.error("Error logging activity:", activityError);
      }

      // Логируем аналитику фронтенда
      const responseTime = Math.round(performance.now() - startTime);
      try {
        await frontendAnalyticsApi.logAction(
          'update_consumable',
          {
            consumable_type: consumable.type || consumable.id,
            consumable_id: consumable.id,
            consumable_name: consumable.name,
            old_quantity: oldQuantity,
            new_quantity: newQuantity,
            change: change,
          },
          user?.id,
          user?.username,
          responseTime
        );
      } catch (analyticsError) {
        console.error("Error logging frontend analytics:", analyticsError);
      }

      // Обновляем активность после изменения расходника
      window.dispatchEvent(new Event('activityNeedsUpdate'));

      onClose();
    } catch (error) {
      console.error("Error updating consumable:", error);
      toast.error("Ошибка при обновлении расходника");
    }
  };

  const handleClose = () => {
    setInputValue("");
    setNewQuantity(consumable.quantity);
    setOperation("set");
    onClose();
  };

  const getOperationLabel = () => {
    switch (operation) {
      case "add":
        return "Добавить";
      case "subtract":
        return "Списать";
      default:
        return "Установить";
    }
  };

  const getOperationColor = () => {
    switch (operation) {
      case "add":
        return "text-green-500";
      case "subtract":
        return "text-destructive";
      default:
        return "text-primary";
    }
  };

  const recentHistory = [
    { date: "2 ноя, 10:30", change: -5, user: "ИП" },
    { date: "1 ноя, 14:20", change: +10, user: "АС" },
    { date: "31 окт, 09:15", change: -3, user: "МП" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {consumable.name}
          </DialogTitle>
          <DialogDescription>
            Изменить количество расходного материала
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border/40 bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Текущий остаток</p>
                <p className="text-2xl font-semibold">{consumable.quantity} шт</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Минимум</p>
                <p className="text-lg font-medium">{consumable.minimum} шт</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Изменить количество</Label>
            <Input
              id="quantity"
              placeholder="25 или +10 или -5"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Введите число для установки, +число для добавления или -число для списания
            </p>
          </div>

          {inputValue && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${getOperationColor()}`}>
                    {getOperationLabel()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {consumable.quantity} → {newQuantity} шт
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold">{newQuantity} шт</p>
                  <p className="text-xs text-muted-foreground">Новый остаток</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="mb-2 text-sm font-medium">Последние изменения</h4>
            <div className="space-y-2">
              {recentHistory.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded px-1.5 py-0.5 ${
                        item.change > 0
                          ? "bg-green-500/10 text-green-500"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {item.change > 0 ? `+${item.change}` : item.change}
                    </div>
                    <span className="text-muted-foreground">{item.user}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={!inputValue}>
            Применить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
