import { useCallback, useEffect, useState } from 'react';
import { dashboardApi } from '@/api/dashboard.api';
import type { DashboardData } from '@/types';

export const useDashboard = (projectId?: string) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const reload = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const d = await dashboardApi.get(projectId);
      setData(d);
      setUpdatedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, isLoading, error, reload, updatedAt };
};
