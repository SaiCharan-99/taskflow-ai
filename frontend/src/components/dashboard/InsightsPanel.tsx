import { InsightAlert } from '@/components/shared/InsightAlert';

const detectSeverity = (msg: string): 'info' | 'warning' | 'danger' | 'success' => {
  const lower = msg.toLowerCase();
  if (/(critical|overdue|urgent|risk|blocked)/.test(lower)) return 'danger';
  if (/(warning|attention|review|consider)/.test(lower)) return 'warning';
  if (/(great|completed|nice|done|on track)/.test(lower)) return 'success';
  return 'info';
};

export const InsightsPanel = ({ insights }: { insights: string[] }) => {
  if (!insights || insights.length === 0) return null;
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-3">Smart insights</h2>
      {insights.map((m, i) => (
        <InsightAlert key={i} message={m} severity={detectSeverity(m)} />
      ))}
    </div>
  );
};
