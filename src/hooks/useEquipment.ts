// React Hook для работы с оборудованием
import { useState, useEffect } from 'react';
import { equipmentApi, Laptop, BrotherPrinter, GodexPrinter } from '../lib/api';

export function useEquipment() {
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [brotherPrinters, setBrotherPrinters] = useState<BrotherPrinter[]>([]);
  const [godexPrinters, setGodexPrinters] = useState<GodexPrinter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [laptopsData, brotherData, godexData] = await Promise.all([
        equipmentApi.getLaptops(),
        equipmentApi.getBrotherPrinters(),
        equipmentApi.getGodexPrinters(),
      ]);
      
      setLaptops(laptopsData);
      setBrotherPrinters(brotherData);
      setGodexPrinters(godexData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки оборудования';
      setError(errorMessage);
      console.error('Equipment fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  return {
    laptops,
    brotherPrinters,
    godexPrinters,
    loading,
    error,
    refetch: fetchEquipment,
  };
}
