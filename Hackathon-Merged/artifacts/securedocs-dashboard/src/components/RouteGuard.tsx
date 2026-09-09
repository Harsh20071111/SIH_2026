import React, { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { usePermissions, FIRContext } from '../hooks/usePermissions';

interface RouteGuardProps {
  do: string;
  on?: FIRContext;
  children: ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ do: action, on: context, children }) => {
  const { can } = usePermissions(context);

  if (can(action)) {
    return <>{children}</>;
  }

  // Redirect to the unauthorized access page (403)
  return <Redirect to="/403" replace />;
};
