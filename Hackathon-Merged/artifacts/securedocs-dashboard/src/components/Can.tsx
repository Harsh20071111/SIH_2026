import React, { type ReactNode } from 'react';
import { usePermissions, type FIRContext } from '../hooks/usePermissions';
import type { SecureDocsRole } from '../types/roles';

interface CanProps {
  do: string;
  role?: SecureDocsRole;
  on?: FIRContext;
  children: ReactNode;
  fallback?: ReactNode;
}

export const Can: React.FC<CanProps> = ({ do: action, role, on: context, children, fallback = null }) => {
  const { can } = usePermissions(role, context);

  if (can(action)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
