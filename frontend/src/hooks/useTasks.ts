import { useCallback, useEffect, useState } from 'react';
import { tasksApi, type CreateTaskPayload } from '@/api/tasks.api';
import type { Task, TaskStatus } from '@/types';

export const useTasks = (projectId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await tasksApi.list(projectId);
      setTasks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const updateStatus = async (taskId: string, status: TaskStatus) => {
    if (!projectId) return;
    const previous = tasks;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    try {
      const updated = await tasksApi.update(projectId, taskId, { status });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch {
      setTasks(previous);
    }
  };

  const create = async (payload: CreateTaskPayload) => {
    if (!projectId) throw new Error('No project');
    const created = await tasksApi.create(projectId, payload);
    setTasks((prev) => [created, ...prev]);
    return created;
  };

  const update = async (taskId: string, payload: Partial<CreateTaskPayload>) => {
    if (!projectId) throw new Error('No project');
    const updated = await tasksApi.update(projectId, taskId, payload);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    return updated;
  };

  return { tasks, isLoading, error, reload, updateStatus, create, update };
};
