import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'wouter';
import styles from './reviews.module.css';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, ChevronDown, Clock, AlertTriangle, 
  Calendar, CheckCircle, Download, ChevronLeft, ChevronRight, Eye, FileText, CheckCircle2
} from 'lucide-react';
import type { Role } from '@/lib/mock-data';
import { documentService } from '@/services/documentService';
// @ts-ignore
import { StatusBadge, Modal } from '@/components/SecureDocsComponents';

function PreviewModal({ document, onClose, onDetails }: any) {
  const formatDateTime = (date: any) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(date || Date.now()));
  
  return (
    <Modal title={document.documentName} eyebrow={`Document preview · ${document.id}`} onClose={onClose} width="max-w-3xl" testId="modal-preview-document">
      <div className="grid gap-5 p-6 md:grid-cols-[1fr_250px]">
        <div className="flex min-h-[355px] items-center justify-center rounded-lg border border-slate-200 bg-[#f2f5f7] p-5">
          <div className="flex h-[285px] w-full max-w-[470px] flex-col rounded-sm border border-slate-200 bg-white px-9 py-7 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="h-3 w-32 rounded bg-slate-200" />
              <div className="h-5 w-5 rounded bg-cyan-100" />
            </div>
            <div className="space-y-3">
              <div className="h-2 w-5/6 rounded bg-slate-100" />
              <div className="h-2 w-full rounded bg-slate-100" />
              <div className="h-2 w-4/5 rounded bg-slate-100" />
              <div className="mt-6 h-16 w-full rounded bg-slate-50" />
              <div className="h-2 w-3/4 rounded bg-slate-100" />
              <div className="h-2 w-full rounded bg-slate-100" />
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="font-mono text-[8px] text-slate-400">CONTROLLED COPY · {document.hash || '4cf7b1e2c9a0'}</span>
              <span className="text-[9px] font-bold text-slate-400">PAGE 1 / 4</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-500">Classification</div>
            <div className="mt-2"><StatusBadge value={document.confidentiality} kind="confidentiality" /></div>
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-500">Integrity state</div>
            <div className="mt-2 flex items-center gap-2 text-xs font-bold text-emerald-700">
              <CheckCircle2 size={15} /> {document.integrity}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-500">Last accessed</div>
            <div className="mt-1 text-xs font-semibold text-slate-700">{formatDateTime(document.lastAccessed)}</div>
          </div>
          <button type="button" onClick={() => onDetails(document)} data-testid={`button-preview-details-${document.id}`} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
            Open full details <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function ReviewQueue({ role }: { role: Role }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [documents, setDocuments] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalDocuments: 0, pendingReview: 0, integrityIssues: 0, restrictedDocuments: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters & State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  
  const [sortField, setSortField] = useState('uploadDate');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<any | null>(null);

  const itemsPerPage = 7;

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [docsData, statsData] = await Promise.all([
          documentService.getDocuments(),
          documentService.getDocumentStats()
        ]);
        if (isMounted) {
          setDocuments(docsData);
          setStats(statsData);
        }
      } catch (err) {
        console.error("Failed to load documents", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setTypeFilter('All');
    setCurrentPage(1);
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchSearch = doc.caseId?.toLowerCase().includes(search.toLowerCase()) ||
                          doc.documentName?.toLowerCase().includes(search.toLowerCase()) ||
                          doc.uploadedBy?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || doc.status === statusFilter;
      const matchType = typeFilter === 'All' || doc.documentType === typeFilter;
      return matchSearch && matchStatus && matchType;
    }).sort((a, b) => {
      let fieldA = a[sortField];
      let fieldB = b[sortField];
      
      if (sortField === 'uploadDate') {
        fieldA = new Date(fieldA).getTime();
        fieldB = new Date(fieldB).getTime();
      }

      if (fieldA < fieldB) return sortAsc ? -1 : 1;
      if (fieldA > fieldB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [documents, search, statusFilter, typeFilter, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / itemsPerPage));
  const currentDocuments = filteredDocuments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`));
  };

  const getActionButtonText = (status: string) => {
    switch (status) {
      case 'Pending Review': return 'Review';
      case 'In Review': return 'Continue';
      case 'Approved': return 'View';
      case 'Rejected': return 'View';
      case 'Changes Requested': return 'Review';
      default: return 'Review';
    }
  };

  // Extract unique types and statuses for filters
  const uniqueTypes = useMemo(() => Array.from(new Set(documents.map(d => d.documentType))).filter(Boolean), [documents]);
  const uniqueStatuses = useMemo(() => Array.from(new Set(documents.map(d => d.status))).filter(Boolean), [documents]);

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
          <p className={styles.cardNumber}>{stats.pendingReview || 0}</p>
          <p className={styles.cardDesc}>Awaiting review</p>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <AlertTriangle size={16} style={{ color: 'var(--color-danger)' }} />
            <h3 className={styles.cardTitle}>Integrity Issues</h3>
          </div>
          <p className={styles.cardNumber}>{stats.integrityIssues || 0}</p>
          <p className={styles.cardDesc}>Requires attention</p>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <Calendar size={16} style={{ color: 'var(--color-primary)' }} />
            <h3 className={styles.cardTitle}>Total Uploaded</h3>
          </div>
          <p className={styles.cardNumber}>{stats.totalDocuments || 0}</p>
          <p className={styles.cardDesc}>Documents in repository</p>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
            <h3 className={styles.cardTitle}>Restricted</h3>
          </div>
          <p className={styles.cardNumber}>{stats.restrictedDocuments || 0}</p>
          <p className={styles.cardDesc}>Highly confidential</p>
        </div>
      </div>

      {/* Filter Panel */}
      <div className={styles.filterPanel}>
        <div className={styles.searchInput}>
          <Search />
          <input 
            type="text" 
            placeholder="Search Case ID, Document, User..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterSelects}>
          <div className={styles.selectWrapper}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              {uniqueStatuses.map(status => (
                <option key={status as string} value={status as string}>{status as string}</option>
              ))}
            </select>
            <ChevronDown />
          </div>
          <div className={styles.selectWrapper}>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="All">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type as string} value={type as string}>{type as string}</option>
              ))}
            </select>
            <ChevronDown />
          </div>
          
          <button className={styles.primaryButton} onClick={() => {}}>Search</button>
          <button className={styles.secondaryButton} onClick={handleResetFilters}>Reset Filters</button>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Loading documents...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort('documentName')}>Document Name {sortField === 'documentName' && (sortAsc ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('caseId')}>Case ID {sortField === 'caseId' && (sortAsc ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('documentType')}>Type {sortField === 'documentType' && (sortAsc ? '↑' : '↓')}</th>
                <th>Uploaded By</th>
                <th onClick={() => handleSort('uploadDate')}>Upload Date {sortField === 'uploadDate' && (sortAsc ? '↑' : '↓')}</th>
                <th>Version</th>
                <th onClick={() => handleSort('status')}>Status {sortField === 'status' && (sortAsc ? '↑' : '↓')}</th>
                <th>Integrity</th>
                <th>Confidentiality</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentDocuments.map(doc => (
                <tr key={doc.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={14} style={{ color: '#2563EB' }} />
                      {doc.documentName}
                    </div>
                  </td>
                  <td><span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748B' }}>{doc.caseId}</span></td>
                  <td>{doc.documentType}</td>
                  <td>{doc.uploadedBy}</td>
                  <td>{formatDate(doc.uploadDate)}</td>
                  <td>v{doc.version}</td>
                  <td>
                    <StatusBadge value={doc.status} />
                  </td>
                  <td>
                    <StatusBadge value={doc.integrity} kind="integrity" />
                  </td>
                  <td>
                    <StatusBadge value={doc.confidentiality} kind="confidentiality" />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className={styles.secondaryButton} 
                        style={{ padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={() => setSelectedPreviewDoc(doc)}
                        title="View Document"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button 
                        className={styles.primaryButton} 
                        style={{ padding: '0.25rem 0.5rem' }}
                        onClick={() => setLocation(`/reviews/${doc.id}`)}
                        title="Review Document"
                      >
                        {getActionButtonText(doc.status)}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentDocuments.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>
                    No documents found in the repository matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className={styles.pagination}>
          <div className={styles.paginationText}>
            Showing {filteredDocuments.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredDocuments.length)} of {filteredDocuments.length} documents
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

      {selectedPreviewDoc && (
        <PreviewModal
          document={selectedPreviewDoc}
          onClose={() => setSelectedPreviewDoc(null)}
          onDetails={(doc: any) => {
             setSelectedPreviewDoc(null);
             setLocation(`/reviews/${doc.id}`);
          }}
        />
      )}
    </div>
  );
}
