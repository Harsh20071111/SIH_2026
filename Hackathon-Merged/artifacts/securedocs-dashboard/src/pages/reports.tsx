import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  FileText, ShieldCheck, ShieldAlert, Download, FileSpreadsheet,
  FileCode, Archive, Calendar, Clock, CheckCircle2, AlertTriangle,
  RefreshCw, Filter, Search, ChevronRight, ArrowUpRight, BarChart3,
  TrendingUp, Users, Lock, Eye, Activity, Send, History, Check,
  X, Sparkles, FolderArchive, Layers, Database, FileCheck2, Printer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/* ================================================================
   DATA TYPES & DEFINITIONS
   ================================================================ */

interface RecentReport {
  id: string;
  name: string;
  type: 'Integrity' | 'Audit' | 'Security' | 'Case';
  generatedBy: string;
  role: string;
  date: string;
  size: string;
  status: 'Completed' | 'Verified' | 'Archived';
  format: 'PDF' | 'Excel' | 'CSV';
  hash: string;
}

const RECENT_REPORTS: RecentReport[] = [
  {
    id: 'RPT-1021',
    name: 'Integrity Verification Report',
    type: 'Integrity',
    generatedBy: 'Admin (Officer Sharma)',
    role: 'Admin',
    date: '05 Sep 2026 · 08:30 IST',
    size: '3.4 MB',
    status: 'Completed',
    format: 'PDF',
    hash: '8f92a4...d17c'
  },
  {
    id: 'RPT-1020',
    name: 'Comprehensive Audit Trail Report',
    type: 'Audit',
    generatedBy: 'Auditor Ananya Rao',
    role: 'Auditor',
    date: '04 Sep 2026 · 19:15 IST',
    size: '8.1 MB',
    status: 'Completed',
    format: 'Excel',
    hash: '4e71c9...2a8b'
  },
  {
    id: 'RPT-1019',
    name: 'Security Activity & Incident Analysis',
    type: 'Security',
    generatedBy: 'SOC Security Lead',
    role: 'Officer',
    date: '04 Sep 2026 · 14:00 IST',
    size: '2.8 MB',
    status: 'Completed',
    format: 'PDF',
    hash: 'b310e5...9f44'
  },
  {
    id: 'RPT-1018',
    name: 'Case C-1024 Full Evidence Report',
    type: 'Case',
    generatedBy: 'Legal Reviewer Verma',
    role: 'Legal Reviewer',
    date: '03 Sep 2026 · 21:45 IST',
    size: '12.5 MB',
    status: 'Completed',
    format: 'PDF',
    hash: '7c65d2...e810'
  },
  {
    id: 'RPT-1017',
    name: 'User Access Governance Audit',
    type: 'Audit',
    generatedBy: 'Admin (Officer Sharma)',
    role: 'Admin',
    date: '03 Sep 2026 · 16:20 IST',
    size: '4.2 MB',
    status: 'Completed',
    format: 'CSV',
    hash: '1a90f8...c341'
  },
  {
    id: 'RPT-1016',
    name: 'Monthly Cryptographic Hash Ledger',
    type: 'Integrity',
    generatedBy: 'System Automated Daemon',
    role: 'System',
    date: '01 Sep 2026 · 00:01 IST',
    size: '18.9 MB',
    status: 'Completed',
    format: 'PDF',
    hash: '9d43b1...77e2'
  }
];

const MONTHLY_VOLUME = [
  { month: 'Jan', count: 98, audit: 35, integrity: 28, security: 20, case: 15 },
  { month: 'Feb', count: 112, audit: 40, integrity: 32, security: 22, case: 18 },
  { month: 'Mar', count: 125, audit: 44, integrity: 35, security: 26, case: 20 },
  { month: 'Apr', count: 138, audit: 48, integrity: 38, security: 30, case: 22 },
  { month: 'May', count: 145, audit: 52, integrity: 40, security: 31, case: 22 },
  { month: 'Jun', count: 154, audit: 55, integrity: 42, security: 33, case: 24 },
  { month: 'Jul', count: 162, audit: 58, integrity: 45, security: 34, case: 25 },
  { month: 'Aug', count: 174, audit: 62, integrity: 48, security: 38, case: 26 },
  { month: 'Sep', count: 140, audit: 24, integrity: 34, security: 52, case: 30 }
];

