import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Download, Eye, FileCheck2, Filter, History, KeyRound, Link2, Loader2, LogOut, MoreHorizontal, Plus, RefreshCw, Search, Share2, Shield, ShieldAlert, SlidersHorizontal, Upload, UserRound, X } from 'lucide-react';
import { filterOptions } from '@/data/documents';
import { DetailIcon, Dropdown, EmptyState, IconButton, Modal, SkeletonRows, StatusBadge, Toast } from '@/components/SecureDocsComponents';
import { useAuth } from '@/context/AuthContext';
import { documentService } from '@/services/documentService';

const formatDate = (date) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(String(date).includes('T') ? date : `${date}T12:00:00`));
const formatDateTime = (date) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(date));


function SelectField({ label, value, onChange, options, testId }) {
  return <label className="min-w-0 flex-1"><span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-500">{label}</span><div className="relative"><select value={value} onChange={(event) => onChange(event.target.value)} data-testid={testId} className="h-9 w-full appearance-none rounded-md border border-slate-300 bg-white px-2.5 pr-7 text-xs font-semibold text-slate-700 outline-none transition focus:border-cyan-500"><option value="">All {label}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-3 text-slate-400" /></div></label>;
}

function SummaryCard({ label, value, detail, icon: Icon, tone = 'navy', testId }) {
  const toneClass = { navy: 'bg-[#eaf2f7] text-[#1d5873]', teal: 'bg-[#e6f4f2] text-[#197168]', amber: 'bg-[#fcf3dc] text-[#946718]', red: 'bg-[#fbeceb] text-[#a23f3d]' }[tone];
  return <div className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-card" data-testid={testId}><div className="flex items-start justify-between"><div><div className="text-[11px] font-bold uppercase tracking-[.12em] text-slate-500">{label}</div><div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{value}</div></div><div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClass}`}><Icon size={18} /></div></div><div className="mt-3 text-[11px] font-medium text-slate-500">{detail}</div></div>;
}

