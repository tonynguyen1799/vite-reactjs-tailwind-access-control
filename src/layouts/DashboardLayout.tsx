import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineHome, HiOutlineUsers, HiOutlineShieldCheck, HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import { FiMenu, FiKey } from 'react-icons/fi';
import { LogOut, User, Palette } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import { useMediaQuery } from 'react-responsive';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePermissions } from '@/contexts/usePermissions';
import { useTheme } from '@/contexts/ThemeContext';

const navLinks = [
    { to: '/', label: 'Dashboard', icon: <HiOutlineHome className="w-5 h-5" />, requiredPrivileges: [] },
    { to: '/users', label: 'Users', icon: <HiOutlineUsers className="w-5 h-5" />, requiredPrivileges: ['USER_MANAGEMENT_READ'] },
    { to: '/roles', label: 'Roles', icon: <HiOutlineShieldCheck className="w-5 h-5" />, requiredPrivileges: ['ROLE_MANAGEMENT_READ'] },
    { to: '/privileges', label: 'Privileges', icon: <FiKey className="w-5 h-5" />, requiredPrivileges: ['ROLE_MANAGEMENT_READ'] },
];

export default function DashboardLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { hasPrivilege } = usePermissions();
    const { setTheme } = useTheme();

    const isDesktop = useMediaQuery({ minWidth: 1024 });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    
    const accessibleNavLinks = navLinks.filter(link =>
        link.requiredPrivileges.length === 0 || link.requiredPrivileges.some(privilege => hasPrivilege(privilege))
    );

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

    const userFullName = user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user?.username;
    const userAvatarFallback = user?.profile?.firstName ? user.profile.firstName.charAt(0) : user?.username.charAt(0).toUpperCase();

    return (
        <div className="flex h-screen bg-muted/40 overflow-hidden">
            <aside
                className={cn(
                    "fixed md:relative z-50 bg-muted flex flex-col p-4 h-full md:h-screen inset-y-0 transform transition-all duration-300 ease-in-out", // <-- Ensure bg-muted is here
                    sidebarCollapsed ? 'md:w-20' : 'md:w-64',
                    "w-72",
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                    "md:translate-x-0"
                )}
            >
                <div className="flex flex-col items-center justify-center mb-6 h-14">
                </div>

                <TooltipProvider delayDuration={100}>
                    <nav className="flex-1 space-y-2 relative">
                        {accessibleNavLinks.map((link) => (
                            <Tooltip key={link.to}>
                                <TooltipTrigger asChild>
                                    <Link
                                        to={link.to}
                                        className={cn(
                                            "group flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-background/60",
                                            location.pathname === link.to && "bg-background text-primary"
                                        )}
                                    >
                                        <span className="h-5 w-5">{link.icon}</span>
                                        {!sidebarCollapsed && (
                                            <span className={cn(
                                                "text-sm",
                                                location.pathname === link.to
                                                    ? "font-semibold text-primary"
                                                    : isDesktop
                                                        ? "font-normal group-hover:font-semibold"
                                                        : "font-semibold"
                                            )}>
                                                {link.label}
                                            </span>
                                        )}
                                        <span className="sr-only">{link.label}</span>
                                    </Link>
                                </TooltipTrigger>
                                {sidebarCollapsed && (
                                    <TooltipContent side="right">
                                        {link.label}
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        ))}

                        {isDesktop && (
                            <div className="absolute bottom-4 left-0 w-full flex justify-center">
                                <Button
                                    onClick={() => setSidebarCollapsed((prev) => !prev)}
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2"
                                >
                                    {sidebarCollapsed ? (
                                        <HiChevronDoubleRight className="w-5 h-5" />
                                    ) : (
                                        <HiChevronDoubleLeft className="w-5 h-5" />
                                    )}
                                    {!sidebarCollapsed && <span className="text-xs">Collapse</span>}
                                </Button>
                            </div>
                        )}
                    </nav>
                </TooltipProvider>
            </aside>

            <div className="flex-1 flex flex-col">
                <header className="h-16 px-4 md:px-6 bg-background flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                const sidebar = document.querySelector('aside');
                                if (sidebar) {
                                    sidebar.classList.remove('animate-slideOut');
                                    sidebar.classList.add('animate-slideIn');
                                }
                                document.body.classList.add('overflow-hidden');
                                setSidebarOpen(true);
                            }}
                            className="md:hidden"
                            aria-label="Toggle sidebar"
                        >
                            <FiMenu className="w-4 h-5" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Palette className="h-5 w-5" />
                              <span className="sr-only">Toggle theme</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme("theme-zinc")}>
                              Zinc
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("theme-blue")}>
                              Blue
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("theme-green")}>
                              Green
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("theme-yellow")}>
                              Yellow
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("theme-red")}>
                              Red
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("theme-purple")}>
                              Purple
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.profile?.avatarUrl || ''} alt={user?.username} />
                                        <AvatarFallback>{userAvatarFallback}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 shadow-xl" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{userFullName}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                    </p>
                                </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/profile')}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}