export default function Reports() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [modalType, setModalType] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'Excel' | 'CSV'>('PDF');
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

  const handleGenerate = (reportTitle: string) => {
    setGeneratingReport(reportTitle);
    toast({
      title: `Compiling ${reportTitle}`,
      description: "Aggregating audit traces, verifying hash chains, and generating digital signature...",
    });

    setTimeout(() => {
      setGeneratingReport(null);
      toast({
        title: "Report Generated Successfully",
        description: `${reportTitle} is ready. Download initiated.`,
      });
    }, 1800);
  };

  const handleExport = (format: string) => {
    toast({
      title: `Exporting ${format} Report Package`,
      description: `Compressing and downloading operational telemetry as ${format}...`,
    });
  };

  const handleAction = (label: string, desc: string) => {
    toast({
      title: label,
      description: desc,
    });
  };

  const filteredReports = RECENT_REPORTS.filter((rpt) => {
    const matchesTab = activeTab === 'All' || rpt.type === activeTab;
    const matchesSearch = rpt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rpt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rpt.generatedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

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
              Secure Docs Intelligence & Telemetry
            </span>
            <span className="hidden items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[10px] font-medium text-[#64748B] sm:inline-flex">
              Clock: {currentTime || 'Active'}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#111827] sm:text-3xl">
            INTEGRITY & SECURITY REPORTS
          </h1>
          <p className="mt-1 max-w-3xl text-sm font-normal text-[#64748B]">
            Generate, review, and export operational, security, audit, and integrity reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setModalType('schedule')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#111827] shadow-sm transition hover:bg-slate-50"
          >
            <Calendar size={14} className="text-[#2563EB]" />
            Schedule Reports
          </button>
          <button
            onClick={() => handleExport('Secure Digital Archive')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#1d4ed8]"
          >
            <Archive size={14} />
            Export Archive Package
          </button>
        </div>
      </section>

      {/* ================================================================
          SECTION 2 – REPORT STATISTICS
          ================================================================ */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            SECTION 2 · AGGREGATE ACTIVITY
          </span>
          <span className="font-mono text-[10px] text-[#64748B]">Updated real-time · Q3 2026</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {/* Total Reports Generated */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="grid size-9 place-items-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                <FileText size={18} />
              </div>
              <span className="rounded-full bg-[#16A34A]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#16A34A]">
                +14% MoM
              </span>
            </div>
            <div className="mt-3 font-mono text-3xl font-extrabold tracking-tight text-[#111827]">
              1,248
            </div>
            <div className="mt-1 text-xs font-bold text-[#111827]">
              Total Reports Generated
            </div>
            <div className="mt-1 text-[11px] text-[#64748B]">
              Across all security divisions
            </div>
          </div>

          {/* Integrity Reports */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="grid size-9 place-items-center rounded-lg bg-[#16A34A]/10 text-[#16A34A]">
                <ShieldCheck size={18} />
              </div>
              <span className="font-mono text-[10px] font-medium text-[#64748B]">27.4% share</span>
            </div>
            <div className="mt-3 font-mono text-3xl font-extrabold tracking-tight text-[#111827]">
              342
            </div>
            <div className="mt-1 text-xs font-bold text-[#111827]">
              Integrity Reports
            </div>
            <div className="mt-1 text-[11px] text-[#64748B]">
              SHA-256 hash verifications
            </div>
          </div>

          {/* Audit Reports */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="grid size-9 place-items-center rounded-lg bg-[#3B82F6]/10 text-[#2563EB]">
                <History size={18} />
              </div>
              <span className="font-mono text-[10px] font-medium text-[#64748B]">33.5% share</span>
            </div>
            <div className="mt-3 font-mono text-3xl font-extrabold tracking-tight text-[#111827]">
              418
            </div>
            <div className="mt-1 text-xs font-bold text-[#111827]">
              Audit Reports
            </div>
            <div className="mt-1 text-[11px] text-[#64748B]">
              Full access & custody traces
            </div>
          </div>

          {/* Security Reports */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="grid size-9 place-items-center rounded-lg bg-[#DC2626]/10 text-[#DC2626]">
                <ShieldAlert size={18} />
              </div>
              <span className="font-mono text-[10px] font-medium text-[#64748B]">22.9% share</span>
            </div>
            <div className="mt-3 font-mono text-3xl font-extrabold tracking-tight text-[#111827]">
              286
            </div>
            <div className="mt-1 text-xs font-bold text-[#111827]">
              Security Reports
            </div>
            <div className="mt-1 text-[11px] text-[#64748B]">
              Incident & anomaly telemetry
            </div>
          </div>

          {/* Case Reports */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="grid size-9 place-items-center rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
                <FileCheck2 size={18} />
              </div>
              <span className="font-mono text-[10px] font-medium text-[#64748B]">16.2% share</span>
            </div>
            <div className="mt-3 font-mono text-3xl font-extrabold tracking-tight text-[#111827]">
              202
            </div>
            <div className="mt-1 text-xs font-bold text-[#111827]">
              Case Reports
            </div>
            <div className="mt-1 text-[11px] text-[#64748B]">
              Active & archived case dossiers
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 1 – REPORT GENERATION CENTER
          ================================================================ */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              SECTION 1 · ON-DEMAND ENGINE
            </span>
            <h2 className="text-lg font-bold text-[#111827]">Report Generation Center</h2>
            <p className="text-xs text-[#64748B]">
              Initiate deep cryptographic queries and compile tamper-evident, court-admissible dossiers.
            </p>
          </div>

          {/* Format Quick Selector */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
            <span className="px-2 font-mono text-[10px] font-bold text-[#64748B]">Default Format:</span>
            {(['PDF', 'Excel', 'CSV'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`rounded px-2 py-1 font-semibold transition ${
                  selectedFormat === fmt
                    ? 'bg-white text-[#2563EB] shadow-xs'
                    : 'text-[#64748B] hover:text-[#111827]'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Four Large Report Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          
          {/* 1. Generate Integrity Report */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-5 transition hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-white hover:shadow-md">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#16A34A]">
                      Cryptographic Ledger
                    </span>
                    <h3 className="text-base font-bold text-[#111827]">1. Generate Integrity Report</h3>
                  </div>
                </div>
                <span className="rounded bg-slate-200/60 px-2 py-0.5 font-mono text-[10px] font-bold text-[#64748B]">
                  FIPS 180-4
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[#64748B]">
                Document integrity verification, hash validation results, tampering detection summary, and chain verification status.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#64748B]">
                <span className="rounded bg-white px-2 py-1 border border-slate-200">SHA-256 Verified</span>
                <span className="rounded bg-white px-2 py-1 border border-slate-200">Zero Broken Hashes</span>
                <span className="rounded bg-white px-2 py-1 border border-slate-200">Continuous Chain</span>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200/60 pt-4">
              <button
                onClick={() => handleGenerate('Integrity Verification Report')}
                disabled={generatingReport === 'Integrity Verification Report'}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#1d4ed8] disabled:opacity-50"
              >
                {generatingReport === 'Integrity Verification Report' ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <FileText size={14} />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2. Generate Audit Report */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-5 transition hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-white hover:shadow-md">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                    <History size={22} />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                      Auditability & Trail
                    </span>
                    <h3 className="text-base font-bold text-[#111827]">2. Generate Audit Report</h3>
                  </div>
                </div>
                <span className="rounded bg-slate-200/60 px-2 py-0.5 font-mono text-[10px] font-bold text-[#64748B]">
                  SOC 2 Type II
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[#64748B]">
                Complete audit trail, user activities, document access history, approvals, and modifications.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#64748B]">
                <span className="rounded bg-white px-2 py-1 border border-slate-200">184k Log Events</span>
                <span className="rounded bg-white px-2 py-1 border border-slate-200">User Identity Mapping</span>
                <span className="rounded bg-white px-2 py-1 border border-slate-200">Session Bounds</span>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200/60 pt-4">
              <button
                onClick={() => handleGenerate('Complete Audit Trail Report')}
                disabled={generatingReport === 'Complete Audit Trail Report'}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#1d4ed8] disabled:opacity-50"
              >
                {generatingReport === 'Complete Audit Trail Report' ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <FileText size={14} />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 3. Generate Security Activity Report */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-5 transition hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-white hover:shadow-md">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-[#DC2626]/10 text-[#DC2626]">
                    <ShieldAlert size={22} />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#DC2626]">
                      Threat Intelligence
                    </span>
                    <h3 className="text-base font-bold text-[#111827]">3. Generate Security Activity Report</h3>
                  </div>
                </div>
                <span className="rounded bg-slate-200/60 px-2 py-0.5 font-mono text-[10px] font-bold text-[#64748B]">
                  CERT-In Format
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[#64748B]">
                Suspicious activities, failed access attempts, unusual behavior analysis, and security incidents.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#64748B]">
                <span className="rounded bg-white px-2 py-1 border border-slate-200">Incident Classification</span>
                <span className="rounded bg-white px-2 py-1 border border-slate-200">Failed Auth Matrix</span>
                <span className="rounded bg-white px-2 py-1 border border-slate-200">Forensic Timestamps</span>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200/60 pt-4">
              <button
                onClick={() => handleGenerate('Security Activity & Incident Analysis Report')}
                disabled={generatingReport === 'Security Activity & Incident Analysis Report'}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#1d4ed8] disabled:opacity-50"
              >
                {generatingReport === 'Security Activity & Incident Analysis Report' ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <FileText size={14} />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 4. Generate Case Report */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-5 transition hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-white hover:shadow-md">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-[#F59E0B]/10 text-[#F59E0B]">
                    <FileCheck2 size={22} />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#F59E0B]">
                      Investigation Records
                    </span>
                    <h3 className="text-base font-bold text-[#111827]">4. Generate Case Report</h3>
                  </div>
                </div>
                <span className="rounded bg-slate-200/60 px-2 py-0.5 font-mono text-[10px] font-bold text-[#64748B]">
                  Judicial Docket
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[#64748B]">
                Case history, assigned officers, evidence records, document access logs, and investigation summaries.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#64748B]">
                <span className="rounded bg-white px-2 py-1 border border-slate-200">128 Cases Tracked</span>
                <span className="rounded bg-white px-2 py-1 border border-slate-200">Dual Officer Concurrence</span>
                <span className="rounded bg-white px-2 py-1 border border-slate-200">Section 65B Certified</span>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200/60 pt-4">
              <button
                onClick={() => handleGenerate('Case Investigation & Evidence Report')}
                disabled={generatingReport === 'Case Investigation & Evidence Report'}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#1d4ed8] disabled:opacity-50"
              >
                {generatingReport === 'Case Investigation & Evidence Report' ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <FileText size={14} />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ================================================================
          SECTION 5 – SECURITY SUMMARY & SECTION 4 – REPORT EXPORT OPTIONS
          ================================================================ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* SECTION 5 – SECURITY SUMMARY */}
        <section className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-lg bg-[#16A34A]/10 text-[#16A34A]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    SECTION 5 · OPERATIONAL POSTURE
                  </span>
                  <h2 className="text-base font-bold text-[#111827]">Security Summary</h2>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#16A34A]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#16A34A]">
                <span className="size-1.5 rounded-full bg-[#16A34A]" />
                SOC STATUS: NORMAL
              </span>
            </div>

            {/* Status Grid */}
            <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              
              {/* System Integrity Status */}
              <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 transition hover:bg-white hover:border-[#16A34A]/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827]">System Integrity Status</span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#16A34A]">
                    <span className="size-2 rounded-full bg-[#16A34A] animate-pulse" />
                    🟢 Healthy
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[#64748B]">
                  Zero byte alterations detected. SHA-256 chain verified continuously across all 4,820 files.
                </p>
                <div className="mt-2 font-mono text-[10px] text-[#2563EB]">
                  Last verification: 05 Sep 2026 · 08:30 IST
                </div>
              </div>

              {/* Audit Verification Status */}
              <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 transition hover:bg-white hover:border-[#16A34A]/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827]">Audit Verification Status</span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#16A34A]">
                    <span className="size-2 rounded-full bg-[#16A34A] animate-pulse" />
                    🟢 Verified
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[#64748B]">
                  184,920 records securely chained with immutable timestamps and digital signing anchors.
                </p>
                <div className="mt-2 font-mono text-[10px] text-[#2563EB]">
                  Chain Depth: 184,920 blocks
                </div>
              </div>

              {/* Security Monitoring Status */}
              <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 transition hover:bg-white hover:border-[#16A34A]/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827]">Security Monitoring Status</span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#16A34A]">
                    <span className="size-2 rounded-full bg-[#16A34A] animate-pulse" />
                    🟢 Active
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[#64748B]">
                  Real-time threat detection active. Behavioral heuristic engine monitoring privilege escalations.
                </p>
                <div className="mt-2 font-mono text-[10px] text-[#2563EB]">
                  Uptime: 99.98% · 0 Active Outages
                </div>
              </div>

              {/* Case Tracking Status */}
              <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 transition hover:bg-white hover:border-[#16A34A]/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827]">Case Tracking Status</span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#16A34A]">
                    <span className="size-2 rounded-full bg-[#16A34A] animate-pulse" />
                    🟢 Operational
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[#64748B]">
                  128 active cases indexed with strict chain-of-custody tracking and legal freeze controls.
                </p>
                <div className="mt-2 font-mono text-[10px] text-[#2563EB]">
                  Active Dockets: 128 · 100% In Custody
                </div>
              </div>

            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-[#64748B]">
            <span>Security posture monitored 24/7 by Bangalore Regional Evidence Operations Center</span>
            <Link href="/audit-logs/verify" className="font-bold text-[#2563EB] hover:underline">
              Inspect Hash Chain &rarr;
            </Link>
          </div>
        </section>

        {/* SECTION 4 – REPORT EXPORT OPTIONS */}
        <section className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-5">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <div className="grid size-8 place-items-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                <Download size={18} />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  SECTION 4 · DISTRIBUTION FORMATS
                </span>
                <h2 className="text-base font-bold text-[#111827]">Report Export Options</h2>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[#64748B]">
              Standardized outputs compliant with legal discovery, forensic investigation, and external audit archiving standards.
            </p>

            <div className="mt-4 space-y-2.5">
              
              {/* PDF Option */}
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-[#F8FAFC] p-3 transition hover:bg-white">
                <div className="flex items-center gap-3">
                  <div className="grid size-8 place-items-center rounded-lg bg-[#DC2626]/10 text-[#DC2626]">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111827]">PDF Document</h4>
                    <p className="text-[10px] text-[#64748B]">Court-ready with digital watermark & signature</p>
                  </div>
                </div>
                <button
                  onClick={() => handleExport('PDF')}
                  className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#2563EB] shadow-xs hover:bg-slate-50 transition"
                >
                  Export PDF
                </button>
              </div>

              {/* Excel Option */}
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-[#F8FAFC] p-3 transition hover:bg-white">
                <div className="flex items-center gap-3">
                  <div className="grid size-8 place-items-center rounded-lg bg-[#16A34A]/10 text-[#16A34A]">
                    <FileSpreadsheet size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111827]">Excel Spreadsheet</h4>
                    <p className="text-[10px] text-[#64748B]">Multi-tab pivot tables & analytical telemetry</p>
                  </div>
                </div>
                <button
                  onClick={() => handleExport('Excel')}
                  className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#16A34A] shadow-xs hover:bg-slate-50 transition"
                >
                  Export Excel
                </button>
              </div>

              {/* CSV Option */}
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-[#F8FAFC] p-3 transition hover:bg-white">
                <div className="flex items-center gap-3">
                  <div className="grid size-8 place-items-center rounded-lg bg-[#3B82F6]/10 text-[#2563EB]">
                    <FileCode size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111827]">CSV Raw Dataset</h4>
                    <p className="text-[10px] text-[#64748B]">Machine-readable for SIEM and API ingestion</p>
                  </div>
                </div>
                <button
                  onClick={() => handleExport('CSV')}
                  className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#2563EB] shadow-xs hover:bg-slate-50 transition"
                >
                  Export CSV
                </button>
              </div>

              {/* Secure Digital Archive */}
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-[#F8FAFC] p-3 transition hover:bg-white">
                <div className="flex items-center gap-3">
                  <div className="grid size-8 place-items-center rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
                    <FolderArchive size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111827]">Secure Digital Archive</h4>
                    <p className="text-[10px] text-[#64748B]">Encrypted ZIP with SHA-256 manifest</p>
                  </div>
                </div>
                <button
                  onClick={() => handleExport('Digital Archive (ZIP)')}
                  className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#F59E0B] shadow-xs hover:bg-slate-50 transition"
                >
                  Export Archive
                </button>
              </div>

            </div>
          </div>

          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[10px] text-[#64748B] border border-slate-200/60">
            <strong>Security Notice:</strong> All exported artifacts contain an embedded cryptographic fingerprint verified against the master HSM.
          </div>
        </section>

      </div>

      {/* ================================================================
          SECTION 6 – REPORT ANALYTICS
          ================================================================ */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              SECTION 6 · TRENDS & METRICS
            </span>
            <h2 className="text-lg font-bold text-[#111827]">Report Analytics</h2>
            <p className="text-xs text-[#64748B]">
              Historical generation cadence, audit telemetry trends, and security incident resolution.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-[#64748B]">
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#2563EB]" /> Audit</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#16A34A]" /> Integrity</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#DC2626]" /> Security</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#F59E0B]" /> Case</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Chart 1: Reports Generated by Month */}
          <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-5 lg:col-span-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#111827]">Reports Generated by Month</h3>
                <p className="text-[10px] text-[#64748B]">Monthly aggregate volume (Jan - Sep 2026)</p>
              </div>
              <span className="font-mono text-xs font-bold text-[#2563EB]">+42% Growth</span>
            </div>

            {/* Interactive Bar Chart Visualization */}
            <div className="mt-6 flex h-48 items-end gap-2 sm:gap-3 border-b border-slate-200 pb-2">
              {MONTHLY_VOLUME.map((item) => {
                const maxVal = 180;
                const heightPct = Math.round((item.count / maxVal) * 100);
                return (
                  <div key={item.month} className="group relative flex-1 flex flex-col items-center">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 hidden rounded bg-[#111827] px-2 py-1 text-[10px] font-mono text-white group-hover:block z-10 whitespace-nowrap shadow-lg">
                      {item.count} Reports ({item.audit} audit, {item.integrity} integ)
                    </div>
                    {/* Bar segments */}
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-[#2563EB] to-[#3B82F6] transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="mt-2 font-mono text-[10px] text-[#64748B] group-hover:text-[#111827] group-hover:font-bold">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-[#64748B]">
              <span>Average Monthly Generation: 138 reports</span>
              <span className="font-bold text-[#16A34A]">Peak: August 2026</span>
            </div>
          </div>

          {/* Chart 2: Audit Reports Trend & Security Summary */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-5 lg:col-span-6">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#111827]">Audit Reports Trend & Security Incidents</h3>
                  <p className="text-[10px] text-[#64748B]">Verification cadence and incident resolution rates</p>
                </div>
                <span className="font-mono text-xs font-bold text-[#16A34A]">99.8% Pass</span>
              </div>

              {/* Progress and distribution metrics */}
              <div className="mt-5 space-y-4">
                
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#111827]">Audit Reports Verification Rate</span>
                    <span className="font-mono font-bold text-[#2563EB]">99.8%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-[#2563EB]" style={{ width: '99.8%' }} />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#111827]">Integrity Verification Consistency</span>
                    <span className="font-mono font-bold text-[#16A34A]">100%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-[#16A34A]" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#111827]">Security Incident Resolution Speed</span>
                    <span className="font-mono font-bold text-[#F59E0B]">94.2%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-[#F59E0B]" style={{ width: '94.2%' }} />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#111827]">Case Docket Compliance Coverage</span>
                    <span className="font-mono font-bold text-[#3B82F6]">97.5%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-[#3B82F6]" style={{ width: '97.5%' }} />
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-3 flex items-center justify-between text-[11px] text-[#64748B]">
              <span>Zero unmitigated critical incidents across last 90 days</span>
              <button onClick={() => handleAction("Telemetry Logs", "Exporting complete analytical dataset...")} className="font-bold text-[#2563EB] hover:underline">
                View Raw Telemetry &rarr;
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ================================================================
          SECTION 3 – RECENT REPORTS
          ================================================================ */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              SECTION 3 · GENERATED REPOSITORY
            </span>
            <h2 className="text-lg font-bold text-[#111827]">Recent Reports</h2>
            <p className="text-xs text-[#64748B]">
              Browse, filter, inspect, and download completed operational and compliance filings.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search reports by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 rounded-lg border border-slate-200 bg-[#F8FAFC] pl-8.5 pr-3 text-xs text-[#111827] placeholder:text-[#64748B] outline-none focus:border-[#2563EB] focus:bg-white w-56"
              />
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
              {['All', 'Integrity', 'Audit', 'Security', 'Case'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                    activeTab === tab
                      ? 'bg-white text-[#111827] shadow-xs'
                      : 'text-[#64748B] hover:text-[#111827]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#F8FAFC] font-mono text-[10px] uppercase text-[#64748B]">
                <th className="px-4 py-3 font-bold">Report ID</th>
                <th className="px-4 py-3 font-bold">Report Name</th>
                <th className="px-4 py-3 font-bold">Generated By</th>
                <th className="px-4 py-3 font-bold">Generated Date</th>
                <th className="px-4 py-3 font-bold text-center">Status</th>
                <th className="px-4 py-3 font-bold text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredReports.map((rpt) => (
                <tr key={rpt.id} className="transition hover:bg-slate-50/80">
                  {/* Report ID */}
                  <td className="px-4 py-3 font-mono font-bold text-[#2563EB]">
                    {rpt.id}
                  </td>

                  {/* Report Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`grid size-7 place-items-center rounded-md ${
                        rpt.type === 'Integrity' ? 'bg-[#16A34A]/10 text-[#16A34A]' :
                        rpt.type === 'Audit' ? 'bg-[#2563EB]/10 text-[#2563EB]' :
                        rpt.type === 'Security' ? 'bg-[#DC2626]/10 text-[#DC2626]' :
                        'bg-[#F59E0B]/10 text-[#F59E0B]'
                      }`}>
                        {rpt.type === 'Integrity' ? <ShieldCheck size={15} /> :
                         rpt.type === 'Audit' ? <History size={15} /> :
                         rpt.type === 'Security' ? <ShieldAlert size={15} /> :
                         <FileCheck2 size={15} />}
                      </div>
                      <div>
                        <div className="font-bold text-[#111827]">{rpt.name}</div>
                        <div className="font-mono text-[10px] text-[#64748B] flex items-center gap-2">
                          <span>{rpt.size}</span>
                          <span>·</span>
                          <span>SHA256: {rpt.hash}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Generated By */}
                  <td className="px-4 py-3 text-[#64748B]">
                    <div className="font-medium text-[#111827]">{rpt.generatedBy}</div>
                    <div className="text-[10px]">{rpt.role}</div>
                  </td>

                  {/* Generated Date */}
                  <td className="px-4 py-3 font-mono text-[11px] text-[#64748B]">
                    {rpt.date}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#16A34A]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#16A34A]">
                      <span className="size-1.5 rounded-full bg-[#16A34A]" />
                      {rpt.status}
                    </span>
                  </td>

                  {/* Download */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleAction("Downloading Report", `Downloading ${rpt.name} (${rpt.format})...`)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-[#111827] shadow-xs hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] transition"
                      >
                        <Download size={13} />
                        Download {rpt.format}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ================================================================
          SECTION 7 – QUICK ACTIONS
          ================================================================ */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            SECTION 7 · WORKFLOW ACCELERATORS
          </span>
          <h2 className="text-lg font-bold text-[#111827]">Quick Actions</h2>
          <p className="text-xs text-[#64748B]">
            Batch execution commands for enterprise reporting, external notifications, and long-term storage archiving.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          
          {/* Generate All Reports */}
          <button
            onClick={() => handleAction("Batch Generation Initiated", "Queueing Integrity, Audit, Security, and Case report builds...")}
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-white hover:shadow-sm"
          >
            <div className="grid size-9 place-items-center rounded-lg bg-[#2563EB]/10 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition">
              <Layers size={18} />
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold text-[#111827]">Generate All Reports</h3>
              <p className="mt-1 text-[11px] text-[#64748B]">
                Compile complete 4-part dossier in single package.
              </p>
            </div>
            <span className="mt-3 flex items-center text-[11px] font-bold text-[#2563EB]">
              Execute Batch &rarr;
            </span>
          </button>

          {/* Schedule Reports */}
          <button
            onClick={() => setModalType('schedule')}
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-white hover:shadow-sm"
          >
            <div className="grid size-9 place-items-center rounded-lg bg-[#16A34A]/10 text-[#16A34A] group-hover:bg-[#16A34A] group-hover:text-white transition">
              <Calendar size={18} />
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold text-[#111827]">Schedule Reports</h3>
              <p className="mt-1 text-[11px] text-[#64748B]">
                Set automated daily, weekly, or monthly delivery.
              </p>
            </div>
            <span className="mt-3 flex items-center text-[11px] font-bold text-[#16A34A]">
              Set Cadence &rarr;
            </span>
          </button>

          {/* Email Reports */}
          <button
            onClick={() => setModalType('email')}
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-white hover:shadow-sm"
          >
            <div className="grid size-9 place-items-center rounded-lg bg-[#3B82F6]/10 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition">
              <Send size={18} />
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold text-[#111827]">Email Reports</h3>
              <p className="mt-1 text-[11px] text-[#64748B]">
                Securely transmit encrypted PDFs to authorized stakeholders.
              </p>
            </div>
            <span className="mt-3 flex items-center text-[11px] font-bold text-[#2563EB]">
              Dispatch &rarr;
            </span>
          </button>

          {/* Archive Reports */}
          <button
            onClick={() => handleAction("Reports Archived", "Moving completed Q2 reports to cold storage archive...")}
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-white hover:shadow-sm"
          >
            <div className="grid size-9 place-items-center rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] group-hover:bg-[#F59E0B] group-hover:text-white transition">
              <Archive size={18} />
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold text-[#111827]">Archive Reports</h3>
              <p className="mt-1 text-[11px] text-[#64748B]">
                Store historical records in immutable 7-year vault.
              </p>
            </div>
            <span className="mt-3 flex items-center text-[11px] font-bold text-[#F59E0B]">
              Archive Vault &rarr;
            </span>
          </button>

          {/* View History */}
          <button
            onClick={() => handleAction("History Telemetry", "Displaying 180-day generation audit ledger...")}
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-white hover:shadow-sm"
          >
            <div className="grid size-9 place-items-center rounded-lg bg-[#111827]/10 text-[#111827] group-hover:bg-[#111827] group-hover:text-white transition">
              <History size={18} />
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold text-[#111827]">View History</h3>
              <p className="mt-1 text-[11px] text-[#64748B]">
                Inspect timestamped ledger of all past exports.
              </p>
            </div>
            <span className="mt-3 flex items-center text-[11px] font-bold text-[#111827]">
              View Log &rarr;
            </span>
          </button>

        </div>
      </section>

      {/* ================================================================
          SECTION 8 – SYSTEM METRICS
          ================================================================ */}
      <section>
        <div className="mb-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            SECTION 8 · ENTERPRISE VOLUME
          </span>
          <h2 className="text-lg font-bold text-[#111827]">System Metrics</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          
          {/* Total Documents */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="grid size-8 place-items-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                <FileText size={16} />
              </div>
              <ArrowUpRight size={14} className="text-[#64748B]/50" />
            </div>
            <div className="mt-3 font-mono text-2xl font-black tracking-tight text-[#111827]">
              4,820
            </div>
            <div className="mt-1 text-xs font-bold text-[#111827]">
              Total Documents
            </div>
            <div className="mt-1 text-[10px] text-[#64748B]">
              Registered across repos
            </div>
          </div>

          {/* Total Audit Logs */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="grid size-8 place-items-center rounded-lg bg-[#3B82F6]/10 text-[#2563EB]">
                <Database size={16} />
              </div>
              <ArrowUpRight size={14} className="text-[#64748B]/50" />
            </div>
            <div className="mt-3 font-mono text-2xl font-black tracking-tight text-[#111827]">
              184,920
            </div>
            <div className="mt-1 text-xs font-bold text-[#111827]">
              Total Audit Logs
            </div>
            <div className="mt-1 text-[10px] text-[#64748B]">
              Immutable log events
            </div>
          </div>

          {/* Verified Records */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="grid size-8 place-items-center rounded-lg bg-[#16A34A]/10 text-[#16A34A]">
                <ShieldCheck size={16} />
              </div>
              <ArrowUpRight size={14} className="text-[#64748B]/50" />
            </div>
            <div className="mt-3 font-mono text-2xl font-black tracking-tight text-[#111827]">
              184,578
            </div>
            <div className="mt-1 text-xs font-bold text-[#111827]">
              Verified Records
            </div>
            <div className="mt-1 text-[10px] text-[#16A34A] font-medium">
              99.8% Hash pass rate
            </div>
          </div>

          {/* Security Alerts */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="grid size-8 place-items-center rounded-lg bg-[#DC2626]/10 text-[#DC2626]">
                <ShieldAlert size={16} />
              </div>
              <ArrowUpRight size={14} className="text-[#64748B]/50" />
            </div>
            <div className="mt-3 font-mono text-2xl font-black tracking-tight text-[#111827]">
              11
            </div>
            <div className="mt-1 text-xs font-bold text-[#111827]">
              Security Alerts
            </div>
            <div className="mt-1 text-[10px] text-[#64748B]">
              3 Under investigation
            </div>
          </div>

          {/* Resolved Cases */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="grid size-8 place-items-center rounded-lg bg-[#16A34A]/10 text-[#16A34A]">
                <CheckCircle2 size={16} />
              </div>
              <ArrowUpRight size={14} className="text-[#64748B]/50" />
            </div>
            <div className="mt-3 font-mono text-2xl font-black tracking-tight text-[#111827]">
              115
            </div>
            <div className="mt-1 text-xs font-bold text-[#111827]">
              Resolved Cases
            </div>
            <div className="mt-1 text-[10px] text-[#64748B]">
              Full closure filed
            </div>
          </div>

          {/* Active Investigations */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="grid size-8 place-items-center rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
                <Activity size={16} />
              </div>
              <ArrowUpRight size={14} className="text-[#64748B]/50" />
            </div>
            <div className="mt-3 font-mono text-2xl font-black tracking-tight text-[#111827]">
              13
            </div>
            <div className="mt-1 text-xs font-bold text-[#111827]">
              Active Investigations
            </div>
            <div className="mt-1 text-[10px] text-[#64748B]">
              Assigned Officers active
            </div>
          </div>

        </div>
      </section>

      {/* ================================================================
          MODAL: SCHEDULE REPORTS
          ================================================================ */}
      {modalType === 'schedule' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#2563EB]" />
                <h3 className="text-base font-bold text-[#111827]">Schedule Automated Reports</h3>
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
                <label className="block font-semibold text-[#111827]">Report Cadence</label>
                <select className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-[#111827] outline-none focus:border-[#2563EB]">
                  <option>Daily 08:00 AM IST Digest</option>
                  <option>Weekly Comprehensive Audit Pack (Mondays)</option>
                  <option>Monthly Statutory Oversight Brief (1st of month)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#111827]">Report Bundles Included</label>
                <div className="mt-2 space-y-2">
                  {['Integrity Verification Report', 'Audit Trail Export', 'Security Activity Brief', 'Case Investigation Dossier'].map((item) => (
                    <label key={item} className="flex items-center gap-2 text-xs text-[#111827]">
                      <input type="checkbox" defaultChecked className="rounded text-[#2563EB]" />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-3 text-blue-900 text-[11px]">
                Reports will be generated with hardware-backed digital certificates and delivered automatically.
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
                  handleAction("Schedule Activated", "Automated recurring report schedule configured.");
                }}
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1d4ed8]"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: EMAIL REPORTS
          ================================================================ */}
      {modalType === 'email' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send size={18} className="text-[#2563EB]" />
                <h3 className="text-base font-bold text-[#111827]">Email Encrypted Report</h3>
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
                <label className="block font-semibold text-[#111827]">Recipient Email Address</label>
                <input
                  type="email"
                  placeholder="officer.auditor@gov.in"
                  defaultValue="ananya.rao@securedocs.gov.in"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-[#111827] outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#111827]">Security Protection</label>
                <select className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-[#111827] outline-none focus:border-[#2563EB]">
                  <option>AES-256 Encrypted Attachment (Password sent via SMS)</option>
                  <option>Expiring Secure Access Portal Link (24-hour TTL)</option>
                </select>
              </div>

              <div className="rounded-lg bg-amber-50 p-3 text-amber-900 text-[11px]">
                Classification: OFFICIAL. Only authorized personnel holding Level 2 security clearance may receive this report.
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
                  handleAction("Report Dispatched", "Encrypted report successfully transmitted to ananya.rao@securedocs.gov.in.");
                }}
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1d4ed8]"
              >
                Send Secure Email
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
          <span>Secure Docs Intelligence & Telemetry Reporting Suite · Version 3.2</span>
        </div>
        <div className="font-mono text-[10px]">
          Classification: OFFICIAL · Regulatory Standard: Section 65B IT Act 2000
        </div>
      </footer>
    </div>
  );
}
