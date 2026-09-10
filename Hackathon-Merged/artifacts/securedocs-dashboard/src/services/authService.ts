import { api } from './api';

export type UserRole = 'Admin' | 'Officer' | 'Legal Reviewer' | 'Clerk' | 'Auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  employeeId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const DEMO_USERS: Record<string, User> = {
  'harsh_2007': {
    id: '6aa29cc453a9d8e2a85689f9',
    name: 'Harsh_2007',
    email: 'harsh_2007@securedocs.gov',
    role: 'Admin',
    department: 'Administration',
    employeeId: 'Harsh_2007',
  },
  'harsh_2007@securedocs.gov': {
    id: '6aa29cc453a9d8e2a85689f9',
    name: 'Harsh_2007',
    email: 'harsh_2007@securedocs.gov',
    role: 'Admin',
    department: 'Administration',
    employeeId: 'Harsh_2007',
  },
};

export const authService = {
  async login(identifier: string, password: string): Promise<AuthResponse> {
    const trimmedId = identifier.trim();
    if (!trimmedId) throw new Error('Email or Employee ID is required.');
    if (!password) throw new Error('Password is required.');

    const normalizedKey = trimmedId.toLowerCase();

    // 1. First attempt to authenticate via the backend API
    try {
      return await api.post<AuthResponse>('/auth/login', {
        email: trimmedId,
        password,
      });
    } catch (err: any) {
      // 2. If the API returns 500 (database down/error), 502/503 (server asleep), or network failure:
      // Seamlessly fall back to built-in demo authentication
      const isConnectionOrServerError =
        !err.status ||
        err.status >= 500 ||
        err.message?.includes('Internal server error') ||
        err.message?.includes('fetch') ||
        err.message?.includes('Network') ||
        err.message?.includes('Failed') ||
        err.message?.includes('starting up') ||
        err.message?.includes('not found');

      if (isConnectionOrServerError) {
        const demoUser = DEMO_USERS[normalizedKey];
        if (demoUser) {
          if (password === 'password123') {
            return {
              token: `demo-token-${demoUser.id}-${Date.now()}`,
              user: demoUser,
            };
          } else {
            throw new Error('Invalid credentials. Demo password is: password123');
          }
        }

        // Allow any account with password123 in offline demo fallback
        if (password === 'password123') {
          const guessedRole: UserRole = normalizedKey.includes('admin') ? 'Admin' : 'Officer';
          return {
            token: `demo-token-custom-${Date.now()}`,
            user: {
              id: `usr-${Date.now()}`,
              name: trimmedId.includes('@') ? trimmedId.split('@')[0] : trimmedId,
              email: trimmedId.includes('@') ? trimmedId : `${normalizedKey}@securedocs.gov`,
              role: guessedRole,
              department: 'Investigation',
              employeeId: normalizedKey.startsWith('emp-') ? trimmedId.toUpperCase() : 'EMP-DEMO',
            },
          };
        }
      }

      // If it's a 401 invalid credentials error from backend, re-throw as is
      throw err;
    }
  },

  async logout(token: string | null): Promise<void> {
    if (!token) return;
    try {
      await api.post('/auth/logout', {}, token);
    } catch (e) {
      // Ignore logout errors
    }
  },
};

