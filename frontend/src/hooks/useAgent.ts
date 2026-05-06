import { useCallback, useState } from 'react';
import { agentApi } from '@/api/agent.api';
import type { AgentMessage } from '@/types';

export const useAgent = (projectId?: string) => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!projectId || !content.trim()) return;
      const userMsg: AgentMessage = { role: 'user', content };

      // ISSUE-10 FIX: use functional update so we don't capture messages in the closure.
      // This also removes messages from the dep array, stopping sendMessage from being
      // recreated on every new message (which caused constant consumer re-renders).
      let historySnapshot: AgentMessage[] = [];
      setMessages((prev) => {
        historySnapshot = [...prev, userMsg];
        return historySnapshot;
      });

      setIsLoading(true);
      try {
        const reply = await agentApi.chat({
          projectId,
          message: content,
          history: historySnapshot.slice(-20),
        });
        setMessages((prev) => [...prev, reply]);
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              e instanceof Error
                ? `Sorry, I couldn't process that: ${e.message}`
                : "Sorry, I couldn't reach the assistant.",
            toolResult: { type: 'error', data: null },
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [projectId], // messages removed from deps — functional updates handle current state
  );

  const clearChat = () => setMessages([]);

  return { messages, sendMessage, isLoading, clearChat };
};
