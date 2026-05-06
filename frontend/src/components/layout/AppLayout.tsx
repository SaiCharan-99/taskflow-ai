import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AgentButton } from '@/components/agent/AgentButton';

export const AppLayout = ({ children }: { children: ReactNode }) => (
  <div className="h-screen w-screen bg-slate-900 text-slate-50 overflow-hidden">
    <Sidebar />
    <div className="ml-60 h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 overflow-y-auto scrollbar-thin">{children}</main>
    </div>
    <AgentButton />
  </div>
);
