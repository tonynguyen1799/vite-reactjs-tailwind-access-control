import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getMeApi } from '../apis/auth.api';
import { useAuth } from '../contexts/useAuth';
import type { UserDetailResponse } from '../apis/types';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);

  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    let isMounted = true;
    if (!token) {
      setLoading(false);
      return;
    }
    if (user) {
      setLoading(false);
      return; // Don't call getMeApi if user is already set
    }
    getMeApi()
      .then((res: { data: { data: UserDetailResponse } }) => {
        if (isMounted) setUser(res.data.data);
      })
      .catch(() => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [token, setUser, user]);    

  console.log('[RequireAuth] user:', user, 'token:', token, 'loading:', loading);

  if (loading) {
    return (
      <div className="h-screen flex flex-col justify-center items-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <div className="mt-4 text-gray-600">Loading your profile...</div>
      </div>
    );
  }
  
  if (!loading && (!token || !user)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
