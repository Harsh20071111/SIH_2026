export type SecureDocsRole = 'Admin' | 'Officer' | 'Legal Reviewer' | 'Clerk' | 'Auditor';

export type Permission =
  | 'cases.view'
  | 'cases.create'
  | 'cases.update'
  | 'cases.delete'
  | 'documents.view'
  | 'documents.upload'
  | 'documents.update'
  | 'documents.delete'
  | 'documents.review'
  | 'audit.view'
  | 'security.view'
  | 'fir.view'
  | 'fir.create'
  | 'fir.edit'
  | 'fir.approve'
  | 'fir.assign'
  | 'fir.transfer'
  | 'evidence.view'
  | 'evidence.upload'
  | 'users.manage';

export const ROLE_PERMISSIONS: Record<SecureDocsRole, Permission[]> = {
  Admin: [
    'cases.view', 'cases.create', 'cases.update', 'cases.delete',
    'documents.view', 'documents.upload', 'documents.update', 'documents.delete', 'documents.review',
    'audit.view', 'security.view',
    'fir.view', 'fir.create', 'fir.edit', 'fir.approve', 'fir.assign', 'fir.transfer',
    'evidence.view', 'evidence.upload',
    'users.manage',
  ],
  Officer: [
    'cases.view', 'cases.create', 'cases.update',
    'documents.view', 'documents.upload', 'documents.update',
    'fir.view', 'fir.create', 'fir.edit',
    'evidence.view', 'evidence.upload',
  ],
  'Legal Reviewer': [
    'cases.view',
    'documents.view', 'documents.review',
    'fir.view',
    'evidence.view',
  ],
  Clerk: [
    'cases.view',
    'documents.view', 'documents.upload',
    'fir.view',
  ],
  Auditor: [
    'cases.view',
    'documents.view',
    'audit.view', 'security.view',
    'fir.view',
    'evidence.view',
  ],
};
