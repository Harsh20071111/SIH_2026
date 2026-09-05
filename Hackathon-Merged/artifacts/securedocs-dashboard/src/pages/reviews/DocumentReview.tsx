import { useState, useCallback, useMemo } from 'react';
import { Link, useParams } from 'wouter';
import {
  ArrowLeft, FileText, ZoomIn, ZoomOut, Maximize, Download,
  Expand, ShieldCheck, CheckCircle2, Lock, Flag, X,
  ChevronLeft, ChevronRight, Clock, History,
} from 'lucide-react';
import { getReviewById } from '@/lib/reviews-data';
import type { Role } from '@/lib/mock-data';
import styles from './document-review.module.css';

type ReviewStatus = 'Pending' | 'Approved' | 'Flagged' | 'Rejected';

interface HistoryEntry {
  date: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

type ModalKind = 'approve' | 'flag' | 'reject' | null;

/* ----------------------------------------------------------------
   Toast component (self-dismissing coloured notification)
   ---------------------------------------------------------------- */
function Toast({ message, variant, onDone }: { message: string; variant: 'success' | 'warning' | 'danger'; onDone: () => void }) {
  // Auto-dismiss after 3 s
  useState(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); });

  const cls =
    variant === 'success' ? styles.toastSuccess :
    variant === 'warning' ? styles.toastWarning : styles.toastDanger;

  return (
    <div className={`${styles.toast} ${cls}`}>
      {variant === 'success' && <CheckCircle2 size={16} />}
      {variant === 'warning' && <Flag size={16} />}
      {variant === 'danger' && <X size={16} />}
      {message}
    </div>
  );
}

/* ----------------------------------------------------------------
   Confirmation Modal
   ---------------------------------------------------------------- */
function ConfirmModal({
  kind, docName, onCancel, onConfirm,
}: {
  kind: ModalKind;
  docName: string;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');

  if (!kind) return null;

  const titles: Record<string, string> = {
    approve: 'Approve Document?',
    flag: 'Flag Document',
    reject: 'Reject Document',
  };

  const messages: Record<string, string> = {
    approve: `Are you sure you want to approve ${docName}?`,
    flag: 'Please provide a reason for flagging this document.',
    reject: 'Please provide a reason for rejecting this document.',
  };

  const needsReason = kind !== 'approve';
  const canSubmit = !needsReason || reason.trim().length > 0;

  const confirmLabel: Record<string, string> = {
    approve: 'Confirm Approval',
    flag: 'Flag Document',
    reject: 'Reject Document',
  };

  const confirmClass =
    kind === 'approve' ? styles.btnConfirmApprove :
    kind === 'flag' ? styles.btnConfirmFlag : styles.btnConfirmReject;

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h3 className={styles.modalTitle}>{titles[kind]}</h3>
          <button className={styles.modalCloseBtn} onClick={onCancel}><X size={18} /></button>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.modalMessage}>{messages[kind]}</p>
          {needsReason && (
            <>
              <textarea
                className={styles.modalTextarea}
                placeholder="Enter your reason…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                autoFocus
              />
              {reason.trim().length === 0 && (
                <div className={styles.modalRequired}>A reason is required.</div>
              )}
            </>
          )}
        </div>
        <div className={styles.modalFoot}>
          <button className={styles.btnCancel} onClick={onCancel}>Cancel</button>
          <button
            className={`${styles.btnConfirm} ${confirmClass}`}
            disabled={!canSubmit}
            onClick={() => onConfirm(reason)}
          >
            {confirmLabel[kind]}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   PDF Viewer — realistic placeholder
   ---------------------------------------------------------------- */
function PdfViewer() {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const totalPages = 5;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 50));
  const handleFit = () => setZoom(100);

  return (
    <div className={styles.viewerContainer}>
      <div className={styles.viewerToolbar}>
        <span className={styles.viewerFilename}>
          <FileText size={14} /> Evidence.pdf
        </span>

        <div className={styles.viewerControls}>
          <button className={styles.viewerBtn} onClick={() => setPage((p) => Math.max(1, p - 1))} title="Previous page"><ChevronLeft size={16} /></button>
          <span className={styles.viewerPageInfo}>Page {page} of {totalPages}</span>
          <button className={styles.viewerBtn} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} title="Next page"><ChevronRight size={16} /></button>

          <span style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 0.25rem' }} />

          <button className={styles.viewerBtn} onClick={handleZoomOut} title="Zoom Out"><ZoomOut size={16} /></button>
          <span className={styles.viewerPageInfo}>{zoom}%</span>
          <button className={styles.viewerBtn} onClick={handleZoomIn} title="Zoom In"><ZoomIn size={16} /></button>
          <button className={styles.viewerBtn} onClick={handleFit} title="Fit to Screen"><Maximize size={16} /></button>

          <span style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 0.25rem' }} />

          <button className={styles.viewerBtn} title="Download"><Download size={16} /></button>
          <button className={styles.viewerBtn} title="Fullscreen"><Expand size={16} /></button>
        </div>
      </div>

      <div className={styles.viewerCanvas}>
        <div className={styles.pdfPage} style={{ transform: `scale(${zoom / 100})` }}>
          {/* Simulated document content */}
          <div className={styles.pdfLineTitle} />
          <div className={styles.pdfLineSubtitle} />

          <div className={styles.pdfLine} />
          <div className={`${styles.pdfLine} ${styles.pdfLineMedium}`} />
          <div className={styles.pdfLine} />
          <div className={`${styles.pdfLine} ${styles.pdfLineShort}`} />

          <div className={styles.pdfParagraphGap} />

          <div className={styles.pdfLine} />
          <div className={styles.pdfLine} />
          <div className={`${styles.pdfLine} ${styles.pdfLineMedium}`} />
          <div className={`${styles.pdfLine} ${styles.pdfLineShort}`} />

          <div className={styles.pdfParagraphGap} />

          <div className={styles.pdfLine} />
          <div className={`${styles.pdfLine} ${styles.pdfLineMedium}`} />
          <div className={styles.pdfLine} />
          <div className={styles.pdfLine} />
          <div className={`${styles.pdfLine} ${styles.pdfLineShort}`} />

          <div className={styles.pdfParagraphGap} />

          <div className={styles.pdfLine} />
          <div className={`${styles.pdfLine} ${styles.pdfLineMedium}`} />
          <div className={`${styles.pdfLine} ${styles.pdfLineShort}`} />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Main DocumentReview Page
   ---------------------------------------------------------------- */
