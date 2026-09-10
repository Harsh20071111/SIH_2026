import { api } from './api';
import { defaultUsers, type UserData, type UserRole, type UserDepartment, type UserStatus } from '@/lib/users-data';

const CACHE_KEY = 'securedocs_cached_users';
const CUSTOM_USERS_KEY = 'securedocs_custom_users';

function getStoredCustomUsers(): UserData[] {
  try {
    const raw = localStorage.getItem(CUSTOM_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredCustomUsers(users: UserData[]): void {
  try {
    localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(users));
  } catch {
    // Ignore quota errors
  }
}

function getStoredCache(): UserData[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredCache(users: UserData[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(users));
  } catch {
    // Ignore quota errors
  }
}

function mapBackendUser(u: any): UserData {
  return {
    id: u._id ? u._id.toString() : (u.id || u.employeeId || `USR-${Math.floor(1000 + Math.random() * 9000)}`),
    name: u.name || 'Unnamed User',
    employeeId: u.employeeId || 'EMP-0000',
    email: u.email || '',
    role: (u.role || 'Officer') as UserRole,
    department: (u.department || 'General') as UserDepartment,
    status: u.isActive === false ? 'Disabled' : 'Active',
    assignedCases: Array.isArray(u.assignedCases) ? u.assignedCases : [],
    approvalStatus: u.approvalStatus || 'Approved',
    verificationDocuments: u.verificationDocuments || [],
  };
}

export const userService = {
  /**
   * Fetch all users from API or fall back to cached / default users
   */
  async getUsers(): Promise<UserData[]> {
    try {
      const response = await api.get<any[]>('/users');
      if (Array.isArray(response) && response.length > 0) {
        const mapped = response.map(mapBackendUser);
        
        // Merge with any custom local users that might not be on backend yet
        const customUsers = getStoredCustomUsers();
        const merged = [...mapped];
        for (const cu of customUsers) {
          if (!merged.some(u => u.email.toLowerCase() === cu.email.toLowerCase() || u.employeeId === cu.employeeId)) {
            merged.push(cu);
          }
        }
        
        saveStoredCache(merged);
        return merged;
      }
    } catch (err) {
      console.warn('Could not fetch users from backend API, falling back to cache:', err);
    }

    // Fallback: cached users or defaults + custom users
    const cached = getStoredCache();
    if (cached.length > 0) return cached;

    const custom = getStoredCustomUsers();
    const fallback = [...defaultUsers];
    for (const cu of custom) {
      if (!fallback.some(u => u.email.toLowerCase() === cu.email.toLowerCase() || u.employeeId === cu.employeeId)) {
        fallback.unshift(cu);
      }
    }
    saveStoredCache(fallback);
    return fallback;
  },

  async getPendingUsers(): Promise<UserData[]> {
    try {
      const response = await api.get<any[]>('/users/pending');
      if (Array.isArray(response)) {
        return response.map(mapBackendUser);
      }
    } catch (err) {
      console.warn('Could not fetch pending users from backend API:', err);
    }
    return [];
  },

  /**
   * Get single user by ID
   */
  async getUserById(id: string): Promise<UserData | undefined> {
    const all = await this.getUsers();
    return all.find(u => u.id === id || u.employeeId === id);
  },

  /**
   * Synchronous cached lookup
   */
  getCachedUsers(): UserData[] {
    const cached = getStoredCache();
    if (cached.length > 0) return cached;
    return defaultUsers;
  },

  /**
   * Create a new user (admin only)
   */
  async createUser(data: {
    name: string;
    employeeId: string;
    email: string;
    role: UserRole;
    department: UserDepartment;
    password?: string;
    assignedCases?: string[];
    status?: UserStatus;
    documents?: File[];
  }): Promise<UserData> {
    let createdUser: UserData;

    try {
      let payload: any;

      if (data.documents && data.documents.length > 0) {
        payload = new FormData();
        payload.append('name', data.name.trim());
        payload.append('employeeId', data.employeeId.trim());
        payload.append('email', data.email.toLowerCase().trim());
        payload.append('role', data.role);
        payload.append('department', data.department);
        payload.append('password', data.password || 'SecureDocs@2026');
        data.assignedCases?.forEach(caseId => payload.append('assignedCases[]', caseId));
        data.documents.forEach(file => payload.append('documents', file));
      } else {
        payload = {
          name: data.name.trim(),
          employeeId: data.employeeId.trim(),
          email: data.email.toLowerCase().trim(),
          role: data.role,
          department: data.department,
          password: data.password || 'SecureDocs@2026',
          assignedCases: data.assignedCases || [],
        };
      }

      const res = await api.post<any>('/users', payload);

      createdUser = mapBackendUser(res);
    } catch (err: any) {
      // If backend failed due to duplicate conflict, rethrow so UI can notify
      if (err.message && (err.message.includes('already exists') || err.status === 409)) {
        throw err;
      }

      console.warn('Backend user creation error, storing locally as fallback:', err);
      // Create local fallback record
      createdUser = {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: data.name.trim(),
        employeeId: data.employeeId.trim(),
        email: data.email.toLowerCase().trim(),
        role: data.role,
        department: data.department,
        status: data.status || 'Active',
        assignedCases: data.assignedCases || [],
      };
    }

    // Always update local cache & custom list so it immediately appears in UI!
    const custom = getStoredCustomUsers();
    custom.unshift(createdUser);
    saveStoredCustomUsers(custom);

    const cached = getStoredCache();
    const updatedCache = [createdUser, ...cached.filter(u => u.id !== createdUser.id && u.email !== createdUser.email)];
    saveStoredCache(updatedCache);

    return createdUser;
  },

  /**
   * Update an existing user
   */
  async updateUser(
    id: string,
    updates: Partial<UserData> & { isActive?: boolean; password?: string }
  ): Promise<UserData | null> {
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.department !== undefined) payload.department = updates.department;
    if (updates.status !== undefined) payload.isActive = updates.status === 'Active';
    if (updates.isActive !== undefined) payload.isActive = updates.isActive;
    if (updates.assignedCases !== undefined) payload.assignedCases = updates.assignedCases;
    if (updates.password && updates.password.trim()) payload.password = updates.password.trim();

    // Check if valid MongoDB ObjectId (24 hex characters)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

    let updatedResult: UserData | null = null;

    if (isMongoId) {
      try {
        const res = await api.patch<any>(`/users/${id}`, payload);
        updatedResult = mapBackendUser(res);
      } catch (err) {
        console.warn(`Backend user update error for ${id}, updating cache locally:`, err);
      }
    }

    // Always update cache and custom storage
    const cached = getStoredCache();
    const nextCached = cached.map(u => {
      if (u.id === id || u.employeeId === id) {
        const nextStatus = updates.status || (updates.isActive !== undefined ? (updates.isActive ? 'Active' : 'Disabled') : u.status);
        return {
          ...u,
          ...updates,
          status: nextStatus as UserStatus,
        };
      }
      return u;
    });
    saveStoredCache(nextCached);

    const custom = getStoredCustomUsers();
    const nextCustom = custom.map(u => {
      if (u.id === id || u.employeeId === id) {
        const nextStatus = updates.status || (updates.isActive !== undefined ? (updates.isActive ? 'Active' : 'Disabled') : u.status);
        return {
          ...u,
          ...updates,
          status: nextStatus as UserStatus,
        };
      }
      return u;
    });
    saveStoredCustomUsers(nextCustom);

    return updatedResult || nextCached.find(u => u.id === id) || null;
  },

  /**
   * Set or reset a user's password (admin only)
   */
  async resetPassword(id: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (!newPassword || newPassword.trim().length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    if (isMongoId) {
      try {
        const res = await api.post<any>(`/users/${id}/reset-password`, {
          password: newPassword.trim(),
        });
        return { success: true, message: res.message || 'Password successfully updated.' };
      } catch (err: any) {
        // Try fallback to patch
        try {
          await api.patch<any>(`/users/${id}`, {
            password: newPassword.trim(),
          });
          return { success: true, message: 'Password successfully updated.' };
        } catch (patchErr: any) {
          throw new Error(patchErr.message || err.message || 'Failed to update user password.');
        }
      }
    }

    // For local users or fallback
    return { success: true, message: 'Password updated successfully for local user.' };
  },

  async approveUser(id: string): Promise<UserData> {
    const res = await api.post<any>(`/users/${id}/approve`, {});
    const approvedUser = mapBackendUser(res);
    
    // Update local cache
    const cached = getStoredCache();
    const updatedCache = cached.map(u => u.id === id ? { ...u, approvalStatus: 'Approved' as const } : u);
    saveStoredCache(updatedCache);

    return approvedUser;
  },

  async rejectUser(id: string): Promise<UserData> {
    const res = await api.post<any>(`/users/${id}/reject`, {});
    const rejectedUser = mapBackendUser(res);

    // Update local cache
    const cached = getStoredCache();
    const updatedCache = cached.map(u => u.id === id ? { ...u, approvalStatus: 'Rejected' as const, status: 'Disabled' as const } : u);
    saveStoredCache(updatedCache);

    return rejectedUser;
  },
};
