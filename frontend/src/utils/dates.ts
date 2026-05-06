import { format, formatDistanceToNow, isBefore, startOfDay } from 'date-fns';

export const formatDate = (iso?: string) => (iso ? format(new Date(iso), 'MMM d') : '');
export const formatDateTime = (iso?: string) =>
  iso ? format(new Date(iso), 'MMM d, yyyy · h:mm a') : '';
export const relativeTime = (iso: string) =>
  formatDistanceToNow(new Date(iso), { addSuffix: true });
export const isOverdue = (dueDate?: string) =>
  !!dueDate && isBefore(new Date(dueDate), startOfDay(new Date()));
