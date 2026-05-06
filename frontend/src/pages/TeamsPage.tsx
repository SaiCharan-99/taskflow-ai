import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, TrendingUp, UserCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { teamsApi } from '@/api/teams.api';
import OrgChart from '@/components/teams/OrgChart';

interface TeamMember {
  userId: string;
  role: string;
  title: string;
  user: { id: string; name: string; email: string };
  manager?: { id: string; name: string } | null;
}

interface Team {
  id: string;
  name: string;
  description: string;
  department: string;
  manager: { id: string; name: string; email: string };
  members: TeamMember[];
  projects: any[];
}

const deptColor: Record<string, { dot: string; badge: string }> = {
  Engineering: { dot: 'bg-blue-400',   badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  Product:     { dot: 'bg-violet-400', badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  Operations:  { dot: 'bg-emerald-400',badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  Marketing:   { dot: 'bg-pink-400',   badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
};
const getDept = (dept: string) => deptColor[dept] ?? { dot: 'bg-slate-400', badge: 'bg-slate-600/50 text-slate-300 border-slate-600/50' };

const Avatar = ({ name }: { name: string }) => {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const hue = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
      style={{ background: `hsl(${hue}, 60%, 40%)` }}
    >
      {initials}
    </div>
  );
};

const roleBadge = (role: string) => {
  const map: Record<string, string> = {
    LEAD: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    IC:   'bg-slate-600/50 text-slate-300 border-slate-600/50',
  };
  return map[role] ?? 'bg-slate-600/50 text-slate-300 border-slate-500/30';
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [hierarchyData, setHierarchyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [teamsArr, hierarchyArr] = await Promise.all([
          teamsApi.getAllTeams(),
          teamsApi.getHierarchyTree(),
        ]);
        const teams = Array.isArray(teamsArr) ? teamsArr : [];
        const hierarchy = Array.isArray(hierarchyArr) ? hierarchyArr : [];
        setTeams(teams);
        setHierarchyData(hierarchy);
        if (teams.length > 0) setActiveTeamId(teams[0].id);
      } catch (err) {
        console.error('Failed to fetch teams:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const totalMembers = teams.reduce((sum, t) => sum + t.members.length, 0);
  const totalProjects = new Set(teams.flatMap((t) => t.projects.map((p: any) => p.projectId))).size;

  const totalLeads = teams.reduce(
    (sum, t) => sum + t.members.filter((m) => m.role === 'LEAD').length,
    0
  );

  if (loading) {
    return (
      <div className="px-6 py-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const activeTeam = teams.find((t) => t.id === activeTeamId);
  const filteredMembers = activeTeam?.members.filter((m) =>
    m.user.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.title.toLowerCase().includes(memberSearch.toLowerCase())
  ) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 py-8 space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Team Management</h1>
        <p className="text-sm text-slate-400 mt-1">Organizational structure, hierarchy, and team overview</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Building2, label: 'Departments', value: teams.length, color: 'text-blue-400 bg-blue-500/10' },
          { icon: Users, label: 'Team Members', value: totalMembers, color: 'text-violet-400 bg-violet-500/10' },
          { icon: TrendingUp, label: 'Active Projects', value: totalProjects, color: 'text-emerald-400 bg-emerald-500/10' },
          { icon: UserCheck, label: 'Team Leads', value: totalLeads, color: 'text-amber-400 bg-amber-500/10' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon size={18} className={color.split(' ')[0]} />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{value}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="org" className="space-y-4">
        <TabsList className="bg-slate-800/60 border border-slate-700/50">
          <TabsTrigger value="org">Org Chart</TabsTrigger>
          <TabsTrigger value="teams">Team Cards</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        {/* ─── Org Chart Tab ─────────────────────────────────── */}
        <TabsContent value="org">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
            <OrgChart hierarchyData={hierarchyData} />
          </div>
        </TabsContent>

        {/* ─── Team Cards Tab ─────────────────────────────────── */}
        <TabsContent value="teams">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => {
              const dept = getDept(team.department);
              const leads = team.members.filter((m) => m.role === 'LEAD');
              const ics = team.members.filter((m) => m.role === 'IC');
              return (
                <motion.div
                  key={team.id}
                  whileHover={{ y: -2 }}
                  onClick={() => setActiveTeamId(team.id)}
                  className={`bg-slate-800/60 border rounded-2xl p-5 cursor-pointer transition-all ${
                    activeTeamId === team.id ? 'border-blue-500/60 ring-1 ring-blue-500/30' : 'border-slate-700/50 hover:border-slate-600/70'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white">{team.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{team.description}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${dept.badge}`}>
                      {team.department}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Avatar name={team.manager.name} />
                    <div>
                      <div className="text-xs font-medium text-white">{team.manager.name}</div>
                      <div className="text-[11px] text-slate-500">Team Lead</div>
                    </div>
                  </div>

                  {/* Member avatars */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {team.members.slice(0, 5).map((m) => (
                      <div key={m.userId} title={`${m.user.name} — ${m.title}`}>
                        <Avatar name={m.user.name} />
                      </div>
                    ))}
                    {team.members.length > 5 && (
                      <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                        +{team.members.length - 5}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700/40 flex justify-between text-xs text-slate-400">
                    <span>{leads.length} lead{leads.length !== 1 ? 's' : ''}</span>
                    <span>{ics.length} IC{ics.length !== 1 ? 's' : ''}</span>
                    <span>{team.projects.length} project{team.projects.length !== 1 ? 's' : ''}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* ─── Members Tab ─────────────────────────────────────── */}
        <TabsContent value="members">
          <div className="space-y-4">
            {/* Team selector + search */}
            <div className="flex gap-3 flex-wrap">
              {teams.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTeamId(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    activeTeamId === t.id
                      ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            {activeTeam && (
              <>
                <input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search members by name or role…"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                    <h3 className="font-semibold text-white">{activeTeam.name}</h3>
                    <span className="text-xs text-slate-400">{filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="divide-y divide-slate-700/40">
                    {filteredMembers.map((m) => (
                      <div key={m.userId} className="flex items-center justify-between px-6 py-4 hover:bg-slate-700/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar name={m.user.name} />
                          <div>
                            <div className="text-sm font-medium text-white">{m.user.name}</div>
                            <div className="text-xs text-slate-400">{m.title}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {m.manager && (
                            <div className="hidden sm:block text-right">
                              <div className="text-[10px] text-slate-500">Reports to</div>
                              <div className="text-xs text-slate-400">{m.manager.name}</div>
                            </div>
                          )}
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${roleBadge(m.role)}`}>
                            {m.role}
                          </span>
                        </div>
                      </div>
                    ))}
                    {filteredMembers.length === 0 && (
                      <div className="px-6 py-8 text-center text-sm text-slate-500">
                        No members found
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
