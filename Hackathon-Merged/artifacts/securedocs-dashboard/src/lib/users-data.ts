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

export const availableCases: CaseOption[] = [
  { id: 'C-1024', label: 'Theft Investigation' },
  { id: 'C-1025', label: 'Fraud Investigation' },
  { id: 'C-1026', label: 'Financial Investigation' },
];

export const defaultUsers: UserData[] = [
  {
    id: 'USR-001',
    name: 'Officer A',
    employeeId: 'EMP-1001',
    email: 'officer.a@securedocs.gov.in',
    role: 'Officer',
    department: 'Investigation',
    status: 'Active',
    assignedCases: ['C-1024'],
  },
  {
    id: 'USR-002',
    name: 'Reviewer B',
    employeeId: 'EMP-1002',
    email: 'reviewer.b@securedocs.gov.in',
    role: 'Legal Reviewer',
    department: 'Legal',
    status: 'Active',
    assignedCases: ['C-1024', 'C-1025'],
  },
  {
    id: 'USR-003',
    name: 'Auditor C',
    employeeId: 'EMP-1003',
    email: 'auditor.c@securedocs.gov.in',
    role: 'Auditor',
    department: 'Audit',
    status: 'Active',
    assignedCases: ['C-1026'],
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
