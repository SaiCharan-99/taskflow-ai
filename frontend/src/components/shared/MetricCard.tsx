import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Color = 'blue' | 'emerald' | 'violet' | 'red' | 'amber';

const COLOR_MAP: Record<Color, string> = {
  blue: 'bg-blue-500/20 text-blue-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
  violet: 'bg-violet-500/20 text-violet-400',
  red: 'bg-red-500/20 text-red-400',
  amber: 'bg-amber-500/20 text-amber-400',
};

interface Props {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  color: Color;
  trend?: { direction: 'up' | 'down'; text: string };
  pulse?: boolean;
  subtitle?: string;
}

export const MetricCard = ({ label, value, icon: Icon, color, trend, pulse, subtitle }: Props) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 8 },
      show: { opacity: 1, y: 0 },
    }}
    className="bg-slate-800 rounded-xl p-5 border border-slate-700"
  >
    {/* pulse only on the icon badge — not the whole card — to avoid number flickering */}
    <div className={`inline-flex items-center justify-center rounded-lg p-2 ${COLOR_MAP[color]} ${pulse ? 'animate-pulse' : ''}`}>
      <Icon size={20} />
    </div>
    <div className="mt-3 text-3xl font-bold text-white tracking-tight">{value}</div>
    <div className="mt-1 text-sm text-slate-400">{label}</div>
    {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
    {trend && (
      <div
        className={`text-xs mt-2 flex items-center gap-1 ${
          trend.direction === 'up' ? 'text-emerald-400' : 'text-red-400'
        }`}
      >
        <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
        {trend.text}
      </div>
    )}
  </motion.div>
);
