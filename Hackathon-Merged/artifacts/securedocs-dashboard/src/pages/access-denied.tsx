import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ShieldAlert,
  Lock,
  FileText,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Phone,
  Mail,
  UserCheck,
  KeyRound,
  FileKey,
  ShieldCheck,
  Copy,
  Check,
  Send,
  Building2,
  Clock,
  Fingerprint,
  Info,
  ChevronRight,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function AccessDenied() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Real-time timestamp formatted for government-grade security logging
  const [timestamp, setTimestamp] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Modals state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);

  // Access Request Form State
  const [requestReason, setRequestReason] = useState('Case Investigation Evidence Analysis');
  const [requestedDuration, setRequestedDuration] = useState('24 hours');
  const [urgencyLevel, setUrgencyLevel] = useState('High');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimestamp(`${dateStr} ${timeStr} (${tz})`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast({
      title: 'Copied to clipboard',
      description: `${fieldName}: ${text}`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRequest(true);
    setTimeout(() => {
      setSubmittingRequest(false);
      setRequestSubmitted(true);
      toast({
        title: 'Access Request Submitted',
        description: 'Ticket #REQ-8842 has been dispatched to Case Administrator & SOC.',
      });
      setTimeout(() => {
        setRequestModalOpen(false);
        setRequestSubmitted(false);
      }, 1500);
    }, 800);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Security Banner / Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-[#64748B]">
          <Link href="/dashboard" className="transition-colors hover:text-[#2563EB]">
            SECUREDOCS
          </Link>
          <span>/</span>
          <Link href="/documents" className="transition-colors hover:text-[#2563EB]">
            DOCUMENT REPOSITORY
          </Link>
          <span>/</span>
          <span className="font-bold text-[#DC2626]">SECURITY RESTRICTION (403)</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#DC2626]">
            <span className="size-2 rounded-full bg-[#DC2626] animate-ping" />
            CLEARANCE ENFORCED
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-[#0B1220] px-2 py-0.5 font-mono text-[11px] font-semibold text-white">
            INCIDENT ID: INC-403-9824
          </span>
        </div>
      </div>

      {/* Main Grid: Centered Core Security Card + Side Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left / Center Main Column (8 cols on large screens) */}
        <div className="space-y-6 lg:col-span-8">
          
          {/* CENTERED SECURITY CARD */}
          <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-8 shadow-sm sm:p-10">
            {/* Top decorative security strip */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#DC2626] via-[#F59E0B] to-[#DC2626]" />

            <div className="flex flex-col items-center text-center">
              {/* Large Lock Icon / Shield with security animation glow */}
              <div className="relative mb-6">
                {/* Glowing alert rings */}
                <div className="absolute -inset-2 rounded-full bg-red-100/60 blur-md animate-pulse" />
                <div className="relative grid size-24 place-items-center rounded-2xl border-2 border-red-200 bg-gradient-to-b from-red-50 to-red-100/80 text-[#DC2626] shadow-inner sm:size-28">
                  <div className="relative">
                    <Lock className="size-12 stroke-[2.2] text-[#DC2626] sm:size-14" />
                    <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#DC2626] text-white">
                      <AlertTriangle size={12} strokeWidth={3} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="flex items-center gap-2">
                <span className="text-xl">🔒</span>
                <h1 className="text-2xl font-black tracking-tight text-[#111827] sm:text-3xl">
                  ACCESS DENIED
                </h1>
              </div>

              {/* Message */}
              <p className="mt-2 text-base font-semibold text-[#111827] sm:text-lg">
                You don't have permission to access this document.
              </p>

              {/* Reason Pill */}
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50/90 px-4 py-1.5 text-xs font-bold text-[#DC2626]">
                <ShieldAlert size={14} />
                <span>Reason: Restricted Document</span>
              </div>

              {/* Additional Information */}
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#64748B]">
                This document is protected by access control policies and can only be viewed by authorized personnel.
              </p>
            </div>

            {/* ACCESS DETAILS SECTION */}
            <div className="mt-8 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center gap-2">
                  <FileKey size={18} className="text-[#2563EB]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#111827]">
                    Access Details
                  </h2>
                </div>
                <span className="font-mono text-[11px] text-[#64748B]">
                  ENFORCEMENT ENGINE · POLICY V4.2
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Requested Resource */}
                <div className="rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] p-3.5 shadow-2xs">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    Requested Resource
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="grid size-7 place-items-center rounded bg-red-50 text-[#DC2626]">
                        <FileText size={16} />
                      </div>
                      <span className="font-mono text-sm font-bold text-[#111827]">
                        Evidence.pdf
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('Evidence.pdf', 'Resource Name')}
                      className="rounded p-1 text-[#64748B] hover:bg-slate-100 hover:text-[#111827]"
                      title="Copy resource name"
                    >
                      {copiedField === 'Resource Name' ? <Check size={14} className="text-[#16A34A]" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Document Classification */}
                <div className="rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] p-3.5 shadow-2xs">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    Document Classification
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-[#F59E0B]">
                      <span className="size-2 rounded-full bg-[#F59E0B]" />
                      Restricted
                    </span>
                    <span className="text-[11px] font-medium text-[#64748B]">
                      (Classified Material)
                    </span>
                  </div>
                </div>

                {/* Requested By */}
                <div className="rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] p-3.5 shadow-2xs">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    Requested By
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="grid size-7 place-items-center rounded-full bg-[#0B1220] font-mono text-[11px] font-bold text-white">
                      OA
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#111827]">Officer A</span>
                      <span className="ml-2 font-mono text-[11px] text-[#64748B]">ID: SEC-8041</span>
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] p-3.5 shadow-2xs">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    Date & Time
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 font-mono text-xs font-semibold text-[#111827]">
                    <Clock size={14} className="text-[#64748B]" />
                    <span>{timestamp || 'Fetching current timestamp...'}</span>
                  </div>
                </div>

                {/* Access Level Required vs Your Access Level */}
                <div className="rounded-lg border border-red-200 bg-red-50/40 p-3.5 shadow-2xs sm:col-span-2">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                        Access Level Required
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <KeyRound size={16} className="text-[#DC2626]" />
                        <span className="font-mono text-sm font-bold text-[#DC2626]">
                          Level 4 Clearance
                        </span>
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#DC2626]">
                          Secret / Special Access
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                        Your Access Level
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <UserCheck size={16} className="text-[#3B82F6]" />
                        <span className="font-mono text-sm font-bold text-[#2563EB]">
                          Level 2 Clearance
                        </span>
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#2563EB]">
                          Operational
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-red-200/80 pt-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Enforcement Verdict
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400 bg-[#DC2626] px-3.5 py-1 font-mono text-xs font-black tracking-wide text-white shadow-sm">
                      <AlertTriangle size={13} strokeWidth={2.5} />
                      ACCESS BLOCKED
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Primary Button */}
              <button
                type="button"
                data-testid="button-go-dashboard"
                onClick={() => setLocation('/dashboard')}
                className="order-1 sm:order-none inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#1D4ED8] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 active:scale-[0.98]"
              >
                <ArrowLeft size={17} strokeWidth={2.2} />
                <span>Go to Dashboard</span>
              </button>

              {/* Secondary Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  data-testid="button-request-access"
                  onClick={() => setRequestModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2.5 text-xs font-bold text-[#111827] shadow-2xs transition-all hover:border-[#2563EB] hover:bg-blue-50/50 hover:text-[#2563EB] active:scale-[0.98]"
                >
                  <Send size={14} className="text-[#2563EB]" />
                  <span>Request Access</span>
                </button>

                <button
                  type="button"
                  data-testid="button-contact-admin"
                  onClick={() => setContactModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2.5 text-xs font-bold text-[#111827] shadow-2xs transition-all hover:border-[#2563EB] hover:bg-blue-50/50 hover:text-[#2563EB] active:scale-[0.98]"
                >
                  <Phone size={14} className="text-[#2563EB]" />
                  <span>Contact Administrator</span>
                </button>

                <button
                  type="button"
                  data-testid="button-view-permissions"
                  onClick={() => setPermissionsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2.5 text-xs font-bold text-[#111827] shadow-2xs transition-all hover:border-[#2563EB] hover:bg-blue-50/50 hover:text-[#2563EB] active:scale-[0.98]"
                >
                  <ShieldCheck size={14} className="text-[#2563EB]" />
                  <span>View My Permissions</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECURITY NOTICE CARD */}
          <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/60 to-orange-50/40 p-6 shadow-2xs">
            <div className="flex items-start gap-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-[#F59E0B]">
                <ShieldAlert size={22} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#111827]">
                    Security Policy Enforcement
                  </h3>
                  <span className="rounded bg-amber-200/60 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-900">
                    SEC-POL-403.9
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[#64748B]">
                  Access to sensitive documents is monitored and restricted according to organizational security policies. Unauthorized access attempts are logged for audit and compliance purposes.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#64748B]">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-[#16A34A]" />
                    ISO/IEC 27001 Certified
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-[#16A34A]" />
                    CJIS Criminal Justice Compliance
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-[#16A34A]" />
                    Immutable Hash-Chained Audit Trail
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audit Information Panel + Help Section (4 cols on large screens) */}
        <div className="space-y-6 lg:col-span-4">
          
          {/* AUDIT INFORMATION PANEL */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
              <div className="flex items-center gap-2">
                <Fingerprint size={18} className="text-[#2563EB]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#111827]">
                  Audit Information
                </h3>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#16A34A]">
                ACTIVE LOG
              </span>
            </div>

            {/* Audit Status Items */}
            <div className="mt-5 space-y-3.5">
              {/* Access Attempt Logged */}
              <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                <div className="text-xs font-semibold text-[#111827]">
                  Access Attempt Logged
                </div>
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#16A34A]">
                  <CheckCircle2 size={15} />
                  <span>✓ Yes</span>
                </div>
              </div>

              {/* Audit Record Created */}
              <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                <div className="text-xs font-semibold text-[#111827]">
                  Audit Record Created
                </div>
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#16A34A]">
                  <CheckCircle2 size={15} />
                  <span>✓ Yes</span>
                </div>
              </div>

              {/* Notification Sent */}
              <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                <div className="text-xs font-semibold text-[#111827]">
                  Notification Sent
                </div>
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#16A34A]">
                  <CheckCircle2 size={15} />
                  <span>✓ Yes</span>
                </div>
              </div>

              {/* Risk Level */}
              <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                <div className="text-xs font-semibold text-[#111827]">
                  Risk Level
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-0.5 font-mono text-xs font-bold text-[#16A34A]">
                  <span className="size-2 rounded-full bg-[#16A34A]" />
                  <span>Low</span>
                </div>
              </div>
            </div>

            {/* Cryptographic Proof Section */}
            <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-[#0B1220] p-4 text-white">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#3B82F6]">
                <span>BLOCKCHAIN PROOF</span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">SHA-256</span>
              </div>
              <div className="mt-2 font-mono text-[10px] break-all text-slate-300">
                0x7f8a91c2...e4b98d21c3fa
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-2 text-[10px] text-slate-400">
                <span>Node: BLR-SEC-01</span>
                <span className="text-[#16A34A] font-bold">Ledger Verified</span>
              </div>
            </div>
          </div>

          {/* HELP SECTION */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3.5">
              <HelpCircle size={18} className="text-[#2563EB]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#111827]">
                Help & Assistance
              </h3>
            </div>

            <div className="mt-4">
              <h4 className="text-base font-bold text-[#111827]">Need Access?</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-[#64748B]">
                If you believe you should have access to this document, submit an access request or contact your system administrator.
              </p>
            </div>

            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={() => setRequestModalOpen(true)}
                className="flex w-full items-center justify-between rounded-xl border border-[#E2E8F0] p-3 text-left transition-colors hover:border-[#2563EB] hover:bg-blue-50/50 group"
              >
                <div className="flex items-center gap-2.5">
                  <Send size={15} className="text-[#2563EB]" />
                  <div>
                    <div className="text-xs font-bold text-[#111827] group-hover:text-[#2563EB]">
                      Submit Access Request
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      Request clearance upgrade for Evidence.pdf
                    </div>
                  </div>
                </div>
                <ChevronRight size={15} className="text-[#64748B] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => setContactModalOpen(true)}
                className="flex w-full items-center justify-between rounded-xl border border-[#E2E8F0] p-3 text-left transition-colors hover:border-[#2563EB] hover:bg-blue-50/50 group"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 size={15} className="text-[#2563EB]" />
                  <div>
                    <div className="text-xs font-bold text-[#111827] group-hover:text-[#2563EB]">
                      System Administrator
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      SOC Desk · Emergency Hotline
                    </div>
                  </div>
                </div>
                <ChevronRight size={15} className="text-[#64748B] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE MODAL 1: REQUEST ACCESS
         ========================================================================= */}
      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <div className="flex items-center gap-2 text-[#2563EB]">
              <Send size={20} />
              <DialogTitle className="text-lg font-bold text-[#111827]">
                Request Document Access
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-[#64748B]">
              Submit a formal clearance exception request for <strong className="text-[#111827]">Evidence.pdf</strong> (Level 4 Clearance required).
            </DialogDescription>
          </DialogHeader>

          {requestSubmitted ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-emerald-100 text-[#16A34A]">
                <Check size={24} />
              </div>
              <h4 className="text-base font-bold text-[#111827]">Request Dispatched</h4>
              <p className="mt-1 text-xs text-[#64748B]">
                Your supervisor and the Security Operations Center have received this request.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRequestSubmit} className="space-y-4 py-2">
              <div>
                <label className="block text-xs font-bold text-[#111827]">
                  Justification / Purpose
                </label>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  rows={3}
                  required
                  placeholder="State the investigative or legal justification for accessing this file..."
                  className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] p-2.5 text-xs text-[#111827] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111827]">
                    Access Duration
                  </label>
                  <select
                    value={requestedDuration}
                    onChange={(e) => setRequestedDuration(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] p-2 text-xs text-[#111827] outline-none focus:border-[#2563EB]"
                  >
                    <option value="4 hours">4 Hours (Temporary View)</option>
                    <option value="24 hours">24 Hours (Standard)</option>
                    <option value="7 days">7 Days (Case Assignment)</option>
                    <option value="Permanent">Permanent Clearance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111827]">
                    Urgency
                  </label>
                  <select
                    value={urgencyLevel}
                    onChange={(e) => setUrgencyLevel(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] p-2 text-xs text-[#111827] outline-none focus:border-[#2563EB]"
                  >
                    <option value="Low">Low - Routine</option>
                    <option value="Medium">Medium - Active Case</option>
                    <option value="High">High - Impending Filing</option>
                    <option value="Critical">Critical - Court Order</option>
                  </select>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 text-[11px] text-[#64748B]">
                <strong className="text-[#111827]">Note:</strong> Requests are logged in the cryptographic chain of custody. Falsified justifications will trigger an audit alert.
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-xs font-bold text-[#64748B] hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-5 py-2 text-xs font-bold text-white hover:bg-[#1D4ED8]"
                >
                  {submittingRequest ? 'Submitting...' : 'Submit Request'}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          INTERACTIVE MODAL 2: CONTACT ADMINISTRATOR
         ========================================================================= */}
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <div className="flex items-center gap-2 text-[#2563EB]">
              <Phone size={20} />
              <DialogTitle className="text-lg font-bold text-[#111827]">
                Security Administrator Contacts
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-[#64748B]">
              Reach the designated security administrators for access disputes and emergency authorization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-[#111827]">Security Operations Center (SOC)</div>
                  <div className="text-[11px] text-[#64748B]">24/7 Security Escalation Desk</div>
                </div>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-[#16A34A]">
                  ONLINE
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[#E2E8F0] pt-2 text-xs">
                <span className="font-mono text-[#111827]">+91 (80) 4920-8800</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('+918049208800', 'SOC Hotline')}
                  className="flex items-center gap-1 font-bold text-[#2563EB] hover:underline"
                >
                  <Copy size={12} />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-[#111827]">Evidence Integrity Officer</div>
                  <div className="text-[11px] text-[#64748B]">Officer-in-Charge: Rajesh Kumar</div>
                </div>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
                  CLEARANCE L5
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[#E2E8F0] pt-2 text-xs">
                <span className="font-mono text-[#111827]">soc-evidence@ksp.gov.in</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('soc-evidence@ksp.gov.in', 'Admin Email')}
                  className="flex items-center gap-1 font-bold text-[#2563EB] hover:underline"
                >
                  <Copy size={12} />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-[11px] text-amber-900">
              <strong className="block font-bold">Reference Incident Token:</strong>
              <div className="mt-1 flex items-center justify-between font-mono font-bold">
                <span>INC-403-9824-EVIDENCE</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('INC-403-9824-EVIDENCE', 'Incident Token')}
                  className="text-[#2563EB] hover:underline"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setContactModalOpen(false)}
              className="w-full rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-bold text-white hover:bg-[#1D4ED8]"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          INTERACTIVE MODAL 3: VIEW MY PERMISSIONS
         ========================================================================= */}
      <Dialog open={permissionsModalOpen} onOpenChange={setPermissionsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <div className="flex items-center gap-2 text-[#2563EB]">
              <ShieldCheck size={20} />
              <DialogTitle className="text-lg font-bold text-[#111827]">
                Officer A — Security Clearance & Permissions
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-[#64748B]">
              Current authorization scopes assigned to Officer A under Active Security Policy.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Clearance Summary Box */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase text-[#64748B]">Active Clearance</div>
                  <div className="text-base font-black text-[#2563EB]">Level 2 Clearance (Operational)</div>
                </div>
                <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#16A34A]">
                  Active & Verified
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-[#E2E8F0] pt-3">
                <div>
                  <span className="text-[#64748B]">Assigned Unit:</span>{' '}
                  <span className="font-semibold text-[#111827]">Cyber Crime Cell</span>
                </div>
                <div>
                  <span className="text-[#64748B]">Jurisdiction:</span>{' '}
                  <span className="font-semibold text-[#111827]">Bengaluru City</span>
                </div>
              </div>
            </div>

            {/* Permissions Matrix */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                Clearance Matrix Breakdown
              </div>
              <div className="mt-2 space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-2.5 bg-emerald-50/40">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#16A34A]" />
                    <span className="font-semibold text-[#111827]">Level 1: Public & General Case Records</span>
                  </div>
                  <span className="font-bold text-[#16A34A]">GRANTED</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-2.5 bg-emerald-50/40">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#16A34A]" />
                    <span className="font-semibold text-[#111827]">Level 2: Standard Investigative Files & FIRs</span>
                  </div>
                  <span className="font-bold text-[#16A34A]">GRANTED</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-2.5 bg-red-50/50">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-[#DC2626]" />
                    <span className="font-semibold text-[#111827]">Level 3: Confidential Witness Statements</span>
                  </div>
                  <span className="font-bold text-[#DC2626]">RESTRICTED</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-2.5 bg-red-50/50">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-[#DC2626]" />
                    <span className="font-semibold text-[#111827]">Level 4: Sealed Forensic Evidence (Evidence.pdf)</span>
                  </div>
                  <span className="font-bold text-[#DC2626]">BLOCKED</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setPermissionsModalOpen(false);
                setRequestModalOpen(true);
              }}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-bold text-white hover:bg-[#1D4ED8]"
            >
              Request Level 4 Elevation
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
