import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// ============================================
// GET ALL TEAMS (With full hierarchy)
// ============================================
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        manager: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            manager: { select: { id: true, name: true } },
          },
        },
        projects: {
          include: {
            team: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { department: 'asc' },
    });

    res.json({ success: true, count: teams.length, data: teams });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GET TEAM HIERARCHY (Tree structure)
// IMPORTANT: Defined BEFORE /:teamId to prevent route shadowing
// ============================================
router.get('/hierarchy/tree', authMiddleware, async (req: Request, res: Response) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        manager: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            manager: { select: { id: true, name: true } },
          },
        },
      },
    });

    const tree = teams.map((team) => {
      const leads = team.members.filter((m) => m.role === 'LEAD');
      const ics = team.members.filter((m) => m.role === 'IC');
      return {
        id: team.id,
        name: team.name,
        department: team.department,
        manager: team.manager,
        teamLead: leads.length > 0 ? leads[0] : null,
        memberCount: team.members.length,
        members: {
          leads: leads.map((m) => ({
            id: m.id,
            name: m.user.name,
            email: m.user.email,
            title: m.title,
            role: m.role,
          })),
          ics: ics.map((m) => ({
            id: m.id,
            name: m.user.name,
            email: m.user.email,
            title: m.title,
            role: m.role,
            manager: m.manager?.name || null,
          })),
        },
      };
    });

    res.json({ success: true, data: tree });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GET USER'S DIRECT REPORTS (Team management view)
// IMPORTANT: Defined BEFORE /:teamId to prevent route shadowing
// ============================================
router.get('/reports/direct', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const directReports = await prisma.teamMember.findMany({
      where: { managerId: userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true, department: true } },
      },
      orderBy: { user: { name: 'asc' } },
    });

    res.json({ success: true, count: directReports.length, data: directReports });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GET TEAM BY ID (With members and hierarchy)
// ============================================
router.get('/:teamId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        manager: { select: { id: true, name: true, email: true, globalRole: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, globalRole: true } },
            manager: { select: { id: true, name: true, email: true } },
          },
          orderBy: [{ role: 'desc' }, { user: { name: 'asc' } }],
        },
        projects: {
          include: { team: { select: { id: true, name: true } } },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    res.json({ success: true, data: team });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GET TEAM MEMBERS WITH FILTER
// ============================================
router.get('/:teamId/members', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { role } = req.query;

    const members = await prisma.teamMember.findMany({
      where: { teamId, ...(role && { role: role as string }) },
      include: {
        user: { select: { id: true, name: true, email: true, globalRole: true } },
        manager: { select: { id: true, name: true } },
        team: { select: { id: true, name: true } },
      },
      orderBy: [{ role: 'desc' }, { user: { name: 'asc' } }],
    });

    res.json({ success: true, count: members.length, data: members });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GET TEAM WORKLOAD (Tasks assigned to team members)
// ============================================
router.get('/:teamId/workload', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: { select: { userId: true } } },
    });

    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    const memberIds = team.members.map((m) => m.userId);

    const tasks = await prisma.task.findMany({
      where: { assigneeId: { in: memberIds } },
      include: {
        assignee: { select: { name: true, email: true } },
        project: { select: { name: true } },
      },
      orderBy: { priority: 'desc' },
    });

    const workload = memberIds.map((userId) => {
      const memberTasks = tasks.filter((t) => t.assigneeId === userId);
      return {
        userId,
        totalTasks: memberTasks.length,
        inProgress: memberTasks.filter((t) => t.status === 'IN_PROGRESS').length,
        done: memberTasks.filter((t) => t.status === 'DONE').length,
        overdue: memberTasks.filter(
          (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
        ).length,
        tasks: memberTasks,
      };
    });

    res.json({ success: true, data: workload });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// CREATE TEAM (Admin only)
// ============================================
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, description, department, managerId } = req.body;
    const requestUserId = (req as any).userId;

    // ISSUE-03 FIX: Fetch role from DB — req.userRole was never set by auth middleware
    const requestUser = await prisma.user.findUnique({
      where: { id: requestUserId },
      select: { globalRole: true },
    });

    if (requestUser?.globalRole !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Only admins can create teams' });
    }

    const manager = await prisma.user.findUnique({ where: { id: managerId } });
    if (!manager) {
      return res.status(400).json({ success: false, error: 'Manager not found' });
    }

    const team = await prisma.team.create({
      data: { name, description, department, managerId },
      include: { manager: true },
    });

    res.status(201).json({ success: true, data: team });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ADD MEMBER TO TEAM (Manager or Admin only)
// ============================================
router.post('/:teamId/members', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { userId, role, title, managerId } = req.body;
    const requestUserId = (req as any).userId;

    // ISSUE-03 FIX: Fetch role from DB — req.userRole was never set by auth middleware
    const requestUser = await prisma.user.findUnique({
      where: { id: requestUserId },
      select: { globalRole: true },
    });
    const userRole = requestUser?.globalRole;

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    if (userRole !== 'ADMIN' && team.managerId !== requestUserId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(400).json({ success: false, error: 'User not found' });
    }

    const existing = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
    if (existing) {
      return res.status(400).json({ success: false, error: 'User is already a team member' });
    }

    const member = await prisma.teamMember.create({
      data: { teamId, userId, role: role || 'IC', title: title || 'Team Member', managerId },
      include: { user: true, manager: { select: { name: true } } },
    });

    res.status(201).json({ success: true, data: member });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// UPDATE TEAM MEMBER ROLE (Manager or Admin only)
// ============================================
router.patch('/:teamId/members/:memberId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId, memberId } = req.params;
    const { role, title, managerId } = req.body;
    const requestUserId = (req as any).userId;

    // ISSUE-03 FIX: Fetch role from DB — req.userRole was never set by auth middleware
    const requestUser = await prisma.user.findUnique({
      where: { id: requestUserId },
      select: { globalRole: true },
    });
    const userRole = requestUser?.globalRole;

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    if (userRole !== 'ADMIN' && team.managerId !== requestUserId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const member = await prisma.teamMember.update({
      where: { id: memberId },
      data: {
        ...(role && { role }),
        ...(title && { title }),
        ...(managerId !== undefined && { managerId }),
      },
      include: { user: true, manager: { select: { name: true } } },
    });

    res.json({ success: true, data: member });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// REMOVE MEMBER FROM TEAM (Manager or Admin only)
// ============================================
router.delete('/:teamId/members/:memberId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId, memberId } = req.params;
    const requestUserId = (req as any).userId;

    // ISSUE-03 FIX: Fetch role from DB — req.userRole was never set by auth middleware
    const requestUser = await prisma.user.findUnique({
      where: { id: requestUserId },
      select: { globalRole: true },
    });
    const userRole = requestUser?.globalRole;

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    if (userRole !== 'ADMIN' && team.managerId !== requestUserId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await prisma.teamMember.delete({ where: { id: memberId } });

    res.json({ success: true, message: 'Member removed from team' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
