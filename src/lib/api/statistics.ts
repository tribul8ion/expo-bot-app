// Statistics and Analytics API
import { apiClient } from './client';

export interface RackUsage {
  rack: string;
  total_uses: number;
  unique_laptops: number;
  printer_types: {
    godex: number;
    brother: number;
  };
}

export interface EquipmentStats {
  laptops: Record<string, {
    total_uses: number;
    racks_used: string[];
    last_used?: string;
  }>;
  printers: {
    godex: { total: number; unique_devices: number };
    brother: { total: number; unique_devices: number };
  };
}

export interface HeatmapData {
  rack_usage: Record<string, RackUsage>;
  equipment_stats: EquipmentStats;
}

export const statisticsApi = {
  // Получить тепловую карту использования стоек
  async getHeatmapData(startDate: string, endDate: string): Promise<HeatmapData> {
    // Получаем все установки за период
    const installations = await apiClient.get<any[]>(
      `/laptop_installations?select=*&created_at=gte.${startDate}&created_at=lt.${endDate}`
    );

    // Анализируем данные
    const rackUsage: Record<string, RackUsage> = {};
    const equipmentStats: EquipmentStats = {
      laptops: {},
      printers: { godex: { total: 0, unique_devices: 0 }, brother: { total: 0, unique_devices: 0 } },
    };

    const uniquePrinters = { godex: new Set(), brother: new Set() };

    installations.forEach(inst => {
      // Анализ стоек
      if (inst.rack) {
        if (!rackUsage[inst.rack]) {
          rackUsage[inst.rack] = {
            rack: inst.rack,
            total_uses: 0,
            unique_laptops: 0,
            printer_types: { godex: 0, brother: 0 },
          };
        }
        rackUsage[inst.rack].total_uses++;
        if (inst.laptop) {
          rackUsage[inst.rack].unique_laptops++;
        }
        if (inst.printer_type) {
          rackUsage[inst.rack].printer_types[inst.printer_type]++;
        }
      }

      // Анализ оборудования
      if (inst.laptop) {
        if (!equipmentStats.laptops[inst.laptop]) {
          equipmentStats.laptops[inst.laptop] = { total_uses: 0, racks_used: [] };
        }
        equipmentStats.laptops[inst.laptop].total_uses++;
        if (!equipmentStats.laptops[inst.laptop].racks_used.includes(inst.rack)) {
          equipmentStats.laptops[inst.laptop].racks_used.push(inst.rack);
        }
      }

      if (inst.printer_type && inst.printer_number) {
        equipmentStats.printers[inst.printer_type].total++;
        uniquePrinters[inst.printer_type].add(inst.printer_number);
      }
    });

    // Подсчитываем уникальные устройства
    equipmentStats.printers.godex.unique_devices = uniquePrinters.godex.size;
    equipmentStats.printers.brother.unique_devices = uniquePrinters.brother.size;

    return { rack_usage: rackUsage, equipment_stats: equipmentStats };
  },

  // Получить общую статистику
  async getOverview(): Promise<{
    totalInstallations: number;
    activeRacks: number;
    equipmentInUse: number;
    consumablesLow: number;
  }> {
    const [installations, racks, consumables] = await Promise.all([
      apiClient.get<any[]>('/laptop_installations?select=*'),
      apiClient.get<any[]>('/laptop_installations?select=rack&distinct=on'),
      Promise.all([
        apiClient.get<any[]>('/brother_consumables?select=*'),
        apiClient.get<any[]>('/godex_consumables?select=*'),
      ]),
    ]);

    const allConsumables = [...consumables[0], ...consumables[1]];
    const lowConsumables = allConsumables.filter(
      (c: any) => c.min_quantity && c.quantity <= c.min_quantity
    );

    return {
      totalInstallations: installations.length,
      activeRacks: racks.length,
      equipmentInUse: installations.length,
      consumablesLow: lowConsumables.length,
    };
  },
};
