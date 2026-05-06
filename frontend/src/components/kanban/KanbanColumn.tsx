import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { Task, TaskStatus, User } from '@/types';
import { TaskCard } from './TaskCard';
import { canDragCard } from '@/utils/rbac';
import type { Role } from '@/types';

interface Props {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  role: Role;
  user: User | null;
  onCardClick?: (task: Task) => void;
}

export const KanbanColumn = ({ status, label, tasks, role, user, onCardClick }: Props) => {
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { status } });

  return (
    <div
      className={`bg-slate-800/50 rounded-xl border w-72 min-w-[288px] flex flex-col max-h-[calc(100vh-220px)] transition-colors ${
        isOver ? 'border-blue-500/50 bg-slate-800/80' : 'border-slate-700/50'
      }`}
    >
      <div className="px-4 py-3 border-b border-slate-700/50 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-300">{label}</h3>
        <span className="bg-slate-700 text-slate-400 text-xs rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>
      <div ref={setNodeRef} className="overflow-y-auto flex-1 p-3 flex flex-col gap-2 scrollbar-thin">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="border border-dashed border-slate-600/50 rounded-lg p-6 text-center text-slate-500 text-sm">
              No tasks here
            </div>
          ) : (
            tasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                draggable={!!user && canDragCard(role, t, user.id)}
                onClick={() => onCardClick?.(t)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};
