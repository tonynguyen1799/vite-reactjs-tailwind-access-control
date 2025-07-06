import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GlobalToaster } from './components/GlobalToaster';
import { ThemeProvider } from './contexts/ThemeContext'; // <-- Import ThemeProvider

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<ThemeProvider defaultTheme="theme-zinc" storageKey="vite-ui-theme">
					<App />
					<GlobalToaster />
				</ThemeProvider>
			</AuthProvider>
		</BrowserRouter>
	</React.StrictMode>
);