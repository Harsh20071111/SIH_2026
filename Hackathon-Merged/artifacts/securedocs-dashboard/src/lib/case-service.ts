import type { Role } from '@/lib/mock-data';

export type CaseStatus = 'Active' | 'Under Investigation' | 'Under Review' | 'Closed' | 'Archived';
export type CaseRisk = 'Low' | 'Medium' | 'High';
export type CasePriority = 'Low' | 'Medium' | 'High';
export type ConfidentialityLevel = 'Public/Internal' | 'Confidential' | 'Restricted' | 'Highly Restricted';

export type CaseRecord = {
  id: string;
  title: string;
  type: string;
  officer: string;
  documents: number;
  lastActivity: string;
  status: CaseStatus;
  risk: CaseRisk;
  priority: CasePriority;
  caseId?: string;
  description?: string;
  department?: string;
  assignedOfficer?: string;
  startDate?: string;
  confidentiality?: ConfidentialityLevel;
  createdAt?: string;
  createdBy?: string;
  activityCount?: number;
};

export type CaseCreateInput = {
  id: string;
  caseId: string;
  title: string;
  type: string;
  description: string;
  department: string;
  assignedOfficer: string;
  priority: CasePriority;
  startDate: string;
  confidentiality: ConfidentialityLevel;
  status: CaseStatus;
  createdAt: string;
  createdBy: string;
  risk?: CaseRisk;
  documents?: number;
  lastActivity?: string;
};

export type AuthorizedOfficer = {
  name: string;
  department: string;
  active: boolean;
};

export type CaseAuditEvent = {
  action: 'CASE_CREATED';
  caseId: string;
  createdAt: string;
  createdBy: string;
  metadata: {
    title: string;
    type: string;
    department: string;
    assignedOfficer: string;
    priority: CasePriority;
    confidentiality: ConfidentialityLevel;
  };
};

