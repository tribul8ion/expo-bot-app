// React Hook для работы с активностью
import { useState, useEffect, useCallback } from 'react';
import { activityApi, ActivityDisplay } from '../lib/api';
import { getUserAvatarUrl } from '../utils/avatarUtils';
import { useTelegramAuth } from './useTelegramAuth';

export function useActivity(limit: number = 10) {
  const [activities, setActivities] = useState<ActivityDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useTelegramAuth(); // Получаем текущего пользователя для использования его photo_url

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await activityApi.getRecent(limit);
      
      // Обогащаем активности аватарами - используем единую логику получения
      const enrichedData = await Promise.all(
        data.map(async (activity) => {
          // Если уже есть avatar_url, проверяем его актуальность
          if (activity.avatar_url) {
            // Проверяем, не устарел ли URL (Telegram URLs действуют ~1 час)
            // Если URL содержит api.telegram.org и старше 1 часа - обновляем
            const urlAge = activity.created_at 
              ? Date.now() - new Date(activity.created_at).getTime()
              : Infinity;
            
            const isOldTelegramUrl = activity.avatar_url.includes('api.telegram.org') && urlAge > 3600000; // 1 час
            
            if (!isOldTelegramUrl) {
              // URL актуальный, используем его
              return activity;
            }
          }

          // Если нет avatar_url или он устарел, получаем новый
          if (activity.user_id) {
            try {
              // Если это текущий пользователь, используем его photo_url из initDataUnsafe
              const photoUrl = (activity.user_id === String(user?.id) && user?.photo_url) 
                ? user.photo_url 
                : null;
              
              const avatarUrl = await getUserAvatarUrl(activity.user_id, photoUrl);
              if (avatarUrl) {
                console.log(`Got avatar for user ${activity.user_id}:`, avatarUrl);
                return {
                  ...activity,
                  avatar_url: avatarUrl,
                };
              }
            } catch (error) {
              console.warn(`Failed to get avatar for user ${activity.user_id}:`, error);
            }
          }

          // Если все еще нет аватара, пробуем Telegram CDN как последний fallback
          if (activity.user_id && !activity.avatar_url) {
            const telegramCdnUrl = `https://cdn.telegram.org/widget/photo?size=m&user_id=${activity.user_id}`;
            return {
              ...activity,
              avatar_url: telegramCdnUrl,
            };
          }

          return activity;
        })
      );
      
      setActivities(enrichedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки активности';
      setError(errorMessage);
      console.error('Activity fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [limit, user]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities,
  };
}
