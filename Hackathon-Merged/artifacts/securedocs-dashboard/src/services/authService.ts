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

export const authService = {
  async login(identifier: string, password: string): Promise<AuthResponse> {
    if (!identifier.trim()) throw new Error('Email or Employee ID is required.');
    if (!password) throw new Error('Password is required.');

    // We assume the user is trying to log in with email since the backend expects email
    // but the backend handles lowercase automatically.
    return api.post<AuthResponse>('/auth/login', {
      email: identifier,
      password,
    });
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

