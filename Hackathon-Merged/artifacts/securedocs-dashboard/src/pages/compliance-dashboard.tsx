import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  ShieldCheck, ShieldAlert, ChevronRight, ArrowUpRight, Download, CalendarClock,
  CheckCircle2, AlertTriangle, FileText, Lock, GitBranch, History, ClipboardCheck,
  Share2, FileCheck, Eye, BarChart3, TrendingUp, RefreshCw, Settings, BookOpen,
  FileSearch, Database, FolderLock, Users, Clock, Sparkles, Info,
  Check, X, ExternalLink, Filter, Printer, HelpCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/* ================================================================
   DATA DEFINITIONS
   ================================================================ */

interface ChecklistItem {
  id: string;
  name: string;
  category: string;
  status: 'Compliant' | 'Verified' | 'Attention';
  description: string;
  lastVerificationDate: string;
  standard: string;
  controlId: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'chk-1',
    name: 'Access Control',
    category: 'Access Governance',
    status: 'Compliant',
    description: 'Multi-factor authentication enforced, role-based access lists verified across all secure repositories.',
    lastVerificationDate: '04 Sep 2026 · 17:30 IST',
    standard: 'ISO 27001 / A.9',
    controlId: 'AC-01'
  },
  {
    id: 'chk-2',
    name: 'Document Integrity',
    category: 'Document Lifecycle',
    status: 'Compliant',
    description: 'Cryptographic SHA-256 hash chains verified, zero unauthorized byte alterations detected across 4,820 files.',
    lastVerificationDate: '04 Sep 2026 · 18:15 IST',
    standard: 'FIPS 180-4',
    controlId: 'DI-04'
  },
  {
    id: 'chk-3',
    name: 'Version Control',
    category: 'Document Lifecycle',
    status: 'Compliant',
    description: 'Immutable revision trees active; parent-child document relationships fully indexed and signed.',
    lastVerificationDate: '03 Sep 2026 · 22:10 IST',
    standard: 'NIST SP 800-53',
    controlId: 'VC-02'
  },
  {
    id: 'chk-4',
    name: 'Audit Trail',
    category: 'Audit Transparency',
    status: 'Compliant',
    description: 'Non-repudiation audit logging active with NTP synchronized millisecond precision and hash anchoring.',
    lastVerificationDate: '04 Sep 2026 · 18:25 IST',
    standard: 'IT Act 2000 / SOC2',
    controlId: 'AT-08'
  },
  {
    id: 'chk-5',
    name: 'Retention Policy',
    category: 'Data Retention',
    status: 'Compliant',
    description: 'Statutory archive schedules configured, legal hold freeze logic verified for ongoing investigations.',
    lastVerificationDate: '01 Sep 2026 · 14:00 IST',
    standard: 'Public Records Act',
    controlId: 'RP-03'
  },
  {
    id: 'chk-6',
    name: 'Approval Records',
    category: 'Approval Accountability',
    status: 'Compliant',
    description: 'Dual-officer digital signatory chains required and validated for document classification changes.',
    lastVerificationDate: '03 Sep 2026 · 19:40 IST',
    standard: 'CCA / DSC Class 3',
    controlId: 'AR-05'
  },
  {
    id: 'chk-7',
    name: 'Secure Sharing',
    category: 'Secure Collaboration',
    status: 'Compliant',
    description: 'Time-bound cryptographic tokens, view-only watermarks, and zero public exposure links enforced.',
    lastVerificationDate: '02 Sep 2026 · 11:15 IST',
    standard: 'CERT-In Guidelines',
    controlId: 'SS-07'
  }
];

