import { useState, useMemo } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import {
  Shield, ShieldAlert, ShieldCheck, AlertTriangle, ArrowLeft, Clock3, DownloadCloud,
  FileText, User, Building2, Lock, TrendingUp, BarChart3, Activity, FileSearch,
  Send, CheckCircle2, Eye, Ban, RefreshCw, Printer, X, ChevronRight,
  AlertOctagon, BadgeAlert, Layers, Laptop, HardDriveDownload, Sparkles, Filter
} from 'lucide-react';
import type { Role } from '@/lib/mock-data';

interface ActivityAnalysisProps {
  role?: Role;
}

type OfficerStatus = 'Active' | 'Suspicious' | 'Under Review';

interface SuspiciousEvent {
  id: string;
  time: string;
  timestamp: string;
  event: string;
  category: 'Access Violation' | 'Data Exfiltration' | 'Privilege Escalation' | 'Off-Hours';
  severity: 'Critical' | 'High' | 'Medium';
  target: string;
  caseId: string;
  details: string;
  ipAddress: string;
  status: 'Blocked' | 'Flagged' | 'Logged';
}

export default function ActivityAnalysis({ role = 'Admin' }: ActivityAnalysisProps) {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/security/activity/:id');
  const activityId = params?.id || 'act-1024-sec';

  // Interactive States
  const [officerStatus, setOfficerStatus] = useState<OfficerStatus>('Suspicious');
  const [timelineFilter, setTimelineFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<SuspiciousEvent | null>(null);
  const [activeModal, setActiveModal] = useState<'investigate' | 'report' | 'notify' | 'reviewed' | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Timeline Events Data
  const suspiciousEvents: SuspiciousEvent[] = [
    {
      id: 'EVT-01',
      time: '02:47:18 AM',
      timestamp: 'Today at 02:47:18 IST',
      event: 'Attempted access to restricted case dossier',
      category: 'Access Violation',
      severity: 'Critical',
      target: 'Case_File_C-1026_Classified.enc',
      caseId: 'C-1026',
      details: 'Officer requested decrypted read access to high-profile anti-corruption case file outside designated bureau assignment.',
      ipAddress: '192.168.4.118 (Internal VPN / Terminal #B4)',
      status: 'Blocked',
    },
    {
      id: 'EVT-02',
      time: '02:45:30 AM',
      timestamp: 'Today at 02:45:30 IST',
      event: 'Bulk batch download of forensic evidence records',
      category: 'Data Exfiltration',
      severity: 'Critical',
      target: '18 Evidence Records (Archive_EVD_1024.zip)',
      caseId: 'C-1024',
      details: 'Automated script-like sequential download of 18 chain-of-custody forensic reports within a 45-second window.',
      ipAddress: '192.168.4.118 (Internal VPN / Terminal #B4)',
      status: 'Flagged',
    },
    {
      id: 'EVT-03',
      time: '02:41:05 AM',
      timestamp: 'Today at 02:41:05 IST',
      event: 'Privilege escalation attempt on Root FIR Archive',
      category: 'Privilege Escalation',
      severity: 'High',
      target: 'Root_FIR_Database_2026',
      caseId: 'C-1020',
      details: 'Multiple unauthorized privilege override commands entered to bypass department read-only role restrictions.',
      ipAddress: '192.168.4.118 (Internal VPN / Terminal #B4)',
      status: 'Blocked',
    },
    {
      id: 'EVT-04',
      time: '02:38:19 AM',
      timestamp: 'Today at 02:38:19 IST',
      event: 'Downloaded sensitive witness testimony',
      category: 'Off-Hours',
      severity: 'Medium',
      target: 'Witness_Statement_Confidential_09.pdf',
      caseId: 'C-1024',
      details: 'Document accessed and downloaded during unauthorized operational hours (Standard window: 08:00–20:00).',
      ipAddress: '192.168.4.118 (Internal VPN / Terminal #B4)',
      status: 'Logged',
    },
    {
      id: 'EVT-05',
      time: '02:33:41 AM',
      timestamp: 'Today at 02:33:41 IST',
      event: 'Unauthorized query to unassigned Case C-1027',
      category: 'Access Violation',
      severity: 'High',
      target: 'Financial_Intelligence_Audit_C1027.pdf',
      caseId: 'C-1027',
      details: 'Metadata query and read probe on unassigned multi-jurisdictional intelligence file.',
      ipAddress: '192.168.4.118 (Internal VPN / Terminal #B4)',
      status: 'Flagged',
    },
    {
      id: 'EVT-06',
      time: '02:30:00 AM',
      timestamp: 'Today at 02:30:00 IST',
      event: 'VPN session established from off-network device',
      category: 'Off-Hours',
      severity: 'Medium',
      target: 'Government Secure Gateway (Gateway-S02)',
      caseId: 'SYSTEM',
      details: 'Remote gateway authentication outside regular shift hours with non-standard MAC address signature.',
      ipAddress: '192.168.4.118 (DHCP Pool East)',
      status: 'Logged',
    },
  ];

  const filteredEvents = useMemo(() => {
    if (timelineFilter === 'all') return suspiciousEvents;
    return suspiciousEvents.filter((e) => e.category.toLowerCase().includes(timelineFilter.toLowerCase()) || e.severity.toLowerCase() === timelineFilter.toLowerCase());
  }, [timelineFilter]);

  // Risk Score Gauge Calculations
  const score = 95;
  const radius = 80;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * Math.PI; // Half circle (180 deg)
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative min-h-[calc(100vh-100px)] space-y-6 pb-12">
      {/* Background Cybersecurity Shield & Grid Watermark */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.035]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cyber-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e3a8a" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.5" fill="#0284c7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cyber-grid)" />
        </svg>
      </div>

      {/* Security Classification Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#1e3a8a]/20 bg-[#0f172a] px-4 py-2 text-xs text-white shadow-sm">
        <div className="flex items-center gap-2 font-mono font-bold tracking-wider">
          <span className="flex size-2 animate-pulse rounded-full bg-red-500" />
          <span className="text-[#38bdf8]">CLASSIFIED //</span>
          <span className="text-amber-400">LAW ENFORCEMENT SENSITIVE</span>
          <span className="hidden sm:inline text-slate-400">// OFFICIAL USE ONLY</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] text-slate-300">
          <span>CLEARED FOR: <strong className="text-white">NATIONAL CYBER INTELLIGENCE</strong></span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline">AUDIT REF: <strong className="text-[#38bdf8]">SEC-AUD-2026-089A</strong></span>
        </div>
      </div>

      {/* Page Header */}
      <header className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <Link href="/dashboard" className="transition-colors hover:text-primary">Dashboard</Link>
          <ChevronRight size={13} className="text-muted-foreground/60" />
          <Link href="/dashboard" className="transition-colors hover:text-primary">Security Monitoring</Link>
          <ChevronRight size={13} className="text-muted-foreground/60" />
          <span className="font-semibold text-primary">Activity Analysis</span>
          <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">ID: {activityId}</span>
        </nav>

        {/* Title and Top Actions */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => window.history.length > 1 ? window.history.back() : setLocation('/dashboard')}
              className="group flex size-10 items-center justify-center rounded-lg border border-border bg-muted/50 text-foreground transition-all hover:bg-primary hover:text-white"
              title="Return to previous screen"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
            </button>

            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] text-[#38bdf8] shadow-md ring-2 ring-[#0284c7]/20">
              <ShieldAlert size={24} strokeWidth={2.2} />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Activity Analysis</h1>
                <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300">
                  CRITICAL ANOMALY
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Forensic User Behavioral Telemetry & Automated Threat Assessment · Case Target <strong className="text-foreground">C-1024</strong>
              </p>
            </div>
          </div>

          {/* Action Buttons Top Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveModal('investigate')}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-muted"
            >
              <FileSearch size={15} className="text-primary" />
              <span>Investigate Case</span>
            </button>

            <button
              onClick={() => setActiveModal('report')}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-muted"
            >
              <Printer size={15} className="text-primary" />
              <span>Generate Report</span>
            </button>

            <button
              onClick={() => setActiveModal('notify')}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 shadow-sm transition-all hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
              <Send size={15} />
              <span>Notify Administrator</span>
            </button>

            <button
              onClick={() => setActiveModal('reviewed')}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            >
              <CheckCircle2 size={15} />
              <span>Mark as Reviewed</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-[#0284c7]/40 bg-[#0f172a] px-4 py-3 text-sm text-white shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <Sparkles size={18} className="text-[#38bdf8]" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X size={15} />
          </button>
        </div>
      )}

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ======================================================== */}
        {/* LEFT SECTION – User Activity Summary Card (5 Columns)   */}
        {/* ======================================================== */}
        <section className="space-y-6 lg:col-span-5">
          {/* User Profile & Department Card */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
            {/* Top Accent Line */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1e3a8a] via-[#0284c7] to-[#14b8a6]" />

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Officer Avatar with security badge */}
                <div className="relative">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] text-lg font-bold text-white shadow-md ring-4 ring-[#0284c7]/15">
                    OA
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-card" title="Security Flagged">
                    !
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">Officer A</h2>
                    <span className="font-mono text-xs text-muted-foreground">#IND-88412</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building2 size={13} className="text-primary" />
                    <span>Central Cyber Investigation Division (CCID)</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User size={13} className="text-[#0284c7]" />
                    <span>Senior Investigating Officer</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Security State</span>
                <div className="mt-1">
                  <div className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wide ${
                    officerStatus === 'Suspicious'
                      ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300'
                      : officerStatus === 'Under Review'
                      ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}>
                    <span className={`size-2 rounded-full ${
                      officerStatus === 'Suspicious' ? 'bg-red-600 animate-ping' : officerStatus === 'Under Review' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    {officerStatus}
                  </div>
                </div>
              </div>
            </div>

            {/* Officer Metadata Strip */}
            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center font-mono text-xs">
              <div className="rounded-lg bg-muted/40 p-2">
                <div className="text-[10px] uppercase text-muted-foreground">Security Clearance</div>
                <div className="mt-0.5 font-bold text-foreground">LEVEL TS-03</div>
              </div>
              <div className="rounded-lg bg-muted/40 p-2">
                <div className="text-[10px] uppercase text-muted-foreground">Terminal ID</div>
                <div className="mt-0.5 font-bold text-foreground">WS-DEL-402</div>
              </div>
              <div className="rounded-lg bg-muted/40 p-2">
                <div className="text-[10px] uppercase text-muted-foreground">Shift Schedule</div>
                <div className="mt-0.5 font-bold text-foreground">08:00 - 18:00</div>
              </div>
            </div>

            {/* Interactive Status Switcher */}
            <div className="mt-4 flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs">
              <span className="text-muted-foreground">Change Status:</span>
              <div className="flex items-center gap-1.5">
                {(['Active', 'Suspicious', 'Under Review'] as OfficerStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setOfficerStatus(st);
                      showToast(`Officer status updated to ${st}`);
                    }}
                    className={`rounded px-2 py-1 font-mono text-[10px] font-bold transition-all ${
                      officerStatus === st
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* STATISTICS CARDS (5 Modern Information Cards with Icons) */}
          {/* ======================================================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Activity Telemetry Indicators
              </h3>
              <span className="font-mono text-[11px] text-muted-foreground">Last 24-Hour Cycle</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Stat 1: Normal Daily Access */}
              <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Normal Daily Access
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                    <FileText size={16} />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">
                  3–5 <span className="text-xs font-normal text-muted-foreground font-sans">Documents</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span>Established 30-day baseline</span>
                </div>
              </div>

              {/* Stat 2: Today's Access */}
              <div className="relative overflow-hidden rounded-xl border border-red-200 bg-card p-4 shadow-sm transition-all hover:border-red-400 hover:shadow-md dark:border-red-900/40">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                    Today's Access
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                    <Eye size={16} />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-red-600 font-mono dark:text-red-400">
                  37 <span className="text-xs font-normal text-muted-foreground font-sans">Documents</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-red-600 dark:text-red-400">
                  <TrendingUp size={13} />
                  <span>+740% Surge above normal limit</span>
                </div>
              </div>

              {/* Stat 3: Downloads */}
              <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-card p-4 shadow-sm transition-all hover:border-amber-400 hover:shadow-md dark:border-amber-900/40">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Downloads
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                    <DownloadCloud size={16} />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">
                  24 <span className="text-xs font-normal text-muted-foreground font-sans">Files</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  <BadgeAlert size={13} />
                  <span>High-volume exfiltration alert</span>
                </div>
              </div>

              {/* Stat 4: Unauthorized Attempts */}
              <div className="relative overflow-hidden rounded-xl border border-red-200 bg-card p-4 shadow-sm transition-all hover:border-red-400 hover:shadow-md dark:border-red-900/40">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                    Unauthorized Attempts
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                    <Ban size={16} />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-red-600 font-mono dark:text-red-400">
                  5 <span className="text-xs font-normal text-muted-foreground font-sans">Security Breaches</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-red-600 dark:text-red-400">
                  <AlertOctagon size={13} />
                  <span>All 5 attempts intercepted & logged</span>
                </div>
              </div>

              {/* Stat 5: Activity Time (Span 2 columns on tablet/desktop) */}
              <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md sm:col-span-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Peak Abnormal Activity Time
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-mono text-foreground">02:47 AM</span>
                      <span className="rounded bg-red-100 px-2 py-0.5 font-mono text-[11px] font-bold text-red-700 dark:bg-red-950/80 dark:text-red-300">
                        OFF-HOURS ANOMALY
                      </span>
                    </div>
                  </div>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                    <Clock3 size={18} />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Activity occurred outside standard duty shifts (Authorized: 08:00–18:00). High anomaly probability index (+20 risk weight).
                </p>
              </div>
            </div>
          </div>

          {/* Today's Activity vs Normal Activity Bar Chart */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">Today vs. Normal Activity</h3>
                <p className="text-[11px] text-muted-foreground">Comparative metric breakdown</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded bg-slate-400" /> Normal
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded bg-red-500" /> Today
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3.5">
              {[
                { label: 'Document Views', normal: 4, today: 37, max: 40, unit: 'docs' },
                { label: 'Bulk Downloads', normal: 1, today: 24, max: 40, unit: 'files' },
                { label: 'Off-Hour Logins', normal: 0, today: 5, max: 10, unit: 'sessions' },
                { label: 'Access Violations', normal: 0, today: 5, max: 10, unit: 'flags' },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">{item.label}</span>
                    <span className="font-mono text-xs">
                      <span className="text-muted-foreground">{item.normal}</span> vs{' '}
                      <span className="font-bold text-red-600 dark:text-red-400">{item.today} {item.unit}</span>
                    </span>
                  </div>
                  <div className="flex h-2.5 w-full gap-1 overflow-hidden rounded-full bg-muted/60">
                    <div
                      className="rounded-l-full bg-slate-400/80 transition-all duration-500"
                      style={{ width: `${(item.normal / item.max) * 50}%` }}
                      title={`Normal: ${item.normal}`}
                    />
                    <div
                      className="rounded-r-full bg-red-500 transition-all duration-500"
                      style={{ width: `${(item.today / item.max) * 100}%` }}
                      title={`Today: ${item.today}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* RIGHT SECTION – Risk Assessment Panel (7 Columns)        */}
        {/* ======================================================== */}
        <section className="space-y-6 lg:col-span-7">
          {/* Main Risk Assessment Card */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                  Threat Evaluation Engine
                </span>
                <h2 className="text-lg font-bold text-foreground">Risk Assessment Panel</h2>
              </div>

              {/* Color Coding Legend */}
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-[11px]">
                <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="size-2 rounded-full bg-emerald-500" /> Green = Low
                </span>
                <span className="text-muted-foreground">|</span>
                <span className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                  <span className="size-2 rounded-full bg-amber-500" /> Orange = Med
                </span>
                <span className="text-muted-foreground">|</span>
                <span className="flex items-center gap-1 font-semibold text-red-600 dark:text-red-400">
                  <span className="size-2 rounded-full bg-red-600" /> Red = High
                </span>
              </div>
            </div>

            {/* Risk Score Gauge & Status Banner */}
            <div className="mt-6 flex flex-col items-center justify-center text-center">
              {/* SVG Circular Precision Gauge Meter */}
              <div className="relative flex flex-col items-center">
                <svg
                  width="240"
                  height="140"
                  viewBox="0 0 200 115"
                  className="overflow-visible"
                >
                  <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="45%" stopColor="#f59e0b" />
                      <stop offset="85%" stopColor="#ef4444" />
                    </linearGradient>
                    <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.3" />
                    </filter>
                  </defs>

                  {/* Background Track */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="14"
                    strokeLinecap="round"
                    className="text-muted/70"
                  />

                  {/* Progress Arc */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    filter="url(#gaugeGlow)"
                    className="transition-all duration-1000 ease-out"
                  />

                  {/* Zone Tick Labels */}
                  <text x="18" y="114" className="fill-muted-foreground font-mono text-[9px]">0</text>
                  <text x="96" y="24" className="fill-muted-foreground font-mono text-[9px]">50</text>
                  <text x="175" y="114" className="fill-muted-foreground font-mono text-[9px]">100</text>
                </svg>

                {/* Score Number Display */}
                <div className="mt-[-45px] text-center">
                  <div className="flex items-baseline justify-center font-mono font-bold tracking-tight text-red-600 dark:text-red-400">
                    <span className="text-5xl">95</span>
                    <span className="text-lg text-muted-foreground">/100</span>
                  </div>
                  <div className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Calculated Threat Index
                  </div>
                </div>
              </div>

              {/* Status Banner Display */}
              <div className="mt-4 flex items-center justify-center gap-2 rounded-full border border-red-300 bg-red-50 px-5 py-1.5 text-sm font-extrabold text-red-700 shadow-sm dark:border-red-900/60 dark:bg-red-950/70 dark:text-red-200">
                <span className="size-2.5 rounded-full bg-red-600 animate-ping" />
                <span>🔴 HIGH-RISK ACTIVITY</span>
              </div>
            </div>

            {/* Risk Calculation Table */}
            <div className="mt-6 rounded-lg border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between border-b border-border/80 pb-2">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Risk Calculation Breakdown
                </h4>
                <span className="font-mono text-[11px] text-muted-foreground">Point Allocation</span>
              </div>

              <div className="mt-3 space-y-2.5 font-mono text-xs">
                {[
                  { factor: 'Unusual Time', points: '+20', weight: 20, desc: 'Off-hours window (02:00–04:00 AM)' },
                  { factor: 'Excessive Downloads', points: '+25', weight: 25, desc: '24 files vs standard threshold 5' },
                  { factor: 'Unassigned Cases', points: '+30', weight: 30, desc: 'Probed Case C-1026 & C-1027' },
                  { factor: 'Failed Attempts', points: '+20', weight: 20, desc: '5 access violation attempts' },
                ].map((item) => (
                  <div key={item.factor} className="flex items-center justify-between py-1 text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.factor}</span>
                      <span className="hidden sm:inline text-[10px] text-muted-foreground font-sans">({item.desc})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:block">
                        <div className="h-full rounded-full bg-red-500" style={{ width: `${(item.weight / 30) * 100}%` }} />
                      </div>
                      <span className="font-bold text-red-600 dark:text-red-400">{item.points}</span>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between border-t-2 border-dashed border-border pt-3 text-sm font-bold">
                  <span className="text-foreground font-sans">Total Risk Score</span>
                  <span className="text-base text-red-600 font-mono dark:text-red-400">95 / 100</span>
                </div>
              </div>
            </div>

            {/* Explanation Section: AI Security Assessment Card */}
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50/70 p-4 shadow-sm dark:border-red-900/50 dark:bg-red-950/30">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-900/70 dark:text-red-300">
                  <AlertTriangle size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-red-900 dark:text-red-200">
                      AI Security Assessment
                    </h4>
                    <span className="rounded bg-red-200/70 px-1.5 py-0.5 font-mono text-[9px] font-bold text-red-800 dark:bg-red-900/80 dark:text-red-200">
                      CONFIDENCE: 99.4%
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-red-800/90 dark:text-red-300">
                    "User accessed significantly more documents than their normal behavior pattern and attempted access to restricted cases outside assigned responsibilities. Multiple failed access attempts and unusual working hours increase the overall security risk."
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-medium text-red-800 dark:text-red-300">
                    <span className="flex items-center gap-1 font-mono">
                      <CheckCircle2 size={12} className="text-red-600" />
                      Zero-Trust Anomaly Engine v3.2
                    </span>
                    <span>·</span>
                    <span>Trigger: Heuristic Deviation #SEC-991</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Components: Risk Trend Chart & Historical Comparison */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">Risk Trend & Historical Comparison</h3>
                <p className="text-[11px] text-muted-foreground">24-hour telemetry curve vs 30-day baseline</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-muted px-2 py-1 font-mono text-[10px] font-semibold text-muted-foreground">
                  Interval: 1 hr
                </span>
              </div>
            </div>

            {/* SVG Visual Trend Chart */}
            <div className="mt-4">
              <div className="relative h-44 w-full">
                <svg
                  viewBox="0 0 500 140"
                  preserveAspectRatio="none"
                  className="h-full w-full"
                  role="img"
                  aria-label="Security risk trend chart"
                >
                  <defs>
                    <linearGradient id="riskAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
                      <stop offset="80%" stopColor="#ef4444" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="30" y1="20" x2="480" y2="20" stroke="currentColor" strokeDasharray="3 3" className="text-border/80" />
                  <line x1="30" y1="60" x2="480" y2="60" stroke="currentColor" strokeDasharray="3 3" className="text-border/80" />
                  <line x1="30" y1="100" x2="480" y2="100" stroke="currentColor" strokeDasharray="3 3" className="text-border/80" />

                  {/* Axis labels */}
                  <text x="10" y="24" className="fill-muted-foreground font-mono text-[9px]">100</text>
                  <text x="10" y="64" className="fill-muted-foreground font-mono text-[9px]">50</text>
                  <text x="10" y="104" className="fill-muted-foreground font-mono text-[9px]">10</text>

                  {/* Historical Baseline Line (Gray) */}
                  <path
                    d="M 30 102 Q 120 100 200 104 T 350 101 T 480 102"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />

                  {/* Today's Risk Curve (Red Spike at 02:47 AM) */}
                  {/* Points: 00:00 (10), 01:00 (12), 02:00 (15), 02:30 (45), 02:47 (95), 03:00 (88), 03:30 (80) */}
                  <path
                    d="M 30 105 L 100 102 L 170 98 L 240 70 L 310 24 L 380 32 L 450 40 L 480 45 L 480 115 L 30 115 Z"
                    fill="url(#riskAreaGradient)"
                  />
                  <path
                    d="M 30 105 L 100 102 L 170 98 L 240 70 L 310 24 L 380 32 L 450 40 L 480 45"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Anomaly Highlight Marker at 02:47 AM */}
                  <circle cx="310" cy="24" r="5" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                  <text x="316" y="20" className="fill-red-600 font-mono text-[10px] font-bold">95 (02:47 AM)</text>
                </svg>
              </div>

              {/* Time X-Axis */}
              <div className="mt-1 flex justify-between px-7 font-mono text-[10px] text-muted-foreground">
                <span>22:00</span>
                <span>00:00</span>
                <span>01:00</span>
                <span>02:00</span>
                <span className="font-bold text-red-600">02:47 (Peak)</span>
                <span>03:30</span>
                <span>Current</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ======================================================== */}
      {/* TIMELINE OF SUSPICIOUS EVENTS (Full Width)               */}
      {/* ======================================================== */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Timeline of Suspicious Events</h3>
              <p className="text-xs text-muted-foreground">Chronological audit ledger of flagged operations</p>
            </div>
          </div>

          {/* Timeline Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 text-xs">
              {['all', 'Access Violation', 'Data Exfiltration', 'Privilege Escalation', 'Off-Hours'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTimelineFilter(f)}
                  className={`rounded px-2.5 py-1 font-mono text-[11px] font-semibold transition-all ${
                    timelineFilter === f
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {f === 'all' ? 'All Events' : f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Events List */}
        <div className="mt-5 space-y-4">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm sm:flex-row sm:items-start"
            >
              {/* Left Column: Timestamp & Severity */}
              <div className="flex shrink-0 items-center gap-3 sm:w-44 sm:flex-col sm:items-start sm:gap-1">
                <span className="font-mono text-xs font-bold text-foreground">{evt.time}</span>
                <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                  evt.severity === 'Critical'
                    ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                    : evt.severity === 'High'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                }`}>
                  <span className="size-1.5 rounded-full bg-current" />
                  {evt.severity}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">{evt.id}</span>
              </div>

              {/* Center Column: Description, File, Case */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-foreground">{evt.event}</h4>
                  <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px] font-bold text-secondary-foreground">
                    {evt.category}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{evt.details}</p>

                <div className="mt-2.5 flex flex-wrap items-center gap-3 font-mono text-[11px]">
                  <span className="flex items-center gap-1 text-primary">
                    <FileText size={13} />
                    <strong>Target:</strong> {evt.target}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">
                    <strong>Case:</strong> {evt.caseId}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">
                    <strong>Terminal:</strong> {evt.ipAddress}
                  </span>
                </div>
              </div>

              {/* Right Column: Event Status & Action */}
              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border pt-2 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase ${
                  evt.status === 'Blocked'
                    ? 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-300'
                    : evt.status === 'Flagged'
                    ? 'border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300'
                }`}>
                  {evt.status}
                </span>

                <button
                  onClick={() => {
                    setSelectedEvent(evt);
                    setActiveModal('investigate');
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forensic Trace →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* INTERACTIVE MODALS                                       */}
      {/* ======================================================== */}

      {/* 1. Investigate Case Modal */}
      {activeModal === 'investigate' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileSearch size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Initiate Forensic Investigation</h3>
                  <p className="text-xs text-muted-foreground">Dossier Target: Case C-1024 / Subject: Officer A</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="font-bold text-foreground">Investigation Scope:</div>
                <ul className="mt-1 list-inside list-disc space-y-1 text-muted-foreground">
                  <li>Freeze session tokens and isolate terminal WS-DEL-402</li>
                  <li>Cryptographic verification of all 24 downloaded files</li>
                  <li>Cross-examine access logs with Case C-1026 restricted team registry</li>
                  <li>Issue summons for biometric verification of Officer A</li>
                </ul>
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                <strong>Chain of Custody Notice:</strong> Initiating an active investigation logs an immutable cryptographic audit record under National Evidence Act guidelines.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  showToast('Forensic investigation case docket opened successfully.');
                  setLocation('/cases/C-1024');
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
              >
                <span>Launch Investigation</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Generate Report Modal */}
      {activeModal === 'report' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#0284c7]/15 text-[#0284c7]">
                  <Printer size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Generate Security Incident Report</h3>
                  <p className="text-xs text-muted-foreground">Official Government Dossier Export (Format: PDF / A4)</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-border p-3 font-mono text-xs">
                <div className="flex justify-between py-1 text-muted-foreground">
                  <span>Document Title:</span>
                  <span className="font-bold text-foreground">SEC-INCIDENT-REPORT-88412.pdf</span>
                </div>
                <div className="flex justify-between py-1 text-muted-foreground">
                  <span>Classification:</span>
                  <span className="font-bold text-red-600">CONFIDENTIAL // HIGH RISK</span>
                </div>
                <div className="flex justify-between py-1 text-muted-foreground">
                  <span>Risk Score:</span>
                  <span className="font-bold text-red-600">95 / 100</span>
                </div>
                <div className="flex justify-between py-1 text-muted-foreground">
                  <span>Included Sections:</span>
                  <span className="text-foreground">Telemetry, Risk Table, AI Assessment, Event Ledger</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  showToast('Security dossier compiled and saved as SEC-REPORT-C1024.pdf');
                  window.print();
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
              >
                <DownloadCloud size={15} />
                <span>Export & Print Dossier</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Notify Administrator Modal */}
      {activeModal === 'notify' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
                  <Send size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Alert Command Staff</h3>
                  <p className="text-xs text-muted-foreground">Priority Dispatches to CISO & Department Heads</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-muted-foreground">
                This will trigger an immediate high-priority SMS and secure email alert to the Security Operations Center (SOC) on-call administrator.
              </p>

              <div className="rounded-lg bg-muted/40 p-3 font-mono">
                <div className="text-muted-foreground">ALERT SUMMARY:</div>
                <div className="mt-1 font-bold text-red-600 dark:text-red-400">
                  [PRIORITY 1] Potential insider threat / abnormal data extraction by Officer A on Case C-1024 (Score: 95/100).
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  showToast('Critical alert dispatched to CISO and Command Center.');
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                <Send size={14} />
                <span>Confirm & Dispatch Alert</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Mark as Reviewed Modal */}
      {activeModal === 'reviewed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Sign-off & Mark as Reviewed</h3>
                  <p className="text-xs text-muted-foreground">Record supervisory audit assessment</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-xs font-semibold text-foreground">
                Reviewer Operational Notes:
              </label>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Enter review notes e.g., 'Incident corroborated with Officer A\'s shift supervisor; access quarantine requested.'"
                className="w-full rounded-lg border border-border bg-muted/20 p-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock size={13} />
                <span>Audit entry will be signed with: <strong>{role} (Session Active)</strong></span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setOfficerStatus('Under Review');
                  showToast('Activity analysis marked as reviewed. Status set to Under Review.');
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
              >
                <CheckCircle2 size={14} />
                <span>Submit Sign-Off</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
