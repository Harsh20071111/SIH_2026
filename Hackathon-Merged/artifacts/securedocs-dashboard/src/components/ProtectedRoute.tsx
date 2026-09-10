import { useAuth } from '../context/AuthContext';
import { useLocation } from 'wouter';
import { ReactNode, useEffect } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/login');
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-500 font-medium">Authenticating...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-500 font-medium">Redirecting to login...</div>
      </div>
    );
  }

  return <>{children}</>;
}
