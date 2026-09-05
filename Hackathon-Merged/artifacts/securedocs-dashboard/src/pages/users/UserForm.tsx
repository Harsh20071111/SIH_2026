import { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import {
  ArrowLeft, User, Briefcase, ShieldCheck, CheckCircle2, X,
} from 'lucide-react';
import {
  availableCases, getUserById, userRoles, userDepartments, userStatuses,
  type UserRole, type UserDepartment, type UserStatus,
} from '@/lib/users-data';
import styles from './users.module.css';

/* ----------------------------------------------------------------
   Toast
   ---------------------------------------------------------------- */
function Toast({ message, variant, onDone }: { message: string; variant: 'success' | 'danger'; onDone: () => void }) {
  useState(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); });
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
}

/* ----------------------------------------------------------------
   UserForm (Add / Edit)
   ---------------------------------------------------------------- */
export default function UserForm() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const isEdit = !!params.id;
  const existingUser = isEdit ? getUserById(params.id) : null;

  // Form state
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState<UserDepartment | ''>('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [status, setStatus] = useState<UserStatus>('Active');
  const [assignedCases, setAssignedCases] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'danger' } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill for edit mode
  useEffect(() => {
    if (existingUser) {
      setName(existingUser.name);
      setEmployeeId(existingUser.employeeId);
      setEmail(existingUser.email);
      setDepartment(existingUser.department);
      setRole(existingUser.role);
      setStatus(existingUser.status);
      setAssignedCases([...existingUser.assignedCases]);
    }
  }, [existingUser]);

  const toggleCase = (id: string) => {
    setAssignedCases((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  // Access level computed from role
  const accessLevel = useMemo(() => {
    switch (role) {
      case 'Administrator': return 'Full Access';
      case 'Reviewer': return 'Review & Read';
      case 'Auditor': return 'Audit & Read';
      case 'Officer': return 'Case Access';
      default: return '—';
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!validate()) return;

    const msg = isEdit ? 'User updated successfully' : 'User created successfully';
    setToast({ message: msg, variant: 'success' });

    // Navigate back after a short delay so the toast is visible
    setTimeout(() => navigate('/users'), 1200);
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
            <button className={styles.btnPrimary} onClick={handleSubmit}>
              {isEdit ? 'Update User' : 'Save User'}
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
