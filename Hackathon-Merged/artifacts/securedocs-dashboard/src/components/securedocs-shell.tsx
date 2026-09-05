import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Bell, Check, ChevronDown, Menu, Search,
} from 'lucide-react';
import { roles, type Role } from '@/lib/mock-data';
import { DynamicSidebar } from './layout/DynamicSidebar';

type ShellProps = { children: ReactNode; role: Role; setRole: (role: Role) => void; search: string; setSearch: (value: string) => void };

export function SecureDocsShell({ children, role, setRole, search, setSearch }: ShellProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {mobileOpen && <button data-testid="button-close-mobile-menu" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" />}
      
      <DynamicSidebar 
        collapsed={collapsed} 
        mobileOpen={mobileOpen} 
        setCollapsed={setCollapsed} 
        setMobileOpen={setMobileOpen} 
      />

      <div className={`min-h-[100dvh] transition-[padding] duration-200 ${collapsed ? 'md:pl-[76px]' : 'md:pl-[252px]'}`}>
        <header className="sticky top-0 z-20 flex h-[76px] items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button data-testid="button-open-mobile-menu" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden" aria-label="Open menu"><Menu size={20} /></button>
          
          <div className="relative max-w-md flex-1"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input data-testid="input-global-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search cases, documents, activity..." className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10" /></div>
          
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-50 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>STATUS: SECURE · 94% READINESS</span>
            </div>
            
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