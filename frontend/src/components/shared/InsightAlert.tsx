import { AlertTriangle, Info, AlertOctagon, CheckCircle2 } from 'lucide-react';

type Severity = 'info' | 'warning' | 'danger' | 'success';

const STYLES: Record<Severity, { wrap: string; Icon: typeof Info }> = {
  info: { wrap: 'bg-blue-500/10 border-blue-500 text-blue-300', Icon: Info },
  warning: { wrap: 'bg-amber-500/10 border-amber-500 text-amber-300', Icon: AlertTriangle },
  danger: { wrap: 'bg-red-500/10 border-red-500 text-red-300', Icon: AlertOctagon },
  success: { wrap: 'bg-emerald-500/10 border-emerald-500 text-emerald-300', Icon: CheckCircle2 },
};

interface Props {
  message: string;
  severity?: Severity;
}

export const InsightAlert = ({ message, severity = 'info' }: Props) => {
  const { wrap, Icon } = STYLES[severity];
  return (
    <div className={`${wrap} border-l-4 rounded-r-lg px-4 py-3 text-sm mb-2 flex gap-3 items-start`}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
};
