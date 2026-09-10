import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Search, ChevronDown, Users, UserCheck, ShieldCheck, ClipboardCheck,
  Plus, Pencil, Ban, UserCog, Briefcase, KeyRound, X, CheckCircle2,
  RotateCw, Loader2, Eye, EyeOff, FileText, ExternalLink,
} from 'lucide-react';
import {
  defaultUsers, availableCases, userRoles, userDepartments,
  type UserData, type UserRole, type UserStatus,
} from '@/lib/users-data';
import { userService } from '@/services/userService';
import type { Role } from '@/lib/mock-data';
import styles from './users.module.css';

/* ----------------------------------------------------------------
   Toast
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
   Assign Role Modal
   ---------------------------------------------------------------- */
function AssignRoleModal({
  user, onClose, onConfirm,
}: { user: UserData; onClose: () => void; onConfirm: (role: UserRole) => void }) {
  const [role, setRole] = useState<UserRole>(user.role);
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h3 className={styles.modalTitle}>Assign Role — {user.name}</h3>
          <button className={styles.modalCloseBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.modalMessage}>Select a new role for this user.</p>
          <select className={styles.modalSelect} value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            {userRoles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className={styles.modalFoot}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button className={styles.btnPrimary} onClick={() => onConfirm(role)}>Assign Role</button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Assign Cases Modal
   ---------------------------------------------------------------- */
function AssignCasesModal({
  user, onClose, onConfirm,
}: { user: UserData; onClose: () => void; onConfirm: (cases: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([...user.assignedCases]);

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h3 className={styles.modalTitle}>Assign Cases — {user.name}</h3>
          <button className={styles.modalCloseBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.modalMessage}>Select cases this user is authorized to access.</p>
          <div className={styles.checkboxList}>
            {availableCases.map((c) => (
              <label key={c.id} className={styles.checkboxItem}>
                <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} />
                <span>
                  <span className={styles.checkboxLabel}>{c.id}</span>
                  <span className={styles.checkboxSub}> — {c.label}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className={styles.modalFoot}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button className={styles.btnPrimary} onClick={() => onConfirm(selected)}>
            Save ({selected.length} cases)
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Confirm Modal (Disable / Reset Password)
   ---------------------------------------------------------------- */
function ConfirmModal({
  title, message, confirmLabel, variant, onClose, onConfirm,
}: {
  title: string; message: string; confirmLabel: string;
  variant: 'danger' | 'warning'; onClose: () => void; onConfirm: () => void;
}) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.modalCloseBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.modalMessage}>{message}</p>
        </div>
        <div className={styles.modalFoot}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button className={variant === 'danger' ? styles.btnDanger : styles.btnWarning} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Set / Reset Password Modal (Admin)
   ---------------------------------------------------------------- */
function SetPasswordModal({
  user, onClose, onConfirm,
}: {
  user: UserData;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState('SecureDocs@2026');
  const [showPassword, setShowPassword] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let res = '';
    for (let i = 0; i < 12; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setError('');
  };

  const handleSave = async () => {
    if (!password || password.trim().length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm(password.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h3 className={styles.modalTitle}>Set Password — {user.name}</h3>
          <button className={styles.modalCloseBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.modalMessage} style={{ marginBottom: '1rem' }}>
            Set a credentials password for <strong>{user.email || user.name}</strong> ({user.employeeId}).
            Since users cannot self-register or change passwords automatically, the password you set here will be their active login password.
          </p>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-main)' }}>
              New Password <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className={styles.formInput}
                style={{ width: '100%', paddingRight: '40px' }}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <span className={styles.formError} style={{ display: 'block', marginTop: '4px' }}>{error}</span>}
          </div>

          {/* Quick presets */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <button
              type="button"
              onClick={generateRandomPassword}
              style={{
                fontSize: '0.75rem',
                padding: '0.3rem 0.6rem',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                background: '#F1F5F9',
                color: '#334155',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              🎲 Generate Strong Password
            </button>
            <button
              type="button"
              onClick={() => { setPassword('SecureDocs@2026'); setError(''); }}
              style={{
                fontSize: '0.75rem',
                padding: '0.3rem 0.6rem',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                background: '#F1F5F9',
                color: '#334155',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Default: SecureDocs@2026
            </button>
          </div>
        </div>
        <div className={styles.modalFoot}>
          <button className={styles.btnSecondary} onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button className={styles.btnPrimary} onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Set Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   View Verification Documents Modal
   ---------------------------------------------------------------- */
function ViewDocsModal({
  user, onClose,
}: { user: UserData; onClose: () => void }) {
  const docs = user.verificationDocuments || [];
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className={styles.modalHead}>
          <h3 className={styles.modalTitle}>Verification Documents — {user.name}</h3>
          <button className={styles.modalCloseBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.modalMessage} style={{ marginBottom: '1rem' }}>
            ID and government verification documents submitted for <strong>{user.name}</strong> ({user.employeeId}).
          </p>
          {docs.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>No documents uploaded for this user.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {docs.map((docUrl, idx) => {
                const fileName = docUrl.split('/').pop()?.split('?')[0] || `Document ${idx + 1}`;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#F8FAFC',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <FileText size={18} style={{ color: '#2563EB', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {decodeURIComponent(fileName)}
                      </span>
                    </div>
                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.btnSecondary}
                      style={{
                        padding: '4px 10px',
                        fontSize: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        textDecoration: 'none',
                      }}
                    >
                      <ExternalLink size={12} /> View / Download
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className={styles.modalFoot}>
          <button className={styles.btnPrimary} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

import { useAuth } from '@/context/AuthContext';
import AccessDenied from '@/pages/access-denied';

/* ----------------------------------------------------------------
   Main Page
   ---------------------------------------------------------------- */
export default function UserManagement({ role }: { role: Role }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const currentRole = user?.role || role;
  if (currentRole !== 'Admin' && currentRole !== 'Legal Reviewer') {
    return <AccessDenied />;
  }
  const isLegalReviewer = currentRole === 'Legal Reviewer';

  const [users, setUsers] = useState<UserData[]>(() => isLegalReviewer ? [] : userService.getCachedUsers());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'All'>('All');

  // Modal state
  const [modalType, setModalType] = useState<'assignRole' | 'assignCases' | 'disable' | 'enable' | 'resetPw' | 'viewDocs' | null>(null);
  const [modalUser, setModalUser] = useState<UserData | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'danger' | 'warning' } | null>(null);

  const showToast = useCallback((message: string, variant: 'success' | 'danger' | 'warning' = 'success') => {
    setToast({ message, variant });
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = isLegalReviewer ? await userService.getPendingUsers() : await userService.getUsers();
      setUsers(data);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoading(false);
    }
  }, [isLegalReviewer]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Filtered list
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch = u.name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.employeeId.toLowerCase().includes(q);
      const matchRole = roleFilter === 'All' || u.role === roleFilter;
      const matchDept = deptFilter === 'All' || u.department === deptFilter;
      const matchStatus = statusFilter === 'All' || u.status === statusFilter;
      return matchSearch && matchRole && matchDept && matchStatus;
    });
  }, [users, search, roleFilter, deptFilter, statusFilter]);

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'Active').length;
  const reviewers = users.filter((u) => u.role === 'Reviewer' || u.role === 'Legal Reviewer').length;
  const auditors = users.filter((u) => u.role === 'Auditor').length;

  // Handlers
  const openModal = (type: typeof modalType, user: UserData) => {
    setModalType(type);
    setModalUser(user);
  };

  const handleDisable = async () => {
    if (!modalUser) return;
    try {
      await userService.updateUser(modalUser.id, { status: 'Disabled' });
      setUsers((prev) => prev.map((u) =>
        u.id === modalUser.id ? { ...u, status: 'Disabled' as const } : u
      ));
      showToast(`${modalUser.name} has been disabled.`, 'danger');
    } catch (e: any) {
      showToast(e.message || 'Failed to disable user.', 'danger');
    }
    setModalType(null);
  };

  const handleEnable = async () => {
    if (!modalUser) return;
    try {
      await userService.updateUser(modalUser.id, { status: 'Active' });
      setUsers((prev) => prev.map((u) =>
        u.id === modalUser.id ? { ...u, status: 'Active' as const } : u
      ));
      showToast(`${modalUser.name} has been re-enabled.`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to enable user.', 'danger');
    }
    setModalType(null);
  };

  const handleSetPassword = async (newPassword: string) => {
    if (!modalUser) return;
    try {
      const res = await userService.resetPassword(modalUser.id, newPassword);
      showToast(res.message || `Password successfully updated for ${modalUser.name}.`, 'success');
      setModalType(null);
    } catch (e: any) {
      showToast(e.message || 'Failed to update password.', 'danger');
    }
  };

  const handleAssignRole = async (newRole: UserRole) => {
    if (!modalUser) return;
    try {
      await userService.updateUser(modalUser.id, { role: newRole });
      setUsers((prev) => prev.map((u) =>
        u.id === modalUser.id ? { ...u, role: newRole } : u
      ));
      showToast(`Role updated to ${newRole} for ${modalUser.name}.`);
    } catch (e: any) {
      showToast(e.message || 'Failed to update role.', 'danger');
    }
    setModalType(null);
  };

  const handleAssignCases = async (cases: string[]) => {
    if (!modalUser) return;
    try {
      await userService.updateUser(modalUser.id, { assignedCases: cases });
      setUsers((prev) => prev.map((u) =>
        u.id === modalUser.id ? { ...u, assignedCases: cases } : u
      ));
      showToast(`Assigned ${cases.length} cases to ${modalUser.name}.`);
    } catch (e: any) {
      showToast(e.message || 'Failed to assign cases.', 'danger');
    }
    setModalType(null);
  };

  const handleApprove = async (id: string) => {
    try {
      await userService.approveUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast('User approved successfully.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to approve user.', 'danger');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await userService.rejectUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast('User rejected successfully.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to reject user.', 'danger');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className={styles.usersPage}>
      {/* Toast */}
      {toast && <Toast message={toast.message} variant={toast.variant} onDone={() => setToast(null)} />}

      {/* Modals */}
      {modalType === 'assignRole' && modalUser && (
        <AssignRoleModal user={modalUser} onClose={() => setModalType(null)} onConfirm={handleAssignRole} />
      )}
      {modalType === 'assignCases' && modalUser && (
        <AssignCasesModal user={modalUser} onClose={() => setModalType(null)} onConfirm={handleAssignCases} />
      )}
      {modalType === 'disable' && modalUser && (
        <ConfirmModal
          title={`Disable ${modalUser.name}?`}
          message={`Are you sure you want to disable ${modalUser.name}? They will lose access to all assigned cases.`}
          confirmLabel="Disable User"
          variant="danger"
          onClose={() => setModalType(null)}
          onConfirm={handleDisable}
        />
      )}
      {modalType === 'enable' && modalUser && (
        <ConfirmModal
          title={`Enable ${modalUser.name}?`}
          message={`Re-enable ${modalUser.name}'s access to the system?`}
          confirmLabel="Enable User"
          variant="warning"
          onClose={() => setModalType(null)}
          onConfirm={handleEnable}
        />
      )}
      {modalType === 'resetPw' && modalUser && (
        <SetPasswordModal
          user={modalUser}
          onClose={() => setModalType(null)}
          onConfirm={handleSetPassword}
        />
      )}
      {modalType === 'viewDocs' && modalUser && (
        <ViewDocsModal
          user={modalUser}
          onClose={() => setModalType(null)}
        />
      )}

      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>{isLegalReviewer ? 'Pending Approvals' : 'User Management'}</h1>
          <span className={styles.pageSubtitle}>
            {isLegalReviewer ? 'Review and approve new user accounts' : 'Manage system access and roles'}
          </span>
        </div>
        {!isLegalReviewer && (
          <div className={styles.pageHeaderRight}>
            <Link href="/users/add" className={styles.btnPrimary} style={{ textDecoration: 'none' }}>
              <Plus size={16} style={{ marginRight: '6px' }} /> Add New User
            </Link>
          </div>
        )}
      </div>

      {/* Summary cards */}
      {!isLegalReviewer && (
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryCardHeader}>
              <Users size={16} className={styles.summaryCardIcon} />
            <span className={styles.summaryCardLabel}>Total Users</span>
          </div>
          <p className={styles.summaryCardValue}>{totalUsers}</p>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardHeader}>
            <UserCheck size={16} className={styles.summaryCardIcon} />
            <span className={styles.summaryCardLabel}>Active Users</span>
          </div>
          <p className={styles.summaryCardValue}>{activeUsers}</p>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardHeader}>
            <ClipboardCheck size={16} className={styles.summaryCardIcon} />
            <span className={styles.summaryCardLabel}>Reviewers</span>
          </div>
          <p className={styles.summaryCardValue}>{reviewers}</p>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardHeader}>
            <ShieldCheck size={16} className={styles.summaryCardIcon} />
            <span className={styles.summaryCardLabel}>Auditors</span>
          </div>
          <p className={styles.summaryCardValue}>{auditors}</p>
        </div>
      </div>
    )}

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchInput}>
          <Search />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterSelect}>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)}>
            <option value="All">All Roles</option>
            {userRoles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <ChevronDown />
        </div>

        <div className={styles.filterSelect}>
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="All">All Departments</option>
            {userDepartments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown />
        </div>

        <div className={styles.filterSelect}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Disabled">Disabled</option>
          </select>
          <ChevronDown />
        </div>

        <button
          type="button"
          onClick={loadUsers}
          className={styles.btnSecondary}
          title="Refresh user list from database"
          style={{ height: '38px', padding: '0 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>

        {!isLegalReviewer && (
          <Link href="/users/new" className={styles.addBtn} style={{ textDecoration: 'none' }}>
            <Plus size={16} /> Add User
          </Link>
        )}
      </div>

      {/* Users table */}
      <div className={styles.card}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>{isLegalReviewer ? 'Approval Status' : 'Status & Approval'}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.noResults} style={{ padding: '3rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-text-secondary)' }}>
                      <Loader2 size={20} className="animate-spin text-blue-600" />
                      <span>Loading users from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.noResults}>
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className={styles.userName}>
                        <span className={styles.userAvatar}>{getInitials(u.name)}</span>
                        <div>
                          <div>{u.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{u.employeeId} · {u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.role}</td>
                    <td>{u.department}</td>
                    <td>
                      {isLegalReviewer ? (
                        <span className={`${styles.badge} ${u.approvalStatus === 'Pending' ? styles.badgeWarning : u.approvalStatus === 'Approved' ? styles.badgeActive : styles.badgeDisabled}`}>
                          <span className={styles.badgeDot} />
                          {u.approvalStatus || 'Pending'}
                        </span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className={`${styles.badge} ${u.status === 'Active' ? styles.badgeActive : styles.badgeDisabled}`}>
                            <span className={styles.badgeDot} />
                            {u.status}
                          </span>
                          {u.approvalStatus && u.approvalStatus !== 'Approved' && (
                            <span className={`${styles.badge} ${u.approvalStatus === 'Pending' ? styles.badgeWarning : styles.badgeDisabled}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                              <span className={styles.badgeDot} />
                              {u.approvalStatus}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {isLegalReviewer ? (
                          <>
                            {u.verificationDocuments && u.verificationDocuments.length > 0 && (
                              <button
                                className={`${styles.actionBtn} ${styles.actionBtnBlue}`}
                                onClick={() => openModal('viewDocs', u)}
                                title="View Documents"
                              >
                                <FileText size={12} /> View Docs ({u.verificationDocuments.length})
                              </button>
                            )}
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnGreen}`}
                              onClick={() => handleApprove(u.id)}
                              title="Approve"
                            >
                              <CheckCircle2 size={12} /> Approve
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnRed}`}
                              onClick={() => handleReject(u.id)}
                              title="Reject"
                            >
                              <Ban size={12} /> Reject
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnBlue}`}
                              onClick={() => navigate(`/users/${u.id}/edit`)}
                              title="Edit"
                            >
                              <Pencil size={12} /> Edit
                            </button>
                            {u.status === 'Active' ? (
                              <button
                                className={`${styles.actionBtn} ${styles.actionBtnRed}`}
                                onClick={() => openModal('disable', u)}
                                title="Disable"
                              >
                                <Ban size={12} /> Disable
                              </button>
                            ) : (
                              <button
                                className={`${styles.actionBtn} ${styles.actionBtnBlue}`}
                                onClick={() => openModal('enable', u)}
                                title="Enable"
                              >
                                <UserCheck size={12} /> Enable
                              </button>
                            )}
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnBlue}`}
                              onClick={() => openModal('assignRole', u)}
                              title="Assign Role"
                            >
                              <UserCog size={12} /> Assign Role
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnBlue}`}
                              onClick={() => openModal('assignCases', u)}
                              title="Assign Cases"
                            >
                              <Briefcase size={12} /> Assign Cases
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnAmber}`}
                              onClick={() => openModal('resetPw', u)}
                              title="Reset Password"
                            >
                              <KeyRound size={12} /> Reset Password
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
