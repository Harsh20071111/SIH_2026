import { useEffect, useRef } from 'react';
import { AlertTriangle, Bell, Check, ChevronDown, ChevronRight, FileArchive, FileCheck2, FileText, Fingerprint, FolderOpen, History, PanelLeftClose, Search, Share2, ShieldCheck, Upload, UserRound, X, Zap } from 'lucide-react';

export const IconButton = ({ label, onClick, children, className = '', testId }) => (
  <button type="button" aria-label={label} title={label} onClick={onClick} data-testid={testId || `button-${label.toLowerCase().replaceAll(' ', '-')}`} className={`inline-flex items-center justify-center rounded-md transition-colors hover:bg-slate-100 active:bg-slate-200 ${className}`}>
    {children}
  </button>
);

export const StatusBadge = ({ value, kind = 'status' }) => {
  const styles = {
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
    Warning: 'bg-amber-50 text-amber-700 border-amber-200',
    Flagged: 'bg-orange-50 text-orange-700 border-orange-200',
    Rejected: 'bg-red-50 text-red-700 border-red-200',
    Public: 'bg-sky-50 text-sky-700 border-sky-200',
    Internal: 'bg-sky-50 text-sky-700 border-sky-200',
    Confidential: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Restricted: 'bg-orange-50 text-orange-700 border-orange-200',
    Failed: 'bg-red-50 text-red-700 border-red-200',
  };
  return <span data-testid={`badge-${kind}-${String(value).toLowerCase().replaceAll(' ', '-')}`} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold tracking-wide ${styles[value] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
    {kind === 'integrity' && (value === 'Verified' ? <Check size={11} strokeWidth={3} /> : <AlertTriangle size={11} />)}
    {value}
  </span>;
};

export const Modal = ({ title, eyebrow, children, onClose, width = 'max-w-lg', testId }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[2px]" data-testid={testId || 'modal-overlay'}>
    <div role="dialog" aria-modal="true" className={`animate-enter w-full ${width} overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl`} data-testid={`${testId || 'modal'}-dialog`}>
      <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
        <div>
          {eyebrow && <div className="mb-1 text-[10px] font-extrabold uppercase tracking-[.16em] text-cyan-700">{eyebrow}</div>}
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">{title}</h2>
        </div>
        <IconButton label="Close modal" onClick={onClose} testId={`button-close-${testId || 'modal'}`} className="h-8 w-8 text-slate-400"><X size={18} /></IconButton>
      </div>
      {children}
    </div>
  </div>
);

export const SecureSidebar = ({ collapsed, onToggle }) => {
  const nav = [{ icon: FolderOpen, label: 'Dashboard', section: 'Main' }, { icon: FolderOpen, label: 'Cases', section: 'Main' }, { icon: FolderOpen, label: 'Documents', section: 'Main' }, { icon: FileText, label: 'All Documents', section: 'Documents', active: true, count: '12', nested: true }, { icon: Upload, label: 'Upload Document', section: 'Documents', nested: true }, { icon: FileCheck2, label: 'Review Queue', section: 'Documents', count: '2', nested: true }, { icon: ShieldCheck, label: 'Risk Center', section: 'Security' }, { icon: Fingerprint, label: 'Integrity Check', section: 'Security' }, { icon: History, label: 'Audit Logs', section: 'Security' }, { icon: FileArchive, label: 'Reports', section: 'Other' }, { icon: UserRound, label: 'Users', section: 'Other' }, { icon: Zap, label: 'Settings', section: 'Other' }];
  return <aside className={`${collapsed ? 'w-[76px]' : 'w-[240px]'} hidden shrink-0 flex-col bg-[#18263b] text-slate-300 transition-all duration-200 lg:flex`} data-testid="sidebar-navigation">
    <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400 text-[#18263b]"><ShieldCheck size={22} strokeWidth={2.6} /></div>
      {!collapsed && <div><div className="text-[15px] font-extrabold tracking-tight text-white">Secure<span className="text-cyan-300">Docs</span></div><div className="font-mono-app text-[9px] uppercase tracking-[.2em] text-slate-400">Evidence control</div></div>}
    </div>
    <div className="flex-1 px-3 py-6">
      {!collapsed && <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.17em] text-slate-500">Workspace</div>}
      <nav className="space-y-1">
        {nav.map(({ icon: Icon, label, active, count, section, nested }, index) => <div key={label}>{!collapsed && (index === 0 || nav[index - 1].section !== section) && <div className="mb-2 mt-5 px-3 text-[10px] font-bold uppercase tracking-[.17em] text-slate-500 first:mt-0">{section}</div>}<button type="button" onClick={() => {}} data-testid={`nav-${label.toLowerCase().replaceAll(' ', '-')}`} className={`group flex w-full items-center gap-3 rounded-lg ${nested ? 'pl-7' : 'px-3'} py-2 text-left text-[13px] font-semibold transition-colors ${active ? 'bg-cyan-400/12 text-white ring-1 ring-inset ring-cyan-300/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}>
          <Icon size={16} className={active ? 'text-cyan-300' : 'text-slate-500'} />{!collapsed && <><span className="flex-1">{label}</span>{count && <span className={`rounded px-1.5 py-0.5 font-mono-app text-[10px] ${active ? 'bg-cyan-300/15 text-cyan-200' : 'bg-white/8 text-slate-500'}`}>{count}</span>}</>}
        </button></div>)}
      </nav>
      {!collapsed && <div className="mt-8 mb-3 px-3 text-[10px] font-bold uppercase tracking-[.17em] text-slate-500">System</div>}
      <button type="button" onClick={() => {}} data-testid="nav-system-health" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-slate-400 hover:bg-white/5 hover:text-slate-100"><Zap size={17} className="text-amber-300" />{!collapsed && <><span className="flex-1">System health</span><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /></>}</button>
    </div>
      <div className="border-t border-white/10 p-3">
      <div className={`flex items-center gap-3 rounded-lg px-2 py-2 ${collapsed ? 'justify-center' : ''}`}><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#385873] text-xs font-bold text-cyan-100">RP</div>{!collapsed && <div className="min-w-0"><div className="truncate text-xs font-bold text-slate-100">Officer Raj Patel</div><div className="truncate text-[10px] text-slate-500">Officer</div></div>}</div>
    </div>
    <IconButton label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={onToggle} testId="button-toggle-sidebar" className="absolute bottom-4 left-5 h-8 w-8 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"><PanelLeftClose size={15} className={collapsed ? 'rotate-180' : ''} /></IconButton>
  </aside>;
};

export const TopBar = ({ onNotifications, onProfile, unread = 3 }) => (
  <header className="flex h-[76px] items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8" data-testid="header-topbar">
    <div className="flex items-center gap-3 lg:hidden"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#18263b] text-cyan-300"><ShieldCheck size={18} /></div><span className="text-sm font-extrabold text-slate-900">SecureDocs</span></div>
    <div className="hidden items-center gap-2 text-xs text-slate-500 lg:flex"><span>Workspace</span><ChevronRight size={13} /><span className="font-semibold text-slate-800">All Documents</span></div>
    <div className="ml-auto flex items-center gap-2">
      <IconButton label="Open notifications" onClick={onNotifications} testId="button-open-notifications" className="relative h-9 w-9 text-slate-500"><Bell size={18} />{unread > 0 && <span data-testid="badge-notification-count" className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-cyan-600 px-1 text-[8px] font-bold text-white">{unread}</span>}</IconButton>
      <div className="mx-1 h-6 w-px bg-slate-200" />
      <button type="button" onClick={onProfile} data-testid="button-open-profile" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dbeef0] text-xs font-extrabold text-[#17606c]">RP</div><div className="hidden text-left sm:block"><div className="text-xs font-bold text-slate-800">Officer Raj Patel</div><div className="text-[10px] text-slate-500">Officer</div></div><ChevronDown size={14} className="text-slate-400" /></button>
    </div>
  </header>
);

export const Dropdown = ({ children, className = '' }) => <div className={`absolute right-0 top-11 z-30 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl ${className}`}>{children}</div>;

export const SkeletonRows = () => <div className="space-y-1 p-4" data-testid="loading-documents"><div className="mb-4 h-10 animate-pulse rounded bg-slate-100" />{[1, 2, 3, 4, 5].map((row) => <div key={row} className="h-14 animate-pulse rounded bg-slate-50" />)}</div>;

export const EmptyState = ({ onClear }) => <div className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center" data-testid="empty-documents-state"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700"><Search size={25} /></div><h3 className="text-base font-extrabold text-slate-900">No documents match your search</h3><p className="mt-1 max-w-sm text-sm text-slate-500">Try a different case ID, uploader, or filter combination. Your records are still safely accounted for.</p><button type="button" onClick={onClear} data-testid="button-empty-clear-filters" className="mt-5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Clear all filters</button></div>;

export const Toast = ({ message, onClose }) => { const timer = useRef(); useEffect(() => { timer.current = setTimeout(onClose, 3600); return () => clearTimeout(timer.current); }, [onClose]); return <div className="fixed bottom-5 right-5 z-[70] flex items-center gap-3 rounded-lg bg-[#18263b] px-4 py-3 text-sm font-semibold text-white shadow-xl" role="status" data-testid="status-toast"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[#18263b]"><Check size={13} strokeWidth={3} /></span>{message}<IconButton label="Dismiss notification" onClick={onClose} testId="button-dismiss-toast" className="ml-2 h-6 w-6 text-slate-400 hover:text-white"><X size={14} /></IconButton></div>; };

export const DetailIcon = ({ type }) => type === 'Warrant' ? <FileArchive size={18} /> : type === 'Evidence Log' ? <Fingerprint size={18} /> : <FileText size={18} />;