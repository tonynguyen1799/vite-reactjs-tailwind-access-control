import { createContext, useEffect, useState } from 'react';
import { loginApi, getMeApi } from '../apis/auth.api';
import type { LoginRequest, UserDetailResponse } from '../apis/types';

interface AuthContextType {
  token: string | null;
  user: UserDetailResponse | null;
  setUser: (user: UserDetailResponse | null) => void;
  login: (username: string, password: string, rememberMe: boolean) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserDetailResponse | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);

      // ✅ Gọi lại API /me sau F5
      getMeApi()
        .then((res) => {
          setUser(res.data.data);
        })
        .catch(() => {
          // Token sai → xóa và logout
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setToken(null);
          setUser(null);
        });
    }
  }, []);

  const login = async (username: string, password: string, rememberMe: boolean) => {
    try {
      const payload: LoginRequest = { username, password, rememberMe };
      const response = await loginApi(payload);
      const { token, refreshToken } = response.data?.data || {};

      if (token && refreshToken) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', token);
        storage.setItem('refreshToken', refreshToken);
        setToken(token);

        const getMeResponse = await getMeApi();
        setUser(getMeResponse.data.data);
        console.log('[AuthContext] User set in context after login:', getMeResponse.data.data);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
