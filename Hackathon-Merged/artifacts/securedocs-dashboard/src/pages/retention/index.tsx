import { useState, useMemo } from 'react';
import {
  Search, ChevronDown, Archive, CheckCircle2,
  X, FileText, AlertCircle, FileArchive, FilterX
} from 'lucide-react';
import styles from './retention.module.css';

/* ----------------------------------------------------------------
   Toast Component
   ---------------------------------------------------------------- */
function Toast({ message, variant, onDone }: { message: string; variant: 'success' | 'danger' | 'warning'; onDone: () => void }) {
  useState(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); });
  const cls = variant === 'success' ? styles.toastSuccess : variant === 'warning' ? styles.toastWarning : styles.toastDanger;
  return (
    <div className={`${styles.toast} ${cls}`}>
      <CheckCircle2 size={16} />
      {message}
    </div>
  );
}

/* ----------------------------------------------------------------
   Types & Mock Data
   ---------------------------------------------------------------- */
type DocStatus = 'ACTIVE' | 'EXPIRING SOON' | 'EXPIRED' | 'ARCHIVED';

interface RetentionDoc {
  id: string;
  name: string;
  caseId: string;
  type: string;
  uploadedBy: string;
  created: string;
  retentionPeriod: string;
  expiry: string;
  status: DocStatus;
  lastUpdated: string;
}

const initialDocs: RetentionDoc[] = [
  {
    id: 'DOC-1024',
    name: 'Evidence.pdf',
    caseId: 'C-1024',
    type: 'Evidence',
    uploadedBy: 'Officer A',
    created: '01/08/2026',
    retentionPeriod: '10 Years',
    expiry: '01/08/2036',
    status: 'ACTIVE',
    lastUpdated: '01/08/2026',
  },
  {
    id: 'DOC-1025',
    name: 'FIR_Report.pdf',
    caseId: 'C-1025',
    type: 'Police Report',
    uploadedBy: 'Officer B',
    created: '15/05/2016',
    retentionPeriod: '10 Years',
    expiry: '15/05/2026',
    status: 'EXPIRED',
    lastUpdated: '15/05/2016',
  },
  {
    id: 'DOC-1026',
    name: 'Witness_Statement.pdf',
    caseId: 'C-1026',
    type: 'Statement',
    uploadedBy: 'Reviewer A',
    created: '20/09/2023',
    retentionPeriod: '3 Years',
    expiry: '20/09/2026',
    status: 'EXPIRING SOON',
    lastUpdated: '10/10/2023',
  },
  {
    id: 'DOC-1027',
    name: 'Old_Case_File.pdf',
    caseId: 'C-1010',
    type: 'Legal Notice',
    uploadedBy: 'Clerk M',
    created: '05/01/2015',
    retentionPeriod: '7 Years',
    expiry: '05/01/2022',
    status: 'ARCHIVED',
    lastUpdated: '06/01/2022',
  },
  {
    id: 'DOC-1028',
    name: 'Forensic_Analysis.pdf',
    caseId: 'C-1024',
    type: 'Forensic Report',
    uploadedBy: 'Officer A',
    created: '10/08/2026',
    retentionPeriod: '5 Years',
    expiry: '10/08/2031',
    status: 'ACTIVE',
    lastUpdated: '10/08/2026',
  }
];

