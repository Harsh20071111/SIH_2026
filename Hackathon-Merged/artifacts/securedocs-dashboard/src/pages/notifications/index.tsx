import { useState, useMemo } from 'react';
import {
  Bell,
  AlertTriangle,
  ShieldCheck,
  ClipboardCheck,
  CheckCircle,
  Search,
  Check,
  Eye,
  Trash,
  X,
  FileWarning,
  SlidersHorizontal,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

// Define the notification types and data structure
type NotificationType = 'High Risk' | 'Integrity Alert' | 'Review Required' | 'Document Approved' | 'System';
type NotificationStatus = 'Unread' | 'Read';
type DateFilter = 'Today' | 'Last 7 Days' | 'Last 30 Days' | 'All Time';

interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  timestamp: string;
  date: Date;
  details: Record<string, string>;
  risk?: 'High' | 'Critical' | 'Medium' | 'Low';
}

const initialNotifications: NotificationData[] = [
  {
    id: '1',
    type: 'High Risk',
    title: 'HIGH RISK ACTIVITY',
    message: 'Officer A accessed 37 documents.',
    status: 'Unread',
    timestamp: 'Today, 10:42 AM',
    date: new Date(),
    risk: 'High',
    details: {
      User: 'Officer A',
      Activity: 'Multiple document access',
      'Documents Accessed': '37',
      'Risk Level': 'HIGH',
    },
  },
  {
    id: '2',
    type: 'Integrity Alert',
    title: 'INTEGRITY ALERT',
    message: 'Evidence.pdf has a hash mismatch.',
    status: 'Unread',
    timestamp: 'Today, 09:35 AM',
    date: new Date(),
    risk: 'Critical',
    details: {
      Document: 'Evidence.pdf',
      'Case ID': 'C-1024',
      'Expected Hash': 'A7F32...',
      'Current Hash': 'B91C4...',
      'Integrity Status': 'MISMATCH',
    },
  },
  {
    id: '3',
    type: 'Review Required',
    title: 'REVIEW REQUIRED',
    message: 'ForensicReport.pdf is waiting for approval.',
    status: 'Unread',
    timestamp: 'Today, 08:20 AM',
    date: new Date(),
    details: {
      Document: 'ForensicReport.pdf',
      'Case ID': 'C-1025',
      'Submitted By': 'Officer A',
      'Assigned Reviewer': 'Reviewer B',
      Status: 'Pending Approval',
    },
  },
  {
    id: '4',
    type: 'Document Approved',
    title: 'DOCUMENT APPROVED',
    message: 'FIR.pdf approved by Reviewer B.',
    status: 'Read',
    timestamp: 'Yesterday, 04:15 PM',
    date: new Date(Date.now() - 86400000),
    details: {
      Document: 'FIR.pdf',
      'Case ID': 'C-1024',
      'Approved By': 'Reviewer B',
      Status: 'Approved',
    },
  },
];

