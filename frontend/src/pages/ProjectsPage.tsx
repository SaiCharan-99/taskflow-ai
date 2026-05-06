import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Plus, Users } from 'lucide-react';
import { useProjectContext } from '@/context/ProjectContext';
import { useAuthContext } from '@/context/AuthContext';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { RiskBadge } from '@/components/dashboard/RiskBadge';
import { TeamMetrics } from '@/components/dashboard/TeamMetrics';
import { canManageProject } from '@/utils/rbac';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate } from '@/utils/dates';

const ProjectsPage = () => {
  const { projects, isLoading, reload, setActiveProjectId } = useProjectContext();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    reload();
  }, [reload]);

  const open = (id: string) => {
    setActiveProjectId(id);
    navigate(`/projects/${id}/board`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="px-6 py-6"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Your projects</h1>
            <p className="text-sm text-slate-400 mt-1">
              Pick a project to dive into the board, tasks, and dashboard.
            </p>
          </div>
          {user && canManageProject(user.globalRole) && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus size={16} /> New project
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            message="Create your first project to start tracking work with your team."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => (
              <motion.button
                key={p.id}
                onClick={() => open(p.id)}
                whileHover={{ y: -2 }}
                className="text-left bg-slate-800 rounded-2xl border border-slate-700 p-5 hover:border-slate-600 hover:shadow-lg hover:shadow-black/20 transition-all"
              >
                <div className="flex justify-between items-start gap-3">
                  <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                  <RiskBadge risk={p.riskLevel} />
                </div>
                {p.description && (
                  <p className="text-slate-400 text-sm mt-1 line-clamp-2">{p.description}</p>
                )}
                <div className="mt-4 flex gap-4">
                  <span className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <Users size={14} /> {p.memberCount} members
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <CheckSquare size={14} /> {p.taskCount} tasks
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center">
                  <span className="text-blue-400 text-sm hover:text-blue-300">Open board →</span>
                  <span className="text-slate-600 text-xs">Created {formatDate(p.createdAt)}</span>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Team Metrics Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-4">Team Insights</h2>
          <TeamMetrics />
        </div>
      </motion.div>

      <CreateProjectModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </>
  );
};

export default ProjectsPage;
