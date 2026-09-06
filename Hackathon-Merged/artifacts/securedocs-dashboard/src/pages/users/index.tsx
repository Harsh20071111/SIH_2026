import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search,
  Users,
  UserCheck,
  ShieldCheck,
  ClipboardCheck,
  Plus,
  Pencil,
  UserCog,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import {
  defaultUsers,
  availableCases,
  userRoles,
  userDepartments,
  type UserData,
  type UserRole,
} from '@/lib/users-data';
import { useToast } from '@/hooks/use-toast';

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>(defaultUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All');

  // Modal states
  const [activeModalUser, setActiveModalUser] = useState<UserData | null>(null);
  const [modalType, setModalType] = useState<'role' | 'cases' | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Officer');
  const [selectedCases, setSelectedCases] = useState<string[]>([]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        search === '' ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.employeeId.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      const matchesDept = deptFilter === 'All' || u.department === deptFilter;

      return matchesSearch && matchesRole && matchesDept;
    });
  }, [users, search, roleFilter, deptFilter]);

  const openRoleModal = (user: UserData) => {
    setActiveModalUser(user);
    setSelectedRole(user.role);
    setModalType('role');
  };

  const openCasesModal = (user: UserData) => {
    setActiveModalUser(user);
    setSelectedCases([...user.assignedCases]);
    setModalType('cases');
  };

  const handleSaveRole = () => {
    if (!activeModalUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === activeModalUser.id ? { ...u, role: selectedRole } : u))
    );
    toast({
      title: 'Role Updated',
      description: `Role for ${activeModalUser.name} updated to ${selectedRole}.`,
    });
    setModalType(null);
  };

  const handleSaveCases = () => {
    if (!activeModalUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === activeModalUser.id ? { ...u, assignedCases: selectedCases } : u))
    );
    toast({
      title: 'Cases Assigned',
      description: `Case assignments updated for ${activeModalUser.name}.`,
    });
    setModalType(null);
  };

  const toggleCaseAssignment = (caseId: string) => {
    setSelectedCases((prev) =>
      prev.includes(caseId) ? prev.filter((c) => c !== caseId) : [...prev, caseId]
    );
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return 'border-[#174A7C]/40 text-[#174A7C] bg-[#174A7C]/10 font-bold';
      case 'Auditor':
        return 'border-[#2563A8]/40 text-[#2563A8] bg-[#2563A8]/10 font-semibold';
      case 'Legal Reviewer':
        return 'border-[#B77900]/40 text-[#B77900] bg-[#B77900]/10 font-semibold';
      default:
        return 'border-border text-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Administer personnel identities, SecureDocs roles, and case jurisdiction assignments.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Users</div>
              <div className="text-2xl font-bold text-foreground mt-1">{users.length}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Registered personnel</div>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Users size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#16803C] uppercase tracking-wider">Active Users</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {users.filter((u) => u.status === 'Active').length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Credentials active</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#16803C]/10 text-[#16803C]">
              <UserCheck size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#B77900] uppercase tracking-wider">Legal Reviewers</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {users.filter((u) => u.role === 'Legal Reviewer').length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Assigned to review queues</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#B77900]/10 text-[#B77900]">
              <ClipboardCheck size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#2563A8] uppercase tracking-wider">Auditors</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {users.filter((u) => u.role === 'Auditor').length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Independent monitors</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#2563A8]/10 text-[#2563A8]">
              <ShieldCheck size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">Personnel Registry</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Role-based access matrix and operational jurisdictions.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search name, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-8 text-xs rounded-md border border-border bg-card px-2.5 text-foreground"
              >
                <option value="All">All Roles</option>
                {userRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="h-8 text-xs rounded-md border border-border bg-card px-2.5 text-foreground"
              >
                <option value="All">All Departments</option>
                {userDepartments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold">User Details</TableHead>
                <TableHead className="text-xs font-semibold">Employee ID</TableHead>
                <TableHead className="text-xs font-semibold">Role</TableHead>
                <TableHead className="text-xs font-semibold">Department</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">Assigned Cases</TableHead>
                <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    No users match the search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{u.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{u.email}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{u.employeeId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-foreground">{u.department}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          u.status === 'Active'
                            ? 'bg-[#16803C]/10 text-[#16803C]'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {u.assignedCases.length > 0 ? (
                        <span className="font-mono text-[11px]">{u.assignedCases.join(', ')}</span>
                      ) : (
                        <span className="text-muted-foreground/60">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openRoleModal(u)}
                          className="h-7 px-2 text-xs text-primary hover:bg-primary/10"
                          title="Change Role"
                        >
                          <UserCog className="h-3.5 w-3.5 mr-1" /> Role
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCasesModal(u)}
                          className="h-7 px-2 text-xs text-primary hover:bg-primary/10"
                          title="Assign Cases"
                        >
                          <Briefcase className="h-3.5 w-3.5 mr-1" /> Cases
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Assignment Modal */}
      {modalType === 'role' && activeModalUser && (
        <Dialog open={true} onOpenChange={() => setModalType(null)}>
          <DialogContent className="max-w-md border border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">Assign Role</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update system authorization role for <strong>{activeModalUser.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-3">
              {userRoles.map((role) => (
                <label
                  key={role}
                  className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all ${
                    selectedRole === role
                      ? 'border-primary bg-primary/5 text-foreground font-semibold'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span className="text-xs">{role}</span>
                  <input
                    type="radio"
                    name="roleSelection"
                    checked={selectedRole === role}
                    onChange={() => setSelectedRole(role)}
                    className="accent-primary"
                  />
                </label>
              ))}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => setModalType(null)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveRole}
                className="bg-primary text-primary-foreground hover:bg-[#123A61] h-8 text-xs"
              >
                Save Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Case Assignment Modal */}
      {modalType === 'cases' && activeModalUser && (
        <Dialog open={true} onOpenChange={() => setModalType(null)}>
          <DialogContent className="max-w-md border border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">Assign Cases</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Select cases accessible by <strong>{activeModalUser.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-3">
              {availableCases.map((c) => {
                const assigned = selectedCases.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleCaseAssignment(c.id)}
                    className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all ${
                      assigned
                        ? 'border-primary bg-primary/5 text-foreground font-semibold'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{c.label}</div>
                      <div className="font-mono text-[10px] text-primary">{c.id}</div>
                    </div>
                    {assigned && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </div>
                );
              })}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => setModalType(null)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveCases}
                className="bg-primary text-primary-foreground hover:bg-[#123A61] h-8 text-xs"
              >
                Save Assignments
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
