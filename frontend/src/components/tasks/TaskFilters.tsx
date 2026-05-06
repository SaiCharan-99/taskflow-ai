import type { Priority, ProjectMember, TaskType } from '@/types';
import { X } from 'lucide-react';

export interface Filters {
  search: string;
  assigneeId: string;
  priority: '' | Priority;
  type: '' | TaskType;
}

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
  members: ProjectMember[];
  rightSlot?: React.ReactNode;
}

const selectStyle =
  'bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500';

export const TaskFilters = ({ filters, setFilters, members, rightSlot }: Props) => {
  const hasFilter =
    !!filters.search || !!filters.assigneeId || !!filters.priority || !!filters.type;
  const clear = () =>
    setFilters({ search: '', assigneeId: '', priority: '', type: '' });

  return (
    <div className="bg-slate-900 border-b border-slate-700/50 px-6 py-3 flex flex-wrap gap-3 items-center sticky top-0 z-[5]">
      <input
        type="text"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        placeholder="Search tasks..."
        className={`${selectStyle} w-64`}
      />
      <select
        value={filters.assigneeId}
        onChange={(e) => setFilters({ ...filters, assigneeId: e.target.value })}
        className={selectStyle}
      >
        <option value="">All assignees</option>
        {members.map((m) => (
          <option key={m.userId} value={m.userId}>
            {m.user.name}
          </option>
        ))}
      </select>
      <select
        value={filters.priority}
        onChange={(e) =>
          setFilters({ ...filters, priority: e.target.value as Filters['priority'] })
        }
        className={selectStyle}
      >
        <option value="">All priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="CRITICAL">Critical</option>
      </select>
      <select
        value={filters.type}
        onChange={(e) => setFilters({ ...filters, type: e.target.value as Filters['type'] })}
        className={selectStyle}
      >
        <option value="">All types</option>
        <option value="BUG">Bug</option>
        <option value="FEATURE">Feature</option>
        <option value="IMPROVEMENT">Improvement</option>
      </select>
      {hasFilter && (
        <button
          onClick={clear}
          className="text-blue-400 text-sm hover:text-blue-300 inline-flex items-center gap-1"
        >
          <X size={14} /> Clear filters
        </button>
      )}
      <div className="ml-auto">{rightSlot}</div>
    </div>
  );
};
