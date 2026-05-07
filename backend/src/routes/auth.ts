import express, { Response } from 'express';
import { hashPassword, verifyPassword, generateOTP, sendOTPEmail } from '../utils/helpers';
import { authMiddleware, generateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Login
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: { otpCode: otp, otpExpires },
      });

      await sendOTPEmail(email, otp);

      return res.json({ email, message: 'OTP sent to email' });
    }

    const token = generateToken(user.id);
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      globalRole: user.globalRole,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Signup
router.post('/signup', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);

    // Demo/staging mode: skip OTP — create user as verified and return token immediately
    if (isEmailVerifySkipped()) {
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, globalRole: 'MEMBER', isVerified: true },
      });
      const token = generateToken(user.id);
      return res.status(201).json({
        id: user.id, email: user.email, name: user.name,
        globalRole: user.globalRole, isVerified: true,
        createdAt: user.createdAt, token,
      });
    }

    // Production with real email: send OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.create({
      data: { name, email, password: hashedPassword, otpCode: otp, otpExpires, globalRole: 'MEMBER' },
    });

    await sendOTPEmail(email, otp);
    res.status(201).json({ email, message: 'Signup successful. OTP sent to email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req: AuthRequest, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.otpCode || user.otpCode !== code) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (user.otpExpires && user.otpExpires < new Date()) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, otpCode: null, otpExpires: null },
    });

    const token = generateToken(updatedUser.id);

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      globalRole: updatedUser.globalRole,
      isVerified: updatedUser.isVerified,
      createdAt: updatedUser.createdAt,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: otp, otpExpires },
    });

    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP resent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      globalRole: user.globalRole,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Logout
router.post('/logout', async (req: AuthRequest, res: Response) => {
  res.json({ message: 'Logout successful' });
});

// Update profile (name)
router.patch('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { name: name.trim() },
      select: { id: true, name: true, email: true, globalRole: true, isVerified: true, createdAt: true },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.post('/change-password', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await verifyPassword(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: req.userId }, data: { password: hashed } });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;

