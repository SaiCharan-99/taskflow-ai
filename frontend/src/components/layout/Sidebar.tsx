import { NavLink, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Kanban,
  CheckSquare,
  Users,
  Settings,
  LogOut,
  Folder,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuthContext } from '@/context/AuthContext';
import { useProjectContext } from '@/context/ProjectContext';
import { UserAvatar } from '@/components/shared/UserAvatar';
import type { Role, RiskLevel } from '@/types';

const ROLE_BADGE: Record<Role, string> = {
  ADMIN: 'bg-red-500/20 text-red-400',
  MANAGER: 'bg-amber-500/20 text-amber-400',
  MEMBER: 'bg-slate-600/50 text-slate-400',
};

const RISK_DOT: Record<RiskLevel, string> = {
  LOW: 'bg-emerald-500',
  MEDIUM: 'bg-amber-500',
  HIGH: 'bg-red-500',
};

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: (id: string) => `/dashboard/${id}` },
  { label: 'Board', icon: Kanban, to: (id: string) => `/projects/${id}/board` },
  { label: 'Tasks', icon: CheckSquare, to: (id: string) => `/projects/${id}/tasks` },
  { label: 'Project Settings', icon: Settings, to: (id: string) => `/projects/${id}/settings` },
];



export const Sidebar = () => {
  const { user, logout } = useAuthContext();
  const { projects, activeProject, setActiveProjectId } = useProjectContext();
  const params = useParams();
  const navigate = useNavigate();
  const projectId = activeProject?.id ?? params.projectId ?? params.id ?? '';

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-slate-900 border-r border-slate-700/50 flex flex-col z-20">
      <div className="px-4 py-5">
        <button
          className="flex items-center gap-2 group"
          onClick={() => navigate('/dashboard')}
        >
          <Logo size={24} />
          <span className="text-white font-bold text-lg tracking-tight">TaskFlow</span>
        </button>
        {activeProject && (
          <div className="mt-3 inline-flex items-center gap-2 bg-slate-800 rounded-full px-3 py-1 text-xs text-slate-300 max-w-full">
            <span className={`w-1.5 h-1.5 rounded-full ${RISK_DOT[activeProject.riskLevel]}`} />
            <span className="truncate">{activeProject.name}</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pt-4 scrollbar-thin">
        <div className="flex flex-col gap-1">
          {/* Projects link — navigates to the dedicated projects listing page */}
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ml-[-12px] pl-[10px] border-l-2 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 font-medium border-blue-500'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white border-transparent'
              }`
            }
          >
            <Folder size={16} />
            Projects
          </NavLink>

          {/* Teams link - always accessible */}
          <NavLink
            to="/teams"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ml-[-12px] pl-[10px] border-l-2 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 font-medium border-blue-500'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white border-transparent'
              }`
            }
          >
            <Users size={16} />
            Teams
          </NavLink>

          {/* Project-specific navigation - only available when project is active */}
          {projectId && (
            <>
              {NAV_ITEMS.map(({ label, icon: Icon, to }) => {
                const path = to(projectId);
                return (
                  <NavLink
                    key={label}
                    to={path}
                    end={false}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ml-[-12px] pl-[10px] border-l-2 ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-400 font-medium border-blue-500'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white border-transparent'
                      }`
                    }
                  >
                    <Icon size={16} />
                    {label}
                  </NavLink>
                );
              })}
            </>
          )}

          {/* Global Settings — always last */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ml-[-12px] pl-[10px] border-l-2 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 font-medium border-blue-500'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white border-transparent'
              }`
            }
          >
            <Settings size={16} />
            Settings
          </NavLink>
        </div>

        {projects.length > 0 && (
          <div className="mt-3">
            <div className="border-t border-slate-700/50 mx-3 my-3" />
            <div className="text-xs text-slate-500 uppercase tracking-wider px-3 mb-2">
              Projects
            </div>
            <div className="flex flex-col gap-0.5 max-h-44 overflow-y-auto scrollbar-thin">
              {projects.slice(0, 5).map((p) => {
                const active = p.id === activeProject?.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveProjectId(p.id);
                      navigate(`/dashboard/${p.id}`);
                    }}
                    className={`text-left px-3 py-1.5 text-xs rounded transition-colors truncate ${
                      active
                        ? 'bg-blue-600/20 text-blue-300 font-medium'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                    title={p.name}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {user && (
        <div className="border-t border-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="md" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user.name}</div>
              <div className={`text-xs px-2 py-0.5 rounded-full w-fit ${ROLE_BADGE[user.globalRole]}`}>
                {user.globalRole}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
};
