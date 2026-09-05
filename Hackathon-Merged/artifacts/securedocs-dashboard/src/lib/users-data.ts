export type UserRole = 'Officer' | 'Reviewer' | 'Auditor' | 'Administrator';
export type UserDepartment = 'Investigation' | 'Legal' | 'Audit' | 'Administration';
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
    role: 'Reviewer',
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

export const userRoles: UserRole[] = ['Officer', 'Reviewer', 'Auditor', 'Administrator'];
export const userDepartments: UserDepartment[] = ['Investigation', 'Legal', 'Audit', 'Administration'];
export const userStatuses: UserStatus[] = ['Active', 'Disabled'];

export function getUserById(id: string): UserData | undefined {
  return defaultUsers.find((u) => u.id === id);
}
