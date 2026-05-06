import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Mail, Briefcase } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrgMember {
  id: string;
  name: string;
  title: string;
  email: string;
  level: 'CEO' | 'C_SUITE' | 'SENIOR' | 'IC' | 'INTERN';
  department: string;
  children?: OrgMember[];
}

// ─── Level styling ────────────────────────────────────────────────────────────
const LEVEL_CONFIG: Record<OrgMember['level'], { bg: string; border: string; badge: string; avatarGrad: string }> = {
  CEO:     { bg: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20', border: 'border-amber-500/60', badge: 'bg-amber-500/20 text-amber-300', avatarGrad: 'from-amber-500 to-orange-500' },
  C_SUITE: { bg: 'bg-gradient-to-br from-blue-600/20 to-cyan-500/15',    border: 'border-blue-500/50',  badge: 'bg-blue-500/20 text-blue-300',   avatarGrad: 'from-blue-500 to-cyan-500' },
  SENIOR:  { bg: 'bg-gradient-to-br from-violet-600/20 to-purple-500/15',border: 'border-violet-500/40',badge: 'bg-violet-500/20 text-violet-300',avatarGrad: 'from-violet-500 to-purple-600' },
  IC:      { bg: 'bg-gradient-to-br from-slate-700/60 to-slate-800/60',  border: 'border-slate-600/50', badge: 'bg-slate-600/50 text-slate-300',  avatarGrad: 'from-slate-500 to-slate-600' },
  INTERN:  { bg: 'bg-gradient-to-br from-emerald-500/15 to-teal-500/10', border: 'border-emerald-500/40',badge: 'bg-emerald-500/20 text-emerald-300',avatarGrad: 'from-emerald-500 to-teal-500' },
};

const LEVEL_LABEL: Record<OrgMember['level'], string> = {
  CEO: 'Executive', C_SUITE: 'C-Suite', SENIOR: 'Senior', IC: 'Individual Contributor', INTERN: 'Intern',
};

// Line color constant
const LINE = 'bg-slate-500/50';

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, level }: { name: string; level: OrgMember['level'] }) => {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${LEVEL_CONFIG[level].avatarGrad} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg`}>
      {initials}
    </div>
  );
};

// ─── Node Card ────────────────────────────────────────────────────────────────
const NodeCard = ({
  member,
  expanded,
  onToggle,
}: {
  member: OrgMember;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const cfg = LEVEL_CONFIG[member.level];
  const hasChildren = !!member.children?.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative border rounded-xl p-3 w-52 ${cfg.bg} ${cfg.border} shadow-lg select-none`}
    >
      {/* Level badge */}
      <span className={`absolute -top-2.5 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
        {LEVEL_LABEL[member.level]}
      </span>

      <div className="flex items-center gap-2 mt-1">
        <Avatar name={member.name} level={member.level} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white leading-tight truncate">{member.name}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 leading-tight line-clamp-2">{member.title}</div>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500 truncate">
        <Mail size={9} className="flex-shrink-0" />
        <span className="truncate">{member.email}</span>
      </div>

      {/* Expand toggle */}
      {hasChildren && (
        <button
          onClick={onToggle}
          className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border flex items-center justify-center bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all z-20 shadow-md ${cfg.border}`}
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      )}
    </motion.div>
  );
};