const seedCases: CaseRecord[] = [
  { id: 'C-1024', title: 'Theft Investigation', type: 'Theft', officer: 'Officer A', documents: 12, activityCount: 28, lastActivity: '2026-09-01T10:32:00', status: 'Active', risk: 'Medium', priority: 'High', description: 'Investigation related to reported theft and collection of supporting evidence.', department: 'Investigation', startDate: '2026-09-01', confidentiality: 'Restricted', createdAt: '2026-09-01T08:45:00', createdBy: 'Admin' },
  { id: 'C-1025', title: 'Financial Fraud', type: 'Fraud', officer: 'Officer B', documents: 24, lastActivity: '2026-08-31T09:18:00', status: 'Under Review', risk: 'High', priority: 'High' },
  { id: 'C-1026', title: 'Evidence Investigation', type: 'Investigation', officer: 'Officer C', documents: 8, lastActivity: '2026-08-30T14:05:00', status: 'Active', risk: 'Low', priority: 'Medium' },
  { id: 'C-1027', title: 'Cyber Crime Case', type: 'Cyber Crime', officer: 'Officer D', documents: 31, lastActivity: '2026-08-29T16:44:00', status: 'Under Investigation', risk: 'High', priority: 'High' },
  { id: 'C-1028', title: 'Property Theft', type: 'Theft', officer: 'Officer A', documents: 15, lastActivity: '2026-08-28T11:26:00', status: 'Closed', risk: 'Low', priority: 'Medium' },
  { id: 'C-1029', title: 'Procurement Review', type: 'Fraud', officer: 'Officer B', documents: 19, lastActivity: '2026-08-27T08:52:00', status: 'Under Review', risk: 'Medium', priority: 'High' },
  { id: 'C-1030', title: 'Digital Access Report', type: 'Cyber Crime', officer: 'Officer C', documents: 27, lastActivity: '2026-08-26T17:03:00', status: 'Under Investigation', risk: 'High', priority: 'Medium' },
  { id: 'C-1031', title: 'Warehouse Evidence', type: 'Investigation', officer: 'Officer D', documents: 6, lastActivity: '2026-08-24T12:41:00', status: 'Active', risk: 'Low', priority: 'Low' },
  { id: 'C-1032', title: 'Identity Misuse Review', type: 'Fraud', officer: 'Officer A', documents: 21, lastActivity: '2026-08-23T15:12:00', status: 'Active', risk: 'Medium', priority: 'High' },
  { id: 'C-1033', title: 'Recovered Asset Register', type: 'Theft', officer: 'Officer C', documents: 11, lastActivity: '2026-08-22T10:09:00', status: 'Closed', risk: 'Low', priority: 'Medium' },
  { id: 'C-1034', title: 'Network Intrusion Review', type: 'Cyber Crime', officer: 'Officer D', documents: 38, lastActivity: '2026-08-21T18:22:00', status: 'Under Investigation', risk: 'High', priority: 'High' },
  { id: 'C-1035', title: 'Statement Reconciliation', type: 'Investigation', officer: 'Officer B', documents: 9, lastActivity: '2026-08-20T13:37:00', status: 'Under Review', risk: 'Low', priority: 'Low' },
  { id: 'C-1036', title: 'Asset Transfer Inquiry', type: 'Fraud', officer: 'Officer A', documents: 16, lastActivity: '2026-08-19T09:24:00', status: 'Active', risk: 'Medium', priority: 'Medium' },
  { id: 'C-1037', title: 'Unclaimed Property File', type: 'Theft', officer: 'Officer B', documents: 7, lastActivity: '2026-08-18T11:48:00', status: 'Archived', risk: 'Low', priority: 'Low' },
  { id: 'C-1038', title: 'Forensic Intake Review', type: 'Investigation', officer: 'Officer C', documents: 13, lastActivity: '2026-08-17T16:16:00', status: 'Under Review', risk: 'Medium', priority: 'Medium' },
  { id: 'C-1039', title: 'Server Log Preservation', type: 'Cyber Crime', officer: 'Officer D', documents: 29, lastActivity: '2026-08-16T08:33:00', status: 'Active', risk: 'Medium', priority: 'High' },
  { id: 'C-1040', title: 'Vendor Invoice Trail', type: 'Fraud', officer: 'Officer A', documents: 18, lastActivity: '2026-08-15T14:02:00', status: 'Under Investigation', risk: 'Low', priority: 'Medium' },
  { id: 'C-1041', title: 'Evidence Room Audit', type: 'Investigation', officer: 'Officer B', documents: 22, lastActivity: '2026-08-14T10:55:00', status: 'Closed', risk: 'Low', priority: 'Low' },
  { id: 'C-1042', title: 'Device Recovery Record', type: 'Cyber Crime', officer: 'Officer C', documents: 14, lastActivity: '2026-08-13T17:20:00', status: 'Under Investigation', risk: 'Medium', priority: 'High' },
  { id: 'C-1043', title: 'Retail Loss Assessment', type: 'Theft', officer: 'Officer D', documents: 10, lastActivity: '2026-08-12T12:30:00', status: 'Active', risk: 'Low', priority: 'Medium' },
  { id: 'C-1044', title: 'Beneficiary Review', type: 'Fraud', officer: 'Officer A', documents: 25, lastActivity: '2026-08-11T09:41:00', status: 'Under Review', risk: 'High', priority: 'High' },
  { id: 'C-1045', title: 'Chain of Custody Check', type: 'Investigation', officer: 'Officer B', documents: 17, lastActivity: '2026-08-10T15:05:00', status: 'Active', risk: 'Low', priority: 'Low' },
  { id: 'C-1046', title: 'Credential Abuse Report', type: 'Cyber Crime', officer: 'Officer C', documents: 33, lastActivity: '2026-08-09T19:12:00', status: 'Under Investigation', risk: 'Medium', priority: 'High' },
  { id: 'C-1047', title: 'Stolen Goods Index', type: 'Theft', officer: 'Officer D', documents: 5, lastActivity: '2026-08-08T10:27:00', status: 'Archived', risk: 'Low', priority: 'Low' },
  { id: 'C-1048', title: 'Compliance Referral', type: 'Fraud', officer: 'Officer B', documents: 12, lastActivity: '2026-08-07T13:50:00', status: 'Closed', risk: 'Medium', priority: 'Medium' },
];

