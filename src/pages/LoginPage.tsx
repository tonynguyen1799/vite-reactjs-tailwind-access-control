import { useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { HiOutlineKey, HiOutlineUser, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login(username, password, rememberMe);
    setIsLoading(false);
  };

  // The form content is extracted to be reused in both mobile and desktop layouts
  const renderForm = () => (
    <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={() => setRememberMe(!rememberMe)}
              />
              <Label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Remember Me
              </Label>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </div>
    </form>
  );

  return (
    <>
      {/* Mobile & Tablet Layout (Visible on small screens, hidden on large) */}
      <div className="flex min-h-screen flex-col bg-gray-100 lg:hidden">
        <div className="flex flex-col items-center justify-center bg-slate-900 p-8 text-center">
            <HiOutlineKey className="w-16 h-16 text-slate-500 mb-4" />
            <h1 className="text-3xl font-bold text-white">Access Control</h1>
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-sm space-y-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Sign In</h2>
                <p className="text-muted-foreground">Enter your credentials to continue.</p>
            </div>
            {renderForm()}
          </div>
        </div>
      </div>

      {/* Desktop Layout (Hidden on small screens, visible on large) */}
      <div className="hidden w-full lg:grid lg:min-h-screen lg:grid-cols-2">
        <div className="hidden bg-slate-900 lg:flex lg:flex-col lg:items-center lg:justify-center p-8 text-center">
            <HiOutlineKey className="w-20 h-20 text-slate-500 mb-6" />
            <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Access Control Panel</h1>
            <p className="text-lg text-slate-400">
                Securely manage your users and permissions.
            </p>
            </div>
        </div>
        <div className="flex items-center justify-center py-12 px-4">
            <div className="mx-auto grid w-[350px] gap-6">
                <div className="grid gap-2 text-center">
                    <h1 className="text-3xl font-bold">Sign In</h1>
                    <p className="text-balance text-muted-foreground">
                    Enter your credentials to access your dashboard
                    </p>
                </div>
                {renderForm()}
            </div>
        </div>
      </div>
    </>
  );
}