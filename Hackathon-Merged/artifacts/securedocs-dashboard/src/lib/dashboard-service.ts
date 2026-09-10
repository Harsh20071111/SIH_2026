import { api } from '../services/api';
import {
  stats as defaultStats,
  documentTypes as defaultDocTypes,
  caseStatuses as defaultCaseStatuses,
  riskDistribution as defaultRisk,
  activities as defaultActivities,
  alerts as defaultAlerts,
  quickActions,
  systemStatus
} from '@/lib/mock-data';

export type DashboardSnapshot = {
  stats: any;
  documentTypes: any[];
  caseStatuses: any[];
  riskDistribution: any[];
  activities: any[];
  alerts: any[];
  quickActions: typeof quickActions;
  systemStatus: typeof systemStatus;
};

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  try {
    const data = await api.get<any>('/dashboard');
    
    const totalCases = data?.stats?.totalCases ?? 128;
    const totalDocuments = data?.stats?.totalDocuments ?? 4820;
    const pendingReviews = data?.stats?.pendingReviews ?? 43;
    const integrityIssues = data?.stats?.integrityIssues ?? 3;
    const suspiciousActivities = data?.stats?.suspiciousActivities ?? 11;

    const stats = [
      { label: 'Total cases', value: Number(totalCases).toLocaleString(), change: 'Live total', tone: 'blue', icon: 'briefcase' },
      { label: 'Total documents', value: Number(totalDocuments).toLocaleString(), change: 'Live total', tone: 'cyan', icon: 'files' },
      { label: 'Pending reviews', value: Number(pendingReviews).toLocaleString(), change: `${pendingReviews} pending`, tone: 'amber', icon: 'clipboard' },
      { label: 'Integrity issues', value: Number(integrityIssues).toLocaleString(), change: 'Requires attention', tone: 'red', icon: 'shield' },
      { label: 'Suspicious activities', value: Number(suspiciousActivities).toLocaleString(), change: 'Check alerts', tone: 'red', icon: 'activity' },
    ];

    const documentTypes = Array.isArray(data?.documentTypes) && data.documentTypes.length > 0
      ? data.documentTypes.map((dt: any) => ({
          name: dt._id || dt.name || 'Other',
          value: dt.count ?? dt.value ?? 0
        }))
      : defaultDocTypes.map(([name, value]) => ({ name, value }));

    const caseStatuses = Array.isArray(data?.casesByStatus) && data.casesByStatus.length > 0
      ? data.casesByStatus.map((cs: any) => ({
          name: cs._id || cs.name || 'Unknown',
          value: cs.count ?? cs.value ?? 0
        }))
      : defaultCaseStatuses.map(([name, value]) => ({ name, value }));

    const riskDistribution = Array.isArray(data?.riskDistribution) && data.riskDistribution.length > 0
      ? data.riskDistribution.map((rd: any) => ({
          name: rd._id || rd.name || 'Unknown',
          value: rd.count ?? rd.value ?? 0
        }))
      : defaultRisk.map(r => ({ name: r.label, value: r.value }));

    const activities = Array.isArray(data?.recentActivity) && data.recentActivity.length > 0
      ? data.recentActivity.map((log: any) => ({
          id: log._id || log.id || Math.random().toString(),
          user: log.userName || log.user || 'System',
          role: log.userRole || log.role || 'Officer',
          action: log.action || 'Event recorded',
          document: log.metadata?.documentName || log.documentId || log.caseId || 'System',
          time: log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
        }))
      : defaultActivities;

    const alerts = Array.isArray(data?.securityAlerts) && data.securityAlerts.length > 0
      ? data.securityAlerts.map((alert: any) => ({
          id: alert._id || alert.id || Math.random().toString(),
          type: alert.riskLevel === 'High' || alert.riskLevel === 'CRITICAL' ? 'critical' : 'warning',
          message: alert.action || alert.type || 'Security alert',
          time: alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'
        }))
      : defaultAlerts;

    return {
      stats,
      documentTypes,
      caseStatuses,
      riskDistribution,
      activities,
      alerts,
      quickActions,
      systemStatus
    };
  } catch (error) {
    console.warn("Using resilient mock snapshot for dashboard:", error);
    return {
      stats: defaultStats,
      documentTypes: defaultDocTypes.map(([name, value]) => ({ name, value })),
      caseStatuses: defaultCaseStatuses.map(([name, value]) => ({ name, value })),
      riskDistribution: defaultRisk.map(r => ({ name: r.label, value: r.value })),
      activities: defaultActivities,
      alerts: defaultAlerts,
      quickActions,
      systemStatus
    };
  }
}