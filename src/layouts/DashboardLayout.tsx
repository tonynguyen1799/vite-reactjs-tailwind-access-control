// src/layouts/DashboardLayout.tsx
import { useEffect, useState, Fragment } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { FiUsers, FiShield, FiChevronDown, FiMenu } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useMediaQuery } from 'react-responsive';

const navLinks = [
	{ to: '/users', label: 'Users', icon: <FiUsers /> },
	{ to: '/roles', label: 'Roles', icon: <FiShield /> },
];

export default function DashboardLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const { logout } = useAuth();

	const isDesktop = useMediaQuery({ minWidth: 1024 });
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	useEffect(() => {
		if (!isDesktop) setSidebarCollapsed(false);
	}, [isDesktop]);

	useEffect(() => {
		setSidebarOpen(false);
		document.body.classList.remove('overflow-hidden');
	}, [location.pathname]);

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	return (
		<div className="flex h-screen bg-gray-100 overflow-hidden">
			{/* Mobile overlay */}
			<div
				className={`fixed inset-0 z-40 bg-black bg-opacity-30 lg:hidden transition-opacity ${
					sidebarOpen ? 'opacity-100 visible backdrop-blur-sm' : 'opacity-0 invisible'
				}`}
				onClick={() => {
					const sidebar = document.querySelector('aside');
					if (sidebar) {
						sidebar.classList.remove('animate-slideIn');
						sidebar.classList.add('animate-slideOut');
					}
					setTimeout(() => {
						document.body.classList.remove('overflow-hidden');
						setSidebarOpen(false);
					}, 150);
				}}
			/>

			{/* Sidebar */}
			<aside
				className={`fixed md:relative z-50 ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'} w-64 bg-white flex flex-col p-4 h-full md:h-screen inset-y-0 transform transition-transform duration-300 ease-in-out ${
					sidebarOpen ? 'translate-x-0' : '-translate-x-full'
				} md:translate-x-0`}
			>
				<div className="flex flex-col items-center justify-center mb-6">
					{/* Logo placeholder */}
				</div>

				<nav className="flex-1 space-y-2 relative">
					{navLinks.map((link) => (
						<div key={link.to} className="relative group">
							<Link
								to={link.to}
								title={sidebarCollapsed ? link.label : ''}
								className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out hover:bg-gray-100 hover:text-blue-600 ${
									location.pathname === link.to
										? 'bg-blue-100 text-blue-700'
										: 'text-gray-700'
								}`}
							>
								<span>{link.icon}</span>
								{!sidebarCollapsed && <span>{link.label}</span>}
							</Link>
							{sidebarCollapsed && (
								<span className="absolute top-1/2 left-full ml-2 px-2 py-1 rounded bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transform -translate-y-1/2 transition-opacity">
									{link.label}
								</span>
							)}
						</div>
					))}

					{isDesktop && (
						<div className="absolute bottom-4 left-0 w-full text-center">
							<button
								onClick={() => setSidebarCollapsed((prev) => !prev)}
								className="inline-flex items-center justify-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-all"
							>
								<span className="text-lg">{sidebarCollapsed ? '→' : '←'}</span>
								{!sidebarCollapsed && <span>Collapse</span>}
							</button>
						</div>
					)}
				</nav>
			</aside>

			{/* Main content */}
			<div className="flex-1 flex flex-col">
				<header className="h-16 px-4 md:px-6 bg-white border-b flex items-center justify-between">
					<div className="flex items-center gap-4">
						<button
							onClick={() => {
								const sidebar = document.querySelector('aside');
								if (sidebar) {
									sidebar.classList.remove('animate-slideOut');
									sidebar.classList.add('animate-slideIn');
								}
								document.body.classList.add('overflow-hidden');
								setSidebarOpen(true);
							}}
							className="md:hidden text-gray-600 p-1"
							aria-label="Toggle sidebar"
						>
							<FiMenu className="w-4 h-4" />
						</button>
					</div>
					<Menu as="div" className="relative inline-block text-left">
						<Menu.Button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-100 rounded-md hover:bg-gray-200">
							<img src="/avatar.png" alt="User avatar" className="w-6 h-6 rounded-full" />
							Admin <FiChevronDown className="w-4 h-4" />
						</Menu.Button>
						<Transition
							as={Fragment}
							enter="transition ease-out duration-100"
							enterFrom="transform opacity-0 scale-95"
							enterTo="transform opacity-100 scale-100"
							leave="transition ease-in duration-75"
							leaveFrom="transform opacity-100 scale-100"
							leaveTo="transform opacity-0 scale-95"
						>
							<Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white border rounded-md shadow-lg focus:outline-none z-50">
								<div className="py-1">
									<Menu.Item>
										{({ active }) => (
											<button
												onClick={handleLogout}
												className={`${active ? 'bg-gray-100' : ''} w-full text-left px-4 py-2 text-sm text-gray-700`}
											>
												Logout
											</button>
										)}
									</Menu.Item>
								</div>
							</Menu.Items>
						</Transition>
					</Menu>
				</header>

				<main className="flex-1 p-4 md:p-6 overflow-auto">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
