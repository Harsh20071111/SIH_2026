import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, CheckCircle2, Search, AlertTriangle, RefreshCw, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';

export default function Security() {
  const [events, setEvents] = useState<any[]>([]);
  const [riskSummary, setRiskSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const [eventsRes, riskRes] = await Promise.all([
        api.get<any>('/security/events').catch(() => ({ data: [] })),
        api.get<any>('/security/risk').catch(() => null),
      ]);
      setEvents(eventsRes.data || []);
      setRiskSummary(riskRes);
    } catch (e) {
      console.error('Failed to fetch security events:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await api.patch(`/security/events/${id}`, { status: 'Resolved' });
      setEvents((prev) =>
        prev.map((e) => (e._id === id ? { ...e, status: 'Resolved' } : e))
      );
    } catch (e) {
      console.error('Failed to resolve event:', e);
    }
  };

  const filteredEvents = events.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.action?.toLowerCase().includes(q) ||
      e.type?.toLowerCase().includes(q) ||
      e.userName?.toLowerCase().includes(q) ||
      e.caseId?.toLowerCase().includes(q)
    );
  });

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'border-[#C62828]/40 text-[#C62828] bg-[#C62828]/10';
      case 'HIGH':
        return 'border-[#B77900]/40 text-[#B77900] bg-[#B77900]/10';
      case 'MEDIUM':
        return 'border-[#2563A8]/40 text-[#2563A8] bg-[#2563A8]/10';
      default:
        return 'border-[#16803C]/40 text-[#16803C] bg-[#16803C]/10';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Security Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time threat evaluation, privilege misuse signals, and anomaly alerts.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSecurityData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Risk Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Alerts</div>
            <div className="text-2xl font-bold text-foreground mt-1">{riskSummary?.totalEvents || events.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Recorded security events</div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-[#C62828] uppercase tracking-wider">Critical Anomalies</div>
            <div className="text-2xl font-bold text-[#C62828] mt-1">{riskSummary?.criticalCount || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Requires immediate review</div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-[#B77900] uppercase tracking-wider">High Risk Events</div>
            <div className="text-2xl font-bold text-[#B77900] mt-1">{riskSummary?.highCount || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Elevated risk scores</div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-[#16803C] uppercase tracking-wider">Open Investigations</div>
            <div className="text-2xl font-bold text-[#16803C] mt-1">{riskSummary?.openEvents || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Pending resolution</div>
          </CardContent>
        </Card>
      </div>

      {/* Events Table */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">Security Event Stream</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Automated risk scoring based on access frequency, time-of-day, and permission denials.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter events, users..."
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
                <TableHead className="text-xs font-semibold">Event Type</TableHead>
                <TableHead className="text-xs font-semibold">Target Entity</TableHead>
                <TableHead className="text-xs font-semibold">Risk Level</TableHead>
                <TableHead className="text-xs font-semibold">Risk Score</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-right text-xs font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    <RefreshCw className="inline-block mr-2 h-4 w-4 animate-spin text-primary" />
                    Loading security signals...
                  </TableCell>
                </TableRow>
              ) : filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    No open security anomalies detected. System running in nominal parameters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow key={event._id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-foreground">{event.action || event.type}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{event.userName || 'System Service'}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {event.caseId ? `Case: ${event.caseId}` : event.documentId ? `Doc: ${event.documentId}` : 'Platform'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-semibold ${getRiskBadge(event.riskLevel)}`}>
                        {event.riskLevel || 'LOW'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold">
                      {event.riskScore ?? 0} / 100
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          event.status === 'Resolved'
                            ? 'bg-[#16803C]/10 text-[#16803C]'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {event.status || 'Monitoring'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {event.status !== 'Resolved' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleResolve(event._id)}
                          className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Check className="mr-1 h-3.5 w-3.5" /> Resolve
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#16803C]" /> Resolved
                        </span>
                      )}
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
