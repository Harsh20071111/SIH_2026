// @ts-expect-error documents.js is a JS file
import { documents as seedDocuments, filterOptions } from '../data/documents';

// In a real app, this would be an API call to the backend.
// We maintain a local mock state here to simulate persistence across component unmounts.
let mockDocuments = [...seedDocuments];

import { api } from './api';

export const documentService = {
  async getDocuments(filters: any = {}) {
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
    // Map _id to id if necessary, or just use documentId
    return docs.map((doc: any) => ({
      ...doc,
      id: doc.documentId || doc.id || doc._id,
    }));
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
    // Stats are now part of the dashboard endpoint
    const response = await api.get<any>('/dashboard');
    return {
      totalDocuments: response.stats.totalDocuments,
      pendingReview: response.stats.pendingReviews,
      integrityIssues: response.stats.integrityIssues,
      restrictedDocuments: 0, // Fallback if not specifically tracked
    };
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
