import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/context/AuthContext';
import { authApi } from '@/api/auth.api';
import {
  User,
  Bell,
  Shield,
  Palette,
  KeyRound,
  LogOut,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const Section = ({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6"
  >
    <div className="flex items-start gap-4 mb-5">
      <div className="p-2 bg-blue-600/20 rounded-lg">
        <Icon size={18} className="text-blue-400" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="text-sm text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </motion.div>
);

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
    <label className="text-sm text-slate-400 w-36 flex-shrink-0">{label}</label>
    <div className="flex-1">{children}</div>
  </div>
);

const input =
  'w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const btn =
  'px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-60 transition-colors';

export default function SettingsPage() {
  const { user, logout } = useAuthContext();

  // Profile state
  const [name, setName] = useState(user?.name ?? '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Notification prefs
  const [notifs, setNotifs] = useState({
    taskAssigned: true,
    taskOverdue: true,
    projectUpdates: false,
    weeklyDigest: true,
  });

  const handleProfileSave = async () => {
    if (!name.trim()) return toast.error('Name cannot be empty');
    setProfileSaving(true);
    try {
      await authApi.updateProfile({ name });
      toast.success('Profile updated successfully');
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) return toast.error('Fill in all password fields');
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');
    if (newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setPasswordSaving(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const roleColor: Record<string, string> = {
    ADMIN: 'text-red-400 bg-red-500/20',
    MANAGER: 'text-amber-400 bg-amber-500/20',
    MEMBER: 'text-slate-400 bg-slate-600/50',
  };

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your account, preferences, and security settings
        </p>
      </div>

      {/* ── Profile ────────────────────────────────────────────── */}
      <Section icon={User} title="Profile" description="Your personal information">
        <Field label="Full name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={input}
            placeholder="Your full name"
          />
        </Field>
        <Field label="Email">
          <input
            value={user?.email ?? ''}
            disabled
            className={`${input} opacity-50 cursor-not-allowed`}
          />
        </Field>
        <Field label="Role">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${roleColor[user?.globalRole ?? 'MEMBER']}`}
          >
            <CheckCircle2 size={12} />
            {user?.globalRole}
          </span>
        </Field>
        <Field label="Account status">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full text-emerald-400 bg-emerald-500/20">
            <CheckCircle2 size={12} />
            Verified
          </span>
        </Field>
        <div className="flex justify-end pt-2">
          <button onClick={handleProfileSave} disabled={profileSaving} className={btn}>
            {profileSaving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </Section>

      {/* ── Security ───────────────────────────────────────────── */}
      <Section icon={KeyRound} title="Security" description="Change your password">
        <Field label="Current password">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            className={input}
          />
        </Field>
        <Field label="New password">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className={input}
          />
        </Field>
        <Field label="Confirm">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            className={input}
          />
        </Field>
        {newPassword && confirmPassword && newPassword !== confirmPassword && (
          <div className="flex items-center gap-2 text-red-400 text-xs ml-36">
            <AlertCircle size={12} />
            Passwords do not match
          </div>
        )}
        <div className="flex justify-end pt-2">
          <button onClick={handlePasswordChange} disabled={passwordSaving} className={btn}>
            {passwordSaving ? 'Changing…' : 'Change password'}
          </button>
        </div>
      </Section>

      {/* ── Notifications ──────────────────────────────────────── */}
      <Section icon={Bell} title="Notifications" description="Choose what you get notified about">
        {(
          [
            { key: 'taskAssigned', label: 'Task assigned to me', desc: 'When someone assigns a task to you' },
            { key: 'taskOverdue', label: 'Task overdue alerts', desc: 'Daily reminder for overdue tasks' },
            { key: 'projectUpdates', label: 'Project updates', desc: 'When a project is updated or members added' },
            { key: 'weeklyDigest', label: 'Weekly digest', desc: 'A summary email every Monday' },
          ] as const
        ).map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-2 border-b border-slate-700/40 last:border-0">
            <div>
              <div className="text-sm font-medium text-white">{label}</div>
              <div className="text-xs text-slate-500">{desc}</div>
            </div>
            <button
              onClick={() => setNotifs((n) => ({ ...n, [key]: !n[key] }))}
              className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${
                notifs[key] ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  notifs[key] ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
        <p className="text-xs text-slate-500 pt-1">
          Note: Email notifications are sent to <span className="text-slate-300">{user?.email}</span>
        </p>
      </Section>

      {/* ── Appearance ─────────────────────────────────────────── */}
      <Section icon={Palette} title="Appearance" description="Interface preferences">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">Dark mode</div>
            <div className="text-xs text-slate-500">App uses dark theme by default</div>
          </div>
          <span className="text-xs bg-blue-600/20 text-blue-400 px-2.5 py-1 rounded-full font-medium">
            Always on
          </span>
        </div>
      </Section>

      {/* ── Role & Access ───────────────────────────────────────── */}
      <Section
        icon={Shield}
        title="Role & Access"
        description="Your permissions in TaskFlow"
      >
        <div className="space-y-2 text-sm">
          {user?.globalRole === 'ADMIN' && (
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 size={14} />
              Full admin access — can manage all users, projects, and settings
            </div>
          )}
          {user?.globalRole === 'MANAGER' && (
            <div className="flex items-center gap-2 text-amber-400">
              <CheckCircle2 size={14} />
              Manager access — can create projects, assign tasks, manage team members
            </div>
          )}
          {user?.globalRole === 'MEMBER' && (
            <>
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 size={14} />
                Member access — can view projects and update assigned tasks
              </div>
              <a
                href="/role-request"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-xs mt-2"
              >
                <Shield size={12} />
                Request a role upgrade →
              </a>
            </>
          )}
        </div>
      </Section>

      {/* ── Danger Zone ─────────────────────────────────────────── */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <LogOut size={18} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Sign out</h2>
            <p className="text-sm text-slate-400 mt-0.5">Sign out of your account on this device</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 font-medium border border-red-500/30 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
