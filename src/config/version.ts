// Версия приложения
// Автоматически обновляется при сборке
export const APP_VERSION = '2.0.0';
export const BUILD_DATE = (import.meta as any).env?.VITE_BUILD_DATE || new Date().toISOString().split('T')[0];
export const BUILD_NUMBER = (import.meta as any).env?.VITE_BUILD_NUMBER || '1';
