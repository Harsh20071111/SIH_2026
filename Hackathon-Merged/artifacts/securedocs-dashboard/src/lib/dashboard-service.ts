import { alerts, activities, caseStatuses, documentTypes, quickActions, riskDistribution, stats, systemStatus } from '@/lib/mock-data';

export type DashboardSnapshot = {
  stats: typeof stats;
  documentTypes: typeof documentTypes;
  caseStatuses: typeof caseStatuses;
  riskDistribution: typeof riskDistribution;
  activities: typeof activities;
  alerts: typeof alerts;
  quickActions: typeof quickActions;
  systemStatus: typeof systemStatus;
};

/** Local adapter intentionally mirrors the future GET /api/dashboard contract. */
export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  await new Promise((resolve) => window.setTimeout(resolve, 240));
  return { stats, documentTypes, caseStatuses, riskDistribution, activities, alerts, quickActions, systemStatus };
}