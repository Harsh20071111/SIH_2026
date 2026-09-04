import { useCallback, useEffect, useState } from 'react';
import {
  archiveCase,
  createCase,
  getCases,
  updateCase,
  type CaseCreateInput,
  type CaseRecord,
} from '@/lib/case-service';

export function useCases() {
  const [data, setData] = useState<CaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await getCases());
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error('Unable to load cases'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(async (input: CaseCreateInput) => {
    const created = await createCase(input);
    setData((current) => [created, ...current]);
    return created;
  }, []);

  const update = useCallback(async (id: string, input: Partial<Omit<CaseRecord, 'id'>>) => {
    const updated = await updateCase(id, input);
    setData((current) => current.map((item) => item.id === id ? updated : item));
    return updated;
  }, []);

  const archive = useCallback(async (id: string) => {
    const archived = await archiveCase(id);
    setData((current) => current.map((item) => item.id === id ? archived : item));
    return archived;
  }, []);

  return { data, isLoading, error, retry: load, create, update, archive };
}