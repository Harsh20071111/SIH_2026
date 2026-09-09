import { useMemo, useState, useEffect, useRef, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Bell, BriefcaseBusiness, ChartNoAxesCombined, Check, ChevronDown, ClipboardCheck,
  Files, History, LayoutDashboard, LockKeyhole, LogOut, Menu, PanelLeftClose,
  PanelLeftOpen, Search, Settings, ShieldCheck, UploadCloud, UserRound, Users, X,
} from 'lucide-react';
import { navGroups, type Role } from '@/lib/mock-data';
import { useAuth } from '@/context/AuthContext';

const iconMap = {
  layout: LayoutDashboard, briefcase: BriefcaseBusiness, files: Files, clipboard: ClipboardCheck,
  lock: LockKeyhole, shield: ShieldCheck, history: History, chart: ChartNoAxesCombined,
  users: Users, check: Check, settings: Settings,
};

type ShellProps = { children: ReactNode; role: Role; setRole: (role: Role) => void; search: string; setSearch: (value: string) => void };

export function SecureDocsShell({ children, role, setRole, search, setSearch }: ShellProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close notifications or profile dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    }

    if (notificationsOpen || profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [notificationsOpen, profileOpen]);

  const userDisplayName = user?.name || (role === 'Admin' ? 'Admin User' : `${role} User`);
  const userDisplayEmail = user?.email || `${role.toLowerCase().replace(/\s+/g, '.')}@securedocs.gov`;
  
  const userInitials = useMemo(() => {
    if (!userDisplayName) return 'U';
    const parts = userDisplayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return userDisplayName.substring(0, 2).toUpperCase();
  }, [userDisplayName]);

  const visibleGroups = useMemo(() => navGroups.map((group) => ({ label: group.label, items: group.items.filter((item) => !('adminOnly' in item) || !item.adminOnly || role === 'Admin') })).filter((group) => group.items.length), [role]);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {mobileOpen && <button data-testid="button-close-mobile-menu" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl transition-all duration-200 ${
          collapsed ? 'w-[76px]' : 'w-[280px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className={`flex h-[76px] items-center border-b border-sidebar-border ${collapsed ? 'justify-between px-3' : 'gap-3 px-5'}`}>
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_0_0_4px_rgba(112,220,229,.12)]">
            <ShieldCheck size={20} strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-bold tracking-tight text-white leading-snug">SecureDocs</div>
              <div className="font-mono text-[9px] uppercase tracking-[.18em] text-sidebar-primary leading-tight">Evidence command</div>
            </div>
          )}
          <button
            data-testid="button-collapse-sidebar"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto hidden rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white md:block shrink-0"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
          <button
            data-testid="button-close-sidebar"
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white md:hidden shrink-0"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>
        {!collapsed && (
          <div className="mx-4 mt-4 rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-3 shadow-inner">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-sidebar-primary">
              <span className="size-1.5 rounded-full bg-sidebar-primary animate-pulse" />
              <span>Secure environment</span>
            </div>
            <div className="mt-1 text-xs text-sidebar-foreground/65 font-medium">Bengaluru region · v2.4.1</div>
          </div>
        )}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden sidebar-nav-scroll px-3.5 py-4 space-y-6">
          {visibleGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div
                className={`mb-2 px-3 font-mono text-[9px] font-bold uppercase tracking-[.18em] text-sidebar-foreground/45 ${
                  collapsed ? 'text-center' : ''
                }`}
              >
                {collapsed ? '···' : group.label}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon as keyof typeof iconMap];
                  const active =
                    location === item.href ||
                    (item.href.includes('/reports/integrity') && location.includes('/reports/integrity')) ||
                    (item.href.startsWith('/reviews') && location.startsWith('/reviews'));
                  const badge = 'badge' in item ? item.badge : undefined;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}
                      onClick={() => setMobileOpen(false)}
                      className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                        active
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm font-semibold'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white'
                      } ${collapsed ? 'justify-center px-2' : ''}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={18} className="shrink-0" strokeWidth={active ? 2.3 : 1.8} />
                      {!collapsed && (
                        <span className="flex-1 truncate text-left tracking-normal">
                          {item.label}
                        </span>
                      )}
                      {badge && !collapsed && (
                        <span
                          className={`ml-auto flex shrink-0 items-center justify-center rounded-full px-2 py-0.5 font-mono text-[10px] font-bold leading-none ${
                            active
                              ? 'bg-black/20 text-sidebar-primary-foreground'
                              : 'bg-sidebar-primary/15 text-sidebar-primary group-hover:bg-sidebar-primary/25'
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        {!collapsed && (
          <div className="border-t border-sidebar-border p-3.5 flex items-center justify-between gap-2">
            <Link
              href="/profile"
              data-testid="link-profile-sidebar"
              className="flex items-center gap-3 rounded-xl p-2 hover:bg-sidebar-accent flex-1 min-w-0 transition-colors"
            >
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-white">{userDisplayName}</div>
                <div className="truncate text-[10px] text-sidebar-foreground/55">{role}</div>
              </div>
            </Link>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('logout'))}
              className="p-2 text-sidebar-foreground/60 hover:text-white rounded-lg hover:bg-sidebar-accent shrink-0 transition-colors"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>

      <div className={`min-h-[100dvh] transition-[padding] duration-200 ${collapsed ? 'md:pl-[76px]' : 'md:pl-[280px]'}`}>
        <header className="sticky top-0 z-20 flex h-[76px] items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button data-testid="button-open-mobile-menu" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden" aria-label="Open menu"><Menu size={20} /></button>
          {location === '/compliance' && (
            <div className="hidden md:flex items-center gap-2 border-r border-border pr-4 mr-1">
              <span className="text-sm font-bold tracking-tight text-foreground">Compliance Readiness Dashboard</span>
            </div>
          )}
          {location === '/reports' && (
            <div className="hidden md:flex items-center gap-2 border-r border-border pr-4 mr-1">
              <span className="text-sm font-bold tracking-tight text-foreground">Integrity & Security Reports</span>
            </div>
          )}
          {location.startsWith('/reports/integrity') && (
            <div className="hidden md:flex items-center gap-2 border-r border-border pr-4 mr-1">
              <span className="text-sm font-bold tracking-tight text-foreground">One-Click Integrity Report</span>
            </div>
          )}
          {location === '/403' && (
            <div className="hidden md:flex items-center gap-2 border-r border-border pr-4 mr-1">
              <span className="text-sm font-bold tracking-tight text-foreground">Access Denied</span>
            </div>
          )}
          {location.startsWith('/reviews') && (
            <div className="hidden md:flex items-center gap-2 border-r border-border pr-4 mr-1">
              <span className="text-sm font-bold tracking-tight text-foreground">Document Review</span>
            </div>
          )}
          <div className="relative max-w-md flex-1"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input data-testid="input-global-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search cases, documents, activity..." className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10" /></div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-50 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>STATUS: SECURE · 94% READINESS</span>
            </div>
            <div ref={profileRef} className="relative">
              <button 
                data-testid="button-user-profile-menu" 
                onClick={() => setProfileOpen(!profileOpen)} 
                className="hidden items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted sm:flex"
              >
                <span className="grid size-5 place-items-center rounded bg-blue-600 text-[9px] font-bold text-white">
                  {userInitials}
                </span>
                <span>{userDisplayName}</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {role}
                </span>
                <ChevronDown size={13} className="text-muted-foreground" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-border bg-popover p-2 shadow-lg">
                  <div className="border-b border-border px-3 py-2">
                    <p className="text-xs font-bold text-foreground">{userDisplayName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{userDisplayEmail}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-medium text-muted-foreground">Active · {role}</span>
                    </div>
                  </div>
                  <div className="pt-1.5 space-y-1">
                    <Link 
                      href="/profile" 
                      onClick={() => setProfileOpen(false)} 
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      <UserRound size={14} className="text-muted-foreground" />
                      <span>My Profile</span>
                    </Link>
                    <button 
                      onClick={() => { 
                        setProfileOpen(false); 
                        window.dispatchEvent(new CustomEvent('logout')); 
                      }} 
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      <LogOut size={14} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div ref={notificationsRef} className="relative">
              <button 
                data-testid="button-notifications" 
                aria-label="Open notifications" 
                onClick={() => setNotificationsOpen(!notificationsOpen)} 
                className="relative rounded-lg border border-border bg-card p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Bell size={17} />
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-destructive" />
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-border bg-popover p-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">Notifications</h3>
                    <span className="font-mono text-[10px] text-destructive">4 unread</span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {['Suspicious access pattern detected','Evidence_v3.pdf needs integrity review','12 reviews due today'].map((notice, index) => (
                      <button 
                        data-testid={`button-notification-${index}`} 
                        key={notice} 
                        onClick={() => setNotificationsOpen(false)}
                        className="flex w-full gap-3 border-t border-border pt-3 text-left hover:bg-muted/50"
                      >
                        <span className={`mt-1 size-2 shrink-0 rounded-full ${index === 0 ? 'bg-destructive' : index === 1 ? 'bg-amber-500' : 'bg-cyan-500'}`} />
                        <span>
                          <span className="block text-xs font-semibold">{notice}</span>
                          <span className="mt-0.5 block text-[10px] text-muted-foreground">{index + 1} hour{index ? 's' : ''} ago</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <Link 
                    href="/notifications" 
                    data-testid="link-all-notifications" 
                    onClick={() => setNotificationsOpen(false)}
                    className="mt-3 block border-t border-border pt-3 text-center text-xs font-bold text-primary hover:underline"
                  >
                    View all notifications
                  </Link>
                </div>
              )}
            </div>
            <Link href="/profile" data-testid="link-profile-header" className="grid size-9 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white ring-2 ring-card sm:hidden">{userInitials}</Link>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}