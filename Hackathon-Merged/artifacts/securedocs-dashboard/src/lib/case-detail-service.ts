import type { Role } from '@/lib/mock-data';
import type { CaseRecord } from '@/lib/case-service';
import { api } from '../services/api';

export type CaseDocument = {
  id: string;
  name: string;
  type: string;
  version: string;
  uploadedBy: string;
  date: string;
  status: 'Approved' | 'Pending Review' | 'Flagged' | 'Rejected';
  integrity: 'Verified' | 'Warning' | 'Failed';
  hash: string;
};

export type CaseActivity = {
  id: string;
  timestamp: string;
  user: string;
  role: Role | 'System';
  action: string;
  document?: string;
  result: 'Success' | 'Verified' | 'Warning' | 'Blocked' | 'Failed';
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

export async function getCaseDocuments(id: string, item?: CaseRecord): Promise<CaseDocument[]> {
  try {
    const res = await api.get<{ data: any[] }>(`/documents?caseId=${id}`);
    return res.data.map(doc => ({
      id: doc.documentId,
      name: doc.documentName,
      type: doc.documentType,
      version: `v${doc.version}`,
      uploadedBy: doc.uploadedBy,
      date: new Date(doc.uploadDate).toISOString().split('T')[0],
      status: doc.status,
      integrity: doc.integrity,
      hash: doc.hash.substring(0, 16) + '...'
    }));
  } catch (e) {
    return [];
  }
}

export async function getCaseActivities(id: string): Promise<CaseActivity[]> {
  try {
    const res = await api.get<any>(`/audit?caseId=${id}`);
    const items: any[] = Array.isArray(res) ? res : (res?.data || res?.events || res?.audit || []);
    return items.map(log => ({
      id: log._id,
      timestamp: log.timestamp || new Date().toISOString(),
      user: log.userName || 'System',
      role: log.userRole || 'Automated',
      action: log.action || 'UNKNOWN',
      document: log.metadata?.documentName || log.documentId,
      result: log.result || 'Info'
    }));
  } catch (e) {
    return [];
  }
}

export async function getCaseReviews(id: string, item?: CaseRecord): Promise<CaseReview[]> {
  try {
    const res = await api.get<{ data: any[] }>(`/reviews?caseId=${id}`);
    return res.data.map(rev => ({
      id: rev._id,
      documentId: rev.documentId,
      document: rev.documentName,
      reviewer: rev.reviewer || 'Unassigned',
      submitted: new Date(rev.submittedDate).toISOString().split('T')[0],
      status: rev.status,
      comment: rev.comment
    }));
  } catch (e) {
    return [];
  }
}

export async function getCaseIntegrity(id: string, item?: CaseRecord): Promise<CaseIntegrity> {
  const documents = await getCaseDocuments(id, item);
  
  const integrityDocs = documents.map(doc => ({
    documentId: doc.id,
    document: doc.name,
    version: doc.version,
    originalHash: doc.hash,
    currentHash: doc.integrity === 'Verified' ? doc.hash : 'hash-mismatch...',
    status: doc.integrity === 'Verified' ? 'Verified' as const : 'Issue detected' as const,
    lastVerified: doc.date,
    verifiedBy: doc.integrity === 'Verified' ? 'System' : 'System'
  }));
  
  const issues = integrityDocs.filter(d => d.status === 'Issue detected').length;
  
  return {
    total: documents.length,
    verified: documents.length - issues,
    issues,
    status: issues > 0 ? 'Issue detected' : 'Verified',
    documents: integrityDocs
  };
}

export async function getCaseSecurity(id: string): Promise<CaseSecurity> {
  // In a real implementation, we'd fetch specific case security stats
  // For now, return a placeholder based on our actual risk levels
  return {
    riskScore: 24, riskLevel: 'Low', suspiciousActivities: 0, blockedAttempts: 0, unauthorizedAccess: 0,
    factors: [], alerts: [], trend: [{ day: 'Mon', score: 18 }, { day: 'Tue', score: 22 }, { day: 'Wed', score: 19 }, { day: 'Thu', score: 21 }, { day: 'Fri', score: 24 }, { day: 'Sat', score: 20 }, { day: 'Sun', score: 24 }],
  };
}

export async function updateCaseReview(caseId: string, reviewId: string, status: CaseReview['status']): Promise<CaseReview> {
  const updated = await api.patch<any>(`/reviews/${reviewId}`, { status });
  return {
    id: updated._id,
    documentId: updated.documentId,
    document: updated.documentName,
    reviewer: updated.reviewer || 'Unassigned',
    submitted: new Date(updated.submittedDate).toISOString().split('T')[0],
    status: updated.status,
    comment: updated.comment
  };
}

export async function addCaseReviewComment(caseId: string, reviewId: string, comment: string): Promise<CaseReview> {
  const updated = await api.patch<any>(`/reviews/${reviewId}`, { comment });
  return {
    id: updated._id,
    documentId: updated.documentId,
    document: updated.documentName,
    reviewer: updated.reviewer || 'Unassigned',
    submitted: new Date(updated.submittedDate).toISOString().split('T')[0],
    status: updated.status,
    comment: updated.comment
  };
}

export async function verifyCaseIntegrity(caseId: string, item?: CaseRecord): Promise<CaseIntegrity> {
  const docs = await getCaseDocuments(caseId);
  // Verify all documents in the case
  await Promise.all(docs.map(d => api.post(`/documents/${d.id}/verify-integrity`, {})));
  
  return getCaseIntegrity(caseId, item);
}