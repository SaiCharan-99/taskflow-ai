import { useEffect, useRef, useState } from 'react';
import { Bell, Search, Settings, LogOut, CheckCheck, X, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '@/context/AuthContext';
import { useProjectContext } from '@/context/ProjectContext';
import { notificationsApi, type Notification } from '@/api/notifications.api';
import { relativeTime } from '@/utils/dates';

const pageNameFromPath = (pathname: string) => {
  if (pathname.includes('/board')) return 'Board';
  if (pathname.includes('/tasks')) return 'Tasks';
  if (pathname.includes('/settings') && pathname.includes('/projects')) return 'Project Settings';
  if (pathname === '/settings') return 'Settings';
  if (pathname === '/teams') return 'Teams';
  if (pathname.startsWith('/dashboard/')) return 'Dashboard';
  if (pathname === '/dashboard') return 'All projects';
  return '';
};

// ─── Avatar ──────────────────────────────────────────────────────────────────
const AvatarCircle = ({ name, size = 32 }: { name: string; size?: number }) => {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const hue = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 cursor-pointer ring-2 ring-transparent hover:ring-blue-500 transition-all"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        background: `hsl(${hue}, 60%, 38%)`,
      }}
    >
      {initials}
    </div>
  );
};

// ─── Notification type icon & color ──────────────────────────────────────────
const notifStyle = (type: string) => {
  const map: Record<string, { dot: string; bg: string }> = {
    task_assigned: { dot: 'bg-blue-400',    bg: 'bg-blue-500/10' },
    task_updated:  { dot: 'bg-amber-400',   bg: 'bg-amber-500/10' },
    project_added: { dot: 'bg-emerald-400', bg: 'bg-emerald-500/10' },
    mention:       { dot: 'bg-violet-400',  bg: 'bg-violet-500/10' },
  };
  return map[type] ?? { dot: 'bg-slate-400', bg: 'bg-slate-700/50' };
};

// ─── TopBar ───────────────────────────────────────────────────────────────────
export const TopBar = () => {
  const { user, logout } = useAuthContext();
  const { activeProject } = useProjectContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const pageName = pageNameFromPath(pathname);

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Poll every 30 seconds
  const fetchNotifications = async () => {
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // silently fail if server is down
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id: string, link?: string) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    setBellOpen(false);
    if (link) navigate(link);
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const roleColor: Record<string, string> = {
    ADMIN:   'bg-red-500/20 text-red-400',
    MANAGER: 'bg-amber-500/20 text-amber-400',
    MEMBER:  'bg-slate-600/50 text-slate-400',
  };

  return (
    <header className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50 px-6 py-3 flex justify-between items-center">
      {/* Breadcrumb */}
      <div className="text-sm text-slate-400 flex items-center gap-2">
        <span>Projects</span>
        {activeProject && (
          <>
            <span className="text-slate-600">›</span>
            <span className="text-slate-300">{activeProject.name}</span>
          </>
        )}
        {pageName && (
          <>
            <span className="text-slate-600">›</span>
            <span className="text-white font-medium">{pageName}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks... (⌘K)"
            className="bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 w-60 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* ─── Bell / Notifications ─────────────────────────────── */}
        <div ref={bellRef} className="relative">
          <button
            onClick={() => { setBellOpen((o) => !o); setProfileOpen(false); }}
            className="relative w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {bellOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-slate-400" />
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-blue-600/30 text-blue-300 px-1.5 py-0.5 rounded-full font-medium">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
                      >
                        <CheckCheck size={12} />
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setBellOpen(false)} className="text-slate-500 hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-700/40">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
                      <Bell size={28} className="opacity-30" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const style = notifStyle(notif.type);
                      return (
                        <button
                          key={notif.id}
                          onClick={() => handleMarkRead(notif.id, notif.link)}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-800/60 transition-colors flex items-start gap-3 ${!notif.isRead ? style.bg : ''}`}
                        >
                          <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.isRead ? 'bg-slate-700' : style.dot}`} />
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium ${notif.isRead ? 'text-slate-400' : 'text-white'}`}>
                              {notif.title}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</div>
                            <div className="text-[10px] text-slate-600 mt-1">{relativeTime(notif.createdAt)}</div>
                          </div>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Profile Avatar / Dropdown ────────────────────────── */}
        {user && (
          <div ref={profileRef} className="relative">
            <button
              onClick={() => { setProfileOpen((o) => !o); setBellOpen(false); }}
              aria-label="Profile menu"
            >
              <AvatarCircle name={user.name} size={34} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-11 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
                >
                  {/* User info */}
                  <div className="px-4 py-4 border-b border-slate-700/60 flex items-center gap-3">
                    <AvatarCircle name={user.name} size={42} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{user.name}</div>
                      <div className="text-xs text-slate-400 truncate">{user.email}</div>
                      <span className={`mt-1 inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${roleColor[user.globalRole] ?? 'bg-slate-600/50 text-slate-400'}`}>
                        {user.globalRole}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="py-1.5">
                    <button
                      onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <Settings size={15} />
                      Account Settings
                    </button>
                    <button
                      onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <User size={15} />
                      Edit Profile
                    </button>
                    <div className="h-px bg-slate-700/60 my-1.5 mx-3" />
                    <button
                      onClick={() => { logout(); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
};
