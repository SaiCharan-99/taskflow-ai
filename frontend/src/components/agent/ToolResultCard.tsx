import type { AgentMessage } from '@/types';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CheckCircle2 } from 'lucide-react';

interface TaskListData {
  tasks: { id: string; title: string; priority: string; status: string }[];
}

interface TaskCreatedData {
  task: { title: string; priority: string };
}

interface DashboardSummaryData {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
}

export const ToolResultCard = ({ result }: { result: NonNullable<AgentMessage['toolResult']> }) => {
  if (result.type === 'task_list') {
    const data = result.data as TaskListData;
    const tasks = data?.tasks ?? [];
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden mt-2">
        <div className="text-xs text-slate-500 px-3 py-2 bg-slate-800">
          Tasks ({tasks.length} result{tasks.length === 1 ? '' : 's'})
        </div>
        <ul>
          {tasks.map((t) => (
            <li
              key={t.id}
              className="flex justify-between items-center px-3 py-2 border-b border-slate-700/50 last:border-0 gap-2"
            >
              <span className="text-sm text-white truncate">{t.title}</span>
              <span className="flex items-center gap-1 shrink-0">
                <PriorityBadge priority={t.priority as never} />
                <StatusBadge status={t.status as never} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (result.type === 'task_created') {
    const data = result.data as TaskCreatedData;
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 mt-2">
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
          <CheckCircle2 size={16} />
          Task created successfully
        </div>
        {data?.task && (
          <div className="mt-2 text-sm text-slate-300">
            {data.task.title}{' '}
            <span className="ml-1">
              <PriorityBadge priority={data.task.priority as never} />
            </span>
          </div>
        )}
      </div>
    );
  }

  if (result.type === 'dashboard_summary') {
    const d = result.data as DashboardSummaryData;
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-3 grid grid-cols-2 gap-2 mt-2">
        {[
          { label: 'Total', value: d.totalTasks },
          { label: 'Completed', value: d.completedTasks },
          { label: 'In progress', value: d.inProgressTasks },
          { label: 'Overdue', value: d.overdueTasks },
        ].map((m) => (
          <div key={m.label} className="bg-slate-800 rounded-lg p-2">
            <div className="text-xs text-slate-500">{m.label}</div>
            <div className="text-lg text-white font-semibold">{m.value}</div>
          </div>
        ))}
      </div>
    );
  }

  if (result.type === 'error') {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mt-2 text-sm text-red-300">
        Something went wrong while processing that request.
      </div>
    );
  }

  return null;
};
