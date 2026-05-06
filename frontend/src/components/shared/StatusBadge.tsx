import type { TaskStatus } from '@/types';

const STYLES: Record<TaskStatus, string> = {
  TODO: 'bg-slate-600/30 text-slate-400 border-slate-600',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  IN_REVIEW: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  DONE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const LABELS: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  IN_REVIEW: 'In review',
  DONE: 'Done',
};

export const StatusBadge = ({ status }: { status: TaskStatus }) => (
  <span
    className={`text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border ${STYLES[status]}`}
  >
    {LABELS[status]}
  </span>
);
