import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, FileKey, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '@/services/api';

export default function IntegrityVerification() {
  const [documentId, setDocumentId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentId.trim()) return;

    setVerifying(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post<any>(`/documents/${documentId.trim()}/verify-integrity`, {});
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please verify the Document ID is correct.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Integrity Verification</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Cryptographically verify document authenticity and SHA-256 fingerprint continuity.
          </p>
        </div>
        <Link href="/audit-logs">
          <Button variant="outline" size="sm">
            View Audit Trail <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-semibold text-foreground">Verify Document Hash</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Enter a Document identifier to compare its SHA-256 hash against the immutable evidence ledger.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="e.g. DOC-2026-001 or MongoDB _id"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              className="flex-1 h-9 text-xs"
              disabled={verifying}
            />
            <Button
              type="submit"
              disabled={verifying || !documentId.trim()}
              className="bg-primary text-primary-foreground hover:bg-[#123A61] h-9 text-xs"
            >
              <ShieldCheck className="mr-1.5 h-4 w-4" />
              {verifying ? 'Verifying Hash...' : 'Verify Authenticity'}
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-3.5 bg-[#C62828]/10 border border-[#C62828]/30 rounded-md flex items-center text-xs text-[#C62828]">
              <AlertTriangle className="h-4 w-4 mr-2 shrink-0" />
              {error}
            </div>
          )}

          {result && (
            <div
              className={`mt-6 p-5 border rounded-lg ${
                result.verified
                  ? 'bg-[#16803C]/5 border-[#16803C]/30'
                  : 'bg-[#C62828]/5 border-[#C62828]/30'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                {result.verified ? (
                  <CheckCircle2 className="h-6 w-6 text-[#16803C] shrink-0" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-[#C62828] shrink-0" />
                )}
                <div>
                  <h3
                    className={`text-sm font-bold ${
                      result.verified ? 'text-[#16803C]' : 'text-[#C62828]'
                    }`}
                  >
                    {result.verified ? 'Document Authenticity Confirmed' : 'Cryptographic Integrity Discrepancy'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Target: <span className="font-semibold text-foreground">{result.documentName}</span> ({result.documentId})
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-card p-4 rounded-md border border-border mt-3 text-xs">
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Immutable Registered Hash
                  </div>
                  <div className="font-mono text-[11px] break-all bg-muted p-2 rounded border border-border text-foreground">
                    {result.storedHash}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Evaluated Checksum
                  </div>
                  <div
                    className={`font-mono text-[11px] break-all p-2 rounded border ${
                      result.verified
                        ? 'bg-[#16803C]/10 border-[#16803C]/30 text-[#16803C] font-semibold'
                        : 'bg-[#C62828]/10 border-[#C62828]/30 text-[#C62828] font-bold'
                    }`}
                  >
                    {result.currentHash}
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center pt-1 border-t border-border mt-2">
                  <FileKey className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  Verified on {new Date(result.verifiedAt || Date.now()).toLocaleString()} by {result.verifiedBy}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
