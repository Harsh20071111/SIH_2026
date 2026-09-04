import { useEffect, useState } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import { ArrowLeft, Save, ShieldAlert } from 'lucide-react';
import { useCases } from '@/hooks/use-cases';
import { canViewCase, getCaseById, type CasePriority, type CaseRecord, type CaseRisk, type CaseStatus } from '@/lib/case-service';
import type { Role } from '@/lib/mock-data';

export default function EditCase({ role }: { role: Role }) {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/cases/:id/edit');
  const { update } = useCases();
  const [item, setItem] = useState<CaseRecord | null>(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<CaseStatus>('Active');
  const [risk, setRisk] = useState<CaseRisk>('Medium');
  const [priority, setPriority] = useState<CasePriority>('Medium');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    void getCaseById(params?.id ?? '').then((result) => {
      if (!active) return;
      setItem(result ?? null);
      if (result) { setTitle(result.title); setStatus(result.status); setRisk(result.risk); setPriority(result.priority); }
      setLoading(false);
    });
    return () => { active = false; };
  }, [params?.id]);
  if (loading) return <div data-testid="state-edit-case-loading" className="animate-pulse space-y-5"><div className="h-4 w-28 rounded bg-muted" /><div className="h-10 w-72 rounded bg-muted" /><div className="h-64 rounded-xl border border-border bg-card" /></div>;
  if (!item || !canViewCase(item, role) || (role !== 'Admin' && role !== 'Officer')) return <div data-testid="state-edit-case-denied" className="py-20 text-center"><ShieldAlert className="mx-auto text-red-700" size={30} /><h1 className="mt-4 text-xl font-bold">Edit access restricted</h1><p className="mt-2 text-sm text-muted-foreground">Your current role cannot modify this case record.</p><Link href={`/cases/${params?.id ?? ''}`} data-testid="link-return-case-edit-denied" className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">Return to case</Link></div>;
  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await update(item.id, { title: title.trim(), status, risk, priority });
    setLocation(`/cases/${item.id}`);
  };
  return <div className="mx-auto max-w-2xl space-y-6"><Link href={`/cases/${item.id}`} data-testid="link-back-edit-case" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"><ArrowLeft size={15} />Back to case</Link><section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"><div className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-primary">{item.id} · protected record</div><h1 data-testid="heading-edit-case" className="mt-2 text-2xl font-bold">Edit case</h1><p className="mt-2 text-sm text-muted-foreground">Changes are recorded in the case audit trail.</p><div className="mt-7 space-y-5"><label className="block text-xs font-bold">Case title<input data-testid="input-edit-page-case-title" value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /></label><div className="grid gap-4 sm:grid-cols-3"><label className="block text-xs font-bold">Status<select data-testid="select-edit-page-case-status" value={status} onChange={(event) => setStatus(event.target.value as CaseStatus)} className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-2 text-xs">{(['Active', 'Under Investigation', 'Under Review', 'Closed', 'Archived'] as CaseStatus[]).map((value) => <option key={value}>{value}</option>)}</select></label><label className="block text-xs font-bold">Risk<select data-testid="select-edit-page-case-risk" value={risk} onChange={(event) => setRisk(event.target.value as CaseRisk)} className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-2 text-xs">{(['Low', 'Medium', 'High'] as CaseRisk[]).map((value) => <option key={value}>{value}</option>)}</select></label><label className="block text-xs font-bold">Priority<select data-testid="select-edit-page-case-priority" value={priority} onChange={(event) => setPriority(event.target.value as CasePriority)} className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-2 text-xs">{(['Low', 'Medium', 'High'] as CasePriority[]).map((value) => <option key={value}>{value}</option>)}</select></label></div></div><div className="mt-7 flex justify-end gap-2 border-t border-border pt-5"><Link href={`/cases/${item.id}`} data-testid="link-cancel-edit-page" className="rounded-lg border border-border px-3 py-2 text-xs font-bold hover:bg-muted">Cancel</Link><button data-testid="button-submit-edit-page" disabled={saving || !title.trim()} onClick={() => void save()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"><Save size={14} />{saving ? 'Saving…' : 'Save changes'}</button></div></section></div>;
}