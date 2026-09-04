import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import {
  Archive, ArrowLeft, Check, CheckCircle2, ChevronDown, ClipboardCheck, Clock3, Download,
  Edit3, Ellipsis, FileCheck2, FileText, FolderOpen, History, LockKeyhole, MoreVertical,
  ScanLine, ShieldAlert, ShieldCheck, UploadCloud, UserRound, Users, X, AlertTriangle,
} from 'lucide-react';
import { archiveCase, canViewCase, getCaseById, type CaseRecord } from '@/lib/case-service';
import {
  addCaseReviewComment, getCaseActivities, getCaseDocuments, getCaseIntegrity, getCaseReviews, getCaseSecurity,
  updateCaseReview, verifyCaseIntegrity, type CaseActivity, type CaseDocument, type CaseIntegrity,
  type CaseReview, type CaseSecurity,
} from '@/lib/case-detail-service';
import type { Role } from '@/lib/mock-data';

type Tab = 'overview' | 'documents' | 'activity' | 'reviews' | 'integrity' | 'security';
const tabs: Array<{ id: Tab; label: string; icon: typeof FileText }> = [
  { id: 'overview', label: 'Overview', icon: FolderOpen }, { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'activity', label: 'Activity', icon: History }, { id: 'reviews', label: 'Reviews', icon: ClipboardCheck },
  { id: 'integrity', label: 'Integrity', icon: ShieldCheck }, { id: 'security', label: 'Security', icon: LockKeyhole },
];

const dateLabel = (value?: string) => value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not recorded';
const timeLabel = (value: string) => new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const chipClass = (value: string) => value === 'High' || value === 'Flagged' || value === 'Issue detected' || value === 'Blocked' ? 'border-red-200 bg-red-50 text-red-700' : value === 'Medium' || value === 'Pending' || value === 'Warning' || value === 'Pending Review' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700';
const canReview = (role: Role) => role === 'Admin' || role === 'Legal Reviewer';
const canUpload = (role: Role) => role === 'Admin' || role === 'Officer' || role === 'Clerk';
const canVerify = (role: Role) => role === 'Admin' || role === 'Auditor';

function Pill({ children, tone }: { children: ReactNode; tone?: string }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[.12em] ${tone ? chipClass(tone) : 'border-border bg-muted text-muted-foreground'}`}><span className="size-1.5 rounded-full bg-current" />{children}</span>;
}

function MetricCard({ icon: Icon, label, value, detail, tone = 'default' }: { icon: typeof FileText; label: string; value: string; detail: string; tone?: string }) {
  return <article className="rounded-xl border border-border bg-card p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
    <div className="flex items-start justify-between"><div className="grid size-8 place-items-center rounded-lg bg-secondary text-primary"><Icon size={16} /></div><span className={`size-2 rounded-full ${tone === 'green' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-500' : tone === 'red' ? 'bg-red-500' : 'bg-primary'}`} /></div>
    <div className="mt-4 font-mono text-[9px] font-bold uppercase tracking-[.14em] text-muted-foreground">{label}</div><div className="mt-1 text-xl font-bold tracking-tight">{value}</div><div className="mt-1 text-[10px] text-muted-foreground">{detail}</div>
  </article>;
}

function SectionHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-primary">{eyebrow}</div><h2 className="mt-1 text-base font-bold">{title}</h2></div>{action}</div>;
}

function ActivityRow({ activity }: { activity: CaseActivity }) {
  return <div className="flex gap-3 border-b border-border py-3 last:border-0"><div className="w-16 shrink-0 font-mono text-[10px] font-bold text-muted-foreground">{timeLabel(activity.timestamp)}</div><div className="relative mt-1.5 size-2 shrink-0 rounded-full bg-primary ring-4 ring-secondary" /><div className="min-w-0 flex-1"><div className="text-xs font-semibold">{activity.user} <span className="font-normal text-muted-foreground">{activity.action.toLowerCase()}</span>{activity.document && <span className="text-primary"> {activity.document}</span>}</div><div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground"><span>{activity.role}</span><Pill tone={activity.result}>{activity.result}</Pill></div></div></div>;
}

function TrendChart({ security }: { security: CaseSecurity }) {
  const points = security.trend.map((item, index) => `${index * 16.6 + 2},${78 - item.score * .62}`).join(' ');
  return <div className="mt-4 rounded-lg border border-border bg-background/70 p-3"><div className="relative h-36"><svg viewBox="0 0 104 82" preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="Security risk trend chart"><path d="M2 78H102M2 39H102M2 1H102" stroke="hsl(var(--border))" strokeDasharray="1.5 2" fill="none" /><polyline points={points} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.8" vectorEffect="non-scaling-stroke" /><polyline points={`2,78 ${points} 102,78`} fill="hsl(var(--secondary))" fillOpacity=".45" stroke="none" /></svg><div className="absolute inset-x-0 bottom-0 flex justify-between pt-2">{security.trend.map((item) => <span key={item.day} className="font-mono text-[8px] text-muted-foreground">{item.day}</span>)}</div></div></div>;
}

