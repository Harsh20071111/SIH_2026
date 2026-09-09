import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export type NotificationType = 'High Risk' | 'Integrity Alert' | 'Review Required' | 'Document Approved' | 'System';
export type NotificationStatus = 'Unread' | 'Read';

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  timestamp: string;
  date: Date;
  details: Record<string, string>;
  risk?: 'High' | 'Critical' | 'Medium' | 'Low';
  targetRoute?: string;
  targetId?: string;
}

const initialNotifications: NotificationData[] = [
  {
    id: 'n1',
    type: 'High Risk',
    title: 'Suspicious access pattern detected',
    message: 'Multiple failed attempts from an unknown IP.',
    status: 'Unread',
    timestamp: '1 hour ago',
    date: new Date(),
    risk: 'High',
    details: {
      User: 'Unknown',
      Activity: 'Repeated failed logins',
      'Risk Level': 'HIGH',
    },
    targetRoute: '/security',
    targetId: 'alert-1',
  },
  {
    id: 'n2',
    type: 'Integrity Alert',
    title: 'Evidence_v3.pdf needs integrity review',
    message: 'Hash mismatch detected on a version of Evidence_v3.pdf.',
    status: 'Unread',
    timestamp: '2 hours ago',
    date: new Date(),
    risk: 'Critical',
    details: {
      Document: 'Evidence_v3.pdf',
      'Case ID': 'C-1024',
      'Integrity Status': 'MISMATCH',
    },
    targetRoute: '/reviews/C-1024',
    targetId: 'RV-2048',
  },
  {
    id: 'n3',
    type: 'Review Required',
    title: '12 reviews due today',
    message: 'You have 12 pending document reviews that require attention today.',
    status: 'Unread',
    timestamp: '3 hours ago',
    date: new Date(),
    details: {
      'Pending Count': '12',
      'Priority': 'High',
    },
    targetRoute: '/reviews',
    targetId: 'due-today',
  },
  {
    id: 'n4',
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
    targetRoute: '/documents',
  },
];

interface NotificationContextType {
  notifications: NotificationData[];
  unreadCount: number;
  handleMarkAsRead: (id: string, notify?: boolean) => void;
  handleMarkAsUnread: (id: string) => void;
  handleMarkAllAsRead: () => void;
  handleNotificationClick: (notification: NotificationData, closeDropdown?: () => void) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationData[]>(() => {
    // Check localStorage for persisted notification state
    const saved = localStorage.getItem('securedocs_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // We must re-hydrate Date objects
        return parsed.map((n: any) => ({
          ...n,
          date: new Date(n.date)
        }));
      } catch (e) {
        console.error('Failed to parse saved notifications', e);
      }
    }
    return initialNotifications;
  });
  const [, navigate] = useLocation();

  // Persist whenever notifications change
  useEffect(() => {
    localStorage.setItem('securedocs_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = useMemo(() => notifications.filter((n) => n.status === 'Unread').length, [notifications]);

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

  const handleNotificationClick = (notification: NotificationData, closeDropdown?: () => void) => {
    // 1. Mark as read
    if (notification.status === 'Unread') {
      handleMarkAsRead(notification.id, false);
    }
    
    // 2. Close dropdown if provided
    if (closeDropdown) {
      closeDropdown();
    }
    
    // 3. Navigate
    if (notification.targetRoute) {
      let route = notification.targetRoute;
      
      // Determine query params based on route and targetId
      if (notification.targetId) {
        if (route.startsWith('/security')) {
          route = `${route}?alertId=${notification.targetId}`;
        } else if (route === '/reviews' && notification.targetId === 'due-today') {
          route = `${route}?filter=due-today`;
        } else if (route === '/documents') {
           route = `${route}?documentId=${notification.targetId}`;
        }
      }
      
      navigate(route);
    } else {
       toast({
        title: 'Navigation Error',
        description: 'The requested module is no longer available or route is missing.',
        variant: 'destructive',
      });
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        handleMarkAsRead,
        handleMarkAsUnread,
        handleMarkAllAsRead,
        handleNotificationClick,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
