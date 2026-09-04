import { useAuth } from '../context/AuthContext';
import { Redirect } from 'wouter';
import { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-500 font-medium">Authenticating...</div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" replace />;
  }

  return <>{children}</>;
}
