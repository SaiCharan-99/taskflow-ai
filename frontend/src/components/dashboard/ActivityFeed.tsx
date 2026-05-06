import { Ghost } from 'lucide-react';
import type { ActivityLog } from '@/types';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { relativeTime } from '@/utils/dates';

export const ActivityFeed = ({
  items,
  isLoading,
}: {
  items: ActivityLog[];
  isLoading?: boolean;
}) => {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-white">Activity</h3>
        <button className="text-xs text-blue-400 hover:text-blue-300">View all</button>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center animate-pulse">
              <div className="w-6 h-6 rounded-full bg-slate-700" />
              <div className="flex-1 h-3 bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          <Ghost size={28} className="mx-auto mb-2 text-slate-600" />
          No activity yet
        </div>
      ) : (
        <ul className="max-h-[260px] overflow-y-auto scrollbar-thin">
          {items.slice(0, 10).map((a) => (
            <li
              key={a.id}
              className="flex gap-3 py-2.5 border-b border-slate-700/50 last:border-0"
            >
              <UserAvatar user={a.user} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-300 truncate">
                  <span className="text-white font-medium">{a.user.name}</span>{' '}
                  <span className="text-slate-400">{a.action}</span>
                  {a.task && <span className="text-blue-400"> {a.task.title}</span>}
                </div>
              </div>
              <span className="text-xs text-slate-500 shrink-0">{relativeTime(a.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
