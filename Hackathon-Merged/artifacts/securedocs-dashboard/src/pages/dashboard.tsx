import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowUpRight, BriefcaseBusiness, CheckCircle2, ChevronRight, ClipboardCheck, Download,
  FileArchive, FileText, Files, LockKeyhole, MoreHorizontal, ScanLine, ShieldAlert, ShieldCheck,
  UploadCloud, UserRound,
} from 'lucide-react';
import { quickActions, riskDistribution, stats, systemStatus, caseStatuses, documentTypes, activities, alerts } from '@/lib/mock-data';
import { useDashboardData } from '@/hooks/use-dashboard-data';

type Props = { search: string };

const toneMap = {
  blue: { icon: BriefcaseBusiness, bg: 'bg-blue-50', fg: 'text-blue-700', bar: 'bg-blue-700' },
  cyan: { icon: Files, bg: 'bg-cyan-50', fg: 'text-cyan-700', bar: 'bg-cyan-500' },
  amber: { icon: ClipboardCheck, bg: 'bg-amber-50', fg: 'text-amber-700', bar: 'bg-amber-500' },
  red: { icon: ShieldAlert, bg: 'bg-red-50', fg: 'text-red-700', bar: 'bg-red-600' },
};

function SectionHeader({ eyebrow, title, action, href }: { eyebrow?: string; title: string; action?: string; href?: string }) {
  return <div className="mb-4 flex items-end justify-between gap-4"><div>{eyebrow && <div className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-primary/70">{eyebrow}</div>}<h2 className="mt-1 text-[17px] font-bold tracking-tight text-foreground">{title}</h2></div>{action && href && <Link href={href} data-testid={`link-section-${title.toLowerCase().replaceAll(' ', '-')}`} className="flex items-center gap-1 text-xs font-bold text-primary hover:gap-2 transition-[gap]">{action}<ChevronRight size={14} /></Link>}</div>;
}

function StatCard({ stat, index }: { stat: typeof stats[number]; index: number }) {
  const tone = toneMap[stat.tone]; const Icon = tone.icon;
  const href = stat.label === 'Total cases' ? '/cases' : stat.label === 'Total documents' ? '/documents' : stat.label === 'Pending reviews' ? '/reviews' : stat.label === 'Integrity issues' ? '/integrity' : '/security';
  return <Link href={href} data-testid={`card-stat-${stat.label.toLowerCase().replaceAll(' ', '-')}`} className={`group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md animate-rise-in delay-${index + 1}`}><div className="flex items-start justify-between"><div className={`grid size-9 place-items-center rounded-lg ${tone.bg} ${tone.fg}`}><Icon size={18} /></div><ArrowUpRight size={16} className="text-muted-foreground/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div><div className="mt-4 font-mono text-[28px] font-bold leading-none tracking-tight text-foreground">{stat.value}</div><div className="mt-2 text-xs font-semibold text-muted-foreground">{stat.label}</div><div className={`mt-2 flex items-center gap-1 text-[11px] font-medium ${stat.tone === 'red' ? 'text-red-700' : stat.tone === 'amber' ? 'text-amber-700' : 'text-emerald-700'}`}><span className="size-1.5 rounded-full bg-current" />{stat.change}</div><div className={`absolute bottom-0 left-0 h-0.5 w-full ${tone.bar} opacity-0 transition-opacity group-hover:opacity-100`} /></Link>;
}

function LiveActivityTable({ search, activities: items }: Props & { activities: any[] }) {
  const filtered = useMemo(() => (items || []).filter((item) => Object.values(item).join(' ').toLowerCase().includes(search.toLowerCase())), [items, search]);
  return <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-border bg-muted/45"><tr className="font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground"><th className="px-4 py-3 font-bold">Event / user</th><th className="px-4 py-3 font-bold">Document / Case</th><th className="px-4 py-3 font-bold">Time</th></tr></thead><tbody className="divide-y divide-border">{filtered.map((item: any, i: number) => <tr key={item.id || i} className="group transition-colors hover:bg-muted/30"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">{(item.user || item.userName || '?').slice(0, 2).toUpperCase()}</div><div><div className="text-xs font-semibold">{item.action}</div><div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground"><UserRound size={10} />{item.user || item.userName}</div></div></div></td><td className="px-4 py-3"><div className="flex items-center gap-2 text-xs font-medium"><FileText size={14} className="text-primary" />{item.document || item.caseId || 'System'}</div></td><td className="px-4 py-3 text-[11px] text-muted-foreground">{item.time || ''}</td></tr>)}</tbody></table></div>{filtered.length === 0 && <div className="p-10 text-center"><Files className="mx-auto text-muted-foreground/40" size={28} /><p className="mt-2 text-sm font-semibold">No matching activity</p></div>}</div>;
}

function LiveAlertsPanel({ search, alerts: items }: Props & { alerts: any[] }) {
  const [resolved, setResolved] = useState<string[]>([]);
  const visible = (items || []).filter((alert) => !resolved.includes(alert.id) && Object.values(alert).join(' ').toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-red-50 text-red-700"><ShieldAlert size={17} /></div>
          <div><h3 className="text-sm font-bold">Security alerts</h3><p className="text-[10px] text-muted-foreground">Signals requiring a decision</p></div>
        </div>
        <span className="rounded-full bg-red-50 px-2 py-1 font-mono text-[10px] font-bold text-red-700">{visible.length} open</span>
      </div>
      <div className="divide-y divide-border">
        {visible.map((alert: any) => (
          <div key={alert.id} className="p-4 transition-colors hover:bg-muted/25">
            <div className="flex gap-3">
              <div className={`mt-1 size-2 shrink-0 rounded-full ${alert.type === 'critical' ? 'bg-red-600' : 'bg-amber-500'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold">{alert.message || alert.title}</span>
                  <span className="font-mono text-[9px] font-bold uppercase text-red-700">{alert.type}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-muted-foreground">{alert.time}</span>
                  <button onClick={() => setResolved([...resolved, alert.id])} className="text-[10px] font-bold text-muted-foreground hover:text-foreground">Mark resolved</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {visible.length === 0 && <div className="flex flex-col items-center px-6 py-12 text-center"><div className="grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-700"><ShieldCheck size={24} /></div><div className="mt-3 text-sm font-bold">All systems secure</div><p className="mt-1 max-w-xs text-xs text-muted-foreground">No unresolved alerts match the current view.</p></div>}
    </div>
  );
}

function LiveDonut({ riskData, totalCases }: { riskData: any[]; totalCases: number }) {
  const total = riskData.reduce((sum, item) => sum + (item.value || 0), 0) || 1;
  const segments = riskData.reduce<{ value: number; color: string; start: number }[]>((acc, item) => { const start = acc.length ? acc[acc.length - 1].start + acc[acc.length - 1].value : 0; acc.push({ value: (item.value / total) * 100, color: item.color, start }); return acc; }, []);
  const gradient = `conic-gradient(${segments.map((s) => `${s.color} ${s.start}% ${s.start + s.value}%`).join(', ')})`;
  return <div className="relative mx-auto size-[146px] rounded-full" style={{ background: gradient }}><div className="absolute inset-[17px] grid place-items-center rounded-full bg-card"><div className="text-center"><div className="font-mono text-2xl font-bold">{totalCases}</div><div className="text-[10px] text-muted-foreground">total cases</div></div></div></div>;
}

export default function Dashboard({ search }: Props) {
  const { data, isLoading, error, retry } = useDashboardData();
  const [exported, setExported] = useState(false);

  // Use live API data when available, fall back to mock-data for anything not yet in API
  const liveStats = data?.stats ?? stats;
  const liveDocumentTypes = data?.documentTypes?.length
    ? data.documentTypes.map((d: any) => [d.name, d.value] as [string, number])
    : documentTypes;
  const liveCaseStatuses = data?.caseStatuses?.length
    ? data.caseStatuses.map((cs: any, i: number) => [cs.name, cs.value, caseStatuses[i]?.[2] ?? 'bg-blue-500'] as [string, number, string])
    : caseStatuses;
  const liveRiskDistribution = data?.riskDistribution?.length
    ? data.riskDistribution.map((rd: any, i: number) => ({ ...riskDistribution[i], label: rd.name, value: rd.value }))
    : riskDistribution;
  const liveActivities = data?.activities?.length ? data.activities : activities;
  const liveAlerts = data?.alerts?.length ? data.alerts : alerts;
  const totalCases = liveCaseStatuses.reduce((sum: number, cs: any) => sum + (cs[1] ?? 0), 0);

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <div data-testid="state-dashboard-error" className="flex min-h-[65vh] items-center justify-center"><div className="max-w-sm rounded-xl border border-red-200 bg-card p-8 text-center shadow-sm"><ShieldAlert className="mx-auto text-red-700" size={28} /><h1 className="mt-4 text-lg font-bold">Dashboard data unavailable</h1><p className="mt-2 text-sm text-muted-foreground">The local operations feed could not be reached. Nothing has been changed.</p><button data-testid="button-retry-dashboard" onClick={retry} className="mt-5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90">Retry connection</button></div></div>;
   return <div className="space-y-7">
     <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-primary"><span className="size-2 rounded-full bg-emerald-500" />Operations overview</div><h1 data-testid="heading-dashboard" className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-[30px]">Good morning, Ananya.</h1><p className="mt-1 text-sm text-muted-foreground">Your command view for protected casework · Tuesday, 18 June 2024</p></div><div className="flex items-center gap-2"><button data-testid="button-export-dashboard" onClick={() => setExported(true)} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold text-foreground shadow-sm hover:bg-muted"><Download size={15} />{exported ? 'View exported' : 'Export view'}</button><Link href="/documents" data-testid="link-upload-primary" className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"><UploadCloud size={15} />Upload document</Link></div></section>
    <div data-testid="text-control-principles" className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-3 font-mono text-[9px] font-bold uppercase tracking-[.18em] text-muted-foreground"><span className="flex items-center gap-2 text-primary"><LockKeyhole size={13} />Protect <span className="hidden font-sans font-normal normal-case tracking-normal text-muted-foreground sm:inline">access &amp; policy</span></span><span className="text-border">/</span><span className="flex items-center gap-2 text-blue-700"><FileText size={13} />Prove <span className="hidden font-sans font-normal normal-case tracking-normal text-muted-foreground sm:inline">chain of custody</span></span><span className="text-border">/</span><span className="flex items-center gap-2 text-red-700"><ShieldAlert size={13} />Detect <span className="hidden font-sans font-normal normal-case tracking-normal text-muted-foreground sm:inline">risk &amp; anomalies</span></span></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{liveStats.map((stat: any, index: number) => <StatCard key={stat.label} stat={stat} index={index} />)}</div>
    <div className="grid gap-5 xl:grid-cols-[1.35fr_.9fr]"><section><SectionHeader eyebrow="The evidence stack" title="Document inventory" action="View documents" href="/documents" /><div className="rounded-xl border border-border bg-card p-5 shadow-sm"><div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">{liveDocumentTypes.map(([label, count]: any) => <div data-testid={`bar-document-${label.toLowerCase().replaceAll(' ', '-')}`} key={label} title={`${label}: ${count.toLocaleString('en-IN')} documents`}><div className="mb-1.5 flex items-center justify-between gap-2"><span className="truncate text-[11px] font-semibold text-muted-foreground">{label}</span><span className="font-mono text-[11px] font-bold">{count.toLocaleString('en-IN')}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(count / Math.max(...liveDocumentTypes.map(([, c]: any) => c), 1)) * 100}%` }} /></div></div>)}</div><div className="mt-5 flex items-center gap-5 border-t border-border pt-4 text-[10px] text-muted-foreground"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Protected metadata only</span><span className="flex items-center gap-1.5"><LockKeyhole size={11} />Chain of custody enabled</span></div></div></section><section><SectionHeader eyebrow="Case posture" title="Risk distribution" action="View cases" href="/cases" /><div className="rounded-xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center gap-6"><LiveDonut riskData={liveRiskDistribution} totalCases={totalCases} /><div className="flex-1 space-y-4">{liveRiskDistribution.map((risk: any) => <div data-testid={`risk-${risk.label.toLowerCase()}`} key={risk.label} title={`${risk.label} risk: ${risk.value} cases`} className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ backgroundColor: risk.color }} /><span className="text-xs font-semibold">{risk.label} risk</span></div><span className="font-mono text-sm font-bold">{risk.value}</span></div>)}</div></div><div className="mt-4 rounded-lg bg-secondary/60 px-3 py-2 text-[10px] text-secondary-foreground"><span className="font-bold">Prioritise high-risk cases.</span> Review open cases for active control issues.</div><div className="mt-5 border-t border-border pt-4"><div className="mb-3 flex items-center justify-between"><span className="font-mono text-[9px] font-bold uppercase tracking-[.16em] text-muted-foreground">Case status</span><span className="text-[10px] text-muted-foreground">{totalCases} total</span></div><div className="flex h-2 overflow-hidden rounded-full bg-muted">{liveCaseStatuses.map(([label, count, color]: any) => <div key={label} title={`${label}: ${count}`} className={`${color} h-full`} style={{ width: totalCases > 0 ? `${(count / totalCases) * 100}%` : '0%' }} />)}</div><div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">{liveCaseStatuses.map(([label, count, color]: any) => <div data-testid={`case-status-${label.toLowerCase().replaceAll(' ', '-')}`} key={label} className="flex items-center justify-between text-[10px]"><span className="flex items-center gap-1.5 text-muted-foreground"><span className={`size-1.5 rounded-full ${color}`} />{label}</span><span className="font-mono font-bold">{count}</span></div>)}</div></div></div></section></div>
    <div className="grid gap-5 xl:grid-cols-[1.35fr_.9fr]"><section><SectionHeader eyebrow="Casework pulse" title="Recent activity" action="Open audit logs" href="/audit-logs" /><LiveActivityTable search={search} activities={liveActivities} /></section><LiveAlertsPanel search={search} alerts={liveAlerts} /></div>
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]"><section><SectionHeader eyebrow="Move work forward" title="Quick actions" /><div className="grid gap-3 sm:grid-cols-2">{quickActions.map((action) => { const icons = { upload: UploadCloud, clipboard: ClipboardCheck, scan: ScanLine, download: Download }; const Icon = icons[action.icon as keyof typeof icons]; return <Link href={action.href} data-testid={`card-quick-action-${action.icon}`} key={action.href} className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"><div className="grid size-9 place-items-center rounded-lg bg-secondary text-primary"><Icon size={17} /></div><div className="min-w-0 flex-1"><div className="text-xs font-bold">{action.label}</div><div className="mt-0.5 text-[10px] text-muted-foreground">{action.sub}</div></div><ChevronRight size={15} className="text-muted-foreground/50 transition-transform group-hover:translate-x-1" /></Link> })}</div></section><section><SectionHeader eyebrow="Service health" title="System status" action="Security centre" href="/security" /><div className="grid gap-2 sm:grid-cols-2">{systemStatus.map(([label, status, detail]: any, index: number) => <div data-testid={`status-system-${index}`} key={label} className="flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3 shadow-sm"><div className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><CheckCircle2 size={16} /></div><div className="min-w-0 flex-1"><div className="text-xs font-bold">{label}</div><div className="text-[10px] text-muted-foreground">{detail}</div></div><span className="font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-700">{status}</span></div>)}</div></section></div>
  </div>;
}

