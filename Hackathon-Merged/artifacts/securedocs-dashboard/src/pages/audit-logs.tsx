import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Shield, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [chainStatus, setChainStatus] = useState<any>(null);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    async function fetchLogs() {
      if (user?.role === 'Admin' || user?.role === 'Auditor') {
        try {
          const res = await api.get<{ data: any[] }>('/audit');
          setLogs(res.data || []);
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    }
    fetchLogs();
  }, [user]);

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter(log =>
      (log.userName || '').toLowerCase().includes(q) ||
      (log.action || '').toLowerCase().includes(q) ||
      (log.userRole || '').toLowerCase().includes(q) ||
      (log.documentId || '').toLowerCase().includes(q) ||
      (log.caseId || '').toLowerCase().includes(q) ||
      (log.ipAddress || '').toLowerCase().includes(q) ||
      (log.result || '').toLowerCase().includes(q)
    );
  }, [logs, search]);

  const verifyChain = async () => {
    setVerifying(true);
    try {
      const res = await api.get<any>('/audit/verify-chain');
      setChainStatus(res);
    } catch (e) {
      console.error(e);
      setChainStatus({ valid: false, error: 'Failed to verify chain' });
    }
    setVerifying(false);
  };

  if (user?.role !== 'Admin' && user?.role !== 'Auditor') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <Shield className="h-16 w-16 text-slate-300" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-slate-500">Only authorized personnel can view audit logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Audit Logs</h1>
          <p className="text-slate-500 mt-1">Immutable, tamper-evident record of all system activity.</p>
        </div>
        <Button onClick={verifyChain} disabled={verifying} className="bg-blue-600 hover:bg-blue-700">
          <ShieldCheck className="mr-2 h-4 w-4" />
          {verifying ? 'Verifying...' : 'Verify Cryptographic Chain'}
        </Button>
      </div>

      {chainStatus && (
        <Card className={chainStatus.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="pt-6">
            <div className="flex items-center">
              {chainStatus.valid ? (
                <ShieldCheck className="h-6 w-6 text-green-600 mr-3" />
              ) : (
                <Shield className="h-6 w-6 text-red-600 mr-3" />
              )}
              <div>
                <h3 className={`font-semibold ${chainStatus.valid ? 'text-green-900' : 'text-red-900'}`}>
                  {chainStatus.valid ? 'Audit Chain Intact' : 'Audit Chain Compromised'}
                </h3>
                <p className={`text-sm ${chainStatus.valid ? 'text-green-700' : 'text-red-700'}`}>
                  {chainStatus.valid
                    ? `Successfully verified ${chainStatus.checkedEvents ?? chainStatus.checkedCount ?? 0} sequential events with SHA-256 chaining.`
                    : `Hash mismatch detected. The audit trail may have been tampered with. ${chainStatus.error || ''}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Activity Trail</CardTitle>
          <CardDescription>
            Chronological list of security and access events.
            {logs.length > 0 && !search && (
              <span className="ml-2 text-slate-400">({logs.length} entries)</span>
            )}
            {search && (
              <span className="ml-2 text-slate-400">({filteredLogs.length} of {logs.length} entries)</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by user, action, case, document..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Loading logs...</TableCell></TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500">
                    {search ? 'No logs match your search.' : 'No audit logs found.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{log.userName || '—'}</div>
                      <div className="text-xs text-slate-500">{log.userRole || ''}</div>
                    </TableCell>
                    <TableCell className="text-sm">{log.action}</TableCell>
                    <TableCell>
                      {log.documentId && <div className="text-xs">Doc: {log.documentId}</div>}
                      {log.caseId && <div className="text-xs">Case: {log.caseId}</div>}
                      {!log.documentId && !log.caseId && <span className="text-xs text-slate-400">System</span>}
                    </TableCell>
                    <TableCell className="text-xs font-mono">{log.ipAddress || 'Internal'}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          log.result === 'Success' || log.result === 'Verified'
                            ? 'text-green-600 border-green-200 bg-green-50'
                            : 'text-red-600 border-red-200 bg-red-50'
                        }
                      >
                        {log.result}
                      </Badge>
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
