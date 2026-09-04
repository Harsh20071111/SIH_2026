import type { Role } from '@/lib/mock-data';
import type { CaseRecord } from '@/lib/case-service';

export type CaseDocument = {
  id: string;
  name: string;
  type: string;
  version: string;
  uploadedBy: string;
  date: string;
  status: 'Approved' | 'Pending Review' | 'Flagged';
  integrity: 'Verified' | 'Issue detected';
  hash: string;
};

export type CaseActivity = {
  id: string;
  timestamp: string;
  user: string;
  role: Role | 'System';
  action: string;
  document?: string;
  result: 'Success' | 'Verified' | 'Warning' | 'Blocked';
};

export type CaseReview = {
  id: string;
  documentId: string;
  document: string;
  reviewer: string;
  submitted: string;
  status: 'Pending' | 'Approved' | 'Flagged' | 'Rejected';
  comment?: string;
};

export type CaseIntegrity = {
  total: number;
  verified: number;
  issues: number;
  status: 'Verified' | 'Issue detected';
  documents: Array<{
    documentId: string;
    document: string;
    version: string;
    originalHash: string;
    currentHash: string;
    status: 'Verified' | 'Issue detected';
    lastVerified: string;
    verifiedBy: string;
  }>;
};

export type CaseSecurity = {
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  suspiciousActivities: number;
  blockedAttempts: number;
  unauthorizedAccess: number;
  factors: Array<{ label: string; score: number }>;
  alerts: Array<{
    id: string;
    type: 'High risk' | 'Warning' | 'Resolved';
    user: string;
    timestamp: string;
    reason: string;
    score: number;
    status: 'Open' | 'Monitoring' | 'Resolved';
  }>;
  trend: Array<{ day: string; score: number }>;
};

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const documentsByCase: Record<string, CaseDocument[]> = {
  'C-1024': [
    { id: 'doc-1024-evidence', name: 'Evidence.pdf', type: 'Evidence Record', version: 'v3', uploadedBy: 'Officer A', date: '2026-09-01', status: 'Approved', integrity: 'Verified', hash: 'A7F32C9D…19A2' },
    { id: 'doc-1024-fir', name: 'FIR.pdf', type: 'FIR', version: 'v1', uploadedBy: 'Officer A', date: '2026-09-01', status: 'Approved', integrity: 'Verified', hash: 'B18D44E1…7C0F' },
    { id: 'doc-1024-forensic', name: 'Forensic_Report.pdf', type: 'Forensic Report', version: 'v2', uploadedBy: 'Officer B', date: '2026-08-31', status: 'Pending Review', integrity: 'Issue detected', hash: 'D90E2BA4…5F11' },
    { id: 'doc-1024-statement', name: 'Witness_Statement.pdf', type: 'Witness Statement', version: 'v1', uploadedBy: 'Officer A', date: '2026-08-30', status: 'Approved', integrity: 'Verified', hash: '3FC199A0…D421' },
    { id: 'doc-1024-charge', name: 'Charge_Sheet.pdf', type: 'Court Filing', version: 'v1', uploadedBy: 'Officer A', date: '2026-08-29', status: 'Approved', integrity: 'Verified', hash: '4B2D0E11…9D8A' },
    { id: 'doc-1024-forensic-notes', name: 'Forensic_Notes.pdf', type: 'Forensic Report', version: 'v1', uploadedBy: 'Officer B', date: '2026-08-28', status: 'Approved', integrity: 'Verified', hash: 'C11A7F09…22E3' },
    { id: 'doc-1024-scene', name: 'Scene_Inventory.pdf', type: 'Evidence Record', version: 'v2', uploadedBy: 'Officer A', date: '2026-08-27', status: 'Approved', integrity: 'Verified', hash: 'E7A1C032…A991' },
    { id: 'doc-1024-witness-b', name: 'Witness_Statement_B.pdf', type: 'Witness Statement', version: 'v1', uploadedBy: 'Officer B', date: '2026-08-26', status: 'Approved', integrity: 'Verified', hash: '91F0D4A2…CE10' },
    { id: 'doc-1024-cctv', name: 'CCTV_Extract_Log.pdf', type: 'Evidence Record', version: 'v1', uploadedBy: 'Officer A', date: '2026-08-25', status: 'Approved', integrity: 'Verified', hash: 'A0BE81D4…3C71' },
    { id: 'doc-1024-seizure', name: 'Seizure_Memo.pdf', type: 'Evidence Record', version: 'v1', uploadedBy: 'Officer A', date: '2026-08-24', status: 'Approved', integrity: 'Verified', hash: '5D2C9E81…0AB4' },
    { id: 'doc-1024-lab', name: 'Lab_Receipt.pdf', type: 'Forensic Report', version: 'v1', uploadedBy: 'Officer B', date: '2026-08-23', status: 'Flagged', integrity: 'Verified', hash: 'F813AC22…D902' },
    { id: 'doc-1024-custody', name: 'Chain_of_Custody.pdf', type: 'Evidence Record', version: 'v2', uploadedBy: 'Officer A', date: '2026-08-22', status: 'Approved', integrity: 'Verified', hash: '0C12BDA8…EE31' },
  ],
};

