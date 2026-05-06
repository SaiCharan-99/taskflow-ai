import type { RiskLevel } from '@/types';

const STYLES: Record<RiskLevel, string> = {
  LOW: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  MEDIUM: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  HIGH: 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse',
};

export const RiskBadge = ({ risk }: { risk: RiskLevel }) => (
  <span
    className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider ${STYLES[risk]}`}
  >
    {risk} risk
  </span>
);
