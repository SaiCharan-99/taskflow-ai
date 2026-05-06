import { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import { AgentDrawer } from './AgentDrawer';
import { useAuthContext } from '@/context/AuthContext';

export const AgentButton = () => {
  const { user } = useAuthContext();
  const [open, setOpen] = useState(false);

  // Agent is restricted to ADMIN users only
  if (user?.globalRole !== 'ADMIN') return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen((o) => !o)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-blue-500/25 flex items-center justify-center text-white group"
          aria-label="AI Admin Assistant"
        >
          {!open && (
            <span className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
          )}
          <BrainCircuit size={24} />
          <span className="absolute bottom-full mb-2 right-0 bg-slate-800 text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            AI Admin Assistant
          </span>
        </motion.button>
      </div>
      <AgentDrawer isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
};
