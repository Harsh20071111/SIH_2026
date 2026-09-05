export type ReviewStatus = 'Pending' | 'In Review' | 'Approved' | 'Rejected' | 'Changes Requested';
export type ReviewPriority = 'High' | 'Medium' | 'Low';

export type ReviewData = {
  id: string; // Internal review ID
  caseId: string;
  document: string;
  submittedBy: string;
  reviewer: string;
  version: string;
  priority: ReviewPriority;
  submittedDate: string; // ISO format or string representation like "04 Sep 2026"
  status: ReviewStatus;
};

export const mockReviews: ReviewData[] = [
  {
    id: 'RV-2048',
    caseId: 'C-1024',
    document: 'Evidence.pdf',
    submittedBy: 'Officer A',
    reviewer: 'Reviewer B',
    version: 'v3',
    priority: 'High',
    submittedDate: '04 Sep 2026',
    status: 'Pending',
  },
  {
    id: 'RV-2049',
    caseId: 'C-1025',
    document: 'Witness.pdf',
    submittedBy: 'Officer B',
    reviewer: 'Reviewer B',
    version: 'v2',
    priority: 'Medium',
    submittedDate: '04 Sep 2026',
    status: 'Pending',
  },
  {
    id: 'RV-2050',
    caseId: 'C-1026',
    document: 'FIR_Report.pdf',
    submittedBy: 'Officer C',
    reviewer: 'Reviewer C',
    version: 'v4',
    priority: 'High',
    submittedDate: '03 Sep 2026',
    status: 'In Review',
  },
  {
    id: 'RV-2051',
    caseId: 'C-1027',
    document: 'CCTV_Record.pdf',
    submittedBy: 'Officer A',
    reviewer: 'Reviewer B',
    version: 'v1',
    priority: 'Low',
    submittedDate: '03 Sep 2026',
    status: 'Pending',
  },
  {
    id: 'RV-2052',
    caseId: 'C-1028',
    document: 'Statement.pdf',
    submittedBy: 'Officer D',
    reviewer: 'Reviewer C',
    version: 'v2',
    priority: 'Medium',
    submittedDate: '02 Sep 2026',
    status: 'Changes Requested',
  },
];

/** Extended detail data for the /reviews/:id page */
export type ReviewDetailData = ReviewData & {
  documentType: string;
  fileSize: string;
  uploadDate: string;
  originalHash: string;
  currentHash: string;
  lastVerified: string;
  integrityStatus: 'Verified' | 'Failed';
};

/**
 * Look up a review by ID and return enriched detail data.
 * Falls back to a default entry when the ID is not found in mockReviews.
 */
export function getReviewById(id: string): ReviewDetailData {
  const base = mockReviews.find((r) => r.id === id) ?? mockReviews[0];

  // Per-review detail overrides (expandable as the dataset grows)
  const detailOverrides: Record<string, Partial<ReviewDetailData>> = {
    'RV-2048': {
      documentType: 'Evidence',
      fileSize: '2.4 MB',
      uploadDate: '04 Sep 2026',
      originalHash: 'A7F32C9D8E1B4A56F0D2C7E89B3A1D4F',
      currentHash: 'A7F32C9D8E1B4A56F0D2C7E89B3A1D4F',
      lastVerified: '04 Sep 2026',
      integrityStatus: 'Verified',
    },
    'RV-2049': {
      documentType: 'Witness Statement',
      fileSize: '1.8 MB',
      uploadDate: '04 Sep 2026',
      originalHash: 'B8E41D5F2C6A9037E1D4B8F5A2C7E390',
      currentHash: 'B8E41D5F2C6A9037E1D4B8F5A2C7E390',
      lastVerified: '04 Sep 2026',
      integrityStatus: 'Verified',
    },
    'RV-2050': {
      documentType: 'FIR Report',
      fileSize: '3.1 MB',
      uploadDate: '03 Sep 2026',
      originalHash: 'C9F52E6A3D7B0148F2E5C9A6B3D8F4A1',
      currentHash: 'C9F52E6A3D7B0148F2E5C9A6B3D8F4A1',
      lastVerified: '03 Sep 2026',
      integrityStatus: 'Verified',
    },
    'RV-2051': {
      documentType: 'CCTV Recording',
      fileSize: '15.7 MB',
      uploadDate: '03 Sep 2026',
      originalHash: 'D0A63F7B4E8C1259A3F6D0B7C4E9A5B2',
      currentHash: 'D0A63F7B4E8C1259A3F6D0B7C4E9A5B2',
      lastVerified: '03 Sep 2026',
      integrityStatus: 'Verified',
    },
    'RV-2052': {
      documentType: 'Witness Statement',
      fileSize: '1.2 MB',
      uploadDate: '02 Sep 2026',
      originalHash: 'E1B74A8C5F9D2360B4A7E1C8D5F0B6C3',
      currentHash: 'E1B74A8C5F9D2360B4A7E1C8D5F0B6C3',
      lastVerified: '02 Sep 2026',
      integrityStatus: 'Verified',
    },
  };

  const overrides = detailOverrides[base.id] ?? {};

  return {
    ...base,
    documentType: overrides.documentType ?? 'Document',
    fileSize: overrides.fileSize ?? '1.0 MB',
    uploadDate: overrides.uploadDate ?? base.submittedDate,
    originalHash: overrides.originalHash ?? 'N/A',
    currentHash: overrides.currentHash ?? 'N/A',
    lastVerified: overrides.lastVerified ?? base.submittedDate,
    integrityStatus: overrides.integrityStatus ?? 'Verified',
  };
}
