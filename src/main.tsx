// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { setNotifySessionExpired } from './utils/http';

function NotificationSetup() {
	const { notify } = useNotification();
	React.useEffect(() => {
		setNotifySessionExpired(() => () => notify('Session expired, please log in again.', 'error'));
	}, [notify]);
	return null;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<NotificationProvider>
					<NotificationSetup />
					<App />
				</NotificationProvider>
			</AuthProvider>
		</BrowserRouter>
	</React.StrictMode>
);
