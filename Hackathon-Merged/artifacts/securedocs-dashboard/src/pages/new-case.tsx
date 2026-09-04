import { useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ArrowLeft, CalendarDays, Check, ChevronRight, CircleHelp, FileCheck2, LockKeyhole, Save, ShieldAlert, ShieldCheck, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useLocation } from 'wouter';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { useCases } from '@/hooks/use-cases';
import { checkCaseIdExists, getNextCaseId, getOfficersByDepartment, type CasePriority, type ConfidentialityLevel } from '@/lib/case-service';
import type { Role } from '@/lib/mock-data';

const CASE_TYPES = ['Theft', 'Fraud', 'Cyber Crime', 'Investigation', 'Missing Person', 'Financial Crime', 'Other'] as const;
const DEPARTMENTS = ['Investigation', 'Cyber Crime', 'Financial Crime', 'Legal Department', 'Forensic Department', 'Other'] as const;
const PRIORITIES: CasePriority[] = ['Low', 'Medium', 'High'];
const CONFIDENTIALITY_LEVELS: ConfidentialityLevel[] = ['Public/Internal', 'Confidential', 'Restricted', 'Highly Restricted'];
const DESCRIPTION_LIMIT = 1000;
const CASE_ID_PATTERN = /^C-\d{4,}$/i;

const caseSchema = z.object({
  caseId: z.string().trim().min(1, 'Case ID is required.').regex(CASE_ID_PATTERN, 'Use a Case ID such as C-1049.'),
  title: z.string().trim().min(3, 'Case title must be at least 3 characters.'),
  type: z.string().min(1, 'Select a case type.'),
  description: z.string().trim().min(1, 'Description is required.').max(DESCRIPTION_LIMIT, `Description must be ${DESCRIPTION_LIMIT} characters or fewer.`),
  department: z.string().min(1, 'Select a department.'),
  assignedOfficer: z.string().min(1, 'Select an authorized officer.'),
  priority: z.enum(['Low', 'Medium', 'High']),
  startDate: z.string().min(1, 'Start date is required.').refine((value) => value <= localDate(), 'Start date cannot be in the future.'),
  confidentiality: z.enum(['Public/Internal', 'Confidential', 'Restricted', 'Highly Restricted']),
});

type CaseFormValues = z.infer<typeof caseSchema>;
type Availability = 'unknown' | 'checking' | 'available' | 'exists';

function localDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

const initialValues: CaseFormValues = {
  caseId: '',
  title: '',
  type: 'Investigation',
  description: '',
  department: 'Investigation',
  assignedOfficer: 'Officer A',
  priority: 'Medium',
  startDate: localDate(),
  confidentiality: 'Confidential',
};

const inputClass = 'mt-2 h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/65 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60';
const errorInputClass = 'border-destructive/70 focus:border-destructive focus:ring-destructive/10';

function FieldError({ message, testId }: { message?: string; testId: string }) {
  if (!message) return null;
  return <p data-testid={testId} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-destructive"><AlertTriangle size={13} />{message}</p>;
}

function SectionHeading({ icon: Icon, eyebrow, title, description }: { icon: typeof FileCheck2; eyebrow: string; title: string; description: string }) {
  return <div className="flex items-start gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary"><Icon size={17} /></div><div><div className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-primary/80">{eyebrow}</div><h2 className="mt-1 text-base font-bold tracking-tight">{title}</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p></div></div>;
}

function RequiredMark() {
  return <span aria-hidden="true" className="ml-1 text-destructive">*</span>;
}

