import { useAuth } from '../context/AuthContext';

export interface FIRContext {
  firNumber: string;
  draftedBy: string;
  assignedIOId?: string;
  policeStationId: string;
  districtCode: string;
  status: string;
}

export function usePermissions(firContext?: FIRContext) {
  const { user } = useAuth();

  if (!user) {
    return { can: () => false };
  }

  const { role, id: userId, policeStationId, districtCode, forensicTokens } = user;

  const can = (action: string): boolean => {
    if (!firContext) {
      // General role-based checks without specific FIR context
      if (action === 'create_fir') return role === 'DutyOfficer';
      if (action === 'view_dashboard') return true;
      if (action === 'view_analytics') return role === 'SP' || role === 'SHO';
      return false;
    }

    // Object-level checks (ABAC)
    switch (role) {
      case 'DutyOfficer':
        if (action === 'edit_fir') return firContext.status === 'Draft' && firContext.draftedBy === userId;
        if (action === 'view_fir') return firContext.draftedBy === userId;
        return false;

      case 'IO':
        if (firContext.assignedIOId !== userId) return false;
        if (firContext.policeStationId !== policeStationId) return false;
        if (['view_fir', 'edit_fir', 'upload_evidence'].includes(action)) return true;
        return false;

      case 'SHO':
        if (firContext.policeStationId !== policeStationId) return false;
        if (['view_fir', 'assign_io', 'approve_chargesheet'].includes(action)) return true;
        return false;

      case 'SP':
        if (firContext.districtCode !== districtCode) return false;
        if (['view_fir', 'transfer_fir'].includes(action)) return true;
        return false;

      case 'ForensicExpert':
        if (!forensicTokens?.includes(firContext.firNumber)) return false;
        if (['upload_evidence', 'view_fir'].includes(action)) return true;
        return false;

      case 'Magistrate':
        if (['ChargeSheetApproved', 'CourtReferred', 'Closed'].includes(firContext.status)) {
          if (action === 'view_fir') return true;
        }
        return false;

      default:
        return false;
    }
  };

  return { can };
}
