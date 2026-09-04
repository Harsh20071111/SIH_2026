export type Role = 'Admin' | 'Officer' | 'Legal Reviewer' | 'Clerk' | 'Auditor';

export const roles: Role[] = ['Admin', 'Officer', 'Legal Reviewer', 'Clerk', 'Auditor'];

export const stats = [
  { label: 'Total cases', value: '128', change: '+8 this month', tone: 'blue', icon: 'briefcase' },
  { label: 'Total documents', value: '4,820', change: '+124 this month', tone: 'cyan', icon: 'files' },
  { label: 'Pending reviews', value: '43', change: '12 due today', tone: 'amber', icon: 'clipboard' },
  { label: 'Integrity issues', value: '3', change: 'Requires attention', tone: 'red', icon: 'shield' },
  { label: 'Suspicious activities', value: '11', change: '3 high risk', tone: 'red', icon: 'activity' },
] as const;

export const documentTypes = [
  ['FIR / Police Reports', 850],
  ['Investigation Records', 720],
  ['Witness Statements', 640],
  ['Evidence Records', 910],
  ['Forensic Reports', 430],
  ['Court Filings', 520],
  ['Legal Notices', 350],
  ['Judgments', 400],
] as const;

export const caseStatuses = [
  ['Active', 58, 'bg-cyan-500'],
  ['Under Investigation', 32, 'bg-blue-700'],
  ['Under Review', 18, 'bg-amber-500'],
  ['Closed', 15, 'bg-emerald-500'],
  ['Archived', 5, 'bg-slate-400'],
] as const;

export const riskDistribution = [
  { label: 'Low', value: 109, color: '#2f9b72' },
  { label: 'Medium', value: 14, color: '#d49a28' },
  { label: 'High', value: 5, color: '#c94b4b' },
];

export type Activity = {
  id: string;
  time: string;
  user: string;
  initials: string;
  action: string;
  document: string;
  caseId: string;
  status: 'Successful' | 'Verified' | 'Blocked';
};

export const activities: Activity[] = [
  { id: 'act-1', time: '10:32 AM', user: 'Officer A', initials: 'OA', action: 'Uploaded document', document: 'Evidence.pdf', caseId: 'C-1024', status: 'Successful' },
  { id: 'act-2', time: '10:18 AM', user: 'Reviewer B', initials: 'RB', action: 'Approved document', document: 'FIR.pdf', caseId: 'C-1024', status: 'Successful' },
  { id: 'act-3', time: '09:45 AM', user: 'Officer C', initials: 'OC', action: 'Viewed document', document: 'WitnessStatement.pdf', caseId: 'C-1025', status: 'Successful' },
  { id: 'act-4', time: '09:30 AM', user: 'Officer A', initials: 'OA', action: 'Downloaded document', document: 'ForensicReport.pdf', caseId: 'C-1024', status: 'Successful' },
  { id: 'act-5', time: '09:12 AM', user: 'Unknown / Officer C', initials: 'UC', action: 'Attempted restricted access', document: 'Restricted document', caseId: 'C-1026', status: 'Blocked' },
  { id: 'act-6', time: '08:55 AM', user: 'Auditor A', initials: 'AA', action: 'Verified document integrity', document: 'Evidence_Report.pdf', caseId: 'C-1023', status: 'Verified' },
];

export type Alert = {
  id: string;
  severity: 'Critical' | 'High' | 'Medium';
  title: string;
  description: string;
  meta: string;
  score?: number;
  cta: string;
};

export const alerts: Alert[] = [
  { id: 'alert-1', severity: 'Critical', title: 'Suspicious access pattern detected', description: 'Repeated access attempts from an unrecognized device were observed against the active case workspace.', meta: '9 minutes ago · 4 attempts · C-1024', score: 91, cta: 'Investigate activity' },
  { id: 'alert-2', severity: 'High', title: 'Document integrity issue', description: 'Hash mismatch detected on a version of Evidence_v3.pdf. Review the chain of custody before proceeding.', meta: '42 minutes ago · Evidence_v3.pdf · C-1024', cta: 'Review integrity' },
  { id: 'alert-3', severity: 'High', title: 'Unauthorized access attempt', description: 'A restricted legal filing was requested by a user outside the assigned case team.', meta: '1 hour ago · Legal Reviewer · C-1027', cta: 'View audit log' },
  { id: 'alert-4', severity: 'Medium', title: 'Excessive downloads', description: 'Download volume exceeded the normal threshold for one user during the last 24 hours.', meta: '3 hours ago · 34 downloads · Officer', score: 78, cta: 'Review downloads' },
];

export const documents = ['FIR_1024.pdf', 'Evidence_Report.pdf', 'Witness_Statement.pdf', 'Forensic_Report.pdf', 'Charge_Sheet.pdf', 'Court_Filing.pdf'];

export const quickActions = [
  { label: 'Upload document', sub: 'Add to a protected case', href: '/upload', icon: 'upload' },
  { label: 'Review queue', sub: '12 items due today', href: '/reviews', icon: 'clipboard' },
  { label: 'Run integrity check', sub: 'Verify chain of custody', href: '/integrity', icon: 'scan' },
  { label: 'Export report', sub: 'Generate an audit-ready brief', href: '/reports', icon: 'download' },
];

export const systemStatus = [
  ['Document storage', 'Operational', '99.98% uptime'],
  ['Integrity monitoring', 'Operational', 'Last check 4 min ago'],
  ['Access control', 'Operational', 'Policy sync complete'],
  ['Audit logging', 'Operational', 'Capturing events'],
];

export const navGroups = [
  {
    label: 'Workspace',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'layout' },
      { label: 'Cases', href: '/cases', icon: 'briefcase' },
      { label: 'Documents', href: '/documents', icon: 'files' },
      { label: 'Reviews', href: '/reviews', icon: 'clipboard', badge: '43' },
    ],
  },
  {
    label: 'Controls',
    items: [
      { label: 'Security', href: '/security', icon: 'lock', badge: '11' },
      { label: 'Integrity', href: '/integrity', icon: 'shield' },
      { label: 'Audit logs', href: '/audit-logs', icon: 'history' },
      { label: 'Reports', href: '/reports', icon: 'chart' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Users & roles', href: '/users', icon: 'users', adminOnly: true },
      { label: 'Compliance', href: '/compliance', icon: 'check', adminOnly: true },
      { label: 'Settings', href: '/settings', icon: 'settings', adminOnly: true },
    ],
  },
] as const;