const COMPLIANCE_CATEGORIES = [
  {
    name: 'Access Governance',
    status: 'Compliant',
    score: 96,
    icon: Lock,
    description: 'Identity boundaries, role segregation, and session validation controls.',
    evaluatedItems: '18 / 18 Controls Met',
    policyRef: 'SEC-POL-01'
  },
  {
    name: 'Document Lifecycle',
    status: 'Compliant',
    score: 98,
    icon: FileCheck,
    description: 'Ingestion validation, cryptographic stamping, and immutable chain custody.',
    evaluatedItems: '24 / 24 Controls Met',
    policyRef: 'DOC-POL-04'
  },
  {
    name: 'Audit Transparency',
    status: 'Compliant',
    score: 97,
    icon: Eye,
    description: 'Real-time telemetry, tamper-evident hash chaining, and query audit trails.',
    evaluatedItems: '14 / 14 Controls Met',
    policyRef: 'AUD-POL-02'
  },
  {
    name: 'Data Retention',
    status: 'Compliant',
    score: 90,
    icon: Database,
    description: 'Preservation intervals, purge verification, and statutory legal hold overrides.',
    evaluatedItems: '10 / 11 Controls Met',
    policyRef: 'RET-POL-07'
  },
  {
    name: 'Approval Accountability',
    status: 'Compliant',
    score: 93,
    icon: ClipboardCheck,
    description: 'Signatory hierarchies, digital signing verification, and concurrence trails.',
    evaluatedItems: '12 / 13 Controls Met',
    policyRef: 'APP-POL-09'
  },
  {
    name: 'Secure Collaboration',
    status: 'Compliant',
    score: 92,
    icon: Share2,
    description: 'Zero-trust external token sharing, granular permissions, and dynamic watermarks.',
    evaluatedItems: '11 / 12 Controls Met',
    policyRef: 'COL-POL-03'
  }
];

const BREAKDOWN_DATA = [
  { category: 'Access Control', score: 96, benchmark: 90, delta: '+6%', status: 'Exceeds Target' },
  { category: 'Document Integrity', score: 98, benchmark: 95, delta: '+3%', status: 'Optimal' },
  { category: 'Version Control', score: 95, benchmark: 90, delta: '+5%', status: 'Optimal' },
  { category: 'Audit Trail', score: 97, benchmark: 92, delta: '+5%', status: 'Optimal' },
  { category: 'Retention Policy', score: 90, benchmark: 90, delta: '0%', status: 'Meets Baseline' },
  { category: 'Approval Records', score: 93, benchmark: 90, delta: '+3%', status: 'Optimal' },
  { category: 'Secure Sharing', score: 92, benchmark: 88, delta: '+4%', status: 'Optimal' }
];

const RISK_AREAS = [
  {
    id: 'risk-1',
    title: 'Retention Policy Review',
    severity: 'Medium Warning',
    actionText: 'Review Retention Rules',
    summary: '14 legacy case documents are approaching the 7-year statutory retention threshold and require administrative archival confirmation.',
    recommendation: 'Execute statutory purge evaluation or apply extended judicial hold tag.',
    frequency: 'Bi-annual check due'
  },
  {
    id: 'risk-2',
    title: 'Periodic Approval Audits',
    severity: 'Advisory Warning',
    actionText: 'Audit Approval Chains',
    summary: 'Three inter-departmental approval workflows have not received quarterly re-certification by the designated Section Officer.',
    recommendation: 'Request workflow re-validation from Legal Reviewer lead.',
    frequency: 'Monthly compliance cycle'
  },
  {
    id: 'risk-3',
    title: 'Sharing Permissions Review',
    severity: 'Medium Warning',
    actionText: 'Review Sharing Grants',
    summary: '8 external agency access grants have active viewing privileges older than 21 days without recent collaborator activity.',
    recommendation: 'Trigger automated 48-hour expiration notices for dormant share tokens.',
    frequency: 'Weekly access hygiene'
  }
];

const COMPLIANCE_INSIGHTS = [
  {
    title: 'Zero Critical Gaps',
    description: 'No critical compliance gaps detected across any mandatory regulatory or security framework.',
    tag: 'Verified',
    impact: 'High Confidence'
  },
  {
    title: 'Robust Audit Readiness',
    description: 'Audit readiness remains strong with 97% logging coverage and immutable hash anchors intact.',
    tag: 'Operational',
    impact: 'Audit Ready'
  },
  {
    title: 'Traceability Satisfied',
    description: 'Document traceability requirements satisfied with 100% provenance retention across case files.',
    tag: 'Verified',
    impact: 'Optimal'
  },
  {
    title: 'Enforced Approvals',
    description: 'Approval workflows consistently enforced with zero unauthorized bypasses recorded.',
    tag: 'Operational',
    impact: 'Strict Adherence'
  }
];

