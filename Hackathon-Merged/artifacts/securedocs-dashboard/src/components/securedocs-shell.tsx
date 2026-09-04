import { useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Bell, BriefcaseBusiness, ChartNoAxesCombined, Check, ChevronDown, ClipboardCheck,
  Files, History, LayoutDashboard, LockKeyhole, LogOut, Menu, PanelLeftClose,
  PanelLeftOpen, Search, Settings, ShieldCheck, UploadCloud, UserRound, Users, X,
} from 'lucide-react';
import { navGroups, roles, type Role } from '@/lib/mock-data';

const iconMap = {
  layout: LayoutDashboard, briefcase: BriefcaseBusiness, files: Files, clipboard: ClipboardCheck,
  lock: LockKeyhole, shield: ShieldCheck, history: History, chart: ChartNoAxesCombined,
  users: Users, check: Check, settings: Settings,
};

type ShellProps = { children: ReactNode; role: Role; setRole: (role: Role) => void; search: string; setSearch: (value: string) => void };

export function SecureDocsShell({ children, role, setRole, search, setSearch }: ShellProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const visibleGroups = useMemo(() => navGroups.map((group) => ({ label: group.label, items: group.items.filter((item) => !('adminOnly' in item) || !item.adminOnly || role === 'Admin') })).filter((group) => group.items.length), [role]);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {mobileOpen && <button data-testid="button-close-mobile-menu" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground shadow-xl transition-all duration-200 ${collapsed ? 'w-[76px]' : 'w-[252px]'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex h-[76px] items-center gap-3 border-b border-sidebar-border px-5">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_0_0_4px_rgba(112,220,229,.12)]"><ShieldCheck size={20} strokeWidth={2.5} /></div>
          {!collapsed && <div className="min-w-0"><div className="text-[15px] font-bold tracking-tight text-white">SecureDocs</div><div className="font-mono text-[9px] uppercase tracking-[.18em] text-sidebar-primary">Evidence command</div></div>}
          <button data-testid="button-collapse-sidebar" onClick={() => setCollapsed(!collapsed)} className="ml-auto hidden rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white md:block" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</button>
          <button data-testid="button-close-sidebar" onClick={() => setMobileOpen(false)} className="ml-auto rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white md:hidden" aria-label="Close sidebar"><X size={18} /></button>
        </div>
        {!collapsed && <div className="mx-4 mt-5 rounded-lg border border-sidebar-border bg-sidebar-accent/60 p-3"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-sidebar-primary"><span className="size-1.5 rounded-full bg-sidebar-primary" /> Secure environment</div><div className="mt-1 text-xs text-sidebar-foreground/60">Bengaluru region · v2.4.1</div></div>}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {visibleGroups.map((group) => <div key={group.label} className="mb-5"><div className={`mb-2 px-3 font-mono text-[9px] uppercase tracking-[.18em] text-sidebar-foreground/40 ${collapsed ? 'text-center' : ''}`}>{collapsed ? '···' : group.label}</div>{group.items.map((item) => { const Icon = iconMap[item.icon as keyof typeof iconMap]; const active = location === item.href; const badge = 'badge' in item ? item.badge : undefined; return <Link key={item.href} href={item.href} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${active ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white'} ${collapsed ? 'justify-center px-2' : ''}`} title={collapsed ? item.label : undefined}><Icon size={17} strokeWidth={active ? 2.4 : 1.8} /><span className={collapsed ? 'sr-only' : ''}>{item.label}</span>{badge && !collapsed && <span className={`ml-auto rounded px-1.5 py-0.5 font-mono text-[10px] ${active ? 'bg-black/10' : 'bg-sidebar-primary/15 text-sidebar-primary'}`}>{badge}</span>}</Link> })}</div>)}
        </nav>
        {!collapsed && <div className="border-t border-sidebar-border p-3 flex items-center justify-between"><Link href="/profile" data-testid="link-profile-sidebar" className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-sidebar-accent flex-1"><div className="grid size-8 place-items-center rounded-full bg-[#d8b68e] text-xs font-bold text-slate-800">AR</div><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold text-white">Ananya Rao</div><div className="truncate text-[10px] text-sidebar-foreground/55">{role}</div></div></Link><button onClick={() => window.dispatchEvent(new CustomEvent('logout'))} className="p-2.5 text-sidebar-foreground/60 hover:text-white rounded-lg hover:bg-sidebar-accent" title="Log out"><LogOut size={16} /></button></div>}
      </aside>

      <div className={`min-h-[100dvh] transition-[padding] duration-200 ${collapsed ? 'md:pl-[76px]' : 'md:pl-[252px]'}`}>
        <header className="sticky top-0 z-20 flex h-[76px] items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button data-testid="button-open-mobile-menu" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden" aria-label="Open menu"><Menu size={20} /></button>
          <div className="relative max-w-md flex-1"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input data-testid="input-global-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search cases, documents, activity..." className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10" /></div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative"><button data-testid="button-role-selector" onClick={() => setRoleOpen(!roleOpen)} className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted sm:flex"><span className="grid size-5 place-items-center rounded bg-secondary text-[9px] text-secondary-foreground">AR</span>{role}<ChevronDown size={13} className="text-muted-foreground" /></button>{roleOpen && <div className="absolute right-0 top-12 z-50 w-44 rounded-xl border border-border bg-popover p-1.5 shadow-lg">{roles.map((candidate) => <button data-testid={`button-role-${candidate.toLowerCase().replaceAll(' ', '-')}`} key={candidate} onClick={() => { setRole(candidate); setRoleOpen(false); }} className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-xs hover:bg-muted ${candidate === role ? 'font-bold text-primary' : ''}`}>{candidate}{candidate === role && <Check size={14} className="ml-auto" />}</button>)}</div>}</div>
            <div className="relative"><button data-testid="button-notifications" aria-label="Open notifications" onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative rounded-lg border border-border bg-card p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Bell size={17} /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-destructive" /></button>{notificationsOpen && <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-border bg-popover p-4 shadow-xl"><div className="flex items-center justify-between"><h3 className="text-sm font-bold">Notifications</h3><span className="font-mono text-[10px] text-destructive">4 unread</span></div><div className="mt-3 space-y-3">{['Suspicious access pattern detected','Evidence_v3.pdf needs integrity review','12 reviews due today'].map((notice, index) => <button data-testid={`button-notification-${index}`} key={notice} className="flex w-full gap-3 border-t border-border pt-3 text-left hover:bg-muted/50"><span className={`mt-1 size-2 shrink-0 rounded-full ${index === 0 ? 'bg-destructive' : index === 1 ? 'bg-amber-500' : 'bg-cyan-500'}`} /><span><span className="block text-xs font-semibold">{notice}</span><span className="mt-0.5 block text-[10px] text-muted-foreground">{index + 1} hour{index ? 's' : ''} ago</span></span></button>)}</div><Link href="/notifications" data-testid="link-all-notifications" className="mt-3 block border-t border-border pt-3 text-center text-xs font-bold text-primary hover:underline">View all notifications</Link></div>}</div>
            <Link href="/profile" data-testid="link-profile-header" className="grid size-9 place-items-center rounded-full bg-[#d8b68e] text-xs font-bold text-slate-800 ring-2 ring-card sm:hidden">AR</Link>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}