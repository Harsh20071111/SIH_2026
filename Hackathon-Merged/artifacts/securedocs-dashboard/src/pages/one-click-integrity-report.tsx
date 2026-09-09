import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ShieldCheck, ShieldAlert, Download, Printer, Share2, RefreshCw,
  FileText, CheckCircle2, AlertTriangle, Clock, Hash, Lock,
  Key, Award, QrCode, FileCheck, Check, Copy, ExternalLink,
  ChevronRight, ArrowLeft, ArrowUpRight, Sparkles, Database,
  Calendar, Layers, FileWarning, Eye, Shield, Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/* ================================================================
   CASE DATABASE – Each entry holds all data needed by the report
   ================================================================ */

interface TimelineEvent {
  title: string;
  date: string;
  description: string;
  color: string;
  highlight?: boolean;
}

interface CaseRecord {
  caseId: string;
  documentTitle: string;
  documentVersion: string;
  originalHash: string;
  currentHash: string;
  verificationId: string;
  integrityState: 'VERIFIED' | 'TAMPERED';
  auditChainState: 'VALID' | 'BROKEN';
  hashMatch: boolean;
  suspiciousAccess: number;
  unauthorizedAttempts: number;
  failedLogins: number;
  lastAccess: string;
  eventRecordsVerified: string;
  chainIntegrityScore: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number;
  verificationOfficer: string;
  verificationOfficerId: string;
  timeline: TimelineEvent[];
  verificationSuccessRate: string;
  integrityHealthScore: string;
  securityConfidenceScore: string;
}

