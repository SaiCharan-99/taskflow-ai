import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useAuthContext } from '@/context/AuthContext';
import { useProjectContext } from '@/context/ProjectContext';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TaskFilters, type Filters } from '@/components/tasks/TaskFilters';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { canCreateTask } from '@/utils/rbac';
import { projectsApi } from '@/api/projects.api';
import type { ProjectMember } from '@/types';
import { TaskCardSkeleton } from '@/components/kanban/TaskCardSkeleton';

const BoardPage = () => {
  const { id: projectId } = useParams();
  const { user } = useAuthContext();
  const { setActiveProjectId } = useProjectContext();
  const { tasks, isLoading, updateStatus, create } = useTasks(projectId);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    assigneeId: '',
    priority: '',
    type: '',
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [members, setMembers] = useState<ProjectMember[]>([]);

  useEffect(() => {
    if (projectId) setActiveProjectId(projectId);
  }, [projectId, setActiveProjectId]);

  useEffect(() => {
    if (!projectId) return;
    projectsApi
      .members(projectId)
      .then(setMembers)
      .catch(() => setMembers([]));
  }, [projectId]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase()))
        return false;
      if (filters.assigneeId && t.assigneeId !== filters.assigneeId) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.type && t.type !== filters.type) return false;
      return true;
    });
  }, [tasks, filters]);

  const role = user?.globalRole ?? 'MEMBER';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <TaskFilters
        filters={filters}
        setFilters={setFilters}
        members={members}
        rightSlot={
          user && canCreateTask(role) ? (
            <button
              onClick={() => setCreateOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus size={16} /> Create task
            </button>
          ) : null
        }
      />
      {isLoading ? (
        <div className="flex gap-4 px-6 py-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-72 min-w-[288px] flex flex-col gap-2">
              <TaskCardSkeleton />
              <TaskCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <KanbanBoard
          tasks={filtered}
          role={role}
          user={user}
          onMove={(id, status) => updateStatus(id, status)}
        />
      )}
      <CreateTaskModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        members={members}
        onSubmit={async (payload) => {
          await create(payload);
        }}
      />
    </motion.div>
  );
};

export default BoardPage;
