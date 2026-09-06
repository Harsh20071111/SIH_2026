import { useEffect, useRef } from 'react';
import { AlertTriangle, Bell, Check, ChevronDown, ChevronRight, FileArchive, FileCheck2, FileText, Fingerprint, FolderOpen, History, PanelLeftClose, Search, Share2, ShieldCheck, Upload, UserRound, X, Zap } from 'lucide-react';

export const IconButton = ({ label, onClick, children, className = '', testId }) => (
  <button type="button" aria-label={label} title={label} onClick={onClick} data-testid={testId || `button-${label.toLowerCase().replaceAll(' ', '-')}`} className={`inline-flex items-center justify-center rounded-md transition-colors hover:bg-slate-100 active:bg-slate-200 ${className}`}>
    {children}
  </button>
);

export const StatusBadge = ({ value, kind = 'status' }) => {
  const styles = {
    Approved: 'bg-[#E8F5E9] text-[#16803C] border-[#C8E6C9]',
    Verified: 'bg-[#E8F5E9] text-[#16803C] border-[#C8E6C9]',
    Low: 'bg-[#E8F5E9] text-[#16803C] border-[#C8E6C9]',
    'Pending Review': 'bg-[#FFF8E1] text-[#B77900] border-[#FFE082]',
    Pending: 'bg-[#FFF8E1] text-[#B77900] border-[#FFE082]',
    Warning: 'bg-[#FFF8E1] text-[#B77900] border-[#FFE082]',
    High: 'bg-[#FFF8E1] text-[#B77900] border-[#FFE082]',
    'Under Review': 'bg-[#EBF3FB] text-[#2563A8] border-[#C5DCF5]',
    Medium: 'bg-[#EBF3FB] text-[#2563A8] border-[#C5DCF5]',
    Info: 'bg-[#EBF3FB] text-[#2563A8] border-[#C5DCF5]',
    Public: 'bg-[#F0F4F8] text-[#5B6575] border-[#D9E0E8]',
    Internal: 'bg-[#F0F4F8] text-[#5B6575] border-[#D9E0E8]',
    Confidential: 'bg-[#EBF3FB] text-[#174A7C] border-[#C5DCF5]',
    Restricted: 'bg-[#FFF8E1] text-[#B77900] border-[#FFE082]',
    'Highly Restricted': 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]',
    Flagged: 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]',
    Rejected: 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]',
    Critical: 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]',
    Failed: 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]',
    Compromised: 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]',
  };
  return <span data-testid={`badge-${kind}-${String(value).toLowerCase().replaceAll(' ', '-')}`} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${styles[value] || 'bg-slate-50 text-slate-700 border-[#D9E0E8]'}`}>
    {kind === 'integrity' && (value === 'Verified' ? <Check size={11} strokeWidth={3} /> : <AlertTriangle size={11} />)}
    {value}
  </span>;
};

export const Modal = ({ title, eyebrow, children, onClose, width = 'max-w-lg', testId }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]" data-testid={testId || 'modal-overlay'}>
    <div role="dialog" aria-modal="true" className={`animate-enter w-full ${width} overflow-hidden rounded-lg border border-border bg-card shadow-lg`} data-testid={`${testId || 'modal'}-dialog`}>
      <div className="flex items-start justify-between border-b border-border px-6 py-5">
        <div>
          {eyebrow && <div className="mb-1 text-[10px] font-bold uppercase tracking-[.16em] text-primary">{eyebrow}</div>}
          <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
        </div>
        <IconButton label="Close modal" onClick={onClose} testId={`button-close-${testId || 'modal'}`} className="h-8 w-8 text-muted-foreground hover:text-foreground"><X size={18} /></IconButton>
      </div>
      {children}
    </div>
  </div>
);

export const SecureSidebar = ({ collapsed, onToggle }) => {
  const nav = [{ icon: FolderOpen, label: 'Dashboard', section: 'Main' }, { icon: FolderOpen, label: 'Cases', section: 'Main' }, { icon: FolderOpen, label: 'Documents', section: 'Main' }, { icon: FileText, label: 'All Documents', section: 'Documents', active: true, count: '12', nested: true }, { icon: Upload, label: 'Upload Document', section: 'Documents', nested: true }, { icon: FileCheck2, label: 'Review Queue', section: 'Documents', count: '2', nested: true }, { icon: ShieldCheck, label: 'Risk Center', section: 'Security' }, { icon: Fingerprint, label: 'Integrity Check', section: 'Security' }, { icon: History, label: 'Audit Logs', section: 'Security' }, { icon: FileArchive, label: 'Reports', section: 'Other' }, { icon: UserRound, label: 'System Users', section: 'Other' }, { icon: Zap, label: 'Settings', section: 'Other' }];
  return <aside className={`${collapsed ? 'w-[76px]' : 'w-[240px]'} hidden shrink-0 flex-col bg-[#152438] text-slate-300 transition-all duration-200 lg:flex`} data-testid="sidebar-navigation">
    <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-white"><ShieldCheck size={20} strokeWidth={2.4} /></div>
      {!collapsed && <div><div className="text-[15px] font-bold tracking-tight text-white">SecureDocs</div><div className="font-mono text-[9px] uppercase tracking-[.2em] text-slate-400">Evidence control</div></div>}
    </div>
    <div className="flex-1 px-3 py-6">
      {!collapsed && <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.17em] text-slate-400">Workspace</div>}
      <nav className="space-y-1">
        {nav.map(({ icon: Icon, label, active, count, section, nested }, index) => <div key={label}>{!collapsed && (index === 0 || nav[index - 1].section !== section) && <div className="mb-2 mt-5 px-3 text-[10px] font-bold uppercase tracking-[.17em] text-slate-400 first:mt-0">{section}</div>}<button type="button" onClick={() => {}} data-testid={`nav-${label.toLowerCase().replaceAll(' ', '-')}`} className={`group flex w-full items-center gap-3 rounded-md ${nested ? 'pl-7' : 'px-3'} py-2 text-left text-[13px] font-medium transition-colors ${active ? 'bg-primary text-white shadow-xs' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
          <Icon size={16} className={active ? 'text-white' : 'text-slate-400'} />{!collapsed && <><span className="flex-1">{label}</span>{count && <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'}`}>{count}</span>}</>}
        </button></div>)}
      </nav>
      {!collapsed && <div className="mt-8 mb-3 px-3 text-[10px] font-bold uppercase tracking-[.17em] text-slate-400">System</div>}
      <button type="button" onClick={() => {}} data-testid="nav-system-health" className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[13px] font-medium text-slate-300 hover:bg-white/5 hover:text-white"><Zap size={17} className="text-amber-400" />{!collapsed && <><span className="flex-1">System health</span><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /></>}</button>
    </div>
      <div className="border-t border-white/10 p-3">
      <div className={`flex items-center gap-3 rounded-md px-2 py-2 ${collapsed ? 'justify-center' : ''}`}><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/30 text-xs font-bold text-white">RP</div>{!collapsed && <div className="min-w-0"><div className="truncate text-xs font-bold text-white">Officer Raj Patel</div><div className="truncate text-[10px] text-slate-400">Officer</div></div>}</div>
    </div>
    <IconButton label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={onToggle} testId="button-toggle-sidebar" className="absolute bottom-4 left-5 h-8 w-8 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"><PanelLeftClose size={15} className={collapsed ? 'rotate-180' : ''} /></IconButton>
  </aside>;
};

