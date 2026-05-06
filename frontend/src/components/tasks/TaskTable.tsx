import type { Task } from '@/types';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { formatDate, isOverdue } from '@/utils/dates';
import { Calendar } from 'lucide-react';

export const TaskTable = ({ tasks }: { tasks: Task[] }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
    <table className="w-full text-sm">
      <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider">
        <tr>
          <th className="text-left px-4 py-3 font-medium">Title</th>
          <th className="text-left px-4 py-3 font-medium">Status</th>
          <th className="text-left px-4 py-3 font-medium">Priority</th>
          <th className="text-left px-4 py-3 font-medium">Assignee</th>
          <th className="text-left px-4 py-3 font-medium">Due</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((t) => {
          const overdue = isOverdue(t.dueDate) && t.status !== 'DONE';
          return (
            <tr
              key={t.id}
              className="border-t border-slate-700/60 hover:bg-slate-700/30 transition-colors"
            >
              <td className="px-4 py-3 text-white">{t.title}</td>
              <td className="px-4 py-3">
                <StatusBadge status={t.status} />
              </td>
              <td className="px-4 py-3">
                <PriorityBadge priority={t.priority} />
              </td>
              <td className="px-4 py-3">
                {t.assignee ? (
                  <div className="flex items-center gap-2">
                    <UserAvatar user={t.assignee} size="sm" />
                    <span className="text-slate-300">{t.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-slate-600">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {t.dueDate ? (
                  <span
                    className={`inline-flex items-center gap-1 text-xs ${
                      overdue ? 'text-red-400 font-medium' : 'text-slate-400'
                    }`}
                  >
                    <Calendar size={12} />
                    {formatDate(t.dueDate)}
                  </span>
                ) : (
                  <span className="text-slate-600 text-xs">—</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
