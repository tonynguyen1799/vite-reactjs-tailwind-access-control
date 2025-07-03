import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';
import DashboardPage from './pages/DashboardPage';
import RequireAuth from './auth/RequireAuth';
import { useAuth } from './contexts/useAuth';
import RequirePrivilege from './auth/RequirePrivilege'; // Renamed import
import ForbiddenPage from './pages/ForbiddenPage';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Standalone pages */}
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

      {/* Main application layout */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />

        {/* Protect the Users page with the correct privilege */}
        <Route element={<RequirePrivilege allowedPrivileges={['USER_MANAGEMENT_READ']} />}>
          <Route path="users" element={<UsersPage />} />
        </Route>

        {/* Protect the Roles page with the correct privilege */}
        <Route element={<RequirePrivilege allowedPrivileges={['ROLE_MANAGEMENT_READ']} />}>
          <Route path="roles" element={<RolesPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
