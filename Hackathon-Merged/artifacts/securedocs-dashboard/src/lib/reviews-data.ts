export type ReviewStatus = 'Pending' | 'In Review' | 'Approved' | 'Rejected' | 'Changes Requested';
export type ReviewPriority = 'High' | 'Medium' | 'Low';

export type ReviewData = {
  id: string;
  caseId: string;
  document: string;
  submittedBy: string;
  reviewer: string;
  version: string;
  priority: ReviewPriority;
  submittedDate: string;
  status: ReviewStatus;
};

export const mockReviews: ReviewData[] = [
  {
    id: 'RV-2048',
    caseId: 'CASE-2026-001',
    document: 'Evidence_Record_01.pdf',
    submittedBy: 'Officer Raj Patel',
    reviewer: 'Reviewer Sharma',
    version: 'v1',
    priority: 'High',
    submittedDate: '04 Sep 2026',
    status: 'Pending',
  },
  {
    id: 'RV-2049',
    caseId: 'CASE-2026-002',
    document: 'Witness_Statement_02.pdf',
    submittedBy: 'Officer Amit Shah',
    reviewer: 'Reviewer Sharma',
    version: 'v2',
    priority: 'Medium',
    submittedDate: '04 Sep 2026',
    status: 'Pending',
  },
  {
    id: 'RV-2050',
    caseId: 'CASE-2026-001',
    document: 'FIR_2026_001.pdf',
    submittedBy: 'Officer Raj Patel',
    reviewer: 'Legal Officer Verma',
    version: 'v1',
    priority: 'High',
    submittedDate: '03 Sep 2026',
    status: 'In Review',
  },
  {
    id: 'RV-2051',
    caseId: 'CASE-2026-002',
    document: 'Forensic_Analysis_01.pdf',
    submittedBy: 'Officer Amit Shah',
    reviewer: 'Reviewer Sharma',
    version: 'v1',
    priority: 'Low',
    submittedDate: '03 Sep 2026',
    status: 'Pending',
  },
  {
    id: 'RV-2052',
    caseId: 'CASE-2026-001',
    document: 'Court_Order_Notice.pdf',
    submittedBy: 'Officer Raj Patel',
    reviewer: 'Legal Officer Verma',
    version: 'v2',
    priority: 'Medium',
    submittedDate: '02 Sep 2026',
    status: 'Changes Requested',
  },
];

export type ReviewDetailData = ReviewData & {
  documentType: string;
  fileSize: string;
  uploadDate: string;
  originalHash: string;
  currentHash: string;
  lastVerified: string;
  integrityStatus: 'Verified' | 'Failed';
};

export function getReviewById(id: string): ReviewDetailData {
  const base = mockReviews.find((r) => r.id === id) ?? mockReviews[0];

  return {
    ...base,
    documentType: 'Evidence Record',
    fileSize: '2.4 MB',
    uploadDate: base.submittedDate,
    originalHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    currentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    lastVerified: base.submittedDate,
    integrityStatus: 'Verified',
  };
}