const CASE_DATABASE: Record<string, CaseRecord> = {
  'C-1024': {
    caseId: 'C-1024',
    documentTitle: 'Evidence.pdf',
    documentVersion: 'v3',
    originalHash: 'A7F32B9D84F5E7A1C20D45E6789ABCDEF0123456789ABCDEF0123456789ABCDEF',
    currentHash: 'A7F32B9D84F5E7A1C20D45E6789ABCDEF0123456789ABCDEF0123456789ABCDEF',
    verificationId: 'SEC-VER-C1024-88492-2026',
    integrityState: 'VERIFIED',
    auditChainState: 'VALID',
    hashMatch: true,
    suspiciousAccess: 0,
    unauthorizedAttempts: 0,
    failedLogins: 0,
    lastAccess: '01 Sept 2026 · 11:32 AM',
    eventRecordsVerified: '42 / 42',
    chainIntegrityScore: '100%',
    threatLevel: 'LOW',
    riskScore: 0,
    verificationOfficer: 'Officer Sharma',
    verificationOfficerId: 'OFF-882',
    timeline: [
      { title: 'Document Created', date: '28 Aug 2026 · 09:15 AM', description: 'Initial intake and registration by Officer A into case repository.', color: 'bg-[#2563EB]' },
      { title: 'Version Updated', date: '30 Aug 2026 · 02:40 PM', description: 'Revision v3 finalized with officer digital signature.', color: 'bg-[#3B82F6]' },
      { title: 'Integrity Verified', date: '01 Sep 2026 · 11:30 AM', description: 'SHA-256 hash match confirmed with zero discrepancy.', color: 'bg-[#16A34A]' },
      { title: 'Audit Chain Validated', date: '01 Sep 2026 · 11:31 AM', description: 'Continuous blockchain-style cryptographic continuity verified.', color: 'bg-[#16A34A]' },
      { title: 'Report Generated', date: '01 Sep 2026 · 11:32 AM', description: 'One-Click verification brief compiled and cryptographically sealed.', color: 'bg-[#16A34A]', highlight: true },
    ],
    verificationSuccessRate: '100%',
    integrityHealthScore: '100 / 100',
    securityConfidenceScore: '99.9%',
  },
  'C-1025': {
    caseId: 'C-1025',
    documentTitle: 'WitnessStatement_Kumar.pdf',
    documentVersion: 'v2',
    originalHash: 'B8E41CAE95G6F8B2D31E56F7890BCDEFG1234567890BCDEFG1234567890BCDE01',
    currentHash: 'B8E41CAE95G6F8B2D31E56F7890BCDEFG1234567890BCDEFG1234567890BCDE01',
    verificationId: 'SEC-VER-C1025-77301-2026',
    integrityState: 'VERIFIED',
    auditChainState: 'VALID',
    hashMatch: true,
    suspiciousAccess: 0,
    unauthorizedAttempts: 0,
    failedLogins: 0,
    lastAccess: '03 Sept 2026 · 14:18 PM',
    eventRecordsVerified: '28 / 28',
    chainIntegrityScore: '100%',
    threatLevel: 'LOW',
    riskScore: 0,
    verificationOfficer: 'Officer Gupta',
    verificationOfficerId: 'OFF-645',
    timeline: [
      { title: 'Document Created', date: '20 Aug 2026 · 10:00 AM', description: 'Witness statement recorded and digitized by Officer C.', color: 'bg-[#2563EB]' },
      { title: 'Version Updated', date: '25 Aug 2026 · 04:15 PM', description: 'Addendum appended and v2 finalized by legal reviewer.', color: 'bg-[#3B82F6]' },
      { title: 'Integrity Verified', date: '03 Sep 2026 · 14:15 PM', description: 'SHA-256 hash match confirmed with zero discrepancy.', color: 'bg-[#16A34A]' },
      { title: 'Audit Chain Validated', date: '03 Sep 2026 · 14:17 PM', description: 'Full cryptographic continuity verified across 28 events.', color: 'bg-[#16A34A]' },
      { title: 'Report Generated', date: '03 Sep 2026 · 14:18 PM', description: 'Verification brief compiled and sealed.', color: 'bg-[#16A34A]', highlight: true },
    ],
    verificationSuccessRate: '100%',
    integrityHealthScore: '100 / 100',
    securityConfidenceScore: '99.8%',
  },
  'C-1026': {
    caseId: 'C-1026',
    documentTitle: 'ForensicAnalysis_BloodSample.pdf',
    documentVersion: 'v1',
    originalHash: 'C9F52DBF06H7G9C3E42F67G8901CDEFGH2345678901CDEFGH2345678901CDEF12',
    currentHash: 'D1A63ECG17I8H0D4F53G78H9012DEFGHI3456789012DEFGHI3456789012DEFG23',
    verificationId: 'SEC-VER-C1026-66210-2026',
    integrityState: 'TAMPERED',
    auditChainState: 'BROKEN',
    hashMatch: false,
    suspiciousAccess: 3,
    unauthorizedAttempts: 1,
    failedLogins: 2,
    lastAccess: '04 Sept 2026 · 22:47 PM',
    eventRecordsVerified: '35 / 38',
    chainIntegrityScore: '92.1%',
    threatLevel: 'HIGH',
    riskScore: 87,
    verificationOfficer: 'Officer Reddy',
    verificationOfficerId: 'OFF-312',
    timeline: [
      { title: 'Document Created', date: '15 Jul 2026 · 08:30 AM', description: 'Forensic lab report uploaded by Officer D.', color: 'bg-[#2563EB]' },
      { title: 'Suspicious Access Detected', date: '02 Sep 2026 · 03:14 AM', description: 'Access from unrecognized IP address during off-hours.', color: 'bg-[#DC2626]' },
      { title: 'Hash Mismatch Detected', date: '04 Sep 2026 · 22:45 PM', description: 'Current hash differs from original — possible tampering.', color: 'bg-[#DC2626]' },
      { title: 'Audit Chain Break Detected', date: '04 Sep 2026 · 22:46 PM', description: '3 chain blocks failed cryptographic continuity verification.', color: 'bg-[#DC2626]' },
      { title: 'Report Generated', date: '04 Sep 2026 · 22:47 PM', description: 'CRITICAL: Report flagged for immediate investigation.', color: 'bg-[#DC2626]', highlight: true },
    ],
    verificationSuccessRate: '92.1%',
    integrityHealthScore: '34 / 100',
    securityConfidenceScore: '41.2%',
  },
  'C-1023': {
    caseId: 'C-1023',
    documentTitle: 'Evidence_Report.pdf',
    documentVersion: 'v5',
    originalHash: 'E2G74FDH28J0I1E5G64H89I0123EFGHIJ4567890123EFGHIJ4567890123EFGH34',
    currentHash: 'E2G74FDH28J0I1E5G64H89I0123EFGHIJ4567890123EFGHIJ4567890123EFGH34',
    verificationId: 'SEC-VER-C1023-99583-2026',
    integrityState: 'VERIFIED',
    auditChainState: 'VALID',
    hashMatch: true,
    suspiciousAccess: 0,
    unauthorizedAttempts: 0,
    failedLogins: 0,
    lastAccess: '05 Sept 2026 · 08:55 AM',
    eventRecordsVerified: '67 / 67',
    chainIntegrityScore: '100%',
    threatLevel: 'LOW',
    riskScore: 0,
    verificationOfficer: 'Auditor Ananya Rao',
    verificationOfficerId: 'AUD-201',
    timeline: [
      { title: 'Document Created', date: '10 Jun 2026 · 09:00 AM', description: 'Initial evidence report drafted by lead investigator.', color: 'bg-[#2563EB]' },
      { title: 'Version Updated (v3)', date: '15 Jul 2026 · 11:20 AM', description: 'Additional exhibits appended by forensics division.', color: 'bg-[#3B82F6]' },
      { title: 'Version Updated (v5)', date: '20 Aug 2026 · 03:45 PM', description: 'Final revision with court-ordered amendments.', color: 'bg-[#3B82F6]' },
      { title: 'Integrity Verified', date: '05 Sep 2026 · 08:50 AM', description: 'SHA-256 hash match confirmed. 67 audit events validated.', color: 'bg-[#16A34A]' },
      { title: 'Report Generated', date: '05 Sep 2026 · 08:55 AM', description: 'Full verification report compiled with auditor attestation.', color: 'bg-[#16A34A]', highlight: true },
    ],
    verificationSuccessRate: '100%',
    integrityHealthScore: '100 / 100',
    securityConfidenceScore: '99.9%',
  },
  'C-1027': {
    caseId: 'C-1027',
    documentTitle: 'LegalFiling_HighCourt.pdf',
    documentVersion: 'v1',
    originalHash: 'F3H85GEI39K1J2F6H75I90J1234FGHIJK5678901234FGHIJK5678901234FGHI45',
    currentHash: 'F3H85GEI39K1J2F6H75I90J1234FGHIJK5678901234FGHIJK5678901234FGHI45',
    verificationId: 'SEC-VER-C1027-55104-2026',
    integrityState: 'VERIFIED',
    auditChainState: 'VALID',
    hashMatch: true,
    suspiciousAccess: 1,
    unauthorizedAttempts: 1,
    failedLogins: 0,
    lastAccess: '04 Sept 2026 · 16:30 PM',
    eventRecordsVerified: '19 / 19',
    chainIntegrityScore: '100%',
    threatLevel: 'MEDIUM',
    riskScore: 28,
    verificationOfficer: 'Legal Reviewer Verma',
    verificationOfficerId: 'LR-410',
    timeline: [
      { title: 'Document Created', date: '01 Sep 2026 · 10:00 AM', description: 'High court filing prepared by Legal Reviewer Verma.', color: 'bg-[#2563EB]' },
      { title: 'Unauthorized Access Attempt', date: '02 Sep 2026 · 19:45 PM', description: 'Access attempt by user outside the assigned case team — blocked.', color: 'bg-[#F59E0B]' },
      { title: 'Integrity Verified', date: '04 Sep 2026 · 16:28 PM', description: 'SHA-256 hash match confirmed after security review.', color: 'bg-[#16A34A]' },
      { title: 'Audit Chain Validated', date: '04 Sep 2026 · 16:29 PM', description: 'All 19 audit events validated with continuous chain.', color: 'bg-[#16A34A]' },
      { title: 'Report Generated', date: '04 Sep 2026 · 16:30 PM', description: 'Verification brief compiled. Medium risk flag retained.', color: 'bg-[#F59E0B]', highlight: true },
    ],
    verificationSuccessRate: '100%',
    integrityHealthScore: '95 / 100',
    securityConfidenceScore: '88.4%',
  },
  'C-1028': {
    caseId: 'C-1028',
    documentTitle: 'ChargeSheet_Final.pdf',
    documentVersion: 'v4',
    originalHash: 'G4I96HFJ40L2K3G7I86J01K2345GHIJKL6789012345GHIJKL6789012345GHIJ56',
    currentHash: 'G4I96HFJ40L2K3G7I86J01K2345GHIJKL6789012345GHIJKL6789012345GHIJ56',
    verificationId: 'SEC-VER-C1028-44215-2026',
    integrityState: 'VERIFIED',
    auditChainState: 'VALID',
    hashMatch: true,
    suspiciousAccess: 0,
    unauthorizedAttempts: 0,
    failedLogins: 0,
    lastAccess: '05 Sept 2026 · 07:10 AM',
    eventRecordsVerified: '54 / 54',
    chainIntegrityScore: '100%',
    threatLevel: 'LOW',
    riskScore: 0,
    verificationOfficer: 'Officer Patel',
    verificationOfficerId: 'OFF-773',
    timeline: [
      { title: 'Document Created', date: '05 Jul 2026 · 11:00 AM', description: 'Charge sheet drafted by prosecution team lead.', color: 'bg-[#2563EB]' },
      { title: 'Version Updated (v2)', date: '20 Jul 2026 · 09:30 AM', description: 'Supplementary charges appended after new evidence.', color: 'bg-[#3B82F6]' },
      { title: 'Version Updated (v4)', date: '15 Aug 2026 · 02:00 PM', description: 'Final version with all annexures and exhibits.', color: 'bg-[#3B82F6]' },
      { title: 'Integrity Verified', date: '05 Sep 2026 · 07:08 AM', description: 'SHA-256 hash match confirmed. 54 audit events validated.', color: 'bg-[#16A34A]' },
      { title: 'Report Generated', date: '05 Sep 2026 · 07:10 AM', description: 'Full verification report compiled and cryptographically sealed.', color: 'bg-[#16A34A]', highlight: true },
    ],
    verificationSuccessRate: '100%',
    integrityHealthScore: '100 / 100',
    securityConfidenceScore: '99.9%',
  },
};

