// Activity Log API
import { apiClient } from './client';

export interface Activity {
  id?: number;
  user_id: string;
  username: string;
  action_type: 'create_installation' | 'complete_installation' | 'create_event' | 'complete_event' | 'delete_event' | 'update_consumable';
  item_type: 'installation' | 'event' | 'consumable';
  item_id?: number;
  item_name: string;
  details?: Record<string, any>;
  avatar_url?: string;  // URL аватара из Telegram
  created_at: string;
}

export interface ActivityDisplay {
  id: number;
  user: string;
  user_id?: string;  // Добавляем user_id для получения аватара
  avatar_url?: string;  // URL аватара из Telegram
  action: string;
  item: string;
  time: string;  // Отформатированная строка для отображения
  created_at?: string;  // Исходная ISO дата для парсинга
}

export const activityApi = {
  // Получить последние активности
  async getRecent(limit: number = 10): Promise<ActivityDisplay[]> {
    const activities = await apiClient.get<Activity[]>(
      `/activity_log?select=*&order=created_at.desc&limit=${limit}`
    );
    
    return activities.map(activity => {
      const actionLabels: Record<string, string> = {
        'create_installation': 'создал установку',
        'complete_installation': 'завершил установку',
        'create_event': 'создал мероприятие',
        'complete_event': 'завершил мероприятие',
        'delete_event': 'удалил мероприятие',
        'update_consumable': 'обновил расходник',
      };
      
      const action = actionLabels[activity.action_type] || activity.action_type;
      const time = new Date(activity.created_at).toLocaleString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      
      return {
        id: activity.id || 0,
        user: activity.username || `User ${activity.user_id}`,
        user_id: activity.user_id,  // Сохраняем user_id для получения аватара
        avatar_url: activity.avatar_url,  // Сохраняем URL аватара из Telegram
        action,
        item: activity.item_name,
        time,
        created_at: activity.created_at,  // Сохраняем исходную дату для парсинга
      };
    });
  },

  // Создать запись активности
  async create(activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> {
    const result = await apiClient.post<Activity[]>('/activity_log', activity);
    return result[0];
  },
};
