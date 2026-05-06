import client from './client';
import type { DashboardData } from '@/types';

export const dashboardApi = {
  get: (projectId: string) =>
    client.get<DashboardData>(`/api/dashboard/${projectId}`).then((r) => r.data),
};
