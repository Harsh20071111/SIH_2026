import type { SecureDocsRole } from '@/types/roles';

export type UserRole = SecureDocsRole;
export type UserDepartment = 'Investigation' | 'Legal' | 'Audit' | 'Administration' | 'Operations';
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
  { id: 'CASE-2026-001', label: 'Theft Investigation' },
  { id: 'CASE-2026-002', label: 'Financial Fraud Inquiry' },
];

export const defaultUsers: UserData[] = [
  {
    id: 'USR-001',
    name: 'Admin User',
    employeeId: 'EMP-1001',
    email: 'admin@securedocs.gov.in',
    role: 'Admin',
    department: 'Administration',
    status: 'Active',
    assignedCases: ['CASE-2026-001', 'CASE-2026-002'],
  },
  {
    id: 'USR-002',
    name: 'Officer Raj Patel',
    employeeId: 'EMP-1002',
    email: 'officer.raj@securedocs.gov.in',
    role: 'Officer',
    department: 'Investigation',
    status: 'Active',
    assignedCases: ['CASE-2026-001'],
  },
  {
    id: 'USR-003',
    name: 'Legal Officer Verma',
    employeeId: 'EMP-1003',
    email: 'legal.verma@securedocs.gov.in',
    role: 'Legal Reviewer',
    department: 'Legal',
    status: 'Active',
    assignedCases: ['CASE-2026-001'],
  },
  {
    id: 'USR-004',
    name: 'Auditor Sharma',
    employeeId: 'EMP-1004',
    email: 'auditor.sharma@securedocs.gov.in',
    role: 'Auditor',
    department: 'Audit',
    status: 'Active',
    assignedCases: ['CASE-2026-002'],
  },
];

export const userRoles: UserRole[] = ['Admin', 'Officer', 'Legal Reviewer', 'Clerk', 'Auditor'];
export const userDepartments: UserDepartment[] = ['Investigation', 'Legal', 'Audit', 'Administration', 'Operations'];
export const userStatuses: UserStatus[] = ['Active', 'Disabled'];

export function getUserById(id: string): UserData | undefined {
  return defaultUsers.find((u) => u.id === id);
}
