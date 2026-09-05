import { api } from './api';
import type { OfficerRank } from '../types/roles';

export interface User {
  id: string;
  name: string;
  email: string;
  role: OfficerRank;
  department?: string;
  employeeId?: string;
  
  // ABAC / Jurisdiction
  policeStationId?: string;
  districtCode?: string;
  stateCode?: string;
  jurisdictionId?: string;
  forensicTokens?: string[];
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

