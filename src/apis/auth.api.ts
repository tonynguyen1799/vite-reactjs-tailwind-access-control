import http from '../utils/http';
import type {
	LoginRequest,
	JsonResponseAuthTokens
  } from './types';

export const loginApi = (data: LoginRequest) => {
	return http.post<JsonResponseAuthTokens>('/api/auth/signin', data, { skipAuthRefresh: true });
};

export const getMeApi = () => {
  return http.get('/api/auth/me');
};

export const changePasswordApi = (data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  return http.post('/api/auth/change-password', data);
};

export const refreshTokenApi = (refreshToken: string) => {
  return http.post('/api/auth/refresh', { refreshToken });
};
