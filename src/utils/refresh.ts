import { refreshTokenApi } from '../apis/auth.api';

export const refreshTokenIfNeeded = async (): Promise<boolean> => {
  const refreshToken =
    localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

  if (!refreshToken) return false;

  try {
    // Corrected the call to pass an object
    const response = await refreshTokenApi({ refreshToken });
    const newToken = response?.data?.data?.token;

    if (newToken) {
      const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
      storage.setItem('token', newToken);
      return true;
    }

    return false;
  } catch (err) {
    console.error('❌ Refresh token failed:', err);
    return false;
  }
};