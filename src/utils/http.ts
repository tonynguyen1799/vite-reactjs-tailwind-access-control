import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { refreshTokenIfNeeded } from './refresh';
// Notification helper for outside React components
let notifySessionExpired: (() => void) | null = null;
export const setNotifySessionExpired = (fn: () => void) => {
  notifySessionExpired = fn;
};

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // 🔐 Retry logic for expired token (skip if flagged explicitly)
    if (status === 401 && !originalRequest._retry && !originalRequest.skipAuthRefresh) {
      originalRequest._retry = true;

      try {
        const refreshed = await refreshTokenIfNeeded();
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        if (refreshed && token) {
          http.defaults.headers.common.Authorization = `Bearer ${token}`;
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return http(originalRequest);
        }
      } catch (refreshError) {
        console.error('[http] Refresh token failed', refreshError);
        // Inline logout logic
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('refreshToken');
        if (notifySessionExpired) notifySessionExpired();
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default http;

export interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  skipAuthRefresh?: boolean;
  _retry?: boolean;
}
