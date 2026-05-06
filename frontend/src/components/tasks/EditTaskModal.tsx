import { CreateTaskModal } from './CreateTaskModal';
import { tasksApi, type CreateTaskPayload } from '@/api/tasks.api';
import type { Task, ProjectMember } from '@/types';

interface Props {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  members: ProjectMember[];
  onSuccess?: () => void;
}

export const EditTaskModal = ({ task, isOpen, onClose, members, onSuccess }: Props) => {
  const handleSubmit = async (payload: CreateTaskPayload) => {
    await tasksApi.update(task.projectId, task.id, payload);
    onSuccess?.();
  };

  return (
    <CreateTaskModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      members={members}
      editTask={task}
    />
  );
};