let cases = [...seedCases];
const authorizedOfficers: AuthorizedOfficer[] = [
  { name: 'Officer A', department: 'Investigation', active: true },
  { name: 'Officer B', department: 'Investigation', active: true },
  { name: 'Officer C', department: 'Cyber Crime', active: true },
  { name: 'Officer D', department: 'Financial Crime', active: true },
];
let caseAuditEvents: CaseAuditEvent[] = [];
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function canViewCase(item: CaseRecord, role: Role) {
  if (role === 'Admin' || role === 'Auditor') return true;
  if (role === 'Officer' || role === 'Clerk') return item.officer === 'Officer A';
  return item.officer === 'Officer A' || item.status === 'Under Review' || item.risk === 'High';
}

const API_BASE = '/api';

function mapApiCaseToRecord(apiCase: any): CaseRecord {
  const statusMap: Record<string, CaseStatus> = {
    Open: 'Active',
    'Under Investigation': 'Under Investigation',
    'Pending Review': 'Under Review',
    Closed: 'Closed',
  };
  const priorityMap: Record<string, CasePriority> = {
    Low: 'Low',
    Medium: 'Medium',
    High: 'High',
    Critical: 'High',
  };

  const id = apiCase.caseId || apiCase._id;
  const status: CaseStatus = statusMap[apiCase.status] || (apiCase.status as CaseStatus) || 'Active';
  const priority: CasePriority = priorityMap[apiCase.priority] || 'Medium';

  return {
    id,
    caseId: apiCase.caseId || id,
    title: apiCase.title,
    type: apiCase.caseType || 'General',
    officer: apiCase.assignedOfficer || 'Officer A',
    assignedOfficer: apiCase.assignedOfficer || 'Officer A',
    documents: apiCase.documentsCount ?? 0,
    activityCount: 0,
    lastActivity: apiCase.updatedAt || apiCase.createdAt || new Date().toISOString(),
    status,
    risk: priority,
    priority,
    description: apiCase.description || '',
    department: 'Investigation',
    startDate: (apiCase.createdAt ? String(apiCase.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10)),
    confidentiality: 'Confidential',
    createdAt: apiCase.createdAt,
    createdBy: apiCase.createdBy,
  };
}

export async function getCases(): Promise<CaseRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/cases`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const apiRecords = json.data.map(mapApiCaseToRecord);
        // Merge with existing cases so initial UI state stays rich
        const existingIds = new Set(apiRecords.map((r: CaseRecord) => r.caseId?.toLowerCase() || r.id.toLowerCase()));
        const remainingSeed = cases.filter((c) => !existingIds.has((c.caseId || c.id).toLowerCase()));
        return [...apiRecords, ...remainingSeed];
      }
    }
  } catch (err) {
    console.warn('Backend API getCases failed, using local store:', err);
  }
  return cases.map((item) => ({ ...item }));
}

export async function getCaseById(id: string): Promise<CaseRecord | undefined> {
  try {
    const res = await fetch(`${API_BASE}/cases/${id}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return mapApiCaseToRecord(json.data);
      }
    }
  } catch (err) {
    console.warn('Backend API getCaseById failed, using local store:', err);
  }
  const item = cases.find((candidate) => candidate.id === id || candidate.caseId === id);
  return item ? { ...item } : undefined;
}

