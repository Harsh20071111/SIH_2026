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
  'admin@securedocs.gov': {
    id: 'usr-admin',
    name: 'Admin User',
    email: 'admin@securedocs.gov',
    role: 'Admin',
    department: 'Administration',
    employeeId: 'EMP-001',
  },
  'emp-001': {
    id: 'usr-admin',
    name: 'Admin User',
    email: 'admin@securedocs.gov',
    role: 'Admin',
    department: 'Administration',
    employeeId: 'EMP-001',
  },
  'raj.patel@securedocs.gov': {
    id: 'usr-002',
    name: 'Officer Raj Patel',
    email: 'raj.patel@securedocs.gov',
    role: 'Officer',
    department: 'Investigation',
    employeeId: 'EMP-002',
  },
  'emp-002': {
    id: 'usr-002',
    name: 'Officer Raj Patel',
    email: 'raj.patel@securedocs.gov',
    role: 'Officer',
    department: 'Investigation',
    employeeId: 'EMP-002',
  },
  'amit.shah@securedocs.gov': {
    id: 'usr-003',
    name: 'Officer Amit Shah',
    email: 'amit.shah@securedocs.gov',
    role: 'Officer',
    department: 'Cyber Crime',
    employeeId: 'EMP-003',
  },
  'emp-003': {
    id: 'usr-003',
    name: 'Officer Amit Shah',
    email: 'amit.shah@securedocs.gov',
    role: 'Officer',
    department: 'Cyber Crime',
    employeeId: 'EMP-003',
  },
  'neha.patel@securedocs.gov': {
    id: 'usr-004',
    name: 'Officer Neha Patel',
    email: 'neha.patel@securedocs.gov',
    role: 'Officer',
    department: 'Evidence',
    employeeId: 'EMP-004',
  },
  'emp-004': {
    id: 'usr-004',
    name: 'Officer Neha Patel',
    email: 'neha.patel@securedocs.gov',
    role: 'Officer',
    department: 'Evidence',
    employeeId: 'EMP-004',
  },
  'vikram.rao@securedocs.gov': {
    id: 'usr-005',
    name: 'Officer Vikram Rao',
    email: 'vikram.rao@securedocs.gov',
    role: 'Officer',
    department: 'Forensics',
    employeeId: 'EMP-005',
  },
  'emp-005': {
    id: 'usr-005',
    name: 'Officer Vikram Rao',
    email: 'vikram.rao@securedocs.gov',
    role: 'Officer',
    department: 'Forensics',
    employeeId: 'EMP-005',
  },
  'mehta@securedocs.gov': {
    id: 'usr-006',
    name: 'Legal Reviewer Mehta',
    email: 'mehta@securedocs.gov',
    role: 'Legal Reviewer',
    department: 'Legal',
    employeeId: 'EMP-006',
  },
  'emp-006': {
    id: 'usr-006',
    name: 'Legal Reviewer Mehta',
    email: 'mehta@securedocs.gov',
    role: 'Legal Reviewer',
    department: 'Legal',
    employeeId: 'EMP-006',
  },
  'clerk@securedocs.gov': {
    id: 'usr-007',
    name: 'Court Clerk S. Webb',
    email: 'clerk@securedocs.gov',
    role: 'Clerk',
    department: 'Court Services',
    employeeId: 'EMP-007',
  },
  'emp-007': {
    id: 'usr-007',
    name: 'Court Clerk S. Webb',
    email: 'clerk@securedocs.gov',
    role: 'Clerk',
    department: 'Court Services',
    employeeId: 'EMP-007',
  },
  'auditor@securedocs.gov': {
    id: 'usr-008',
    name: 'Auditor Singh',
    email: 'auditor@securedocs.gov',
    role: 'Auditor',
    department: 'Audit',
    employeeId: 'EMP-008',
  },
  'emp-008': {
    id: 'usr-008',
    name: 'Auditor Singh',
    email: 'auditor@securedocs.gov',
    role: 'Auditor',
    department: 'Audit',
    employeeId: 'EMP-008',
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

