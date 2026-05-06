import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar } from 'lucide-react';
import type { Task, TaskType } from '@/types';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { formatDate, isOverdue } from '@/utils/dates';

const TYPE_LABEL: Record<TaskType, string> = {
  BUG: 'Bug',
  FEATURE: 'Feature',
  IMPROVEMENT: 'Improvement',
};
const TYPE_STYLE: Record<TaskType, string> = {
  BUG: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
  FEATURE: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  IMPROVEMENT: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
};

interface Props {
  task: Task;
  draggable: boolean;
  onClick?: () => void;
}

export const TaskCard = ({ task, draggable, onClick }: Props) => {
  const overdue = isOverdue(task.dueDate) && task.status !== 'DONE';
  const isCritical = task.priority === 'CRITICAL';

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
    disabled: !draggable,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(draggable ? listeners : {})}
      onClick={onClick}
      className={`bg-slate-800 rounded-xl border border-slate-700 p-4 transition-colors hover:border-slate-600
        ${draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed opacity-90'}
        ${overdue ? 'border-l-4 border-l-red-500' : ''}
        ${isCritical ? 'ring-1 ring-red-500/40 bg-red-500/5' : ''}`}
    >
      <div className="flex justify-between items-center gap-2">
        <PriorityBadge priority={task.priority} />
        <span
          className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border ${TYPE_STYLE[task.type]}`}
        >
          {TYPE_LABEL[task.type]}
        </span>
      </div>
      <div className="text-sm font-medium text-white mt-2 line-clamp-2">{task.title}</div>
      <div className="mt-3 flex justify-between items-center">
        {task.assignee ? (
          <UserAvatar user={task.assignee} size="sm" showTooltip />
        ) : (
          <span className="text-slate-600 text-xs">— Unassigned</span>
        )}
        {task.dueDate && (
          <span
            className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-400 font-medium' : 'text-slate-500'}`}
          >
            <Calendar size={12} />
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
};
