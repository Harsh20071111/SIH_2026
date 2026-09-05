import { useState, useEffect, type ReactNode } from 'react';
import { Link } from 'wouter';
import {
  Link2, ShieldCheck, ShieldAlert, GitBranch, Activity, Bug,
  FileSearch, Download, Zap, Search, FileText, FileWarning,
  RefreshCw, Database, CheckCircle2, XCircle, Clock, AlertTriangle,
  X, Check, ScanSearch, ChevronRight, ArrowUpRight, MoreHorizontal,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/* ================================================================
   DATA
   ================================================================ */
const auditEvents = [
  { id: 'EVT-001', label: 'Event 001', timestamp: '2026-09-04 18:12:07', action: 'User Authentication',
    prevHash: '0000000000000000', hash: 'a3f7c2e8b91d4056', computedHash: 'a3f7c2e8b91d4056' },
  { id: 'EVT-002', label: 'Event 002', timestamp: '2026-09-04 18:24:31', action: 'Document Access',
    prevHash: 'a3f7c2e8b91d4056', hash: 'd4e9f1a7c3b52068', computedHash: 'd4e9f1a7c3b52068' },
  { id: 'EVT-003', label: 'Event 003', timestamp: '2026-09-04 19:01:45', action: 'Permission Change',
    prevHash: 'd4e9f1a7c3b52068', hash: 'b8c3d7e2f9a14583', computedHash: 'b8c3d7e2f9a14583', tamperedHash: '7x9k2m4p1q8r5w3y' },
  { id: 'EVT-004', label: 'Event 004', timestamp: '2026-09-04 19:38:12', action: 'File Download',
    prevHash: 'b8c3d7e2f9a14583', hash: 'e5f2a8b4c7d91036', computedHash: 'e5f2a8b4c7d91036' },
  { id: 'EVT-005', label: 'Event 005', timestamp: '2026-09-04 20:15:28', action: 'Session Termination',
    prevHash: 'e5f2a8b4c7d91036', hash: 'c9d6e3f1a2b74580', computedHash: 'c9d6e3f1a2b74580' },
];

/* ================================================================
   SECTION HEADER — mirrors dashboard pattern
   ================================================================ */
function SectionHeader({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-primary/70">{eyebrow}</div>}
        <h2 className="mt-1 text-[17px] font-bold tracking-tight text-foreground">{title}</h2>
      </div>
    </div>
  );
}

/* ================================================================
   CHAIN EVENT NODE
   ================================================================ */
function ChainEventNode({ evt, tampered, downstream }: { evt: typeof auditEvents[0]; tampered: boolean; downstream: boolean }) {
  const Icon = tampered ? XCircle : downstream ? AlertTriangle : CheckCircle2;
  const accent = tampered
    ? { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-700', tag: 'text-red-700', tagBg: 'bg-red-50', label: 'TAMPERED' }
    : downstream
      ? { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-700', tag: 'text-amber-700', tagBg: 'bg-amber-50', label: 'SUSPECT' }
      : { bg: 'bg-card', border: 'border-border', icon: 'text-emerald-700', tag: 'text-emerald-700', tagBg: 'bg-emerald-50', label: 'VERIFIED' };

  return (
    <div className={`w-full rounded-xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${accent.bg} ${accent.border} ${tampered ? 'ring-1 ring-red-200' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`grid size-8 place-items-center rounded-lg ${tampered ? 'bg-red-100' : downstream ? 'bg-amber-100' : 'bg-emerald-50'} ${accent.icon}`}>
            <Icon size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">{evt.label}</div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">{evt.action}</div>
          </div>
        </div>
        <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${accent.tag} ${accent.tagBg}`}>{accent.label}</span>
      </div>
      <div className="mt-3 space-y-1 border-t border-border/50 pt-3">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Timestamp</span>
          <span className="font-mono font-medium text-foreground">{evt.timestamp}</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Hash</span>
          <span className={`font-mono font-medium ${tampered ? 'text-red-700' : 'text-muted-foreground'}`}>
            {(tampered ? evt.tamperedHash : evt.hash)?.slice(0, 12)}…
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   CHAIN CONNECTOR
   ================================================================ */
function ChainConnector({ broken }: { broken: boolean }) {
  return (
    <div className="flex flex-col items-center py-1">
      {broken ? (
        <div className="flex h-7 flex-col items-center justify-center gap-[3px]">
          <div className="h-[5px] w-[2px] rounded-full bg-red-400" />
          <div className="h-[5px] w-[2px] rounded-full bg-red-400" />
          <div className="h-[5px] w-[2px] rounded-full bg-red-400" />
        </div>
      ) : (
        <div className="h-7 w-[2px] rounded-full bg-emerald-300" />
      )}
    </div>
  );
}

/* ================================================================
   INTEGRITY RING (SVG)
   ================================================================ */
function IntegrityRing({ percent, compromised }: { percent: number; compromised: boolean }) {
  const r = 48, c = 2 * Math.PI * r, offset = c * (1 - percent / 100);
  const color = compromised ? '#dc2626' : '#16a34a';
  return (
    <div className="relative mx-auto size-[128px]">
      <svg viewBox="0 0 120 120" className="size-full">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="7" className="text-muted/50" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          transform="rotate(-90 60 60)" className="transition-all duration-700 ease-out" />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className={`font-mono text-2xl font-bold ${compromised ? 'text-red-700' : 'text-emerald-700'}`}>{percent}%</div>
          <div className="font-mono text-[8px] font-bold uppercase tracking-wider text-muted-foreground">integrity</div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   STAT MINI CARD — footer metrics
   ================================================================ */
function FooterStat({ icon: Icon, label, value, tone, sub }: { icon: any; label: string; value: string; tone: string; sub: string }) {
  const tones: Record<string, string> = { blue: 'bg-blue-50 text-blue-700', green: 'bg-emerald-50 text-emerald-700', red: 'bg-red-50 text-red-700', amber: 'bg-amber-50 text-amber-700' };
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={`grid size-9 place-items-center rounded-lg ${tones[tone]}`}><Icon size={18} /></div>
        <ArrowUpRight size={16} className="text-muted-foreground/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
      <div className="mt-4 font-mono text-[28px] font-bold leading-none tracking-tight text-foreground">{value}</div>
      <div className="mt-2 text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-muted-foreground"><span className="size-1.5 rounded-full bg-current" />{sub}</div>
    </div>
  );
}

/* ================================================================
   MAIN PAGE COMPONENT
   ================================================================ */
export default function AuditChainVerification() {
  const [isTampered, setIsTampered] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const tick = () => setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleAction = (msg: string) => toast({ title: msg, duration: 3000 });
  const integrity = isTampered ? 60 : 100;

  return (
    <div className="space-y-7">

      {/* ── HERO HEADER ──────────────────────────────────────── */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-primary">
            <span className={`size-2 rounded-full ${isTampered ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
            {isTampered ? 'Integrity breach detected' : 'Chain integrity verified'}
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-[30px]">
            Audit Chain Verification
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verify integrity of audit records and detect unauthorized modifications · Blockchain-style hash chaining
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold ${
            isTampered ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
          }`}>
            <span className={`size-1.5 rounded-full bg-current ${isTampered ? 'animate-pulse' : ''}`} />
            {isTampered ? 'Tampered' : 'All systems verified'}
          </span>
          <Link href="/audit-logs" className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold text-foreground shadow-sm hover:bg-muted">
            <ChevronRight size={15} className="rotate-180" />Audit Logs
          </Link>
        </div>
      </section>

      {/* ── CONTROL PRINCIPLES BAR ────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-3 font-mono text-[9px] font-bold uppercase tracking-[.18em] text-muted-foreground">
        <span className="flex items-center gap-2 text-primary"><ShieldCheck size={13} />Verify <span className="hidden font-sans font-normal normal-case tracking-normal text-muted-foreground sm:inline">hash chain integrity</span></span>
        <span className="text-border">/</span>
        <span className="flex items-center gap-2 text-blue-700"><GitBranch size={13} />Trace <span className="hidden font-sans font-normal normal-case tracking-normal text-muted-foreground sm:inline">event chain</span></span>
        <span className="text-border">/</span>
        <span className="flex items-center gap-2 text-red-700"><ShieldAlert size={13} />Detect <span className="hidden font-sans font-normal normal-case tracking-normal text-muted-foreground sm:inline">tampering & anomalies</span></span>
      </div>

      {/* ── TAMPER ALERT BANNER ────────────────────────────────── */}
      {isTampered && (
        <div className="flex items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm animate-rise-in">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-red-100 text-red-700"><ShieldAlert size={20} /></div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-red-800">Audit Log Tampering Detected</span>
              <span className="font-mono text-[9px] font-bold uppercase text-red-700">Critical</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-red-700/80">
              Hash chain integrity compromised at Event 003. Possible unauthorized modification detected. Immediate investigation required.
            </p>
          </div>
          <span className="hidden shrink-0 rounded-full bg-red-100 px-2.5 py-1 font-mono text-[10px] font-bold text-red-700 sm:inline-flex">
            <span className="mr-1.5 size-1.5 animate-pulse rounded-full bg-red-500" />Alert
          </span>
        </div>
      )}

      {/* ── MAIN GRID: Chain + Status + Table ─────────────────── */}
      <div className="grid gap-5 xl:grid-cols-[.9fr_1.35fr]">

        {/* LEFT: Chain Visualization + Chain Status */}
        <div className="space-y-5">

          {/* Chain Visualization */}
          <section>
            <SectionHeader eyebrow="Blockchain verification" title="Audit chain" />
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col items-center">
                {auditEvents.map((evt, i) => {
                  const t = isTampered && evt.id === 'EVT-003';
                  const d = isTampered && (evt.id === 'EVT-004' || evt.id === 'EVT-005');
                  const connBroken = isTampered && (evt.id === 'EVT-002' || evt.id === 'EVT-003');
                  return (
                    <div key={evt.id} className="flex w-full max-w-[300px] flex-col items-center">
                      <ChainEventNode evt={evt} tampered={t} downstream={d} />
                      {i < auditEvents.length - 1 && <ChainConnector broken={connBroken} />}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Chain Status */}
          <section>
            <SectionHeader eyebrow="Real-time status" title="Chain integrity" />
            <div className={`rounded-xl border bg-card p-5 shadow-sm ${isTampered ? 'border-red-200 ring-1 ring-red-100' : 'border-border'}`}>
              <div className="flex flex-col items-center text-center">
                <IntegrityRing percent={integrity} compromised={isTampered} />
                <div className="mt-4">
                  <div className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-muted-foreground">Chain status</div>
                  <div className={`mt-1 flex items-center justify-center gap-2 text-lg font-bold ${isTampered ? 'text-red-700' : 'text-emerald-700'}`}>
                    <span className={`size-2.5 rounded-full ${isTampered ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                    {isTampered ? 'COMPROMISED' : 'VALID'}
                  </div>
                  <p className="mx-auto mt-2 max-w-[240px] text-[11px] leading-relaxed text-muted-foreground">
                    {isTampered
                      ? 'Hash chain integrity breach detected. Event 003 has been tampered with.'
                      : 'All audit logs successfully verified. No tampering detected.'}
                  </p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/40 px-3 py-2.5 text-center">
                  <div className="font-mono text-lg font-bold text-foreground">{isTampered ? '3/5' : '5'}</div>
                  <div className="text-[10px] text-muted-foreground">Events verified</div>
                </div>
                <div className="rounded-lg bg-muted/40 px-3 py-2.5 text-center">
                  <div className="font-mono text-sm font-bold text-foreground">{currentTime}</div>
                  <div className="text-[10px] text-muted-foreground">Last verified</div>
                </div>
              </div>
            </div>
          </section>

          {/* Tampering Simulator */}
          <section>
            <SectionHeader eyebrow="Security testing" title="Tampering simulator" />
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-8 place-items-center rounded-lg bg-amber-50 text-amber-700"><Bug size={16} /></div>
                  <div>
                    <div className="text-xs font-bold text-foreground">Simulate log tampering</div>
                    <div className="text-[10px] text-muted-foreground">Modify Event 003 hash to test detection</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsTampered(!isTampered)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${isTampered ? 'bg-red-500' : 'bg-muted'}`}
                >
                  <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] ${isTampered ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
              {isTampered && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={13} className="text-red-700" />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-red-700">Simulation active</span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-red-700/80">
                    Event 003 hash has been altered. The chain verification system has detected the integrity breach and flagged the affected records.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT: Hash Table + Security Analysis + Actions */}
        <div className="space-y-5">

          {/* Hash Verification Table */}
          <section>
            <SectionHeader eyebrow="Cryptographic trail" title="Hash verification details" />
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-lg bg-blue-50 text-blue-700"><FileSearch size={16} /></div>
                  <div>
                    <div className="text-xs font-bold">Verification records</div>
                    <div className="text-[10px] text-muted-foreground">{auditEvents.length} events in chain</div>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:underline">
                  <Download size={13} />Export
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left">
                  <thead className="border-b border-border bg-muted/45">
                    <tr className="font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground">
                      <th className="px-4 py-3 font-bold">Event ID</th>
                      <th className="px-4 py-3 font-bold">Timestamp</th>
                      <th className="px-4 py-3 font-bold">Previous Hash</th>
                      <th className="px-4 py-3 font-bold">Current Hash</th>
                      <th className="px-4 py-3 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {auditEvents.map((evt) => {
                      const t = isTampered && evt.id === 'EVT-003';
                      const d = isTampered && (evt.id === 'EVT-004' || evt.id === 'EVT-005');
                      const hash = t ? evt.tamperedHash : evt.hash;
                      return (
                        <tr key={evt.id} className={`transition-colors ${t ? 'bg-red-50 hover:bg-red-100/60' : 'hover:bg-muted/30'}`}>
                          <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{evt.id}</td>
                          <td className="px-4 py-3 text-[11px] text-muted-foreground">{evt.timestamp}</td>
                          <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{evt.prevHash}</td>
                          <td className={`px-4 py-3 font-mono text-[11px] ${t ? 'font-bold text-red-700' : 'text-muted-foreground'}`}>{hash}</td>
                          <td className="px-4 py-3 text-center">
                            {t ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700">
                                <span className="size-1.5 rounded-full bg-current" />Mismatch
                              </span>
                            ) : d ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
                                <span className="size-1.5 rounded-full bg-current" />Suspect
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                                <span className="size-1.5 rounded-full bg-current" />Verified
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Security Analysis (on tamper) */}
          {isTampered && (
            <section className="animate-rise-in">
              <SectionHeader eyebrow="Root cause analysis" title="Security analysis" />
              <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 shadow-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Affected Event', value: 'EVT-003', mono: true },
                    { label: 'Issue Type', value: 'Hash Mismatch', mono: false },
                    { label: 'Severity', value: 'Critical', mono: false, dot: true },
                    { label: 'Risk Level', value: 'High', mono: false, bars: true },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                      <div className="font-mono text-[9px] font-bold uppercase tracking-wider text-red-500">{item.label}</div>
                      <div className="mt-1 flex items-center gap-2">
                        {item.dot && <span className="size-2 animate-pulse rounded-full bg-red-500" />}
                        {item.bars && (
                          <div className="flex gap-[2px]">
                            {[1,2,3,4].map(i => <div key={i} className="h-3.5 w-1.5 rounded-sm bg-red-500" />)}
                            <div className="h-3.5 w-1.5 rounded-sm bg-red-200" />
                          </div>
                        )}
                        <span className={`text-sm font-bold text-red-800 ${item.mono ? 'font-mono' : ''}`}>{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="font-mono text-[9px] font-bold uppercase tracking-wider text-red-500">Detailed analysis</div>
                  <p className="mt-2 text-[11px] leading-relaxed text-red-800/80">
                    The computed hash for Event 003 does not match the stored hash value, indicating the event record has been modified after initial logging.
                    This breaks the hash chain starting from Event 003, potentially invalidating all subsequent events.
                    The modification timestamp suggests unauthorized access occurred between the original log time and the last verification cycle.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Recommended Actions */}
          <section>
            <SectionHeader eyebrow="Response actions" title="Recommended actions" />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Search, label: 'Investigate Event', sub: 'Deep-dive into anomalies', tone: 'primary', msg: 'Launching investigation module…' },
                { icon: FileText, label: 'Export Audit Report', sub: 'Generate compliance PDF', tone: 'blue', msg: 'Generating audit report…' },
                { icon: FileWarning, label: 'Generate Forensic Report', sub: 'Full forensic analysis', tone: 'red', msg: 'Generating forensic report…' },
                { icon: RefreshCw, label: 'Rebuild Verification Chain', sub: 'Recompute all hashes', tone: 'amber', msg: 'Rebuilding verification chain…' },
              ].map(({ icon: Icon, label, sub, tone, msg }) => {
                const tones: Record<string, string> = { primary: 'bg-secondary text-primary', blue: 'bg-blue-50 text-blue-700', red: 'bg-red-50 text-red-700', amber: 'bg-amber-50 text-amber-700' };
                return (
                  <button key={label} onClick={() => handleAction(msg)}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                    <div className={`grid size-9 place-items-center rounded-lg ${tones[tone]}`}><Icon size={17} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold">{label}</div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">{sub}</div>
                    </div>
                    <ChevronRight size={15} className="text-muted-foreground/50 transition-transform group-hover:translate-x-1" />
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* ── FOOTER METRICS ────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FooterStat icon={Database} label="Total logs" value="2,847" tone="blue" sub="Since Jan 2026" />
        <FooterStat icon={CheckCircle2} label="Verified logs" value={isTampered ? '2,844' : '2,847'} tone="green" sub="Passed verification" />
        <FooterStat icon={XCircle} label="Failed verifications" value={isTampered ? '3' : '0'} tone={isTampered ? 'red' : 'blue'} sub="Hash mismatches" />
        <FooterStat icon={Clock} label="Last audit time" value={currentTime} tone="amber" sub="04 Sep 2026" />
      </div>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><ShieldCheck size={12} />SecureDocs Government Security Platform</span>
        <span className="font-mono">SHA-256 Chain Verification Protocol v2.4.1 · Classification: OFFICIAL</span>
      </div>
    </div>
  );
}
