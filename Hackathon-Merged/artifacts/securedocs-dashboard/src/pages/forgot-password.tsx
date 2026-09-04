import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export default function ForgotPassword() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-blue-600" />
        <span className="text-2xl font-bold text-slate-900 tracking-tight">SecureDocs</span>
      </div>

      <Card className="w-full max-w-md border-slate-200 shadow-sm bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">Password Reset</CardTitle>
          <CardDescription>
            Contact your system administrator to request a password reset.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center mt-4">
          <Button variant="outline" onClick={() => setLocation('/login')} className="w-full">
            Return to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
