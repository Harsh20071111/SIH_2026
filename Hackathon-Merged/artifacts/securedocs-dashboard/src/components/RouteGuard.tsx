import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
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
  return <Navigate to="/403" replace />;
};
