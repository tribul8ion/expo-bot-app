// API Client для работы с Supabase
import { SUPABASE_URL, SUPABASE_KEY } from './config';

const API_BASE = `${SUPABASE_URL}/rest/v1`;

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

interface ApiResponse<T> {
  data: T;
  error?: string;
}

class ApiClient {
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    try {
      let url = API_BASE + endpoint;
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          searchParams.append(key, value);
        });
        url += '?' + searchParams.toString();
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    try {
      const response = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  }

  async patch<T>(endpoint: string, body: any): Promise<T> {
    try {
      const response = await fetch(API_BASE + endpoint, {
        method: 'PATCH',
        headers: { ...headers, Prefer: 'return=representation' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`PATCH ${endpoint} failed:`, error);
      throw error;
    }
  }

  async delete(endpoint: string): Promise<void> {
    try {
      const response = await fetch(API_BASE + endpoint, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
