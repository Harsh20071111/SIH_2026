import React, { ReactNode } from 'react';
import { usePermissions, FIRContext } from '../hooks/usePermissions';

interface CanProps {
  do: string;
  on?: FIRContext;
  children: ReactNode;
  fallback?: ReactNode;
}

export const Can: React.FC<CanProps> = ({ do: action, on: context, children, fallback = null }) => {
  const { can } = usePermissions(context);

  if (can(action)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
