import { useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Bell, BriefcaseBusiness, ChartNoAxesCombined, Check, ChevronDown, ClipboardCheck,
  Files, History, LayoutDashboard, LockKeyhole, LogOut, Menu, PanelLeftClose,
  PanelLeftOpen, Search, Settings, ShieldCheck, UploadCloud, UserRound, Users, X,
} from 'lucide-react';
import { navGroups, roles, type Role } from '@/lib/mock-data';
import { useAuth } from '@/hooks/use-auth';

const iconMap = {
  layout: LayoutDashboard, briefcase: BriefcaseBusiness, files: Files, clipboard: ClipboardCheck,
  lock: LockKeyhole, shield: ShieldCheck, history: History, chart: ChartNoAxesCombined,
  users: Users, check: Check, settings: Settings,
};

type ShellProps = { children: ReactNode; role: Role; setRole: (role: Role) => void; search: string; setSearch: (value: string) => void };

export function SecureDocsShell({ children, role, setRole, search, setSearch }: ShellProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const visibleGroups = useMemo(() => navGroups.map((group) => ({ label: group.label, items: group.items.filter((item) => !('adminOnly' in item) || !item.adminOnly || role === 'Admin') })).filter((group) => group.items.length), [role]);

  const userName = user?.name || (user?.email ? user.email.split('@')[0] : 'Officer User');
  const userInitials = userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'SD';
  const userEmail = user?.email || 'officer@agency.gov.in';

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/login');
    } catch (e) {
      console.error('Logout error:', e);
      setLocation('/login');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {mobileOpen && <button data-testid="button-close-mobile-menu" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground shadow-xl transition-all duration-200 ${collapsed ? 'w-[76px]' : 'w-[252px]'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex h-[76px] items-center gap-3 border-b border-sidebar-border px-5">
          <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-white shadow-xs"><ShieldCheck size={20} strokeWidth={2.4} /></div>
          {!collapsed && <div className="min-w-0"><div className="text-[15px] font-bold tracking-tight text-white">SecureDocs</div><div className="font-mono text-[9px] uppercase tracking-[.18em] text-slate-400">Evidence Command</div></div>}
          <button data-testid="button-collapse-sidebar" onClick={() => setCollapsed(!collapsed)} className="ml-auto hidden rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white md:block" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</button>
          <button data-testid="button-close-sidebar" onClick={() => setMobileOpen(false)} className="ml-auto rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white md:hidden" aria-label="Close sidebar"><X size={18} /></button>
        </div>
        {!collapsed && <div className="mx-3 mt-4 rounded-md border border-sidebar-border bg-sidebar-accent/40 p-3"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-emerald-400"><span className="size-1.5 rounded-full bg-emerald-400" /> Secure environment</div><div className="mt-1 text-xs text-sidebar-foreground/70">Protected network · v2.4.1</div></div>}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {visibleGroups.map((group) => <div key={group.label} className="mb-4"><div className={`mb-1.5 px-3 font-mono text-[9px] uppercase tracking-[.18em] text-sidebar-foreground/45 ${collapsed ? 'text-center' : ''}`}>{collapsed ? '···' : group.label}</div>{group.items.map((item) => { const Icon = iconMap[item.icon as keyof typeof iconMap]; const active = location === item.href; const badge = 'badge' in item ? item.badge : undefined; return <Link key={item.href} href={item.href} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${active ? 'bg-primary text-white shadow-xs font-semibold' : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-white'} ${collapsed ? 'justify-center px-2' : ''}`} title={collapsed ? item.label : undefined}><Icon size={16} strokeWidth={active ? 2.2 : 1.8} /><span className={collapsed ? 'sr-only' : ''}>{item.label}</span>{badge && !collapsed && <span className={`ml-auto rounded px-1.5 py-0.5 font-mono text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'}`}>{badge}</span>}</Link> })}</div>)}
        </nav>
        {!collapsed && (
          <div className="border-t border-sidebar-border p-3">
            <div className="flex items-center justify-between gap-2 rounded-md p-2 hover:bg-sidebar-accent">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-primary">{userInitials}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-white">{userName}</div>
                <div className="truncate text-[10px] text-sidebar-foreground/60">{user?.email || role}</div>
              </div>
              <button
                data-testid="button-logout"
                onClick={handleLogout}
                title="Sign out of Appwrite"
                className="rounded p-1.5 text-sidebar-foreground/60 hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        )}
      </aside>

      <div className={`min-h-[100dvh] transition-[padding] duration-200 ${collapsed ? 'md:pl-[76px]' : 'md:pl-[252px]'}`}>
        <header className="sticky top-0 z-20 flex h-[76px] items-center gap-3 border-b border-border bg-card px-4 sm:px-6 lg:px-8">
          <button data-testid="button-open-mobile-menu" onClick={() => setMobileOpen(true)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary md:hidden" aria-label="Open menu"><Menu size={20} /></button>
          <div className="relative max-w-md flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input data-testid="input-global-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search cases, documents, audit activity..." className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-4 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary" /></div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative"><button data-testid="button-role-selector" onClick={() => setRoleOpen(!roleOpen)} className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary sm:flex"><span className="grid size-5 place-items-center rounded bg-secondary text-[9px] text-primary font-bold">{userInitials}</span>{role}<ChevronDown size={13} className="text-muted-foreground" /></button>{roleOpen && <div className="absolute right-0 top-12 z-50 w-44 rounded-lg border border-border bg-popover p-1.5 shadow-md">{roles.map((candidate) => <button data-testid={`button-role-${candidate.toLowerCase().replaceAll(' ', '-')}`} key={candidate} onClick={() => { setRole(candidate); setRoleOpen(false); }} className={`flex w-full items-center rounded-md px-3 py-2 text-left text-xs hover:bg-secondary ${candidate === role ? 'font-bold text-primary' : ''}`}>{candidate}{candidate === role && <Check size={14} className="ml-auto" />}</button>)}</div>}</div>
            <div className="relative"><button data-testid="button-notifications" aria-label="Open notifications" onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative rounded-md border border-border bg-card p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"><Bell size={16} /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-destructive" /></button>{notificationsOpen && <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border border-border bg-popover p-4 shadow-lg"><div className="flex items-center justify-between"><h3 className="text-sm font-bold text-foreground">Notifications</h3><span className="font-mono text-[10px] text-destructive font-semibold">4 unread</span></div><div className="mt-3 space-y-3">{['Suspicious access pattern detected','Evidence_v3.pdf needs integrity review','12 reviews due today'].map((notice, index) => <button data-testid={`button-notification-${index}`} key={notice} className="flex w-full gap-3 border-t border-border pt-3 text-left hover:bg-secondary/60"><span className={`mt-1 size-2 shrink-0 rounded-full ${index === 0 ? 'bg-destructive' : index === 1 ? 'bg-amber-500' : 'bg-primary'}`} /><span><span className="block text-xs font-semibold text-foreground">{notice}</span><span className="mt-0.5 block text-[10px] text-muted-foreground">{index + 1} hour{index ? 's' : ''} ago</span></span></button>)}</div><Link href="/notifications" data-testid="link-all-notifications" className="mt-3 block border-t border-border pt-3 text-center text-xs font-bold text-primary hover:underline">View all notifications</Link></div>}</div>
            
            {/* User Profile & Logout Popover */}
            <div className="relative">
              <button
                data-testid="button-user-profile-menu"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
              >
                <span className="grid size-6 place-items-center rounded-full bg-secondary text-[10px] font-bold text-primary">{userInitials}</span>
                <span className="hidden sm:inline-block max-w-[120px] truncate">{userName}</span>
                <ChevronDown size={13} className="text-muted-foreground" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-border bg-popover p-2 shadow-lg animate-in fade-in duration-150">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <div className="text-xs font-bold truncate text-foreground">{userName}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{userEmail}</div>
                    <div className="mt-1 inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[9px] font-mono text-primary">
                      <span className="size-1 rounded-full bg-emerald-500" /> Appwrite Session
                    </div>
                  </div>
                  <button
                    data-testid="button-logout-header"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}