import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, UserCog } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchUsers() {
      if (user?.role === 'Admin') {
        try {
          const res = await api.get<{ data: any[] }>('/users');
          setUsers(res.data || []);
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    }
    fetchUsers();
  }, [user]);

  if (user?.role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <UserCog className="h-16 w-16 text-slate-300" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-slate-500">Only administrators can manage users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">Manage user accounts and roles.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>All registered users in SecureDocs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Search users..." className="pl-9" />
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Loading users...</TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-slate-500">No users found.</TableCell></TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        u.role === 'Admin' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                        u.role === 'Officer' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        'bg-slate-100 text-slate-800 border-slate-200'
                      }>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{u.department || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? 'default' : 'secondary'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
