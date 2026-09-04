import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileBarChart2, ShieldCheck, Activity } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-500 mt-1">Generate comprehensive PDF or CSV reports for compliance and auditing.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <FileBarChart2 className="mr-2 h-5 w-5" /> Case Activity Report
            </CardTitle>
            <CardDescription>Summary of all active cases, document counts, and assigned officers.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full mt-4" variant="outline">
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <ShieldCheck className="mr-2 h-5 w-5" /> Audit Compliance
            </CardTitle>
            <CardDescription>Full export of the cryptographic audit chain for external verification.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full mt-4" variant="outline">
              <Download className="mr-2 h-4 w-4" /> Download CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <Activity className="mr-2 h-5 w-5" /> Security Incident Log
            </CardTitle>
            <CardDescription>Detailed report of all high-risk events and integrity verification failures.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full mt-4" variant="outline">
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
