import { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import {
  ArrowLeft, User, Briefcase, ShieldCheck, CheckCircle2, X, Eye, EyeOff,
} from 'lucide-react';
import {
  availableCases, userRoles, userDepartments, userStatuses,
  type UserRole, type UserDepartment, type UserStatus,
} from '@/lib/users-data';
import { userService } from '@/services/userService';
import styles from './users.module.css';

/* ----------------------------------------------------------------
   Toast
   ---------------------------------------------------------------- */
function Toast({ message, variant, onDone }: { message: string; variant: 'success' | 'danger'; onDone: () => void }) {
  useState(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); });
  const cls = variant === 'success' ? styles.toastSuccess : styles.toastDanger;
  return (
    <div className={`${styles.toast} ${cls}`}>
      <CheckCircle2 size={16} />
      {message}
    </div>
  );
}

/* ----------------------------------------------------------------
   Field errors
   ---------------------------------------------------------------- */
interface FormErrors {
  name?: string;
  employeeId?: string;
  email?: string;
  department?: string;
  role?: string;
  password?: string;
}

/* ----------------------------------------------------------------
   UserForm (Add / Edit)
   ---------------------------------------------------------------- */
export default function UserForm() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const isEdit = !!params.id;

  // Form state
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState<UserDepartment | ''>('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [status, setStatus] = useState<UserStatus>('Active');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [assignedCases, setAssignedCases] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'danger' } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);

  // Pre-fill for edit mode
  useEffect(() => {
    let mounted = true;
    if (isEdit && params.id) {
      userService.getUserById(params.id).then((u) => {
        if (!mounted || !u) return;
        setName(u.name || '');
        setEmployeeId(u.employeeId || '');
        setEmail(u.email || '');
        setDepartment((u.department || '') as UserDepartment);
        setRole((u.role || '') as UserRole);
        setStatus(u.status || 'Active');
        setAssignedCases([...(u.assignedCases || [])]);
      });
    }
    return () => {
      mounted = false;
    };
  }, [isEdit, params.id]);

  const toggleCase = (id: string) => {
    setAssignedCases((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  // Access level computed from role
  const accessLevel = useMemo(() => {
    switch (role) {
      case 'Admin':
      case 'Administrator':
        return 'Full Access';
      case 'Legal Reviewer':
      case 'Reviewer':
        return 'Review & Read';
      case 'Auditor':
        return 'Audit & Read';
      case 'Officer':
        return 'Case Access';
      case 'Clerk':
        return 'Filing & Upload Access';
      default:
        return '—';
    }
  }, [role]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email';
    if (!department) newErrors.department = 'Select a department';
    if (!role) newErrors.role = 'Select a role';
    if (password.trim() && password.trim().length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEdit && params.id) {
        await userService.updateUser(params.id, {
          name,
          employeeId,
          email,
          department: department as UserDepartment,
          role: role as UserRole,
          status,
          assignedCases,
          password: password.trim() ? password.trim() : undefined,
        });
        setToast({
          message: password.trim()
            ? 'User details and password updated successfully'
            : 'User updated successfully',
          variant: 'success',
        });
      } else {
        await userService.createUser({
          name,
          employeeId,
          email,
          department: department as UserDepartment,
          role: role as UserRole,
          password: password.trim() || 'SecureDocs@2026',
          status,
          assignedCases,
          documents: documents.length > 0 ? documents : undefined,
        });
        setToast({ message: 'User created successfully', variant: 'success' });
      }

      // Navigate back after toast is visible
      setTimeout(() => navigate('/users'), 1000);
    } catch (err: any) {
      console.error('Submit user error:', err);
      setToast({
        message: err.message || 'Failed to save user. Please verify your input.',
        variant: 'danger',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.usersPage}>
      {/* Toast */}
      {toast && <Toast message={toast.message} variant={toast.variant} onDone={() => setToast(null)} />}

      {/* Back link */}
      <Link href="/users" className={styles.backLink}>
        <ArrowLeft size={15} /> Back to User Management
      </Link>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>{isEdit ? 'Edit User' : 'Add New User'}</h1>
          <span className={styles.pageSubtitle}>
            {isEdit ? 'Update user information and access permissions' : 'Create an authorized user and assign access permissions'}
          </span>
        </div>
      </div>

      {/* Main layout: form left, summary right */}
      <div className={styles.formLayout}>
        <div className={styles.formLeftColumn}>
          {/* User Information Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <User size={17} className={styles.cardTitleIcon} />
              <div>
                <h2 className={styles.cardTitle}>User Information</h2>
                <p className={styles.cardSubtitle}>Basic account details</p>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGrid}>
                {/* Name */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Name <span className={styles.formRequired}>*</span>
                  </label>
                  <input
                    className={`${styles.formInput} ${submitted && errors.name ? styles.formInputError : ''}`}
                    type="text"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (submitted) validate(); }}
                  />
                  {submitted && errors.name && <span className={styles.formError}>{errors.name}</span>}
                </div>

                {/* Employee ID */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Employee ID <span className={styles.formRequired}>*</span>
                  </label>
                  <input
                    className={`${styles.formInput} ${submitted && errors.employeeId ? styles.formInputError : ''}`}
                    type="text"
                    placeholder="Enter employee ID"
                    value={employeeId}
                    onChange={(e) => { setEmployeeId(e.target.value); if (submitted) validate(); }}
                  />
                  {submitted && errors.employeeId && <span className={styles.formError}>{errors.employeeId}</span>}
                </div>

                {/* Email */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Email <span className={styles.formRequired}>*</span>
                  </label>
                  <input
                    className={`${styles.formInput} ${submitted && errors.email ? styles.formInputError : ''}`}
                    type="email"
                    placeholder="Enter official email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (submitted) validate(); }}
                  />
                  {submitted && errors.email && <span className={styles.formError}>{errors.email}</span>}
                </div>

                {/* Department */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Department <span className={styles.formRequired}>*</span>
                  </label>
                  <select
                    className={`${styles.formSelect} ${submitted && errors.department ? styles.formInputError : ''}`}
                    value={department}
                    onChange={(e) => { setDepartment(e.target.value as UserDepartment); if (submitted) validate(); }}
                  >
                    <option value="">Select department</option>
                    {userDepartments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {submitted && errors.department && <span className={styles.formError}>{errors.department}</span>}
                </div>

                {/* Role */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Role <span className={styles.formRequired}>*</span>
                  </label>
                  <select
                    className={`${styles.formSelect} ${submitted && errors.role ? styles.formInputError : ''}`}
                    value={role}
                    onChange={(e) => { setRole(e.target.value as UserRole); if (submitted) validate(); }}
                  >
                    <option value="">Select role</option>
                    {userRoles.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {submitted && errors.role && <span className={styles.formError}>{errors.role}</span>}
                </div>

                {/* Status */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Status</label>
                  <select
                    className={styles.formSelect}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as UserStatus)}
                  >
                    {userStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Password (only for new users or optional for edit) */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {isEdit ? 'New Password (Optional)' : 'Initial Password'}
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 'normal', marginLeft: '6px' }}>
                      {isEdit ? '(leave blank to keep unchanged)' : '(default: SecureDocs@2026)'}
                    </span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className={`${styles.formInput} ${submitted && errors.password ? styles.formInputError : ''}`}
                      type={showPassword ? 'text' : 'password'}
                      placeholder={isEdit ? 'Enter new password' : 'Enter password (or leave blank for default)'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (submitted) validate(); }}
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
                  {submitted && errors.password && <span className={styles.formError}>{errors.password}</span>}
                </div>

                {/* Verification Documents (New Users Only) */}
                {!isEdit && (
                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.formLabel}>
                      Verification Documents (ID Proof, etc.)
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 'normal', marginLeft: '6px' }}>
                        (Optional, helps with legal review)
                      </span>
                    </label>
                    <input
                      type="file"
                      multiple
                      className={styles.formInput}
                      onChange={(e) => {
                        if (e.target.files) {
                          setDocuments(Array.from(e.target.files));
                        }
                      }}
                    />
                    {documents.length > 0 && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        Selected: {documents.map(d => d.name).join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Case Assignment Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Briefcase size={17} className={styles.cardTitleIcon} />
              <div>
                <h2 className={styles.cardTitle}>Case Assignment</h2>
                <p className={styles.cardSubtitle}>Assign cases that this user is authorized to access</p>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.casesList}>
                {availableCases.map((c) => {
                  const checked = assignedCases.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className={`${styles.caseCheckbox} ${checked ? styles.caseCheckboxActive : ''}`}
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggleCase(c.id)} />
                      <div>
                        <div className={styles.caseId}>{c.id}</div>
                        <div className={styles.caseName}>{c.label}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
              <div className={styles.casesCount}>
                {assignedCases.length} of {availableCases.length} cases assigned
              </div>
            </div>
          </div>

          {/* Form footer */}
          <div className={styles.formFooter}>
            <Link href="/users" className={styles.btnSecondary} style={{ textDecoration: 'none' }}>
              Cancel
            </Link>
            <button className={styles.btnPrimary} onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Update User' : 'Save User'}
            </button>
          </div>
        </div>

        {/* Right column — Access Summary */}
        <div>
          <div className={styles.accessSummary}>
            <div className={styles.cardHeader}>
              <ShieldCheck size={17} className={styles.cardTitleIcon} />
              <h2 className={styles.cardTitle}>Access Summary</h2>
            </div>
            <div className={styles.summaryList}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>User Role</span>
                <span className={styles.summaryItemValue}>{role || '—'}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>Department</span>
                <span className={styles.summaryItemValue}>{department || '—'}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>Account Status</span>
                <span className={`${styles.summaryItemValue} ${status === 'Active' ? styles.summaryItemValueGreen : styles.summaryItemValueRed}`}>
                  {status}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>Assigned Cases</span>
                <span className={styles.summaryItemValue}>{assignedCases.length}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>Access Level</span>
                <span className={styles.summaryItemValue}>{accessLevel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
