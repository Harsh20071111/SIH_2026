import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileWarning, CheckCircle, Search, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function SecurityDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchSecurity() {
      if (user?.role === 'Admin' || user?.role === 'Auditor') {
        try {
          const res = await api.get<any>('/security/events');
          setEvents(res.data || []);
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    }
    fetchSecurity();
  }, [user]);

  if (user?.role !== 'Admin' && user?.role !== 'Auditor') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-slate-500">You do not have permission to view the security dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Security Command Center</h1>
        <p className="text-slate-500 mt-1">Monitor system-wide security events and anomalies.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-800 text-sm font-medium flex items-center">
              <FileWarning className="w-4 h-4 mr-2" /> High Risk Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">
              {events.filter(e => e.riskLevel === 'High' && e.status !== 'Resolved').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-800 text-sm font-medium flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2" /> Active Investigations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">
              {events.filter(e => e.status === 'Monitoring').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-emerald-800 text-sm font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" /> Resolved Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">
              {events.filter(e => e.status === 'Resolved').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Latest alerts triggered by the anomaly detection engine.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Search events..." className="pl-9" />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Loading events...</TableCell></TableRow>
              ) : events.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-slate-500">No security events found.</TableCell></TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event._id}>
                    <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{event.type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        event.riskLevel === 'High' ? 'bg-red-100 text-red-800 border-red-200' : 
                        event.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                        'bg-blue-100 text-blue-800 border-blue-200'
                      }>
                        {event.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>{event.sourceIp}</TableCell>
                    <TableCell>
                      <Badge variant={event.status === 'Resolved' ? 'secondary' : 'default'}>
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Investigate</Button>
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
