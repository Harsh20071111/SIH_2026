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

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const currentStats = stats.map((s) => ({ ...s }));

  try {
    const [casesRes, docsRes] = await Promise.all([
      fetch('/api/cases'),
      fetch('/api/documents'),
    ]);

    if (casesRes.ok) {
      const casesJson = await casesRes.json();
      if (casesJson.success && Array.isArray(casesJson.data) && casesJson.data.length > 0) {
        currentStats[0] = { ...currentStats[0], value: String(casesJson.data.length) };
      }
    }

    if (docsRes.ok) {
      const docsJson = await docsRes.json();
      if (docsJson.success && Array.isArray(docsJson.data) && docsJson.data.length > 0) {
        currentStats[1] = { ...currentStats[1], value: String(docsJson.data.length) };
      }
    }
  } catch (err) {
    console.warn('Could not fetch live counts for dashboard:', err);
  }

  await new Promise((resolve) => window.setTimeout(resolve, 120));
  return { stats: currentStats, documentTypes, caseStatuses, riskDistribution, activities, alerts, quickActions, systemStatus };
}