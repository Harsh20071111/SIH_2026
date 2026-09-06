import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Dashboard, { ComingSoon } from '@/pages/dashboard';
import Cases from '@/pages/cases';
import CaseDetail from '@/pages/case-detail';
import NewCase from '@/pages/new-case';
import EditCase from '@/pages/edit-case';
import AllDocuments from '@/pages/AllDocuments';
import Login from '@/pages/login';

// Integrated Governance & Feature Pages
import AuditLogs from '@/pages/audit-logs';
import Security from '@/pages/security';
import IntegrityVerification from '@/pages/integrity';
import Reviews from '@/pages/reviews';
import Reports from '@/pages/reports';
import ComplianceDashboard from '@/pages/compliance-dashboard';
import UserManagement from '@/pages/users';
import Profile from '@/pages/profile';
import Settings from '@/pages/settings';
import AccessDenied from '@/pages/access-denied';
import ActivityAnalysis from '@/pages/activity-analysis';
import AuditChainVerify from '@/pages/audit-chain-verify';
import OneClickIntegrityReport from '@/pages/one-click-integrity-report';
import FIRManagement from '@/pages/fir';

import { SecureDocsShell } from '@/components/securedocs-shell';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { RouteGuard } from '@/components/RouteGuard';
import { roles, type Role } from '@/lib/mock-data';
import { ShieldCheck } from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background text-foreground p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="size-12 rounded-md bg-primary text-white grid place-items-center animate-pulse shadow-xs">
          <ShieldCheck size={26} strokeWidth={2.4} />
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
          Checking Appwrite Session...
        </div>
      </div>
    </div>
  );
}

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [location] = useLocation();

  // Resolve initial role safely from trusted user profile, defaulting to 'Officer' (never Admin)
  const [role, setRole] = useState<Role>(() => {
    const rawRole = (user?.labels && user.labels[0]) || (user?.prefs as any)?.role;
    if (typeof rawRole === 'string' && roles.includes(rawRole as Role)) {
      return rawRole as Role;
    }
    return 'Officer';
  });

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  // If user is at /login or is not authenticated, render Login page
  if (location === '/login' || !isAuthenticated) {
    return <Login />;
  }

  return (
    <RoutedErrorBoundary>
      <SecureDocsShell role={role} setRole={setRole} search={search} setSearch={setSearch}>
        <Switch>
          {/* Core Preserved Pages */}
          <Route path="/" component={() => <Dashboard search={search} />} />
          <Route path="/dashboard" component={() => <Dashboard search={search} />} />
          <Route path="/cases/new" component={() => <NewCase role={role} />} />
          <Route path="/cases/:id/edit" component={() => <EditCase role={role} />} />
          <Route path="/cases/:id" component={() => <CaseDetail role={role} />} />
          <Route path="/cases" component={() => <Cases role={role} search={search} setSearch={setSearch} />} />
          <Route path="/documents" component={() => <AllDocuments />} />

          {/* Integrated Operational & Evidence Pages */}
          <Route path="/fir" component={() => <FIRManagement role={role} />} />
          <Route path="/reviews" component={() => <Reviews role={role} />} />

          {/* Integrated Governance & Security Pages */}
          <Route
            path="/security"
            component={() => (
              <RouteGuard do="security.view" role={role}>
                <Security />
              </RouteGuard>
            )}
          />
          <Route
            path="/security/activity/:id"
            component={() => <ActivityAnalysis role={role} />}
          />
          <Route path="/integrity" component={() => <IntegrityVerification />} />
          <Route
            path="/audit-logs"
            component={() => (
              <RouteGuard do="audit.view" role={role}>
                <AuditLogs />
              </RouteGuard>
            )}
          />
          <Route path="/reports" component={() => <Reports />} />
          <Route path="/reports/integrity" component={() => <OneClickIntegrityReport />} />
          <Route path="/reports/audit-chain" component={() => <AuditChainVerify />} />
          <Route path="/reports/activity-analysis" component={() => <ActivityAnalysis />} />

          {/* Integrated Administration Pages */}
          <Route
            path="/users"
            component={() => (
              <RouteGuard do="users.manage" role={role}>
                <UserManagement />
              </RouteGuard>
            )}
          />
          <Route path="/compliance" component={() => <ComplianceDashboard />} />
          <Route path="/settings" component={() => <Settings />} />
          <Route path="/profile" component={() => <Profile />} />

          {/* Access Denied & Fallbacks */}
          <Route path="/access-denied" component={AccessDenied} />
          <Route path="/403" component={AccessDenied} />
          <Route path="/cases/:id/timeline" component={() => <ComingSoon title="Case Timeline" />} />
          <Route path="/documents/:id" component={() => <ComingSoon title="Document workspace" />} />
          <Route path="/upload" component={() => <ComingSoon title="Secure Document Upload" />} />
          <Route path="/notifications" component={() => <ComingSoon title="Notification Center" />} />

          <Route component={NotFound} />
        </Switch>
      </SecureDocsShell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
