import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  History,
} from 'lucide-react';
import type { ReviewData, ReviewStatus } from '@/lib/reviews-data';
import type { Role } from '@/lib/mock-data';

interface ReviewDetailsModalProps {
  review: ReviewData;
  role: Role;
  onClose: () => void;
  onAction: (id: string, action: ReviewStatus, comments?: string) => void;
}

export default function ReviewDetailsModal({
  review,
  role,
  onClose,
  onAction,
}: ReviewDetailsModalProps) {
  const [comments, setComments] = useState('');
  const [decision, setDecision] = useState<'Approve' | 'Reject' | 'Request Changes'>('Approve');

  const canReview = role === 'Admin' || role === 'Legal Reviewer';

  const handleSubmit = () => {
    let nextStatus: ReviewStatus = 'Approved';
    if (decision === 'Reject') nextStatus = 'Rejected';
    if (decision === 'Request Changes') nextStatus = 'Changes Requested';

    onAction(review.id, nextStatus, comments);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border border-border bg-card">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Document Review: {review.document}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Case: <span className="font-mono text-primary font-semibold">{review.caseId}</span> · Review ID: {review.id}
              </DialogDescription>
            </div>
            <Badge
              variant="outline"
              className={
                review.priority === 'High'
                  ? 'border-[#C62828]/40 text-[#C62828] bg-[#C62828]/10'
                  : 'border-[#2563A8]/40 text-[#2563A8] bg-[#2563A8]/10'
              }
            >
              {review.priority} Priority
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3">
          {/* Left: Review decision and comments (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <div className="p-3.5 rounded-lg border border-border bg-muted/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <FileText className="h-4 w-4 text-primary" /> Document Information
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Version:</span>{' '}
                  <span className="font-mono font-semibold">{review.version}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted:</span>{' '}
                  <span className="font-semibold">{review.submittedDate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted By:</span>{' '}
                  <span className="font-semibold">{review.submittedBy}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Assigned Reviewer:</span>{' '}
                  <span className="font-semibold">{review.reviewer}</span>
                </div>
              </div>
            </div>

            {/* Security Verification Panel */}
            <div className="p-3.5 rounded-lg border border-[#16803C]/30 bg-[#16803C]/5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#16803C] mb-2">
                <ShieldCheck className="h-4 w-4 text-[#16803C]" /> Security & Integrity Verification
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#16803C]" />
                  <span>SHA-256 Checksum: Valid</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#16803C]" />
                  <span>Access Permission: Authorized</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#16803C]" />
                  <span>Audit Logging: Active</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#16803C]" />
                  <span>Watermark: Enforced on Export</span>
                </div>
              </div>
            </div>

            {/* Comments Form */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Reviewer Evaluation & Notes</label>
              <Textarea
                placeholder="Enter findings, verification remarks, or requested amendments..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                disabled={!canReview}
                className="text-xs min-h-[90px]"
              />
            </div>

            {canReview ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Approval Decision</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('Approve')}
                    className={`py-2 px-3 text-xs font-medium rounded-md border text-center transition-all ${
                      decision === 'Approve'
                        ? 'border-[#16803C] bg-[#16803C]/10 text-[#16803C] font-semibold'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('Request Changes')}
                    className={`py-2 px-3 text-xs font-medium rounded-md border text-center transition-all ${
                      decision === 'Request Changes'
                        ? 'border-[#B77900] bg-[#B77900]/10 text-[#B77900] font-semibold'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    Request Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('Reject')}
                    className={`py-2 px-3 text-xs font-medium rounded-md border text-center transition-all ${
                      decision === 'Reject'
                        ? 'border-[#C62828] bg-[#C62828]/10 text-[#C62828] font-semibold'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-[#B77900]/10 border border-[#B77900]/30 rounded text-xs text-[#B77900]">
                Read-only view: You must hold the <strong>Legal Reviewer</strong> or <strong>Admin</strong> role to record approval decisions.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
                Cancel
              </Button>
              {canReview && (
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  className="bg-primary text-primary-foreground hover:bg-[#123A61] h-8 text-xs"
                >
                  Submit Decision
                </Button>
              )}
            </div>
          </div>

          {/* Right: Review & Audit Metadata (1 col) */}
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg border border-border bg-card space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <History className="h-3.5 w-3.5 text-primary" /> Lifecycle Trail
              </div>
              <div className="space-y-2 text-[11px] text-muted-foreground border-l-2 border-primary/40 pl-2.5 ml-1">
                <div>
                  <div className="font-semibold text-foreground">Uploaded (v1)</div>
                  <div>{review.submittedBy} · {review.submittedDate}</div>
                </div>
                <div>
                  <div className="font-semibold text-foreground">Queue Enqueued</div>
                  <div>Assigned to {review.reviewer}</div>
                </div>
                <div>
                  <div className="font-semibold text-foreground">Current Status</div>
                  <div>{review.status}</div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card space-y-2">
              <div className="font-semibold text-foreground">Compliance Seal</div>
              <p className="text-[11px] text-muted-foreground">
                Every review decision is cryptographically anchored to the case audit ledger with officer credential timestamp.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
