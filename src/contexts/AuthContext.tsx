// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

type AuthContextType = {
	isAuthenticated: boolean;
	user: { username: string } | null;
	login: (username: string, password: string) => boolean;
	logout: () => void;
	error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(() => {
		return Boolean(localStorage.getItem('token'));
	});
	const [user, setUser] = useState<{ username: string } | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token && token !== 'undefined') {
			setIsAuthenticated(true);
			setUser({ username: 'admin' });
		} else {
			setIsAuthenticated(false);
			setUser(null);
		}

		return () => {
			// Cleanup logic if needed in future (e.g., clear timers, listeners)
		};
	}, []);

	const login = (username: string, password: string) => {
		if (username === 'admin' && password === 'admin123') {
			localStorage.setItem('token', 'mock-token');
			setIsAuthenticated(true);
			setUser({ username });
			setError(null);
			return true;
		} else {
			setError('Invalid credentials. Please try again.');
			return false;
		}
	};

	const logout = () => {
		localStorage.removeItem('token');
		setIsAuthenticated(false);
		setUser(null);
		setError(null);
	};

	return (
		<AuthContext.Provider value={{ isAuthenticated, user, login, logout, error }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error('useAuth must be used within an AuthProvider');
	return context;
};