const fallbackDocuments = (item: CaseRecord): CaseDocument[] =>
  Array.from({ length: Math.min(item.documents, 4) }, (_, index) => ({
    id: `${item.id.toLowerCase()}-document-${index + 1}`,
    name: index === 0 ? 'Case_Intake_Record.pdf' : `Evidence_Record_${index + 1}.pdf`,
    type: index === 0 ? 'Case Record' : 'Evidence Record',
    version: `v${Math.min(index + 1, 3)}`,
    uploadedBy: item.officer,
    date: item.lastActivity.slice(0, 10),
    status: index === 2 ? 'Pending Review' : 'Approved',
    integrity: 'Verified',
    hash: `${item.id.replace('-', '')}${index}A8D…${index}0F2C`,
  }));

const activityByCase: Record<string, CaseActivity[]> = {
  'C-1024': [
    { id: 'activity-1', timestamp: '2026-09-01T10:32:00', user: 'Officer A', role: 'Officer', action: 'Uploaded document', document: 'Evidence.pdf', result: 'Success' },
    { id: 'activity-2', timestamp: '2026-09-01T10:18:00', user: 'Reviewer B', role: 'Legal Reviewer', action: 'Viewed document', document: 'FIR.pdf', result: 'Success' },
    { id: 'activity-3', timestamp: '2026-09-01T09:45:00', user: 'Officer A', role: 'Officer', action: 'Updated case information', result: 'Success' },
    { id: 'activity-4', timestamp: '2026-09-01T09:30:00', user: 'Officer C', role: 'Officer', action: 'Attempted restricted document access', document: 'Forensic_Report.pdf', result: 'Blocked' },
    { id: 'activity-5', timestamp: '2026-09-01T09:12:00', user: 'Auditor A', role: 'Auditor', action: 'Verified document integrity', document: 'FIR.pdf', result: 'Verified' },
    { id: 'activity-6', timestamp: '2026-08-31T17:45:00', user: 'Officer A', role: 'Officer', action: 'Downloaded document', document: 'Forensic_Report.pdf', result: 'Warning' },
  ],
};

const reviewsByCase: Record<string, CaseReview[]> = {
  'C-1024': [
    { id: 'review-1', documentId: 'doc-1024-evidence', document: 'Evidence.pdf', reviewer: 'Reviewer B', submitted: '2026-09-01', status: 'Pending' },
    { id: 'review-2', documentId: 'doc-1024-forensic', document: 'Forensic_Report.pdf', reviewer: 'Reviewer B', submitted: '2026-08-31', status: 'Pending' },
    { id: 'review-3', documentId: 'doc-1024-fir', document: 'FIR.pdf', reviewer: 'Reviewer B', submitted: '2026-08-30', status: 'Approved' },
    { id: 'review-4', documentId: 'doc-1024-statement', document: 'Witness_Statement.pdf', reviewer: 'Reviewer B', submitted: '2026-08-29', status: 'Approved' },
    { id: 'review-5', documentId: 'doc-1024-charge', document: 'Charge_Sheet.pdf', reviewer: 'Reviewer B', submitted: '2026-08-29', status: 'Pending' },
    { id: 'review-6', documentId: 'doc-1024-forensic-notes', document: 'Forensic_Notes.pdf', reviewer: 'Reviewer B', submitted: '2026-08-28', status: 'Approved' },
    { id: 'review-7', documentId: 'doc-1024-scene', document: 'Scene_Inventory.pdf', reviewer: 'Reviewer B', submitted: '2026-08-27', status: 'Approved' },
    { id: 'review-8', documentId: 'doc-1024-witness-b', document: 'Witness_Statement_B.pdf', reviewer: 'Reviewer B', submitted: '2026-08-26', status: 'Approved' },
    { id: 'review-9', documentId: 'doc-1024-cctv', document: 'CCTV_Extract_Log.pdf', reviewer: 'Reviewer B', submitted: '2026-08-25', status: 'Approved' },
    { id: 'review-10', documentId: 'doc-1024-seizure', document: 'Seizure_Memo.pdf', reviewer: 'Reviewer B', submitted: '2026-08-24', status: 'Approved' },
    { id: 'review-11', documentId: 'doc-1024-lab', document: 'Lab_Receipt.pdf', reviewer: 'Reviewer B', submitted: '2026-08-23', status: 'Flagged' },
    { id: 'review-12', documentId: 'doc-1024-custody', document: 'Chain_of_Custody.pdf', reviewer: 'Reviewer B', submitted: '2026-08-22', status: 'Approved' },
  ],
};

