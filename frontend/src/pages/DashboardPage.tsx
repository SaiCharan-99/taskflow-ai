import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useProjectContext } from '@/context/ProjectContext';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { WorkloadChart } from '@/components/dashboard/WorkloadChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { RiskBadge } from '@/components/dashboard/RiskBadge';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { relativeTime } from '@/utils/dates';

const REFRESH_SECONDS = 60;

const DashboardPage = () => {
  const { projectId } = useParams();
  const { setActiveProjectId } = useProjectContext();
  const { data, isLoading, error, reload, updatedAt } = useDashboard(projectId);
  const [secondsLeft, setSecondsLeft] = useState(REFRESH_SECONDS);

  useEffect(() => {
    if (projectId) setActiveProjectId(projectId);
  }, [projectId, setActiveProjectId]);

  // Stable countdown — NOT re-created on every fetch.
  // The interval runs a full 60s cycle on its own, then calls reload.
  // This prevents the visible counter-reset flicker that happened when
  // updatedAt was a dep (interval destroyed + recreated on each fetch).
  useEffect(() => {
    setSecondsLeft(REFRESH_SECONDS);
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          reload();
          return REFRESH_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]); // only restart timer when project changes, not on every fetch

  const mins = Math.floor(secondsLeft / 60);
  const secs = String(secondsLeft % 60).padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="px-6 py-6 space-y-6"
    >
      <div className="flex justify-between items-start gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Decision intelligence</h1>
          <div className="text-xs text-slate-500 mt-1">
            {updatedAt ? `Updated ${relativeTime(updatedAt.toISOString())}` : 'Updating…'}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {data && <RiskBadge risk={data.riskLevel} />}
          <span className="text-slate-500 text-xs">
            Auto-refresh in {mins}:{secs}
          </span>
        </div>
      </div>

      {isLoading && !data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <SkeletonCard className="h-64" />
        </>
      ) : error || !data ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
          {error ?? 'Could not load dashboard.'}
        </div>
      ) : (
        <>
          <DashboardMetrics data={data} />
          <InsightsPanel insights={data.insights} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <WorkloadChart data={data.workloadPerUser} />
            </div>
            <div>
              <ActivityFeed items={data.recentActivity} />
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default DashboardPage;
