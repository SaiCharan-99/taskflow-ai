import express, { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = express.Router();

// List projects — ADMIN/MANAGER see all, MEMBER sees only theirs
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });

    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { globalRole: true } });
    const isPrivileged = user?.globalRole === 'ADMIN' || user?.globalRole === 'MANAGER';

    const projects = await prisma.project.findMany({
      where: isPrivileged
        ? {} // all projects
        : { OR: [{ createdBy: req.userId }, { members: { some: { userId: req.userId } } }] },
      include: { members: true, tasks: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      riskLevel: p.riskLevel,
      memberCount: p.members.length,
      taskCount: p.tasks.length,
      createdAt: p.createdAt,
      createdBy: p.createdBy,
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});


// Get single project — ADMIN/MANAGER bypass access check
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });

    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { globalRole: true } });
    const isPrivileged = user?.globalRole === 'ADMIN' || user?.globalRole === 'MANAGER';

    const project = await prisma.project.findUnique({
      where: { id },
      include: { members: { include: { user: true } }, tasks: true },
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    const hasAccess = isPrivileged || project.createdBy === req.userId || project.members.some((m) => m.userId === req.userId);
    if (!hasAccess) return res.status(403).json({ error: 'Access denied' });

    res.json({
      id: project.id,
      name: project.name,
      description: project.description,
      riskLevel: project.riskLevel,
      memberCount: project.members.length,
      taskCount: project.tasks.length,
      createdAt: project.createdAt,
      createdBy: project.createdBy,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});


// Create project — ADMIN and MANAGER only
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });

    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { globalRole: true } });
    if (user?.globalRole === 'MEMBER') {
      return res.status(403).json({ error: 'Only Admins and Managers can create projects' });
    }

    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name required' });

    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdBy: req.userId,
        members: { create: { userId: req.userId, role: 'ADMIN' } },
      },
    });

    res.status(201).json({
      id: project.id,
      name: project.name,
      description: project.description,
      riskLevel: project.riskLevel,
      memberCount: 1,
      taskCount: 0,
      createdAt: project.createdAt,
      createdBy: project.createdBy,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});


// Get project members
router.get('/:id/members', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const members = await prisma.projectMember.findMany({
      where: { projectId: id },
      include: { user: true },
    });

    const formattedMembers = members.map((m) => ({
      userId: m.user.id,
      user: {
        id: m.user.id,
        email: m.user.email,
        name: m.user.name,
        globalRole: m.user.globalRole,
        isVerified: m.user.isVerified,
        createdAt: m.user.createdAt,
      },
      role: m.role,
      joinedAt: m.joinedAt,
    }));

    res.json(formattedMembers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Update project
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });

    const { id } = req.params;
    const { name, description } = req.body;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const member = await prisma.projectMember.findFirst({
      where: { projectId: id, userId: req.userId, role: 'ADMIN' },
    });

    if (!member && project.createdBy !== req.userId) {
      return res.status(403).json({ error: 'Only admins can update projects' });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    res.json({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      riskLevel: updated.riskLevel,
      createdAt: updated.createdAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });

    const { id } = req.params;
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.createdBy !== req.userId) {
      return res.status(403).json({ error: 'Only the project creator can delete this project' });
    }

    await prisma.project.delete({ where: { id } });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Add member to project
router.post('/:id/members', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });

    const { id } = req.params;
    const { email, role } = req.body;

    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Only admins or creator can add members
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const requesterMember = await prisma.projectMember.findFirst({
      where: { projectId: id, userId: req.userId, role: 'ADMIN' },
    });
    if (!requesterMember && project.createdBy !== req.userId) {
      return res.status(403).json({ error: 'Only admins can add members' });
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) return res.status(404).json({ error: 'No user found with that email' });

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: userToAdd.id } },
    });
    if (existing) return res.status(400).json({ error: 'User is already a member of this project' });

    const member = await prisma.projectMember.create({
      data: { projectId: id, userId: userToAdd.id, role: role || 'MEMBER' },
      include: { user: true },
    });

    res.status(201).json({
      userId: member.user.id,
      user: {
        id: member.user.id,
        email: member.user.email,
        name: member.user.name,
        globalRole: member.user.globalRole,
        isVerified: member.user.isVerified,
        createdAt: member.user.createdAt,
      },
      role: member.role,
      joinedAt: member.joinedAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

export default router;

