import { api } from '../services/api';
import { quickActions, systemStatus } from '@/lib/mock-data';

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
    
    // Map backend data to UI format
    return {
      stats: [
        { label: 'Active Cases', value: data.stats.totalCases.toString(), change: '+12%', trend: 'up' },
        { label: 'Documents Secured', value: data.stats.totalDocuments.toString(), change: '+4.5%', trend: 'up' },
        { label: 'Pending Reviews', value: data.stats.pendingReviews.toString(), change: '-2', trend: 'down', alert: data.stats.pendingReviews > 5 },
        { label: 'Integrity Issues', value: data.stats.integrityIssues.toString(), change: '0', trend: 'neutral', alert: data.stats.integrityIssues > 0 },
      ],
      documentTypes: data.documentTypes.map((dt: any) => ({
        name: dt._id || 'Other',
        value: dt.count
      })),
      caseStatuses: data.casesByStatus.map((cs: any) => ({
        name: cs._id || 'Unknown',
        value: cs.count
      })),
      riskDistribution: data.riskDistribution.map((rd: any) => ({
        name: rd._id || 'Unknown',
        value: rd.count
      })),
      activities: data.recentActivity.map((log: any) => ({
        id: log._id,
        user: log.userName,
        role: log.userRole,
        action: log.action,
        document: log.documentId || log.caseId || 'System',
        time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })),
      alerts: data.securityAlerts.map((alert: any) => ({
        id: alert._id,
        type: alert.riskLevel === 'High' ? 'critical' : 'warning',
        message: alert.type,
        time: new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })),
      quickActions,
      systemStatus
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    // Fallback if API fails
    return {
      stats: [],
      documentTypes: [],
      caseStatuses: [],
      riskDistribution: [],
      activities: [],
      alerts: [],
      quickActions,
      systemStatus
    };
  }
}