export type UserRole =
  | 'Officer'
  | 'Legal Reviewer'
  | 'Reviewer'
  | 'Auditor'
  | 'Admin'
  | 'Administrator'
  | 'Clerk'
  | 'DutyOfficer'
  | 'IO'
  | 'SHO'
  | 'SP'
  | 'ForensicExpert'
  | 'Magistrate';

export type UserDepartment =
  | 'Investigation'
  | 'Legal'
  | 'Audit'
  | 'Administration'
  | 'Cyber Crime'
  | 'Financial Crime'
  | 'General'
  | string;

export type UserStatus = 'Active' | 'Disabled';

export interface UserData {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  role: UserRole;
  department: UserDepartment;
  status: UserStatus;
  assignedCases: string[];
}

export interface CaseOption {
  id: string;
  label: string;
}

export const availableCases: CaseOption[] = [];

export const defaultUsers: UserData[] = [
  {
    id: '6aa29cc453a9d8e2a85689f9',
    name: 'Harsh_2007',
    employeeId: 'Harsh_2007',
    email: 'harsh_2007@securedocs.gov',
    role: 'Admin',
    department: 'Administration',
    status: 'Active',
    assignedCases: [],
  },
];

export const userRoles: UserRole[] = ['Officer', 'Legal Reviewer', 'Admin', 'Clerk', 'Auditor'];
export const userDepartments: UserDepartment[] = ['Investigation', 'Legal', 'Audit', 'Administration', 'Cyber Crime', 'Financial Crime', 'General'];
export const userStatuses: UserStatus[] = ['Active', 'Disabled'];

export function getUserById(id: string): UserData | undefined {
  try {
    const raw = localStorage.getItem('securedocs_cached_users');
    if (raw) {
      const parsed: UserData[] = JSON.parse(raw);
      const found = parsed.find((u) => u.id === id || u.employeeId === id);
      if (found) return found;
    }
  } catch {
    // ignore
  }
  return defaultUsers.find((u) => u.id === id || u.employeeId === id);
}
