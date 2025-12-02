// Events API
import { apiClient } from './client';

export interface Event {
  id?: number;
  name: string;
  event_name?: string; // для past_events
  start_date: string;
  event_date?: string; // для past_events
  end_date: string;
  location: string;
  description?: string;
  status?: 'active' | 'completed' | 'upcoming';
  equipment?: {
    laptops: number[] | number;
    brother_printers: number;
    godex_printers: number;
  };
  brother_count?: number;
  godex_count?: number;
}

export const eventsApi = {
  // Получить текущие мероприятия (из future_events)
  async getActive(): Promise<Event[]> {
    return apiClient.get<Event[]>('/future_events?select=*&order=start_date.desc');
  },

  // Получить все мероприятия (из future_events)
  async getAll(): Promise<Event[]> {
    return apiClient.get<Event[]>('/future_events?select=*&order=start_date.desc');
  },

  // Получить мероприятия за месяц (из future_events)
  async getByMonth(year: number, month: number): Promise<Event[]> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = month === 12 
      ? `${year + 1}-01-01` 
      : `${year}-${(month + 1).toString().padStart(2, '0')}-01`;
    
    return apiClient.get<Event[]>(
      `/future_events?select=*&start_date=gte.${startDate}&end_date=lt.${endDate}&order=start_date.asc`
    );
  },

  // Получить мероприятие по ID (из future_events)
  async getById(id: number): Promise<Event | null> {
    const results = await apiClient.get<Event[]>(`/future_events?select=*&id=eq.${id}`);
    return results[0] || null;
  },

  // Создать мероприятие
  async create(event: Omit<Event, 'id'>): Promise<Event> {
    const result = await apiClient.post<Event[]>('/future_events', event);
    return result[0];
  },

  // Получить архивные мероприятия
  async getArchived(): Promise<Event[]> {
    return apiClient.get<Event[]>('/past_events?select=*&order=event_date.desc');
  },

  // Получить архивные мероприятия за месяц
  async getArchivedByMonth(year: number, month: number): Promise<Event[]> {
    const results = await apiClient.get<Event[]>('/past_events?select=*');
    
    return results.filter(event => {
      if (!event.event_date) return false;
      const eventDate = new Date(event.event_date);
      return eventDate.getFullYear() === year && eventDate.getMonth() + 1 === month;
    });
  },

  // Обновить мероприятие
  async update(id: number, event: Partial<Event>): Promise<Event> {
    const result = await apiClient.patch<Event[]>(`/future_events?id=eq.${id}`, event);
    return result[0];
  },

  // Завершить мероприятие
  async complete(id: number): Promise<void> {
    await apiClient.patch(`/future_events?id=eq.${id}`, { status: 'completed' });
  },

  // Удалить мероприятие
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/future_events?id=eq.${id}`);
  },
};
