import { useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import {
  BriefcaseBusiness, ClipboardCheck, Files, History, LayoutDashboard,
  LockKeyhole, LogOut, PanelLeftClose, PanelLeftOpen, ShieldCheck, Settings, Users, Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const iconMap = {
  layout: LayoutDashboard, briefcase: BriefcaseBusiness, files: Files, clipboard: ClipboardCheck,
  lock: LockKeyhole, shield: ShieldCheck, history: History, users: Users, check: Check, settings: Settings,
};

type DynamicSidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  setCollapsed: (v: boolean) => void;
  setMobileOpen: (v: boolean) => void;
};

export function DynamicSidebar({ collapsed, mobileOpen, setCollapsed, setMobileOpen }: DynamicSidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const role = user?.role || 'DutyOfficer';

  const visibleGroups = useMemo(() => {
    const groups = [];

    // Core Workspace
    const workspaceItems = [{ label: 'Dashboard', href: '/dashboard', icon: 'layout' }];
    
    if (role === 'DutyOfficer') {
      workspaceItems.push({ label: 'Draft FIR', href: '/new-case', icon: 'files' });
    }
    
    if (['IO', 'SHO', 'SP', 'Magistrate'].includes(role)) {
      workspaceItems.push({ label: 'FIR & Cases', href: '/cases', icon: 'briefcase' });
      workspaceItems.push({ label: 'Evidence Vault', href: '/documents', icon: 'files' });
    }

    if (role === 'ForensicExpert') {
      workspaceItems.push({ label: 'Upload Analysis', href: '/upload', icon: 'files' });
    }

    groups.push({ label: 'Workspace', items: workspaceItems });

    // Reviews & Approvals
    if (['SHO', 'Magistrate'].includes(role)) {
      groups.push({
        label: 'Reviews',
        items: [
          { label: 'Pending Approvals', href: '/reviews', icon: 'clipboard' }
        ]
      });
    }

    // Analytics & Controls
    if (['SHO', 'SP'].includes(role)) {
      groups.push({
        label: 'Controls',
        items: [
          { label: 'Jurisdiction Analytics', href: '/reports', icon: 'shield' },
          { label: 'Audit Logs', href: '/audit-logs', icon: 'history' },
        ]
      });
    }

    return groups.filter(g => g.items.length > 0);
  }, [role]);

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground shadow-xl transition-all duration-200 ${collapsed ? 'w-[76px]' : 'w-[252px]'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="flex h-[76px] items-center gap-3 border-b border-sidebar-border px-5">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_0_0_4px_rgba(112,220,229,.12)]"><ShieldCheck size={20} strokeWidth={2.5} /></div>
        {!collapsed && <div className="min-w-0"><div className="text-[15px] font-bold tracking-tight text-white">SecureDocs</div><div className="font-mono text-[9px] uppercase tracking-[.18em] text-sidebar-primary">Evidence Command</div></div>}
        <button data-testid="button-collapse-sidebar" onClick={() => setCollapsed(!collapsed)} className="ml-auto hidden rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white md:block" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</button>
      </div>
      
      {!collapsed && (
        <div className="mx-4 mt-5 rounded-lg border border-sidebar-border bg-sidebar-accent/60 p-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-sidebar-primary">
            <span className="size-1.5 rounded-full bg-sidebar-primary" /> {user?.policeStationId || 'Global'}
          </div>
          <div className="mt-1 text-xs text-sidebar-foreground/60">{user?.districtCode || 'HQ'} · v3.0 (Gov)</div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {visibleGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <div className={`mb-2 px-3 font-mono text-[9px] uppercase tracking-[.18em] text-sidebar-foreground/40 ${collapsed ? 'text-center' : ''}`}>{collapsed ? '···' : group.label}</div>
            {group.items.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap] || Files;
              const active = location === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${active ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white'} ${collapsed ? 'justify-center px-2' : ''}`} title={collapsed ? item.label : undefined}>
                  <Icon size={17} strokeWidth={active ? 2.4 : 1.8} />
                  <span className={collapsed ? 'sr-only' : ''}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {!collapsed && user && (
        <div className="border-t border-sidebar-border p-3 flex items-center justify-between">
          <Link href="/profile" className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-sidebar-accent flex-1">
            <div className="grid size-8 place-items-center rounded-full bg-[#d8b68e] text-xs font-bold text-slate-800">{user.name.charAt(0)}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-white">{user.name}</div>
              <div className="truncate text-[10px] text-sidebar-foreground/55">{role}</div>
            </div>
          </Link>
          <button onClick={logout} className="p-2.5 text-sidebar-foreground/60 hover:text-white rounded-lg hover:bg-sidebar-accent" title="Log out"><LogOut size={16} /></button>
        </div>
      )}
    </aside>
  );
}