const DASHBOARD_METRICS = [
  { label: 'Total Documents', value: '4,820', sub: 'Across 128 active cases', icon: FileText, change: '+124 this month', tone: 'blue' },
  { label: 'Protected Documents', value: '4,796', sub: '99.5% encrypted at rest', icon: FolderLock, change: '100% integrity pass', tone: 'green' },
  { label: 'Audit Records', value: '184,920', sub: 'Tamper-evident logs', icon: History, change: '100% hash anchored', tone: 'blue' },
  { label: 'Policy Reviews', value: '48', sub: 'Governance frameworks', icon: BookOpen, change: 'All active & current', tone: 'amber' },
  { label: 'Approved Workflows', value: '1,240', sub: 'Multi-signatory validated', icon: ClipboardCheck, change: 'Zero bypassed', tone: 'green' },
  { label: 'Compliance Reviews', value: '32', sub: 'Internal & external scans', icon: BarChart3, change: '94% average score', tone: 'blue' }
];

/* ================================================================
   CIRCULAR PROGRESS COMPONENT
   ================================================================ */
function CircularScoreProgress({ score }: { score: number }) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex size-44 items-center justify-center">
      <svg className="size-full -rotate-90 transform" viewBox="0 0 148 148">
        {/* Background Track */}
        <circle
          cx="74"
          cy="74"
          r={radius}
          stroke="#E2E8F0"
          strokeWidth="11"
          fill="transparent"
        />
        {/* Accent Circle */}
        <circle
          cx="74"
          cy="74"
          r={radius}
          stroke="url(#complianceScoreGradient)"
          strokeWidth="11"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="complianceScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="70%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>
        </defs>
      </svg>
      {/* Central Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-mono text-4xl font-extrabold tracking-tight text-[#111827]">
          {score}%
        </span>
        <span className="mt-0.5 rounded-full bg-[#16A34A]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#16A34A]">
          Compliant
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN COMPLIANCE READINESS DASHBOARD COMPONENT
   ================================================================ */
export default function ComplianceDashboard() {
  const { toast } = useToast();
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [modalType, setModalType] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = (label: string, message: string) => {
    toast({
      title: label,
      description: message,
    });
  };

  const runQuickScan = () => {
    setIsScanning(true);
    toast({
      title: "Running Compliance Readiness Scan",
      description: "Evaluating 7 governance modules and 89 security controls...",
    });
    setTimeout(() => {
      setIsScanning(false);
      toast({
        title: "Scan Completed Successfully",
        description: "Compliance posture verified: 94% Compliant. No critical vulnerabilities found.",
      });
    }, 1800);
  };

  const filteredChecklist = filterCategory === 'All'
    ? CHECKLIST_ITEMS
    : CHECKLIST_ITEMS.filter(item => item.category === filterCategory);

  return (
    <div className="min-h-screen space-y-7 bg-[#F8FAFC] pb-12 font-sans text-[#111827] antialiased">
      
      {/* ================================================================
          HEADER SECTION
          ================================================================ */}
      <section className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2563EB]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#2563EB]">
              <span className="size-1.5 rounded-full bg-[#2563EB]" />
              Secure Docs Compliance Engine
            </span>
            <span className="hidden items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[10px] font-medium text-[#64748B] sm:inline-flex">
              Clock: {currentTime || 'Active'}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#111827] sm:text-3xl">
            COMPLIANCE READINESS DASHBOARD
          </h1>
          <p className="mt-1 max-w-3xl text-sm font-normal text-[#64748B]">
            Monitor organizational readiness against document security, governance, auditability, and policy requirements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={runQuickScan}
            disabled={isScanning}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#111827] shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isScanning ? "animate-spin text-[#2563EB]" : "text-[#2563EB]"} />
            {isScanning ? 'Verifying Controls...' : 'Run Quick Scan'}
          </button>
          <button
            onClick={() => setModalType('report')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#1d4ed8]"
          >
            <FileText size={14} />
            Generate Compliance Report
          </button>
        </div>
      </section>

      {/* ================================================================
          SECTION 1 – OVERALL COMPLIANCE SCORE & SECTION 4 – BREAKDOWN
          ================================================================ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Large Compliance Score Card */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-5">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    Overall Readiness
                  </span>
                  <h2 className="text-base font-bold text-[#111827]">Compliance Score</h2>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A]/10 px-3 py-1 font-mono text-[11px] font-bold text-[#16A34A]">
                <span className="size-2 rounded-full bg-[#16A34A]" />
                94% COMPLIANT
              </span>
            </div>

            {/* Circular Progress & Hero Accent Graphic */}
            <div className="my-6 flex flex-col items-center justify-center">
              <CircularScoreProgress score={94} />
              
              {/* Security Blue Accent Graphics */}
              <div className="mt-3 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-[#64748B]">
                  <span className="size-2 rounded-full bg-[#2563EB]" />
                  Security Controls (96%)
                </div>
                <div className="flex items-center gap-1.5 font-medium text-[#64748B]">
                  <span className="size-2 rounded-full bg-[#16A34A]" />
                  Governance (93%)
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Timestamps & Trend Metrics */}
          <div className="border-t border-slate-100 pt-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-[#F8FAFC] p-2.5">
                <span className="block font-mono text-[9px] font-bold uppercase text-[#64748B]">
                  Last Assessment Date
                </span>
                <span className="mt-1 block text-xs font-bold text-[#111827]">
                  04 Sep 2026 · 18:30 IST
                </span>
              </div>
              <div className="rounded-lg bg-[#F8FAFC] p-2.5">
                <span className="block font-mono text-[9px] font-bold uppercase text-[#64748B]">
                  Next Review Date
                </span>
                <span className="mt-1 block text-xs font-bold text-[#111827]">
                  18 Sep 2026 (Scheduled)
                </span>
              </div>
              <div className="rounded-lg bg-[#F8FAFC] p-2.5">
                <span className="block font-mono text-[9px] font-bold uppercase text-[#64748B]">
                  Compliance Trend
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#16A34A]">
                  <TrendingUp size={13} />
                  +3.2% vs Q2
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4 – COMPLIANCE BREAKDOWN */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7">
          <div>
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-lg bg-[#3B82F6]/10 text-[#2563EB]">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    SECTION 4 · CONTROL EVALUATION
                  </span>
                  <h2 className="text-base font-bold text-[#111827]">Compliance Breakdown</h2>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-[#64748B]">
                <span className="inline-flex items-center gap-1">
                  <span className="size-2 rounded-full bg-[#2563EB]" /> Target: ≥ 90%
                </span>
                <span>·</span>
                <span className="text-[#16A34A] font-bold">7 of 7 Met</span>
              </div>
            </div>

            {/* Interactive Progress Bars */}
            <div className="mt-6 space-y-4">
              {BREAKDOWN_DATA.map((item) => (
                <div key={item.category} className="group">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[10px] text-[#64748B]">Target: {item.benchmark}%</span>
                      <span className="font-bold text-[#111827]">{item.score}%</span>
                      <span className="rounded bg-[#16A34A]/10 px-1.5 py-0.2 text-[10px] font-semibold text-[#16A34A]">
                        {item.delta}
                      </span>
                    </div>
                  </div>
                  {/* Blue progress bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] transition-all duration-700 ease-out"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-[#64748B]">
            <span>Calibrated against National Cyber Security Standards & IT Act 2000 Section 65B</span>
            <button
              onClick={() => handleAction("Export Breakdown", "Exporting granular control breakdown CSV...")}
              className="font-bold text-[#2563EB] hover:underline"
            >
              Download Detailed Matrix
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================
          SECTION 2 – COMPLIANCE READINESS CHECKLIST
          ================================================================ */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              SECTION 2 · VERIFIED REQUIREMENTS
            </span>
            <h2 className="text-lg font-bold text-[#111827]">Compliance Readiness Checklist</h2>
            <p className="text-xs text-[#64748B]">
              Real-time operational status for all mandated evidence protection and auditability controls.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Access Governance', 'Document Lifecycle', 'Audit Transparency', 'Data Retention'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                  filterCategory === cat
                    ? 'bg-[#111827] text-white shadow-sm'
                    : 'bg-slate-100 text-[#64748B] hover:bg-slate-200 hover:text-[#111827]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Checklist Cards Grid */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredChecklist.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid size-7 place-items-center rounded-full bg-[#16A34A]/10 text-[#16A34A]">
                      <Check size={16} strokeWidth={3} />
                    </div>
                    <h3 className="text-sm font-bold text-[#111827]">{item.name}</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#16A34A]/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-[#16A34A]">
                    {item.status}
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-[#64748B]">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between font-mono text-[10px] text-[#64748B]">
                  <span>{item.standard}</span>
                  <span className="font-semibold text-[#111827]">{item.controlId}</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-[#64748B]">
                  <Clock size={11} className="text-[#2563EB]" />
                  <span>Last verified: {item.lastVerificationDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          SECTION 3 – COMPLIANCE CATEGORIES
          ================================================================ */}
      <section>
        <div className="mb-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            SECTION 3 · GOVERNANCE PILLARS
          </span>
          <h2 className="text-lg font-bold text-[#111827]">Compliance Categories</h2>
          <p className="text-xs text-[#64748B]">
            Structured domains monitoring regulatory alignment, custody accountability, and data preservation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COMPLIANCE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="grid size-10 place-items-center rounded-xl bg-[#2563EB]/10 text-[#2563EB] transition-colors group-hover:bg-[#2563EB] group-hover:text-white">
                    <Icon size={20} />
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A]/10 px-2.5 py-1 font-mono text-[10px] font-bold text-[#16A34A]">
                    <span className="size-1.5 rounded-full bg-[#16A34A]" />
                    Status: {cat.status}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-[#111827]">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                  {cat.description}
                </p>

                {/* Score and Progress */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#64748B]">{cat.evaluatedItems}</span>
                    <span className="font-mono font-bold text-[#111827]">{cat.score}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#2563EB] transition-all duration-500"
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-[#64748B]">
                  <span>Ref: {cat.policyRef}</span>
                  <span className="text-[#2563EB] font-bold group-hover:underline cursor-pointer" onClick={() => handleAction("Policy Inspector", `Inspecting ${cat.policyRef} for ${cat.name}`)}>
                    View Standard &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================
          SECTION 5 – RISK & IMPROVEMENT AREAS & SECTION 6 – COMPLIANCE INSIGHTS
          ================================================================ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* SECTION 5: RISK & IMPROVEMENT AREAS */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
                <AlertTriangle size={18} />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  SECTION 5 · ATTENTION REQUIRED
                </span>
                <h2 className="text-base font-bold text-[#111827]">Risk & Improvement Areas</h2>
              </div>
            </div>
            <span className="rounded-full bg-[#F59E0B]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#F59E0B]">
              {RISK_AREAS.length} Operational Advisories
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {RISK_AREAS.map((risk) => (
              <div
                key={risk.id}
                className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 transition hover:bg-amber-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="shrink-0 text-[#F59E0B]" />
                    <h3 className="text-sm font-bold text-[#111827]">{risk.title}</h3>
                  </div>
                  <span className="inline-flex rounded bg-[#F59E0B]/15 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-[#B45309]">
                    {risk.severity}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-700">
                  {risk.summary}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/60 pt-2.5 text-xs">
                  <span className="font-mono text-[10px] text-amber-900">
                    Cycle: {risk.frequency}
                  </span>
                  <button
                    onClick={() => handleAction("Initiating Review", `Triggered remediation review for ${risk.title}`)}
                    className="inline-flex items-center gap-1 rounded bg-[#F59E0B] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-[#d97706]"
                  >
                    {risk.actionText} &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: COMPLIANCE INSIGHTS */}
        <section className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-5">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <div className="grid size-8 place-items-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                <Sparkles size={18} />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  SECTION 6 · AUTOMATED INTELLIGENCE
                </span>
                <h2 className="text-base font-bold text-[#111827]">Compliance Insights</h2>
              </div>
            </div>

            <div className="mt-4 space-y-3.5">
              {COMPLIANCE_INSIGHTS.map((insight, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-100 bg-[#F8FAFC] p-3.5 transition hover:border-slate-200 hover:bg-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-[#16A34A]" />
                      <h4 className="text-xs font-bold text-[#111827]">{insight.title}</h4>
                    </div>
                    <span className="rounded bg-[#16A34A]/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#16A34A]">
                      {insight.tag}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#64748B]">
                    {insight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-[#2563EB]/5 p-3 text-[11px] text-[#2563EB] border border-[#2563EB]/10">
            <span className="font-bold">Next Automated Audit:</span> Real-time cryptographic ledger recalculation runs every 6 hours.
          </div>
        </section>
      </div>

      {/* ================================================================
          SECTION 7 – ACTION CENTER
          ================================================================ */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            SECTION 7 · OPERATIONAL PROTOCOLS
          </span>
          <h2 className="text-lg font-bold text-[#111827]">Compliance Action Center</h2>
          <p className="text-xs text-[#64748B]">
            Execute formal compliance assessment workflows, download verification ledgers, and trigger policy audits.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <button
            onClick={() => setModalType('report')}
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-white hover:shadow-sm"
          >
            <div className="grid size-9 place-items-center rounded-lg bg-[#2563EB]/10 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition">
              <FileText size={18} />
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold text-[#111827]">Generate Compliance Report</h3>
              <p className="mt-1 text-[11px] text-[#64748B]">
                Export executive PDF brief with evidentiary hashes.
              </p>
            </div>
            <span className="mt-3 flex items-center text-[11px] font-bold text-[#2563EB]">
              Create Report &rarr;
            </span>
          </button>

          <button
            onClick={() => handleAction("Export Dashboard", "Exporting complete JSON snapshot of all 7 compliance domains...")}
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-white hover:shadow-sm"
          >
            <div className="grid size-9 place-items-center rounded-lg bg-[#3B82F6]/10 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition">
              <Download size={18} />
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold text-[#111827]">Export Dashboard</h3>
              <p className="mt-1 text-[11px] text-[#64748B]">
                Download metrics, timestamps, and checklist states.
              </p>
            </div>
            <span className="mt-3 flex items-center text-[11px] font-bold text-[#2563EB]">
              Export Data &rarr;
            </span>
          </button>

          <button
            onClick={() => setModalType('schedule')}
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-white hover:shadow-sm"
          >
            <div className="grid size-9 place-items-center rounded-lg bg-[#16A34A]/10 text-[#16A34A] group-hover:bg-[#16A34A] group-hover:text-white transition">
              <CalendarClock size={18} />
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold text-[#111827]">Schedule Assessment</h3>
              <p className="mt-1 text-[11px] text-[#64748B]">
                Set automated recurring audit intervals and notices.
              </p>
            </div>
            <span className="mt-3 flex items-center text-[11px] font-bold text-[#16A34A]">
              Configure &rarr;
            </span>
          </button>

          <button
            onClick={() => setModalType('policies')}
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-white hover:shadow-sm"
          >
            <div className="grid size-9 place-items-center rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] group-hover:bg-[#F59E0B] group-hover:text-white transition">
              <BookOpen size={18} />
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold text-[#111827]">Review Policies</h3>
              <p className="mt-1 text-[11px] text-[#64748B]">
                Inspect active governance rules and threshold limits.
              </p>
            </div>
            <span className="mt-3 flex items-center text-[11px] font-bold text-[#F59E0B]">
              Browse Policies &rarr;
            </span>
          </button>

          <Link
            href="/audit-logs/verify"
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-white hover:shadow-sm"
          >
            <div className="grid size-9 place-items-center rounded-lg bg-[#2563EB]/10 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition">
              <FileSearch size={18} />
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold text-[#111827]">View Audit Evidence</h3>
              <p className="mt-1 text-[11px] text-[#64748B]">
                Cryptographic SHA-256 blockchain-style hash chain.
              </p>
            </div>
            <span className="mt-3 flex items-center text-[11px] font-bold text-[#2563EB]">
              Verify Chain &rarr;
            </span>
          </Link>
        </div>
      </section>

      {/* ================================================================
          SECTION 8 – DASHBOARD METRICS
          ================================================================ */}
      <section>
        <div className="mb-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            SECTION 8 · SYSTEM REPOSITORY METRICS
          </span>
          <h2 className="text-lg font-bold text-[#111827]">Dashboard Metrics</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {DASHBOARD_METRICS.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="grid size-8 place-items-center rounded-lg bg-[#F8FAFC] text-[#2563EB]">
                    <Icon size={16} />
                  </div>
                  <ArrowUpRight size={14} className="text-[#64748B]/50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <div className="mt-3 font-mono text-2xl font-black tracking-tight text-[#111827]">
                  {metric.value}
                </div>
                <div className="mt-1 text-xs font-bold text-[#111827]">
                  {metric.label}
                </div>
                <div className="mt-2 text-[10px] text-[#64748B]">
                  {metric.sub}
                </div>
                <div className="mt-1 font-mono text-[10px] font-medium text-[#16A34A]">
                  {metric.change}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================
          IMPORTANT DISCLAIMER
          ================================================================ */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
            <Info size={18} />
          </div>
          <div className="text-xs leading-relaxed text-[#64748B]">
            <strong className="text-[#111827] uppercase font-bold tracking-wider">Important Disclaimer:</strong>{" "}
            "This dashboard measures compliance readiness and operational alignment with governance requirements. It does not provide legal, regulatory, or certification approval."
          </div>
        </div>
      </section>

      {/* ================================================================
          MODAL: GENERATE COMPLIANCE REPORT
          ================================================================ */}
      {modalType === 'report' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#2563EB]" />
                <h3 className="text-base font-bold text-[#111827]">Generate Compliance Report</h3>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100 hover:text-[#111827]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-[#64748B]">
              <p>
                This action compiles an official readiness summary for auditors and oversight authorities:
              </p>
              <div className="rounded-lg bg-[#F8FAFC] p-3 space-y-2 font-mono text-[11px] text-[#111827]">
                <div className="flex justify-between">
                  <span>Overall Readiness Score:</span>
                  <span className="font-bold text-[#16A34A]">94% COMPLIANT</span>
                </div>
                <div className="flex justify-between">
                  <span>Evaluation Scope:</span>
                  <span>7 Domains · 89 Controls</span>
                </div>
                <div className="flex justify-between">
                  <span>Cryptographic Anchor:</span>
                  <span className="truncate max-w-[200px] text-[10px] text-[#2563EB]">SHA256: 7f8a92b4c102...</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setModalType(null);
                  handleAction("Report Generated", "Downloading Compliance_Readiness_Brief_2026.pdf...");
                }}
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1d4ed8]"
              >
                Download Official PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: SCHEDULE ASSESSMENT
          ================================================================ */}
      {modalType === 'schedule' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarClock size={18} className="text-[#16A34A]" />
                <h3 className="text-base font-bold text-[#111827]">Schedule Assessment Cycle</h3>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100 hover:text-[#111827]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#111827]">Assessment Frequency</label>
                <select className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-[#111827] outline-none focus:border-[#2563EB]">
                  <option>Bi-weekly Automated Audit (Default)</option>
                  <option>Monthly Comprehensive Scan</option>
                  <option>Quarterly Statutory External Review</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#111827]">Assigned Reviewer Group</label>
                <input
                  defaultValue="Security Operations Center & Legal Reviewers"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-[#111827] outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="rounded-lg bg-emerald-50 p-3 text-emerald-800 text-[11px]">
                Next scheduled cycle will automatically initiate on <strong>18 September 2026 at 00:00 IST</strong>.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setModalType(null);
                  handleAction("Schedule Saved", "Assessment schedule successfully updated for 18 Sep 2026.");
                }}
                className="rounded-lg bg-[#16A34A] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#15803d]"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: POLICIES EXPLORER
          ================================================================ */}
      {modalType === 'policies' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-[#F59E0B]" />
                <h3 className="text-base font-bold text-[#111827]">Active Governance Policies</h3>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100 hover:text-[#111827]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1 text-xs">
              {[
                { code: 'SEC-POL-01', name: 'Zero Trust Access & Session Control', status: 'Enforced', version: 'v3.2' },
                { code: 'DOC-POL-04', name: 'Cryptographic Document Intake & Custody', status: 'Enforced', version: 'v2.8' },
                { code: 'AUD-POL-02', name: 'Immutable Append-Only Audit Logging', status: 'Enforced', version: 'v4.0' },
                { code: 'RET-POL-07', name: '7-Year Statutory Evidence Preservation', status: 'Under Review', version: 'v2.1' },
                { code: 'APP-POL-09', name: 'Dual-Officer DSC Digital Authorization', status: 'Enforced', version: 'v1.9' },
                { code: 'COL-POL-03', name: 'Zero-Knowledge Sharing Token Standard', status: 'Enforced', version: 'v3.0' }
              ].map((pol) => (
                <div key={pol.code} className="flex items-center justify-between rounded-lg border border-slate-100 bg-[#F8FAFC] p-3">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-[#2563EB]">{pol.code}</span>
                    <h4 className="text-xs font-bold text-[#111827]">{pol.name}</h4>
                    <span className="text-[10px] text-[#64748B]">{pol.version} · Last validated 04 Sep 2026</span>
                  </div>
                  <span className={`rounded px-2 py-0.5 font-mono text-[9px] font-bold ${
                    pol.status === 'Enforced' ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                  }`}>
                    {pol.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end">
              <button
                onClick={() => setModalType(null)}
                className="rounded-lg bg-[#111827] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
              >
                Close Library
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          FOOTER CLASSIFICATION
          ================================================================ */}
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-5 text-[11px] text-[#64748B]">
        <div className="flex items-center gap-1.5 font-medium">
          <ShieldCheck size={14} className="text-[#2563EB]" />
          <span>Secure Docs Enterprise Compliance Engine · Version 2.4.1</span>
        </div>
        <div className="font-mono text-[10px]">
          Classification: OFFICIAL · Operational Alignment: 94% Compliant
        </div>
      </footer>
    </div>
  );
}
