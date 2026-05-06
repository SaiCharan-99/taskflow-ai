import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrainCircuit, SendHorizonal, X } from 'lucide-react';
import { useAgent } from '@/hooks/useAgent';
import { useProjectContext } from '@/context/ProjectContext';
import { ChatMessage } from './ChatMessage';

const SUGGESTIONS = [
  'What tasks are overdue?',
  'Show project status summary',
  'Create task Fix login bug due next week high priority',
  'Create project Marketing Campaign low risk',
  'Who has the most tasks?',
];


interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentDrawer = ({ isOpen, onClose }: Props) => {
  const { activeProject, reload: reloadProjects } = useProjectContext();
  const { messages, sendMessage, isLoading } = useAgent(activeProject?.id);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    // After any agent response, check if a project was created and refresh the project list
    const lastMsg = messages[messages.length - 1];
    if (
      lastMsg?.role === 'assistant' &&
      (lastMsg.toolResult?.type === 'project_created' ||
        lastMsg.toolResult?.type === 'task_created')
    ) {
      reloadProjects();
    }
  }, [messages, isLoading, reloadProjects]);

  const submit = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    if (taRef.current) taRef.current.style.height = 'auto';
    await sendMessage(trimmed);
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-30"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed right-0 top-0 h-full w-full max-w-[420px] z-40 bg-slate-900 border-l border-slate-700 flex flex-col shadow-2xl shadow-black/50"
          >
            <header className="px-5 py-4 border-b border-slate-700 flex justify-between items-center shrink-0">
              <div className="flex gap-2 items-start">
                <BrainCircuit size={20} className="text-blue-400 mt-0.5" />
                <div>
                  <div className="text-white font-semibold">AI Assistant</div>
                  <div className="text-slate-500 text-xs">
                    {activeProject?.name ?? 'No project selected'}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="flex-1 h-full flex flex-col items-center justify-center text-center gap-4 py-10">
                  <BrainCircuit size={48} className="text-slate-600" />
                  <div className="text-lg text-slate-400 font-medium">How can I help?</div>
                  <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setInput(s)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-400 hover:border-blue-500 hover:text-white transition-colors text-left"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {messages.map((m, i) => (
                    <ChatMessage key={i} msg={m} />
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 text-sm">
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.2s]" />
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.1s]" />
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-4 py-4 border-t border-slate-700 flex gap-2 items-end shrink-0">
              <textarea
                ref={taRef}
                value={input}
                onChange={onChange}
                onKeyDown={onKey}
                placeholder="Ask anything about your tasks..."
                rows={1}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent max-h-[120px]"
              />
              <button
                onClick={submit}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white shrink-0"
                aria-label="Send"
              >
                <SendHorizonal size={18} />
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
