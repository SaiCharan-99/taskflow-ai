import express, { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = express.Router();

const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const VALID_TYPES = ['BUG', 'FEATURE', 'IMPROVEMENT'];

// Get tasks for a project
router.get('/:projectId/tasks', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { projectId } = req.params;

    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { globalRole: true } });
    const isPrivileged = user?.globalRole === 'ADMIN' || user?.globalRole === 'MANAGER';

    if (!isPrivileged) {
      const hasAccess = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { createdBy: req.userId },
            { members: { some: { userId: req.userId } } },
          ],
        },
        select: { id: true },
      });
      if (!hasAccess) return res.status(403).json({ error: 'Access denied' });
    }


    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: { assignee: true, creator: true },
      orderBy: { createdAt: 'desc' },
    });

    const formattedTasks = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      type: t.type,
      status: t.status,
      projectId: t.projectId,
      assigneeId: t.assigneeId,
      assignee: t.assignee
        ? {
            id: t.assignee.id,
            email: t.assignee.email,
            name: t.assignee.name,
            globalRole: t.assignee.globalRole,
            isVerified: t.assignee.isVerified,
            createdAt: t.assignee.createdAt,
          }
        : undefined,
      creatorId: t.creatorId,
      creator: {
        id: t.creator.id,
        email: t.creator.email,
        name: t.creator.name,
        globalRole: t.creator.globalRole,
        isVerified: t.creator.isVerified,
        createdAt: t.creator.createdAt,
      },
      dueDate: t.dueDate?.toISOString(),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create task — ADMIN and MANAGER only
router.post('/:projectId/tasks', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });

    const requester = await prisma.user.findUnique({ where: { id: req.userId }, select: { globalRole: true, name: true } });
    if (requester?.globalRole === 'MEMBER') {
      return res.status(403).json({ error: 'Only Admins and Managers can create tasks' });
    }

    const { projectId } = req.params;
    const { title, description, priority, type, status, assigneeId, dueDate } = req.body;

    const project = await prisma.project.findFirst({
      where: { id: projectId },
      select: { id: true, name: true },
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!title) return res.status(400).json({ error: 'Task title required' });

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` });
    }
    if (type && !VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` });
    }
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        type: type || 'FEATURE',
        status: status || 'TODO',
        projectId,
        assigneeId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        creatorId: req.userId,
      },
      include: { assignee: true, creator: true },
    });

    // Activity log
    await prisma.activityLog.create({
      data: {
        userId: req.userId,
        projectId,
        taskId: task.id,
        action: 'created',
        meta: JSON.stringify({ title: task.title }),
      },
    });

    // Notification for assignee (if assigned to someone else)
    if (assigneeId && assigneeId !== req.userId) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          title: 'New task assigned to you',
          message: `${requester?.name ?? 'Someone'} assigned you "${title}" in ${project.name}`,
          type: 'task_assigned',
          link: `/projects/${projectId}/board`,
          taskId: task.id,
          projectId,
        },
      });
    }

    res.status(201).json({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      type: task.type,
      status: task.status,
      projectId: task.projectId,
      assigneeId: task.assigneeId,
      assignee: task.assignee,
      creatorId: task.creatorId,
      creator: task.creator,
      dueDate: task.dueDate?.toISOString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});


// Update task
router.patch('/:projectId/tasks/:taskId', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { projectId, taskId } = req.params;
    const { title, description, priority, type, status, assigneeId, dueDate } = req.body;

    // Fetch requester name + project name for notification message
    const [requester, project, existingTask] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.userId }, select: { name: true } }),
      prisma.project.findUnique({ where: { id: projectId }, select: { name: true } }),
      prisma.task.findUnique({ where: { id: taskId }, select: { assigneeId: true, title: true } }),
    ]);

    const hasAccess = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { createdBy: req.userId },
          { members: { some: { userId: req.userId } } },
        ],
      },
      select: { id: true },
    });

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` });
    }

    if (type && !VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(type && { type }),
        ...(status && { status }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
      include: { assignee: true, creator: true },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.userId,
        projectId,
        taskId: task.id,
        action: 'updated',
        meta: JSON.stringify({ status: status || task.status }),
      },
    });

    // Notify new assignee if task was just assigned or reassigned to someone else
    const assigneeChanged = assigneeId !== undefined && assigneeId !== existingTask?.assigneeId;
    if (assigneeChanged && assigneeId && assigneeId !== req.userId) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          title: 'Task assigned to you',
          message: `${requester?.name ?? 'Someone'} assigned you "${task.title}" in ${project?.name ?? 'a project'}`,
          type: 'task_assigned',
          link: `/projects/${projectId}/board`,
          taskId: task.id,
          projectId,
        },
      });
    }

    // Notify if status changed — useful for task creator
    if (status && status !== existingTask?.assigneeId && task.creatorId && task.creatorId !== req.userId) {
      // Only notify on meaningful status transitions
      if (status === 'DONE' || status === 'IN_REVIEW') {
        await prisma.notification.create({
          data: {
            userId: task.creatorId,
            title: `Task moved to ${status.replace('_', ' ')}`,
            message: `"${task.title}" was moved to ${status.replace('_', ' ')} in ${project?.name ?? 'a project'}`,
            type: 'task_updated',
            link: `/projects/${projectId}/board`,
            taskId: task.id,
            projectId,
          },
        });
      }
    }

    res.json({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      type: task.type,
      status: task.status,
      projectId: task.projectId,
      assigneeId: task.assigneeId,
      assignee: task.assignee,
      creatorId: task.creatorId,
      creator: task.creator,
      dueDate: task.dueDate?.toISOString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:projectId/tasks/:taskId', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { projectId, taskId } = req.params;

    const hasAccess = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { createdBy: req.userId },
          { members: { some: { userId: req.userId } } },
        ],
      },
      select: { id: true },
    });

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.userId,
        projectId,
        taskId,
        action: 'deleted',
      },
    });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
