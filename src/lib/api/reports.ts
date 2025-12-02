// Reports API
import { apiClient } from './client';

export interface MonthlyReport {
  month: number;
  year: number;
  events: any[];
  totalInstallations: number;
  brotherUsage: number;
  godexUsage: number;
}

export interface YearlyReport {
  year: number;
  totalEvents: number;
  totalInstallations: number;
  totalBrother: number;
  totalGodex: number;
  events: any[];
}

export const reportsApi = {
  // Генерация месячного отчета (на бэкенде)
  async generateMonthly(month: number, year: number): Promise<Blob> {
    // TODO: Эндпоинт для генерации PDF на бэкенде
    throw new Error('PDF generation not implemented yet');
  },

  // Генерация годового отчета (на бэкенде)
  async generateYearly(year: number): Promise<Blob> {
    // TODO: Эндпоинт для генерации PDF на бэкенде
    throw new Error('PDF generation not implemented yet');
  },

  // Получить данные для месячного отчета
  async getMonthlyData(month: number, year: number): Promise<MonthlyReport> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = month === 12 
      ? `${year + 1}-01-01` 
      : `${year}-${(month + 1).toString().padStart(2, '0')}-01`;

    const [events, installations] = await Promise.all([
      apiClient.get<any[]>('/past_events?select=*'),
      apiClient.get<any[]>('/past_laptop_installations?select=*'),
    ]);

    const monthEvents = events.filter(event => {
      if (!event.event_date) return false;
      const eventDate = new Date(event.event_date);
      return eventDate.getFullYear() === year && eventDate.getMonth() + 1 === month;
    });

    const brotherUsage = installations.filter(i => i.printer_type === 'brother').length;
    const godexUsage = installations.filter(i => i.printer_type === 'godex').length;

    return {
      month,
      year,
      events: monthEvents,
      totalInstallations: installations.length,
      brotherUsage,
      godexUsage,
    };
  },

  // Получить данные для годового отчета
  async getYearlyData(year: number): Promise<YearlyReport> {
    const [events, installations] = await Promise.all([
      apiClient.get<any[]>('/past_events?select=*'),
      apiClient.get<any[]>('/past_laptop_installations?select=*'),
    ]);

    const yearEvents = events.filter(event => {
      if (!event.event_date) return false;
      const eventDate = new Date(event.event_date);
      return eventDate.getFullYear() === year;
    });

    const totalBrother = yearEvents.reduce((sum, e) => sum + (e.brother_count || 0), 0);
    const totalGodex = yearEvents.reduce((sum, e) => sum + (e.godex_count || 0), 0);

    return {
      year,
      totalEvents: yearEvents.length,
      totalInstallations: installations.length,
      totalBrother,
      totalGodex,
      events: yearEvents,
    };
  },
};
