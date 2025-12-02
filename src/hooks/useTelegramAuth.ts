// React Hook для работы с Telegram WebApp
import { useEffect, useState } from 'react';

// Extend Window interface for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
        onEvent?: (event: string, handler: () => void) => void;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
            is_premium?: boolean;
          };
          [key: string]: any;
        };
      };
    };
  }
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
}

export function useTelegramAuth() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState<any>(null);
  const [isTelegram, setIsTelegram] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    // Функция для инициализации Telegram WebApp
    const initTelegramWebApp = () => {
      // Проверяем, что скрипт загружен и WebApp доступен
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        setIsTelegram(true);
        
        console.log('Telegram WebApp initialized:', {
          hasWebApp: true,
          initDataUnsafe: tg.initDataUnsafe,
          user: tg.initDataUnsafe?.user,
        });

        // Получаем данные пользователя из Telegram Web App
        const tgUser = tg.initDataUnsafe?.user;
        if (tgUser) {
          console.log('Telegram user found:', tgUser);
          
          // Получаем все доступные данные пользователя
          const userData: TelegramUser = {
            id: tgUser.id,
            first_name: tgUser.first_name || '',
            last_name: tgUser.last_name,
            username: tgUser.username,
            language_code: tgUser.language_code,
            photo_url: tgUser.photo_url, // URL фото профиля (если доступно)
            is_premium: tgUser.is_premium,
          };
          
          console.log('Setting user data:', userData);
          setUser(userData);
          
          // Если есть photo_url из initDataUnsafe, используем его (лучший вариант)
          if (userData.photo_url) {
            console.log('Using photo_url from initDataUnsafe:', userData.photo_url);
            setAvatarUrl(userData.photo_url);
          } else {
            // Пытаемся получить фото через Bot API
            console.log('photo_url not found in initDataUnsafe, fetching from Bot API...');
            fetchUserAvatar(tgUser.id);
          }
        } else {
          console.warn('Telegram user data not found in initDataUnsafe');
        }

        setInitData(tg.initDataUnsafe);
        
        // Слушаем обновления темы Telegram (если доступно)
        if (tg.onEvent) {
          tg.onEvent('themeChanged', () => {
            // Можно обновить тему приложения
          });
        }
        
        return true;
      }
      return false;
    };

    // Пробуем инициализировать сразу
    if (initTelegramWebApp()) {
      return;
    }

    // Если скрипт еще не загружен, ждем его загрузки
    const checkInterval = setInterval(() => {
      if (initTelegramWebApp()) {
        clearInterval(checkInterval);
      }
    }, 100);

    // Останавливаем проверку через 5 секунд
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
      if (!window.Telegram?.WebApp) {
        console.warn('Telegram WebApp script not loaded, using test user');
        setIsTelegram(false);
        setUser({
          id: 694377627,
          first_name: 'Тестовый',
          username: 'test_user',
        });
      }
    }, 5000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, []);

  // Функция для получения аватара пользователя через бота
  const fetchUserAvatar = async (userId: number) => {
    try {
      // Пробуем получить через Supabase API
      // Импортируем конфигурацию Supabase
      const { SUPABASE_URL, SUPABASE_KEY } = await import('../lib/api/config');
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_KEY;
      
      if (supabaseUrl && supabaseKey) {
        try {
          // Пробуем получить аватар из activity_log (если он там сохранен)
          // Это работает, если пользователь уже делал какие-то действия
          const response = await fetch(
            `${supabaseUrl}/rest/v1/activity_log?user_id=eq.${userId}&select=avatar_url&limit=1&order=created_at.desc`,
            {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0 && data[0].avatar_url) {
              console.log('Found avatar_url in activity_log:', data[0].avatar_url);
              setAvatarUrl(data[0].avatar_url);
              return;
            }
          }
        } catch (supabaseError) {
          console.log('Could not get avatar from Supabase:', supabaseError);
        }
      }
      
      // Если не удалось получить, пробуем Telegram CDN (может не работать из-за конфиденциальности)
      // Но это единственный способ получить аватар без backend запроса
      const telegramCdnUrl = `https://cdn.telegram.org/widget/photo?size=m&user_id=${userId}`;
      console.log('Trying Telegram CDN URL:', telegramCdnUrl);
      
      // Проверяем, доступен ли этот URL (не всегда работает)
      // Устанавливаем его, но AvatarImage сам попробует загрузить
      setAvatarUrl(telegramCdnUrl);
      
    } catch (error) {
      console.error('Error fetching user avatar:', error);
    }
  };

  return { user, initData, isTelegram, avatarUrl };
}
