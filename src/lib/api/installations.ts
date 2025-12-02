// Installations API
import { apiClient } from './client';

export interface Installation {
  id?: number;
  event_id?: number;
  rack: string;
  laptop: number | string;
  printer_type?: 'brother' | 'godex';
  printer_number?: number;
  second_printer_type?: 'brother' | 'godex';
  second_printer_number?: number;
  user_id?: string;
  username?: string;
  date: string;
  status?: 'active' | 'completed' | 'pending';
}

export const installationsApi = {
  // Получить все установки
  async getAll(): Promise<Installation[]> {
    return apiClient.get<Installation[]>('/laptop_installations?select=*&order=date.desc');
  },

  // Получить установки по зоне
  async getByZone(zone: string): Promise<Installation[]> {
    return apiClient.get<Installation[]>(`/laptop_installations?select=*&rack=like.${zone}*&order=rack.asc`);
  },

  // Получить установку по номеру стойки
  async getByRack(rack: string): Promise<Installation | null> {
    const results = await apiClient.get<Installation[]>(`/laptop_installations?select=*&rack=eq.${rack}&order=date.desc&limit=1`);
    return results[0] || null;
  },

  // Создать новую установку
  async create(installation: Omit<Installation, 'id'>): Promise<Installation> {
    const result = await apiClient.post<Installation[]>('/laptop_installations', installation);
    return result[0];
  },

  // Обновить установку
  async update(id: number, installation: Partial<Installation>): Promise<Installation> {
    const result = await apiClient.patch<Installation[]>(`/laptop_installations?id=eq.${id}`, installation);
    return result[0];
  },

  // Завершить установку (переместить в архив)
  async complete(id: number): Promise<void> {
    await apiClient.delete(`/laptop_installations?id=eq.${id}`);
  },

  // Получить историю установок ноутбука
  async getLaptopHistory(laptopId: number): Promise<Installation[]> {
    return apiClient.get<Installation[]>(`/laptop_installations?select=*&laptop=eq.${laptopId}&order=date.desc`);
  },

  // Получить архивированные установки
  async getArchived(): Promise<Installation[]> {
    return apiClient.get<Installation[]>('/past_laptop_installations?select=*&order=date.desc');
  },
};