export async function checkCaseIdExists(caseId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return true;
    }
  } catch {
    // Fallback to local
  }
  return cases.some((item) => item.id.toLowerCase() === caseId.trim().toLowerCase());
}

export function getNextCaseId(): string {
  const numbers = cases
    .map((item) => Number(item.id.replace(/^C-/i, '')))
    .filter((number) => Number.isFinite(number));
  return `C-${Math.max(0, ...numbers) + 1}`;
}

export function getOfficersByDepartment(department: string): AuthorizedOfficer[] {
  return authorizedOfficers
    .filter((officer) => officer.active && (department === 'Other' || officer.department === department))
    .map((officer) => ({ ...officer }));
}

export function getCaseAuditEvents(): CaseAuditEvent[] {
  return caseAuditEvents.map((event) => ({ ...event, metadata: { ...event.metadata } }));
}

export async function createCase(data: CaseCreateInput): Promise<CaseRecord> {
  const caseId = data.caseId || data.id;
  const createdAt = data.createdAt || new Date().toISOString();

  try {
    const statusApiMap: Record<string, string> = {
      Active: 'Open',
      'Under Investigation': 'Under Investigation',
      'Under Review': 'Pending Review',
      Closed: 'Closed',
      Archived: 'Closed',
    };

    const res = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId,
        title: data.title,
        description: data.description,
        caseType: data.type,
        status: statusApiMap[data.status] || 'Open',
        priority: data.priority,
        createdBy: data.createdBy,
        assignedOfficer: data.assignedOfficer,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const created = mapApiCaseToRecord(json.data);
        cases = [created, ...cases];
        return created;
      }
    }
  } catch (err) {
    console.warn('Backend API createCase failed, saving to local store:', err);
  }

  // Local fallback
  const created: CaseRecord = {
    id: data.id,
    caseId,
    title: data.title,
    type: data.type,
    description: data.description,
    department: data.department,
    assignedOfficer: data.assignedOfficer,
    officer: data.assignedOfficer,
    documents: data.documents ?? 0,
    lastActivity: data.lastActivity || createdAt,
    status: data.status,
    risk: data.risk || data.priority,
    priority: data.priority,
    startDate: data.startDate,
    confidentiality: data.confidentiality,
    createdAt,
    createdBy: data.createdBy,
  };
  cases = [created, ...cases];
  return { ...created };
}

export async function updateCase(id: string, data: Partial<Omit<CaseRecord, 'id'>>): Promise<CaseRecord> {
  try {
    const statusApiMap: Record<string, string> = {
      Active: 'Open',
      'Under Investigation': 'Under Investigation',
      'Under Review': 'Pending Review',
      Closed: 'Closed',
      Archived: 'Closed',
    };

    const body: Record<string, unknown> = {};
    if (data.title !== undefined) body.title = data.title;
    if (data.description !== undefined) body.description = data.description;
    if (data.type !== undefined) body.caseType = data.type;
    if (data.status !== undefined) body.status = statusApiMap[data.status] || data.status;
    if (data.priority !== undefined) body.priority = data.priority;
    if (data.assignedOfficer !== undefined) body.assignedOfficer = data.assignedOfficer;

    const res = await fetch(`${API_BASE}/cases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const updated = mapApiCaseToRecord(json.data);
        const index = cases.findIndex((item) => item.id === id || item.caseId === id);
        if (index >= 0) cases[index] = { ...cases[index], ...updated, ...data };
        return { ...cases[index] };
      }
    }
  } catch (err) {
    console.warn('Backend API updateCase failed, updating local store:', err);
  }

  const index = cases.findIndex((item) => item.id === id);
  if (index < 0) throw new Error('Case not found');
  cases[index] = { ...cases[index], ...data };
  return { ...cases[index] };
}

export async function archiveCase(id: string): Promise<CaseRecord> {
  return updateCase(id, { status: 'Archived' });
}

export function resetCaseStore() {
  cases = [...seedCases];
  caseAuditEvents = [];
}