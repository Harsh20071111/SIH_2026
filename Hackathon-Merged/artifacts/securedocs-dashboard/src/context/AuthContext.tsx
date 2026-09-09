import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('securedocs_user');
    const savedToken = localStorage.getItem('securedocs_token');
    
    if (savedUser && savedToken) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setToken(savedToken);
      } catch (e) {
        // ignore
      }
    } else {
      // No saved session — user must log in
      setUser(null);
      setToken(null);
    }
    setIsLoading(false);

    const handleLogoutEvent = async () => {
      if (savedToken) {
        await authService.logout(savedToken);
      }
      setToken(null);
      setUser(null);
      localStorage.removeItem('securedocs_token');
      localStorage.removeItem('securedocs_user');
    };

    window.addEventListener('logout', handleLogoutEvent);
    return () => window.removeEventListener('logout', handleLogoutEvent);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('securedocs_token', newToken);
    localStorage.setItem('securedocs_user', JSON.stringify(newUser));
  };

  const logout = async () => {
    if (token) {
      await authService.logout(token);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('securedocs_token');
    localStorage.removeItem('securedocs_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
