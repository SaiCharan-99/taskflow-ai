import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// POST /api/role-requests - Create a new role request (by new users)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { requestedRole, reason, position } = req.body;
    const userId = req.userId as string;

    // Check if user already has a role request
    const existingRequest = await prisma.roleRequest.findUnique({
      where: { userId },
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'You already have a pending or processed role request' });
    }

    // Validate requested role
    if (!['ADMIN', 'MANAGER', 'MEMBER'].includes(requestedRole)) {
      return res.status(400).json({ error: 'Invalid role requested' });
    }

    // Create role request
    const roleRequest = await prisma.roleRequest.create({
      data: {
        userId,
        requestedRole,
        reason,
        position: position || null,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            globalRole: true,
          },
        },
      },
    });

    res.json(roleRequest);
  } catch (error) {
    console.error('Error creating role request:', error);
    res.status(500).json({ error: 'Failed to create role request' });
  }
});

// GET /api/role-requests - List all role requests (admin only)
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId as string;

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.globalRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can view role requests' });
    }

    // Get all role requests
    const roleRequests = await prisma.roleRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            globalRole: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(roleRequests);
  } catch (error) {
    console.error('Error fetching role requests:', error);
    res.status(500).json({ error: 'Failed to fetch role requests' });
  }
});

// PATCH /api/role-requests/:id - Approve or reject role request (admin only)
router.patch('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;
    const reviewerId = req.userId as string;

    // Check if reviewer is admin
    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId },
    });

    if (!reviewer || reviewer.globalRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can review role requests' });
    }

    // Validate status
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get the role request
    const roleRequest = await prisma.roleRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!roleRequest) {
      return res.status(404).json({ error: 'Role request not found' });
    }

    // Update role request
    const updatedRequest = await prisma.roleRequest.update({
      where: { id },
      data: {
        status,
        reviewedBy: reviewerId,
        reviewNotes: reviewNotes || null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            globalRole: true,
          },
        },
      },
    });

    // If approved, update user's global role
    if (status === 'APPROVED' && roleRequest.requestedRole) {
      await prisma.user.update({
        where: { id: roleRequest.userId },
        data: {
          globalRole: roleRequest.requestedRole,
        },
      });
    }

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating role request:', error);
    res.status(500).json({ error: 'Failed to update role request' });
  }
});

// GET /api/role-requests/user/:userId - Get user's role request (by user or admin)
router.get('/user/:userId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.userId as string;

    // Check if user is requesting their own or if requester is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
    });

    if (currentUserId !== targetUserId && currentUser?.globalRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const roleRequest = await prisma.roleRequest.findUnique({
      where: { userId: targetUserId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            globalRole: true,
          },
        },
      },
    });

    if (!roleRequest) {
      return res.json(null); // No role request for this user
    }

    res.json(roleRequest);
  } catch (error) {
    console.error('Error fetching role request:', error);
    res.status(500).json({ error: 'Failed to fetch role request' });
  }
});

export default router;
