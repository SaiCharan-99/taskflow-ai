import type { Priority } from '@/types';

const STYLES: Record<Priority, string> = {
  LOW: 'bg-slate-600/30 text-slate-400 border-slate-600',
  MEDIUM: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  HIGH: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse',
};

export const PriorityBadge = ({ priority }: { priority: Priority }) => (
  <span
    className={`text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border ${STYLES[priority]}`}
  >
    {priority}
  </span>
);
