import React, { useState } from "react";
import { Minus, Plus, Printer, Tag } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { EditConsumableDialog } from "./EditConsumableDialog";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { useConsumables } from "../hooks/useConsumables";
import { useTelegramAuth } from "../hooks/useTelegramAuth";
import { activityApi } from "../lib/api";
import { frontendAnalyticsApi } from "../lib/api/analytics";
import { getUserAvatarUrl } from "../utils/avatarUtils";

interface Consumable {
  id: number;
  name: string;
  type: "brother" | "godex";
  quantity: number;
  minimum: number;
  originalItem?: any;
}

export function ConsumablesPage() {
  const [activeTab, setActiveTab] = useState("brother");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Consumable | null>(null);
  const [amount] = useState(5);

  const { brotherConsumables, godexConsumables, loading, refetch, updateBrother, updateGodex } = useConsumables();
  const { user } = useTelegramAuth();
  
  const consumables = [
    ...(brotherConsumables?.map(item => ({
      id: item.id,
      name: item.name,
      type: 'brother' as const,
      quantity: item.quantity,
      minimum: item.min_quantity || 0,
      originalItem: item,
    })) || []),
    ...(godexConsumables?.map(item => ({
      id: item.id,
      name: item.name,
      type: 'godex' as const,
      quantity: item.quantity,
      minimum: item.min_quantity || 0,
      originalItem: item,
    })) || []),
  ];

  const filteredConsumables = consumables.filter((item) => item.type === activeTab);

  const getProgressValue = (quantity: number, minimum: number) => {
    const maxStock = minimum * 5;
    return (quantity / maxStock) * 100;
  };

  const isLowStock = (quantity: number, minimum: number) => {
    return quantity <= minimum;
  };

  return (
    <div className="space-y-4">
      <h2>Расходные материалы</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="brother">
            <Printer className="mr-2 h-4 w-4" />
            Brother
          </TabsTrigger>
          <TabsTrigger value="godex">
            <Tag className="mr-2 h-4 w-4" />
            Godex
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {filteredConsumables.map((item) => (
          <Card key={item.id} className="border-border/40 bg-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{item.name}</CardTitle>
                {isLowStock(item.quantity, item.minimum) && (
                  <Badge variant="destructive" className="shadow-sm">Низкий остаток</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-3">
              <div className="text-center">
                <div className="text-3xl font-medium">{item.quantity}</div>
                <p className="text-xs text-muted-foreground">штук в наличии</p>
              </div>
              <Progress 
                value={getProgressValue(item.quantity, item.minimum)} 
                className="h-2"
              />
              <p className="text-xs text-center text-muted-foreground">
                Минимум: {item.minimum} шт
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 hover:bg-destructive/10 hover:text-destructive"
                onClick={async () => {
                  try {
                    const oldQty = item.quantity;
                    const newQty = Math.max(0, item.quantity - amount);
                    if (item.type === "brother") {
                      await updateBrother(item.id, newQty);
                    } else {
                      await updateGodex(item.id, newQty);
                    }
                    
                    // Получаем аватар пользователя
                    let avatarUrl: string | null = null;
                    if (user?.id) {
                      try {
                        avatarUrl = await getUserAvatarUrl(user.id, user.photo_url);
                      } catch (avatarError) {
                        console.error("Error getting avatar URL:", avatarError);
                      }
                    }
                    
                    // Создаем запись активности с количеством и аватаром
                    try {
                      await activityApi.create({
                        user_id: user?.id?.toString() || "",
                        username: user?.username || user?.first_name || "Unknown",
                        action_type: "update_consumable",
                        item_type: item.type,
                        item_name: `${item.name} (было: ${oldQty} → стало: ${newQty})`,
                        avatar_url: avatarUrl || undefined,
                      });
                    } catch (activityError) {
                      console.error("Error logging activity:", activityError);
                    }
                    
                    // Логируем аналитику фронтенда
                    try {
                      await frontendAnalyticsApi.logAction(
                        'quick_update_consumable',
                        {
                          consumable_type: item.type,
                          consumable_id: item.id,
                          consumable_name: item.name,
                          old_quantity: oldQty,
                          new_quantity: newQty,
                          change: -amount,
                        },
                        user?.id,
                        user?.username
                      );
                    } catch (analyticsError) {
                      console.error("Error logging frontend analytics:", analyticsError);
                    }
                    
                    // Обновляем активность после изменения
                    window.dispatchEvent(new Event('activityNeedsUpdate'));
                  } catch (error) {
                    console.error("Error updating consumable:", error);
                  }
                }}
              >
                <Minus className="mr-1 h-4 w-4" />
                {amount}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 hover:bg-primary/10 hover:text-primary"
                onClick={async () => {
                  try {
                    const oldQty = item.quantity;
                    const newQty = item.quantity + amount;
                    if (item.type === "brother") {
                      await updateBrother(item.id, newQty);
                    } else {
                      await updateGodex(item.id, newQty);
                    }
                    
                    // Получаем аватар пользователя
                    let avatarUrl: string | null = null;
                    if (user?.id) {
                      try {
                        avatarUrl = await getUserAvatarUrl(user.id, user.photo_url);
                      } catch (avatarError) {
                        console.error("Error getting avatar URL:", avatarError);
                      }
                    }
                    
                    // Создаем запись активности с количеством и аватаром
                    try {
                      await activityApi.create({
                        user_id: user?.id?.toString() || "",
                        username: user?.username || user?.first_name || "Unknown",
                        action_type: "update_consumable",
                        item_type: item.type,
                        item_name: `${item.name} (было: ${oldQty} → стало: ${newQty})`,
                        avatar_url: avatarUrl || undefined,
                      });
                    } catch (activityError) {
                      console.error("Error logging activity:", activityError);
                    }
                    
                    // Логируем аналитику фронтенда
                    try {
                      await frontendAnalyticsApi.logAction(
                        'quick_update_consumable',
                        {
                          consumable_type: item.type,
                          consumable_id: item.id,
                          consumable_name: item.name,
                          old_quantity: oldQty,
                          new_quantity: newQty,
                          change: amount,
                        },
                        user?.id,
                        user?.username
                      );
                    } catch (analyticsError) {
                      console.error("Error logging frontend analytics:", analyticsError);
                    }
                    
                    // Обновляем активность после изменения
                    window.dispatchEvent(new Event('activityNeedsUpdate'));
                  } catch (error) {
                    console.error("Error updating consumable:", error);
                  }
                }}
              >
                <Plus className="mr-1 h-4 w-4" />
                {amount}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedItem(item);
                  setDialogOpen(true);
                }}
              >
                ...
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedItem && (
        <EditConsumableDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedItem(null);
          }}
          consumable={{
            id: selectedItem.id,
            type: selectedItem.type,
            name: selectedItem.name,
            quantity: selectedItem.quantity,
            minimum: selectedItem.minimum,
            onUpdate: async (quantity: number) => {
              const oldQty = selectedItem.quantity;
              if (selectedItem.type === "brother") {
                await updateBrother(selectedItem.id, quantity);
              } else {
                await updateGodex(selectedItem.id, quantity);
              }
              
              // Получаем аватар пользователя
              let avatarUrl: string | null = null;
              if (user?.id) {
                try {
                  avatarUrl = await getUserAvatarUrl(user.id, user.photo_url);
                } catch (avatarError) {
                  console.error("Error getting avatar URL:", avatarError);
                }
              }
              
              // Создаем запись активности с количеством и аватаром
              try {
                await activityApi.create({
                  user_id: user?.id?.toString() || "",
                  username: user?.username || user?.first_name || "Unknown",
                  action_type: "update_consumable",
                  item_type: selectedItem.type,
                  item_name: `${selectedItem.name} (было: ${oldQty} → стало: ${quantity})`,
                  avatar_url: avatarUrl || undefined,
                });
              } catch (activityError) {
                console.error("Error logging activity:", activityError);
              }
            },
          }}
        />
      )}
    </div>
  );
}
