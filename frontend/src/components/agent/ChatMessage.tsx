import { AlertTriangle } from 'lucide-react';
import type { AgentMessage } from '@/types';
import { ToolResultCard } from './ToolResultCard';

export const ChatMessage = ({
  msg,
  onConfirm,
  onCancelConfirm,
}: {
  msg: AgentMessage;
  onConfirm?: () => void;
  onCancelConfirm?: () => void;
}) => {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm max-w-[80%] whitespace-pre-wrap">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2 max-w-[85%]">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-slate-200 whitespace-pre-wrap">
        {msg.content}
      </div>
      {msg.toolResult && (
        <div className="w-full">
          <ToolResultCard result={msg.toolResult} />
        </div>
      )}
      {msg.requiresConfirmation && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 w-full">
          <div className="flex gap-2 text-amber-300 text-sm">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{msg.confirmationText ?? 'Are you sure?'}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm"
            >
              Confirm
            </button>
            <button
              onClick={onCancelConfirm}
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
