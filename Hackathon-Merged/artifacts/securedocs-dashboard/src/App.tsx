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
import { SecureDocsShell } from '@/components/securedocs-shell';
import type { Role } from '@/lib/mock-data';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  const [role, setRole] = useState<Role>('Admin');
  const [search, setSearch] = useState('');
  const shellRoutes = ['/dashboard', '/cases', '/documents', '/upload', '/reviews', '/security', '/integrity', '/audit-logs', '/reports', '/users', '/compliance', '/settings', '/notifications', '/profile'];
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
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
          {shellRoutes.filter((route) => !['/dashboard', '/cases', '/documents'].includes(route)).map((route) => <Route key={route} path={route} component={() => <ComingSoon title={route.slice(1).split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ')} />} />)}
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
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
