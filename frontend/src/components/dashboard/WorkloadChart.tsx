import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import type { Role } from '@/types';

interface Datum {
  userId: string;
  name: string;
  taskCount: number;
  role: Role;
}

const ROLE_COLOR: Record<Role, string> = {
  ADMIN: '#3B82F6',
  MANAGER: '#F59E0B',
  MEMBER: '#94A3B8',
};

interface TooltipPayload {
  payload: Datum;
  value: number;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs">
      <div className="text-white font-medium">{d.name}</div>
      <div className="text-slate-400">
        {d.taskCount} task{d.taskCount === 1 ? '' : 's'} · {d.role}
      </div>
    </div>
  );
};

export const WorkloadChart = ({ data }: { data: Datum[] }) => {
  const chartData = data.map((d) => ({ ...d, firstName: d.name.split(' ')[0] }));
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Team workload</h3>
          <p className="text-xs text-slate-500">Tasks per member</p>
        </div>
      </div>
      <div className="h-60 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            No workload data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
              <XAxis
                dataKey="firstName"
                stroke="#94A3B8"
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                stroke="#94A3B8"
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />
              <Bar dataKey="taskCount" radius={[6, 6, 0, 0]}>
                {chartData.map((d) => (
                  <Cell key={d.userId} fill={ROLE_COLOR[d.role]} />
                ))}
                <LabelList
                  dataKey="taskCount"
                  position="top"
                  fill="#E2E8F0"
                  fontSize={11}
                  formatter={(v: number) => (v > 0 ? v : '')}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
