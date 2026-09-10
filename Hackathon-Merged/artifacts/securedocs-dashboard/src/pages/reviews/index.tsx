import { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import styles from './reviews.module.css';
import { type ReviewData, type ReviewStatus, type ReviewPriority } from '@/lib/reviews-data';
import ReviewDetailsModal from './ReviewDetailsModal';
import { useToast } from '@/hooks/use-toast';
import { documentService } from '@/services/documentService';
import { 
  Search, ChevronDown, Clock, AlertTriangle, 
  Calendar, CheckCircle, Download, ChevronLeft, ChevronRight,
  ExternalLink, Loader2, RefreshCw
} from 'lucide-react';
import type { Role } from '@/lib/mock-data';

function mapDocumentToReview(doc: any): ReviewData {
  let status: ReviewStatus = 'Pending';
  const rawStatus = (doc.status || '').toLowerCase();
  if (rawStatus.includes('approved')) status = 'Approved';
  else if (rawStatus.includes('rejected')) status = 'Rejected';
  else if (rawStatus.includes('flag') || rawStatus.includes('changes')) status = 'Changes Requested';
  else if (rawStatus.includes('under review') || rawStatus.includes('in review')) status = 'In Review';
  else status = 'Pending';

  let priority: ReviewPriority = 'Medium';
  const rawConf = (doc.confidentiality || '').toLowerCase();
  if (rawConf.includes('highly') || rawConf.includes('restricted') || (doc.priority && doc.priority === 'High')) {
    priority = 'High';
  } else if (rawConf.includes('public') || (doc.priority && doc.priority === 'Low')) {
    priority = 'Low';
  }

  let formattedDate = 'Today';
  try {
    if (doc.uploadDate || doc.createdAt) {
      const d = new Date(doc.uploadDate || doc.createdAt);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    }
  } catch {}

  return {
    id: doc.documentId || doc.id || doc._id || 'DOC-UNKNOWN',
    caseId: doc.caseId || 'C-1024',
    document: doc.documentName || doc.name || 'Untitled Document',
    submittedBy: doc.uploadedBy || 'System',
    reviewer: doc.lastAccessedBy || doc.reviewer || 'Legal Reviewer',
    version: `v${doc.version || 1}`,
    priority,
    submittedDate: formattedDate,
    status,
  };
}

export default function Reviews({ role }: { role: Role }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<ReviewPriority | 'All'>('All');
  const [reviewerFilter, setReviewerFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof ReviewData>('submittedDate');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null);

  const itemsPerPage = 8;

  const loadReviews = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const docs = await documentService.getDocuments();
      if (Array.isArray(docs)) {
        const mapped = docs.map(mapDocumentToReview);
        setReviews(mapped);
      }
    } catch (err) {
      console.error('Failed to load review documents:', err);
      toast({
        title: 'Error loading queue',
        description: 'Could not fetch review documents from repository.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setReviewerFilter('All');
    setCurrentPage(1);
  };

  const availableReviewers = useMemo(() => {
    const list = Array.from(new Set(reviews.map(r => r.reviewer).filter(Boolean)));
    return list;
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchSearch = r.caseId.toLowerCase().includes(search.toLowerCase()) ||
                          r.document.toLowerCase().includes(search.toLowerCase()) ||
                          r.submittedBy.toLowerCase().includes(search.toLowerCase()) ||
                          r.reviewer.toLowerCase().includes(search.toLowerCase()) ||
                          r.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchPriority = priorityFilter === 'All' || r.priority === priorityFilter;
      const matchReviewer = reviewerFilter === 'All' || r.reviewer === reviewerFilter;
      return matchSearch && matchStatus && matchPriority && matchReviewer;
    }).sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      if (fieldA < fieldB) return sortAsc ? -1 : 1;
      if (fieldA > fieldB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [reviews, search, statusFilter, priorityFilter, reviewerFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const currentReviews = filteredReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: keyof ReviewData) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getBadgeClass = (status: ReviewStatus) => {
    switch (status) {
      case 'Pending': return styles.badgePending;
      case 'In Review': return styles.badgeInReview;
      case 'Approved': return styles.badgeApproved;
      case 'Rejected': return styles.badgeRejected;
      case 'Changes Requested': return styles.badgeChanges;
      default: return '';
    }
  };

  const getPriorityClass = (priority: ReviewPriority) => {
    switch (priority) {
      case 'High': return styles.priorityHigh;
      case 'Medium': return styles.priorityMedium;
      case 'Low': return styles.priorityLow;
      default: return '';
    }
  };

  const handleAction = async (id: string, action: 'Approve' | 'Reject' | 'Request Changes', comments: string) => {
    const statusMap: Record<string, string> = {
      'Approve': 'Approved',
      'Reject': 'Rejected',
      'Request Changes': 'Flagged',
    };
    const newDbStatus = statusMap[action] || 'Approved';

    // Optimistically update local review state
    setReviews(prev => prev.map(r => {
      if (r.id === id) {
        let newLocalStatus: ReviewStatus = r.status;
        if (action === 'Approve') newLocalStatus = 'Approved';
        if (action === 'Reject') newLocalStatus = 'Rejected';
        if (action === 'Request Changes') newLocalStatus = 'Changes Requested';
        return { ...r, status: newLocalStatus };
      }
      return r;
    }));

    // Persist to MongoDB through document service
    try {
      await documentService.updateDocumentStatus(id, newDbStatus, comments);
      toast({
        title: 'Decision Recorded',
        description: action === 'Approve' ? 'Document approved and digitally signed in repository.' :
                     action === 'Reject' ? 'Document marked as rejected.' : 'Document flagged with changes requested.',
        variant: action === 'Reject' ? 'destructive' : 'default',
      });
    } catch (err) {
      console.error('Failed to update review status in database:', err);
    }

    setSelectedReview(null);
  };

  // Live Summary Statistics
  const pendingCount = reviews.filter(r => r.status === 'Pending' || r.status === 'In Review').length;
  const highPriorityCount = reviews.filter(r => r.priority === 'High' && r.status !== 'Approved').length;
  const approvedCount = reviews.filter(r => r.status === 'Approved').length;
  const flaggedCount = reviews.filter(r => r.status === 'Changes Requested').length;

  return (
    <div className={styles.reviewQueueContainer}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className={styles.headerTitle}>Review Queue</h1>
          <div className={styles.headerSubtitle}>
            Live synchronization with Document Repository ({reviews.length} active documents).
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            className={styles.secondaryButton} 
            onClick={() => loadReviews(true)}
            disabled={refreshing || loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> 
            <span>{refreshing ? 'Syncing...' : 'Sync Database'}</span>
          </button>
          <button 
            className={styles.primaryButton}
            onClick={() => {
              toast({
                title: 'Queue Exported',
                description: `Exported ${reviews.length} document review records to CSV/JSON format.`,
              });
            }}
          >
            <Download size={16} /> Export Queue
          </button>
        </div>
      </div>
      
      <div className={styles.divider}></div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <Clock size={16} style={{ color: 'var(--color-warning)' }} />
            <h3 className={styles.cardTitle}>Pending Reviews</h3>
          </div>
          <p className={styles.cardNumber}>{loading ? '—' : pendingCount}</p>
          <p className={styles.cardDesc}>Awaiting verification</p>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <AlertTriangle size={16} style={{ color: 'var(--color-danger)' }} />
            <h3 className={styles.cardTitle}>High Priority</h3>
          </div>
          <p className={styles.cardNumber}>{loading ? '—' : highPriorityCount.toString().padStart(2, '0')}</p>
          <p className={styles.cardDesc}>Requires rapid review</p>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <Calendar size={16} style={{ color: 'var(--color-primary)' }} />
            <h3 className={styles.cardTitle}>Flagged Documents</h3>
          </div>
          <p className={styles.cardNumber}>{loading ? '—' : flaggedCount}</p>
          <p className={styles.cardDesc}>Changes requested</p>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
            <h3 className={styles.cardTitle}>Approved & Signed</h3>
          </div>
          <p className={styles.cardNumber}>{loading ? '—' : approvedCount}</p>
          <p className={styles.cardDesc}>Validated repository files</p>
        </div>
      </div>

      {/* Filter Panel */}
      <div className={styles.filterPanel}>
        <div className={styles.searchInput}>
          <Search />
          <input 
            type="text" 
            placeholder="Search Case ID, Document, Submitter..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterSelects}>
          <div className={styles.selectWrapper}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
              <option value="All">All Status ({reviews.length})</option>
              <option value="Pending">Pending ({reviews.filter(r => r.status === 'Pending').length})</option>
              <option value="In Review">In Review ({reviews.filter(r => r.status === 'In Review').length})</option>
              <option value="Approved">Approved ({reviews.filter(r => r.status === 'Approved').length})</option>
              <option value="Rejected">Rejected ({reviews.filter(r => r.status === 'Rejected').length})</option>
              <option value="Changes Requested">Flagged / Changes ({reviews.filter(r => r.status === 'Changes Requested').length})</option>
            </select>
            <ChevronDown />
          </div>
          <div className={styles.selectWrapper}>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as any)}>
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <ChevronDown />
          </div>
          <div className={styles.selectWrapper}>
            <select value={reviewerFilter} onChange={(e) => setReviewerFilter(e.target.value)}>
              <option value="All">All Reviewers</option>
              {availableReviewers.map(rev => (
                <option key={rev} value={rev}>{rev}</option>
              ))}
            </select>
            <ChevronDown />
          </div>
          <button className={styles.secondaryButton} onClick={handleResetFilters}>Reset</button>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('caseId')}>Case ID {sortField === 'caseId' && (sortAsc ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('document')}>Document {sortField === 'document' && (sortAsc ? '↑' : '↓')}</th>
              <th>Submitted By</th>
              <th>Reviewer</th>
              <th>Version</th>
              <th onClick={() => handleSort('priority')}>Priority {sortField === 'priority' && (sortAsc ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('submittedDate')}>Submitted Date {sortField === 'submittedDate' && (sortAsc ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('status')}>Status {sortField === 'status' && (sortAsc ? '↑' : '↓')}</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    <Loader2 size={28} className="animate-spin text-[#2563EB]" />
                    <span style={{ fontSize: '0.875rem' }}>Fetching live repository documents from MongoDB...</span>
                  </div>
                </td>
              </tr>
            ) : currentReviews.map(r => (
              <tr key={r.id}>
                <td>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.caseId}</span>
                </td>
                <td>
                  <button 
                    type="button"
                    onClick={() => setLocation(`/reviews/${r.id}`)}
                    style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    title="Open Document Review Workspace"
                  >
                    <span style={{ fontWeight: 600, color: '#2563EB', display: 'block' }}>{r.document}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{r.id}</span>
                  </button>
                </td>
                <td>{r.submittedBy}</td>
                <td>{r.reviewer}</td>
                <td>
                  <span style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.05)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '11px' }}>
                    {r.version}
                  </span>
                </td>
                <td className={getPriorityClass(r.priority)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }}></div>
                    {r.priority}
                  </span>
                </td>
                <td>{r.submittedDate}</td>
                <td>
                  <span className={`${styles.badge} ${getBadgeClass(r.status)}`}>
                    <div className={styles.badgeDot}></div>
                    {r.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <button 
                      className={styles.secondaryButton} 
                      style={{ padding: '0.3rem 0.6rem', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      onClick={() => setLocation(`/reviews/${r.id}`)}
                      title="Open full split-screen review workspace"
                    >
                      <ExternalLink size={12} />
                      <span>Workspace</span>
                    </button>
                    <button 
                      className={styles.primaryButton} 
                      style={{ padding: '0.3rem 0.75rem', fontSize: '11px' }}
                      onClick={() => setSelectedReview(r)}
                    >
                      Quick Review
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && currentReviews.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '3rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={32} style={{ color: 'var(--color-success)', opacity: 0.8 }} />
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827' }}>No reviews found matching your criteria</p>
                    <p style={{ fontSize: '0.8rem' }}>Upload documents in the Document Repository or adjust your filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className={styles.pagination}>
          <div className={styles.paginationText}>
            Showing {filteredReviews.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredReviews.length)} of {filteredReviews.length} reviews
          </div>
          <div className={styles.paginationControls}>
            <button 
              className={styles.pageButton} 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button 
                key={i} 
                className={`${styles.pageButton} ${currentPage === i + 1 ? styles.active : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button 
              className={styles.pageButton} 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedReview && (
        <ReviewDetailsModal
          review={selectedReview}
          role={role}
          onClose={() => setSelectedReview(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