export default function DocumentReview({ role }: { role: Role }) {
  const params = useParams<{ id: string }>();
  const reviewId = params.id ?? 'RV-2048';
  const data = useMemo(() => getReviewById(reviewId), [reviewId]);

  // Page state
  const [status, setStatus] = useState<ReviewStatus>('Pending');
  const [comment, setComment] = useState('');
  const [modal, setModal] = useState<ModalKind>(null);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'warning' | 'danger' } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([
    { date: data.uploadDate, text: `${data.submittedBy} uploaded document`, type: 'info' },
    { date: data.uploadDate, text: `${data.reviewer} opened document`, type: 'info' },
    { date: data.lastVerified, text: 'Integrity verified', type: 'success' },
  ]);

  const maxChars = 500;
  const charsLeft = maxChars - comment.length;

  const showToast = useCallback((message: string, variant: 'success' | 'warning' | 'danger') => {
    setToast({ message, variant });
  }, []);

  const addHistory = useCallback((text: string, type: HistoryEntry['type']) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    setHistory((prev) => [...prev, { date: dateStr, text, type }]);
  }, []);

  const handleConfirm = useCallback((reason: string) => {
    if (modal === 'approve') {
      setStatus('Approved');
      showToast('Document approved successfully.', 'success');
      addHistory('Document approved by reviewer', 'success');
    } else if (modal === 'flag') {
      setStatus('Flagged');
      showToast('Document flagged for further review.', 'warning');
      addHistory(`Document flagged: ${reason}`, 'warning');
    } else if (modal === 'reject') {
      setStatus('Rejected');
      showToast('Document rejected.', 'danger');
      addHistory(`Document rejected: ${reason}`, 'danger');
    }
    setModal(null);
  }, [modal, showToast, addHistory]);

  // Status badge helpers
  const statusLabel = `Review Status: ${status}`;
  const statusCls =
    status === 'Pending' ? styles.statusPending :
    status === 'Approved' ? styles.statusApproved :
    status === 'Flagged' ? styles.statusFlagged : styles.statusRejected;

  const isActioned = status !== 'Pending';

  return (
    <div className={styles.reviewPage}>
      {/* Toast notification */}
      {toast && <Toast message={toast.message} variant={toast.variant} onDone={() => setToast(null)} />}

      {/* Confirmation modal */}
      <ConfirmModal kind={modal} docName={data.document} onCancel={() => setModal(null)} onConfirm={handleConfirm} />

      {/* Back link */}
      <Link href="/reviews" className={styles.backLink}>
        <ArrowLeft size={15} /> Back to Review Queue
      </Link>

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Document Review</h1>
          <span className={styles.pageSubtitle}>Review ID: {data.id} · Case {data.caseId}</span>
        </div>
        <div className={`${styles.statusBadge} ${statusCls}`}>
          <span className={styles.statusDot} />
          {statusLabel}
        </div>
      </div>

      {/* Two-column workspace */}
      <div className={styles.workspace}>
        {/* LEFT — Document Viewer */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FileText size={17} className={styles.cardTitleIcon} />
            <h2 className={styles.cardTitle}>Document Viewer</h2>
          </div>
          <div className={styles.cardBody}>
            <PdfViewer />
          </div>
        </div>

        {/* RIGHT — Metadata + Integrity */}
        <div className={styles.rightColumn}>
          {/* Metadata */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FileText size={17} className={styles.cardTitleIcon} />
              <h2 className={styles.cardTitle}>Document Metadata</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Document Name</span>
                  <span className={styles.metaValue}>{data.document}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Case ID</span>
                  <span className={styles.metaValue}>{data.caseId}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Document Type</span>
                  <span className={styles.metaValue}>{data.documentType}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Uploaded By</span>
                  <span className={styles.metaValue}>{data.submittedBy}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Upload Date</span>
                  <span className={styles.metaValue}>{data.uploadDate}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Version</span>
                  <span className={styles.metaValue}>{data.version}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>File Size</span>
                  <span className={styles.metaValue}>{data.fileSize}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Integrity</span>
                  <span className={styles.metaValueVerified}>
                    <ShieldCheck size={15} /> VERIFIED
                  </span>
                </div>
              </div>

              {/* Integrity Information */}
              <div className={styles.integritySection}>
                <h3 className={styles.integritySectionTitle}>
                  <Lock size={14} /> Document Integrity
                </h3>

                <div className={styles.integrityStatus}>
                  <CheckCircle2 size={15} />
                  Integrity Verified
                </div>

                <p className={styles.integrityDesc}>
                  The document hash matches the original stored version.
                </p>

                <div className={styles.hashGrid}>
                  <div className={styles.hashItem}>
                    <span className={styles.hashLabel}>Original Hash</span>
                    <span className={styles.hashValue}>{data.originalHash}</span>
                  </div>
                  <div className={styles.hashItem}>
                    <span className={styles.hashLabel}>Current Hash</span>
                    <span className={styles.hashValue}>{data.currentHash}</span>
                  </div>
                </div>

                <span className={styles.lastVerified}>Last verified: {data.lastVerified}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Decision — full width */}
      <div className={`${styles.card} ${styles.reviewDecision}`}>
        <div className={styles.cardHeader}>
          <ShieldCheck size={17} className={styles.cardTitleIcon} />
          <h2 className={styles.cardTitle}>Review Decision</h2>
        </div>
        <div className={styles.cardBody}>
          <label
            style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}
          >
            Comment
          </label>

          <div className={styles.commentArea}>
            <textarea
              className={styles.textarea}
              placeholder="Enter your review comments..."
              value={comment}
              maxLength={maxChars}
              onChange={(e) => setComment(e.target.value)}
              disabled={isActioned}
            />
            <div
              className={`${styles.charCounter} ${
                charsLeft <= 50 ? styles.charCounterDanger :
                charsLeft <= 100 ? styles.charCounterWarning : ''
              }`}
            >
              {comment.length} / {maxChars}
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button
              className={`${styles.btnBase} ${styles.btnApprove}`}
              disabled={isActioned}
              onClick={() => setModal('approve')}
            >
              ✓ Approve
            </button>
            <button
              className={`${styles.btnBase} ${styles.btnFlag}`}
              disabled={isActioned}
              onClick={() => setModal('flag')}
            >
              ⚑ Flag
            </button>
            <button
              className={`${styles.btnBase} ${styles.btnReject}`}
              disabled={isActioned}
              onClick={() => setModal('reject')}
            >
              ✕ Reject
            </button>
          </div>
        </div>
      </div>

      {/* Review History */}
      <div className={`${styles.card}`} style={{ marginBottom: '1.5rem' }}>
        <div className={styles.cardHeader}>
          <History size={17} className={styles.cardTitleIcon} />
          <h2 className={styles.cardTitle}>Review History</h2>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.historyTimeline}>
            {history.map((entry, i) => {
              const dotCls =
                entry.type === 'success' ? styles.historyDotSuccess :
                entry.type === 'warning' ? styles.historyDotWarning :
                entry.type === 'danger' ? styles.historyDotDanger : '';

              return (
                <div key={i} className={styles.historyItem}>
                  <div className={`${styles.historyDot} ${dotCls}`} />
                  <div className={styles.historyDate}>{entry.date}</div>
                  <div className={styles.historyText}>{entry.text}</div>
                </div>
              );
            })}
          </div>

          {status === 'Pending' && (
            <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>
              <Clock size={14} style={{ verticalAlign: 'text-bottom', marginRight: '0.25rem' }} />
              Current Review: Pending
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className={styles.securityNotice}>
        <Lock size={17} className={styles.securityNoticeIcon} />
        <div>
          <h4 className={styles.securityNoticeTitle}>🔒 Secure Review Environment</h4>
          <p className={styles.securityNoticeText}>
            Only authorized reviewers can approve, flag, or reject this document. All review actions are recorded in the audit log.
          </p>
        </div>
      </div>
    </div>
  );
}
