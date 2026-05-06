import { useState, useEffect, type ElementType, type ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/context/AuthContext';
import { useProjectContext } from '@/context/ProjectContext';
import { projectsApi } from '@/api/projects.api';
import { Settings, Users, Trash2, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const input =
  'w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

// FIX: Use ElementType/ReactNode from react instead of React.ElementType (no React import needed)
const Section = ({
  title,
  description,
  icon: Icon,
  children,
  danger = false,
}: {
  title: string;
  description: string;
  icon: ElementType;
  children: ReactNode;
  danger?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`border rounded-2xl p-6 ${
      danger
        ? 'bg-red-500/10 border-red-500/20'
        : 'bg-slate-800/60 border-slate-700/50'
    }`}
  >
    <div className="flex items-start gap-4 mb-5">
      <div className={`p-2 rounded-lg ${danger ? 'bg-red-500/20' : 'bg-blue-600/20'}`}>
        <Icon size={18} className={danger ? 'text-red-400' : 'text-blue-400'} />
      </div>
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="text-sm text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </motion.div>
);

export default function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { projects, setActiveProjectId, reload: reloadProjects } = useProjectContext();

  const project = projects.find((p) => p.id === id);

  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [saving, setSaving] = useState(false);

  const [members, setMembers] = useState<any[]>([]);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('MEMBER');
  const [addingMember, setAddingMember] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  // FIX: Include setActiveProjectId in deps to satisfy exhaustive-deps rule
  useEffect(() => {
    if (id) {
      setActiveProjectId(id);
      projectsApi.members(id).then(setMembers).catch(console.error);
    }
  }, [id, setActiveProjectId]);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description ?? '');
    }
  }, [project]);

  const isAdmin =
    user?.globalRole === 'ADMIN' ||
    members.some((m) => m.userId === user?.id && m.role === 'ADMIN');

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Project name is required');
    setSaving(true);
    try {
      await projectsApi.update(id!, { name, description });
      await reloadProjects();
      toast.success('Project updated');
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async () => {
    if (!memberEmail.trim()) return toast.error('Enter an email address');
    setAddingMember(true);
    try {
      const newMember = await projectsApi.addMember(id!, {
        email: memberEmail,
        role: memberRole,
      });
      setMembers((prev) => [...prev, newMember]);
      setMemberEmail('');
      toast.success('Member added');
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== project?.name) {
      return toast.error('Type the project name exactly to confirm');
    }
    setDeleting(true);
    try {
      await projectsApi.remove(id!);
      await reloadProjects();
      toast.success('Project deleted');
      navigate('/dashboard');
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? 'Failed to delete project');
      setDeleting(false);
    }
  };

  if (!project) {
    return (
      <div className="p-8 text-slate-400">
        Project not found.
      </div>
    );
  }

  const riskColor: Record<string, string> = {
    LOW: 'text-emerald-400 bg-emerald-500/20',
    MEDIUM: 'text-amber-400 bg-amber-500/20',
    HIGH: 'text-red-400 bg-red-500/20',
  };

  const memberRoleColor: Record<string, string> = {
    ADMIN: 'text-red-400 bg-red-500/20',
    MANAGER: 'text-amber-400 bg-amber-500/20',
    MEMBER: 'text-slate-400 bg-slate-600/50',
  };

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Project Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage <span className="text-white font-medium">{project.name}</span>
        </p>
      </div>

      {/* General */}
      <Section icon={Settings} title="General" description="Project name and description">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Project name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={input}
              disabled={!isAdmin}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${input} resize-none`}
              placeholder="Describe the project…"
              disabled={!isAdmin}
            />
          </div>
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Risk level
              </label>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${riskColor[project.riskLevel]}`}
              >
                <CheckCircle2 size={12} />
                {project.riskLevel}
              </span>
            </div>
          </div>
        </div>
        {isAdmin && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        )}
      </Section>

      {/* Members */}
      <Section icon={Users} title="Members" description="People with access to this project">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {members.map((m) => (
            <div
              key={m.userId}
              className="flex items-center justify-between py-2 border-b border-slate-700/40 last:border-0"
            >
              <div>
                <div className="text-sm font-medium text-white">{m.user?.name}</div>
                <div className="text-xs text-slate-400">{m.user?.email}</div>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${memberRoleColor[m.role]}`}
              >
                {m.role}
              </span>
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-xs text-slate-500 py-2">No members yet.</p>
          )}
        </div>

        {isAdmin && (
          <div className="pt-4 border-t border-slate-700/40 space-y-2">
            <p className="text-xs font-medium text-slate-400">Add member by email</p>
            <div className="flex gap-2">
              <input
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="colleague@company.com"
                className={`${input} flex-1`}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
              />
              <select
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MEMBER">Member</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button
                onClick={handleAddMember}
                disabled={addingMember}
                className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-60 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* Danger Zone — creator only */}
      {/* FIX: project.createdBy is now present in the Project type so this section renders correctly */}
      {project.createdBy === user?.id && (
        <Section
          icon={Trash2}
          title="Danger Zone"
          description="Permanently delete this project and all its tasks"
          danger
        >
          <div className="flex items-start gap-2 text-amber-400 text-sm">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            This action is irreversible. All tasks, boards, and activity logs will be deleted.
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Type <span className="text-white font-mono">{project.name}</span> to confirm
            </label>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={project.name}
              className={input}
            />
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting || deleteConfirm !== project.name}
            className="px-4 py-2 text-sm rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 font-medium border border-red-500/30 transition-colors disabled:opacity-40"
          >
            {deleting ? 'Deleting…' : 'Delete project'}
          </button>
        </Section>
      )}
    </div>
  );
}
