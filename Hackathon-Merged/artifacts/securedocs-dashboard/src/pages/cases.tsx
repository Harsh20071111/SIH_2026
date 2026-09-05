import { useMemo, useState, type ChangeEvent, type MouseEvent } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Archive,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
} from 'lucide-react';
import { useCases } from '@/hooks/use-cases';
import { canViewCase, type CasePriority, type CaseRecord, type CaseRisk, type CaseStatus } from '@/lib/case-service';
import type { Role } from '@/lib/mock-data';

type CasesProps = {
  role: Role;
  search: string;
  setSearch: (value: string) => void;
};

type FilterState = {
  status: string;
  risk: string;
  type: string;
  officer: string;
  priority: string;
  from: string;
  to: string;
};

type SortKey = 'id' | 'title' | 'documents' | 'lastActivity' | 'status' | 'risk' | 'priority';
type SortDirection = 'asc' | 'desc';

const blankFilters: FilterState = { status: '', risk: '', type: '', officer: '', priority: '', from: '', to: '' };
const PAGE_SIZE = 10;
const statuses: CaseStatus[] = ['Active', 'Under Investigation', 'Under Review', 'Closed', 'Archived'];
const risks: CaseRisk[] = ['High', 'Medium', 'Low'];
const priorities: CasePriority[] = ['High', 'Medium', 'Low'];

function isVisibleToRole(item: CaseRecord, role: Role) {
  return canViewCase(item, role);
}

function relativeTime(timestamp: string) {
  const difference = Date.now() - new Date(timestamp).getTime();
  const absolute = Math.abs(difference);
  const minutes = Math.round(absolute / 60000);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const value = days > 0 ? `${days}d` : hours > 0 ? `${hours}h` : `${Math.max(minutes, 1)}m`;
  return difference >= 0 ? `${value} ago` : `in ${value}`;
}

function StatusBadge({ status }: { status: CaseStatus }) {
  const styles: Record<CaseStatus, string> = {
    Active: 'border-blue-200 bg-blue-50 text-blue-700',
    'Under Investigation': 'border-amber-200 bg-amber-50 text-amber-800',
    'Under Review': 'border-violet-200 bg-violet-50 text-violet-700',
    Closed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Archived: 'border-slate-200 bg-slate-100 text-slate-600',
  };
  const dot: Record<CaseStatus, string> = {
    Active: 'bg-blue-600',
    'Under Investigation': 'bg-amber-500',
    'Under Review': 'bg-violet-600',
    Closed: 'bg-emerald-600',
    Archived: 'bg-slate-400',
  };
  return <span data-testid={`status-case-${status.toLowerCase().replaceAll(' ', '-')}`} className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold ${styles[status]}`}><span className={`size-1.5 rounded-full ${dot[status]}`} />{status}</span>;
}

function RiskBadge({ risk }: { risk: CaseRisk }) {
  const styles = { High: 'text-red-700', Medium: 'text-amber-700', Low: 'text-emerald-700' };
  const dots = { High: 'bg-red-600', Medium: 'bg-amber-500', Low: 'bg-emerald-600' };
  return <span data-testid={`risk-case-${risk.toLowerCase()}`} className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${styles[risk]}`}><span className={`size-2 rounded-full ${dots[risk]} ${risk === 'High' ? 'ring-2 ring-red-100' : ''}`} />{risk}</span>;
}

function PriorityBadge({ priority }: { priority: CasePriority }) {
  const styles = { High: 'border-red-200 bg-red-50 text-red-700', Medium: 'border-amber-200 bg-amber-50 text-amber-700', Low: 'border-slate-200 bg-slate-100 text-slate-600' };
  return <span data-testid={`priority-case-${priority.toLowerCase()}`} className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold ${styles[priority]}`}>{priority}</span>;
}

function Metric({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) {
  return <div data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`} className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm">
    <div className={`mb-4 size-2 rounded-full ${tone}`} />
    <div className="font-mono text-[27px] font-bold leading-none tracking-tight">{value}</div>
    <div className="mt-2 text-xs font-bold text-foreground">{label}</div>
    <div className="mt-1 text-[10px] text-muted-foreground">{note}</div>
    <div className={`absolute bottom-0 left-0 h-0.5 w-full ${tone}`} />
  </div>;
}

