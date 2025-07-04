import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import RequireAuth from '../auth/RequireAuth';

const DashboardLayout = lazy(() => import('../layouts/DashboardLayout'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const UsersPage = lazy(() => import('../pages/users/UsersPage'));
const RolesPage = lazy(() => import('../pages/roles/RolesPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const RequirePrivilege = lazy(() => import('../auth/RequirePrivilege'));
const ForbiddenPage = lazy(() => import('../pages/ForbiddenPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));

const LoadingFallback = () => (
  <div className="h-screen w-screen flex justify-center items-center">
    <div>Loading...</div>
  </div>
);

export const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/forbidden"
          element={
            <RequireAuth>
              <ForbiddenPage />
            </RequireAuth>
          }
        />

        <Route
          path="/"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route element={<RequirePrivilege allowedPrivileges={['USER_MANAGEMENT_READ']} />}>
            <Route path="users" element={<UsersPage />} />
          </Route>

          <Route element={<RequirePrivilege allowedPrivileges={['ROLE_MANAGEMENT_READ']} />}>
            <Route path="roles" element={<RolesPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};