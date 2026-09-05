import { useState, useMemo } from 'react';
import styles from './reviews.module.css';
import { mockReviews, type ReviewData, type ReviewStatus, type ReviewPriority } from '@/lib/reviews-data';
import ReviewDetailsModal from './ReviewDetailsModal';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, ChevronDown, Clock, AlertTriangle, 
  Calendar, CheckCircle, Download, ChevronLeft, ChevronRight 
} from 'lucide-react';
import type { Role } from '@/lib/mock-data';

export default function Reviews({ role }: { role: Role }) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ReviewData[]>(mockReviews);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<ReviewPriority | 'All'>('All');
  const [reviewerFilter, setReviewerFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof ReviewData>('submittedDate');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null);

  const itemsPerPage = 5;

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setReviewerFilter('All');
    setCurrentPage(1);
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchSearch = r.caseId.toLowerCase().includes(search.toLowerCase()) ||
                          r.document.toLowerCase().includes(search.toLowerCase()) ||
                          r.submittedBy.toLowerCase().includes(search.toLowerCase()) ||
                          r.reviewer.toLowerCase().includes(search.toLowerCase());
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

  const getActionButtonText = (status: ReviewStatus) => {
    switch (status) {
      case 'Pending': return 'Review';
      case 'In Review': return 'Continue';
      case 'Approved': return 'View';
      case 'Rejected': return 'View';
      case 'Changes Requested': return 'Review';
      default: return 'Review';
    }
  };

  const handleAction = (id: string, action: 'Approve' | 'Reject' | 'Request Changes', comments: string) => {
    setReviews(prev => prev.map(r => {
      if (r.id === id) {
        let newStatus: ReviewStatus = r.status;
        if (action === 'Approve') newStatus = 'Approved';
        if (action === 'Reject') newStatus = 'Rejected';
        if (action === 'Request Changes') newStatus = 'Changes Requested';
        return { ...r, status: newStatus };
      }
      return r;
    }));

    toast({
      title: 'Success',
      description: action === 'Approve' ? 'Document approved successfully.' : 
                   action === 'Reject' ? 'Document rejected.' : 'Changes requested from document owner.',
      variant: action === 'Reject' ? 'destructive' : action === 'Request Changes' ? 'default' : 'default',
    });

    setSelectedReview(null);
  };

  // Stats
  const pendingCount = reviews.filter(r => r.status === 'Pending').length;
  const highPriorityCount = reviews.filter(r => r.priority === 'High' && r.status !== 'Approved').length;

  return (
    <div className={styles.reviewQueueContainer}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className={styles.headerTitle}>Review Queue</h1>
          <div className={styles.headerSubtitle}>Review and manage documents submitted for approval.</div>
        </div>
        <button className={styles.primaryButton}>
          <Download size={16} /> Export Queue
        </button>
      </div>
      
      <div className={styles.divider}></div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <Clock size={16} style={{ color: 'var(--color-warning)' }} />
            <h3 className={styles.cardTitle}>Pending Reviews</h3>
          </div>
          <p className={styles.cardNumber}>{pendingCount}</p>
          <p className={styles.cardDesc}>Awaiting review</p>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <AlertTriangle size={16} style={{ color: 'var(--color-danger)' }} />
            <h3 className={styles.cardTitle}>High Priority</h3>
          </div>
          <p className={styles.cardNumber}>0{highPriorityCount}</p>
          <p className={styles.cardDesc}>Requires attention</p>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <Calendar size={16} style={{ color: 'var(--color-primary)' }} />
            <h3 className={styles.cardTitle}>Due Today</h3>
          </div>
          <p className={styles.cardNumber}>12</p>
          <p className={styles.cardDesc}>Reviews due today</p>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
            <h3 className={styles.cardTitle}>Completed Today</h3>
          </div>
          <p className={styles.cardNumber}>17</p>
          <p className={styles.cardDesc}>Successfully completed</p>
        </div>
      </div>

      {/* Filter Panel */}
      <div className={styles.filterPanel}>
        <div className={styles.searchInput}>
          <Search />
          <input 
            type="text" 
            placeholder="Search Case ID, Document..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterSelects}>
          <div className={styles.selectWrapper}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Review">In Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Changes Requested">Changes Requested</option>
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
              <option value="Reviewer B">Reviewer B</option>
              <option value="Reviewer C">Reviewer C</option>
            </select>
            <ChevronDown />
          </div>
          <button className={styles.primaryButton} onClick={() => {}}>Search</button>
          <button className={styles.secondaryButton} onClick={handleResetFilters}>Reset Filters</button>
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentReviews.map(r => (
              <tr key={r.id}>
                <td>{r.caseId}</td>
                <td style={{ fontWeight: 500 }}>{r.document}</td>
                <td>{r.submittedBy}</td>
                <td>{r.reviewer}</td>
                <td>{r.version}</td>
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
                  <button 
                    className={styles.primaryButton} 
                    style={{ padding: '0.25rem 0.75rem' }}
                    onClick={() => setSelectedReview(r)}
                  >
                    {getActionButtonText(r.status)}
                  </button>
                </td>
              </tr>
            ))}
            {currentReviews.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>
                  No reviews found matching your criteria.
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