function CaseRow({ item, onEdit, onArchive, canEdit, canArchive }: { item: CaseRecord; onEdit: (item: CaseRecord) => void; onArchive: (item: CaseRecord) => void; canEdit: boolean; canArchive: boolean }) {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const stopRowNavigation = (event: MouseEvent) => event.stopPropagation();
  return <tr data-testid={`row-case-${item.id}`} tabIndex={0} onClick={(event) => { if (!(event.target as HTMLElement).closest('a,button')) setLocation(`/cases/${item.id}`); }} onKeyDown={(event) => { if (event.key === 'Enter') setLocation(`/cases/${item.id}`); }} className="group cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-secondary/35 focus:bg-secondary/35 focus:outline-none">
    <td className="px-4 py-3.5"><Link href={`/cases/${item.id}`} data-testid={`link-case-id-${item.id}`} className="font-mono text-[11px] font-bold text-primary hover:underline">{item.id}</Link></td>
    <td className="min-w-[190px] px-4 py-3.5"><Link href={`/cases/${item.id}`} data-testid={`link-case-title-${item.id}`} className="block text-xs font-bold hover:text-primary">{item.title}</Link><span className="mt-1 block text-[10px] text-muted-foreground">{item.type}</span></td>
    <td className="px-4 py-3.5 text-xs text-muted-foreground">{item.type}</td>
    <td className="px-4 py-3.5"><div className="flex items-center gap-2 text-xs font-medium"><span className="grid size-6 place-items-center rounded-full bg-secondary text-[9px] font-bold text-secondary-foreground">{item.officer?.replace('Officer ', 'O') || 'O'}</span>{item.officer || 'Unassigned'}</div></td>
    <td className="px-4 py-3.5"><Link href={`/documents?caseId=${item.id}`} data-testid={`link-documents-${item.id}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"><FileText size={13} />{item.documents}</Link></td>
    <td className="px-4 py-3.5" title={new Date(item.lastActivity).toLocaleString()}><div className="flex items-center gap-1.5 whitespace-nowrap text-[11px] text-muted-foreground"><Clock3 size={13} />{relativeTime(item.lastActivity)}</div></td>
    <td className="px-4 py-3.5"><StatusBadge status={item.status} /></td>
    <td className="px-4 py-3.5"><RiskBadge risk={item.risk} /></td>
    <td className="px-4 py-3.5"><PriorityBadge priority={item.priority} /></td>
    <td className="px-4 py-3.5 text-right" onClick={stopRowNavigation}><div className="relative inline-block"><button data-testid={`button-case-actions-${item.id}`} aria-label={`Actions for ${item.id}`} onClick={() => setMenuOpen((open) => !open)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><MoreHorizontal size={17} /></button>{menuOpen && <><button aria-label="Close case action menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setMenuOpen(false)} /><div className="absolute right-0 top-9 z-20 w-48 rounded-xl border border-border bg-popover p-1.5 text-left shadow-xl"><Link href={`/cases/${item.id}`} data-testid={`action-view-case-${item.id}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-muted"><Eye size={14} />View Case</Link><Link href={`/documents?caseId=${item.id}`} data-testid={`action-view-documents-${item.id}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-muted"><FileText size={14} />View Documents</Link><Link href={`/cases/${item.id}/timeline`} data-testid={`action-view-timeline-${item.id}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-muted"><Clock3 size={14} />View Timeline</Link>{canEdit && <button data-testid={`action-edit-case-${item.id}`} onClick={() => { setMenuOpen(false); onEdit(item); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-muted"><Pencil size={14} />Edit Case</button>}{canArchive && item.status !== 'Archived' && <button data-testid={`action-archive-case-${item.id}`} onClick={() => { setMenuOpen(false); onArchive(item); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"><Archive size={14} />Archive Case</button>}</div></>}</div></td>
  </tr>;
}

function CaseCard({ item }: { item: CaseRecord }) {
  return <div data-testid={`card-case-${item.id}`} className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30">
    <div className="flex items-start justify-between gap-3"><div><Link href={`/cases/${item.id}`} data-testid={`mobile-link-case-${item.id}`} className="font-mono text-[11px] font-bold text-primary">{item.id}</Link><h3 className="mt-1 text-sm font-bold">{item.title}</h3></div><StatusBadge status={item.status} /></div>
    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border py-3 text-[11px]"><div><span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Officer</span><span className="mt-1 flex items-center gap-1.5 font-semibold"><UserRound size={12} className="text-primary" />{item.officer || 'Unassigned'}</span></div><div><span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Documents</span><Link href={`/documents?caseId=${item.id}`} data-testid={`mobile-documents-${item.id}`} className="mt-1 flex items-center gap-1.5 font-semibold text-primary"><FileText size={12} />{item.documents}</Link></div><div><span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Risk</span><span className="mt-1 block"><RiskBadge risk={item.risk} /></span></div><div><span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Priority</span><span className="mt-1 block"><PriorityBadge priority={item.priority} /></span></div></div>
    <div className="mt-3 flex items-center justify-between"><span title={new Date(item.lastActivity).toLocaleString()} className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><Clock3 size={12} />{relativeTime(item.lastActivity)}</span><Link href={`/cases/${item.id}`} data-testid={`mobile-view-case-${item.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[10px] font-bold text-primary-foreground"><Eye size={13} />View</Link></div>
  </div>;
}

function EditDialog({ item, onClose, onSave }: { item: CaseRecord; onClose: () => void; onSave: (values: Partial<CaseRecord>) => Promise<void> }) {
  const [title, setTitle] = useState(item.title);
  const [status, setStatus] = useState<CaseStatus>(item.status);
  const [risk, setRisk] = useState<CaseRisk>(item.risk);
  const [priority, setPriority] = useState<CasePriority>(item.priority);
  const [saving, setSaving] = useState(false);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-case-title"><div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-2xl"><div className="flex items-start justify-between"><div><div className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-primary">Case record</div><h2 id="edit-case-title" className="mt-1 text-lg font-bold">Edit {item.id}</h2></div><button data-testid="button-close-edit-case" onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted" aria-label="Close edit case"><X size={18} /></button></div><div className="mt-5 space-y-4"><label className="block text-xs font-bold">Title<input data-testid="input-edit-case-title" value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /></label><div className="grid gap-3 sm:grid-cols-3"><label className="block text-xs font-bold">Status<select data-testid="select-edit-case-status" value={status} onChange={(event) => setStatus(event.target.value as CaseStatus)} className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-2 text-xs">{statuses.map((value) => <option key={value}>{value}</option>)}</select></label><label className="block text-xs font-bold">Risk<select data-testid="select-edit-case-risk" value={risk} onChange={(event) => setRisk(event.target.value as CaseRisk)} className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-2 text-xs">{risks.map((value) => <option key={value}>{value}</option>)}</select></label><label className="block text-xs font-bold">Priority<select data-testid="select-edit-case-priority" value={priority} onChange={(event) => setPriority(event.target.value as CasePriority)} className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-2 text-xs">{priorities.map((value) => <option key={value}>{value}</option>)}</select></label></div></div><div className="mt-6 flex justify-end gap-2"><button data-testid="button-cancel-edit-case" onClick={onClose} className="rounded-lg border border-border px-3 py-2 text-xs font-bold hover:bg-muted">Cancel</button><button data-testid="button-save-edit-case" disabled={saving || !title.trim()} onClick={async () => { setSaving(true); await onSave({ title: title.trim(), status, risk, priority }); setSaving(false); }} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50">{saving && <RefreshCw size={13} className="animate-spin" />}Save changes</button></div></div></div>;
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (event: ChangeEvent<HTMLSelectElement>) => void }) {
  return <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}<div className="relative mt-1.5"><select value={value} onChange={onChange} data-testid={`select-filter-${label.toLowerCase().replaceAll(' ', '-')}`} className="h-9 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-8 text-xs font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"><option value="">All {label.toLowerCase()}s</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" /></div></label>;
}

export default function Cases({ role, search, setSearch }: CasesProps) {
  const { data, isLoading, error, retry, update, archive } = useCases();
  const [draftFilters, setDraftFilters] = useState<FilterState>(blankFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(blankFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'lastActivity', direction: 'desc' });
  const [editItem, setEditItem] = useState<CaseRecord | null>(null);
  const [notice, setNotice] = useState('');
  const canEdit = role === 'Admin' || role === 'Officer';
  const canArchive = role === 'Admin';

  const roleCases = useMemo(() => data.filter((item) => isVisibleToRole(item, role)), [data, role]);
  const options = useMemo(() => ({
    types: [...new Set(roleCases.map((item) => item.type))].sort(),
    officers: [...new Set(roleCases.map((item) => item.officer).filter(Boolean))].sort() as string[],
  }), [roleCases]);
  const filteredCases = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matching = roleCases.filter((item) => {
      const includesQuery = !query || [item.id, item.title, item.officer, item.type].join(' ').toLowerCase().includes(query);
      const activityDate = item.lastActivity.slice(0, 10);
      return includesQuery
        && (!appliedFilters.status || item.status === appliedFilters.status)
        && (!appliedFilters.risk || item.risk === appliedFilters.risk)
        && (!appliedFilters.type || item.type === appliedFilters.type)
        && (!appliedFilters.officer || item.officer === appliedFilters.officer)
        && (!appliedFilters.priority || item.priority === appliedFilters.priority)
        && (!appliedFilters.from || activityDate >= appliedFilters.from)
        && (!appliedFilters.to || activityDate <= appliedFilters.to);
    });
    return matching.sort((a, b) => {
      const first = a[sort.key];
      const second = b[sort.key];
      const comparison = typeof first === 'number' && typeof second === 'number' ? first - second : String(first).localeCompare(String(second));
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [roleCases, search, appliedFilters, sort]);
  const pageCount = Math.max(1, Math.ceil(filteredCases.length / PAGE_SIZE));
  const pageItems = filteredCases.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  const applyFilters = () => { setAppliedFilters({ ...draftFilters }); setPage(1); };
  const clearFilters = () => { setDraftFilters(blankFilters); setAppliedFilters(blankFilters); setPage(1); };
  const setFilter = (key: keyof FilterState) => (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => setDraftFilters((current) => ({ ...current, [key]: event.target.value }));
  const changeSort = (key: SortKey) => {
    setSort((current) => current.key === key ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: key === 'lastActivity' ? 'desc' : 'asc' });
    setPage(1);
  };
  const sortIcon = (key: SortKey) => sort.key !== key ? <ArrowUpDown size={13} /> : sort.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  const saveEdit = async (values: Partial<CaseRecord>) => {
    if (!editItem) return;
    await update(editItem.id, values);
    setEditItem(null);
    setNotice(`${editItem.id} updated`);
    window.setTimeout(() => setNotice(''), 2600);
  };
  const archiveItem = async (item: CaseRecord) => {
    if (!window.confirm(`Archive ${item.id}? This changes its status and removes it from active work queues.`)) return;
    await archive(item.id);
    setNotice(`${item.id} archived`);
    window.setTimeout(() => setNotice(''), 2600);
  };

  if (isLoading) return <CasesSkeleton />;
  if (error) return <div data-testid="state-cases-error" className="flex min-h-[65vh] items-center justify-center"><div className="max-w-sm rounded-2xl border border-red-200 bg-card p-8 text-center shadow-sm"><CircleAlert className="mx-auto text-red-700" size={28} /><h1 className="mt-4 text-lg font-bold">Cases unavailable</h1><p className="mt-2 text-sm text-muted-foreground">The case register could not be reached. Your existing casework is unchanged.</p><button data-testid="button-retry-cases" onClick={retry} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"><RefreshCw size={14} />Retry connection</button></div></div>;

  return <div className="space-y-6">
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-primary"><span className="size-2 rounded-full bg-emerald-500" />Case register</div><h1 data-testid="heading-cases" className="mt-2 text-2xl font-bold tracking-tight sm:text-[30px]">Cases</h1><p className="mt-1 text-sm text-muted-foreground">Manage and monitor legal and investigation cases</p></div>{(role === 'Admin' || role === 'Officer') && <Link href="/cases/new" data-testid="link-create-case" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3.5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"><Plus size={15} />Create New Case</Link>}</section>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Total Cases" value="128" note="Across protected workspaces" tone="bg-blue-600" /><Metric label="Active Cases" value="58" note="Currently in progress" tone="bg-cyan-500" /><Metric label="Under Review" value="18" note="Awaiting legal decision" tone="bg-violet-600" /><Metric label="High Risk Cases" value="5" note="Require active control" tone="bg-red-600" /></div>
    <section className="rounded-xl border border-border bg-card shadow-sm"><div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center"><div className="relative min-w-0 flex-1 lg:max-w-md"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input data-testid="input-case-search" type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search ID, title, officer, or case type" className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-xs outline-none placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10" /></div><div className="flex flex-wrap items-center gap-2"><button data-testid="button-toggle-case-filters" onClick={() => setFiltersOpen((open) => !open)} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-bold ${filtersOpen || activeFilterCount ? 'border-primary/40 bg-secondary text-primary' : 'border-border bg-card hover:bg-muted'}`}><SlidersHorizontal size={14} />Filters{activeFilterCount > 0 && <span className="grid size-4 place-items-center rounded-full bg-primary text-[9px] text-primary-foreground">{activeFilterCount}</span>}</button>{activeFilterCount > 0 && <button data-testid="button-clear-case-filters-top" onClick={clearFilters} className="inline-flex items-center gap-1.5 px-2 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"><X size={13} />Clear</button>}<div className="ml-auto hidden items-center gap-2 text-[10px] text-muted-foreground md:flex"><Filter size={13} />{filteredCases.length} visible</div></div></div>
      {filtersOpen && <div className="border-t border-border bg-muted/20 p-4"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6"><FilterSelect label="Status" value={draftFilters.status} options={statuses} onChange={setFilter('status')} /><FilterSelect label="Risk" value={draftFilters.risk} options={risks} onChange={setFilter('risk')} /><FilterSelect label="Case type" value={draftFilters.type} options={options.types} onChange={setFilter('type')} /><FilterSelect label="Officer" value={draftFilters.officer} options={options.officers} onChange={setFilter('officer')} /><FilterSelect label="Priority" value={draftFilters.priority} options={priorities} onChange={setFilter('priority')} /><div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-2"><label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">From<input data-testid="input-filter-from" type="date" value={draftFilters.from} onChange={setFilter('from')} className="mt-1.5 h-9 w-full rounded-lg border border-input bg-background px-2 text-xs outline-none focus:border-primary" /></label><label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">To<input data-testid="input-filter-to" type="date" value={draftFilters.to} onChange={setFilter('to')} className="mt-1.5 h-9 w-full rounded-lg border border-input bg-background px-2 text-xs outline-none focus:border-primary" /></label></div></div><div className="mt-4 flex items-center justify-end gap-2"><button data-testid="button-clear-case-filters" onClick={clearFilters} className="rounded-lg border border-border px-3 py-2 text-xs font-bold hover:bg-muted">Clear filters</button><button data-testid="button-apply-case-filters" onClick={applyFilters} className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90">Apply filters</button></div></div>}
    </section>
    <div className="flex items-center justify-between"><div><div className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-primary/70">Protected metadata</div><h2 className="mt-1 text-base font-bold">Case register <span className="ml-1 font-mono text-xs font-normal text-muted-foreground">({filteredCases.length})</span></h2></div><div className="hidden items-center gap-2 text-[10px] text-muted-foreground sm:flex"><CalendarDays size={13} />Activity dates shown in local time</div></div>
    <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block"><div className="case-table-scrollbar overflow-x-auto"><table className="w-full min-w-[1180px] text-left"><thead className="border-b border-border bg-muted/45"><tr className="font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground">{[['id', 'Case ID'], ['title', 'Title'], ['documents', 'Documents'], ['lastActivity', 'Last Activity'], ['status', 'Status'], ['risk', 'Risk'], ['priority', 'Priority']].map(([key, label]) => <th key={key} className="px-4 py-3 font-bold"><button data-testid={`button-sort-${key}`} onClick={() => changeSort(key as SortKey)} className="inline-flex items-center gap-1.5 hover:text-foreground">{label}{sortIcon(key as SortKey)}</button></th>)}<th className="px-4 py-3 text-right font-bold">Actions</th></tr></thead><tbody>{pageItems.map((item) => <CaseRow key={item.id} item={item} onEdit={setEditItem} onArchive={archiveItem} canEdit={canEdit} canArchive={canArchive} />)}</tbody></table></div>{pageItems.length === 0 && <EmptyCases clearFilters={clearFilters} hasFilters={Boolean(search || activeFilterCount)} />}</div>
    <div className="space-y-3 md:hidden">{pageItems.map((item) => <CaseCard key={item.id} item={item} />)}{pageItems.length === 0 && <div className="rounded-xl border border-border bg-card"><EmptyCases clearFilters={clearFilters} hasFilters={Boolean(search || activeFilterCount)} /></div>}</div>
    <div className="flex flex-col gap-3 border-t border-border pt-4 text-xs sm:flex-row sm:items-center sm:justify-between"><div className="text-muted-foreground">Showing <span className="font-bold text-foreground">{filteredCases.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filteredCases.length)}</span> of <span className="font-bold text-foreground">{filteredCases.length}</span> cases</div><div className="flex items-center gap-1"><button data-testid="button-pagination-previous" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40" aria-label="Previous page"><ChevronLeft size={15} /></button>{Array.from({ length: pageCount }, (_, index) => index + 1).slice(Math.max(0, page - 3), Math.min(pageCount, page + 2)).map((value) => <button data-testid={`button-pagination-${value}`} key={value} onClick={() => setPage(value)} className={`grid size-8 place-items-center rounded-lg text-xs font-bold ${value === page ? 'bg-primary text-primary-foreground' : 'border border-transparent text-muted-foreground hover:bg-muted'}`}>{value}</button>)}<button data-testid="button-pagination-next" disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40" aria-label="Next page"><ChevronRight size={15} /></button></div></div>
    {notice && <div data-testid="status-case-notice" className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-xl border border-emerald-200 bg-card px-4 py-3 text-xs font-bold text-emerald-700 shadow-xl"><Check size={15} />{notice}</div>}
    {editItem && <EditDialog item={editItem} onClose={() => setEditItem(null)} onSave={saveEdit} />}
  </div>;
}

function EmptyCases({ clearFilters, hasFilters }: { clearFilters: () => void; hasFilters: boolean }) {
  return <div data-testid="empty-cases" className="flex flex-col items-center justify-center px-6 py-16 text-center"><div className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary"><Search size={22} /></div><h3 className="mt-4 text-sm font-bold">No cases match this view</h3><p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">{hasFilters ? 'Try removing a filter or changing your search terms.' : 'Cases assigned to your role will appear here.'}</p>{hasFilters && <button data-testid="button-empty-clear-filters" onClick={clearFilters} className="mt-4 rounded-lg border border-border px-3 py-2 text-xs font-bold hover:bg-muted">Clear filters</button>}</div>;
}

function CasesSkeleton() {
  return <div data-testid="state-cases-loading" className="animate-pulse space-y-6"><div><div className="h-3 w-24 rounded bg-muted" /><div className="mt-3 h-8 w-44 rounded bg-muted" /><div className="mt-2 h-3 w-72 rounded bg-muted" /></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 rounded-xl border border-border bg-card p-4"><div className="size-2 rounded-full bg-muted" /><div className="mt-5 h-7 w-16 rounded bg-muted" /><div className="mt-3 h-3 w-28 rounded bg-muted" /></div>)}</div><div className="h-20 rounded-xl border border-border bg-card" /><div className="h-[430px] rounded-xl border border-border bg-card" /></div>;
}