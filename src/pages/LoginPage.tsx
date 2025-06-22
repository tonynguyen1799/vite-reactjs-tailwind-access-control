import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiUser } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export default function LoginPage() {
	const [username, setUsername] = useState('admin'); // Pre-filled for convenience
	const [password, setPassword] = useState('admin123'); // Pre-filled for convenience
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();
	const { notify } = useNotification();

	const handleLogin = async () => {
		setIsLoading(true);
		try {
			const success = await login(username, password);
			if (success) {
				navigate('/users');
			} else {
				notify('Login failed: Invalid credentials or server error', 'error');
			}
		} catch (error) {
			console.error(error);
			notify('An unexpected error occurred.', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
			<div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm animate-fade-in-up">
				<h1 className="text-2xl font-semibold text-center text-blue-800 mb-6">Sign in to Admin</h1>
				<div className="mb-4 transition duration-300 ease-in-out">
					<label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
					<div className="flex items-center border rounded px-3 py-2 hover:shadow-sm focus-within:ring-2 focus-within:ring-blue-200">
						<FiUser className="text-gray-400 mr-2" />
						<input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="Enter username"
							className="w-full outline-none text-sm"
						/>
					</div>
				</div>
				<div className="mb-6 transition duration-300 ease-in-out">
					<label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
					<div className="flex items-center border rounded px-3 py-2 hover:shadow-sm focus-within:ring-2 focus-within:ring-blue-200">
						<FiLock className="text-gray-400 mr-2" />
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter password"
							className="w-full outline-none text-sm"
						/>
					</div>
				</div>
				<button
					onClick={handleLogin}
					disabled={isLoading}
					className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition duration-300 transform hover:-translate-y-0.5 disabled:bg-blue-400 disabled:cursor-not-allowed"
				>
					{isLoading ? 'Signing In...' : 'Sign In'}
				</button>
			</div>
		</div>
	);
}