// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';
import { useAuth } from './contexts/AuthContext';

function App() {
	const { isAuthenticated } = useAuth();

	return (
		<Routes>
			<Route
				path="/login"
				element={
					isAuthenticated ? <Navigate to="/users" replace /> : <LoginPage />
				}
			/>
			<Route
				path="/"
				element={
					isAuthenticated ? (
						<DashboardLayout />
					) : (
						<Navigate to="/login" replace />
					)
				}
			>
				<Route path="users" element={<UsersPage />} />
				<Route path="roles" element={<RolesPage />} />
			</Route>
		</Routes>
	);
}

export default App;
