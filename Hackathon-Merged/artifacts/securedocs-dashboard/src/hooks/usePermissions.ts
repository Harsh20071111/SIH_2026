import { useAuth } from '@/context/auth-context';
import { ROLE_PERMISSIONS, type Permission, type SecureDocsRole } from '../types/roles';

export interface FIRContext {
  firNumber: string;
  draftedBy: string;
  assignedIOId?: string;
  policeStationId?: string;
  districtCode?: string;
  status?: string;
}

const VALID_ROLES: readonly SecureDocsRole[] = [
  'Admin',
  'Officer',
  'Legal Reviewer',
  'Clerk',
  'Auditor',
] as const;

export function usePermissions(activeRole?: SecureDocsRole, firContext?: FIRContext) {
  const { user } = useAuth();

  // Resolve role strictly from trusted profile (labels or prefs) without email inference
  let userRoleFromProfile: SecureDocsRole | undefined;
  if (user) {
    const rawRole = (user.labels && user.labels[0]) || (user.prefs as any)?.role;
    if (typeof rawRole === 'string' && VALID_ROLES.includes(rawRole as SecureDocsRole)) {
      userRoleFromProfile = rawRole as SecureDocsRole;
    }
  }

  // Fail closed: if activeRole is valid, use it; otherwise use trusted profile role.
  // Unknown or unavailable roles resolve to undefined (never defaulting to Admin).
  const candidateRole = activeRole || userRoleFromProfile;
  const resolvedRole: SecureDocsRole | undefined =
    candidateRole && VALID_ROLES.includes(candidateRole) ? candidateRole : undefined;

  // Unknown/unavailable role fails closed with empty permissions array
  const permissions: Permission[] = resolvedRole ? ROLE_PERMISSIONS[resolvedRole] || [] : [];

  const can = (action: Permission | string): boolean => {
    if (!resolvedRole) {
      return false; // Fail closed: unauthenticated or unknown role has no permissions
    }

    // 1. General permission check
    if (permissions.includes(action as Permission)) {
      // 2. Optional FIR object-level ABAC context check
      if (firContext && resolvedRole === 'Officer') {
        const userId = user?.$id;
        if (action === 'fir.edit' && firContext.status !== 'Draft') {
          return false;
        }
        if (action === 'fir.edit' && userId && firContext.draftedBy !== userId) {
          return false;
        }
      }
      return true;
    }

    return false;
  };

  return { can, role: resolvedRole };
}