export default function Notifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationData[]>(initialNotifications);
  
  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('All Time');
  
  // Modal State
  const [selectedNotification, setSelectedNotification] = useState<NotificationData | null>(null);
  
  // Derived state
  const unreadCount = notifications.filter((n) => n.status === 'Unread').length;
  const highRiskCount = notifications.filter((n) => n.type === 'High Risk' && n.status === 'Unread').length;
  const integrityCount = notifications.filter((n) => n.type === 'Integrity Alert' && n.status === 'Unread').length;
  const reviewCount = notifications.filter((n) => n.type === 'Review Required' && n.status === 'Unread').length;
  const approvedCount = notifications.filter((n) => n.type === 'Document Approved' && n.status === 'Unread').length;
  
  // Handlers
  const handleMarkAsRead = (id: string, notify = true) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'Read' } : n))
    );
    if (notify) {
      toast({
        title: 'Success',
        description: 'Notification marked as read.',
      });
    }
    if (selectedNotification?.id === id) {
      setSelectedNotification(prev => prev ? { ...prev, status: 'Read' } : null);
    }
  };
  
  const handleMarkAsUnread = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'Unread' } : n))
    );
    toast({
      title: 'Success',
      description: 'Notification marked as unread.',
    });
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, status: 'Read' })));
    toast({
      title: 'Success',
      description: 'All notifications marked as read.',
    });
  };
  
  const handleClearFilters = () => {
    setSearch('');
    setTypeFilter('All');
    setStatusFilter('All');
    setDateFilter('All Time');
    toast({
      title: 'Filters cleared',
      description: 'All filters have been reset.',
    });
  };
  
  const handleViewDetails = (notification: NotificationData) => {
    setSelectedNotification(notification);
    if (notification.status === 'Unread') {
      handleMarkAsRead(notification.id, false);
    }
  };

  const handleActionClick = (notification: NotificationData) => {
    toast({
      title: 'Action triggered',
      description: `Opening relevant page for ${notification.title}...`,
    });
  };

  // Filtering Logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Search
      const searchMatch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.message.toLowerCase().includes(search.toLowerCase());
      if (!searchMatch) return false;
      
      // Type
      if (typeFilter !== 'All' && n.type !== typeFilter) return false;
      
      // Status
      if (statusFilter !== 'All' && n.status !== statusFilter) return false;
      
      // Date
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - n.date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateFilter === 'Today' && diffDays > 1) return false;
      if (dateFilter === 'Last 7 Days' && diffDays > 7) return false;
      if (dateFilter === 'Last 30 Days' && diffDays > 30) return false;
      
      return true;
    });
  }, [notifications, search, typeFilter, statusFilter, dateFilter]);
  
  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'High Risk': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'Integrity Alert': return <FileWarning className="h-5 w-5 text-red-600" />;
      case 'Review Required': return <Clock className="h-5 w-5 text-amber-500" />;
      case 'Document Approved': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      default: return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };
  
  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'High Risk': return 'bg-red-50 border-red-200 text-red-700';
      case 'Integrity Alert': return 'bg-red-50 border-red-200 text-red-700';
      case 'Review Required': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'Document Approved': return 'bg-green-50 border-green-200 text-green-700';
      default: return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };
  
  return (
    <div className="flex h-full flex-col bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-8 py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Notifications</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Monitor security alerts, document activity, reviews, and system notifications.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <Bell className="h-4 w-4" />
            <span>{unreadCount} Unread</span>
          </div>
          <Button variant="outline" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard 
              icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
              title="High Risk"
              count={highRiskCount}
              colorClass="border-red-200 bg-red-50"
              onClick={() => { setTypeFilter('High Risk'); setStatusFilter('Unread'); }}
            />
            <SummaryCard 
              icon={<FileWarning className="h-5 w-5 text-red-600" />}
              title="Integrity Alerts"
              count={integrityCount}
              colorClass="border-red-200 bg-red-50"
              onClick={() => { setTypeFilter('Integrity Alert'); setStatusFilter('Unread'); }}
            />
            <SummaryCard 
              icon={<ClipboardCheck className="h-5 w-5 text-amber-500" />}
              title="Review Required"
              count={reviewCount}
              colorClass="border-amber-200 bg-amber-50"
              onClick={() => { setTypeFilter('Review Required'); setStatusFilter('Unread'); }}
            />
            <SummaryCard 
              icon={<CheckCircle className="h-5 w-5 text-green-600" />}
              title="Approved"
              count={approvedCount}
              colorClass="border-green-200 bg-green-50"
              onClick={() => { setTypeFilter('Document Approved'); setStatusFilter('Unread'); }}
            />
          </div>
          
          {/* Main Content */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Filters */}
            <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search notifications..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="High Risk">High Risk</SelectItem>
                    <SelectItem value="Integrity Alert">Integrity Alert</SelectItem>
                    <SelectItem value="Review Required">Review Required</SelectItem>
                    <SelectItem value="Document Approved">Document Approved</SelectItem>
                    <SelectItem value="System">System</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Unread">Unread</SelectItem>
                    <SelectItem value="Read">Read</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Time">All Time</SelectItem>
                    <SelectItem value="Today">Today</SelectItem>
                    <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
                    <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="ghost" onClick={handleClearFilters} className="text-slate-500 hover:text-slate-900">
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </div>
            
            {/* Notification List */}
            <div className="flex flex-col">
              <div className="p-4 px-6 text-sm font-semibold tracking-wider text-slate-500">
                NOTIFICATION CENTER
              </div>
              <div className="divide-y divide-slate-100">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      <Bell className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-slate-900">No notifications found</h3>
                    <p className="mt-1 text-sm text-slate-500">There are no notifications matching your current filters.</p>
                    <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`flex flex-col gap-4 p-6 transition-colors hover:bg-slate-50 sm:flex-row sm:items-start ${notification.status === 'Unread' ? 'bg-blue-50/30' : 'bg-white'}`}
                    >
                      <div className="flex shrink-0 items-center justify-center rounded-full p-2">
                        {getTypeIcon(notification.type)}
                      </div>
                      
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm tracking-wide ${notification.status === 'Unread' ? 'font-bold text-[#111827]' : 'font-medium text-[#111827]'}`}>
                            {notification.title}
                          </h4>
                          {notification.status === 'Unread' && (
                            <span className="flex h-2 w-2 rounded-full bg-[#2563EB]"></span>
                          )}
                          <Badge variant="outline" className={`ml-auto hidden sm:inline-flex ${getTypeColor(notification.type)}`}>
                            {notification.type}
                          </Badge>
                        </div>
                        <p className={`text-sm ${notification.status === 'Unread' ? 'text-slate-800' : 'text-slate-600'}`}>
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {notification.timestamp}
                        </p>
                      </div>
                      
                      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                        <Button size="sm" onClick={() => handleViewDetails(notification)} className="w-full sm:w-auto bg-[#2563EB] hover:bg-blue-700">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                        {notification.status === 'Unread' ? (
                          <Button size="sm" variant="ghost" className="w-full sm:w-auto text-slate-500 hover:text-slate-900" onClick={() => handleMarkAsRead(notification.id)}>
                            <Check className="mr-2 h-4 w-4" />
                            Mark as Read
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" className="w-full sm:w-auto text-slate-500 hover:text-slate-900" onClick={() => handleMarkAsUnread(notification.id)}>
                            Mark as Unread
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Details Modal */}
      <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              {selectedNotification && getTypeIcon(selectedNotification.type)}
              <Badge variant="outline" className={selectedNotification ? getTypeColor(selectedNotification.type) : ''}>
                {selectedNotification?.type}
              </Badge>
            </div>
            <DialogTitle className="text-xl">{selectedNotification?.title}</DialogTitle>
            <DialogDescription className="text-base text-slate-900 mt-2 font-medium">
              {selectedNotification?.message}
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
            <dl className="space-y-3 text-sm">
              {selectedNotification?.details && Object.entries(selectedNotification.details).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:justify-between">
                  <dt className="text-slate-500">{key}:</dt>
                  <dd className="font-medium text-slate-900">{value}</dd>
                </div>
              ))}
              <div className="flex flex-col sm:flex-row sm:justify-between pt-3 border-t border-slate-200 mt-3">
                <dt className="text-slate-500">Timestamp:</dt>
                <dd className="font-medium text-slate-900">{selectedNotification?.timestamp}</dd>
              </div>
            </dl>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setSelectedNotification(null)} className="w-full sm:w-auto">
              Close
            </Button>
            {selectedNotification?.status === 'Unread' && (
              <Button variant="secondary" onClick={() => {
                if (selectedNotification) handleMarkAsRead(selectedNotification.id);
              }} className="w-full sm:w-auto">
                Mark as Read
              </Button>
            )}
            <Button className="w-full sm:w-auto bg-[#2563EB] hover:bg-blue-700" onClick={() => {
              if (selectedNotification) handleActionClick(selectedNotification);
              setSelectedNotification(null);
            }}>
              Take Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({ 
  icon, 
  title, 
  count, 
  colorClass,
  onClick 
}: { 
  icon: React.ReactNode; 
  title: string; 
  count: number; 
  colorClass: string;
  onClick: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className={`group cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md ${count > 0 ? colorClass : 'border-slate-200 bg-white'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${count > 0 ? 'bg-white/60' : 'bg-slate-100'}`}>
            {icon}
          </div>
          <span className="font-medium text-slate-700">{title}</span>
        </div>
        <span className={`text-xl font-bold ${count > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
          {count}
        </span>
      </div>
    </div>
  );
}
