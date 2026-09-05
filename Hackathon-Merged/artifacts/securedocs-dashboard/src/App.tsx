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
import Settings from '@/pages/settings';
import SecurityDashboard from '@/pages/security';
import AdminUsers from '@/pages/users';
import ReviewQueue from '@/pages/reviews';
import AuditLogs from '@/pages/audit-logs';
import AuditChainVerification from '@/pages/audit-chain-verify';
import IntegrityVerification from '@/pages/integrity';
import Reports from '@/pages/reports';
import ComplianceDashboard from '@/pages/compliance-dashboard';
import OneClickIntegrityReport from '@/pages/one-click-integrity-report';
import AccessDenied from '@/pages/access-denied';
import DocumentReview from '@/pages/document-review';
import Profile from '@/pages/profile';
import { SecureDocsShell } from '@/components/securedocs-shell';
import type { Role } from '@/lib/mock-data';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Login from '@/pages/login';
import ForgotPassword from '@/pages/forgot-password';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function AuthenticatedApp() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  
  // Set the role state based on the authenticated user's role, default to Officer if not found
  const role: Role = (user?.role as Role) || 'Officer';
  
  // Note: setRole is preserved for SecureDocsShell compatibility if it changes the UI mock state
  const setRole = (newRole: Role) => {
    // Usually this would update backend/user context, kept here for API compatibility with SecureDocsShell
  };
  
  const shellRoutes = ['/dashboard', '/cases', '/documents', '/upload', '/reviews', '/security', '/integrity', '/audit-logs', '/audit-logs/verify', '/reports', '/users', '/compliance', '/settings', '/notifications', '/profile'];
  
  return (
    <SecureDocsShell role={role} setRole={setRole} search={search} setSearch={setSearch}>
      <Switch>
        <Route path="/" component={() => <Dashboard search={search} />} />
        <Route path="/dashboard" component={() => <Dashboard search={search} />} />
        <Route path="/cases/new" component={() => <NewCase role={role} />} />
        <Route path="/cases/:id/timeline" component={() => <ComingSoon title="Case Timeline" />} />
        <Route path="/documents/:id" component={() => <ComingSoon title="Document workspace" />} />
        <Route path="/security/activity/:id" component={() => <ComingSoon title="Security activity analysis" />} />
        <Route path="/cases/:id/edit" component={() => <EditCase role={role} />} />
        <Route path="/cases/:id" component={() => <CaseDetail role={role} />} />
        <Route path="/cases" component={() => <Cases role={role} search={search} setSearch={setSearch} />} />
        <Route path="/documents" component={() => <AllDocuments />} />
        <Route path="/settings" component={() => <Settings />} />
        <Route path="/security" component={() => <SecurityDashboard />} />
        <Route path="/users" component={() => <AdminUsers />} />
        <Route path="/reviews/:id" component={({ params }) => <DocumentReview id={params?.id} />} />
        <Route path="/reviews" component={() => <DocumentReview id="C-1024" />} />
        <Route path="/compliance" component={() => <ComplianceDashboard />} />
        <Route path="/reports/integrity/:id" component={({ params }) => <OneClickIntegrityReport id={params?.id} />} />
        <Route path="/reports/integrity" component={() => <OneClickIntegrityReport id="C-1024" />} />
        <Route path="/audit-logs/verify" component={() => <AuditChainVerification />} />
        <Route path="/audit-logs" component={() => <AuditLogs />} />
        <Route path="/integrity" component={() => <IntegrityVerification />} />
        <Route path="/reports" component={() => <Reports />} />
        <Route path="/403" component={() => <AccessDenied />} />
        <Route path="/profile" component={() => <Profile />} />
        {shellRoutes.filter((route) => !['/dashboard', '/cases', '/documents', '/settings', '/security', '/users', '/reviews', '/audit-logs', '/audit-logs/verify', '/integrity', '/reports', '/compliance', '/403', '/profile'].includes(route)).map((route) => <Route key={route} path={route} component={() => <ComingSoon title={route.slice(1).split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ')} />} />)}
        <Route component={NotFound} />
      </Switch>
    </SecureDocsShell>
  );
}

function PublicAuditChainPage() {
  const [search, setSearch] = useState('');
  const role: Role = 'Auditor';
  const setRole = () => {};
  return (
    <SecureDocsShell role={role} setRole={setRole} search={search} setSearch={setSearch}>
      <AuditChainVerification />
    </SecureDocsShell>
  );
}

function PublicCompliancePage() {
  const [search, setSearch] = useState('');
  const role: Role = 'Auditor';
  const setRole = () => {};
  return (
    <SecureDocsShell role={role} setRole={setRole} search={search} setSearch={setSearch}>
      <ComplianceDashboard />
    </SecureDocsShell>
  );
}

function PublicReportsPage() {
  const [search, setSearch] = useState('');
  const role: Role = 'Auditor';
  const setRole = () => {};
  return (
    <SecureDocsShell role={role} setRole={setRole} search={search} setSearch={setSearch}>
      <Reports />
    </SecureDocsShell>
  );
}

function PublicIntegrityReportPage({ params }: { params?: { id?: string } }) {
  const [search, setSearch] = useState('');
  const role: Role = 'Auditor';
  const setRole = () => {};
  return (
    <SecureDocsShell role={role} setRole={setRole} search={search} setSearch={setSearch}>
      <OneClickIntegrityReport id={params?.id || 'C-1024'} />
    </SecureDocsShell>
  );
}

function PublicAccessDeniedPage() {
  const [search, setSearch] = useState('');
  const role: Role = 'Officer';
  const setRole = () => {};
  return (
    <SecureDocsShell role={role} setRole={setRole} search={search} setSearch={setSearch}>
      <AccessDenied />
    </SecureDocsShell>
  );
}

function PublicDocumentReviewPage({ params }: { params?: { id?: string } }) {
  const [search, setSearch] = useState('');
  const role: Role = 'Legal Reviewer';
  const setRole = () => {};
  return (
    <SecureDocsShell role={role} setRole={setRole} search={search} setSearch={setSearch}>
      <DocumentReview id={params?.id || 'C-1024'} />
    </SecureDocsShell>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/audit-logs/verify" component={PublicAuditChainPage} />
      <Route path="/compliance" component={PublicCompliancePage} />
      <Route path="/reports/integrity/:id" component={({ params }) => <PublicIntegrityReportPage params={params} />} />
      <Route path="/reports/integrity" component={() => <PublicIntegrityReportPage params={{ id: 'C-1024' }} />} />
      <Route path="/reports" component={PublicReportsPage} />
      <Route path="/403" component={PublicAccessDeniedPage} />
      <Route path="/reviews/:id" component={({ params }) => <PublicDocumentReviewPage params={params} />} />
      <Route path="/reviews" component={() => <PublicDocumentReviewPage params={{ id: 'C-1024' }} />} />
      <Route>
        <ProtectedRoute>
          <AuthenticatedApp />
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <RoutedErrorBoundary>
              <Router />
            </RoutedErrorBoundary>
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
