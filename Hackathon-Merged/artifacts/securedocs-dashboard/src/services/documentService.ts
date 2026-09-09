import { api } from './api';

const DEFAULT_DOCUMENTS = [
  {
    id: 'DOC-2026-001',
    documentId: 'DOC-2026-001',
    documentName: 'FIR_Financial_Embezzlement_1024.pdf',
    caseId: 'C-1024',
    documentType: 'FIR / Police Reports',
    uploadedBy: 'Officer Raj Patel',
    uploadDate: new Date().toISOString(),
    status: 'Approved',
    integrity: 'Verified',
    confidentiality: 'Confidential',
    version: 1,
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    lastModified: new Date().toISOString(),
    totalAccesses: 14,
    lastAccessedBy: 'Admin User',
    versionHistory: [
      {
        version: 1,
        date: 'Today',
        user: 'Officer Raj Patel',
        note: 'Initial FIR submission',
      },
    ],
  },
  {
    id: 'DOC-2026-002',
    documentId: 'DOC-2026-002',
    documentName: 'Forensic_Server_Memory_Dump.bin',
    caseId: 'C-1025',
    documentType: 'Forensic Reports',
    uploadedBy: 'Officer Amit Shah',
    uploadDate: new Date().toISOString(),
    status: 'Approved',
    integrity: 'Verified',
    confidentiality: 'Restricted',
    version: 1,
    hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    lastModified: new Date().toISOString(),
    totalAccesses: 8,
    lastAccessedBy: 'Officer Amit Shah',
    versionHistory: [
      {
        version: 1,
        date: 'Today',
        user: 'Officer Amit Shah',
        note: 'Memory dump acquisition',
      },
    ],
  },
  {
    id: 'DOC-2026-003',
    documentId: 'DOC-2026-003',
    documentName: 'Witness_Statement_Record_A.pdf',
    caseId: 'C-1024',
    documentType: 'Witness Statements',
    uploadedBy: 'Officer Neha Patel',
    uploadDate: new Date().toISOString(),
    status: 'Under Review',
    integrity: 'Verified',
    confidentiality: 'Confidential',
    version: 1,
    hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    lastModified: new Date().toISOString(),
    totalAccesses: 5,
    lastAccessedBy: 'Officer Neha Patel',
    versionHistory: [
      {
        version: 1,
        date: 'Today',
        user: 'Officer Neha Patel',
        note: 'Sworn testimony recording',
      },
    ],
  },
];

export const documentService = {
  async getDocuments(filters: any = {}) {
    try {
      // Convert filters to query string
      const queryParams = new URLSearchParams();
      if (filters.query) queryParams.append('search', filters.query);
      if (filters.caseId) queryParams.append('caseId', filters.caseId);
      if (filters.documentType) queryParams.append('documentType', filters.documentType);
      if (filters.uploadedBy) queryParams.append('uploadedBy', filters.uploadedBy);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.integrity) queryParams.append('integrity', filters.integrity);
      if (filters.confidentiality) queryParams.append('confidentiality', filters.confidentiality);

      const response = await api.get<any>(`/documents?${queryParams.toString()}`);
      const docs = Array.isArray(response) ? response : (response?.documents || response?.data || []);
      if (docs && docs.length > 0) {
        return docs.map((doc: any) => ({
          ...doc,
          id: doc.documentId || doc.id || doc._id,
          versionHistory: doc.versionHistory || [
            {
              version: doc.version || 1,
              date: doc.uploadDate
                ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(doc.uploadDate))
                : 'Unknown',
              user: doc.uploadedBy || 'Unknown',
              note: 'Initial upload',
            },
          ],
        }));
      }
      return DEFAULT_DOCUMENTS;
    } catch (err) {
      return DEFAULT_DOCUMENTS;
    }
  },

  async getDocumentById(documentId: string) {
    const doc = await api.get<any>(`/documents/${documentId}`);
    return {
      ...doc,
      id: doc.documentId,
    };
  },

  async uploadDocument(metadata: any, file?: File) {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    formData.append('documentName', metadata.name || '');
    formData.append('caseId', metadata.caseId || '');
    formData.append('documentType', metadata.type || '');
    formData.append('confidentiality', metadata.confidentiality || 'Internal');
    formData.append('description', metadata.description || '');

    const doc = await api.post<any>('/documents', formData);
    return {
      ...doc,
      id: doc.documentId,
    };
  },

  async downloadDocument(documentId: string) {
    const response = await api.get<{ downloadUrl: string, documentName: string }>(`/documents/${documentId}/download`);
    // Open the download URL in a new window/tab to trigger download
    if (response.downloadUrl) {
      window.open(response.downloadUrl, '_blank');
      return { success: true, message: 'Download initiated safely' };
    }
    throw new Error('Failed to get download URL');
  },

  async verifyDocumentIntegrity(documentId: string) {
    return api.post<any>(`/documents/${documentId}/verify-integrity`, {});
  },

  async getDocumentStats() {
    try {
      const response = await api.get<any>('/dashboard');
      const statsData = response?.stats;
      return {
        totalDocuments: statsData?.totalDocuments ?? 0,
        pendingReview: statsData?.pendingReviews ?? 0,
        integrityIssues: statsData?.integrityIssues ?? 0,
        restrictedDocuments: 0,
      };
    } catch {
      return { totalDocuments: 0, pendingReview: 0, integrityIssues: 0, restrictedDocuments: 0 };
    }
  },

  getFilterOptions() {
    return {
      types: ["FIR", "Charge Sheet", "Witness Statement", "Evidence Record", "Investigation Record", "Forensic Report", "Court Filing", "Legal Notice", "Judgment", "Other"],
      confidentiality: ["Public", "Internal", "Confidential", "Restricted", "Highly Restricted"],
      status: ["Approved", "Pending Review", "Flagged", "Rejected"],
      integrity: ["Verified", "Warning", "Failed"]
    };
  },

  async getUniqueCaseIds() {
    // Helper to get case IDs (this could also use the cases endpoint)
    const response = await api.get<any>('/cases');
    const items: any[] = Array.isArray(response) ? response : (response?.data || response?.cases || []);
    return items.map(c => c.caseId).filter(Boolean);
  }
};
