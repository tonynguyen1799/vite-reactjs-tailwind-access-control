// src/utils/http.ts
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { refreshTokenIfNeeded } from './refresh';
import { globalNotify } from '@/lib/notify';

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
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('refreshToken');
        
        globalNotify({
          variant: "destructive",
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
        });

        setTimeout(() => {
          window.location.href = '/';
        }, 100);
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