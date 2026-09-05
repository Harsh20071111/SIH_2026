import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Hash,
  Lock,
  Flag,
  Check,
  Send,
  Save,
  FileDown,
  Share2,
  FileCheck2,
  History,
  Shield,
  Fingerprint,
  FileBadge,
  Eye,
  Layers,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface DocumentReviewProps {
  id?: string;
}

type ActionStatus = 'idle' | 'approved' | 'flagged' | 'rejected';

export default function DocumentReview({ id = 'C-1024' }: DocumentReviewProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Document state
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 4;
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Review interaction state
  const [actionStatus, setActionStatus] = useState<ActionStatus>('approved'); // Default to approved so approval workflow is visible by default or selectable
  const [reviewComments, setReviewComments] = useState<string>(
    'Document hash verified against immutable ledger. Chain of custody is intact and forensic stamps match Bangalore Forensic Lab serial #BFL-902-E.'
  );

  // Quick Action Dialogs
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Dynamic review history items
  const [reviewHistory, setReviewHistory] = useState([
    {
      reviewer: 'Reviewer A',
      action: 'Reviewed',
      timestamp: '01 Sept 2026 09:15 AM',
      comments: 'Preliminary integrity scan passed. Escalated to Senior Legal Reviewer.',
      badgeColor: 'bg-blue-50 text-[#2563EB] border-blue-200',
    },
    {
      reviewer: 'Reviewer B',
      action: 'Approved',
      timestamp: '01 Sept 2026 11:32 AM',
      comments: 'Digital signature verified. Chain of custody confirmed for evidentiary submission.',
      badgeColor: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
    },
  ]);

  const handleAction = (status: ActionStatus) => {
    setActionStatus(status);
    const now = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (status === 'approved') {
      toast({
        title: 'Document Approved',
        description: 'Evidence.pdf has been cryptographically signed and approved.',
      });
      setReviewHistory((prev) => [
        {
          reviewer: 'Reviewer B (You)',
          action: 'Approved',
          timestamp: now,
          comments: reviewComments || 'Approved with digital signature.',
          badgeColor: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
        },
        ...prev,
      ]);
    } else if (status === 'flagged') {
      toast({
        title: 'Document Flagged for Review',
        description: 'Notice dispatched to Senior Examiner and Case Officer.',
      });
      setReviewHistory((prev) => [
        {
          reviewer: 'Reviewer B (You)',
          action: 'Flagged',
          timestamp: now,
          comments: reviewComments || 'Flagged for procedural re-examination.',
          badgeColor: 'bg-amber-50 text-[#F59E0B] border-amber-200',
        },
        ...prev,
      ]);
    } else if (status === 'rejected') {
      toast({
        title: 'Document Rejected',
        description: 'Access restriction enforced. Audit event emitted.',
        variant: 'destructive',
      });
      setReviewHistory((prev) => [
        {
          reviewer: 'Reviewer B (You)',
          action: 'Rejected',
          timestamp: now,
          comments: reviewComments || 'Rejected due to validation discrepancy.',
          badgeColor: 'bg-red-50 text-[#DC2626] border-red-200',
        },
        ...prev,
      ]);
    }
  };

  const handleSaveDraft = () => {
    toast({
      title: 'Draft Saved',
      description: 'Review observations stored securely.',
    });
  };

  const handleExportReview = () => {
    toast({
      title: 'Export Generated',
      description: 'Downloading cryptographically signed review brief (JSON/PDF).',
    });
  };

  const handleShareCopy = () => {
    navigator.clipboard.writeText(`https://securedocs.gov.in/reviews/${id}?token=SEC-AUD-403`);
    setCopiedLink(true);
    toast({
      title: 'Secure Link Copied',
      description: 'Link with 2-hour encrypted token copied to clipboard.',
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#2563EB]">
              <FileCheck2 size={13} />
              CASE {id} · ACTIVE REVIEW
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-[#0B1220] px-2 py-0.5 font-mono text-[11px] font-bold text-white">
              CLEARANCE LEVEL 3+
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-[#111827] sm:text-3xl">
            DOCUMENT REVIEW
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Review, verify, approve, flag, or reject secure documents with full audit traceability.
          </p>
        </div>

        {/* Status Indicator Pill */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2 shadow-2xs">
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">Current Status</div>
              <div className="text-xs font-bold text-[#111827]">
                {actionStatus === 'approved' && <span className="text-[#16A34A]">Approved & Signed</span>}
                {actionStatus === 'flagged' && <span className="text-[#F59E0B]">Flagged for Escalation</span>}
                {actionStatus === 'rejected' && <span className="text-[#DC2626]">Rejected / Void</span>}
                {actionStatus === 'idle' && <span className="text-[#2563EB]">Pending Review</span>}
              </div>
            </div>
            <div
              className={`grid size-9 place-items-center rounded-lg ${
                actionStatus === 'approved'
                  ? 'bg-emerald-100 text-[#16A34A]'
                  : actionStatus === 'flagged'
                  ? 'bg-amber-100 text-[#F59E0B]'
                  : actionStatus === 'rejected'
                  ? 'bg-red-100 text-[#DC2626]'
                  : 'bg-blue-100 text-[#2563EB]'
              }`}
            >
              {actionStatus === 'approved' && <CheckCircle2 size={18} />}
              {actionStatus === 'flagged' && <Flag size={18} />}
              {actionStatus === 'rejected' && <XCircle size={18} />}
              {actionStatus === 'idle' && <Clock size={18} />}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLocation('/documents')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] px-3.5 py-2 text-xs font-bold text-[#111827] shadow-2xs hover:bg-slate-50"
          >
            <ChevronLeft size={16} />
            <span>Repository</span>
          </button>
        </div>
      </div>

      {/* SECTION 1 – REVIEW WORKSPACE (SPLIT SCREEN LAYOUT) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT PANEL – Document Preview (7 cols on desktop) */}
        <div className="lg:col-span-7">
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm">
            {/* Document Preview Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#2563EB]" />
                <span className="font-mono text-xs font-bold text-[#111827]">Evidence.pdf Preview</span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-[#16A34A]">
                  PAGE {currentPage} OF {totalPages}
                </span>
              </div>

              {/* Controls: Zoom, Navigation, Download, Full Screen */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-white p-0.5">
                  <button
                    type="button"
                    title="Zoom Out"
                    onClick={() => setZoomLevel((z) => Math.max(z - 10, 70))}
                    className="rounded p-1.5 text-[#64748B] hover:bg-slate-100 hover:text-[#111827]"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span className="px-2 font-mono text-[11px] font-semibold text-[#111827]">
                    {zoomLevel}%
                  </span>
                  <button
                    type="button"
                    title="Zoom In"
                    onClick={() => setZoomLevel((z) => Math.min(z + 10, 150))}
                    className="rounded p-1.5 text-[#64748B] hover:bg-slate-100 hover:text-[#111827]"
                  >
                    <ZoomIn size={14} />
                  </button>
                  <button
                    type="button"
                    title="Reset Zoom"
                    onClick={() => setZoomLevel(100)}
                    className="rounded p-1.5 text-[#64748B] hover:bg-slate-100 hover:text-[#111827]"
                  >
                    <RotateCcw size={12} />
                  </button>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-white p-0.5">
                  <button
                    type="button"
                    title="Previous Page"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="rounded p-1.5 text-[#64748B] hover:bg-slate-100 hover:text-[#111827] disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    title="Next Page"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="rounded p-1.5 text-[#64748B] hover:bg-slate-100 hover:text-[#111827] disabled:opacity-40"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Download Preview */}
                <button
                  type="button"
                  title="Download Preview"
                  onClick={handleExportReview}
                  className="rounded-lg border border-[#E2E8F0] bg-white p-2 text-[#64748B] hover:bg-slate-100 hover:text-[#111827]"
                >
                  <Download size={14} />
                </button>

                {/* Full Screen View */}
                <button
                  type="button"
                  title="Full Screen View"
                  onClick={() => setIsFullScreen(true)}
                  className="rounded-lg border border-[#E2E8F0] bg-white p-2 text-[#64748B] hover:bg-slate-100 hover:text-[#111827]"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>

            {/* PDF Preview Canvas Area */}
            <div className="relative flex-1 overflow-auto bg-slate-200/70 p-4 sm:p-6" style={{ minHeight: '520px' }}>
              <div
                className="mx-auto rounded-lg bg-white p-8 shadow-md transition-transform duration-200 origin-top"
                style={{
                  width: `${(zoomLevel / 100) * 580}px`,
                  minHeight: '680px',
                }}
              >
                {/* Watermark */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06] select-none">
                  <span className="rotate-[-35deg] text-6xl font-black text-red-900 tracking-widest">
                    CONFIDENTIAL EVIDENCE
                  </span>
                </div>

                {/* Document Header */}
                <div className="border-b-2 border-slate-900 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#2563EB]">
                        Karnataka State Police · Forensic Sciences Division
                      </div>
                      <div className="mt-1 text-lg font-black tracking-tight text-slate-900">
                        FORENSIC EVIDENCE & INTEGRITY REPORT
                      </div>
                    </div>
                    <div className="text-right font-mono text-[10px] text-[#64748B]">
                      <div>CASE: C-1024</div>
                      <div>EXHIBIT: EX-884</div>
                    </div>
                  </div>
                </div>

                {/* Document Metadata Bar */}
                <div className="mt-4 grid grid-cols-3 gap-2 rounded bg-slate-50 p-2.5 font-mono text-[10px] text-slate-700">
                  <div>
                    <span className="font-bold text-slate-900">Chain ID:</span> CH-9021
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Custodian:</span> Officer A
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Version:</span> v3.0 (Final)
                  </div>
                </div>

                {/* Simulated Content based on currentPage */}
                <div className="mt-6 space-y-4 text-xs leading-relaxed text-slate-800">
                  {currentPage === 1 && (
                    <>
                      <h4 className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                        1. Chain of Custody & Receipt Verification
                      </h4>
                      <p>
                        The sealed physical artifact containing digital drive serial #WD-99401 was retrieved from Locker Bay 4 by Investigating Officer A on 01 Sept 2026. A secondary forensic image was extracted using hardware write-blocker Tableau T8u.
                      </p>
                      <div className="rounded border border-slate-200 bg-slate-50/50 p-3">
                        <div className="font-mono text-[10px] font-bold text-slate-900 mb-1">
                          Cryptographic Hashes Recorded at Ingestion:
                        </div>
                        <div className="font-mono text-[10px] break-all text-[#2563EB]">
                          SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                        </div>
                        <div className="font-mono text-[10px] break-all text-slate-600 mt-1">
                          MD5: 9e107d9d372bb6826bd81d3542a419d6
                        </div>
                      </div>
                      <p>
                        Both initial and computed image hashes demonstrate zero deviation. Evidence integrity coefficient stands at 1.00 (Tamper-Free).
                      </p>
                    </>
                  )}

                  {currentPage === 2 && (
                    <>
                      <h4 className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                        2. Detailed Artifact Registry & Timeline
                      </h4>
                      <p>
                        Log analysis from recovered partition yields 1,248 timestamped events corresponding to the suspect timeline between 28 Aug 2026 and 31 Aug 2026.
                      </p>
                      <div className="space-y-1.5 font-mono text-[10px]">
                        <div className="flex justify-between border-b border-slate-100 py-1">
                          <span>EVT-01: File Allocation Table read</span>
                          <span className="text-[#16A34A] font-bold">VERIFIED</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 py-1">
                          <span>EVT-02: User login signature parsed</span>
                          <span className="text-[#16A34A] font-bold">VERIFIED</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 py-1">
                          <span>EVT-03: Access token cryptographic verify</span>
                          <span className="text-[#16A34A] font-bold">VERIFIED</span>
                        </div>
                      </div>
                    </>
                  )}

                  {currentPage === 3 && (
                    <>
                      <h4 className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                        3. Cryptographic Signature Certification
                      </h4>
                      <p>
                        Digital signature attached to Exhibit EX-884 was verified utilizing the public key certificate issued by the National Public Key Infrastructure Authority.
                      </p>
                      <div className="rounded border border-emerald-200 bg-emerald-50/60 p-3 text-[11px] text-emerald-900">
                        <strong>Public Key Certificate Status:</strong> VALID (Expires: Dec 2028)
                        <div className="mt-1 font-mono text-[10px]">
                          Subject: CN=Officer A, OU=CID Cyber Unit, O=Gov of Karnataka, C=IN
                        </div>
                      </div>
                    </>
                  )}

                  {currentPage === 4 && (
                    <>
                      <h4 className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                        4. Final Conclusion & Approval Docket
                      </h4>
                      <p>
                        The examining team confirms that Evidence.pdf represents a true and uncorrupted record of the digital evidence collected in connection with Case C-1024.
                      </p>
                      <div className="mt-8 flex items-end justify-between border-t border-slate-300 pt-4">
                        <div>
                          <div className="font-mono text-[10px] text-slate-500">Submitted by:</div>
                          <div className="font-bold text-slate-900">Officer A</div>
                          <div className="font-mono text-[9px] text-slate-400">ID: SEC-8041</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-[10px] text-slate-500">Reviewed & Approved by:</div>
                          <div className="font-bold text-[#16A34A]">Reviewer B (Digital Cert)</div>
                          <div className="font-mono text-[9px] text-slate-400">01 Sept 2026 · 11:32 AM</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer Stamp */}
                <div className="mt-10 border-t border-slate-200 pt-3 flex items-center justify-between font-mono text-[9px] text-slate-400">
                  <span>SECUREDOCS CRYPTOGRAPHIC ENGINE v2.4</span>
                  <span>PAGE {currentPage} / {totalPages}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL – Document Information, Comments, and Review Actions (5 cols on desktop) */}
        <div className="space-y-6 lg:col-span-5">
          
          {/* SECTION 1 (Right): DOCUMENT INFORMATION */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
              <div className="flex items-center gap-2">
                <FileBadge size={18} className="text-[#2563EB]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#111827]">
                  DOCUMENT INFORMATION
                </h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#16A34A]">
                VALIDATED
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3.5 text-xs">
              {/* Case ID */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <div className="text-[10px] font-semibold uppercase text-[#64748B]">Case ID</div>
                <div className="mt-1 font-mono text-sm font-bold text-[#111827]">C-1024</div>
              </div>

              {/* Document Name */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <div className="text-[10px] font-semibold uppercase text-[#64748B]">Document Name</div>
                <div className="mt-1 font-mono text-sm font-bold text-[#2563EB] truncate" title="Evidence.pdf">
                  Evidence.pdf
                </div>
              </div>

              {/* Document Hash */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <div className="text-[10px] font-semibold uppercase text-[#64748B]">Document Hash</div>
                <div className="mt-1 flex items-center gap-1 font-mono text-xs font-bold text-[#16A34A]">
                  <CheckCircle2 size={13} />
                  <span>✓ VERIFIED</span>
                </div>
              </div>

              {/* Version */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <div className="text-[10px] font-semibold uppercase text-[#64748B]">Version</div>
                <div className="mt-1 font-mono text-xs font-bold text-[#111827]">v3</div>
              </div>

              {/* Uploaded By */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <div className="text-[10px] font-semibold uppercase text-[#64748B]">Uploaded By</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[#111827]">
                  <User size={13} className="text-[#64748B]" />
                  <span>Officer A</span>
                </div>
              </div>

              {/* Upload Date */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <div className="text-[10px] font-semibold uppercase text-[#64748B]">Upload Date</div>
                <div className="mt-1 font-mono text-xs font-bold text-[#111827]">01 Sept 2026</div>
              </div>

              {/* Document Classification */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <div className="text-[10px] font-semibold uppercase text-[#64748B]">Classification</div>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 font-mono text-[11px] font-bold text-[#F59E0B] border border-amber-200">
                    Confidential
                  </span>
                </div>
              </div>

              {/* Security Status */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <div className="text-[10px] font-semibold uppercase text-[#64748B]">Security Status</div>
                <div className="mt-1 flex items-center gap-1 font-mono text-xs font-bold text-[#16A34A]">
                  <ShieldCheck size={14} />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 – REVIEW COMMENTS */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#111827]">
                Reviewer Comments
              </h3>
              <span className="text-[11px] text-[#64748B]">Audit Logged</span>
            </div>

            <div className="mt-4">
              <textarea
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                rows={3}
                placeholder="Add observations, findings, recommendations, or approval notes."
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs text-[#111827] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/10"
              />
            </div>

            {/* Quick comment suggestion chips */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {[
                'Hash verified against ledger',
                'Approved for court filing',
                'Chain of custody intact',
                'Requires supervisor co-sign',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setReviewComments((prev) => (prev ? `${prev} ${chip}.` : `${chip}.`))}
                  className="rounded-md border border-[#E2E8F0] bg-white px-2 py-0.5 text-[10px] font-medium text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 3 – REVIEW ACTIONS (Large Action Buttons) */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#111827]">
                Review Actions
              </h3>
              <p className="mt-1 text-xs text-[#64748B]">
                Execute formal decision with digital signature enforcement.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* APPROVE (Green) */}
              <button
                type="button"
                data-testid="button-approve-doc"
                onClick={() => handleAction('approved')}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3.5 text-center transition-all shadow-sm active:scale-[0.98] ${
                  actionStatus === 'approved'
                    ? 'border-[#16A34A] bg-[#16A34A] text-white ring-4 ring-emerald-500/20'
                    : 'border-[#16A34A]/30 bg-emerald-50/50 text-[#16A34A] hover:bg-[#16A34A] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 text-sm font-black tracking-wide">
                  <span className="size-2.5 rounded-full bg-current animate-pulse" />
                  APPROVE
                </div>
                <span className="text-[10px] opacity-90">Digital Sign & Verify</span>
              </button>

              {/* FLAG FOR REVIEW (Amber) */}
              <button
                type="button"
                data-testid="button-flag-doc"
                onClick={() => handleAction('flagged')}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3.5 text-center transition-all shadow-sm active:scale-[0.98] ${
                  actionStatus === 'flagged'
                    ? 'border-[#F59E0B] bg-[#F59E0B] text-white ring-4 ring-amber-500/20'
                    : 'border-[#F59E0B]/30 bg-amber-50/50 text-[#F59E0B] hover:bg-[#F59E0B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 text-sm font-black tracking-wide">
                  <span className="size-2.5 rounded-full bg-current" />
                  FLAG FOR REVIEW
                </div>
                <span className="text-[10px] opacity-90">Request Clarification</span>
              </button>

              {/* REJECT (Red) */}
              <button
                type="button"
                data-testid="button-reject-doc"
                onClick={() => handleAction('rejected')}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3.5 text-center transition-all shadow-sm active:scale-[0.98] ${
                  actionStatus === 'rejected'
                    ? 'border-[#DC2626] bg-[#DC2626] text-white ring-4 ring-red-500/20'
                    : 'border-[#DC2626]/30 bg-red-50/50 text-[#DC2626] hover:bg-[#DC2626] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 text-sm font-black tracking-wide">
                  <span className="size-2.5 rounded-full bg-current" />
                  REJECT
                </div>
                <span className="text-[10px] opacity-90">Lock & Enforce Void</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4 – APPROVAL WORKFLOW */}
      {actionStatus === 'approved' && (
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/50 via-white to-emerald-50/40 p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="grid size-7 place-items-center rounded-lg bg-[#16A34A] text-white">
                <CheckCircle2 size={16} />
              </div>
              <h3 className="text-base font-bold text-[#111827]">
                APPROVAL WORKFLOW TIMELINE
              </h3>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-0.5 font-mono text-xs font-bold text-[#16A34A]">
              ENFORCEMENT STEP 5 OF 5 COMPLETED
            </span>
          </div>

          {/* Connected timeline steps: Reviewer B -> Digital Approval -> Timestamp -> Document Hash -> Audit Log */}
          <div className="relative">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
              {/* Step 1: Reviewer B */}
              <div className="relative flex flex-col items-center rounded-xl border border-[#E2E8F0] bg-white p-4 text-center shadow-2xs">
                <div className="grid size-10 place-items-center rounded-full bg-blue-100 text-[#2563EB] font-bold">
                  <User size={18} />
                </div>
                <div className="mt-2 text-xs font-bold text-[#111827]">Reviewer B</div>
                <div className="text-[10px] text-[#64748B]">Senior Reviewer</div>
                <span className="mt-2 rounded bg-blue-50 px-2 py-0.5 font-mono text-[9px] font-bold text-[#2563EB]">
                  AUTHORIZED
                </span>
              </div>

              {/* Step 2: Digital Approval */}
              <div className="relative flex flex-col items-center rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-center shadow-2xs">
                <div className="grid size-10 place-items-center rounded-full bg-emerald-100 text-[#16A34A]">
                  <ShieldCheck size={20} />
                </div>
                <div className="mt-2 text-xs font-bold text-[#111827]">Digital Approval</div>
                <div className="text-[10px] text-[#64748B]">ECDSA Signed</div>
                <span className="mt-2 rounded bg-emerald-100 px-2 py-0.5 font-mono text-[9px] font-bold text-[#16A34A]">
                  VERIFIED
                </span>
              </div>

              {/* Step 3: Timestamp */}
              <div className="relative flex flex-col items-center rounded-xl border border-[#E2E8F0] bg-white p-4 text-center shadow-2xs">
                <div className="grid size-10 place-items-center rounded-full bg-slate-100 text-[#111827]">
                  <Clock size={18} />
                </div>
                <div className="mt-2 text-xs font-bold text-[#111827]">Timestamp</div>
                <div className="text-[10px] font-mono text-[#64748B]">01 Sept 2026 11:32 AM</div>
                <span className="mt-2 rounded bg-slate-100 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-700">
                  NTP SYNCED
                </span>
              </div>

              {/* Step 4: Document Hash */}
              <div className="relative flex flex-col items-center rounded-xl border border-[#E2E8F0] bg-white p-4 text-center shadow-2xs">
                <div className="grid size-10 place-items-center rounded-full bg-blue-100 text-[#2563EB]">
                  <Hash size={18} />
                </div>
                <div className="mt-2 text-xs font-bold text-[#111827]">Document Hash</div>
                <div className="text-[10px] font-mono text-[#64748B] truncate max-w-[120px]">
                  0xe3b0c442...
                </div>
                <span className="mt-2 rounded bg-blue-50 px-2 py-0.5 font-mono text-[9px] font-bold text-[#2563EB]">
                  MATCHED
                </span>
              </div>

              {/* Step 5: Audit Log */}
              <div className="relative flex flex-col items-center rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-center shadow-2xs">
                <div className="grid size-10 place-items-center rounded-full bg-[#16A34A] text-white">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <div className="mt-2 text-xs font-bold text-[#111827]">Audit Log</div>
                <div className="text-[10px] font-mono text-[#16A34A]">EVT-8824 Generated</div>
                <span className="mt-2 rounded bg-emerald-200/80 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-900">
                  IMMUTABLE
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5 & SECTION 6 (2 Column Row) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* SECTION 5 – DIGITAL APPROVAL DETAILS */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-sm lg:col-span-6">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
            <div className="flex items-center gap-2">
              <Fingerprint size={18} className="text-[#2563EB]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#111827]">
                DIGITAL APPROVAL DETAILS
              </h3>
            </div>
            <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-[#2563EB]">
              PKI-CERTIFIED
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <span className="text-xs font-medium text-[#64748B]">Reviewer:</span>
              <span className="text-xs font-bold text-[#111827]">Reviewer B</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <span className="text-xs font-medium text-[#64748B]">Approval Status:</span>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 font-mono text-xs font-bold text-[#16A34A] border border-emerald-200">
                <CheckCircle2 size={12} />
                Approved
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <span className="text-xs font-medium text-[#64748B]">Approval Timestamp:</span>
              <span className="font-mono text-xs font-bold text-[#111827]">01 Sept 2026 11:32 AM</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <span className="text-xs font-medium text-[#64748B]">Digital Signature:</span>
              <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#16A34A]">
                <ShieldCheck size={14} />
                Verified
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <span className="text-xs font-medium text-[#64748B]">Hash Verification:</span>
              <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#16A34A]">
                <CheckCircle2 size={14} />
                Passed
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <span className="text-xs font-medium text-[#64748B]">Audit Entry:</span>
              <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#2563EB]">
                <Layers size={14} />
                Created (#EVT-8824)
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 6 – SECURITY VERIFICATION (Status Cards) */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-sm lg:col-span-6">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-[#2563EB]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#111827]">
                SECURITY VERIFICATION
              </h3>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#16A34A]">
              ALL CRITERIA PASSED
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Card 1: Document Integrity */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
              <div className="text-[11px] font-semibold text-[#64748B]">Document Integrity</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-[#111827]">Integrity Check</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-bold text-[#16A34A]">
                  🟢 Verified
                </span>
              </div>
            </div>

            {/* Card 2: Hash Validation */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
              <div className="text-[11px] font-semibold text-[#64748B]">Hash Validation</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-[#111827]">SHA-256 Ledger</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-bold text-[#16A34A]">
                  🟢 Matched
                </span>
              </div>
            </div>

            {/* Card 3: Version Verification */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
              <div className="text-[11px] font-semibold text-[#64748B]">Version Verification</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-[#111827]">v3 Final Release</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-bold text-[#16A34A]">
                  🟢 Valid
                </span>
              </div>
            </div>

            {/* Card 4: Audit Tracking */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
              <div className="text-[11px] font-semibold text-[#64748B]">Audit Tracking</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-[#111827]">Event Logger</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-bold text-[#16A34A]">
                  🟢 Active
                </span>
              </div>
            </div>

            {/* Card 5: Access Control */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 sm:col-span-2">
              <div className="text-[11px] font-semibold text-[#64748B]">Access Control</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-[#111827]">Role Based ACL (Level 3+)</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#16A34A]">
                  🟢 Protected
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7 – REVIEW HISTORY TABLE */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
          <div className="flex items-center gap-2">
            <History size={18} className="text-[#2563EB]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#111827]">
              REVIEW HISTORY
            </h3>
          </div>
          <span className="text-[11px] text-[#64748B]">Showing all chronological events</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-bold uppercase text-[#64748B]">
                <th className="py-3 px-4">Reviewer</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {reviewHistory.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#111827]">
                    <div className="flex items-center gap-2">
                      <div className="grid size-6 place-items-center rounded-full bg-[#0B1220] font-mono text-[10px] text-white">
                        {item.reviewer.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{item.reviewer}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-mono text-[11px] font-bold border ${item.badgeColor}`}>
                      {item.action === 'Approved' && <CheckCircle2 size={12} />}
                      {item.action === 'Reviewed' && <Eye size={12} />}
                      {item.action === 'Flagged' && <Flag size={12} />}
                      {item.action === 'Rejected' && <XCircle size={12} />}
                      {item.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#64748B]">{item.timestamp}</td>
                  <td className="py-3.5 px-4 text-[#111827] max-w-md">{item.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 8 – AUDIT LOG PREVIEW */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-[#2563EB]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#111827]">
              AUDIT LOG PREVIEW
            </h3>
          </div>
          <Link
            href="/audit-logs"
            className="flex items-center gap-1 font-mono text-xs font-bold text-[#2563EB] hover:underline"
          >
            <span>View Full Audit Stream</span>
            <ExternalLink size={12} />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-5">
          {[
            { step: 'Review Opened', time: '11:28 AM', status: 'Captured', icon: Eye },
            { step: 'Comments Added', time: '11:30 AM', status: 'Logged', icon: FileText },
            { step: 'Approval Submitted', time: '11:32 AM', status: 'Signed', icon: Send },
            { step: 'Hash Verified', time: '11:32 AM', status: '0 Deviation', icon: Hash },
            { step: 'Audit Record Generated', time: '11:32 AM', status: 'Immutable', icon: ShieldCheck },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-center transition-all hover:border-[#2563EB] hover:bg-white"
              >
                <div className="grid size-8 place-items-center rounded-lg bg-blue-50 text-[#2563EB]">
                  <Icon size={16} />
                </div>
                <div className="mt-2 text-xs font-bold text-[#111827]">{item.step}</div>
                <div className="mt-1 font-mono text-[10px] text-[#64748B]">{item.time}</div>
                <span className="mt-2 rounded bg-emerald-50 px-2 py-0.5 font-mono text-[9px] font-bold text-[#16A34A] border border-emerald-200">
                  {item.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 9 – QUICK ACTIONS */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#111827]">
            QUICK ACTIONS
          </h3>
          <p className="mt-0.5 text-xs text-[#64748B]">
            Execute immediate administrative, export, and sharing commands.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Save Draft */}
          <button
            type="button"
            data-testid="button-save-draft"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-bold text-[#111827] shadow-2xs hover:border-[#2563EB] hover:bg-blue-50/40 hover:text-[#2563EB] active:scale-[0.98]"
          >
            <Save size={15} className="text-[#2563EB]" />
            <span>Save Draft</span>
          </button>

          {/* Export Review */}
          <button
            type="button"
            data-testid="button-export-review"
            onClick={handleExportReview}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-bold text-[#111827] shadow-2xs hover:border-[#2563EB] hover:bg-blue-50/40 hover:text-[#2563EB] active:scale-[0.98]"
          >
            <FileDown size={15} className="text-[#2563EB]" />
            <span>Export Review</span>
          </button>

          {/* View Audit Log */}
          <button
            type="button"
            data-testid="button-view-audit-log"
            onClick={() => setLocation('/audit-logs')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-bold text-[#111827] shadow-2xs hover:border-[#2563EB] hover:bg-blue-50/40 hover:text-[#2563EB] active:scale-[0.98]"
          >
            <History size={15} className="text-[#2563EB]" />
            <span>View Audit Log</span>
          </button>

          {/* Generate Review Report */}
          <button
            type="button"
            data-testid="button-generate-report"
            onClick={() => setReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-bold text-[#111827] shadow-2xs hover:border-[#2563EB] hover:bg-blue-50/40 hover:text-[#2563EB] active:scale-[0.98]"
          >
            <Sparkles size={15} className="text-[#2563EB]" />
            <span>Generate Review Report</span>
          </button>

          {/* Share Securely */}
          <button
            type="button"
            data-testid="button-share-securely"
            onClick={() => setShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#1D4ED8] active:scale-[0.98]"
          >
            <Share2 size={15} />
            <span>Share Securely</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: FULL SCREEN VIEW
         ========================================================================= */}
      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-4xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#111827] flex items-center justify-between">
              <span>Evidence.pdf — High Resolution Full Screen Preview</span>
              <span className="font-mono text-xs text-[#64748B]">Page {currentPage} of {totalPages}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-lg bg-slate-100 p-6 flex justify-center">
            <div className="w-full max-w-2xl bg-white p-8 rounded shadow-lg border border-slate-200">
              <div className="border-b-2 border-slate-900 pb-4">
                <div className="font-mono text-[10px] text-[#2563EB]">KARNATAKA STATE POLICE · EVIDENCE ARCHIVE</div>
                <div className="text-lg font-black text-slate-900">EXHIBIT EX-884 · DIGITAL EVIDENCE LEDGER</div>
              </div>
              <div className="mt-6 space-y-4 text-xs leading-relaxed text-slate-800">
                <p>
                  Full legal transcript and forensic verification log for Case C-1024. All block signatures are validated against the state evidentiary chain of custody.
                </p>
                <div className="rounded bg-slate-50 p-4 font-mono text-[11px] border border-slate-200">
                  <div>Evidence Item: Forensic Disk Image WD-99401</div>
                  <div>Ingested Date: 01 Sept 2026</div>
                  <div>Hash (SHA-256): e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</div>
                  <div>Status: VERIFIED & SEALED</div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsFullScreen(false)}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-bold text-white hover:bg-[#1D4ED8]"
            >
              Close Full Screen
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          MODAL 2: SHARE SECURELY
         ========================================================================= */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <div className="flex items-center gap-2 text-[#2563EB]">
              <Share2 size={20} />
              <DialogTitle className="text-lg font-bold text-[#111827]">
                Share Document Review Securely
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-[#64748B]">
              Generate a time-limited, encrypted access token for authorized external co-examiners.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-[#111827]">
                Generated One-Time Link (Expires in 2 Hours)
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`https://securedocs.gov.in/reviews/${id}?token=SEC-AUD-403`}
                  className="flex-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 font-mono text-[11px] text-[#111827] outline-none"
                />
                <button
                  type="button"
                  onClick={handleShareCopy}
                  className="rounded-lg bg-[#2563EB] px-3.5 py-2.5 text-xs font-bold text-white hover:bg-[#1D4ED8]"
                >
                  {copiedLink ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-slate-50 p-3.5 text-xs text-[#64748B] space-y-1">
              <div className="font-bold text-[#111827]">Security Enforcement Parameters:</div>
              <div>• Recipient must authenticate using Gov OTP</div>
              <div>• Download permissions restricted to watermarked copy</div>
              <div>• All clicks and views are logged to the immutable audit log</div>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setShareModalOpen(false)}
              className="w-full rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-bold text-white hover:bg-[#1D4ED8]"
            >
              Done
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          MODAL 3: GENERATE REVIEW REPORT
         ========================================================================= */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <div className="flex items-center gap-2 text-[#2563EB]">
              <Sparkles size={20} />
              <DialogTitle className="text-lg font-bold text-[#111827]">
                Generate Review Report
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-[#64748B]">
              Compile review decisions, digital signature certificates, and hash validations into a court-ready dossier.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-2">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-[#64748B]">Report Type:</span>
                <span className="text-[#111827]">Comprehensive Evidentiary Review</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span className="text-[#64748B]">Signee:</span>
                <span className="text-[#16A34A]">Reviewer B (Verified)</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span className="text-[#64748B]">Format:</span>
                <span className="text-[#111827]">PDF/A-3 Compliant</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setReportModalOpen(false);
                toast({
                  title: 'Report Compiled',
                  description: 'Evidentiary_Review_C-1024.pdf downloaded.',
                });
              }}
              className="w-full rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-bold text-white hover:bg-[#1D4ED8]"
            >
              Download Dossier
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