export const TopBar = ({ onNotifications, onProfile, unread = 3 }) => (
  <header className="flex h-[76px] items-center justify-between border-b border-border bg-card px-5 sm:px-8" data-testid="header-topbar">
    <div className="flex items-center gap-3 lg:hidden"><div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white"><ShieldCheck size={18} /></div><span className="text-sm font-bold text-foreground">SecureDocs</span></div>
    <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex"><span>Workspace</span><ChevronRight size={13} /><span className="font-semibold text-foreground">All Documents</span></div>
    <div className="ml-auto flex items-center gap-2">
      <IconButton label="Open notifications" onClick={onNotifications} testId="button-open-notifications" className="relative h-9 w-9 text-muted-foreground hover:text-foreground"><Bell size={18} />{unread > 0 && <span data-testid="badge-notification-count" className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[8px] font-bold text-white">{unread}</span>}</IconButton>
      <div className="mx-1 h-6 w-px bg-border" />
      <button type="button" onClick={onProfile} data-testid="button-open-profile" className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-secondary"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">RP</div><div className="hidden text-left sm:block"><div className="text-xs font-bold text-foreground">Officer Raj Patel</div><div className="text-[10px] text-muted-foreground">Officer</div></div><ChevronDown size={14} className="text-muted-foreground" /></button>
    </div>
  </header>
);

export const Dropdown = ({ children, className = '' }) => <div className={`absolute right-0 top-11 z-30 w-64 overflow-hidden rounded-lg border border-border bg-card shadow-lg ${className}`}>{children}</div>;

export const SkeletonRows = () => <div className="space-y-1 p-4" data-testid="loading-documents"><div className="mb-4 h-10 animate-pulse rounded bg-muted" />{[1, 2, 3, 4, 5].map((row) => <div key={row} className="h-14 animate-pulse rounded bg-muted/60" />)}</div>;

export const EmptyState = ({ onClear }) => <div className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center" data-testid="empty-documents-state"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-secondary text-primary"><Search size={25} /></div><h3 className="text-base font-bold text-foreground">No documents match your search</h3><p className="mt-1 max-w-sm text-sm text-muted-foreground">Try a different case ID, uploader, or filter combination. Your records are still safely accounted for.</p><button type="button" onClick={onClear} data-testid="button-empty-clear-filters" className="mt-5 rounded-md border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary">Clear all filters</button></div>;

export const Toast = ({ message, onClose }) => { const timer = useRef(); useEffect(() => { timer.current = setTimeout(onClose, 3600); return () => clearTimeout(timer.current); }, [onClose]); return <div className="fixed bottom-5 right-5 z-[70] flex items-center gap-3 rounded-md bg-[#172033] px-4 py-3 text-sm font-medium text-white shadow-lg border border-slate-700" role="status" data-testid="status-toast"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white"><Check size={13} strokeWidth={3} /></span>{message}<IconButton label="Dismiss notification" onClick={onClose} testId="button-dismiss-toast" className="ml-2 h-6 w-6 text-slate-400 hover:text-white"><X size={14} /></IconButton></div>; };

export const DetailIcon = ({ type }) => type === 'Warrant' ? <FileArchive size={18} /> : type === 'Evidence Log' ? <Fingerprint size={18} /> : <FileText size={18} />;