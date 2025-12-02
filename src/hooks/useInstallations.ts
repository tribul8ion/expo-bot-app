// React Hook для работы с установками
import { useState, useEffect } from 'react';
import { installationsApi, Installation } from '../lib/api';
import { toast } from 'sonner';

export function useInstallations(zone?: string) {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstallations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = zone 
        ? await installationsApi.getByZone(zone)
        : await installationsApi.getAll();
      
      setInstallations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки установок';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstallations();
  }, [zone]);

  const createInstallation = async (data: Omit<Installation, 'id'>) => {
    try {
      const newInstallation = await installationsApi.create(data);
      setInstallations(prev => [newInstallation, ...prev]);
      toast.success('Установка создана');
      return newInstallation;
    } catch (err) {
      toast.error('Ошибка создания установки');
      throw err;
    }
  };

  const updateInstallation = async (id: number, data: Partial<Installation>) => {
    try {
      const updated = await installationsApi.update(id, data);
      setInstallations(prev => 
        prev.map(inst => inst.id === id ? updated : inst)
      );
      toast.success('Установка обновлена');
      return updated;
    } catch (err) {
      toast.error('Ошибка обновления установки');
      throw err;
    }
  };

  const completeInstallation = async (id: number) => {
    try {
      await installationsApi.complete(id);
      setInstallations(prev => prev.filter(inst => inst.id !== id));
      toast.success('Установка завершена');
    } catch (err) {
      toast.error('Ошибка завершения установки');
      throw err;
    }
  };

  return {
    installations,
    loading,
    error,
    refetch: fetchInstallations,
    createInstallation,
    updateInstallation,
    completeInstallation,
  };
}
