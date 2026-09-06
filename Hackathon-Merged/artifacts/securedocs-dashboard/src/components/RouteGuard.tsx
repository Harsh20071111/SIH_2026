import React, { useEffect, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { usePermissions, type FIRContext } from '../hooks/usePermissions';
import type { SecureDocsRole } from '../types/roles';

interface RouteGuardProps {
  do: string;
  role?: SecureDocsRole;
  on?: FIRContext;
  children: ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ do: action, role, on: context, children }) => {
  const [, setLocation] = useLocation();
  const { can } = usePermissions(role, context);

  const allowed = can(action);

  useEffect(() => {
    if (!allowed) {
      setLocation('/access-denied');
    }
  }, [allowed, setLocation]);

  if (allowed) {
    return <>{children}</>;
  }

  return null;
};
