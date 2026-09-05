import { useState } from 'react';
import type { ReviewData } from '@/lib/reviews-data';
import styles from './reviews.module.css';
import { X, FileText, CheckCircle2, AlertTriangle, User, Calendar, ShieldCheck, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Role } from '@/lib/mock-data';

interface ModalProps {
  review: ReviewData;
  role: Role;
  onClose: () => void;
  onAction: (id: string, action: 'Approve' | 'Reject' | 'Request Changes', comments: string) => void;
}

export default function ReviewDetailsModal({ review, role, onClose, onAction }: ModalProps) {
  const { toast } = useToast();
  const [decision, setDecision] = useState<'Approve' | 'Reject' | 'Request Changes' | null>(null);
  const [comments, setComments] = useState('');

  const canReview = role === 'Legal Reviewer' || role === 'Admin';

  const handleSubmit = () => {
    if (!decision) {
      toast({
        title: 'Error',
        description: 'Please select a decision.',
        variant: 'destructive',
      });
      return;
    }

    if ((decision === 'Reject' || decision === 'Request Changes') && !comments.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please complete the required fields (comments).',
        variant: 'destructive',
      });
      return;
    }

    onAction(review.id, decision, comments);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.headerTitle}>DOCUMENT REVIEW</h2>
            <div className={styles.headerSubtitle}>Case ID: {review.caseId}</div>
          </div>
          <button onClick={onClose} className={styles.secondaryButton} style={{ padding: '0.25rem', border: 'none' }}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className={styles.docPreview}>
              <FileText className={styles.docIcon} />
              <div className={styles.docName}>{review.document}</div>
              <div className={styles.docMeta}>Version {review.version}</div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className={styles.secondaryButton}>Preview Document</button>
                <button className={styles.secondaryButton}>Fullscreen</button>
              </div>
            </div>

            <div className={styles.securityPanel}>
              <div className={styles.securityHeader}>
                <ShieldCheck size={18} /> Document Security
              </div>
              <div className={styles.securityItem}>
                <span className={styles.securityLabel}>Document Integrity</span>
                <span className={`${styles.securityValue} ${styles.securityValid}`}><CheckCircle2 size={14} /> Verified</span>
              </div>
              <div className={styles.securityItem}>
                <span className={styles.securityLabel}>Access Permission</span>
                <span className={`${styles.securityValue} ${styles.securityValid}`}><CheckCircle2 size={14} /> Authorized</span>
              </div>
              <div className={styles.securityItem}>
                <span className={styles.securityLabel}>Current Version</span>
                <span className={styles.securityValue}>{review.version}</span>
              </div>
              <div className={styles.securityItem}>
                <span className={styles.securityLabel}>Hash Status</span>
                <span className={`${styles.securityValue} ${styles.securityValid}`}><CheckCircle2 size={14} /> Valid</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Review Comments</label>
              <textarea
                className={styles.textarea}
                placeholder="Enter review comments..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                disabled={!canReview}
              />
            </div>

            {canReview ? (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Decision</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name="decision"
                      value="Approve"
                      checked={decision === 'Approve'}
                      onChange={() => setDecision('Approve')}
                    />
                    <span style={{ color: 'var(--color-success)' }}>Approve</span>
                  </label>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name="decision"
                      value="Reject"
                      checked={decision === 'Reject'}
                      onChange={() => setDecision('Reject')}
                    />
                    <span style={{ color: 'var(--color-danger)' }}>Reject</span>
                  </label>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name="decision"
                      value="Request Changes"
                      checked={decision === 'Request Changes'}
                      onChange={() => setDecision('Request Changes')}
                    />
                    <span style={{ color: 'var(--color-warning)' }}>Request Changes</span>
                  </label>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', fontWeight: 500, padding: '1rem', backgroundColor: 'rgba(220, 38, 38, 0.1)', borderRadius: '0.375rem' }}>
                You don't have permission to perform this action.
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className={styles.secondaryButton} onClick={onClose}>Cancel</button>
              {canReview && (
                <button className={styles.primaryButton} onClick={handleSubmit}>
                  Submit Review
                </button>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className={styles.auditCard}>
              <h3 className={styles.formLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <User size={16} /> Submitter Info
              </h3>
              <div className={styles.auditGrid}>
                <div className={styles.auditItem}>
                  <span className={styles.auditLabel}>Submitted By</span>
                  <span className={styles.auditValue}>{review.submittedBy}</span>
                </div>
                <div className={styles.auditItem}>
                  <span className={styles.auditLabel}>Assigned Reviewer</span>
                  <span className={styles.auditValue}>{review.reviewer}</span>
                </div>
                <div className={styles.auditItem}>
                  <span className={styles.auditLabel}>Priority</span>
                  <span className={styles.auditValue} style={{ color: review.priority === 'High' ? 'var(--color-danger)' : review.priority === 'Medium' ? 'var(--color-warning)' : 'var(--color-success)' }}>
                    {review.priority}
                  </span>
                </div>
                <div className={styles.auditItem}>
                  <span className={styles.auditLabel}>Status</span>
                  <span className={styles.auditValue}>{review.status}</span>
                </div>
              </div>
            </div>

            <div className={styles.auditCard}>
              <h3 className={styles.formLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <History size={16} /> Review History
              </h3>
              <div className={styles.timeline}>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineDate}>01 Sep 2026</div>
                  <div className={styles.timelineTitle}>Uploaded</div>
                  <div className={styles.timelineDesc}>{review.submittedBy} - v1</div>
                </div>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineDate}>03 Sep 2026</div>
                  <div className={styles.timelineTitle}>Modified</div>
                  <div className={styles.timelineDesc}>{review.submittedBy} - v2</div>
                </div>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineDate}>{review.submittedDate}</div>
                  <div className={styles.timelineTitle}>Submitted for Review</div>
                  <div className={styles.timelineDesc}>{review.submittedBy} - {review.version}</div>
                </div>
              </div>
            </div>

            <div className={styles.auditCard}>
              <h3 className={styles.formLabel}>Audit Information</h3>
              <div className={styles.auditGrid} style={{ gridTemplateColumns: '1fr' }}>
                <div className={styles.auditItem}>
                  <span className={styles.auditLabel}>Review ID</span>
                  <span className={styles.auditValue}>{review.id}</span>
                </div>
                <div className={styles.auditItem}>
                  <span className={styles.auditLabel}>Created</span>
                  <span className={styles.auditValue}>{review.submittedDate}, 09:42 AM</span>
                </div>
                <div className={styles.auditItem}>
                  <span className={styles.auditLabel}>Last Updated</span>
                  <span className={styles.auditValue}>{review.submittedDate}, 10:15 AM</span>
                </div>
                <div className={styles.auditItem}>
                  <span className={styles.auditLabel}>Access Level</span>
                  <span className={styles.auditValue}>Legal Reviewer</span>
                </div>
                <div className={styles.auditItem}>
                  <span className={styles.auditLabel}>Audit Status</span>
                  <span className={styles.auditValue} style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={14} /> Recorded
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