const securityByCase: Record<string, CaseSecurity> = {
  'C-1024': {
    riskScore: 67,
    riskLevel: 'Medium',
    suspiciousActivities: 3,
    blockedAttempts: 2,
    unauthorizedAccess: 2,
    factors: [
      { label: 'Unusual access time', score: 15 },
      { label: 'Excessive downloads', score: 20 },
      { label: 'Restricted access attempt', score: 25 },
      { label: 'Multiple failed attempts', score: 10 },
    ],
    alerts: [
      { id: 'security-1', type: 'High risk', user: 'Officer C', timestamp: '2026-09-01T09:30:00', reason: 'Attempted to access a restricted document outside the assigned case team.', score: 25, status: 'Open' },
      { id: 'security-2', type: 'Warning', user: 'Officer A', timestamp: '2026-08-31T17:45:00', reason: 'Downloaded 8 documents within a 10 minute window.', score: 20, status: 'Monitoring' },
      { id: 'security-3', type: 'Resolved', user: 'Auditor A', timestamp: '2026-08-30T14:20:00', reason: 'Previous suspicious activity was reviewed and closed.', score: 12, status: 'Resolved' },
    ],
    trend: [
      { day: 'Mon', score: 42 }, { day: 'Tue', score: 48 }, { day: 'Wed', score: 44 },
      { day: 'Thu', score: 58 }, { day: 'Fri', score: 51 }, { day: 'Sat', score: 63 }, { day: 'Sun', score: 67 },
    ],
  },
};

function copy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function getCaseDocuments(id: string, item?: CaseRecord): Promise<CaseDocument[]> {
  await wait(55);
  return copy(documentsByCase[id] ?? (item ? fallbackDocuments(item) : []));
}

export async function getCaseActivities(id: string): Promise<CaseActivity[]> {
  await wait(65);
  return copy(activityByCase[id] ?? []);
}

export async function getCaseReviews(id: string, item?: CaseRecord): Promise<CaseReview[]> {
  await wait(50);
  if (reviewsByCase[id]) return copy(reviewsByCase[id]);
  const docs = await getCaseDocuments(id, item);
  return docs.slice(0, 3).map((document, index) => ({
    id: `${id}-review-${index}`,
    documentId: document.id,
    document: document.name,
    reviewer: 'Reviewer B',
    submitted: document.date,
    status: document.status === 'Pending Review' ? 'Pending' : 'Approved',
  }));
}

export async function getCaseIntegrity(id: string, item?: CaseRecord): Promise<CaseIntegrity> {
  await wait(70);
  const documents = await getCaseDocuments(id, item);
  const integrityDocuments = documents.map((document) => ({
    documentId: document.id,
    document: document.name,
    version: document.version,
    originalHash: document.hash,
    currentHash: document.integrity === 'Verified' ? document.hash : `${document.hash.slice(0, -4)}91B0`,
    status: document.integrity,
    lastVerified: document.date,
    verifiedBy: document.integrity === 'Verified' ? 'Auditor A' : 'System',
  }));
  const issues = integrityDocuments.filter((document) => document.status === 'Issue detected').length;
  return { total: item?.documents ?? integrityDocuments.length, verified: Math.max(0, (item?.documents ?? integrityDocuments.length) - issues), issues, status: issues ? 'Issue detected' : 'Verified', documents: integrityDocuments };
}

export async function getCaseSecurity(id: string): Promise<CaseSecurity> {
  await wait(75);
  return copy(securityByCase[id] ?? {
    riskScore: 24, riskLevel: 'Low', suspiciousActivities: 0, blockedAttempts: 0, unauthorizedAccess: 0,
    factors: [], alerts: [], trend: [{ day: 'Mon', score: 18 }, { day: 'Tue', score: 22 }, { day: 'Wed', score: 19 }, { day: 'Thu', score: 21 }, { day: 'Fri', score: 24 }, { day: 'Sat', score: 20 }, { day: 'Sun', score: 24 }],
  });
}

export async function updateCaseReview(caseId: string, reviewId: string, status: CaseReview['status']): Promise<CaseReview> {
  await wait(90);
  const reviews = reviewsByCase[caseId] ?? [];
  const review = reviews.find((candidate) => candidate.id === reviewId);
  if (!review) throw new Error('Review not found');
  review.status = status;
  return copy(review);
}

export async function addCaseReviewComment(caseId: string, reviewId: string, comment: string): Promise<CaseReview> {
  await wait(90);
  const reviews = reviewsByCase[caseId] ?? [];
  const review = reviews.find((candidate) => candidate.id === reviewId);
  if (!review) throw new Error('Review not found');
  review.comment = comment.trim();
  return copy(review);
}

export async function verifyCaseIntegrity(caseId: string, item?: CaseRecord): Promise<CaseIntegrity> {
  await wait(220);
  if (documentsByCase[caseId]) documentsByCase[caseId] = documentsByCase[caseId].map((document) => ({ ...document, integrity: 'Verified' }));
  return getCaseIntegrity(caseId, item);
}