export default function Retention() {
  const [documents, setDocuments] = useState<RetentionDoc[]>(initialDocs);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Expiring Soon' | 'Archived'>('All');
  
  const [toastMsg, setToastMsg] = useState('');
  const [toastVar, setToastVar] = useState<'success' | 'danger' | 'warning'>('success');
  
  const showToast = (msg: string, variant: 'success' | 'danger' | 'warning' = 'success') => {
    setToastMsg(msg);
    setToastVar(variant);
  };

  // Modals
  const [modalType, setModalType] = useState<'archive' | 'policy' | 'retentionPeriod' | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<RetentionDoc | null>(null);
  
  // State for Set Retention Period modal
  const [newRetention, setNewRetention] = useState('10 Years');
  const [customExpiry, setCustomExpiry] = useState('');

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      // Apply status filter
      if (filter === 'Active' && doc.status !== 'ACTIVE') return false;
      if (filter === 'Expiring Soon' && doc.status !== 'EXPIRING SOON') return false;
      if (filter === 'Archived' && doc.status !== 'ARCHIVED') return false;
      
      // Apply search
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !doc.name.toLowerCase().includes(q) &&
          !doc.caseId.toLowerCase().includes(q) &&
          !doc.id.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [documents, filter, search]);

  const stats = useMemo(() => {
    return {
      total: documents.length,
      active: documents.filter(d => d.status === 'ACTIVE').length,
      expiring: documents.filter(d => d.status === 'EXPIRING SOON').length,
      archived: documents.filter(d => d.status === 'ARCHIVED').length,
    };
  }, [documents]);

  const handleArchiveConfirm = () => {
    if (!selectedDoc) return;
    setDocuments(prev => prev.map(d => 
      d.id === selectedDoc.id ? { ...d, status: 'ARCHIVED' } : d
    ));
    showToast('Document archived successfully.', 'success');
    setModalType(null);
    setSelectedDoc(null);
  };

  const handleRetentionSave = () => {
    if (!selectedDoc) return;
    
    // Calculate new expiry (simulated simple calculation based on current year)
    let finalExpiry = '';
    if (newRetention === 'Custom') {
      finalExpiry = customExpiry || selectedDoc.expiry;
    } else {
      const yearsToAdd = parseInt(newRetention.split(' ')[0]) || 0;
      const createdDateParts = selectedDoc.created.split('/');
      if (createdDateParts.length === 3) {
        const [day, month, year] = createdDateParts;
        finalExpiry = `${day}/${month}/${parseInt(year) + yearsToAdd}`;
      } else {
        finalExpiry = 'Unknown';
      }
    }
    
    setDocuments(prev => prev.map(d => 
      d.id === selectedDoc.id ? { 
        ...d, 
        retentionPeriod: newRetention === 'Custom' ? 'Custom' : newRetention,
        expiry: finalExpiry,
        status: 'ACTIVE' // Reset status logic would ideally be real date diff, but resetting to ACTIVE for now
      } : d
    ));
    showToast('Retention period updated successfully.', 'success');
    setModalType(null);
    setSelectedDoc(null);
  };

  return (
    <div className={styles.retentionPage}>
      {toastMsg && <Toast message={toastMsg} variant={toastVar} onDone={() => setToastMsg('')} />}

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>
            <Archive size={24} className={styles.cardTitleIcon} />
            Retention & Archive
          </h1>
          <p className={styles.pageSubtitle}>Manage document retention periods, expiry dates, and archived records.</p>
        </div>
        <div>
          <button className={styles.btnSecondary} onClick={() => setModalType('policy')}>
            <FileText size={16} />
            View Retention Policy
          </button>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardHeader}>
            <FileText size={16} className={styles.summaryCardIcon} style={{ color: '#2563EB' }} />
            <span className={styles.summaryCardLabel}>Total Documents</span>
          </div>
          <p className={styles.summaryCardValue}>{stats.total}</p>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardHeader}>
            <CheckCircle2 size={16} className={styles.summaryCardIcon} style={{ color: '#16A34A' }} />
            <span className={styles.summaryCardLabel}>Active</span>
          </div>
          <p className={styles.summaryCardValue}>{stats.active}</p>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardHeader}>
            <AlertCircle size={16} className={styles.summaryCardIcon} style={{ color: '#F59E0B' }} />
            <span className={styles.summaryCardLabel}>Expiring Soon</span>
          </div>
          <p className={styles.summaryCardValue}>{stats.expiring}</p>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardHeader}>
            <FileArchive size={16} className={styles.summaryCardIcon} style={{ color: '#64748B' }} />
            <span className={styles.summaryCardLabel}>Archived</span>
          </div>
          <p className={styles.summaryCardValue}>{stats.archived}</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>DOCUMENT RETENTION</h2>
        </div>
        
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className={styles.toolbar} style={{ margin: 0, padding: 0, border: 'none', boxShadow: 'none' }}>
            <div className={styles.searchInput}>
              <Search />
              <input
                type="text"
                placeholder="Search documents by name or case ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <div className={styles.filterSelect}>
              <select value={filter} onChange={e => setFilter(e.target.value as any)}>
                <option value="All">All Documents</option>
                <option value="Active">Active</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Archived">Archived</option>
              </select>
              <ChevronDown />
            </div>

            <button 
              className={styles.clearBtn} 
              onClick={() => { setSearch(''); setFilter('All'); }}
            >
              <FilterX size={16} />
              Clear Filters
            </button>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Document</th>
                <th>Case ID</th>
                <th>Created</th>
                <th>Retention Period</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.noResults}>No documents found matching the current filters.</td>
                </tr>
              ) : (
                filteredDocs.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <a href="#" className={styles.docLink} onClick={e => e.preventDefault()}>{doc.name}</a>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{doc.id} · {doc.type}</span>
                      </div>
                    </td>
                    <td>{doc.caseId}</td>
                    <td>{doc.created}</td>
                    <td>{doc.retentionPeriod}</td>
                    <td>{doc.expiry}</td>
                    <td>
                      {doc.status === 'ACTIVE' && (
                        <span className={`${styles.badge} ${styles.badgeActive}`}>
                          <span className={styles.badgeDot}></span>
                          ACTIVE
                        </span>
                      )}
                      {doc.status === 'EXPIRING SOON' && (
                        <span className={`${styles.badge} ${styles.badgeExpiring}`}>
                          <span className={styles.badgeDot}></span>
                          EXPIRING SOON
                        </span>
                      )}
                      {doc.status === 'EXPIRED' && (
                        <span className={`${styles.badge} ${styles.badgeExpired}`}>
                          <span className={styles.badgeDot}></span>
                          EXPIRED
                        </span>
                      )}
                      {doc.status === 'ARCHIVED' && (
                        <span className={`${styles.badge} ${styles.badgeArchived}`}>
                          <span className={styles.badgeDot}></span>
                          ARCHIVED
                        </span>
                      )}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {doc.status !== 'ARCHIVED' && (
                          <button 
                            className={`${styles.actionBtn} ${styles.actionBtnGray}`}
                            onClick={() => { setSelectedDoc(doc); setModalType('archive'); }}
                          >
                            <Archive size={14} /> Archive
                          </button>
                        )}
                        <button 
                          className={`${styles.actionBtn} ${styles.actionBtnBlue}`}
                          onClick={() => { 
                            setSelectedDoc(doc); 
                            setNewRetention(doc.retentionPeriod);
                            setModalType('retentionPeriod'); 
                          }}
                        >
                          Set Retention
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Archive Modal */}
      {modalType === 'archive' && selectedDoc && (
        <div className={styles.modalOverlay} onClick={() => setModalType(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>Archive Document</h3>
              <button className={styles.modalCloseBtn} onClick={() => setModalType(null)}><X size={18} /></button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalMessage}>
                Are you sure you want to archive <strong>{selectedDoc.name}</strong>?
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                This will move the document to the archive storage. It will not be permanently deleted.
              </p>
            </div>
            <div className={styles.modalFoot}>
              <button className={styles.btnSecondary} onClick={() => setModalType(null)}>Cancel</button>
              <button className={styles.btnPrimary} onClick={handleArchiveConfirm}>Confirm Archive</button>
            </div>
          </div>
        </div>
      )}

      {/* Retention Policy Modal */}
      {modalType === 'policy' && (
        <div className={styles.modalOverlay} onClick={() => setModalType(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>DOCUMENT RETENTION POLICY</h3>
              <button className={styles.modalCloseBtn} onClick={() => setModalType(null)}><X size={18} /></button>
            </div>
            <div className={styles.modalBody}>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: 0 }}>
                <li>Documents must be retained according to their assigned retention period.</li>
                <li>Retention periods are based on document type and applicable policy.</li>
                <li>Documents must not be permanently deleted before the retention period expires.</li>
                <li>Archived documents remain available to authorized users.</li>
                <li>All retention and archive actions must be recorded in the audit log.</li>
              </ul>
            </div>
            <div className={styles.modalFoot}>
              <button className={styles.btnPrimary} onClick={() => setModalType(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Set Retention Period Modal */}
      {modalType === 'retentionPeriod' && selectedDoc && (
        <div className={styles.modalOverlay} onClick={() => setModalType(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>Set Retention Period</h3>
              <button className={styles.modalCloseBtn} onClick={() => setModalType(null)}><X size={18} /></button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827' }}>Document</span>
                <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>{selectedDoc.name}</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827' }}>Retention Period</label>
                <select 
                  className={styles.modalSelect} 
                  value={newRetention} 
                  onChange={e => setNewRetention(e.target.value)}
                >
                  <option value="1 Year">1 Year</option>
                  <option value="3 Years">3 Years</option>
                  <option value="5 Years">5 Years</option>
                  <option value="7 Years">7 Years</option>
                  <option value="10 Years">10 Years</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              {newRetention === 'Custom' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '1rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827' }}>Custom Expiry Date</label>
                  <input 
                    type="date" 
                    className={styles.modalInput}
                    value={customExpiry}
                    onChange={e => setCustomExpiry(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className={styles.modalFoot}>
              <button className={styles.btnSecondary} onClick={() => setModalType(null)}>Cancel</button>
              <button className={styles.btnPrimary} onClick={handleRetentionSave}>Save Retention Period</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
