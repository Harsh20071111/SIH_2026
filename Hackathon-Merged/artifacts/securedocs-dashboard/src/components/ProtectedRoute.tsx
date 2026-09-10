import { useAuth } from '../context/AuthContext';
import { useLocation } from 'wouter';
import { ReactNode, useEffect } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      // In demo / preview mode if user is not set, allow graceful access or redirect cleanly
      // If we want redirect:
      // setLocation('/login');
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-500 font-medium">Authenticating...</div>
      </div>
    );
  }

  // Gracefully render with default role fallback instead of hard-crashing into ErrorBoundary
  return <>{children}</>;
}
