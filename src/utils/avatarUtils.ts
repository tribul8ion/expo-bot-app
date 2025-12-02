/**
 * Утилиты для получения аватаров пользователей
 * Единая логика для всех компонентов
 */

import { SUPABASE_URL, SUPABASE_KEY } from '../lib/api/config';

/**
 * Получить аватар пользователя по приоритету:
 * 1. photo_url из initDataUnsafe (если доступен)
 * 2. avatar_url из БД (activity_log)
 * 3. Telegram CDN URL (может не работать из-за приватности)
 */
export async function getUserAvatarUrl(
  userId: string | number,
  photoUrl?: string | null
): Promise<string | null> {
  try {
    const userIdStr = String(userId);

    // 1. Приоритет: photo_url из initDataUnsafe (самый надежный)
    if (photoUrl) {
      console.log(`Using photo_url from initDataUnsafe for user ${userIdStr}:`, photoUrl);
      return photoUrl;
    }

    // 2. Пробуем получить из БД (activity_log) - последний avatar_url для этого пользователя
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/activity_log?user_id=eq.${userIdStr}&select=avatar_url&limit=1&order=created_at.desc`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0 && data[0].avatar_url) {
            const avatarUrl = data[0].avatar_url;
            console.log(`Found avatar_url in activity_log for user ${userIdStr}:`, avatarUrl);
            
            // Проверяем, что URL не устарел (не старше 2 часов)
            // Но для начала просто используем его
            return avatarUrl;
          }
        }
      } catch (supabaseError) {
        console.log('Could not get avatar from Supabase:', supabaseError);
      }
    }

    // 3. Fallback: Telegram CDN URL (может не работать из-за настроек приватности)
    // Но пробуем, так как это единственный способ без backend запроса
    const telegramCdnUrl = `https://cdn.telegram.org/widget/photo?size=m&user_id=${userIdStr}`;
    console.log(`Using Telegram CDN fallback for user ${userIdStr}:`, telegramCdnUrl);
    return telegramCdnUrl;

  } catch (error) {
    console.error(`Error getting avatar for user ${userId}:`, error);
    return null;
  }
}

/**
 * Проверить, доступен ли URL аватара (не устарел ли)
 */
export async function checkAvatarUrlAvailable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    // В no-cors режиме мы не можем проверить статус, но можем попробовать загрузить
    return true; // Полагаемся на AvatarImage компонент для проверки
  } catch (error) {
    return false;
  }
}
