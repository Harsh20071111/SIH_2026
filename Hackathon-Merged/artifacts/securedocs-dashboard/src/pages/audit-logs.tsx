import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Shield, ShieldCheck, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { useAuth } from '@/context/auth-context';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [search, setSearch] = useState('');
  const [chainStatus, setChainStatus] = useState<any>(null);
  const { user } = useAuth();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: any[] }>('/audit');
      setLogs(res.data || []);
    } catch (e) {
      console.error('Failed to fetch audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const verifyChain = async () => {
    setVerifying(true);
    try {
      const res = await api.get<any>('/audit/verify-chain');
      setChainStatus(res);
    } catch (e) {
      console.error(e);
      setChainStatus({ valid: false, error: 'Failed to verify chain' });
    } finally {
      setVerifying(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(q) ||
      log.userName?.toLowerCase().includes(q) ||
      log.userRole?.toLowerCase().includes(q) ||
      log.ipAddress?.toLowerCase().includes(q) ||
      log.firId?.toLowerCase().includes(q) ||
      log.caseId?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">System Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Immutable, SHA-256 cryptographically chained record of evidence custody and access events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={verifyChain}
            disabled={verifying}
            className="bg-primary text-primary-foreground hover:bg-[#123A61]"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            {verifying ? 'Verifying Chain...' : 'Verify Cryptographic Chain'}
          </Button>
        </div>
      </div>

      {chainStatus && (
        <Card className={`border shadow-xs ${chainStatus.valid ? 'border-[#16803C]/30 bg-[#16803C]/5' : 'border-[#C62828]/30 bg-[#C62828]/5'}`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {chainStatus.valid ? (
                <CheckCircle2 className="h-5 w-5 text-[#16803C] shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-[#C62828] shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className={`text-sm font-semibold ${chainStatus.valid ? 'text-[#16803C]' : 'text-[#C62828]'}`}>
                  {chainStatus.valid ? 'Cryptographic Audit Chain Verified' : 'Audit Chain Integrity Discrepancy'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {chainStatus.valid
                    ? `Verified continuity across ${chainStatus.checkedCount || chainStatus.totalEvents} sequential events with zero hash mismatches.`
                    : `Hash mismatch or broken sequence detected. ${chainStatus.error || ''}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">Activity Trail</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Sequential log entries chained via predecessor event hashes.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search actions, officers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[170px] text-xs font-semibold">Timestamp</TableHead>
                <TableHead className="text-xs font-semibold">Officer / Identity</TableHead>
                <TableHead className="text-xs font-semibold">Action</TableHead>
                <TableHead className="text-xs font-semibold">Target Entity</TableHead>
                <TableHead className="text-xs font-semibold">Origin IP</TableHead>
                <TableHead className="text-xs font-semibold">Hash Fingerprint</TableHead>
                <TableHead className="text-right text-xs font-semibold">Outcome</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    <RefreshCw className="inline-block mr-2 h-4 w-4 animate-spin text-primary" />
                    Loading audit trail...
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    No matching audit records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log, idx) => (
                  <TableRow key={log._id || idx} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-foreground">{log.userName || 'System'}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{log.userRole || 'Automated'}</div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded border border-border">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.firId && <div>FIR: {log.firId}</div>}
                      {log.caseId && <div>Case: {log.caseId}</div>}
                      {log.documentId && <div>Doc: {log.documentId}</div>}
                      {!log.firId && !log.caseId && !log.documentId && <span className="text-muted-foreground/60">—</span>}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.ipAddress || '127.0.0.1'}
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground" title={log.eventHash}>
                      {log.eventHash ? log.eventHash.slice(0, 12) + '...' : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold uppercase tracking-wider ${
                          log.result === 'Success' || log.result === 'Verified'
                            ? 'border-[#16803C]/30 text-[#16803C] bg-[#16803C]/10'
                            : 'border-[#C62828]/30 text-[#C62828] bg-[#C62828]/10'
                        }`}
                      >
                        {log.result || 'Success'}
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
