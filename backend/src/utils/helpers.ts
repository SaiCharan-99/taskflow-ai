import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const maskEmail = (email: string): string => {
  const [name, domain] = email.split('@');
  // ISSUE-14 FIX: guard against names shorter than 2 chars to avoid negative repeat() argument
  const visible = name.substring(0, 2);
  const masked = '*'.repeat(Math.max(0, name.length - 2));
  return `${visible}${masked}@${domain}`;
};

// Returns true if email verification is skipped (useful for staging/demo deployments)
export const isEmailVerifySkipped = () => process.env.SKIP_EMAIL_VERIFY === 'true';

const OTP_EMAIL_HTML = (otp: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f172a; color: #f1f5f9; border-radius: 12px;">
    <h2 style="margin: 0 0 8px; font-size: 22px; color: #6366f1;">TaskFlow AI</h2>
    <p style="margin: 0 0 24px; color: #94a3b8; font-size: 14px;">Your verification code</p>
    <div style="background: #1e293b; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
      <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #6366f1;">${otp}</span>
    </div>
    <p style="margin: 0; color: #64748b; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
  </div>
`;

export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  // Dev mode: just log to console (set FORCE_EMAIL=true to actually send in dev)
  if (process.env.NODE_ENV !== 'production' && process.env.FORCE_EMAIL !== 'true') {
    console.log(`📧 [DEV] OTP for ${email}: ${otp}`);
    return true;
  }

  // Staging/demo mode: skip sending entirely
  if (isEmailVerifySkipped()) {
    console.log(`📧 [SKIP_EMAIL_VERIFY] OTP for ${email}: ${otp}`);
    return true;
  }

  // SMTP via nodemailer (Gmail, Outlook, or any SMTP server)
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || `TaskFlow <${smtpUser}>`;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.error('❌ No SMTP credentials configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
    console.log(`📧 [FALLBACK] OTP for ${email}: ${otp}`);
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for port 465 (SSL), false for 587 (TLS)
      auth: {
        user: smtpUser,
        pass: smtpPass, // For Gmail: use App Password, NOT your regular password
      },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: 'Your TaskFlow verification code',
      html: OTP_EMAIL_HTML(otp),
    });

    console.log(`📧 OTP email sent to ${email}`);
    return true;
  } catch (err: any) {
    console.error(`❌ SMTP send failed:`, err.message);
    console.log(`📧 [FALLBACK] OTP for ${email}: ${otp}`);
    return true; // Don't crash the signup — user can request resend
  }
};


export const calculateDashboardData = async (projectId: string) => {
  const tasks = await prisma.task.findMany({
    where: { projectId },
  });

  const completed = tasks.filter((t) => t.status === 'DONE').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
  ).length;

  let riskLevel = 'LOW';
  if (overdue > tasks.length * 0.3) {
    riskLevel = 'HIGH';
  } else if (overdue > tasks.length * 0.1) {
    riskLevel = 'MEDIUM';
  }

  return {
    totalTasks: tasks.length,
    completedTasks: completed,
    inProgressTasks: inProgress,
    overdueTasks: overdue,
    riskLevel,
  };
};
