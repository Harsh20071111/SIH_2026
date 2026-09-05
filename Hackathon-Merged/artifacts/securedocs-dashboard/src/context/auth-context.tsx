import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getCurrentUser,
  getCurrentSession,
  loginWithEmail,
  logoutCurrentUser,
  type AppwriteUser,
  type AppwriteSession,
} from '@/lib/auth-service';

export interface AuthContextType {
  user: AppwriteUser | null;
  session: AppwriteSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [session, setSession] = useState<AppwriteSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkUserSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        const currentSession = await getCurrentSession();
        setSession(currentSession);
      } else {
        setSession(null);
      }
    } catch {
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  const login = async (email: string, password: string) => {
    const newSession = await loginWithEmail(email, password);
    setSession(newSession);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  const logout = async () => {
    try {
      await logoutCurrentUser();
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  const refreshUser = async () => {
    await checkUserSession();
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
