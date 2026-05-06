import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface Props {
  icon?: LucideIcon;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon = Inbox, title, message, action }: Props) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <Icon size={36} className="text-slate-600" />
    <h3 className="text-base font-medium text-slate-300 mt-3">{title}</h3>
    {message && <p className="text-sm text-slate-500 mt-1 max-w-xs">{message}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
