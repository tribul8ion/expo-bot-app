// React Hook для работы с уведомлениями
import { useState, useEffect, useCallback } from 'react';
import { consumablesApi } from '../lib/api';
import { useInstallations } from './useInstallations';
import { useEvents } from './useEvents';

export interface Notification {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  message: string;
  time: string;
  read: boolean;
  createdAt: Date;
}

/**
 * Генерация уведомлений на основе данных системы:
 * - Низкий остаток расходников (ниже минимума)
 * - Активные установки (можно добавить логику для важных уведомлений)
 * - Мероприятия, которые скоро начнутся
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(() => {
    // Загружаем прочитанные уведомления из localStorage
    try {
      const stored = localStorage.getItem('readNotifications');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const { installations: activeInstallations } = useInstallations();
  const { events } = useEvents();

  // Сохраняем прочитанные уведомления в localStorage
  useEffect(() => {
    try {
      localStorage.setItem('readNotifications', JSON.stringify(Array.from(readNotifications)));
    } catch (error) {
      console.error('Error saving read notifications:', error);
    }
  }, [readNotifications]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const newNotifications: Notification[] = [];

      // 1. Проверяем расходники с низким остатком
      try {
        const [brotherConsumables, godexConsumables] = await Promise.all([
          consumablesApi.getBrother(),
          consumablesApi.getGodex(),
        ]);

        const allConsumables = [
          ...brotherConsumables.map(c => ({ ...c, type: 'brother' as const })),
          ...godexConsumables.map(c => ({ ...c, type: 'godex' as const })),
        ];

        allConsumables.forEach(consumable => {
          const minQuantity = consumable.min_quantity || 0;
          if (consumable.quantity <= minQuantity) {
            const notificationId = `low_stock_${consumable.type}_${consumable.id}`;
            newNotifications.push({
              id: notificationId,
              type: "warning",
              title: "Низкий остаток расходника",
              message: `${consumable.name} (${consumable.type === 'brother' ? 'Brother' : 'Godex'}): осталось ${consumable.quantity} шт. (минимум: ${minQuantity} шт.)`,
              time: new Date().toLocaleString("ru-RU", {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              }),
              read: readNotifications.has(notificationId),
              createdAt: new Date(),
            });
          }
        });
      } catch (error) {
        console.error("Error fetching consumables for notifications:", error);
      }

      // 2. Проверяем мероприятия, которые скоро начнутся (в течение 24 часов)
      try {
        const now = new Date();
        const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        events
          .filter(event => {
            if (event.status !== 'upcoming' && event.status !== 'active') return false;
            if (!event.start_date) return false;
            
            const startDate = new Date(event.start_date);
            return startDate >= now && startDate <= in24Hours;
          })
          .forEach(event => {
            const startDate = new Date(event.start_date!);
            const hoursUntilStart = Math.round((startDate.getTime() - now.getTime()) / (1000 * 60 * 60));
            
            const notificationId = `event_soon_${event.id}`;
            newNotifications.push({
              id: notificationId,
              type: "info",
              title: "Мероприятие скоро начнется",
              message: `${event.name} начнется через ${hoursUntilStart} ${hoursUntilStart === 1 ? 'час' : hoursUntilStart < 5 ? 'часа' : 'часов'}`,
              time: startDate.toLocaleString("ru-RU", {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              }),
              read: readNotifications.has(notificationId),
              createdAt: new Date(),
            });
          });
      } catch (error) {
        console.error("Error processing events for notifications:", error);
      }

      // 3. Можно добавить уведомления о долгих активных установках
      // (например, установки, которые активны более 7 дней)
      try {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const longActiveInstallations = activeInstallations.filter(inst => {
          if (!inst.date) return false;
          const installDate = new Date(inst.date);
          return installDate < sevenDaysAgo;
        });

        if (longActiveInstallations.length > 0) {
          const notificationId = `long_active_installations`;
          newNotifications.push({
            id: notificationId,
            type: "info",
            title: "Долгие активные установки",
            message: `${longActiveInstallations.length} установок активны более 7 дней`,
            time: new Date().toLocaleString("ru-RU", {
              day: "numeric",
              month: "long",
            }),
            read: readNotifications.has(notificationId),
            createdAt: new Date(),
          });
        }
      } catch (error) {
        console.error("Error processing installations for notifications:", error);
      }

      // Сортируем по дате создания (новые сначала)
      newNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setNotifications(newNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [activeInstallations, events, readNotifications]);

  useEffect(() => {
    fetchNotifications();
    
    // Обновляем уведомления каждые 5 минут
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = useCallback((notificationId: string) => {
    setReadNotifications(prev => {
      const newSet = new Set(prev);
      newSet.add(notificationId);
      return newSet;
    });
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map(n => n.id);
    setReadNotifications(prev => {
      const newSet = new Set(prev);
      allIds.forEach(id => newSet.add(id));
      return newSet;
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
