// React Hook для работы с мероприятиями
import { useState, useEffect } from 'react';
import { eventsApi, Event } from '../lib/api';
import { toast } from 'sonner';

export function useEvents(month?: number, year?: number) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: Event[];
      
      if (month && year) {
        data = await eventsApi.getByMonth(year, month);
      } else {
        data = await eventsApi.getAll();
      }
      
      // Автоматически завершаем прошедшие мероприятия
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (const event of data) {
        if (event.id && event.end_date) {
          const endDate = new Date(event.end_date);
          endDate.setHours(0, 0, 0, 0);
          
          // Если дата окончания в прошлом и мероприятие ещё не завершено
          if (endDate < today && event.status !== 'completed') {
            try {
              await eventsApi.complete(event.id);
              // Обновляем локальное состояние
              setEvents(prev => prev.map(e => 
                e.id === event.id ? { ...e, status: 'completed' as const } : e
              ));
            } catch (err) {
              console.error('Error auto-completing event:', err);
            }
          }
        }
      }
      
      setEvents(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки мероприятий';
      setError(errorMessage);
      console.error('Events fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [month, year]);

  const createEvent = async (data: Omit<Event, 'id'>) => {
    try {
      const newEvent = await eventsApi.create(data);
      setEvents(prev => [newEvent, ...prev]); // Добавляем в начало списка
      return newEvent;
    } catch (err) {
      throw err;
    }
  };

  const updateEvent = async (id: number, data: Partial<Event>) => {
    try {
      const updated = await eventsApi.update(id, data);
      setEvents(prev => prev.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const completeEvent = async (id: number) => {
    try {
      await eventsApi.complete(id);
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'completed' as const } : e));
      toast.success('Мероприятие завершено');
    } catch (err) {
      toast.error('Ошибка завершения мероприятия');
      throw err;
    }
  };

  const deleteEvent = async (id: number) => {
    try {
      await eventsApi.delete(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Мероприятие удалено');
    } catch (err) {
      toast.error('Ошибка удаления мероприятия');
      throw err;
    }
  };

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    createEvent,
    updateEvent,
    completeEvent,
    deleteEvent,
  };
}
