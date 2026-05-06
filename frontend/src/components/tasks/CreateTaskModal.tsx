import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import type { CreateTaskPayload } from '@/api/tasks.api';
import type { ProjectMember, Task } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  type: z.enum(['BUG', 'FEATURE', 'IMPROVEMENT']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  assigneeId: z.string().optional().or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
  members: ProjectMember[];
  /** When provided, the modal acts as an edit modal and pre-fills the form */
  editTask?: Task;
}

const inputBase =
  'w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export const CreateTaskModal = ({ isOpen, onClose, onSubmit, members, editTask }: Props) => {
  const isEditing = !!editTask;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: 'MEDIUM',
      type: 'FEATURE',
      status: 'TODO',
    },
  });

  // When editTask changes (or modal opens), reset form with pre-filled values
  useEffect(() => {
    if (isOpen && editTask) {
      reset({
        title: editTask.title,
        description: editTask.description || '',
        priority: editTask.priority,
        type: editTask.type,
        status: editTask.status,
        assigneeId: editTask.assigneeId || '',
        dueDate: editTask.dueDate ? editTask.dueDate.slice(0, 10) : '',
      });
    } else if (!isOpen) {
      reset({
        priority: 'MEDIUM',
        type: 'FEATURE',
        status: 'TODO',
      });
    }
  }, [isOpen, editTask, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      title: values.title,
      description: values.description || undefined,
      priority: values.priority,
      type: values.type,
      status: values.status,
      assigneeId: values.assigneeId || undefined,
      dueDate: values.dueDate || undefined,
    });
    onClose();
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-white">
                {isEditing ? 'Edit task' : 'Create task'}
              </h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Title</label>
                <input
                  {...register('title')}
                  placeholder="What needs to be done?"
                  className={inputBase}
                  autoFocus
                />
                {errors.title && (
                  <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Add more context..."
                  rows={3}
                  className={`${inputBase} resize-none`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Priority
                  </label>
                  <select {...register('priority')} className={inputBase}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Type</label>
                  <select {...register('type')} className={inputBase}>
                    <option value="BUG">Bug</option>
                    <option value="FEATURE">Feature</option>
                    <option value="IMPROVEMENT">Improvement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                  <select {...register('status')} className={inputBase}>
                    <option value="TODO">To do</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="IN_REVIEW">In review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Due date
                  </label>
                  <input type="date" {...register('dueDate')} className={inputBase} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Assignee</label>
                <select {...register('assigneeId')} className={inputBase}>
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-60"
                >
                  {isSubmitting ? (isEditing ? 'Saving…' : 'Creating…') : isEditing ? 'Save changes' : 'Create task'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
