import type { Role, Task } from '@/types';

// Only ADMIN and MANAGER can create tasks
export const canCreateTask = (role: Role) => role === 'ADMIN' || role === 'MANAGER';

// Only ADMIN and MANAGER can delete tasks
export const canDeleteTask = (role: Role) => role === 'ADMIN' || role === 'MANAGER';

// Only ADMIN and MANAGER can create/manage projects
export const canManageProject = (role: Role) => role === 'ADMIN' || role === 'MANAGER';

// Only ADMIN and MANAGER can access project settings
export const canAccessProjectSettings = (role: Role) => role === 'ADMIN' || role === 'MANAGER';

// Card dragging: ADMIN/MANAGER can drag any card; MEMBER can only drag their own
export const canDragCard = (role: Role, task: Task, userId: string) =>
  role !== 'MEMBER' || task.assigneeId === userId;
