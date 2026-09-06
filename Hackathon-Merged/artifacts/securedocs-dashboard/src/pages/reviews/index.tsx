import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileCheck,
  Filter,
} from 'lucide-react';
import { mockReviews, type ReviewData, type ReviewStatus } from '@/lib/reviews-data';
import ReviewDetailsModal from './ReviewDetailsModal';
import { useToast } from '@/hooks/use-toast';
import type { Role } from '@/lib/mock-data';

export default function Reviews({ role }: { role: Role }) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ReviewData[]>(mockReviews);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null);

  // Metric counts
  const pendingCount = useMemo(() => reviews.filter((r) => r.status === 'Pending').length, [reviews]);
  const highPriorityCount = useMemo(() => reviews.filter((r) => r.priority === 'High').length, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch =
        search === '' ||
        r.caseId.toLowerCase().includes(search.toLowerCase()) ||
        r.document.toLowerCase().includes(search.toLowerCase()) ||
        r.submittedBy.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || r.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [reviews, search, statusFilter, priorityFilter]);

  const handleAction = (id: string, nextStatus: ReviewStatus, comments?: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
    );
    toast({
      title: 'Review Recorded',
      description: `Document ${id} transitioned to '${nextStatus}'. Audit log created.`,
    });
  };

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'Approved':
        return 'border-[#16803C]/30 text-[#16803C] bg-[#16803C]/10';
      case 'Rejected':
        return 'border-[#C62828]/30 text-[#C62828] bg-[#C62828]/10';
      case 'Changes Requested':
        return 'border-[#B77900]/30 text-[#B77900] bg-[#B77900]/10';
      case 'In Review':
        return 'border-[#2563A8]/30 text-[#2563A8] bg-[#2563A8]/10';
      default:
        return 'border-border text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Document Review Queue</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Legal scrutiny, chain-of-custody verification, and evidentiary approval management.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#B77900] uppercase tracking-wider">Pending Reviews</div>
              <div className="text-2xl font-bold text-foreground mt-1">{pendingCount}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Awaiting initial evaluation</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#B77900]/10 text-[#B77900]">
              <Clock size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#C62828] uppercase tracking-wider">High Priority</div>
              <div className="text-2xl font-bold text-foreground mt-1">{highPriorityCount}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Urgent court deadlines</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#C62828]/10 text-[#C62828]">
              <AlertTriangle size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-primary uppercase tracking-wider">Due Today</div>
              <div className="text-2xl font-bold text-foreground mt-1">12</div>
              <div className="text-xs text-muted-foreground mt-0.5">Scheduled review targets</div>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Calendar size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#16803C] uppercase tracking-wider">Completed Today</div>
              <div className="text-2xl font-bold text-foreground mt-1">17</div>
              <div className="text-xs text-muted-foreground mt-0.5">Signed off and sealed</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#16803C]/10 text-[#16803C]">
              <CheckCircle2 size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Queue Table */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">Items Requiring Action</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Review queue sorted by submission recency and priority ranking.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter cases..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 text-xs rounded-md border border-border bg-card px-2.5 text-foreground"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Changes Requested">Changes Requested</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-8 text-xs rounded-md border border-border bg-card px-2.5 text-foreground"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold">Case ID</TableHead>
                <TableHead className="text-xs font-semibold">Document Title</TableHead>
                <TableHead className="text-xs font-semibold">Submitted By</TableHead>
                <TableHead className="text-xs font-semibold">Assigned Reviewer</TableHead>
                <TableHead className="text-xs font-semibold">Version</TableHead>
                <TableHead className="text-xs font-semibold">Priority</TableHead>
                <TableHead className="text-xs font-semibold">Submitted</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-right text-xs font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-xs text-muted-foreground">
                    No documents currently match your filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {r.caseId}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">
                      {r.document}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.submittedBy}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.reviewer}</TableCell>
                    <TableCell className="font-mono text-xs">{r.version}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center text-xs font-semibold ${
                          r.priority === 'High'
                            ? 'text-[#C62828]'
                            : r.priority === 'Medium'
                            ? 'text-[#B77900]'
                            : 'text-[#16803C]'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5" />
                        {r.priority}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.submittedDate}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${getStatusBadge(r.status)}`}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => setSelectedReview(r)}
                        className="h-7 text-xs bg-primary text-primary-foreground hover:bg-[#123A61]"
                      >
                        <FileCheck className="mr-1 h-3.5 w-3.5" /> Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedReview && (
        <ReviewDetailsModal
          review={selectedReview}
          role={role}
          onClose={() => setSelectedReview(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