const AVAILABLE_CASE_IDS = Object.keys(CASE_DATABASE);

/* ================================================================
   COMPONENT
   ================================================================ */

interface Props {
  id?: string;
}

export default function OneClickIntegrityReport({ id: propId = 'C-1024' }: Props) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalAction, setModalAction] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [activeCaseId, setActiveCaseId] = useState<string>(propId);

  // Sync with route-level prop changes
  useEffect(() => {
    setActiveCaseId(propId);
    setSearchInput('');
  }, [propId]);

  const caseData = CASE_DATABASE[activeCaseId] || null;

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

  const handleCaseSearch = () => {
    const normalized = searchInput.trim().toUpperCase();
    if (!normalized) return;
    // Allow users to enter with or without the "C-" prefix
    const caseKey = normalized.startsWith('C-') ? normalized : `C-${normalized}`;
    setActiveCaseId(caseKey);
    if (!CASE_DATABASE[caseKey]) {
      toast({
        title: "Case Not Found",
        description: `No case record found for "${caseKey}". Available: ${AVAILABLE_CASE_IDS.join(', ')}`,
      });
    }
  };

  const handleGenerateNew = () => {
    if (!caseData) return;
    setIsGenerating(true);
    toast({
      title: "Re-verifying Document Integrity",
      description: `Recalculating SHA-256 checksum for ${caseData.documentTitle}...`,
    });
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Integrity Verification Complete",
        description: `Document ${caseData.documentTitle} verification complete for case ${caseData.caseId}.`,
      });
    }, 1600);
  };

  // Derived display helpers
  const isVerified = caseData?.integrityState === 'VERIFIED';
  const isChainValid = caseData?.auditChainState === 'VALID';
  const isHashMatch = caseData?.hashMatch ?? false;
  const statusColor = isVerified ? '#16A34A' : '#DC2626';
  const statusIcon = isVerified ? '🟢' : '🔴';
  const chainStatusIcon = isChainValid ? '🟢' : '🔴';
  const threatColor = caseData?.threatLevel === 'LOW' ? '#16A34A' : caseData?.threatLevel === 'MEDIUM' ? '#F59E0B' : '#DC2626';

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
          {caseData && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 font-mono text-[10px] font-bold ${isVerified ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#DC2626]/10 text-[#DC2626]'}`}>
              <span className={`size-1.5 rounded-full animate-pulse ${isVerified ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`} />
              LIVE VERIFICATION: {isVerified ? 'OFFICIAL' : 'ALERT'}
            </span>
          )}
          {caseData && (
            <span className="font-mono text-[10px] text-[#64748B]">
              Ref ID: {caseData.verificationId}
            </span>
          )}
        </div>
      </div>

      {/* ================================================================
          CASE SEARCH BAR
          ================================================================ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end print:hidden">
        <div className="flex-1 max-w-md">
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">Search Case ID</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Enter Case ID (e.g. C-1025, C-1026)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCaseSearch()}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs text-[#111827] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition"
            />
          </div>
        </div>
        <button
          onClick={handleCaseSearch}
          className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#1d4ed8]"
        >
          <Search size={14} />
          Search Case
        </button>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_CASE_IDS.map((cid) => (
            <button
              key={cid}
              onClick={() => { setActiveCaseId(cid); setSearchInput(''); }}
              className={`rounded-md px-2.5 py-1.5 font-mono text-[10px] font-bold border transition ${
                activeCaseId === cid
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white text-[#64748B] border-slate-200 hover:border-[#2563EB] hover:text-[#2563EB]'
              }`}
            >
              {cid}
            </button>
          ))}
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
              Case Ref: {activeCaseId}
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
            disabled={isGenerating || !caseData}
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
      {/* ================================================================
          CASE NOT FOUND STATE
          ================================================================ */}
      {!caseData && (
        <section className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#DC2626]/10 text-[#DC2626]">
            <ShieldAlert size={32} />
          </div>
          <h2 className="mt-4 text-xl font-black text-[#111827]">Case Not Found</h2>
          <p className="mt-2 text-sm text-[#64748B]">
            No case record found for <strong className="font-mono text-[#DC2626]">{activeCaseId}</strong>.
          </p>
          <p className="mt-1 text-xs text-[#64748B]">
            Available cases: {AVAILABLE_CASE_IDS.map((cid) => (
              <button key={cid} onClick={() => { setActiveCaseId(cid); setSearchInput(''); }} className="mx-1 font-mono font-bold text-[#2563EB] hover:underline">{cid}</button>
            ))}
          </p>
        </section>
      )}

      {caseData && (<>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            SECTION 2 · VERIFICATION GATES
          </span>
          <span className={`font-mono text-[10px] font-bold ${isVerified && isChainValid && isHashMatch ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            {isVerified && isChainValid && isHashMatch ? 'All 5 Status Gates Passed' : 'ATTENTION: Verification Issues Detected'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Document Integrity */}
          <div className={`flex flex-col justify-between rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 ${isVerified ? 'border-slate-200 hover:border-[#16A34A]/40' : 'border-[#DC2626]/40'}`}>
            <span className="text-xs font-bold text-[#64748B]">Document Integrity</span>
            <div className="mt-2 flex items-center gap-2">
              <span className={`font-mono text-sm font-extrabold`} style={{ color: statusColor }}>{statusIcon} {caseData.integrityState}</span>
            </div>
            <span className="mt-1 text-[10px] text-[#64748B]">{isVerified ? 'Bit-level match confirmed' : 'Tampering detected'}</span>
          </div>

          {/* Hash Validation */}
          <div className={`flex flex-col justify-between rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 ${isHashMatch ? 'border-slate-200 hover:border-[#16A34A]/40' : 'border-[#DC2626]/40'}`}>
            <span className="text-xs font-bold text-[#64748B]">Hash Validation</span>
            <div className="mt-2 flex items-center gap-2">
              <span className={`font-mono text-sm font-extrabold`} style={{ color: isHashMatch ? '#16A34A' : '#DC2626' }}>{isHashMatch ? '🟢 MATCHED' : '🔴 MISMATCH'}</span>
            </div>
            <span className="mt-1 text-[10px] text-[#64748B]">{isHashMatch ? 'SHA-256 match 100%' : 'Hash values differ'}</span>
          </div>

          {/* Version Verification */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#16A34A]/40">
            <span className="text-xs font-bold text-[#64748B]">Version Verification</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-[#16A34A]">🟢 VERIFIED</span>
            </div>
            <span className="mt-1 text-[10px] text-[#64748B]">Latest release: {caseData.documentVersion}</span>
          </div>

          {/* Audit Chain Verification */}
          <div className={`flex flex-col justify-between rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 ${isChainValid ? 'border-slate-200 hover:border-[#16A34A]/40' : 'border-[#DC2626]/40'}`}>
            <span className="text-xs font-bold text-[#64748B]">Audit Chain Verification</span>
            <div className="mt-2 flex items-center gap-2">
              <span className={`font-mono text-sm font-extrabold`} style={{ color: isChainValid ? '#16A34A' : '#DC2626' }}>{chainStatusIcon} {caseData.auditChainState}</span>
            </div>
            <span className="mt-1 text-[10px] text-[#64748B]">{isChainValid ? 'No severed hash blocks' : 'Chain breaks detected'}</span>
          </div>

          {/* Access Security Status */}
          <div className={`flex flex-col justify-between rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 ${caseData.suspiciousAccess === 0 ? 'border-slate-200 hover:border-[#16A34A]/40' : 'border-[#DC2626]/40'}`}>
            <span className="text-xs font-bold text-[#64748B]">Access Security Status</span>
            <div className="mt-2 flex items-center gap-2">
              <span className={`font-mono text-xs font-extrabold`} style={{ color: threatColor }}>
                {caseData.suspiciousAccess === 0 ? '🟢 NO THREATS DETECTED' : `🔴 ${caseData.suspiciousAccess} SUSPICIOUS EVENT(S)`}
              </span>
            </div>
            <span className="mt-1 text-[10px] text-[#64748B]">{caseData.suspiciousAccess} suspicious events</span>
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
              <span className="font-mono text-base font-bold text-[#111827]">{caseData.caseId}</span>
            </div>
            <div>
              <span className="block font-mono text-[10px] text-[#64748B] uppercase">Document Title:</span>
              <span className="text-sm font-bold text-[#111827] flex items-center gap-1.5">
                <FileText size={15} className="text-[#2563EB]" />
                {caseData.documentTitle}
              </span>
            </div>
            <div>
              <span className="block font-mono text-[10px] text-[#64748B] uppercase">Document Version:</span>
              <span className="inline-flex rounded bg-[#2563EB]/10 px-2 py-0.5 font-mono text-xs font-bold text-[#2563EB]">
                {caseData.documentVersion}
              </span>
            </div>
          </div>

          {/* Cryptographic Validation Summary */}
          <div className="space-y-3 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: statusColor }}>
              Integrity Status
            </span>
            <div>
              <span className="block font-mono text-[10px] text-[#64748B] uppercase">Integrity State:</span>
              <span className="inline-flex items-center gap-1 text-sm font-extrabold" style={{ color: statusColor }}>
                {isVerified ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />} {isVerified ? '✓ VERIFIED' : '✗ TAMPERED'}
              </span>
            </div>
            <div>
              <span className="block font-mono text-[10px] text-[#64748B] uppercase">Audit Chain:</span>
              <span className="inline-flex items-center gap-1 text-sm font-extrabold" style={{ color: isChainValid ? '#16A34A' : '#DC2626' }}>
                {isChainValid ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />} {isChainValid ? '✓ VALID' : '✗ BROKEN'}
              </span>
            </div>
            <div>
              <span className="block font-mono text-[10px] text-[#64748B] uppercase">Hash Match Status:</span>
              <span className="font-mono text-xs font-bold" style={{ color: isHashMatch ? '#111827' : '#DC2626' }}>
                {isHashMatch ? 'Identical (Zero Variance)' : 'MISMATCH DETECTED'}
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
              <span className="font-mono text-xs font-bold" style={{ color: caseData.suspiciousAccess === 0 ? '#16A34A' : '#DC2626' }}>{caseData.suspiciousAccess}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#64748B] uppercase">Unauthorized Attempts:</span>
              <span className="font-mono text-xs font-bold" style={{ color: caseData.unauthorizedAttempts === 0 ? '#16A34A' : '#DC2626' }}>{caseData.unauthorizedAttempts}</span>
            </div>
            <div>
              <span className="block font-mono text-[10px] text-[#64748B] uppercase">Last Access:</span>
              <span className="font-mono text-xs font-bold text-[#111827]">
                {caseData.lastAccess}
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
                <span className="truncate text-[11px] text-[#111827] font-semibold">{caseData.originalHash}</span>
                <button
                  onClick={() => copyToClipboard(caseData.originalHash, 'Original')}
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
                <span className="truncate text-[11px] text-[#111827] font-semibold">{caseData.currentHash}</span>
                <button
                  onClick={() => copyToClipboard(caseData.currentHash, 'Current')}
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
                <span className="font-mono text-[11px] text-[#111827] font-semibold">{caseData.originalHash}</span>
              </div>
            </div>

            <div>
              <span className="font-mono text-[10px] font-bold uppercase text-[#64748B]">Current SHA-256 Hash</span>
              <div className="mt-1 rounded-lg bg-[#F8FAFC] p-2.5 font-mono text-[11px] text-[#111827] border border-slate-200 break-all">
                {caseData.currentHash}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-lg bg-[#F8FAFC] p-3 border border-slate-200">
                <span className="block font-mono text-[10px] text-[#64748B]">Hash Match Status</span>
                <span className={`font-bold text-xs flex items-center gap-1 mt-0.5`} style={{ color: isHashMatch ? '#16A34A' : '#DC2626' }}>
                  {isHashMatch ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />} {isHashMatch ? 'Identical' : 'Mismatch'}
                </span>
              </div>
              <div className="rounded-lg bg-[#F8FAFC] p-3 border border-slate-200">
                <span className="block font-mono text-[10px] text-[#64748B]">Verification Officer</span>
                <span className="font-bold text-[#111827] text-xs mt-0.5">
                  {caseData.verificationOfficer} (ID: {caseData.verificationOfficerId})
                </span>
              </div>
            </div>

            <div className={`flex items-center justify-between rounded-lg p-3 text-xs border`} style={{ backgroundColor: isHashMatch ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)', borderColor: isHashMatch ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)' }}>
              <span className="font-bold" style={{ color: isHashMatch ? '#16A34A' : '#DC2626' }}>Hash Comparison Result:</span>
              <span className="font-mono font-black text-sm" style={{ color: isHashMatch ? '#16A34A' : '#DC2626' }}>{isHashMatch ? '100% Match' : 'MISMATCH'}</span>
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
                <span className="font-mono text-2xl font-black text-[#111827]">{caseData.eventRecordsVerified}</span>
                <span className="text-[10px] block mt-0.5" style={{ color: isChainValid ? '#16A34A' : '#DC2626' }}>{isChainValid ? '100% block continuity' : 'Chain breaks detected'}</span>
              </div>

              <div className="rounded-xl bg-[#F8FAFC] p-3.5 border border-slate-200">
                <span className="block font-mono text-[10px] text-[#64748B]">Chain Integrity Score</span>
                <span className="font-mono text-2xl font-black" style={{ color: isChainValid ? '#16A34A' : '#DC2626' }}>{caseData.chainIntegrityScore}</span>
                <span className="text-[10px] text-[#64748B] block mt-0.5">{isChainValid ? 'Zero breaks or deltas' : 'Integrity compromised'}</span>
              </div>
            </div>

            <div className={`rounded-xl border p-4 ${isChainValid ? 'border-emerald-200 bg-emerald-50/60' : 'border-red-200 bg-red-50/60'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isChainValid ? 'text-emerald-950' : 'text-red-950'}`}>Audit Chain Status:</span>
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold" style={{ color: isChainValid ? '#16A34A' : '#DC2626' }}>
                  <span className="size-2 rounded-full animate-pulse" style={{ backgroundColor: isChainValid ? '#16A34A' : '#DC2626' }} />
                  {chainStatusIcon} {caseData.auditChainState}
                </span>
              </div>
              <p className={`mt-2 text-xs leading-relaxed ${isChainValid ? 'text-emerald-900' : 'text-red-900'}`}>
                {isChainValid ? 'Every event node in the sequence references the cryptographically signed parent block. Hash chaining prevents post-facto modifications.' : 'WARNING: Chain continuity has been broken. Some event nodes failed parent block verification. Immediate investigation required.'}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-[#64748B] border-t border-slate-100 pt-3">
              <span>Last Audit Verification: <strong className="text-[#111827]">{caseData.lastAccess.split('·')[0].trim()}</strong></span>
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
                <span className="font-mono text-xl font-bold" style={{ color: caseData.suspiciousAccess === 0 ? '#16A34A' : '#DC2626' }}>{caseData.suspiciousAccess}</span>
              </div>
              <div className="rounded-lg bg-[#F8FAFC] p-3 text-center border border-slate-200">
                <span className="block font-mono text-[9px] text-[#64748B] uppercase">Unauthorized Access</span>
                <span className="font-mono text-xl font-bold" style={{ color: caseData.unauthorizedAttempts === 0 ? '#16A34A' : '#DC2626' }}>{caseData.unauthorizedAttempts}</span>
              </div>
              <div className="rounded-lg bg-[#F8FAFC] p-3 text-center border border-slate-200">
                <span className="block font-mono text-[9px] text-[#64748B] uppercase">Failed Logins</span>
                <span className="font-mono text-xl font-bold" style={{ color: caseData.failedLogins === 0 ? '#16A34A' : '#DC2626' }}>{caseData.failedLogins}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-[#F8FAFC] p-3 border border-slate-200">
                <span className="block font-mono text-[10px] text-[#64748B]">Security Threat Level:</span>
                <span className="font-mono text-sm font-bold" style={{ color: threatColor }}>{caseData.threatLevel}</span>
              </div>
              <div className="rounded-lg bg-[#F8FAFC] p-3 border border-slate-200">
                <span className="block font-mono text-[10px] text-[#64748B]">Risk Score:</span>
                <span className="font-mono text-sm font-bold" style={{ color: threatColor }}>{caseData.riskScore} / 100</span>
              </div>
            </div>

            {/* Result */}
            <div className={`rounded-xl border p-4 ${caseData.riskScore === 0 ? 'border-emerald-200 bg-emerald-50/70' : caseData.riskScore < 50 ? 'border-amber-200 bg-amber-50/70' : 'border-red-200 bg-red-50/70'}`}>
              <div className="flex items-center gap-2">
                {caseData.riskScore === 0 ? <CheckCircle2 size={16} className="text-[#16A34A]" /> : <AlertTriangle size={16} style={{ color: threatColor }} />}
                <span className={`font-bold text-xs ${caseData.riskScore === 0 ? 'text-emerald-950' : caseData.riskScore < 50 ? 'text-amber-950' : 'text-red-950'}`}>Result:</span>
              </div>
              <div className="mt-1 font-mono text-sm font-black" style={{ color: threatColor }}>
                {caseData.riskScore === 0 ? '🟢 NO SECURITY RISKS DETECTED' : caseData.riskScore < 50 ? '🟡 LOW-MEDIUM RISK DETECTED' : '🔴 HIGH SECURITY RISK DETECTED'}
              </div>
              <p className={`mt-1 text-[11px] ${caseData.riskScore === 0 ? 'text-emerald-900' : caseData.riskScore < 50 ? 'text-amber-900' : 'text-red-900'}`}>
                {caseData.riskScore === 0 ? 'No anomalous ingress, brute force access, or privilege boundary violations noted during this period.' : `${caseData.suspiciousAccess} suspicious access events and ${caseData.unauthorizedAttempts} unauthorized attempt(s) detected. Investigation recommended.`}
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
            {caseData.timeline.map((event, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-6 top-1 size-2.5 rounded-full ${event.color} ring-4 ring-white`} />
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold ${event.highlight ? '' : 'text-[#111827]'}`} style={event.highlight ? { color: event.color.includes('16A34A') ? '#16A34A' : event.color.includes('DC2626') ? '#DC2626' : event.color.includes('F59E0B') ? '#F59E0B' : '#111827' } : undefined}>{event.title}</span>
                  <span className="font-mono text-[10px] text-[#64748B]">{event.date}</span>
                </div>
                <p className="text-[11px] text-[#64748B]">{event.description}</p>
              </div>
            ))}
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
            <div className="mt-2 font-mono text-3xl font-black" style={{ color: statusColor }}>{caseData.verificationSuccessRate}</div>
            <span className="text-[10px] text-[#64748B] block mt-1">{isVerified ? 'Zero verification failures' : 'Verification issues detected'}</span>
          </div>

          {/* Audit Verification Status */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-md">
            <span className="text-xs font-bold text-[#64748B]">Audit Verification Status</span>
            <div className="mt-2 font-mono text-2xl font-black" style={{ color: isChainValid ? '#2563EB' : '#DC2626' }}>{isChainValid ? 'Verified · A+' : 'Failed · F'}</div>
            <span className="text-[10px] text-[#64748B] block mt-1">{isChainValid ? 'ISO 27001 compliant' : 'Chain breaks detected'}</span>
          </div>

          {/* Integrity Health Score */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#16A34A]/40 hover:shadow-md">
            <span className="text-xs font-bold text-[#64748B]">Integrity Health Score</span>
            <div className="mt-2 font-mono text-3xl font-black" style={{ color: statusColor }}>{caseData.integrityHealthScore}</div>
            <span className="text-[10px] text-[#64748B] block mt-1">{isVerified ? 'Maximum score achievable' : 'Below threshold'}</span>
          </div>

          {/* Security Confidence Score */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-md">
            <span className="text-xs font-bold text-[#64748B]">Security Confidence Score</span>
            <div className="mt-2 font-mono text-3xl font-black" style={{ color: threatColor }}>{caseData.securityConfidenceScore}</div>
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
              SEAL ID: {caseData.verificationId}
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
                <span className="font-mono font-bold text-[#2563EB]">{caseData.verificationId}</span>
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
                  <span className="truncate">https://securedocs.gov.in/verify/{caseData.verificationId}</span>
                  <button
                    onClick={() => copyToClipboard(`https://securedocs.gov.in/verify/${caseData.verificationId}`, 'Link')}
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
      </>)}

    </div>
  );
}
