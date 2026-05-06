import client from './client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  taskId?: string;
  projectId?: string;
  createdAt: string;
}

export const notificationsApi = {
  getAll: () =>
    client
      .get<{ notifications: Notification[]; unreadCount: number }>('/api/notifications')
      .then((r) => r.data),
  markRead: (id: string) =>
    client.patch<Notification>(`/api/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () =>
    client.patch('/api/notifications/read-all').then((r) => r.data),
};
