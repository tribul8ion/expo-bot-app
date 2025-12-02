import { SUPABASE_URL, SUPABASE_KEY } from './config';

export interface FrontendAnalyticsEvent {
  event_type: 'webapp_open' | 'webapp_action' | 'webapp_navigation' | 'webapp_error';
  user_id?: number;
  username?: string;
  command_name?: string;
  metadata?: Record<string, any>;
  response_time_ms?: number;
  success?: boolean;
  error_message?: string;
}

/**
 * API клиент для логирования аналитики из фронтенда
 */
export const frontendAnalyticsApi = {
  /**
   * Логирует событие в bot_analytics через Supabase REST API
   */
  async logEvent(event: FrontendAnalyticsEvent): Promise<void> {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/bot_analytics`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          ...event,
          success: event.success !== undefined ? event.success : true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to log analytics event: ${response.statusText}`);
      }
    } catch (error) {
      // Не блокируем работу приложения при ошибках логирования
      console.error('Error logging analytics event:', error);
    }
  },

  /**
   * Логирует открытие Web App
   */
  async logWebAppOpen(userId?: number, username?: string): Promise<void> {
    await this.logEvent({
      event_type: 'webapp_open',
      user_id: userId,
      username: username,
    });
  },

  /**
   * Логирует действие пользователя во фронтенде
   */
  async logAction(
    actionName: string,
    metadata?: Record<string, any>,
    userId?: number,
    username?: string,
    responseTime?: number
  ): Promise<void> {
    await this.logEvent({
      event_type: 'webapp_action',
      user_id: userId,
      username: username,
      command_name: actionName,
      metadata: metadata,
      response_time_ms: responseTime,
      success: true,
    });
  },

  /**
   * Логирует навигацию по страницам
   */
  async logNavigation(
    page: string,
    userId?: number,
    username?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      event_type: 'webapp_navigation',
      user_id: userId,
      username: username,
      command_name: `page_${page}`,
      metadata: {
        page,
        ...metadata,
      },
      success: true,
    });
  },

  /**
   * Логирует ошибку во фронтенде
   */
  async logError(
    errorType: string,
    errorMessage: string,
    userId?: number,
    username?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      event_type: 'webapp_error',
      user_id: userId,
      username: username,
      command_name: errorType,
      metadata: metadata,
      success: false,
      error_message: errorMessage,
    });
  },
};
