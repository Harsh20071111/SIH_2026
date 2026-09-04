import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, FileKey, AlertTriangle } from 'lucide-react';
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
      // Assuming we have an endpoint that can take a generic Document ID and verify it
      const res = await api.post<any>(`/documents/${documentId.trim()}/verify-integrity`, {});
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to verify document. Ensure the Document ID is correct.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Integrity Verification</h1>
        <p className="text-slate-500 mt-1">Cryptographically verify the authenticity of any document in the system.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verify Document Hash</CardTitle>
          <CardDescription>
            Enter a Document ID to recompute its SHA-256 hash from Firebase Storage and compare it against the immutable MongoDB record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="flex gap-4">
            <Input
              placeholder="e.g. SD-260421"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              className="flex-1"
              disabled={verifying}
            />
            <Button type="submit" disabled={verifying || !documentId.trim()} className="bg-blue-600 hover:bg-blue-700">
              <ShieldCheck className="mr-2 h-4 w-4" />
              {verifying ? 'Verifying...' : 'Verify Now'}
            </Button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {result && (
            <div className={`mt-6 p-6 border rounded-lg ${result.verified ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center mb-4">
                {result.verified ? (
                  <ShieldCheck className="h-8 w-8 text-green-600 mr-3" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                )}
                <div>
                  <h3 className={`text-lg font-bold ${result.verified ? 'text-green-900' : 'text-red-900'}`}>
                    {result.verified ? 'Verification Successful' : 'Integrity Issue Detected'}
                  </h3>
                  <p className={`text-sm ${result.verified ? 'text-green-700' : 'text-red-700'}`}>
                    Document: {result.documentName} ({result.documentId})
                  </p>
                </div>
              </div>

              <div className="space-y-4 bg-white/60 p-4 rounded-md border border-black/5 mt-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Stored Hash (Database)</div>
                  <div className="font-mono text-sm break-all">{result.storedHash}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Recomputed Hash (Storage)</div>
                  <div className={`font-mono text-sm break-all ${result.verified ? 'text-green-700' : 'text-red-700 font-bold'}`}>
                    {result.currentHash}
                  </div>
                </div>
                <div className="text-xs text-slate-500 flex items-center mt-2">
                  <FileKey className="h-3 w-3 mr-1" />
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
