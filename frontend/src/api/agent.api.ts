import client from './client';
import type { AgentMessage } from '@/types';

export const agentApi = {
  chat: (payload: { projectId: string; message: string; history: AgentMessage[] }) =>
    client.post<AgentMessage>('/api/agent/chat', payload).then((r) => r.data),
  confirm: (payload: { projectId: string; actionId: string }) =>
    client.post<AgentMessage>('/api/agent/confirm', payload).then((r) => r.data),
};
