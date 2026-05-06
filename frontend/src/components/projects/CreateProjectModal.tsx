import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useProjectContext } from '@/context/ProjectContext';
import { useToast } from '@/hooks/use-toast';
import { projectsApi } from '@/api/projects.api';

const schema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(500).optional().default(''),
});

type FormData = z.infer<typeof schema>;

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export const CreateProjectModal = ({ open, onOpenChange, onCreated }: CreateProjectModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { reload } = useProjectContext();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setIsSubmitting(true);
      await projectsApi.create(values);
      toast({ title: 'Success', description: 'Project created successfully' });
      reset();
      onOpenChange(false);
      reload();
      onCreated?.();
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create project';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) reset();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Create new project</DialogTitle>
          <DialogDescription className="text-slate-400">
            Set up a new project to organize your team's work
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Project name
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="e.g., Q1 Product Launch"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Description (optional)
            </label>
            <textarea
              {...register('description')}
              placeholder="Describe the project..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Create project
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
