import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getAuthErrorMessage } from '@/lib/auth-service';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
      setSuccessMessage('Authentication successful! Redirecting to command view...');
      setTimeout(() => {
        setLocation('/dashboard');
      }, 600);
    } catch (err: any) {
      const msg = getAuthErrorMessage(err);
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background text-foreground p-4 sm:p-6 relative">
      {/* Main Container */}
      <div className="w-full max-w-[420px] relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center size-12 rounded-md bg-primary text-white shadow-xs mb-3">
            <ShieldCheck size={26} strokeWidth={2.4} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            SecureDocs
          </h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
            Legal & Evidence Command
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-lg border border-border bg-card shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-base font-bold text-foreground tracking-tight">Sign in to your account</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Authenticate via Appwrite to access protected legal casework and evidence.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div
              data-testid="alert-login-error"
              className="mb-5 flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in duration-150"
            >
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div
              data-testid="alert-login-success"
              className="mb-5 flex items-start gap-2.5 rounded-md border border-emerald-300 bg-[#E8F5E9] p-3 text-xs text-[#16803C] animate-in fade-in duration-150"
            >
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed font-medium">{successMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-foreground mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail size={15} />
                </div>
                <input
                  id="login-email"
                  data-testid="input-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@agency.gov.in"
                  className="w-full h-10 pl-9 pr-3.5 rounded-md border border-input bg-card text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold text-foreground">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock size={15} />
                </div>
                <input
                  id="login-password"
                  data-testid="input-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-10 pl-9 pr-10 rounded-md border border-input bg-card text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
                <button
                  type="button"
                  data-testid="button-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                data-testid="button-login-submit"
                disabled={isSubmitting || authLoading}
                className="w-full h-10 rounded-md bg-primary hover:bg-primary-hover active:bg-primary-hover text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Verifying session...</span>
                  </>
                ) : (
                  <span>Sign In with Appwrite</span>
                )}
              </button>
            </div>
          </form>

          {/* Security Banner */}
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Appwrite Auth
            </span>
            <span>TLS 1.3 · Secure Session</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-5 text-[11px] text-muted-foreground">
          SecureDocs Digital Evidence System · Protected Government Network
        </div>
      </div>
    </div>
  );
}
