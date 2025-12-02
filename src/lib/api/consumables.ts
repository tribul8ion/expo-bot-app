// Consumables API
import { apiClient } from './client';

export interface BrotherConsumable {
  id: number;
  name: string;
  quantity: number;
  min_quantity?: number;
  updated_at?: string;
  last_updated_by?: string;
}

export interface GodexConsumable {
  id: number;
  name: string;
  quantity: number;
  min_quantity?: number;
  updated_at?: string;
  last_updated_by?: string;
}

export interface ConsumableHistory {
  id: number;
  type: 'brother' | 'godex';
  name: string;
  quantity: number; // изменение количества
  user_id?: string;
  username?: string;
  created_at: string;
}

export const consumablesApi = {
  // Получить все расходники Brother
  async getBrother(): Promise<BrotherConsumable[]> {
    return apiClient.get<BrotherConsumable[]>('/brother_consumables?select=*&order=name.asc');
  },

  // Получить все расходники Godex
  async getGodex(): Promise<GodexConsumable[]> {
    return apiClient.get<GodexConsumable[]>('/godex_consumables?select=*&order=name.asc');
  },

  // Обновить количество расходника Brother
  async updateBrother(id: number, quantity: number, updatedBy?: string): Promise<BrotherConsumable> {
    const updateData: any = { quantity };
    if (updatedBy) {
      updateData.updated_at = new Date().toISOString();
      updateData.last_updated_by = updatedBy;
    }
    
    const result = await apiClient.patch<BrotherConsumable[]>(`/brother_consumables?id=eq.${id}`, updateData);
    return result[0];
  },

  // Обновить количество расходника Godex
  async updateGodex(id: number, quantity: number, updatedBy?: string): Promise<GodexConsumable> {
    const updateData: any = { quantity };
    if (updatedBy) {
      updateData.updated_at = new Date().toISOString();
      updateData.last_updated_by = updatedBy;
    }
    
    const result = await apiClient.patch<GodexConsumable[]>(`/godex_consumables?id=eq.${id}`, updateData);
    return result[0];
  },

  // Получить историю изменений расходников
  async getHistory(type?: 'brother' | 'godex'): Promise<ConsumableHistory[]> {
    const endpoint = type 
      ? `/consumables_history?type=eq.${type}&order=created_at.desc`
      : '/consumables_history?select=*&order=created_at.desc';
    
    return apiClient.get<ConsumableHistory[]>(endpoint);
  },
};
