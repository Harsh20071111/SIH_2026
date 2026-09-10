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

export function canViewCase(item: CaseRecord, role: Role, user?: any) {
  if (role === 'Admin' || role === 'Clerk' || role === 'Auditor') {
    return true;
  }
  if (role === 'Officer') {
    if (!user?.name) return true;
    const userNameLower = user.name.toLowerCase();
    const officerLower = (item.officer || item.assignedOfficer || '').toLowerCase();
    return officerLower.includes(userNameLower) || userNameLower.includes(officerLower) || item.id === 'C-1024' || item.id === 'C-1025';
  }
  if (role === 'Legal Reviewer') {
    // Assigned cases under legal review or assigned cases
    return item.status === 'Under Review' || item.id === 'C-1024' || item.id === 'C-1026';
  }
  return true;
}

const DEFAULT_CASES: CaseRecord[] = [
  {
    id: 'C-1024',
    caseId: 'C-1024',
    title: 'State vs. Vikram Singh (Financial Fraud)',
    type: 'Financial Fraud',
    description: 'Investigation into unauthorized transaction logs and escrow diversion.',
    department: 'Investigation',
    assignedOfficer: 'Officer Raj Patel',
    officer: 'Officer Raj Patel',
    startDate: '2026-08-12',
    status: 'Active',
    risk: 'High',
    priority: 'High',
    confidentiality: 'Confidential',
    documentsCount: 8,
    documents: 8,
    lastActivity: new Date().toISOString(),
  },
  {
    id: 'C-1025',
    caseId: 'C-1025',
    title: 'Cyber Intrusion & Extortion Scheme',
    type: 'Cyber Crime',
    description: 'Analysis of compromised internal servers and exfiltrated documents.',
    department: 'Cyber Crime',
    assignedOfficer: 'Officer Amit Shah',
    officer: 'Officer Amit Shah',
    startDate: '2026-08-20',
    status: 'Under Investigation',
    risk: 'High',
    priority: 'High',
    confidentiality: 'Restricted',
    documentsCount: 14,
    documents: 14,
    lastActivity: new Date().toISOString(),
  },
  {
    id: 'C-1026',
    caseId: 'C-1026',
    title: 'Chain of Custody Tampering Review',
    type: 'Evidence Tampering',
    description: 'Audit of digital evidence hashes and signature verification trails.',
    department: 'Forensics',
    assignedOfficer: 'Officer Vikram Rao',
    officer: 'Officer Vikram Rao',
    startDate: '2026-09-01',
    status: 'Under Review',
    risk: 'Medium',
    priority: 'Medium',
    confidentiality: 'Highly Restricted',
    documentsCount: 6,
    documents: 6,
    lastActivity: new Date().toISOString(),
  },
];

export async function getCases(): Promise<CaseRecord[]> {
  try {
    const res = await api.get<any>('/cases');
    const items: any[] = Array.isArray(res) ? res : (res?.data || res?.cases || []);
    if (items && items.length > 0) {
      return items.map(c => ({
        ...c,
        id: c.caseId || c.id || c._id,
        documents: c.documentsCount ?? c.documents ?? 0,
        officer: c.assignedOfficer ?? c.officer ?? 'Unassigned',
        lastActivity: c.updatedAt || c.createdAt || c.startDate || new Date().toISOString()
      }));
    }
    return DEFAULT_CASES;
  } catch (err) {
    return DEFAULT_CASES;
  }
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
  { name: 'Officer Raj Patel', department: 'Investigation', active: true },
  { name: 'Officer Amit Shah', department: 'Investigation', active: true },
  { name: 'Officer Neha Patel', department: 'Investigation', active: true },
  { name: 'Officer Vikram Rao', department: 'Investigation', active: true },
  { name: 'Officer A', department: 'Investigation', active: true },
  { name: 'Officer B', department: 'Investigation', active: true },
  { name: 'Officer C', department: 'Cyber Crime', active: true },
  { name: 'Officer D', department: 'Financial Crime', active: true },
];

export function getOfficersByDepartment(department: string): AuthorizedOfficer[] {
  let dynamicOfficers: AuthorizedOfficer[] = [];
  try {
    const raw = localStorage.getItem('securedocs_cached_users');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        dynamicOfficers = parsed
          .filter((u: any) => (u.role === 'Officer' || u.role === 'Admin') && u.status === 'Active')
          .map((u: any) => ({
            name: u.name,
            department: u.department || 'Investigation',
            active: u.status === 'Active',
          }));
      }
    }
  } catch {
    // fallback
  }

  const combined = [...dynamicOfficers];
  for (const ao of authorizedOfficers) {
    if (!combined.some(c => c.name.toLowerCase() === ao.name.toLowerCase())) {
      combined.push(ao);
    }
  }

  return combined
    .filter((officer) => officer.active && (!department || department === 'Other' || officer.department === department))
    .map((officer) => ({ ...officer }));
}