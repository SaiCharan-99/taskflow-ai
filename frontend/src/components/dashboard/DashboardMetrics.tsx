import { motion } from 'framer-motion';
import { CheckCircle2, CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import type { DashboardData } from '@/types';
import { MetricCard } from '@/components/shared/MetricCard';

export const DashboardMetrics = ({ data }: { data: DashboardData }) => {
  const completionPct =
    data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <MetricCard
        label="Total tasks"
        value={data.totalTasks}
        icon={CheckSquare}
        color="blue"
      />
      <MetricCard
        label="Completed"
        value={data.completedTasks}
        icon={CheckCircle2}
        color="emerald"
        subtitle={`${completionPct}% of total`}
      />
      <MetricCard
        label="In progress"
        value={data.inProgressTasks}
        icon={Clock}
        color="violet"
      />
      <MetricCard
        label="Overdue"
        value={data.overdueTasks}
        icon={AlertTriangle}
        color="red"
        pulse={data.overdueTasks > 0}
      />
    </motion.div>
  );
};
