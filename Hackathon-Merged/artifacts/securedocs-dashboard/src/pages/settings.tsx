import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, FileText, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const { toast } = useToast();

  // Settings State
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [maxAttempts, setMaxAttempts] = useState('5');

  // Risk Engine State
  const [riskPoints, setRiskPoints] = useState({
    unusualTime: 20,
    excessiveDownloads: 25,
    unassignedCase: 30,
    failedAttempts: 20
  });

  const [riskEnabled, setRiskEnabled] = useState({
    unusualTime: true,
    excessiveDownloads: true,
    unassignedCase: true,
    failedAttempts: true
  });

  // Document Settings State
  const [maxFileSize, setMaxFileSize] = useState('50');
  const [retentionPeriod, setRetentionPeriod] = useState('10');

  const totalRiskScore = Object.keys(riskPoints).reduce((acc, key) => {
    return acc + (riskEnabled[key as keyof typeof riskEnabled] ? riskPoints[key as keyof typeof riskPoints] : 0);
  }, 0);

  const handleSaveSecurity = () => {
    toast({
      title: "Security settings saved successfully.",
      description: "Your changes have been applied across the system.",
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-900",
    });
  };

  const handleSaveDocuments = () => {
    toast({
      title: "Document settings saved successfully.",
      description: "Document policies have been updated.",
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-900",
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">SYSTEM SETTINGS</h1>
        <p className="text-slate-500 mt-1">Configure security, risk detection, document and retention policies.</p>
        <div className="text-sm text-slate-400 mt-2">Dashboard / Settings</div>
      </div>

      <Tabs defaultValue="security" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-slate-100">
          <TabsTrigger value="security" className="py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md">
            <Shield className="w-4 h-4 mr-2" /> Security
          </TabsTrigger>
          <TabsTrigger value="risk" className="py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md">
            <AlertTriangle className="w-4 h-4 mr-2" /> Risk Engine
          </TabsTrigger>
          <TabsTrigger value="documents" className="py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md">
            <FileText className="w-4 h-4 mr-2" /> Documents
          </TabsTrigger>
          <TabsTrigger value="retention" className="py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md">
            <Clock className="w-4 h-4 mr-2" /> Retention
          </TabsTrigger>
        </TabsList>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-800">SECURITY</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base">SESSION TIMEOUT</CardTitle>
                <CardDescription>Automatically log out inactive users.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label>Current Timeout</Label>
                    <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="120">120 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base">MAXIMUM FAILED ATTEMPTS</CardTitle>
                <CardDescription>Lock accounts after consecutive failed logins.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label>Failed Attempts Limit</Label>
                    <Select value={maxAttempts} onValueChange={setMaxAttempts}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select limit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                        <SelectItem value="10">10 attempts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-slate-500">After maximum attempts: <span className="font-medium text-slate-700">Account temporarily locked</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm md:col-span-2">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base">PASSWORD POLICY</CardTitle>
                <CardDescription>Enforce strong password requirements for all users.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex flex-col justify-center space-y-1">
                    <Label>Minimum password length</Label>
                    <p className="text-sm text-slate-500">Must be at least 8 characters</p>
                  </div>
                  <div className="flex items-center">
                    <Input type="number" defaultValue="8" className="w-24" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer" htmlFor="req-upper">Require uppercase</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">Enabled</span>
                      <Checkbox id="req-upper" defaultChecked />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer" htmlFor="req-num">Require number</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">Enabled</span>
                      <Checkbox id="req-num" defaultChecked />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer" htmlFor="req-spec">Require special character</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">Enabled</span>
                      <Checkbox id="req-spec" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveSecurity} className="bg-blue-600 hover:bg-blue-700">
              Save Security Settings
            </Button>
          </div>
        </TabsContent>

        {/* RISK ENGINE TAB */}
        <TabsContent value="risk" className="mt-6 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                <h2 className="text-xl font-semibold text-slate-800">RISK ENGINE</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1">Configure the risk score assigned to suspicious user activities.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {/* Risk Factor Cards */}
              {[
                { id: 'unusualTime', title: 'UNUSUAL ACCESS TIME', desc: 'Activity performed outside normal access hours.' },
                { id: 'excessiveDownloads', title: 'EXCESSIVE DOWNLOADS', desc: 'Unusually high number of document downloads.' },
                { id: 'unassignedCase', title: 'UNASSIGNED CASE', desc: 'Attempt to access a case not assigned to the user.' },
                { id: 'failedAttempts', title: 'FAILED ATTEMPTS', desc: 'Repeated failed access or authentication attempts.' },
              ].map((factor) => (
                <Card key={factor.id} className={`border-slate-200 shadow-sm transition-colors ${!riskEnabled[factor.id as keyof typeof riskEnabled] ? 'opacity-60 bg-slate-50' : 'bg-white'}`}>
                  <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-800">{factor.title}</h3>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">+{riskPoints[factor.id as keyof typeof riskPoints]} POINTS</Badge>
                      </div>
                      <p className="text-sm text-slate-500">{factor.desc}</p>
                    </div>

                    <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-4 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={riskPoints[factor.id as keyof typeof riskPoints]}
                          onChange={(e) => setRiskPoints({...riskPoints, [factor.id]: parseInt(e.target.value) || 0})}
                          className="w-20"
                          disabled={!riskEnabled[factor.id as keyof typeof riskEnabled]}
                        />
                        <span className="text-sm text-slate-500 mr-2">pts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={riskEnabled[factor.id as keyof typeof riskEnabled]}
                          onCheckedChange={(c) => setRiskEnabled({...riskEnabled, [factor.id]: c})}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="md:col-span-1">
              <Card className="border-red-100 bg-red-50/30 shadow-sm sticky top-6">
                <CardHeader className="border-b border-red-100 bg-white">
                  <CardTitle className="text-base text-red-700">RISK SCORE PREVIEW</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 bg-white space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className={`flex justify-between ${!riskEnabled.unusualTime && 'text-slate-400 line-through'}`}>
                      <span>Unusual access time</span>
                      <span className="font-medium">+{riskPoints.unusualTime}</span>
                    </div>
                    <div className={`flex justify-between ${!riskEnabled.excessiveDownloads && 'text-slate-400 line-through'}`}>
                      <span>Excessive downloads</span>
                      <span className="font-medium">+{riskPoints.excessiveDownloads}</span>
                    </div>
                    <div className={`flex justify-between ${!riskEnabled.unassignedCase && 'text-slate-400 line-through'}`}>
                      <span>Unassigned case</span>
                      <span className="font-medium">+{riskPoints.unassignedCase}</span>
                    </div>
                    <div className={`flex justify-between ${!riskEnabled.failedAttempts && 'text-slate-400 line-through'}`}>
                      <span>Failed attempts</span>
                      <span className="font-medium">+{riskPoints.failedAttempts}</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex justify-between items-center font-bold">
                    <span>Risk Score</span>
                    <span className="text-lg">{totalRiskScore}/100</span>
                  </div>

                  <div className={`mt-4 p-3 rounded text-center font-bold ${totalRiskScore >= 80 ? 'bg-red-100 text-red-700 border border-red-200' : totalRiskScore >= 50 ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                    {totalRiskScore >= 80 ? '🔴 HIGH RISK ACTIVITY' : totalRiskScore >= 50 ? '🟠 MEDIUM RISK' : '🟢 LOW RISK'}
                  </div>

                  <p className="text-xs text-slate-500 mt-4 text-center">
                    Risk scores help identify unusual document access behaviour.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* DOCUMENTS & RETENTION TABS (Combined layout as requested) */}
        <TabsContent value="documents" className="mt-6 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-800">DOCUMENT SETTINGS</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base">MAXIMUM FILE SIZE</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label>Current Limit</Label>
                    <Select value={maxFileSize} onValueChange={setMaxFileSize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select max size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 MB</SelectItem>
                        <SelectItem value="25">25 MB</SelectItem>
                        <SelectItem value="50">50 MB</SelectItem>
                        <SelectItem value="100">100 MB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base">ALLOWED FORMATS</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-3">
                  {['PDF', 'DOCX', 'XLSX', 'JPG', 'PNG'].map((format) => (
                    <div key={format} className="flex items-center space-x-2 border border-slate-200 rounded-md px-3 py-2 bg-slate-50">
                      <Checkbox id={`format-${format}`} defaultChecked />
                      <label
                        htmlFor={`format-${format}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {format}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveDocuments} className="bg-blue-600 hover:bg-blue-700">
              Save Document Settings
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="retention" className="mt-6 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Clock className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-800">RETENTION POLICY</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base">RETENTION SETTINGS</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <Label>Default retention period</Label>
                    <Select value={retentionPeriod} onValueChange={setRetentionPeriod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Year</SelectItem>
                        <SelectItem value="5">5 Years</SelectItem>
                        <SelectItem value="10">10 Years</SelectItem>
                        <SelectItem value="25">25 Years</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-archive" className="cursor-pointer">Automatically archive after expiry</Label>
                      <Switch id="auto-archive" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="review-before" className="cursor-pointer">Review before archival</Label>
                      <Switch id="review-before" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-slate-50">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  POLICY ACTIVE
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-sm font-medium text-slate-500">Default document retention:</span>
                  <span className="font-semibold text-slate-900">{retentionPeriod} Years</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-sm font-medium text-slate-500">Automatically archive:</span>
                  <span className="text-slate-900">Enabled</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-sm font-medium text-slate-500">Review before archival:</span>
                  <span className="text-slate-900">Enabled</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-medium text-slate-500">Status:</span>
                  <span className="font-semibold text-green-600 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span> Policy Active</span>
                </div>

                <div className="mt-6 p-3 bg-blue-50 text-blue-800 text-xs rounded-md border border-blue-100 flex gap-2 items-start">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>Retention settings shown here are prototype configuration controls and do not represent legal certification.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-start pt-4">
            <Button onClick={handleSaveDocuments} className="bg-blue-600 hover:bg-blue-700">
              Save Retention Policy
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* QUICK SETTINGS SUMMARY */}
      <Card className="mt-12 border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-800 text-white rounded-t-lg">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            CURRENT SYSTEM CONFIGURATION
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="p-4 bg-slate-50/50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Security</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Timeout:</span> <span className="font-medium">{sessionTimeout}m</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Max Attempts:</span> <span className="font-medium">{maxAttempts}</span></div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Risk Rules (Pts)</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Unusual Time:</span> <span className="font-medium">{riskPoints.unusualTime}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Downloads:</span> <span className="font-medium">{riskPoints.excessiveDownloads}</span></div>
              </div>
            </div>
            <div className="p-4 bg-slate-50/50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">More Rules (Pts)</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Unassigned:</span> <span className="font-medium">{riskPoints.unassignedCase}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Failed Logins:</span> <span className="font-medium">{riskPoints.failedAttempts}</span></div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Documents</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Max Size:</span> <span className="font-medium">{maxFileSize} MB</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Retention:</span> <span className="font-medium">{retentionPeriod} Yrs</span></div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center rounded-b-lg">
            <span className="text-sm font-medium text-slate-700">System Status</span>
            <span className="text-sm font-medium text-green-600 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span> All settings operational
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
