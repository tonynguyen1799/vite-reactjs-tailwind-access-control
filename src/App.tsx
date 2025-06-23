import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';
import DashboardPage from './pages/DashboardPage';
import RequireAuth from './auth/RequireAuth';
import { useAuth } from './contexts/useAuth';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Nếu đã login → redirect khỏi trang login */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* Bọc layout bằng RequireAuth để kiểm tra token + user */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="roles" element={<RolesPage />} />
      </Route>
    </Routes>
  );
}

export default App;
