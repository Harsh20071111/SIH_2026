import type { Role } from '@/lib/mock-data';
import { api } from '../services/api';

export type CaseStatus = 'Active' | 'Under Investigation' | 'Under Review' | 'Closed' | 'Archived';
export type CaseRisk = 'Low' | 'Medium' | 'High';
export type CasePriority = 'Low' | 'Medium' | 'High';
export type ConfidentialityLevel = 'Public/Internal' | 'Confidential' | 'Restricted' | 'Highly Restricted';

export type CaseRecord = {
  id: string;
  caseId: string;
  title: string;
  type: string;
  description?: string;
  department?: string;
  assignedOfficer?: string;
  officer?: string;
  startDate?: string;
  status: CaseStatus;
  risk: CaseRisk;
  priority: CasePriority;
  confidentiality?: ConfidentialityLevel;
  documentsCount?: number;
  documents?: number;
  activityCount?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  lastActivity: string;
};

export type CaseCreateInput = {
  id?: string;
  caseId: string;
  title: string;
  type: string;
  description: string;
  department: string;
  assignedOfficer: string;
  priority: CasePriority;
  startDate: string;
  confidentiality: ConfidentialityLevel;
  status?: CaseStatus;
  createdAt?: string;
  createdBy?: string;
  risk?: CaseRisk;
  documents?: number;
  lastActivity?: string;
};

// Not used anymore as backend handles this, but kept for UI compatibility
export function canViewCase(item: CaseRecord, role: Role) {
  return true; // Backend already filters this
}

export async function getCases(): Promise<CaseRecord[]> {
  const res = await api.get<any>('/cases');
  const items: any[] = Array.isArray(res) ? res : (res?.data || res?.cases || []);
  // Map backend _id to id if needed, but caseId is the main identifier
  return items.map(c => ({
    ...c,
    id: c.caseId,
    documents: c.documentsCount,
    officer: c.assignedOfficer,
    lastActivity: c.updatedAt || c.createdAt || c.startDate || new Date().toISOString()
  }));
}

export async function getCaseById(id: string): Promise<CaseRecord | undefined> {
  try {
    const c = await api.get<any>(`/cases/${id}`);
    return {
      ...c,
      id: c.caseId,
      documents: c.documentsCount,
      officer: c.assignedOfficer,
      lastActivity: c.updatedAt || c.createdAt || c.startDate || new Date().toISOString()
    };
  } catch (e) {
    return undefined;
  }
}

export async function checkCaseIdExists(caseId: string): Promise<boolean> {
  const caseExists = await getCaseById(caseId);
  return !!caseExists;
}

export function getNextCaseId(): string {
  // Backend generate an ID or we let user specify, but for UI:
  return `CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function createCase(data: CaseCreateInput): Promise<CaseRecord> {
  const created = await api.post<CaseRecord>('/cases', data);
  return { ...created, id: created.caseId, documents: created.documentsCount, officer: created.assignedOfficer };
}

export async function updateCase(id: string, data: Partial<Omit<CaseRecord, 'id'>>): Promise<CaseRecord> {
  const updated = await api.patch<CaseRecord>(`/cases/${id}`, data);
  return { ...updated, id: updated.caseId, documents: updated.documentsCount, officer: updated.assignedOfficer };
}

export async function archiveCase(id: string): Promise<CaseRecord> {
  return updateCase(id, { status: 'Archived' });
}

export type AuthorizedOfficer = {
  name: string;
  department: string;
  active: boolean;
};

const authorizedOfficers: AuthorizedOfficer[] = [
  { name: 'Officer A', department: 'Investigation', active: true },
  { name: 'Officer B', department: 'Investigation', active: true },
  { name: 'Officer C', department: 'Cyber Crime', active: true },
  { name: 'Officer D', department: 'Financial Crime', active: true },
];

export function getOfficersByDepartment(department: string): AuthorizedOfficer[] {
  return authorizedOfficers
    .filter((officer) => officer.active && (department === 'Other' || officer.department === department))
    .map((officer) => ({ ...officer }));
}