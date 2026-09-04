import { useCallback, useEffect, useState } from 'react';
import { getDashboardSnapshot, type DashboardSnapshot } from '@/lib/dashboard-service';

export function useDashboardData() {
  const [data, setData] = useState<DashboardSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    getDashboardSnapshot()
      .then((snapshot) => { if (active) setData(snapshot); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason : new Error('Unable to load dashboard data')); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  return { data, isLoading, error, retry };
}