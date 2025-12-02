// React Hook для работы с расходниками
import { useState, useEffect } from 'react';
import { consumablesApi, BrotherConsumable, GodexConsumable } from '../lib/api';
import { toast } from 'sonner';

export function useConsumables() {
  const [brotherConsumables, setBrotherConsumables] = useState<BrotherConsumable[]>([]);
  const [godexConsumables, setGodexConsumables] = useState<GodexConsumable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConsumables = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [brotherData, godexData] = await Promise.all([
        consumablesApi.getBrother(),
        consumablesApi.getGodex(),
      ]);
      
      setBrotherConsumables(brotherData);
      setGodexConsumables(godexData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки расходников';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumables();
  }, []);

  const updateBrother = async (id: number, quantity: number, username?: string) => {
    try {
      const updated = await consumablesApi.updateBrother(id, quantity, username);
      setBrotherConsumables(prev => 
        prev.map(c => c.id === id ? updated : c)
      );
      toast.success('Количество обновлено');
      return updated;
    } catch (err) {
      toast.error('Ошибка обновления');
      throw err;
    }
  };

  const updateGodex = async (id: number, quantity: number, username?: string) => {
    try {
      const updated = await consumablesApi.updateGodex(id, quantity, username);
      setGodexConsumables(prev => 
        prev.map(c => c.id === id ? updated : c)
      );
      toast.success('Количество обновлено');
      return updated;
    } catch (err) {
      toast.error('Ошибка обновления');
      throw err;
    }
  };

  return {
    brotherConsumables,
    godexConsumables,
    loading,
    error,
    refetch: fetchConsumables,
    updateBrother,
    updateGodex,
  };
}
