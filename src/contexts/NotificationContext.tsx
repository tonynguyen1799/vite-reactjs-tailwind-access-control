// src/contexts/NotificationContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface Notification {
	id: number;
	message: string;
	type: 'success' | 'error' | 'info';
}

interface NotificationContextType {
	notify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

let idCounter = 0;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
		const id = idCounter++;
		setNotifications((prev) => [...prev, { id, message, type }]);
		setTimeout(() => {
			setNotifications((prev) => prev.filter((n) => n.id !== id));
		}, 3000);
	};

	return (
		<NotificationContext.Provider value={{ notify }}>
			{children}
			<div className="fixed top-4 right-4 space-y-2 z-50">
				{notifications.map((n) => (
					<div
						key={n.id}
						className={`px-4 py-2 rounded shadow text-white
							${n.type === 'error' ? 'bg-red-500' : n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}
					>
						{n.message}
					</div>
				))}
			</div>
		</NotificationContext.Provider>
	);
};

export const useNotification = () => {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error('useNotification must be used within a NotificationProvider');
	}
	return context;
};
