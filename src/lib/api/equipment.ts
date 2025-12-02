// Equipment API
import { apiClient } from './client';

export interface Laptop {
  id: number;
  name?: string;
  serial_number?: string;
  mac_address?: string;
  model?: string;
  specification?: string;
  status?: string;
}

export interface BrotherPrinter {
  id: number;
  name?: string;
  model?: string;
  mac_address?: string;
  ip_address?: string;
  serial_number?: string;
  status?: string;
}

export interface GodexPrinter {
  id: number;
  name?: string;
  model?: string;
  mac_address?: string;
  ip_address?: string;
  serial_number?: string;
  status?: string;
}

export const equipmentApi = {
  // Ноутбуки
  async getLaptops(): Promise<Laptop[]> {
    return apiClient.get<Laptop[]>('/laptops?select=*&order=id.asc');
  },

  async getLaptop(id: number): Promise<Laptop> {
    const results = await apiClient.get<Laptop[]>(`/laptops?select=*&id=eq.${id}`);
    return results[0];
  },

  // Принтеры Brother
  async getBrotherPrinters(): Promise<BrotherPrinter[]> {
    return apiClient.get<BrotherPrinter[]>('/brother_printers?select=*&order=id.asc');
  },

  async getBrotherPrinter(id: number): Promise<BrotherPrinter> {
    const results = await apiClient.get<BrotherPrinter[]>(`/brother_printers?select=*&id=eq.${id}`);
    return results[0];
  },

  // Принтеры Godex
  async getGodexPrinters(): Promise<GodexPrinter[]> {
    return apiClient.get<GodexPrinter[]>('/godex_printers?select=*&order=id.asc');
  },

  async getGodexPrinter(id: number): Promise<GodexPrinter> {
    const results = await apiClient.get<GodexPrinter[]>(`/godex_printers?select=*&id=eq.${id}`);
    return results[0];
  },
};
