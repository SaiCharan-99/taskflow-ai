import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTasks } from '@/hooks/useTasks';
import { useProjectContext } from '@/context/ProjectContext';
import { TaskFilters, type Filters } from '@/components/tasks/TaskFilters';
import { TaskTable } from '@/components/tasks/TaskTable';
import { projectsApi } from '@/api/projects.api';
import type { ProjectMember } from '@/types';
import { EmptyState } from '@/components/shared/EmptyState';

const TasksPage = () => {
  const { id: projectId } = useParams();
  const { setActiveProjectId } = useProjectContext();
  const { tasks, isLoading } = useTasks(projectId);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    assigneeId: '',
    priority: '',
    type: '',
  });

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

  const filtered = useMemo(
    () =>
      tasks.filter((t) => {
        if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase()))
          return false;
        if (filters.assigneeId && t.assigneeId !== filters.assigneeId) return false;
        if (filters.priority && t.priority !== filters.priority) return false;
        if (filters.type && t.type !== filters.type) return false;
        return true;
      }),
    [tasks, filters],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <TaskFilters filters={filters} setFilters={setFilters} members={members} />
      <div className="px-6 py-6">
        {isLoading ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl h-64 animate-pulse" />
        ) : filtered.length === 0 ? (
          <EmptyState title="No tasks match your filters" />
        ) : (
          <TaskTable tasks={filtered} />
        )}
      </div>
    </motion.div>
  );
};

export default TasksPage;
