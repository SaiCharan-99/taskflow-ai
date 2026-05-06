import { useMemo } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { Task, TaskStatus, User, Role } from '@/types';
import { KanbanColumn } from './KanbanColumn';

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'TODO', label: 'To do' },
  { status: 'IN_PROGRESS', label: 'In progress' },
  { status: 'IN_REVIEW', label: 'In review' },
  { status: 'DONE', label: 'Done' },
];

interface Props {
  tasks: Task[];
  role: Role;
  user: User | null;
  onMove: (taskId: string, status: TaskStatus) => void;
  onCardClick?: (task: Task) => void;
}

export const KanbanBoard = ({ tasks, role, user, onMove, onCardClick }: Props) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
    };
    for (const t of tasks) map[t.status].push(t);
    return map;
  }, [tasks]);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const overStatus =
      (over.data.current?.status as TaskStatus | undefined) ??
      (over.data.current?.task as Task | undefined)?.status;
    const activeTask = active.data.current?.task as Task | undefined;
    if (!activeTask || !overStatus) return;
    if (activeTask.status === overStatus) return;
    onMove(activeTask.id, overStatus);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 px-6 py-4 overflow-x-auto min-h-[calc(100vh-180px)]">
        {COLUMNS.map((c) => (
          <KanbanColumn
            key={c.status}
            status={c.status}
            label={c.label}
            tasks={grouped[c.status]}
            role={role}
            user={user}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DndContext>
  );
};
