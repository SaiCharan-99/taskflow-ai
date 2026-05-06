import client from './client';
import type { Task, TaskStatus, Priority, TaskType } from '@/types';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority: Priority;
  type: TaskType;
  status: TaskStatus;
  assigneeId?: string;
  dueDate?: string;
}

export const tasksApi = {
  list: (projectId: string) =>
    client.get<Task[]>(`/api/projects/${projectId}/tasks`).then((r) => r.data),
  create: (projectId: string, payload: CreateTaskPayload) =>
    client.post<Task>(`/api/projects/${projectId}/tasks`, payload).then((r) => r.data),
  update: (projectId: string, taskId: string, payload: Partial<CreateTaskPayload>) =>
    client.patch<Task>(`/api/projects/${projectId}/tasks/${taskId}`, payload).then((r) => r.data),
  remove: (projectId: string, taskId: string) =>
    client.delete(`/api/projects/${projectId}/tasks/${taskId}`).then((r) => r.data),
};
