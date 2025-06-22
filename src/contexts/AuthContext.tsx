import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginApi, getMeApi } from '../apis/auth.api';

// A more detailed user type based on your APIs.yaml
type User = {
	textId: string;
	username: string;
	email: string;
	enabled: boolean;
	roles: string[];
};

type AuthContextType = {
	isAuthenticated: boolean;
	user: User | null;
	login: (username: string, password: string) => Promise<boolean>;
	logout: () => void;
	loading: boolean; // To handle loading state
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true); // Start with loading true to check for existing session

	useEffect(() => {
		const checkUserSession = async () => {
			const token = localStorage.getItem('token');
			if (token && token !== 'undefined') {
				try {
					const response = await getMeApi();
					setUser(response.data.data);
					setIsAuthenticated(true);
				} catch (error) {
					console.error('Session check failed', error);
					// Token is invalid, so log out
					localStorage.removeItem('token');
					localStorage.removeItem('refreshToken');
				}
			}
			setLoading(false);
		};

		checkUserSession();
	}, []);

	const login = async (username: string, password: string) => {
		try {
			const response = await loginApi({ username, password });
			const { token, refreshToken } = response.data.data;

			localStorage.setItem('token', token);
			localStorage.setItem('refreshToken', refreshToken);

			// Fetch user info after login
			const meResponse = await getMeApi();
			setUser(meResponse.data.data);
			setIsAuthenticated(true);
			return true;
		} catch (error) {
			console.error('Login failed:', error);
			// Clear any partial login artifacts
			localStorage.removeItem('token');
			localStorage.removeItem('refreshToken');
			setIsAuthenticated(false);
			setUser(null);
			return false;
		}
	};

	const logout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('refreshToken');
		setIsAuthenticated(false);
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error('useAuth must be used within an AuthProvider');
	return context;
};