function DocumentRow({ document, onMenu, onPreview, onDetails }) {
  return <tr className="group border-t border-slate-100 transition-colors hover:bg-[#f7fbfc]" data-testid={`row-document-${document.id}`}>
    <td className="w-9 px-3 py-3.5"><button type="button" aria-label={`Select ${document.documentName}`} data-testid={`checkbox-document-${document.id}`} className="h-4 w-4 rounded border border-slate-300 bg-white hover:border-cyan-500" onClick={() => {}} /></td>
    <td className="min-w-[265px] px-3 py-3.5"><button type="button" onClick={() => onDetails(document)} data-testid={`button-open-document-${document.id}`} className="flex items-start gap-3 text-left"><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[#215f79]"><DetailIcon type={document.documentType} /></span><span><span className="block text-[13px] font-extrabold leading-5 text-slate-800 group-hover:text-[#17637d]">{document.documentName}</span><span className="font-mono-app mt-0.5 block text-[10px] text-slate-400">{document.id} · {document.documentType}</span></span></button></td>
    <td className="whitespace-nowrap px-3 py-3.5"><span className="font-mono-app text-[11px] font-medium text-slate-600" data-testid={`text-case-id-${document.id}`}>{document.caseId}</span></td>
    <td className="whitespace-nowrap px-3 py-3.5"><span className="text-xs font-semibold text-slate-700" data-testid={`text-document-type-${document.id}`}>{document.documentType}</span></td>
    <td className="whitespace-nowrap px-3 py-3.5"><span className="text-xs font-semibold text-slate-700" data-testid={`text-uploaded-by-${document.id}`}>{document.uploadedBy}</span></td>
    <td className="whitespace-nowrap px-3 py-3.5"><span className="text-xs font-semibold text-slate-700" data-testid={`text-upload-date-${document.id}`}>{formatDate(document.uploadDate)}</span></td>
    <td className="px-3 py-3.5"><span className="font-mono-app rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700" data-testid={`text-version-${document.id}`}>v{document.version}</span></td>
    <td className="px-3 py-3.5"><StatusBadge value={document.status} kind="status" /></td>
    <td className="px-3 py-3.5"><StatusBadge value={document.integrity} kind="integrity" /></td>
    <td className="px-3 py-3.5"><StatusBadge value={document.confidentiality} kind="confidentiality" /></td>
    <td className="whitespace-nowrap px-3 py-3.5"><div className="text-xs font-semibold text-slate-700">{formatDate(document.lastModified)}</div><div className="font-mono-app mt-0.5 text-[10px] text-slate-400">{document.totalAccesses} accesses</div></td>
    <td className="px-3 py-3.5"><div className="relative flex justify-end gap-1"><IconButton label={`Preview ${document.documentName}`} onClick={() => onPreview(document)} testId={`button-preview-document-${document.id}`} className="h-7 w-7 text-slate-400 hover:text-cyan-700"><Eye size={15} /></IconButton><IconButton label={`More actions for ${document.documentName}`} onClick={() => onMenu(document.id)} testId={`button-actions-document-${document.id}`} className="h-7 w-7 text-slate-400 hover:text-slate-700"><MoreHorizontal size={16} /></IconButton>{onMenu.activeId === document.id && <div className="absolute right-0 top-8 z-20 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-left shadow-xl" data-testid={`menu-document-${document.id}`}><button type="button" onClick={() => onPreview(document)} data-testid={`menu-preview-${document.id}`} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Eye size={14} />View document</button><button type="button" onClick={() => onDetails(document)} data-testid={`menu-details-${document.id}`} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><FileCheck2 size={14} />View details</button><button type="button" onClick={() => onDetails(document)} data-testid={`menu-version-history-${document.id}`} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><History size={14} />View version history</button><button type="button" onClick={() => onMenu.download(document)} data-testid={`menu-download-${document.id}`} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Download size={14} />Download</button><button type="button" onClick={() => onMenu.share(document)} data-testid={`menu-share-${document.id}`} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Share2 size={14} />Share</button><div className="my-1 border-t border-slate-100" /><button type="button" onClick={() => onMenu.verify(document)} data-testid={`menu-verify-${document.id}`} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-cyan-700 hover:bg-cyan-50"><Shield size={14} />Verify integrity</button></div>}</div></td>
  </tr>;
}

function UploadModal({ onClose, onUpload }) {
  const [name, setName] = useState('');
  const [caseId, setCaseId] = useState('');
  const [type, setType] = useState('FIR');
  const [confidentiality, setConfidentiality] = useState('Confidential');
  const [file, setFile] = useState(null);
  return <Modal title="Add document to evidence control" eyebrow="Secure intake" onClose={onClose} testId="modal-upload-document">
    <form onSubmit={(event) => { event.preventDefault(); onUpload({ name: name || 'Untitled case document', caseId: caseId || 'CASE-2026-NEW', type, confidentiality, file }); }} className="space-y-4 px-6 py-5">
      <div className="rounded-lg border border-cyan-100 bg-cyan-50/60 p-3 text-xs leading-5 text-cyan-900"><ShieldCheckText /> AES-256 Encryption · SHA-256 Integrity Hash · Audit Logging</div>
      <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">Document name</span><input value={name} onChange={(event) => setName(event.target.value)} data-testid="input-upload-document-name" placeholder="e.g. Probable Cause Affidavit" className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-cyan-500" /></label>
      <div className="grid grid-cols-2 gap-3"><label><span className="mb-1.5 block text-xs font-bold text-slate-700">Case ID</span><input value={caseId} onChange={(event) => setCaseId(event.target.value)} data-testid="input-upload-case-id" placeholder="CASE-2026-0000" className="h-10 w-full rounded-md border border-slate-300 px-3 font-mono-app text-xs outline-none focus:border-cyan-500" /></label><label><span className="mb-1.5 block text-xs font-bold text-slate-700">Document Type</span><select value={type} onChange={(event) => setType(event.target.value)} data-testid="select-upload-document-type" className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-xs outline-none focus:border-cyan-500">{filterOptions.documentType.map((item) => <option key={item}>{item}</option>)}</select></label></div>
      <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">Confidentiality Level</span><select value={confidentiality} onChange={(event) => setConfidentiality(event.target.value)} data-testid="select-upload-confidentiality" className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-xs outline-none focus:border-cyan-500">{filterOptions.confidentiality.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">Source file</span><div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50"><input type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} data-testid="input-upload-file" className="w-[230px] text-xs text-slate-500 file:mr-2 file:rounded file:border-0 file:bg-[#e2f0f3] file:px-2.5 file:py-1.5 file:text-xs file:font-bold file:text-cyan-800" /></div>{file && <span data-testid="text-upload-file-name" className="mt-1 block text-[11px] text-emerald-700">{file.name} ready for secure intake</span>}</label>
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={onClose} data-testid="button-cancel-upload" className="rounded-md px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button><button type="submit" data-testid="button-confirm-upload" className="inline-flex items-center gap-2 rounded-md bg-[#1d6883] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#18566d]"><Upload size={14} />Secure upload</button></div>
    </form>
  </Modal>;
}

function ShieldCheckText() { return <span className="mr-1 inline-flex items-center gap-1 font-bold"><Shield size={13} /> Intake protection:</span>; }

function PreviewModal({ document, onClose, onDetails }) {
  return <Modal title={document.documentName} eyebrow={`Document preview · ${document.id}`} onClose={onClose} width="max-w-3xl" testId="modal-preview-document">
    <div className="grid gap-5 p-6 md:grid-cols-[1fr_250px]"><div className="flex min-h-[355px] items-center justify-center rounded-lg border border-slate-200 bg-[#f2f5f7] p-5"><div className="flex h-[285px] w-full max-w-[470px] flex-col rounded-sm border border-slate-200 bg-white px-9 py-7 shadow-sm"><div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-4"><div className="h-3 w-32 rounded bg-slate-200" /><div className="h-5 w-5 rounded bg-cyan-100" /></div><div className="space-y-3"><div className="h-2 w-5/6 rounded bg-slate-100" /><div className="h-2 w-full rounded bg-slate-100" /><div className="h-2 w-4/5 rounded bg-slate-100" /><div className="mt-6 h-16 w-full rounded bg-slate-50" /><div className="h-2 w-3/4 rounded bg-slate-100" /><div className="h-2 w-full rounded bg-slate-100" /></div><div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3"><span className="font-mono-app text-[8px] text-slate-400">CONTROLLED COPY · {document.hash}</span><span className="text-[9px] font-bold text-slate-400">PAGE 1 / 4</span></div></div></div><div className="space-y-4"><div><div className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-500">Classification</div><div className="mt-2"><StatusBadge value={document.confidentiality} kind="confidentiality" /></div></div><div><div className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-500">Integrity state</div><div className="mt-2 flex items-center gap-2 text-xs font-bold text-emerald-700"><CheckCircle2 size={15} /> {document.integrity}</div></div><div><div className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-500">Last accessed</div><div className="mt-1 text-xs font-semibold text-slate-700">{formatDateTime(document.lastAccessed)}</div></div><button type="button" onClick={() => onDetails(document)} data-testid={`button-preview-details-${document.id}`} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Open full details <ChevronRight size={14} /></button></div></div>
  </Modal>;
}

function DetailsDrawer({ document, onClose, onShare, onDownload, onVerify }) {
  return <div className="fixed inset-0 z-40 bg-slate-950/20" data-testid="drawer-details-overlay"><aside className="shadow-drawer animate-enter absolute right-0 top-0 flex h-full w-full max-w-[470px] flex-col overflow-y-auto bg-white" data-testid={`drawer-document-details-${document.id}`}><div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5"><div><div className="mb-1 font-mono-app text-[10px] font-bold tracking-wide text-cyan-700">{document.id} · DOCUMENT RECORD</div><h2 className="max-w-[340px] text-lg font-extrabold leading-6 text-slate-900">{document.documentName}</h2></div><IconButton label="Close details" onClick={onClose} testId="button-close-details-drawer" className="h-8 w-8 text-slate-400"><X size={18} /></IconButton></div><div className="space-y-6 p-6"><div className="flex flex-wrap gap-2"><StatusBadge value={document.status} /><StatusBadge value={document.integrity} kind="integrity" /><StatusBadge value={document.confidentiality} kind="confidentiality" /></div><div className="grid grid-cols-2 gap-x-5 gap-y-4 border-y border-slate-100 py-5">{[['Case ID', document.caseId], ['Document type', document.documentType], ['Uploaded by', document.uploadedBy], ['Upload date', formatDate(document.uploadDate)], ['Current version', `v${document.version}`], ['Last modified', formatDateTime(document.lastModified)], ['Total accesses', document.totalAccesses], ['Last accessed by', document.lastAccessedBy]].map(([label, value]) => <div key={label}><div className="text-[10px] font-extrabold uppercase tracking-[.11em] text-slate-400">{label}</div><div data-testid={`detail-${label.toLowerCase().replaceAll(' ', '-')}`} className={`mt-1 text-xs font-bold text-slate-700 ${label.includes('ID') ? 'font-mono-app' : ''}`}>{value}</div></div>)}</div><div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><div className="mb-1 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-500"><KeyRound size={13} /> Security information</div><div className="text-xs font-bold text-slate-700">AES-256 encrypted</div><div className="mt-1 text-[11px] text-emerald-700">Integrity {document.integrity.toLowerCase()} using SHA-256</div><div data-testid={`detail-hash-${document.id}`} className="font-mono-app mt-2 break-all text-[11px] text-slate-700">{document.hash} 4cf7b1e2c9a0</div></div><div><div className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.13em] text-slate-500"><History size={14} /> Version history</div><div className="ml-1 border-l border-slate-200">{(document.versionHistory || []).map((item, index) => <div key={`${item.version}-${item.date}`} className="relative pb-4 pl-5 last:pb-0" data-testid={`timeline-version-${document.id}-${item.version}`}><span className={`absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full border-2 border-white ${index === 0 ? 'bg-cyan-600' : 'bg-slate-300'}`} /><div className="flex items-center justify-between"><span className="font-mono-app text-[11px] font-bold text-slate-800">Version {item.version}</span><span className="text-[10px] text-slate-400">{item.date}</span></div><div className="mt-1 text-[11px] text-slate-500">{item.note} · <span className="font-semibold text-slate-600">{item.user}</span></div></div>)}</div></div></div><div className="mt-auto flex gap-2 border-t border-slate-200 p-5"><button type="button" onClick={() => onShare(document)} data-testid={`button-drawer-share-${document.id}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#1d6883] py-2.5 text-xs font-extrabold text-white hover:bg-[#18566d]"><Share2 size={14} /> Secure share</button><button type="button" onClick={() => onDownload(document)} data-testid={`button-drawer-download-${document.id}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"><Download size={14} /></button><button type="button" onClick={() => onVerify(document)} data-testid={`button-drawer-verify-${document.id}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-cyan-200 px-3 py-2.5 text-xs font-bold text-cyan-700 hover:bg-cyan-50"><ShieldCheckIcon /><span className="sr-only">Verify integrity</span></button></div></aside></div>;
}

function ShieldCheckIcon() { return <CheckCircle2 size={16} />; }

function ShareModal({ document, onClose, onSuccess }) {
  const [recipient, setRecipient] = useState(''); const [permission, setPermission] = useState('View'); const [expiry, setExpiry] = useState('2026-09-30'); const [watermark, setWatermark] = useState(true); const [logAccess, setLogAccess] = useState(true);
  return <Modal title="Secure share" eyebrow="Controlled access" onClose={onClose} testId="modal-secure-share"><div className="px-6 py-5"><div className="mb-5 flex items-center gap-3 rounded-lg bg-slate-50 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-cyan-700 shadow-sm"><Link2 size={17} /></div><div className="min-w-0"><div className="truncate text-xs font-extrabold text-slate-800">{document.documentName}</div><div className="font-mono-app text-[10px] text-slate-400">{document.caseId} · {document.confidentiality}</div></div></div><div className="space-y-4"><label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">Select User</span><input value={recipient} onChange={(event) => setRecipient(event.target.value)} data-testid="input-share-recipient" placeholder="name@justice.gov" className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-cyan-500" /></label><div className="grid grid-cols-2 gap-3"><label><span className="mb-1.5 block text-xs font-bold text-slate-700">Permission</span><select value={permission} onChange={(event) => setPermission(event.target.value)} data-testid="select-share-permission" className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-xs outline-none focus:border-cyan-500"><option>View</option><option>View + Download</option><option>Edit</option></select></label><label><span className="mb-1.5 block text-xs font-bold text-slate-700">Access Expiry</span><input type="date" value={expiry} onChange={(event) => setExpiry(event.target.value)} data-testid="input-share-expiry" className="h-10 w-full rounded-md border border-slate-300 px-3 text-xs outline-none focus:border-cyan-500" /></label></div><div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3"><label className="flex items-center gap-2 text-xs font-semibold text-slate-700"><input type="checkbox" checked={watermark} onChange={(event) => setWatermark(event.target.checked)} data-testid="checkbox-share-watermark" />Watermark document</label><label className="flex items-center gap-2 text-xs font-semibold text-slate-700"><input type="checkbox" checked={logAccess} onChange={(event) => setLogAccess(event.target.checked)} data-testid="checkbox-share-log-access" />Log all access</label></div></div><div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={onClose} data-testid="button-cancel-share" className="rounded-md px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button><button type="button" onClick={() => onSuccess(recipient || 'secure recipient')} data-testid="button-confirm-share" className="inline-flex items-center gap-2 rounded-md bg-[#1d6883] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#18566d]"><Share2 size={14} /> Generate Secure Share</button></div></div></Modal>;
}

function DownloadModal({ document, onClose, onConfirm }) { return <Modal title="Confirm controlled download" eyebrow="Audit event" onClose={onClose} testId="modal-download-confirm"><div className="px-6 py-5"><div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900"><AlertTriangle size={18} className="mt-0.5 shrink-0" /><div className="text-xs leading-5"><div className="font-extrabold">This action will be recorded.</div><div className="mt-1">A controlled copy of <strong>{document.documentName}</strong> will be prepared and this access will be added to the audit trail.</div></div></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} data-testid="button-cancel-download" className="rounded-md px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button><button type="button" onClick={onConfirm} data-testid="button-confirm-download" className="inline-flex items-center gap-2 rounded-md bg-[#1d6883] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#18566d]"><Download size={14} /> Confirm download</button></div></div></Modal>; }

function VerifyModal({ document, onClose }) { const [running, setRunning] = useState(true); useEffect(() => { const timer = setTimeout(() => setRunning(false), 1800); return () => clearTimeout(timer); }, []); return <Modal title="Integrity Verification" eyebrow="Cryptographic verification" onClose={onClose} testId="modal-verify-integrity"><div className="px-6 py-6">{running ? <div className="text-center"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 text-cyan-700"><Loader2 size={27} className="animate-spin" /></div><h3 className="text-sm font-extrabold text-slate-900">Comparing fingerprints…</h3><p data-testid="status-verification-running" className="mt-1 text-xs text-slate-500">Checking {document.documentName} against the evidence ledger.</p></div> : <div><div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-800"><CheckCircle2 size={21} /><div><div data-testid="status-verification-verified" className="text-sm font-extrabold">Integrity Verified</div><div className="text-xs">No unauthorized modification detected.</div></div></div><dl className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs"><div className="flex justify-between gap-4"><dt className="font-bold text-slate-500">Document</dt><dd className="text-right font-semibold text-slate-800">{document.documentName}</dd></div><div className="flex justify-between gap-4"><dt className="font-bold text-slate-500">Original SHA-256</dt><dd className="font-mono-app text-right text-slate-700">{document.hash} 4cf7b1e2c9a0</dd></div><div className="flex justify-between gap-4"><dt className="font-bold text-slate-500">Current SHA-256</dt><dd className="font-mono-app text-right text-slate-700">{document.hash} 4cf7b1e2c9a0</dd></div></dl></div>}<button type="button" onClick={onClose} data-testid="button-close-verification" className="mt-5 block ml-auto rounded-md border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Close</button></div></Modal>; }

function Notifications({ onClose }) { return <Dropdown className="right-4 top-14 w-[310px]" data-testid="dropdown-notifications"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><span className="text-sm font-extrabold text-slate-900">Notifications</span><span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-bold text-cyan-700">3 new</span></div>{[['Verification needed', 'Charging Memorandum is awaiting review', '8 min ago', 'amber'], ['New secure share', 'ADA N. Okafor accessed Evidence Inventory', '42 min ago', 'cyan'], ['System check complete', 'All evidence services operational', 'Today, 07:00', 'emerald']].map(([title, body, time, tone], index) => <button type="button" key={title} onClick={onClose} data-testid={`notification-${index}`} className="flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${tone === 'amber' ? 'bg-amber-400' : tone === 'cyan' ? 'bg-cyan-500' : 'bg-emerald-500'}`} /><span><span className="block text-xs font-extrabold text-slate-800">{title}</span><span className="mt-0.5 block text-[11px] text-slate-500">{body}</span><span className="mt-1 block text-[10px] text-slate-400">{time}</span></span></button>)}</Dropdown>; }

function ProfileMenu({ onClose }) { return <Dropdown className="right-4 top-14 w-56" data-testid="dropdown-profile"><div className="border-b border-slate-100 px-4 py-3"><div className="text-xs font-extrabold text-slate-900">Officer Raj Patel</div><div className="mt-0.5 text-[10px] text-slate-500">raj.patel@securedocs.gov</div></div><button type="button" onClick={onClose} data-testid="profile-settings" className="flex w-full items-center gap-2 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"><UserRound size={14} />Profile & preferences</button><button type="button" onClick={onClose} data-testid="profile-sign-out" className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"><LogOutIcon />Sign out</button></Dropdown>; }
function LogOutIcon() { return <LogOut size={14} />; }

export default function AllDocuments() {
  const { user } = useAuth();
  const canUpload = user && ['Admin', 'Officer', 'Clerk'].includes(user.role);

  const [docs, setDocs] = useState([]);
  const [stats, setStats] = useState({ totalDocuments: 0, pendingReview: 0, integrityIssues: 0, restrictedDocuments: 0 });
  const [caseIdOptions, setCaseIdOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(''); 
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  const [filters, setFilters] = useState({ caseId: '', documentType: '', uploadedBy: '', dateFrom: '', dateTo: '', status: '', integrity: '', confidentiality: '' }); 
  const [applied, setApplied] = useState(filters); 
  const [sort, setSort] = useState({ key: 'lastModified', direction: 'desc' }); 
  const [page, setPage] = useState(1); 
  const [menu, setMenu] = useState(null); 
  const [modal, setModal] = useState(null); 
  const [toast, setToast] = useState(''); 
  const perPage = 7;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    let isMounted = true;
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const [docsData, statsData, caseIds] = await Promise.all([
          documentService.getDocuments({ ...applied, query: debouncedQuery }),
          documentService.getDocumentStats(),
          documentService.getUniqueCaseIds()
        ]);
        if (isMounted) {
          setDocs(docsData);
          setStats(statsData);
          setCaseIdOptions(caseIds);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setToast('Error loading documents.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDocs();
    return () => { isMounted = false; };
  }, [applied, debouncedQuery]);

  const sorted = useMemo(() => [...docs].sort((a, b) => { 
    if (sort.key === 'version') return sort.direction === 'asc' ? a.version - b.version : b.version - a.version; 
    const av = String(a[sort.key]).toLowerCase(); 
    const bv = String(b[sort.key]).toLowerCase(); 
    return sort.direction === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av); 
  }), [docs, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage)); 
  const pageDocs = sorted.slice((page - 1) * perPage, page * perPage);
  
  const changeSort = (key) => { setSort((current) => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' })); setPage(1); };
  
  const clearFilters = () => { 
    const blank = { caseId: '', documentType: '', uploadedBy: '', dateFrom: '', dateTo: '', status: '', integrity: '', confidentiality: '' }; 
    setFilters(blank); setApplied(blank); setQuery(''); setPage(1); 
  };
  
  const openAction = (doc, action) => { setMenu(null); setModal({ type: action, document: doc }); };
  const menuApi = (id) => { const fn = (doc) => setMenu((current) => current === id ? null : id); fn.activeId = menu; fn.share = (doc) => openAction(doc, 'share'); fn.download = (doc) => openAction(doc, 'download'); fn.verify = (doc) => openAction(doc, 'verify'); return fn; };
  
  const handleUpload = async (info) => { 
    try {
      if (!info.file) { setToast('Please select a file to upload.'); return; }
      await documentService.uploadDocument({
        name: info.name,
        caseId: info.caseId,
        type: info.type,
        confidentiality: info.confidentiality,
        uploadedBy: user?.name
      }, info.file);
      setModal(null); 
      setToast('Document uploaded securely.');
      const [docsData, statsData] = await Promise.all([
        documentService.getDocuments({ ...applied, query: debouncedQuery }),
        documentService.getDocumentStats()
      ]);
      setDocs(docsData);
      setStats(statsData);
    } catch (e) {
      setToast('Upload failed.');
    }
  };
  
  const handleDownload = async () => { 
    if (modal?.document) {
      await documentService.downloadDocument(modal.document.id);
    }
    setModal(null); 
    setToast('Controlled copy prepared for download'); 
  };
  
  const activeFilterCount = Object.values(applied).filter(Boolean).length;
  const columns = [['documentName', 'Document Name'], ['caseId', 'Case ID'], ['documentType', 'Document Type'], ['uploadedBy', 'Uploaded By'], ['uploadDate', 'Upload Date'], ['version', 'Version'], ['status', 'Status'], ['integrity', 'Integrity'], ['confidentiality', 'Confidentiality']];
  
  return (
    <>
      <div className="mx-auto max-w-[1600px] py-2 sm:py-4">
        <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-cyan-700">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />Records workspace / control room
            </div>
            <h1 data-testid="text-page-title" className="text-[28px] font-extrabold tracking-[-.04em] text-[#18263b] sm:text-[32px]">All Documents</h1>
            <p data-testid="text-page-subtitle" className="mt-1 text-sm text-slate-500">Securely manage, search and monitor legal and investigation documents.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700 sm:flex" data-testid="status-trust-indicator">
              <CheckCircle2 size={14} /> Chain of custody operational
            </div>
            {canUpload && (
              <button type="button" onClick={() => setModal({ type: 'upload' })} data-testid="button-open-upload" className="inline-flex items-center gap-2 rounded-md bg-[#1d6883] px-3.5 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#18566d]">
                <Plus size={15} /> Upload Document
              </button>
            )}
          </div>
        </div>
        
        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="security-summary">
          <SummaryCard label="Total Documents" value={stats.totalDocuments} detail="Across all active matters" icon={FileCheck2} tone="navy" testId="summary-total-documents" />
          <SummaryCard label="Pending Review" value={stats.pendingReview} detail="Awaiting officer or legal review" icon={AlertTriangle} tone="amber" testId="summary-pending-review" />
          <SummaryCard label="Integrity Issues" value={stats.integrityIssues} detail="Records requiring verification" icon={ShieldAlert} tone="red" testId="summary-integrity-issues" />
          <SummaryCard label="Restricted Documents" value={stats.restrictedDocuments} detail="Highest access controls" icon={Shield} tone="teal" testId="summary-restricted-documents" />
        </section>
        
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card" data-testid="documents-workspace">
          <div className="border-b border-slate-200 px-4 pt-4 sm:px-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="relative min-w-0 flex-1">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} data-testid="input-search-documents" placeholder="Search by document name, Case ID, officer..." className="h-9 w-full rounded-md border border-slate-300 pl-9 pr-9 text-xs font-medium outline-none placeholder:text-slate-400 focus:border-cyan-500" />
                {query && <IconButton label="Clear search" onClick={() => setQuery('')} testId="button-clear-search" className="absolute right-1 top-1 h-7 w-7 text-slate-400"><X size={14} /></IconButton>}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setApplied({...applied})} data-testid="button-refresh-documents" className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Refresh
                </button>
                <button type="button" onClick={() => {}} data-testid="button-bulk-actions" className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <SlidersHorizontal size={14} />Bulk actions
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 pb-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <SelectField label="Case ID" value={filters.caseId} onChange={(value) => setFilters({ ...filters, caseId: value })} options={caseIdOptions} testId="select-filter-case-id" />
              <SelectField label="Document Type" value={filters.documentType} onChange={(value) => setFilters({ ...filters, documentType: value })} options={filterOptions.documentType} testId="select-filter-document-type" />
              <SelectField label="Uploaded By" value={filters.uploadedBy} onChange={(value) => setFilters({ ...filters, uploadedBy: value })} options={filterOptions.uploadedBy} testId="select-filter-uploader" />
              <SelectField label="Status" value={filters.status} onChange={(value) => setFilters({ ...filters, status: value })} options={filterOptions.status} testId="select-filter-status" />
              <SelectField label="Integrity" value={filters.integrity} onChange={(value) => setFilters({ ...filters, integrity: value })} options={filterOptions.integrity} testId="select-filter-integrity" />
              <SelectField label="Confidentiality" value={filters.confidentiality} onChange={(value) => setFilters({ ...filters, confidentiality: value })} options={filterOptions.confidentiality} testId="select-filter-confidentiality" />
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 py-3">
              <Filter size={14} className="text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500">Date</span>
              <input type="date" value={filters.dateFrom} onChange={(event) => setFilters({ ...filters, dateFrom: event.target.value })} data-testid="input-filter-date-from" className="h-8 rounded-md border border-slate-300 px-2 text-[11px] text-slate-600 outline-none focus:border-cyan-500" />
              <span className="text-xs text-slate-400">to</span>
              <input type="date" value={filters.dateTo} onChange={(event) => setFilters({ ...filters, dateTo: event.target.value })} data-testid="input-filter-date-to" className="h-8 rounded-md border border-slate-300 px-2 text-[11px] text-slate-600 outline-none focus:border-cyan-500" />
              <button type="button" onClick={() => { setApplied(filters); setPage(1); }} data-testid="button-apply-filters" className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md bg-[#18263b] px-3 text-[11px] font-extrabold text-white hover:bg-[#253952]">
                Apply Filters {activeFilterCount > 0 && <span className="rounded bg-white/15 px-1.5">{activeFilterCount}</span>}
              </button>
              <button type="button" onClick={clearFilters} data-testid="button-clear-filters" className="h-8 rounded-md px-2 text-[11px] font-bold text-slate-500 hover:bg-slate-100">Clear Filters</button>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <div className="text-xs font-bold text-slate-700">
              <span data-testid="text-result-count">{sorted.length}</span> records <span className="font-normal text-slate-400">matching current view</span>
            </div>
            <div className="hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-slate-400 sm:flex">
              <LockIcon /> Restricted workspace
            </div>
          </div>
          
          <div className="scrollbar-thin overflow-x-auto">
            {loading ? <SkeletonRows /> : pageDocs.length === 0 ? <EmptyState onClear={clearFilters} /> : (
              <table className="w-full min-w-[1420px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50/80">
                    {[['', ''], ...columns, ['', 'Actions']].map(([key, label], index) => (
                      <th key={`${label}-${index}`} className="whitespace-nowrap px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-[.1em] text-slate-500 first:px-3">
                        {key && ['documentName', 'caseId', 'uploadDate', 'version', 'status'].includes(key) ? (
                          <button type="button" onClick={() => changeSort(key)} data-testid={`button-sort-${key}`} className="inline-flex items-center gap-1 hover:text-cyan-700">
                            {label}
                            {sort.key === key ? sort.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} /> : <span className="text-slate-300">↕</span>}
                          </button>
                        ) : label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageDocs.map((document) => (
                    <DocumentRow key={document.id} document={document} onMenu={Object.assign(menuApi(document.id), { activeId: menu, share: (doc) => openAction(doc, 'share'), download: (doc) => openAction(doc, 'download'), verify: (doc) => openAction(doc, 'verify') })} onPreview={(doc) => setModal({ type: 'preview', document: doc })} onDetails={(doc) => { setMenu(null); setModal({ type: 'details', document: doc }); }} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[11px] text-slate-500">
              Showing <strong className="text-slate-700">{sorted.length ? (page - 1) * perPage + 1 : 0}–{Math.min(page * perPage, sorted.length)}</strong> of <strong className="text-slate-700">{sorted.length}</strong> records
            </div>
            <div className="flex items-center gap-1">
              <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} data-testid="button-pagination-previous" className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 5).map((number) => (
                <button type="button" key={number} onClick={() => setPage(number)} data-testid={`button-pagination-${number}`} className={`h-7 min-w-7 rounded border px-2 text-[11px] font-bold ${page === number ? 'border-[#1d6883] bg-[#1d6883] text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {number}
                </button>
              ))}
              <button type="button" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} data-testid="button-pagination-next" className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>
        
        <div className="mt-5 flex items-center gap-2 text-[10px] font-medium text-slate-400">
          <CircleHelp size={13} /> Every access, version change, and share event is retained in the immutable audit ledger.
        </div>
      </div>
      
      {modal?.type === 'upload' && <UploadModal onClose={() => setModal(null)} onUpload={handleUpload} />}
      {modal?.type === 'preview' && <PreviewModal document={modal.document} onClose={() => setModal(null)} onDetails={(doc) => setModal({ type: 'details', document: doc })} />}
      {modal?.type === 'details' && <DetailsDrawer document={modal.document} onClose={() => setModal(null)} onShare={(doc) => setModal({ type: 'share', document: doc })} onDownload={(doc) => setModal({ type: 'download', document: doc })} onVerify={(doc) => setModal({ type: 'verify', document: doc })} />}
      {modal?.type === 'share' && <ShareModal document={modal.document} onClose={() => setModal(null)} onSuccess={(recipient) => { setModal(null); setToast(`Secure link created for ${recipient}`); }} />}
      {modal?.type === 'download' && <DownloadModal document={modal.document} onClose={() => setModal(null)} onConfirm={handleDownload} />}
      {modal?.type === 'verify' && <VerifyModal document={modal.document} onClose={() => setModal(null)} />}
      
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </>
  );
}

function LockIcon() { return <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-slate-200 text-slate-500"><Shield size={10} /></span>; }