function DashboardSkeleton() {
  return <div data-testid="state-dashboard-loading" className="animate-pulse space-y-7">
    <div className="flex items-end justify-between"><div><div className="h-3 w-32 rounded bg-muted" /><div className="mt-3 h-8 w-72 rounded bg-muted" /><div className="mt-2 h-3 w-96 max-w-full rounded bg-muted" /></div><div className="hidden gap-2 sm:flex"><div className="h-9 w-28 rounded-lg bg-muted" /><div className="h-9 w-36 rounded-lg bg-muted" /></div></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-36 rounded-xl border border-border bg-card p-4"><div className="size-9 rounded-lg bg-muted" /><div className="mt-5 h-7 w-20 rounded bg-muted" /><div className="mt-3 h-3 w-28 rounded bg-muted" /></div>)}</div>
    <div className="grid gap-5 xl:grid-cols-[1.35fr_.9fr]"><div className="h-72 rounded-xl border border-border bg-card" /><div className="h-72 rounded-xl border border-border bg-card" /></div>
  </div>;
}

export function ComingSoon({ title }: { title: string }) {
  return <div className="flex min-h-[70vh] items-center justify-center"><div className="max-w-md text-center"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary text-primary"><FileArchive size={26} /></div><div className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[.2em] text-primary">Workspace module</div><h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">This module is staged for the SecureDocs operations suite. The dashboard remains your live command view while this workspace is being connected.</p><Link href="/dashboard" data-testid="link-return-dashboard" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90">Return to dashboard<ChevronRight size={14} /></Link></div></div>;
}