import express, { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { calculateDashboardData } from '../utils/helpers';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Get dashboard data for a project
router.get('/:projectId', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { include: { user: true } }, tasks: { include: { assignee: true } } },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // ADMIN and MANAGER can access any project's dashboard
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { globalRole: true } });
    const isPrivileged = user?.globalRole === 'ADMIN' || user?.globalRole === 'MANAGER';

    const hasAccess =
      isPrivileged ||
      project.createdBy === req.userId ||
      project.members.some((member) => member.userId === req.userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }


    const dashboardData = await calculateDashboardData(projectId);

    // Get workload per user
    const workloadPerUser = project.members.map((member) => ({
      userId: member.userId,
      name: member.user.name,
      taskCount: project.tasks.filter((t) => t.assigneeId === member.userId).length,
      role: member.role,
    }));

    // Get recent activity
    const recentActivity = await prisma.activityLog.findMany({
      where: { projectId },
      include: { user: true, task: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const formattedActivity = recentActivity.map((log) => ({
      id: log.id,
      userId: log.userId,
      user: {
        id: log.user.id,
        email: log.user.email,
        name: log.user.name,
        globalRole: log.user.globalRole,
        isVerified: log.user.isVerified,
        createdAt: log.user.createdAt,
      },
      taskId: log.taskId,
      task: log.task,
      action: log.action,
      // meta may be a plain string (agent logs) or JSON string (task route logs) — parse safely
      meta: (() => {
        if (!log.meta) return undefined;
        try { return JSON.parse(log.meta); } catch { return log.meta; }
      })(),
      createdAt: log.createdAt.toISOString(),
    }));

    // Generate insights
    const insights = [];
    if (dashboardData.overdueTasks > 0) {
      insights.push(`⚠️ ${dashboardData.overdueTasks} overdue task(s) need attention`);
    }
    if (dashboardData.completedTasks === dashboardData.totalTasks && dashboardData.totalTasks > 0) {
      insights.push('🎉 All tasks completed!');
    }
    if (dashboardData.inProgressTasks > 5) {
      insights.push('👀 Multiple tasks in progress, prioritize completion');
    }

    res.json({
      totalTasks: dashboardData.totalTasks,
      completedTasks: dashboardData.completedTasks,
      inProgressTasks: dashboardData.inProgressTasks,
      overdueTasks: dashboardData.overdueTasks,
      workloadPerUser,
      recentActivity: formattedActivity,
      riskLevel: dashboardData.riskLevel,
      insights,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
