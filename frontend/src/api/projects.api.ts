import client from './client';
import type { Project, ProjectMember } from '@/types';

export const projectsApi = {
  list: () => client.get<Project[]>('/api/projects').then((r) => r.data),
  get: (id: string) => client.get<Project>(`/api/projects/${id}`).then((r) => r.data),
  members: (id: string) =>
    client.get<ProjectMember[]>(`/api/projects/${id}/members`).then((r) => r.data),
  create: (payload: { name: string; description?: string }) =>
    client.post<Project>('/api/projects', payload).then((r) => r.data),
  update: (id: string, payload: { name?: string; description?: string }) =>
    client.patch<Project>(`/api/projects/${id}`, payload).then((r) => r.data),
  remove: (id: string) =>
    client.delete(`/api/projects/${id}`).then((r) => r.data),
  addMember: (id: string, payload: { email: string; role?: string }) =>
    client.post<ProjectMember>(`/api/projects/${id}/members`, payload).then((r) => r.data),
};