export default function CaseDetail({ role }: { role: Role }) {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/cases/:id');
  const id = params?.id ?? '';
  const [item, setItem] = useState<CaseRecord | null>(null);
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [activities, setActivities] = useState<CaseActivity[]>([]);
  const [reviews, setReviews] = useState<CaseReview[]>([]);
  const [integrity, setIntegrity] = useState<CaseIntegrity | null>(null);
  const [security, setSecurity] = useState<CaseSecurity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [verifyState, setVerifyState] = useState<'idle' | 'checking' | 'hashes' | 'audit' | 'done'>('idle');
  const queryTab = new URLSearchParams(window.location.search).get('tab') as Tab | null;
  const activeTab: Tab = tabs.some((tab) => tab.id === queryTab) ? queryTab as Tab : 'overview';

  const load = () => {
    setLoading(true); setError(false);
    void getCaseById(id).then(async (caseItem) => {
      if (!caseItem) { setItem(null); setLoading(false); return; }
      const [docs, events, reviewItems, integrityItem, securityItem] = await Promise.all([
        getCaseDocuments(id, caseItem), getCaseActivities(id), getCaseReviews(id, caseItem), getCaseIntegrity(id, caseItem), getCaseSecurity(id),
      ]);
      setItem(caseItem); setDocuments(docs); setActivities(events); setReviews(reviewItems); setIntegrity(integrityItem); setSecurity(securityItem); setLoading(false);
    }).catch(() => { setError(true); setLoading(false); });
  };
  useEffect(() => { load(); }, [id]);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 3200); return () => window.clearTimeout(timer); }, [notice]);

  const pendingReviews = reviews.filter((review) => review.status === 'Pending').length;
  const canEdit = role === 'Admin' || (role === 'Officer' && item?.officer === 'Officer A');
  const canReport = role === 'Admin' || role === 'Legal Reviewer' || role === 'Auditor';
  const canShare = role === 'Admin' || role === 'Officer' || role === 'Legal Reviewer';
  const canAudit = role === 'Admin' || role === 'Legal Reviewer' || role === 'Auditor';
  const securityStatus = integrity?.issues ? 'Attention required' : security && security.riskScore >= 70 ? 'High risk' : security && security.riskScore >= 45 ? 'Attention required' : 'Secure';
  const securityStatusClass = securityStatus === 'Secure' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : securityStatus === 'High risk' ? 'text-red-700 bg-red-50 border-red-200' : 'text-amber-700 bg-amber-50 border-amber-200';
  const setTab = (tab: Tab) => setLocation(`/cases/${id}${tab === 'overview' ? '' : `?tab=${tab}`}`);

  const runVerification = async () => {
    if (!item || !canVerify(role)) return;
    setVerifyState('checking'); await new Promise((resolve) => window.setTimeout(resolve, 650)); setVerifyState('hashes');
    await new Promise((resolve) => window.setTimeout(resolve, 650)); setVerifyState('audit');
    const result = await verifyCaseIntegrity(id, item); setIntegrity(result); setVerifyState('done'); setNotice('Integrity verification completed.'); window.setTimeout(() => setVerifyState('idle'), 2600);
  };
  const handleReview = async (review: CaseReview, status: CaseReview['status']) => {
    if (!canReview(role)) return;
    const updated = await updateCaseReview(id, review.id, status); setReviews((current) => current.map((candidate) => candidate.id === updated.id ? updated : candidate)); setNotice(`${review.document} marked ${status.toLowerCase()}.`);
  };
  const handleComment = async (review: CaseReview, comment: string) => {
    if (!canReview(role) || !comment.trim()) return;
    const updated = await addCaseReviewComment(id, review.id, comment);
    setReviews((current) => current.map((candidate) => candidate.id === updated.id ? updated : candidate));
    setNotice(`Comment added to ${review.document}.`);
  };

  if (loading) return <div data-testid="state-case-detail-loading" className="animate-pulse space-y-5"><div className="h-4 w-32 rounded bg-muted" /><div className="h-14 w-80 rounded bg-muted" /><div className="grid gap-3 sm:grid-cols-3"><div className="h-28 rounded-xl bg-muted" /><div className="h-28 rounded-xl bg-muted" /><div className="h-28 rounded-xl bg-muted" /></div><div className="h-96 rounded-xl border border-border bg-card" /></div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center"><ShieldAlert className="mx-auto text-red-700" size={30} /><h1 className="mt-4 text-lg font-bold">Unable to load case information.</h1><button onClick={load} className="mt-5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">Try again</button></div>;
  if (!item || !canViewCase(item, role)) return <div data-testid="state-case-detail-missing" className="py-20 text-center"><ShieldAlert className="mx-auto text-red-700" size={30} /><h1 className="mt-4 text-xl font-bold">403 Access Denied</h1><p className="mt-2 text-sm text-muted-foreground">This case is outside your authorization.</p><Link href="/cases" data-testid="link-return-cases-detail" className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">Return to cases</Link></div>;

  return <div data-testid={`page-case-detail-${item.id}`} className="space-y-5">
    {notice && <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800"><CheckCircle2 size={15} />{notice}<button onClick={() => setNotice('')} className="ml-auto"><X size={14} /></button></div>}
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><button data-testid="button-back-to-cases" onClick={() => setLocation('/cases')} className="mb-3 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"><ArrowLeft size={15} />Cases</button><div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.17em] text-primary"><span>Case workspace</span><span className="text-border">/</span><span>{item.id}</span></div><h1 data-testid="heading-case-detail" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Case {item.id}</h1><p className="mt-1 text-sm text-muted-foreground">Manage and monitor case information, documents, activities, reviews and security.</p></div>
      <div className="flex flex-wrap items-center gap-2">
        {canEdit && <Link href={`/cases/${item.id}/edit`} data-testid="link-detail-edit" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold hover:bg-muted"><Edit3 size={14} />Edit Case</Link>}
        {canUpload(role) && <Link href={`/upload?caseId=${item.id}`} data-testid="link-upload-document" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-sm"><UploadCloud size={14} />Upload Document</Link>}
        <div className="relative"><button onClick={() => setMenuOpen((open) => !open)} data-testid="button-case-more" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold hover:bg-muted"><MoreVertical size={15} />More<ChevronDown size={13} /></button>{menuOpen && <div className="absolute right-0 top-11 z-30 w-52 rounded-xl border border-border bg-popover p-1.5 shadow-xl">{role === 'Admin' && <button onClick={() => { void archiveCase(item.id).then((updated) => { setItem(updated); setNotice('Case archived.'); setMenuOpen(false); }); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-muted"><Archive size={14} />Archive Case</button>}{canReport && <button onClick={() => { setNotice('Case report prepared for export.'); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-muted"><Download size={14} />Generate Case Report</button>}{canShare && <button onClick={() => { void navigator.clipboard?.writeText(window.location.href); setNotice('Authorized case link copied.'); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-muted"><Users size={14} />Share Case</button>}{canAudit && <button onClick={() => { setTab('activity'); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-muted"><History size={14} />View Audit Trail</button>}</div>}</div>
      </div>
    </div>

    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start"><div><div className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-primary">{item.title}</div><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{item.description || 'Investigation related to reported activity and collection of supporting evidence.'}</p></div><div className={`inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[.12em] ${securityStatusClass}`}><span className="size-2 rounded-full bg-current" />Security status: {securityStatus}</div></div>
      <div className="mt-5 grid gap-x-5 gap-y-4 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-4"><div><div className="label">Case ID</div><div className="value font-mono">{item.id}</div></div><div><div className="label">Case type</div><div className="value">{item.type}</div></div><div><div className="label">Status</div><div className="mt-1"><Pill tone={item.status}>{item.status}</Pill></div></div><div><div className="label">Priority</div><div className="mt-1"><Pill tone={item.priority}>{item.priority}</Pill></div></div><div><div className="label">Confidentiality</div><div className="mt-1"><Pill tone={item.confidentiality || 'Restricted'}>{item.confidentiality || 'Restricted'}</Pill></div></div><div><div className="label">Assigned officer</div><div className="value flex items-center gap-1.5"><UserRound size={14} className="text-primary" />{item.officer}</div></div><div><div className="label">Department</div><div className="value">{item.department || 'Investigation'}</div></div><div><div className="label">Start date</div><div className="value">{dateLabel(item.startDate || item.lastActivity)}</div></div><div><div className="label">Created by</div><div className="value">{item.createdBy || 'Admin'}</div></div><div><div className="label">Created date</div><div className="value">{dateLabel(item.createdAt || item.lastActivity)}</div></div></div>
    </section>

     <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><MetricCard icon={FileText} label="Documents" value={String(item.documents)} detail="Protected records" /><MetricCard icon={ClipboardCheck} label="Pending reviews" value={String(pendingReviews)} detail="Awaiting decision" tone="amber" /><MetricCard icon={ShieldAlert} label="Security risk" value={`${security?.riskScore ?? 0}/100`} detail={`${security?.riskLevel ?? 'Low'} risk`} tone={(security?.riskScore ?? 0) > 60 ? 'red' : 'amber'} /><MetricCard icon={Clock3} label="Recent activities" value={String(item.activityCount ?? activities.length)} detail={`${activities.length} latest events shown`} /><MetricCard icon={FileCheck2} label="Integrity status" value={integrity?.status === 'Verified' ? 'Verified' : 'Issue'} detail={integrity?.issues ? `${integrity.issues} issue detected` : 'All checks passed'} tone={integrity?.issues ? 'red' : 'green'} /></div>

    <div className="case-tab-scroll flex gap-1 overflow-x-auto border-b border-border" role="tablist">{tabs.map(({ id: tabId, label, icon: Icon }) => <button key={tabId} role="tab" aria-selected={activeTab === tabId} onClick={() => setTab(tabId)} className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold transition-colors ${activeTab === tabId ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}><Icon size={14} />{label}{tabId === 'reviews' && pendingReviews > 0 && <span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[9px] text-amber-800">{pendingReviews}</span>}</button>)}</div>

    {activeTab === 'overview' && <OverviewTab item={item} activities={activities} documents={documents} setTab={setTab} />}
    {activeTab === 'documents' && <DocumentsTab documents={documents} role={role} setNotice={setNotice} />}
    {activeTab === 'activity' && <ActivityTab activities={activities} />}
     {activeTab === 'reviews' && <ReviewsTab reviews={reviews} role={role} onReview={handleReview} onComment={handleComment} />}
    {activeTab === 'integrity' && <IntegrityTab integrity={integrity} role={role} verifyState={verifyState} onVerify={runVerification} setTab={setTab} />}
    {activeTab === 'security' && security && <SecurityTab security={security} setLocation={setLocation} />}
  </div>;
}

function OverviewTab({ item, activities, documents, setTab }: { item: CaseRecord; activities: CaseActivity[]; documents: CaseDocument[]; setTab: (tab: Tab) => void }) {
  const officers = [{ name: item.officer, role: 'Lead Investigation Officer', department: item.department || 'Investigation', active: true }, { name: 'Officer B', role: 'Supporting Officer', department: 'Investigation', active: true }];
  return <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
    <div className="space-y-5"><section className="rounded-xl border border-border bg-card p-5 shadow-sm"><SectionHeader eyebrow="Case information" title="Protected record details" /><div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2"><div><div className="label">Description</div><div className="mt-1 text-sm leading-6">{item.description || 'Investigation related to reported theft and collection of supporting evidence.'}</div></div><div><div className="label">Current workflow</div><div className="mt-1 text-sm font-semibold">{item.status} <span className="text-muted-foreground">· {item.priority} priority</span></div></div><div><div className="label">Document collection</div><div className="mt-1 text-sm font-semibold">{documents.length} active document records</div></div><div><div className="label">Last activity</div><div className="mt-1 text-sm font-semibold">{dateLabel(item.lastActivity)} <span className="text-muted-foreground">{timeLabel(item.lastActivity)}</span></div></div></div></section><section className="rounded-xl border border-border bg-card p-5 shadow-sm"><SectionHeader eyebrow="Case progress" title="Investigation workflow" /><div className="mt-6 grid grid-cols-5 gap-1">{['Case created', 'Investigation', 'Document collection', 'Review', 'Finalization'].map((step, index) => <div key={step} className="relative text-center"><div className={`mx-auto grid size-7 place-items-center rounded-full border text-[10px] font-bold ${index < 3 ? 'border-primary bg-primary text-primary-foreground' : index === 3 ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-border bg-muted text-muted-foreground'}`}>{index < 3 ? <Check size={13} /> : index === 3 ? <Clock3 size={12} /> : index + 1}</div><div className="mt-2 text-[9px] font-semibold leading-3 text-muted-foreground">{step}</div>{index < 4 && <div className={`absolute left-[58%] top-3.5 h-px w-[84%] ${index < 2 ? 'bg-primary' : 'bg-border'}`} />}</div>)}</div><div className="mt-4 flex justify-between font-mono text-[9px] uppercase tracking-[.12em] text-muted-foreground"><span>3 complete</span><span>Review in progress</span></div></section><section className="rounded-xl border border-border bg-card p-5 shadow-sm"><SectionHeader eyebrow="Recent activity" title="Latest case events" action={<button onClick={() => setTab('activity')} className="text-xs font-bold text-primary hover:underline">View all activity</button>} /><div className="mt-3">{activities.slice(0, 5).map((activity) => <ActivityRow key={activity.id} activity={activity} />)}</div></section></div>
    <div className="space-y-5"><section className="rounded-xl border border-border bg-card p-5 shadow-sm"><SectionHeader eyebrow="Assigned personnel" title="Case team" /><div className="mt-4 space-y-3">{officers.map((officer) => <div key={officer.name} className="flex items-center gap-3 rounded-lg border border-border bg-background/60 p-3"><div className="grid size-9 place-items-center rounded-full bg-secondary font-mono text-[10px] font-bold text-primary">{officer.name.split(' ').map((part) => part[0]).join('')}</div><div className="min-w-0 flex-1"><div className="text-xs font-bold">{officer.name}</div><div className="mt-0.5 text-[10px] text-muted-foreground">{officer.role} · {officer.department}</div></div><span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500" />Active</span></div>)}</div><div className="mt-4 rounded-lg border border-dashed border-border p-3 text-[10px] leading-5 text-muted-foreground">Personnel visibility is limited to operational role, department and status.</div></section><section className="rounded-xl border border-border bg-card p-5 shadow-sm"><SectionHeader eyebrow="Case timeline" title="Milestones" /><div className="mt-4 space-y-4 border-l border-border pl-4">{['Case created', 'FIR uploaded', 'Evidence added', 'Document reviewed', 'Integrity verified'].map((event, index) => <div key={event} className="relative"><span className={`absolute -left-[21px] top-1 size-2 rounded-full ring-4 ring-card ${index < 4 ? 'bg-primary' : 'bg-muted-foreground'}`} /><div className="text-xs font-bold">{event}</div><div className="mt-0.5 font-mono text-[9px] uppercase text-muted-foreground">{dateLabel(item.lastActivity)} · {index === 3 ? 'Reviewer B' : index === 4 ? 'Auditor A' : index === 0 ? item.createdBy || 'Admin' : item.officer}</div></div>)}</div></section></div>
  </div>;
}

function DocumentActions({ document, role, setNotice }: { document: CaseDocument; role: Role; setNotice: (notice: string) => void }) {
  const [open, setOpen] = useState(false);
  return <div className="relative"><button onClick={() => setOpen((value) => !value)} aria-label={`More actions for ${document.name}`} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Ellipsis size={16} /></button>{open && <div className="absolute right-0 top-8 z-20 w-40 rounded-lg border border-border bg-popover p-1 shadow-xl"><Link href={`/documents/${document.id}`} className="block rounded px-2.5 py-2 text-left text-[10px] font-semibold hover:bg-muted">View document</Link><button onClick={() => { setNotice(`${document.name} download queued.`); setOpen(false); }} className="block w-full rounded px-2.5 py-2 text-left text-[10px] font-semibold hover:bg-muted">Download</button><button onClick={() => { setNotice(`${document.name} version history opened.`); setOpen(false); }} className="block w-full rounded px-2.5 py-2 text-left text-[10px] font-semibold hover:bg-muted">View versions</button>{(role === 'Admin' || role === 'Auditor') && <button onClick={() => { setNotice(`${document.name} integrity check queued.`); setOpen(false); }} className="block w-full rounded px-2.5 py-2 text-left text-[10px] font-semibold hover:bg-muted">Verify integrity</button>}<button onClick={() => { void navigator.clipboard?.writeText(window.location.href); setNotice('Authorized document link copied.'); setOpen(false); }} className="block w-full rounded px-2.5 py-2 text-left text-[10px] font-semibold hover:bg-muted">Share</button></div>}</div>;
}

function DocumentsTab({ documents, role, setNotice }: { documents: CaseDocument[]; role: Role; setNotice: (notice: string) => void }) {
  return <section className="rounded-xl border border-border bg-card shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5"><SectionHeader eyebrow="Evidence workspace" title="Case documents" /><span className="font-mono text-[10px] text-muted-foreground">{documents.length} records shown</span></div>{documents.length === 0 ? <EmptyState title="No documents have been added to this case yet." action="Upload Document" href="/upload" /> : <div className="case-table-scrollbar overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-muted/60 font-mono text-[9px] uppercase tracking-[.12em] text-muted-foreground"><tr>{['Document', 'Type', 'Version', 'Uploaded by', 'Date', 'Status', 'Integrity', ''].map((heading) => <th key={heading} className="px-5 py-3 font-bold">{heading}</th>)}</tr></thead><tbody>{documents.map((document) => <tr key={document.id} className="border-t border-border transition-colors hover:bg-muted/30"><td className="px-5 py-3"><Link href={`/documents/${document.id}`} className="flex items-center gap-2 font-bold text-primary hover:underline"><FileText size={14} />{document.name}</Link></td><td className="px-5 py-3 text-muted-foreground">{document.type}</td><td className="px-5 py-3 font-mono text-[10px]">{document.version}</td><td className="px-5 py-3">{document.uploadedBy}</td><td className="px-5 py-3 text-muted-foreground">{dateLabel(document.date)}</td><td className="px-5 py-3"><Pill tone={document.status}>{document.status}</Pill></td><td className="px-5 py-3"><span className={`inline-flex items-center gap-1 text-[10px] font-bold ${document.integrity === 'Verified' ? 'text-emerald-700' : 'text-red-700'}`}>{document.integrity === 'Verified' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}{document.integrity}</span></td><td className="px-5 py-3"><DocumentActions document={document} role={role} setNotice={setNotice} /></td></tr>)}</tbody></table></div>}</section>;
}

function ActivityTab({ activities }: { activities: CaseActivity[] }) {
  const [user, setUser] = useState('All');
  const [action, setAction] = useState('All');
  const [date, setDate] = useState('All');
  const [result, setResult] = useState('All');
  const filtered = activities.filter((activity) => {
    const matchesUser = user === 'All' || activity.user === user;
    const matchesAction = action === 'All' || activity.action.toLowerCase().includes(action.toLowerCase());
    const matchesResult = result === 'All' || activity.result === result;
    const matchesDate = date === 'All' || (date === 'Today' ? activity.timestamp.startsWith('2026-09-01') : activity.timestamp >= '2026-08-26');
    return matchesUser && matchesAction && matchesDate && matchesResult;
  });
  const selectClass = 'rounded-lg border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary';
  return <section className="rounded-xl border border-border bg-card shadow-sm"><div className="border-b border-border p-5"><SectionHeader eyebrow="Audit trail" title="Complete activity history" /><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><select aria-label="Filter activity by user" value={user} onChange={(event) => setUser(event.target.value)} className={selectClass}><option>All</option>{Array.from(new Set(activities.map((activity) => activity.user))).map((value) => <option key={value}>{value}</option>)}</select><select aria-label="Filter activity by action" value={action} onChange={(event) => setAction(event.target.value)} className={selectClass}>{['All', 'Upload', 'View', 'Download', 'Edit', 'Share', 'Approve', 'Reject', 'Verify', 'Access Denied'].map((value) => <option key={value}>{value}</option>)}</select><select aria-label="Filter activity by date" value={date} onChange={(event) => setDate(event.target.value)} className={selectClass}><option>All</option><option>Today</option><option>Previous 7 days</option></select><select aria-label="Filter activity by result" value={result} onChange={(event) => setResult(event.target.value)} className={selectClass}><option>All</option><option>Success</option><option>Verified</option><option>Warning</option><option>Blocked</option></select></div></div>{filtered.length === 0 ? <EmptyState title="No activity matches this filter." /> : <div className="divide-y divide-border">{filtered.map((activity) => <div key={activity.id} className="grid gap-2 p-4 sm:grid-cols-[145px_120px_1fr_90px] sm:items-center"><div className="font-mono text-[10px] text-muted-foreground">{dateLabel(activity.timestamp)} <span className="text-foreground">{timeLabel(activity.timestamp)}</span></div><div><div className="text-xs font-bold">{activity.user}</div><div className="text-[10px] text-muted-foreground">{activity.role}</div></div><div className="text-xs">{activity.action}{activity.document && <span className="font-semibold text-primary"> · {activity.document}</span>}</div><Pill tone={activity.result}>{activity.result}</Pill></div>)}</div>}</section>;
}

function ReviewsTab({ reviews, role, onReview, onComment }: { reviews: CaseReview[]; role: Role; onReview: (review: CaseReview, status: CaseReview['status']) => void; onComment: (review: CaseReview, comment: string) => void }) {
  const pending = reviews.filter((review) => review.status === 'Pending').length; const approved = reviews.filter((review) => review.status === 'Approved').length; const flagged = reviews.filter((review) => review.status === 'Flagged').length; const rejected = reviews.filter((review) => review.status === 'Rejected').length;
  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  return <div className="space-y-5"><div className="grid gap-3 sm:grid-cols-4"><MetricCard icon={Clock3} label="Pending reviews" value={String(pending)} detail="Awaiting decision" tone="amber" /><MetricCard icon={CheckCircle2} label="Approved" value={String(approved)} detail="Accepted records" tone="green" /><MetricCard icon={AlertTriangle} label="Flagged" value={String(flagged)} detail="Needs attention" tone="red" /><MetricCard icon={X} label="Rejected" value={String(rejected)} detail="Not accepted" /></div><section className="rounded-xl border border-border bg-card shadow-sm"><div className="border-b border-border p-5"><SectionHeader eyebrow="Document governance" title="Review queue" /></div>{reviews.length === 0 ? <EmptyState title="No documents are currently pending review." /> : <div className="divide-y divide-border">{reviews.map((review) => <div key={review.id} className="flex flex-col gap-3 p-4 md:grid md:grid-cols-[1.3fr_1fr_120px_105px_240px] md:items-center"><div><Link href={`/documents/${review.documentId}`} className="flex items-center gap-2 text-xs font-bold text-primary hover:underline"><FileText size={14} />{review.document}</Link>{review.comment && <div className="mt-2 rounded-md bg-muted px-2.5 py-2 text-[10px] text-muted-foreground">Comment: {review.comment}</div>}</div><span className="text-xs">{review.reviewer}<span className="block text-[10px] text-muted-foreground">Reviewer</span></span><span className="font-mono text-[10px] text-muted-foreground">{dateLabel(review.submitted)}</span><Pill tone={review.status}>{review.status}</Pill><div className="flex flex-wrap gap-1.5">{canReview(role) ? <>{review.status === 'Pending' && <><button onClick={() => onReview(review, 'Approved')} className="rounded-md bg-emerald-700 px-2.5 py-1.5 text-[10px] font-bold text-white">Approve</button><button onClick={() => onReview(review, 'Flagged')} className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold text-amber-800">Flag</button><button onClick={() => onReview(review, 'Rejected')} className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-[10px] font-bold text-red-700">Reject</button></>}<button onClick={() => { setCommentingId(review.id); setComment(review.comment || ''); }} className="rounded-md border border-border px-2.5 py-1.5 text-[10px] font-bold hover:bg-muted">Add comment</button></> : <Link href={`/documents/${review.documentId}`} className="rounded-md border border-border px-2.5 py-1.5 text-[10px] font-bold hover:bg-muted">View document</Link>}</div>{commentingId === review.id && <div className="rounded-lg border border-primary/20 bg-secondary p-3 md:col-span-5"><div className="flex gap-2"><input autoFocus value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a review note" className="min-w-0 flex-1 rounded-md border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary" /><button onClick={() => { onComment(review, comment); setCommentingId(null); }} className="rounded-md bg-primary px-2.5 py-2 text-[10px] font-bold text-primary-foreground">Save</button><button onClick={() => setCommentingId(null)} className="rounded-md border border-border px-2.5 py-2 text-[10px] font-bold">Cancel</button></div></div>}</div>)}</div>}</section></div>;
}

function IntegrityTab({ integrity, role, verifyState, onVerify, setTab }: { integrity: CaseIntegrity | null; role: Role; verifyState: string; onVerify: () => void; setTab: (tab: Tab) => void }) {
  if (!integrity) return <EmptyState title="Integrity information is not available." />;
  const progressLabel = verifyState === 'checking' ? 'Checking documents…' : verifyState === 'hashes' ? 'Checking hashes…' : verifyState === 'audit' ? 'Checking audit chain…' : 'Integrity verification completed.';
  return <div className="space-y-5"><section className="rounded-xl border border-border bg-card p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><SectionHeader eyebrow="Chain of custody" title="Document integrity summary" action={canVerify(role) && <button disabled={verifyState !== 'idle'} onClick={onVerify} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-60"><ScanLine size={14} />{verifyState === 'idle' ? 'Verify all documents' : 'Verification running'}</button>} /><div className="flex gap-5"><div><div className="label">Total</div><div className="value text-lg">{integrity.total}</div></div><div><div className="label">Verified</div><div className="value text-lg text-emerald-700">{integrity.verified}</div></div><div><div className="label">Issues</div><div className="value text-lg text-red-700">{integrity.issues}</div></div></div></div>{verifyState !== 'idle' && <div className="mt-5 rounded-lg border border-primary/20 bg-secondary p-3"><div className="flex items-center justify-between text-xs font-bold"><span>{progressLabel}</span><span className="font-mono text-[10px] text-primary">{verifyState === 'checking' ? '33%' : verifyState === 'hashes' ? '66%' : '100%'}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card"><div className={`h-full rounded-full bg-primary transition-all duration-500 ${verifyState === 'checking' ? 'w-1/3' : verifyState === 'hashes' ? 'w-2/3' : 'w-full'}`} /></div></div>}</section><section className="rounded-xl border border-border bg-card shadow-sm"><div className="border-b border-border p-5"><SectionHeader eyebrow="Hash records" title="Integrity verification detail" /></div><div className="divide-y divide-border">{integrity.documents.map((document) => <div key={document.documentId} className="grid gap-4 p-5 lg:grid-cols-[1.2fr_1fr_1fr_130px] lg:items-center"><div><Link href={`/documents/${document.documentId}`} className="flex items-center gap-2 text-xs font-bold text-primary hover:underline"><FileCheck2 size={14} />{document.document}</Link><div className="mt-1 font-mono text-[9px] text-muted-foreground">{document.version} · verified {dateLabel(document.lastVerified)}</div></div><div><div className="label">Original SHA-256</div><div className="mt-1 break-all font-mono text-[10px]">{document.originalHash}</div></div><div><div className="label">Current hash</div><div className="mt-1 break-all font-mono text-[10px]">{document.currentHash}</div></div><div><Pill tone={document.status}>{document.status === 'Verified' ? 'Hash match' : 'Mismatch'}</Pill><div className="mt-1 text-[9px] text-muted-foreground">By {document.verifiedBy}</div></div></div>)}</div>{integrity.issues > 0 && <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"><div className="font-bold">Integrity failure detected</div><div className="mt-1">A document hash does not match the recorded hash. Hash checks detect a mismatch; they do not prevent modification.</div><button onClick={() => setTab('documents')} className="mt-2 font-bold underline">View document history</button></div>}</section></div>;
}

function SecurityTab({ security, setLocation }: { security: CaseSecurity; setLocation: (location: string) => void }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <div className="space-y-5">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <SectionHeader eyebrow="Access monitoring" title="Case security overview" />
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-secondary p-3"><div className="label">Risk score</div><div className="mt-1 text-xl font-bold">{security.riskScore}<span className="text-xs text-muted-foreground"> / 100</span></div></div>
            <div className="rounded-lg bg-secondary p-3"><div className="label">Suspicious</div><div className="mt-1 text-xl font-bold">{security.suspiciousActivities}</div></div>
            <div className="rounded-lg bg-secondary p-3"><div className="label">Blocked</div><div className="mt-1 text-xl font-bold">{security.blockedAttempts}</div></div>
            <div className="rounded-lg bg-secondary p-3"><div className="label">Unauthorized</div><div className="mt-1 text-xl font-bold">{security.unauthorizedAccess}</div></div>
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"><AlertTriangle size={15} />{security.riskLevel} risk · review access indicators regularly</div>
        </section>
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <SectionHeader eyebrow="Risk composition" title="Risk score factors" />
          <div className="mt-4 space-y-3">
            {security.factors.map((factor) => <div key={factor.label} className="flex items-center gap-3 text-xs"><span className="min-w-0 flex-1">{factor.label}</span><span className="font-mono text-[10px] font-bold text-amber-700">+{factor.score}</span><div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-amber-500" style={{ width: `${factor.score * 4}%` }} /></div></div>)}
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-3 text-xs font-bold"><span>Total configured indicators</span><span>{security.riskScore}/100</span></div>
        </section>
      </div>
      <div className="space-y-5">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm"><SectionHeader eyebrow="Seven-day signal" title="Security risk trend" /><p className="mt-1 text-[10px] text-muted-foreground">Risk score is calculated from configured access and activity indicators.</p><TrendChart security={security} /></section>
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="p-5"><SectionHeader eyebrow="Security alerts" title="Recent access signals" /></div>
          {security.alerts.length === 0 ? <EmptyState title="No security alerts for this case." /> : <div className="divide-y divide-border">{security.alerts.map((alert) => (
            <div key={alert.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className={`mt-1 grid size-7 shrink-0 place-items-center rounded-lg ${alert.type === 'High risk' ? 'bg-red-50 text-red-700' : alert.type === 'Warning' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{alert.type === 'High risk' ? <ShieldAlert size={14} /> : alert.type === 'Warning' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}</div>
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2 text-xs font-bold">{alert.type}<Pill tone={alert.status}>{alert.status}</Pill></div><div className="mt-1 text-[11px] leading-5">{alert.user} · {alert.reason}</div><div className="mt-1 font-mono text-[9px] text-muted-foreground">{dateLabel(alert.timestamp)} {timeLabel(alert.timestamp)} · score +{alert.score}</div></div>
              </div>
              <button onClick={() => setLocation(`/security/activity/${alert.id}`)} className="ml-10 mt-2 text-[10px] font-bold text-primary hover:underline">View security details</button>
            </div>
          ))}</div>}
        </section>
      </div>
    </div>
  );
}

function EmptyState({ title, action, href }: { title: string; action?: string; href?: string }) {
  return <div className="p-10 text-center"><FolderOpen className="mx-auto text-muted-foreground" size={25} /><p className="mt-3 text-sm font-semibold">{title}</p>{action && href && <Link href={href} className="mt-4 inline-flex rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">{action}</Link>}</div>;
}