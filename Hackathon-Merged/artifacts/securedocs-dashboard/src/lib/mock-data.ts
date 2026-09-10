export type Role = 'Admin' | 'Officer' | 'Legal Reviewer' | 'Clerk' | 'Auditor';

export const roles: Role[] = ['Admin', 'Officer', 'Legal Reviewer', 'Clerk', 'Auditor'];

export const stats = [
  { label: 'Total cases', value: '0', change: 'Live total', tone: 'blue', icon: 'briefcase' },
  { label: 'Total documents', value: '0', change: 'Live total', tone: 'cyan', icon: 'files' },
  { label: 'Pending reviews', value: '0', change: '0 pending', tone: 'amber', icon: 'clipboard' },
  { label: 'Integrity issues', value: '0', change: 'System clean', tone: 'red', icon: 'shield' },
  { label: 'Suspicious activities', value: '0', change: 'No alerts', tone: 'red', icon: 'activity' },
] as const;

export const documentTypes = [
  ['FIR / Police Reports', 0],
  ['Investigation Records', 0],
  ['Witness Statements', 0],
  ['Evidence Records', 0],
  ['Forensic Reports', 0],
  ['Court Filings', 0],
  ['Legal Notices', 0],
  ['Judgments', 0],
] as const;

export const caseStatuses = [
  ['Active', 0, 'bg-cyan-500'],
  ['Under Investigation', 0, 'bg-blue-700'],
  ['Under Review', 0, 'bg-amber-500'],
  ['Closed', 0, 'bg-emerald-500'],
  ['Archived', 0, 'bg-slate-400'],
] as const;

export const riskDistribution = [
  { label: 'Low', value: 0, color: '#2f9b72' },
  { label: 'Medium', value: 0, color: '#d49a28' },
  { label: 'High', value: 0, color: '#c94b4b' },
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

export const activities: Activity[] = [];

export type Alert = {
  id: string;
  severity: 'Critical' | 'High' | 'Medium';
  title: string;
  description: string;
  meta: string;
  score?: number;
  cta: string;
};

export const alerts: Alert[] = [];

export const documents: string[] = [];

export const quickActions = [
  { label: 'Upload document', sub: 'Add to a protected case', href: '/documents', icon: 'upload' },
  { label: 'Review queue', sub: 'Active review queue', href: '/reviews', icon: 'clipboard' },
  { label: 'Run integrity check', sub: 'Verify chain of custody', href: '/integrity', icon: 'scan' },
  { label: 'Export report', sub: 'Generate an audit-ready brief', href: '/reports', icon: 'download' },
];

export const systemStatus = [
  ['Document storage', 'Operational', '99.98% uptime'],
  ['Integrity monitoring', 'Operational', 'Last check 4 min ago'],
  ['Access control', 'Operational', 'Policy sync complete'],
  ['Audit logging', 'Operational', 'Capturing events'],
];

export type NavItem = {
  label: string;
  href: string;
  icon: string;
  roles?: Role[];
  adminOnly?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'layout', roles: ['Admin', 'Officer', 'Legal Reviewer', 'Clerk', 'Auditor'] },
      { label: 'Cases & Investigations', href: '/cases', icon: 'briefcase', roles: ['Admin', 'Officer', 'Legal Reviewer', 'Clerk', 'Auditor'] },
      { label: 'Document Repository', href: '/documents', icon: 'files', roles: ['Admin', 'Officer', 'Legal Reviewer', 'Clerk', 'Auditor'] },
      { label: 'Document Reviews', href: '/reviews', icon: 'clipboard', roles: ['Legal Reviewer', 'Admin', 'Officer', 'Clerk', 'Auditor'] },
      { label: 'Security & Access', href: '/security', icon: 'lock', roles: ['Admin', 'Auditor'] },
      { label: 'User Management', href: '/users', icon: 'users', roles: ['Admin'] },
    ],
  },
  {
    label: 'Controls & Audits',
    items: [
      { label: 'SHA-256 Integrity Verification', href: '/integrity', icon: 'shield', roles: ['Admin', 'Officer', 'Legal Reviewer', 'Auditor', 'Clerk'] },
      { label: 'Audit Logs', href: '/audit-logs', icon: 'history', roles: ['Admin', 'Auditor'] },
      { label: 'Audit Chain Verification', href: '/audit-logs/verify', icon: 'shield', roles: ['Admin', 'Auditor'] },
      { label: 'Compliance Dashboard', href: '/compliance', icon: 'check', roles: ['Admin', 'Auditor'] },
      { label: 'Reports & Analytics', href: '/reports', icon: 'chart', roles: ['Admin', 'Auditor', 'Officer', 'Legal Reviewer', 'Clerk'] },
      { label: 'One-Click Integrity Report', href: '/reports/integrity/C-1024', icon: 'clipboard', roles: ['Admin', 'Auditor', 'Officer', 'Legal Reviewer', 'Clerk'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Users & Roles', href: '/users', icon: 'users', roles: ['Admin'], adminOnly: true },
      { label: 'Compliance', href: '/compliance', icon: 'check', roles: ['Admin'], adminOnly: true },
      { label: 'System Settings', href: '/settings', icon: 'settings', roles: ['Admin'], adminOnly: true },
    ],
  },
];