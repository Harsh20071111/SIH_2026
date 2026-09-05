import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();

  // If already logged in (and not using the prototype demo token), redirect
  if (user && localStorage.getItem('securedocs_token')) {
    setLocation('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier) {
      setError('Email or Employee ID is required.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(identifier, password);
      login(response.token, response.user);
      setLocation('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      {/* Left side: Branding (hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <Shield className="h-10 w-10 text-blue-500" />
            <span className="text-2xl font-bold tracking-tight">SecureDocs</span>
          </div>
          
          <h1 className="text-4xl font-semibold leading-tight text-slate-100 max-w-lg mb-6">
            Secure Digital Document Management System
          </h1>
          <p className="text-lg text-slate-400 max-w-md leading-relaxed">
            Protecting sensitive legal and investigation documents with enterprise-grade security, comprehensive audit trails, and strict access controls.
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-slate-400 text-sm">
          <Lock className="h-4 w-4" />
          <span>Authorized access only. Activity is monitored and logged.</span>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden justify-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900 tracking-tight">SecureDocs</span>
          </div>

          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="space-y-2 text-center pb-6">
              <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">Sign in to your account</CardTitle>
              <CardDescription className="text-slate-500">
                Enter your credentials to access the secure workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-slate-700 font-medium">Email / Employee ID</Label>
                  <Input 
                    id="identifier"
                    type="text" 
                    placeholder="Enter email or employee ID" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={isLoading}
                    className="focus-visible:ring-blue-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password"
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Enter password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="pr-10 focus-visible:ring-blue-600"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      disabled={isLoading} 
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:text-white data-[state=checked]:border-blue-600" 
                    />
                    <label 
                      htmlFor="remember" 
                      className="text-sm font-medium leading-none text-slate-600 cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </label>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setLocation('/forgot-password')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? 'Authenticating...' : 'LOGIN'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-slate-100 pt-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Lock className="h-3 w-3" />
                <span>Protected by SecureDocs Encryption</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
