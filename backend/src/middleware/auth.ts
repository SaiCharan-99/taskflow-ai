import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
// ISSUE-06 FIX: Use shared Prisma singleton instead of creating a new PrismaClient instance
// (a second instance opened its own connection pool, risking exhaustion under load)
import { prisma } from '../lib/prisma.js';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', {
    expiresIn: (process.env.JWT_EXPIRY || '7d') as jwt.SignOptions['expiresIn'],
  });
};

/**
 * ISSUE-16 FIX: Reusable global-admin guard middleware.
 * Use this instead of duplicating the admin check inline in each route file.
 * Usage: router.post('/chat', requireAdmin, handler)
 */
export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { globalRole: true },
  });
  if (user?.globalRole !== 'ADMIN') {
    return res.status(403).json({ error: 'AI Agent is restricted to Admins only.' });
  }
  next();
};

/**
 * Middleware to enforce project-level role-based access control.
 * Global ADMINs bypass all checks.
 * Usage: router.delete('/...', requireProjectRole(['ADMIN', 'MANAGER']), handler)
 */
export const requireProjectRole = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    const projectId = req.params.projectId || req.params.id;
    if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

    try {
      // Global ADMINs bypass all project-level checks
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { globalRole: true },
      });
      if (user?.globalRole === 'ADMIN') return next();

      const membership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: req.userId } },
      });

      if (!membership || !allowedRoles.includes(membership.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (err) {
      console.error('requireProjectRole error:', err);
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};
