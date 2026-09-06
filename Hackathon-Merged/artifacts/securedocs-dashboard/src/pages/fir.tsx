import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  FileText,
  ShieldAlert,
  Plus,
  RefreshCw,
  Eye,
  UserCheck,
  CheckCircle2,
  Lock,
  FileCheck,
} from 'lucide-react';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import type { Role } from '@/lib/mock-data';

interface FIRItem {
  _id: string;
  firNumber: string;
  firDate: string;
  caseId?: string;
  crimeType: string;
  ipcSections: string[];
  isSensitive: boolean;
  sensitiveCategory?: string;
  policeStationId: string;
  status: string;
  priority: string;
  draftedBy: string;
  assignedIOId?: string;
  incidentDescription: string;
  incidentLocation: string;
  complainantDetails: {
    name: string;
    phone?: string;
    idNumber?: string;
  };
  contentHash: string;
  isLocked: boolean;
}

export default function FIRManagement({ role }: { role: Role }) {
  const { toast } = useToast();
  const [firs, setFirs] = useState<FIRItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedFIR, setSelectedFIR] = useState<FIRItem | null>(null);

  // Form State
  const [caseId, setCaseId] = useState('CASE-2026-001');
  const [crimeType, setCrimeType] = useState('Cyber Fraud & Electronic Theft');
  const [ipcSections, setIpcSections] = useState('IT Act 66D, IPC 420');
  const [incidentLocation, setIncidentLocation] = useState('Central District, Sector 4');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [complainantName, setComplainantName] = useState('');
  const [complainantPhone, setComplainantPhone] = useState('');
  const [isSensitive, setIsSensitive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchFIRs = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ firs: FIRItem[] }>('/fir');
      setFirs(res.firs || []);
    } catch (e) {
      console.error('Failed to fetch FIRs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFIRs();
  }, []);

  const handleCreateFIR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentDescription.trim() || !complainantName.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Please provide complainant name and incident description.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        caseId,
        crimeType,
        ipcSections: ipcSections.split(',').map((s) => s.trim()),
        incidentDate: new Date(),
        incidentLocation,
        incidentDescription,
        complainantDetails: {
          name: complainantName,
          phone: complainantPhone,
          idType: 'Aadhaar',
          idNumber: 'XXXX-XXXX-8921',
        },
        accusedDetails: [{ name: 'Unknown Perpetrator', isIdentified: false }],
        isSensitive,
        sensitiveCategory: isSensitive ? 'POCSO' : null,
      };

      const res = await api.post<{ fir: FIRItem }>('/fir', payload);
      toast({
        title: 'FIR Registered',
        description: `Successfully registered ${res.fir?.firNumber || 'new FIR'} with SHA-256 content hash.`,
      });
      setCreateOpen(false);
      fetchFIRs();
    } catch (err: any) {
      toast({
        title: 'Registration Error',
        description: err.message || 'Failed to create FIR.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveChargesheet = async (firNumber: string) => {
    try {
      await api.post(`/fir/${firNumber}/approve-chargesheet`, {});
      toast({
        title: 'Charge Sheet Approved',
        description: `FIR ${firNumber} has been approved and record locked for judicial review.`,
      });
      fetchFIRs();
      if (selectedFIR) setSelectedFIR(null);
    } catch (err: any) {
      toast({
        title: 'Approval Failed',
        description: err.message || 'Only Admin / SHO may approve charge sheets.',
        variant: 'destructive',
      });
    }
  };

  const filteredFirs = firs.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      f.firNumber.toLowerCase().includes(q) ||
      (f.caseId && f.caseId.toLowerCase().includes(q)) ||
      f.crimeType.toLowerCase().includes(q) ||
      f.incidentLocation.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ChargeSheetApproved':
        return 'border-[#16803C]/30 text-[#16803C] bg-[#16803C]/10';
      case 'UnderInvestigation':
        return 'border-[#2563A8]/30 text-[#2563A8] bg-[#2563A8]/10';
      case 'Draft':
        return 'border-[#B77900]/30 text-[#B77900] bg-[#B77900]/10';
      default:
        return 'border-border text-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">FIR & Police Registry</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            First Information Report lifecycle, statutory jurisdiction binding, and evidentiary custody tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchFIRs} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-[#123A61] text-xs font-semibold"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Draft New FIR
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registered FIRs</div>
              <div className="text-2xl font-bold text-foreground mt-1">{firs.length}</div>
              <div className="text-xs text-muted-foreground mt-0.5">In current precinct</div>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <FileText size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#2563A8] uppercase tracking-wider">Under Investigation</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {firs.filter((f) => f.status === 'UnderInvestigation').length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Assigned IOs active</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#2563A8]/10 text-[#2563A8]">
              <UserCheck size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#16803C] uppercase tracking-wider">Charge Sheets Approved</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {firs.filter((f) => f.status === 'ChargeSheetApproved').length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Forwarded to court</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#16803C]/10 text-[#16803C]">
              <CheckCircle2 size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#C62828] uppercase tracking-wider">Sensitive Cases</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {firs.filter((f) => f.isSensitive).length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">POCSO & PII protected</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#C62828]/10 text-[#C62828]">
              <ShieldAlert size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FIR Registry Table */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">FIR Ledger</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Statutory records secured with SHA-256 tamper-evident digests.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search FIR number, crime..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold">FIR Number</TableHead>
                <TableHead className="text-xs font-semibold">Linked Case</TableHead>
                <TableHead className="text-xs font-semibold">Crime Classification</TableHead>
                <TableHead className="text-xs font-semibold">Precinct Station</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">Integrity Hash</TableHead>
                <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    <RefreshCw className="inline-block mr-2 h-4 w-4 animate-spin text-primary" />
                    Loading FIR ledger...
                  </TableCell>
                </TableRow>
              ) : filteredFirs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    No FIR records found matching your query.
                  </TableCell>
                </TableRow>
              ) : (
                filteredFirs.map((fir) => (
                  <TableRow key={fir._id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {fir.firNumber}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {fir.caseId || '—'}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-foreground">{fir.crimeType}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {fir.ipcSections ? fir.ipcSections.join(', ') : 'Sec. 65B'}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {fir.policeStationId || 'PS-CENTRAL-01'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${getStatusBadge(fir.status)}`}>
                        {fir.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                      {fir.contentHash ? fir.contentHash.slice(0, 12) + '...' : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFIR(fir)}
                          className="h-7 px-2 text-xs text-primary hover:bg-primary/10"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                        {role === 'Admin' && fir.status !== 'ChargeSheetApproved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveChargesheet(fir.firNumber)}
                            className="h-7 px-2 text-xs text-[#16803C] border-[#16803C]/30 hover:bg-[#16803C]/10"
                          >
                            <FileCheck className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New FIR Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Draft New FIR</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Register a statutory First Information Report tied to an active SecureDocs case.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateFIR} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Linked Case ID</label>
                <Input
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  placeholder="e.g. CASE-2026-001"
                  className="mt-1 h-8 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Crime Type</label>
                <Input
                  value={crimeType}
                  onChange={(e) => setCrimeType(e.target.value)}
                  placeholder="e.g. Theft, Fraud"
                  className="mt-1 h-8 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">IPC / IT Act Sections</label>
                <Input
                  value={ipcSections}
                  onChange={(e) => setIpcSections(e.target.value)}
                  placeholder="e.g. 420, IT Act 66D"
                  className="mt-1 h-8 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Incident Location</label>
                <Input
                  value={incidentLocation}
                  onChange={(e) => setIncidentLocation(e.target.value)}
                  placeholder="Precinct Sector or Address"
                  className="mt-1 h-8 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Complainant Name</label>
                <Input
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                  placeholder="Full legal name"
                  className="mt-1 h-8 text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Complainant Phone</label>
                <Input
                  value={complainantPhone}
                  onChange={(e) => setComplainantPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="mt-1 h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Incident Description</label>
              <Textarea
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                placeholder="Factual statement of events, timeline, and preliminary evidence notes..."
                className="mt-1 text-xs min-h-[90px]"
                required
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/40 rounded border border-border">
              <input
                type="checkbox"
                id="sensitiveCheckbox"
                checked={isSensitive}
                onChange={(e) => setIsSensitive(e.target.checked)}
                className="accent-primary"
              />
              <label htmlFor="sensitiveCheckbox" className="text-xs text-foreground cursor-pointer">
                <strong>Statutory Protection / POCSO Case</strong> (Enforces automated PII & identity redaction)
              </label>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-primary text-primary-foreground hover:bg-[#123A61] h-8 text-xs font-semibold"
              >
                {submitting ? 'Registering...' : 'Register FIR'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* FIR Detail Modal */}
      {selectedFIR && (
        <Dialog open={true} onOpenChange={() => setSelectedFIR(null)}>
          <DialogContent className="max-w-2xl border border-border bg-card">
            <DialogHeader className="border-b border-border pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-base font-bold text-foreground">
                    {selectedFIR.firNumber}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Case: <span className="font-mono text-primary font-semibold">{selectedFIR.caseId || 'Unlinked'}</span> · Station: {selectedFIR.policeStationId}
                  </DialogDescription>
                </div>
                <Badge variant="outline" className={`text-[10px] ${getStatusBadge(selectedFIR.status)}`}>
                  {selectedFIR.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded border border-border">
                <div>
                  <span className="text-muted-foreground">Crime:</span>{' '}
                  <span className="font-semibold text-foreground">{selectedFIR.crimeType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">IPC Sections:</span>{' '}
                  <span className="font-mono font-semibold">{selectedFIR.ipcSections?.join(', ')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>{' '}
                  <span className="text-foreground">{selectedFIR.incidentLocation}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Complainant:</span>{' '}
                  <span className="text-foreground">{selectedFIR.complainantDetails?.name}</span>
                </div>
              </div>

              <div>
                <div className="font-semibold text-foreground mb-1">Incident Narration</div>
                <div className="p-3 bg-card rounded border border-border text-foreground leading-relaxed">
                  {selectedFIR.incidentDescription}
                </div>
              </div>

              <div className="p-3 bg-card rounded border border-border space-y-1">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  SHA-256 Content Fingerprint
                </div>
                <div className="font-mono text-[11px] break-all text-primary bg-primary/5 p-2 rounded border border-primary/20">
                  {selectedFIR.contentHash || 'Pending calculation'}
                </div>
              </div>

              {selectedFIR.isSensitive && (
                <div className="p-2.5 bg-[#C62828]/10 border border-[#C62828]/30 rounded text-xs text-[#C62828] flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>Statutory POCSO Protection Applied. Complainant and minor details masked for non-authorized viewers.</span>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setSelectedFIR(null)} className="h-8 text-xs">
                Close
              </Button>
              {role === 'Admin' && selectedFIR.status !== 'ChargeSheetApproved' && (
                <Button
                  size="sm"
                  onClick={() => handleApproveChargesheet(selectedFIR.firNumber)}
                  className="bg-[#16803C] hover:bg-[#126b31] text-white h-8 text-xs font-semibold"
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve Charge Sheet
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
