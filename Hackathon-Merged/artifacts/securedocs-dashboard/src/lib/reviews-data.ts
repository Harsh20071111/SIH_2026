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

export const mockReviews: ReviewData[] = [];

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
 * Falls back to a safe default entry when the ID is not found.
 */
export function getReviewById(id: string): ReviewDetailData {
  const fallback: ReviewData = {
    id: id || 'RV-NONE',
    caseId: 'CASE-NONE',
    document: 'No Document',
    submittedBy: 'System',
    reviewer: 'Harsh_2007',
    version: 'v1',
    priority: 'Low',
    submittedDate: 'Today',
    status: 'Pending',
  };

  const base = mockReviews.find((r) => r.id === id) ?? fallback;

  return {
    ...base,
    documentType: 'Evidence Record',
    fileSize: '0 KB',
    uploadDate: base.submittedDate,
    originalHash: 'N/A',
    currentHash: 'N/A',
    lastVerified: base.submittedDate,
    integrityStatus: 'Verified',
  };
}
