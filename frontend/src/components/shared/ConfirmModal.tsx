import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  danger?: boolean;
}

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  danger,
}: Props) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full shadow-2xl"
        >
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-400 mt-2">{message}</p>
          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm rounded-lg text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm rounded-lg text-white font-medium ${
                danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