export default function NewCase({ role }: { role: Role }) {
  const [, setLocation] = useLocation();
  const { create } = useCases();
  const [saving, setSaving] = useState(false);
  const [createdCase, setCreatedCase] = useState<{ id: string; officer: string } | null>(null);
  const [availability, setAvailability] = useState<Availability>('unknown');
  const checkSequence = useRef(0);
  const today = useMemo(() => localDate(), []);
  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: { ...initialValues, caseId: getNextCaseId() },
    mode: 'onTouched',
  });
  const { register, watch, setValue, getValues, setError, clearErrors, formState: { errors } } = form;
  const department = watch('department');
  const priority = watch('priority');
  const confidentiality = watch('confidentiality');
  const description = watch('description');
  const watchedValues = watch();
  const officers = useMemo(() => getOfficersByDepartment(department), [department]);

  useEffect(() => {
    const stillAuthorized = officers.some((officer) => officer.name === getValues('assignedOfficer'));
    if (!stillAuthorized) {
      setValue('assignedOfficer', officers[0]?.name ?? '', { shouldValidate: true });
    }
  }, [getValues, officers, setValue]);

  const validateIdAvailability = async (value: string) => {
    const normalized = value.trim().toUpperCase();
    if (!CASE_ID_PATTERN.test(normalized)) return false;
    const sequence = ++checkSequence.current;
    setAvailability('checking');
    const exists = await checkCaseIdExists(normalized);
    if (sequence !== checkSequence.current) return false;
    if (exists) {
      setAvailability('exists');
      setError('caseId', { type: 'validate', message: 'This Case ID is already in use.' });
      return false;
    }
    setAvailability('available');
    clearErrors('caseId');
    if (getValues('caseId') !== normalized) setValue('caseId', normalized);
    return true;
  };

  const onSubmit = async (values: CaseFormValues) => {
    if (saving) return;
    const normalizedId = values.caseId.trim().toUpperCase();
    const idIsAvailable = await validateIdAvailability(normalizedId);
    if (!idIsAvailable) return;
    setSaving(true);
    try {
      const createdAt = new Date().toISOString();
      const created = await create({
        id: normalizedId,
        caseId: normalizedId,
        title: values.title.trim(),
        type: values.type,
        description: values.description.trim(),
        department: values.department,
        assignedOfficer: values.assignedOfficer,
        priority: values.priority,
        startDate: values.startDate,
        confidentiality: values.confidentiality,
        status: 'Active',
        createdAt,
        createdBy: role,
        risk: values.priority,
        documents: 0,
        lastActivity: createdAt,
      });
      setCreatedCase({ id: created.id, officer: created.assignedOfficer ?? created.officer });
      window.setTimeout(() => setLocation(`/cases/${created.id}`), 1000);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'The case could not be created. Try again.';
      if (message.toLowerCase().includes('already exists')) {
        setAvailability('exists');
        setError('caseId', { type: 'validate', message: 'This Case ID is already in use.' });
      } else {
        setError('root', { type: 'server', message });
      }
      setSaving(false);
    }
  };

  if (role !== 'Admin' && role !== 'Officer') {
    return <div data-testid="state-new-case-access-denied" className="mx-auto max-w-xl py-12 sm:py-20"><div className="rounded-2xl border border-destructive/20 bg-card p-7 text-center shadow-sm sm:p-10"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive"><ShieldAlert size={27} /></div><div className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[.2em] text-destructive">403 · restricted action</div><h1 className="mt-2 text-2xl font-bold tracking-tight">Access Denied</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">Your current role is not authorized to create a case. Contact an administrator if you need this permission.</p><Link href="/cases" data-testid="link-return-cases-access-denied" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground"><ArrowLeft size={14} />Return to Cases</Link></div></div>;
  }

  if (createdCase) {
    return <div data-testid="state-case-created" className="mx-auto max-w-xl py-12 sm:py-20"><div className="rounded-2xl border border-emerald-200 bg-card p-7 text-center shadow-sm sm:p-10"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Check size={28} strokeWidth={2.5} /></div><div className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[.2em] text-emerald-700">Audit handoff complete</div><h1 className="mt-2 text-2xl font-bold tracking-tight">Case Created Successfully</h1><p data-testid="text-case-created-success" className="mt-3 text-sm leading-relaxed text-muted-foreground">Case {createdCase.id} has been successfully created and assigned to {createdCase.officer}.</p><div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-primary"><span className="size-1.5 animate-pulse rounded-full bg-primary" />Opening protected case record</div></div></div>;
  }

  return <div data-testid="page-new-case" className="mx-auto max-w-[1160px] space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.15em] text-muted-foreground"><Link href="/cases" data-testid="link-breadcrumb-cases" className="hover:text-primary">Cases</Link><ChevronRight size={13} /><span className="text-primary">Create New Case</span></div>
        <h1 data-testid="heading-new-case" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Create New Case</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Create and assign a new legal or investigation case</p>
      </div>
      <Link href="/cases" data-testid="link-back-new-case" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><ArrowLeft size={15} />Back to Cases</Link>
    </div>

    <Form {...form}>
      <form data-testid="form-new-case" onSubmit={(event) => { void form.handleSubmit(onSubmit)(event); }} className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-secondary/40 px-5 py-4 sm:px-7"><div className="flex items-center gap-2 text-xs font-bold text-primary"><ShieldCheck size={15} />Protected metadata intake</div><p className="mt-1 text-[11px] text-muted-foreground">Documents are not part of this form and their contents are never exposed.</p></div>
          <div className="space-y-8 p-5 sm:p-7">
            <section data-testid="section-case-information">
              <SectionHeading icon={FileCheck2} eyebrow="01 · metadata" title="Case Information" description="Establish the protected record before any documents are attached." />
              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="case-id" className="text-xs font-bold">Case ID<RequiredMark /></label>
                  <div className="relative">
                    <input id="case-id" data-testid="input-new-case-id" {...register('caseId', { onBlur: (event) => { void validateIdAvailability(event.target.value); } })} className={`${inputClass} pr-28 ${errors.caseId ? errorInputClass : ''}`} aria-describedby="case-id-help" placeholder="C-1049" />
                    {availability !== 'unknown' && <span data-testid="status-case-id-availability" className={`absolute right-3 top-1/2 mt-1 flex -translate-y-1/2 items-center gap-1 text-[10px] font-bold ${availability === 'exists' ? 'text-destructive' : availability === 'checking' ? 'text-muted-foreground' : 'text-emerald-700'}`}>{availability === 'checking' ? 'Checking' : availability === 'exists' ? 'In use' : <><Check size={12} />Available</>}</span>}
                  </div>
                  <p id="case-id-help" className="mt-1.5 text-[11px] text-muted-foreground">Use a stable identifier such as C-1049. It can be edited before creation.</p>
                  <FieldError message={errors.caseId?.message} testId="error-new-case-id" />
                </div>
                <div>
                  <label htmlFor="case-title" className="text-xs font-bold">Case title<RequiredMark /></label>
                  <input id="case-title" data-testid="input-new-case-title" {...register('title')} className={`${inputClass} ${errors.title ? errorInputClass : ''}`} placeholder="e.g. Regional evidence review" />
                  <FieldError message={errors.title?.message} testId="error-new-case-title" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="case-type" className="text-xs font-bold">Case type<RequiredMark /></label>
                    <select id="case-type" data-testid="select-new-case-type" {...register('type')} className={`${inputClass} ${errors.type ? errorInputClass : ''}`}><option value="">Select case type</option>{CASE_TYPES.map((option) => <option key={option} value={option}>{option}</option>)}</select>
                    <FieldError message={errors.type?.message} testId="error-new-case-type" />
                  </div>
                  <div>
                    <label htmlFor="start-date" className="text-xs font-bold">Start date<RequiredMark /></label>
                    <div className="relative"><CalendarDays size={16} className="pointer-events-none absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-muted-foreground" /><input id="start-date" type="date" max={today} data-testid="input-new-case-start-date" {...register('startDate')} className={`${inputClass} pr-10 ${errors.startDate ? errorInputClass : ''}`} /></div>
                    <FieldError message={errors.startDate?.message} testId="error-new-case-start-date" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between"><label htmlFor="case-description" className="text-xs font-bold">Description<RequiredMark /></label><span data-testid="text-description-count" className={`font-mono text-[10px] ${description.length > DESCRIPTION_LIMIT ? 'text-destructive' : 'text-muted-foreground'}`}>{description.length}/{DESCRIPTION_LIMIT}</span></div>
                  <textarea id="case-description" data-testid="textarea-new-case-description" {...register('description')} maxLength={DESCRIPTION_LIMIT} rows={5} className={`mt-2 min-h-[124px] w-full resize-y rounded-lg border border-input bg-background px-3.5 py-3 text-sm leading-relaxed outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/65 focus:border-primary focus:ring-4 focus:ring-primary/10 ${errors.description ? errorInputClass : ''}`} placeholder="Summarize the matter and intended scope. Do not include document contents." />
                  <FieldError message={errors.description?.message} testId="error-new-case-description" />
                </div>
              </div>
            </section>

            <div className="border-t border-border" />
            <section data-testid="section-case-assignment">
              <SectionHeading icon={UserRound} eyebrow="02 · ownership" title="Case Assignment" description="Route the case to an active, authorized officer in the responsible department." />
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="case-department" className="text-xs font-bold">Department<RequiredMark /></label>
                  <select id="case-department" data-testid="select-new-case-department" {...register('department')} className={`${inputClass} ${errors.department ? errorInputClass : ''}`}><option value="">Select department</option>{DEPARTMENTS.map((option) => <option key={option} value={option}>{option}</option>)}</select>
                  <FieldError message={errors.department?.message} testId="error-new-case-department" />
                </div>
                <div>
                  <label htmlFor="assigned-officer" className="text-xs font-bold">Assigned officer<RequiredMark /></label>
                  <select id="assigned-officer" data-testid="select-new-case-officer" {...register('assignedOfficer')} disabled={!department || officers.length === 0} className={`${inputClass} ${errors.assignedOfficer ? errorInputClass : ''}`}><option value="">Select an authorized officer</option>{officers.map((officer) => <option key={officer.name} value={officer.name}>{officer.name} · {officer.department}</option>)}</select>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">{officers.length ? `${officers.length} active authorized officer${officers.length === 1 ? '' : 's'} available` : 'No active officers are available for this department.'}</p>
                  <FieldError message={errors.assignedOfficer?.message} testId="error-new-case-officer" />
                </div>
              </div>
            </section>

            <div className="border-t border-border" />
            <section data-testid="section-case-controls">
              <SectionHeading icon={LockKeyhole} eyebrow="03 · controls" title="Priority & Confidentiality" description="Set the initial handling posture for this protected case." />
              <div className="mt-6 space-y-6">
                <div>
                  <div className="text-xs font-bold">Case priority<RequiredMark /></div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">{PRIORITIES.map((option) => <button type="button" key={option} data-testid={`button-priority-${option.toLowerCase()}`} aria-pressed={priority === option} onClick={() => setValue('priority', option, { shouldValidate: true, shouldDirty: true })} className={`rounded-lg border px-3 py-3 text-left transition-colors focus:outline-none focus:ring-4 focus:ring-primary/10 ${priority === option ? 'border-primary bg-secondary text-primary' : 'border-border bg-background hover:border-primary/50'}`}><span className="flex items-center justify-between text-xs font-bold">{option}{priority === option && <Check size={14} />}</span><span className="mt-1 block text-[10px] text-muted-foreground">{option === 'Low' ? 'Routine handling' : option === 'Medium' ? 'Standard review' : 'Immediate attention'}</span></button>)}</div>
                  <FieldError message={errors.priority?.message} testId="error-new-case-priority" />
                </div>
                <div>
                  <div className="text-xs font-bold">Confidentiality level<RequiredMark /></div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">{CONFIDENTIALITY_LEVELS.map((option) => <button type="button" key={option} data-testid={`button-confidentiality-${option.toLowerCase().replaceAll('/', '-')}`} aria-pressed={confidentiality === option} onClick={() => setValue('confidentiality', option, { shouldValidate: true, shouldDirty: true })} className={`rounded-lg border px-3 py-3 text-left transition-colors focus:outline-none focus:ring-4 focus:ring-primary/10 ${confidentiality === option ? 'border-primary bg-secondary text-primary' : 'border-border bg-background hover:border-primary/50'}`}><span className="flex items-center justify-between text-xs font-bold">{option}{confidentiality === option && <Check size={14} />}</span></button>)}</div>
                  <p data-testid="text-confidentiality-explanation" className="mt-2 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground"><CircleHelp size={14} className="mt-0.5 shrink-0 text-primary" />Access to documents is controlled by confidentiality level and user role.</p>
                  <FieldError message={errors.confidentiality?.message} testId="error-new-case-confidentiality" />
                </div>
              </div>
            </section>
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-border bg-muted/25 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7"><p className="text-[11px] text-muted-foreground"><RequiredMark /> Required fields</p><div className="flex gap-2 sm:ml-auto"><Link href="/cases" data-testid="link-cancel-new-case" className="inline-flex flex-1 items-center justify-center rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-bold hover:bg-muted sm:flex-none">Cancel</Link><button type="submit" data-testid="button-submit-new-case" disabled={saving || form.formState.isSubmitting} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55 sm:flex-none">{saving ? <><span className="size-3 animate-pulse rounded-full bg-current" />Creating Case...</> : <><Save size={14} />Create Case</>}</button></div></div>
          {errors.root?.message && <p data-testid="error-new-case-submit" className="border-t border-destructive/15 bg-destructive/5 px-5 py-3 text-xs font-medium text-destructive sm:px-7">{errors.root.message}</p>}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-[100px]">
          <section data-testid="card-creation-summary" className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-primary px-5 py-5 text-primary-foreground sm:px-6"><div className="flex items-center gap-2 text-xs font-bold"><FileCheck2 size={16} />Creation summary</div><p className="mt-1 text-[11px] text-primary-foreground/70">Review the metadata handoff before creating.</p></div>
            <div className="divide-y divide-border px-5 sm:px-6">{[['Case ID', watchedValues.caseId, 'summary-case-id'], ['Title', watchedValues.title || 'Not provided', 'summary-case-title'], ['Type', watchedValues.type || 'Not selected', 'summary-case-type'], ['Department', watchedValues.department || 'Not selected', 'summary-case-department'], ['Assigned officer', watchedValues.assignedOfficer || 'Not selected', 'summary-case-officer'], ['Priority', watchedValues.priority, 'summary-case-priority'], ['Start date', watchedValues.startDate || 'Not selected', 'summary-case-start-date'], ['Confidentiality', watchedValues.confidentiality, 'summary-case-confidentiality']].map(([label, value, testId]) => <div key={label} className="flex items-start justify-between gap-4 py-3"><span className="text-[11px] text-muted-foreground">{label}</span><span data-testid={testId} className="max-w-[62%] text-right text-xs font-bold">{value}</span></div>)}</div>
            <div className="mx-5 mb-5 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs sm:mx-6"><span className="text-emerald-800">Initial status</span><span data-testid="summary-case-status" className="inline-flex items-center gap-1.5 font-bold text-emerald-700"><span className="size-1.5 rounded-full bg-current" />Active</span></div>
          </section>
          <section className="rounded-xl border border-border bg-secondary/55 p-4"><div className="flex items-start gap-3"><div className="grid size-8 shrink-0 place-items-center rounded-lg bg-card text-primary"><LockKeyhole size={15} /></div><div><h3 className="text-xs font-bold">Protected by design</h3><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Only case metadata is collected here. Document contents remain inside the secure evidence workspace.</p></div></div></section>
        </aside>
      </form>
    </Form>
  </div>;
}