// ─── Org Tree — recursive, CSS border-based connectors ────────────────────────
const OrgTree = ({ member, depth = 0 }: { member: OrgMember; depth?: number }) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const children = member.children ?? [];
  const hasChildren = children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <NodeCard
        member={member}
        expanded={expanded}
        onToggle={() => setExpanded((e) => !e)}
      />

      {/* Children subtree */}
      {hasChildren && (
        <AnimatePresence>
          {expanded && (
            <motion.div
              key="children"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="flex flex-col items-center overflow-hidden"
            >
              {/* Vertical line from card down to the horizontal bar */}
              <div className={`w-px ${LINE}`} style={{ height: 28 }} />

              {/* Children row — each child wraps its own vertical stub */}
              <div className="flex items-start">
                {children.map((child, i) => {
                  const isFirst = i === 0;
                  const isLast = i === children.length - 1;
                  const isOnly = children.length === 1;

                  return (
                    <div key={child.id} className="flex flex-col items-center relative" style={{ paddingLeft: 20, paddingRight: 20 }}>
                      {/*
                        ── Horizontal connector bar ─────────────────────────────
                        Each child column gets a top-border line.
                        First child  → only the RIGHT half (left:50%, right:0)
                        Last child   → only the LEFT half  (left:0, right:50%)
                        Middle child → full width           (left:0, right:0)
                        Only child   → no horizontal line at all
                      */}
                      {!isOnly && (
                        <div
                          className={`absolute top-0 h-px ${LINE}`}
                          style={{
                            left:  isFirst ? '50%'  : 0,
                            right: isLast  ? '50%'  : 0,
                          }}
                        />
                      )}

                      {/* Vertical stub from horizontal bar down to child card */}
                      <div className={`w-px ${LINE}`} style={{ height: 28 }} />

                      {/* Recurse */}
                      <OrgTree member={child} depth={depth + 1} />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

// ─── Static org tree ──────────────────────────────────────────────────────────
const buildStaticTree = (): OrgMember => ({
  id: 'ceo',
  name: 'Robert Chen',
  title: 'Chief Executive Officer',
  email: 'ceo@taskflow.com',
  level: 'CEO',
  department: 'Executive',
  children: [
    {
      id: 'cto',
      name: 'Sarah Anderson',
      title: 'Chief Technology Officer',
      email: 'cto@taskflow.com',
      level: 'C_SUITE',
      department: 'Engineering',
      children: [
        {
          id: 'fe-lead',
          name: 'Alex Johnson',
          title: 'Senior Frontend Developer',
          email: 'fe-lead@taskflow.com',
          level: 'SENIOR',
          department: 'Engineering',
          children: [
            { id: 'fe-dev', name: 'James Mitchell', title: 'Frontend Developer', email: 'fe-dev@taskflow.com', level: 'IC', department: 'Engineering' },
            { id: 'intern', name: 'Lucas Rodriguez', title: 'Software Eng. Intern', email: 'intern@taskflow.com', level: 'INTERN', department: 'Engineering' },
          ],
        },
        {
          id: 'be-lead',
          name: 'Emma Wilson',
          title: 'Senior Backend Developer',
          email: 'be-lead@taskflow.com',
          level: 'SENIOR',
          department: 'Engineering',
          children: [
            { id: 'be-dev', name: 'Michael Chen', title: 'Backend Developer', email: 'be-dev@taskflow.com', level: 'IC', department: 'Engineering' },
          ],
        },
        { id: 'qa', name: 'Sophie Martin', title: 'QA Engineer', email: 'qa@taskflow.com', level: 'IC', department: 'Engineering' },
      ],
    },
    {
      id: 'product-head',
      name: 'Maria Garcia',
      title: 'Head of Product',
      email: 'product-head@taskflow.com',
      level: 'C_SUITE',
      department: 'Product',
      children: [
        { id: 'pm', name: 'Jessica Park', title: 'Product Manager', email: 'pm@taskflow.com', level: 'IC', department: 'Product' },
      ],
    },
    {
      id: 'ops',
      name: 'David Kumar',
      title: 'Operations Manager',
      email: 'ops@taskflow.com',
      level: 'C_SUITE',
      department: 'Operations',
      children: [
        { id: 'devops', name: 'Rachel Green', title: 'DevOps Engineer', email: 'devops@taskflow.com', level: 'IC', department: 'Operations' },
        { id: 'bizops', name: 'Marcus Johnson', title: 'BizOps Analyst', email: 'bizops@taskflow.com', level: 'IC', department: 'Operations' },
      ],
    },
  ],
});

// ─── Legend ───────────────────────────────────────────────────────────────────
const Legend = () => (
  <div className="flex flex-wrap gap-2 mb-6">
    {(Object.entries(LEVEL_LABEL) as [OrgMember['level'], string][]).map(([level, label]) => {
      const cfg = LEVEL_CONFIG[level];
      return (
        <div key={level} className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${cfg.bg} ${cfg.border}`}>
          <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${cfg.avatarGrad}`} />
          <span className="text-slate-300">{label}</span>
        </div>
      );
    })}
  </div>
);

// ─── Export ───────────────────────────────────────────────────────────────────
export default function OrgChart({ hierarchyData: _ }: { hierarchyData: any }) {
  const tree = buildStaticTree();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Briefcase size={16} className="text-slate-400" />
        <h3 className="text-sm font-medium text-slate-300">TaskFlow Technologies — 12 Employees</h3>
      </div>

      <Legend />

      {/* The chart */}
      <div className="overflow-x-auto pb-10 pt-6">
        <div className="flex justify-center" style={{ minWidth: 'max-content' }}>
          <OrgTree member={tree} depth={0} />
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center">
        Click <span className="text-slate-300">▼ / ▲</span> on a card to expand or collapse the subtree
      </p>
    </div>
  );
}
