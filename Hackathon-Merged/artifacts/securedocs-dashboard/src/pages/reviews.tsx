import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, FileCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function ReviewQueue() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await api.get<{ data: any[] }>('/reviews');
        setReviews(res.data || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchReviews();
  }, []);

  const handleAction = async (id: string, action: string) => {
    try {
      await api.patch(`/reviews/${id}`, { status: action });
      setReviews(reviews.map(r => r._id === id ? { ...r, status: action } : r));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Review Queue</h1>
        <p className="text-slate-500 mt-1">Review and approve uploaded documents.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews</CardTitle>
          <CardDescription>Documents requiring legal or administrative review.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Search reviews..." className="pl-9" />
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Case ID</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center">Loading reviews...</TableCell></TableRow>
              ) : reviews.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-slate-500">No documents pending review.</TableCell></TableRow>
              ) : (
                reviews.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-medium flex items-center">
                      <FileCheck className="h-4 w-4 mr-2 text-blue-500" />
                      {r.documentName}
                    </TableCell>
                    <TableCell>{r.caseId}</TableCell>
                    <TableCell>{r.submittedBy}</TableCell>
                    <TableCell>{new Date(r.submittedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        r.priority === 'High' ? 'text-red-600 border-red-200 bg-red-50' : ''
                      }>
                        {r.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        r.status === 'Pending' ? 'secondary' : 
                        r.status === 'Approved' ? 'default' : 'destructive'
                      }>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {r.status === 'Pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleAction(r._id, 'Approved')}>Approve</Button>
                          <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleAction(r._id, 'Rejected')}>Reject</Button>
                        </div>
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
