import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ShieldCheck, ShieldAlert, Download, Printer, Share2, RefreshCw,
  FileText, CheckCircle2, AlertTriangle, Clock, Hash, Lock,
  Key, Award, QrCode, FileCheck, Check, Copy, ExternalLink,
  ChevronRight, ArrowLeft, ArrowUpRight, Sparkles, Database,
  Calendar, Layers, FileWarning, Eye, Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  id?: string;
}

export default function OneClickIntegrityReport({ id = 'C-1024' }: Props) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalAction, setModalAction] = useState<string | null>(null);
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

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast({
      title: "Hash Copied to Clipboard",
      description: `${fieldName} SHA-256 hash copied.`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAction = (title: string, desc: string) => {
    toast({
      title,
      description: desc,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateNew = () => {
    setIsGenerating(true);
    toast({
      title: "Re-verifying Document Integrity",
      description: "Recalculating SHA-256 checksum and querying distributed ledger...",
    });
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Integrity Verification Complete",
        description: "Document Evidence.pdf passed 100% of cryptographic and access checks.",
      });
    }, 1600);
  };

  const originalHash = "A7F32B9D84F5E7A1C20D45E6789ABCDEF0123456789ABCDEF0123456789ABCDEF";
  const currentHash = "A7F32B9D84F5E7A1C20D45E6789ABCDEF0123456789ABCDEF0123456789ABCDEF";
  const verificationId = "SEC-VER-C1024-88492-2026";

  return (
    <div className="min-h-screen space-y-7 bg-[#F8FAFC] pb-14 font-sans text-[#111827] antialiased print:bg-white print:p-0">

      {/* ================================================================
          TOP ACTION & NAVIGATION BAR (HIDDEN ON PRINT)
          ================================================================ */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 print:hidden">
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-[#1d4ed8]"
        >
          <ArrowLeft size={14} /> Back to Reports Center
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A]/10 px-3 py-0.5 font-mono text-[10px] font-bold text-[#16A34A]">
            <span className="size-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            LIVE VERIFICATION: OFFICIAL
          </span>
          <span className="font-mono text-[10px] text-[#64748B]">
            Ref ID: {verificationId}
          </span>
        </div>
      </div>

      {/* ================================================================
          HEADER SECTION
          ================================================================ */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2563EB]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#2563EB]">
              <span className="size-1.5 rounded-full bg-[#2563EB]" />
              Automated Forensic Attestation
            </span>
            <span className="hidden items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[10px] font-medium text-[#64748B] sm:inline-flex">
              Case Ref: {id}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#111827] sm:text-3xl">
            SECURE DOCUMENT REPORT
          </h1>
          <p className="mt-1 max-w-3xl text-sm font-normal text-[#64748B]">
            Generate verified integrity reports for sensitive documents and investigations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
          <button
            onClick={handleGenerateNew}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#111827] shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isGenerating ? "animate-spin text-[#2563EB]" : "text-[#2563EB]"} />
            {isGenerating ? 'Recalculating...' : 'Re-verify Hashes'}
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#1d4ed8]"
          >
            <Printer size={14} />
            Print Official Report
          </button>
        </div>
      </section>

      {/* ================================================================
          SECTION 2 – DOCUMENT VERIFICATION STATUS
          ================================================================ */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            SECTION 2 · VERIFICATION GATES
          </span>
          <span className="font-mono text-[10px] text-[#16A34A] font-bold">All 5 Status Gates Passed</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Document Integrity */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#16A34A]/40">
            <span className="text-xs font-bold text-[#64748B]">Document Integrity</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-[#16A34A]">🟢 VERIFIED</span>
            </div>
            <span className="mt-1 text-[10px] text-[#64748B]">Bit-level match confirmed</span>
          </div>

          {/* Hash Validation */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#16A34A]/40">
            <span className="text-xs font-bold text-[#64748B]">Hash Validation</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-[#16A34A]">🟢 MATCHED</span>
            </div>
            <span className="mt-1 text-[10px] text-[#64748B]">SHA-256 match 100%</span>
          </div>

          {/* Version Verification */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#16A34A]/40">
            <span className="text-xs font-bold text-[#64748B]">Version Verification</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-[#16A34A]">🟢 VERIFIED</span>
            </div>
            <span className="mt-1 text-[10px] text-[#64748B]">Latest release: v3</span>
          </div>

          {/* Audit Chain Verification */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#16A34A]/40">
            <span className="text-xs font-bold text-[#64748B]">Audit Chain Verification</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-[#16A34A]">🟢 VALID</span>
            </div>
            <span className="mt-1 text-[10px] text-[#64748B]">No severed hash blocks</span>
          </div>

          {/* Access Security Status */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#16A34A]/40">
            <span className="text-xs font-bold text-[#64748B]">Access Security Status</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-[#16A34A]">🟢 NO THREATS DETECTED</span>
            </div>
            <span className="mt-1 text-[10px] text-[#64748B]">0 suspicious events</span>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 1 – REPORT SUMMARY CARD (OFFICIAL GOVERNMENT PREVIEW)
          ================================================================ */}
      <section className="rounded-2xl border-2 border-slate-300 bg-white p-6 sm:p-8 shadow-md relative overflow-hidden print:border-black print:shadow-none">
        
        {/* Subtle Guilloche Watermark / Decorative Official Backdrop */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] select-none flex items-center justify-center">
          <div className="text-center font-black tracking-widest text-9xl">SECURE DOCS</div>
        </div>

        {/* Official Header Badge */}
        <div className="border-b-2 border-[#111827] pb-5 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[#0B1220] text-white shadow-sm">
            <ShieldCheck size={28} className="text-[#3B82F6]" />
          </div>
          <div className="mt-2 font-mono text-[10px] font-bold tracking-[0.25em] text-[#2563EB] uppercase">
            GOVERNMENT OF INDIA · MINISTRY EVIDENCE PROTOCOL
          </div>
          <h2 className="mt-1 text-2xl font-black uppercase tracking-tight text-[#111827]">
            ━━━━━━━━━━━━━━━━━━━━━━━━<br />
            SECURE DOCUMENT REPORT<br />
            ━━━━━━━━━━━━━━━━━━━━━━━━
          </h2>
          <p className="mt-1 font-mono text-xs text-[#64748B]">
            Official Certificate of Forensic Integrity & Immutable Chain Validation
          </p>
        </div>

        {/* Certificate Body Data Matrix */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Case & Document Identification */}
          <div className="space-y-3 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
              Dossier Metadata
            </span>
            <div>
              <span className="block font-mono text-[10px] text-[#64748B] uppercase">Case Identifier:</span>
              <span className="font-mono text-base font-bold text-[#111827]">C-1024</span>
            </div>
            <div>
              <span className="block font-mono text-[10px] text-[#64748B] uppercase">Document Title:</span>
              <span className="text-sm font-bold text-[#111827] flex items-center gap-1.5">
                <FileText size={15} className="text-[#2563EB]" />
                Evidence.pdf
              </span>
            </div>
            <div>
              <span className="block font-mono text-[10px] text-[#64748B] uppercase">Document Version:</span>
              <span className="inline-flex rounded bg-[#2563EB]/10 px-2 py-0.5 font-mono text-xs font-bold text-[#2563EB]">
                v3
              </span>
            </div>
          </div>

          {/* Cryptographic Validation Summary */}
          <div className="space-y-3 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#16A34A]">
              Integrity Status
            </span>
            <div>
              <span className="block font-mono text-[10px] text-[#64748B] uppercase">Integrity State:</span>
              <span className="inline-flex items-center gap-1 text-sm font-extrabold text-[#16A34A]">
                <CheckCircle2 size={16} /> ✓ VERIFIED
              </span>
            </div>
            <div>
              <span className="block font-mono text-[10px] text-[#64748B] uppercase">Audit Chain:</span>
              <span className="inline-flex items-center gap-1 text-sm font-extrabold text-[#16A34A]">
                <CheckCircle2 size={16} /> ✓ VALID
              </span>
            </div>
            <div>
              <span className="block font-mono text-[10px] text-[#64748B] uppercase">Hash Match Status:</span>
              <span className="font-mono text-xs font-bold text-[#111827]">
                Identical (Zero Variance)
              </span>
            </div>
          </div>

          {/* Security & Access Audit Counts */}
          <div className="space-y-3 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 md:col-span-2 lg:col-span-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Access Heuristics
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#64748B] uppercase">Suspicious Access:</span>
              <span className="font-mono text-xs font-bold text-[#16A34A]">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#64748B] uppercase">Unauthorized Attempts:</span>
              <span className="font-mono text-xs font-bold text-[#16A34A]">0</span>
            </div>
            <div>
              <span className="block font-mono text-[10px] text-[#64748B] uppercase">Last Access:</span>
              <span className="font-mono text-xs font-bold text-[#111827]">
                01 Sept 2026 · 11:32 AM
              </span>
            </div>
          </div>

        </div>

        {/* Cryptographic Hash Comparison Block */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 font-mono text-xs">
          <div className="space-y-2">
            <div>
              <span className="block text-[10px] font-bold text-[#64748B] uppercase">Original Hash:</span>
              <div className="mt-1 flex items-center justify-between rounded bg-white p-2 border border-slate-200">
                <span className="truncate text-[11px] text-[#111827] font-semibold">{originalHash}</span>
                <button
                  onClick={() => copyToClipboard(originalHash, 'Original')}
                  className="text-[#2563EB] hover:text-[#1d4ed8] text-[10px] font-bold flex items-center gap-1 shrink-0 ml-2"
                >
                  {copiedField === 'Original' ? <Check size={12} /> : <Copy size={12} />}
                  Copy
                </button>
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-[#64748B] uppercase">Current Hash:</span>
              <div className="mt-1 flex items-center justify-between rounded bg-white p-2 border border-slate-200">
                <span className="truncate text-[11px] text-[#111827] font-semibold">{currentHash}</span>
                <button
                  onClick={() => copyToClipboard(currentHash, 'Current')}
                  className="text-[#2563EB] hover:text-[#1d4ed8] text-[10px] font-bold flex items-center gap-1 shrink-0 ml-2"
                >
                  {copiedField === 'Current' ? <Check size={12} /> : <Copy size={12} />}
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Official Certificate Footer Seal */}
        <div className="mt-6 border-t-2 border-[#111827] pt-4 text-center">
          <span className="font-mono text-xs font-black tracking-wider text-[#111827]">
            ━━━━━━━━━━━━━━━━━━━━━━━━<br />
            GENERATED BY SECURE DOCS<br />
            ━━━━━━━━━━━━━━━━━━━━━━━━
          </span>
          <p className="mt-1 text-[10px] text-[#64748B]">
            Cryptographic Integrity Engine v2.4.1 · Attested under Section 65B of Indian Evidence Act
          </p>
        </div>

      </section>

      {/* ================================================================
          SECTION 3 – HASH DETAILS & SECTION 4 – AUDIT CHAIN STATUS
          ================================================================ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* SECTION 3 – HASH DETAILS */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="grid size-8 place-items-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
              <Hash size={18} />
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                SECTION 3 · CHECKSUM TELEMETRY
              </span>
              <h2 className="text-base font-bold text-[#111827]">Hash Details</h2>
            </div>
          </div>

          <div className="mt-4 space-y-3.5 text-xs">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase text-[#64748B]">Original SHA-256 Hash</span>
              <div className="mt-1 rounded-lg bg-[#F8FAFC] p-2.5 font-mono text-[11px] text-[#111827] border border-slate-200 break-all">
                {originalHash}
              </div>
            </div>

            <div>
              <span className="font-mono text-[10px] font-bold uppercase text-[#64748B]">Current SHA-256 Hash</span>
              <div className="mt-1 rounded-lg bg-[#F8FAFC] p-2.5 font-mono text-[11px] text-[#111827] border border-slate-200 break-all">
                {currentHash}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-lg bg-[#F8FAFC] p-3 border border-slate-200">
                <span className="block font-mono text-[10px] text-[#64748B]">Hash Match Status</span>
                <span className="font-bold text-[#16A34A] text-xs flex items-center gap-1 mt-0.5">
                  <CheckCircle2 size={13} /> Identical
                </span>
              </div>
              <div className="rounded-lg bg-[#F8FAFC] p-3 border border-slate-200">
                <span className="block font-mono text-[10px] text-[#64748B]">Verification Officer</span>
                <span className="font-bold text-[#111827] text-xs mt-0.5">
                  Officer Sharma (ID: OFF-882)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-[#16A34A]/10 p-3 text-xs border border-[#16A34A]/20">
              <span className="font-bold text-[#16A34A]">Hash Comparison Result:</span>
              <span className="font-mono font-black text-[#16A34A] text-sm">100% Match</span>
            </div>

            <div className="text-[10px] font-mono text-[#64748B]">
              Verification Timestamp: 01 Sept 2026 · 11:32:04 IST
            </div>
          </div>
        </section>

        {/* SECTION 4 – AUDIT CHAIN STATUS */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="grid size-8 place-items-center rounded-lg bg-[#16A34A]/10 text-[#16A34A]">
              <Database size={18} />
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                SECTION 4 · APPEND-ONLY LEDGER
              </span>
              <h2 className="text-base font-bold text-[#111827]">Audit Chain Status</h2>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#F8FAFC] p-3.5 border border-slate-200">
                <span className="block font-mono text-[10px] text-[#64748B]">Event Records Verified</span>
                <span className="font-mono text-2xl font-black text-[#111827]">42 / 42</span>
                <span className="text-[10px] text-[#16A34A] block mt-0.5">100% block continuity</span>
              </div>

              <div className="rounded-xl bg-[#F8FAFC] p-3.5 border border-slate-200">
                <span className="block font-mono text-[10px] text-[#64748B]">Chain Integrity Score</span>
                <span className="font-mono text-2xl font-black text-[#16A34A]">100%</span>
                <span className="text-[10px] text-[#64748B] block mt-0.5">Zero breaks or deltas</span>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950">Audit Chain Status:</span>
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#16A34A]">
                  <span className="size-2 rounded-full bg-[#16A34A] animate-pulse" />
                  🟢 VALID
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-emerald-900">
                Every event node in the sequence references the cryptographically signed parent block. Hash chaining prevents post-facto modifications.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-[#64748B] border-t border-slate-100 pt-3">
              <span>Last Audit Verification: <strong className="text-[#111827]">01 Sept 2026</strong></span>
              <Link href="/audit-logs/verify" className="font-bold text-[#2563EB] hover:underline">
                Explore Full Hash Tree &rarr;
              </Link>
            </div>
          </div>
        </section>

      </div>

      {/* ================================================================
          SECTION 5 – SECURITY ANALYSIS & SECTION 6 – REPORT TIMELINE
          ================================================================ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* SECTION 5 – SECURITY ANALYSIS */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="grid size-8 place-items-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
              <Shield size={18} />
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                SECTION 5 · THREAT POSTURE
              </span>
              <h2 className="text-base font-bold text-[#111827]">Security Analysis</h2>
            </div>
          </div>

          <div className="mt-4 space-y-3.5">
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-lg bg-[#F8FAFC] p-3 text-center border border-slate-200">
                <span className="block font-mono text-[9px] text-[#64748B] uppercase">Suspicious Access</span>
                <span className="font-mono text-xl font-bold text-[#16A34A]">0</span>
              </div>
              <div className="rounded-lg bg-[#F8FAFC] p-3 text-center border border-slate-200">
                <span className="block font-mono text-[9px] text-[#64748B] uppercase">Unauthorized Access</span>
                <span className="font-mono text-xl font-bold text-[#16A34A]">0</span>
              </div>
              <div className="rounded-lg bg-[#F8FAFC] p-3 text-center border border-slate-200">
                <span className="block font-mono text-[9px] text-[#64748B] uppercase">Failed Logins</span>
                <span className="font-mono text-xl font-bold text-[#16A34A]">0</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-[#F8FAFC] p-3 border border-slate-200">
                <span className="block font-mono text-[10px] text-[#64748B]">Security Threat Level:</span>
                <span className="font-mono text-sm font-bold text-[#16A34A]">LOW</span>
              </div>
              <div className="rounded-lg bg-[#F8FAFC] p-3 border border-slate-200">
                <span className="block font-mono text-[10px] text-[#64748B]">Risk Score:</span>
                <span className="font-mono text-sm font-bold text-[#16A34A]">0 / 100</span>
              </div>
            </div>

            {/* Result */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#16A34A]" />
                <span className="font-bold text-xs text-emerald-950">Result:</span>
              </div>
              <div className="mt-1 font-mono text-sm font-black text-[#16A34A]">
                🟢 NO SECURITY RISKS DETECTED
              </div>
              <p className="mt-1 text-[11px] text-emerald-900">
                No anomalous ingress, brute force access, or privilege boundary violations noted during this period.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 6 – REPORT TIMELINE */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="grid size-8 place-items-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
              <Clock size={18} />
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                SECTION 6 · EVENT CHRONOLOGY
              </span>
              <h2 className="text-base font-bold text-[#111827]">Report Timeline</h2>
            </div>
          </div>

          {/* Timeline Nodes */}
          <div className="relative mt-5 space-y-4 pl-6 before:absolute before:left-2 before:top-2 before:h-[80%] before:w-0.5 before:bg-slate-200">
            
            {/* Event 1: Document Created */}
            <div className="relative">
              <div className="absolute -left-6 top-1 size-2.5 rounded-full bg-[#2563EB] ring-4 ring-white" />
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#111827]">Document Created</span>
                <span className="font-mono text-[10px] text-[#64748B]">28 Aug 2026 · 09:15 AM</span>
              </div>
              <p className="text-[11px] text-[#64748B]">Initial intake and registration by Officer A into case repository.</p>
            </div>

            {/* Event 2: Version Updated */}
            <div className="relative">
              <div className="absolute -left-6 top-1 size-2.5 rounded-full bg-[#3B82F6] ring-4 ring-white" />
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#111827]">Version Updated</span>
                <span className="font-mono text-[10px] text-[#64748B]">30 Aug 2026 · 02:40 PM</span>
              </div>
              <p className="text-[11px] text-[#64748B]">Revision v3 finalized with officer digital signature.</p>
            </div>

            {/* Event 3: Integrity Verified */}
            <div className="relative">
              <div className="absolute -left-6 top-1 size-2.5 rounded-full bg-[#16A34A] ring-4 ring-white" />
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#111827]">Integrity Verified</span>
                <span className="font-mono text-[10px] text-[#64748B]">01 Sep 2026 · 11:30 AM</span>
              </div>
              <p className="text-[11px] text-[#64748B]">SHA-256 hash match confirmed with zero discrepancy.</p>
            </div>

            {/* Event 4: Audit Chain Validated */}
            <div className="relative">
              <div className="absolute -left-6 top-1 size-2.5 rounded-full bg-[#16A34A] ring-4 ring-white" />
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#111827]">Audit Chain Validated</span>
                <span className="font-mono text-[10px] text-[#64748B]">01 Sep 2026 · 11:31 AM</span>
              </div>
              <p className="text-[11px] text-[#64748B]">Continuous blockchain-style cryptographic continuity verified.</p>
            </div>

            {/* Event 5: Report Generated */}
            <div className="relative">
              <div className="absolute -left-6 top-1 size-2.5 rounded-full bg-[#16A34A] ring-4 ring-white" />
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#16A34A]">Report Generated</span>
                <span className="font-mono text-[10px] text-[#64748B]">01 Sep 2026 · 11:32 AM</span>
              </div>
              <p className="text-[11px] text-[#64748B]">One-Click verification brief compiled and cryptographically sealed.</p>
            </div>

          </div>
        </section>

      </div>

      {/* ================================================================
          SECTION 8 – REPORT ANALYTICS
          ================================================================ */}
      <section>
        <div className="mb-3">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            SECTION 8 · QUANTITATIVE CONFIDENCE
          </span>
          <h2 className="text-lg font-bold text-[#111827]">Report Analytics</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Verification Success Rate */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#16A34A]/40 hover:shadow-md">
            <span className="text-xs font-bold text-[#64748B]">Verification Success Rate</span>
            <div className="mt-2 font-mono text-3xl font-black text-[#16A34A]">100%</div>
            <span className="text-[10px] text-[#64748B] block mt-1">Zero verification failures</span>
          </div>

          {/* Audit Verification Status */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-md">
            <span className="text-xs font-bold text-[#64748B]">Audit Verification Status</span>
            <div className="mt-2 font-mono text-2xl font-black text-[#2563EB]">Verified · A+</div>
            <span className="text-[10px] text-[#64748B] block mt-1">ISO 27001 compliant</span>
          </div>

          {/* Integrity Health Score */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#16A34A]/40 hover:shadow-md">
            <span className="text-xs font-bold text-[#64748B]">Integrity Health Score</span>
            <div className="mt-2 font-mono text-3xl font-black text-[#16A34A]">100 / 100</div>
            <span className="text-[10px] text-[#64748B] block mt-1">Maximum score achievable</span>
          </div>

          {/* Security Confidence Score */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-md">
            <span className="text-xs font-bold text-[#64748B]">Security Confidence Score</span>
            <div className="mt-2 font-mono text-3xl font-black text-[#2563EB]">99.9%</div>
            <span className="text-[10px] text-[#64748B] block mt-1">Cryptographically attested</span>
          </div>

        </div>
      </section>

      {/* ================================================================
          SECTION 7 – REPORT ACTIONS (LARGE ACTION BUTTONS)
          ================================================================ */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:hidden">
        <div className="mb-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            SECTION 7 · DISPATCH & EXPORT
          </span>
          <h2 className="text-lg font-bold text-[#111827]">Report Actions</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          
          {/* Download PDF */}
          <button
            onClick={() => handleAction("Downloading Official PDF", "Packaging signed PDF report with cryptographic seals...")}
            className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-center transition hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-white hover:shadow-sm"
          >
            <div className="grid size-11 place-items-center rounded-xl bg-[#2563EB]/10 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition">
              <Download size={20} />
            </div>
            <div className="mt-3 font-bold text-xs text-[#111827]">Download PDF</div>
            <span className="mt-1 text-[10px] text-[#64748B]">Signed certificate file</span>
          </button>

          {/* Generate New Report */}
          <button
            onClick={handleGenerateNew}
            className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-center transition hover:-translate-y-0.5 hover:border-[#16A34A] hover:bg-white hover:shadow-sm"
          >
            <div className="grid size-11 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A] group-hover:bg-[#16A34A] group-hover:text-white transition">
              <RefreshCw size={20} />
            </div>
            <div className="mt-3 font-bold text-xs text-[#111827]">Generate New Report</div>
            <span className="mt-1 text-[10px] text-[#64748B]">Re-run full verification</span>
          </button>

          {/* Export Evidence */}
          <button
            onClick={() => handleAction("Exporting Evidence Dossier", "Exporting raw cryptographic hash receipts and chain proofs...")}
            className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-center transition hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-white hover:shadow-sm"
          >
            <div className="grid size-11 place-items-center rounded-xl bg-[#3B82F6]/10 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition">
              <FileCheck size={20} />
            </div>
            <div className="mt-3 font-bold text-xs text-[#111827]">Export Evidence</div>
            <span className="mt-1 text-[10px] text-[#64748B]">Court-ready forensic pack</span>
          </button>

          {/* Share Securely */}
          <button
            onClick={() => setModalAction('share')}
            className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-center transition hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-white hover:shadow-sm"
          >
            <div className="grid size-11 place-items-center rounded-xl bg-[#2563EB]/10 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition">
              <Share2 size={20} />
            </div>
            <div className="mt-3 font-bold text-xs text-[#111827]">Share Securely</div>
            <span className="mt-1 text-[10px] text-[#64748B]">Expiring encrypted link</span>
          </button>

          {/* Print Report */}
          <button
            onClick={handlePrint}
            className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-center transition hover:-translate-y-0.5 hover:border-[#111827] hover:bg-white hover:shadow-sm"
          >
            <div className="grid size-11 place-items-center rounded-xl bg-[#111827]/10 text-[#111827] group-hover:bg-[#111827] group-hover:text-white transition">
              <Printer size={20} />
            </div>
            <div className="mt-3 font-bold text-xs text-[#111827]">Print Report</div>
            <span className="mt-1 text-[10px] text-[#64748B]">Hardcopy docket format</span>
          </button>

        </div>
      </section>

      {/* ================================================================
          SECTION 9 – REPORT AUTHENTICITY
          ================================================================ */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            SECTION 9 · ATTESTATION & TAMPER SEAL
          </span>
          <h2 className="text-lg font-bold text-[#111827]">Report Authenticity</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 items-center">
          
          {/* Digital Verification Seal */}
          <div className="md:col-span-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#2563EB]/40 bg-[#2563EB]/5 p-6 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-[#2563EB] text-white shadow-md">
              <Award size={36} />
            </div>
            <div className="mt-3 font-mono text-xs font-black uppercase text-[#2563EB] tracking-wider">
              DIGITAL VERIFICATION SEAL
            </div>
            <span className="mt-1 text-[10px] text-[#64748B]">
              Cryptographically verified by HSM Root Authority
            </span>
            <div className="mt-3 font-mono text-[9px] text-[#111827] bg-white px-2.5 py-1 rounded border border-slate-200">
              SEAL ID: {verificationId}
            </div>
          </div>

          {/* Authenticity Metadata */}
          <div className="md:col-span-8 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg bg-[#F8FAFC] p-3 border border-slate-200">
                <span className="block font-mono text-[10px] text-[#64748B]">Generated Timestamp</span>
                <span className="font-bold text-[#111827]">{currentTime || '05 Sep 2026 · 09:18 IST'}</span>
              </div>
              <div className="rounded-lg bg-[#F8FAFC] p-3 border border-slate-200">
                <span className="block font-mono text-[10px] text-[#64748B]">Verification ID</span>
                <span className="font-mono font-bold text-[#2563EB]">{verificationId}</span>
              </div>
            </div>

            <div className="rounded-lg bg-[#F8FAFC] p-3 border border-slate-200">
              <span className="block font-mono text-[10px] text-[#64748B]">Generated By:</span>
              <span className="font-bold text-[#111827] text-sm">Secure Docs Integrity Engine</span>
              <p className="mt-0.5 text-[10px] text-[#64748B]">
                Operating under Hardware Security Module (HSM) FIPS 140-2 Level 3
              </p>
            </div>

            {/* Footer Notice */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-[#64748B] text-[11px] leading-relaxed">
              <strong className="text-[#111827]">Attestation Notice:</strong> "This report confirms the integrity status of the selected document based on available audit records, version history, and hash verification at the time of generation."
            </div>
          </div>

        </div>
      </section>

      {/* ================================================================
          MODAL: SHARE SECURELY
          ================================================================ */}
      {modalAction === 'share' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm print:hidden">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Share2 size={18} className="text-[#2563EB]" />
                <h3 className="text-base font-bold text-[#111827]">Share Report Securely</h3>
              </div>
              <button
                onClick={() => setModalAction(null)}
                className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100 hover:text-[#111827]"
              >
                <Check size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#111827]">One-Time Verification Link</label>
                <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-[#F8FAFC] p-2 font-mono text-[11px] text-[#2563EB]">
                  <span className="truncate">https://securedocs.gov.in/verify/{verificationId}</span>
                  <button
                    onClick={() => copyToClipboard(`https://securedocs.gov.in/verify/${verificationId}`, 'Link')}
                    className="ml-auto rounded bg-white px-2 py-0.5 text-[10px] font-bold text-[#111827] border border-slate-200 hover:bg-slate-50 shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#111827]">Access Expiration</label>
                <select className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-[#111827] outline-none">
                  <option>24 Hours (Standard Court Brief)</option>
                  <option>72 Hours (Inter-Agency Review)</option>
                  <option>7 Days (Judicial Docket)</option>
                </select>
              </div>

              <div className="rounded-lg bg-blue-50 p-3 text-blue-900 text-[11px]">
                Access will require SMS 2FA verification from authorized judicial or police officers.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setModalAction(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setModalAction(null);
                  handleAction("Share Token Generated", "Secure verification link copied to clipboard.");
                }}
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1d4ed8]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          OFFICIAL PRINT FOOTER (ONLY VISIBLE ON PRINT)
          ================================================================ */}
      <div className="hidden print:block text-center border-t border-black pt-4 text-[9px] font-mono">
        OFFICIAL COPY · GOVERNMENT EVIDENCE REPOSITORY · CERTIFIED UNDER SECTION 65B INDIAN EVIDENCE ACT · SECURE DOCS ENGINE v2.4.1
      </div>

    </div>
  );
}
