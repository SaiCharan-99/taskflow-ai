import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Briefcase } from 'lucide-react';

interface TeamMembersListProps {
  team: {
    id: string;
    name: string;
    members: any[];
  };
}

export default function TeamMembersList({ team }: TeamMembersListProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      LEAD: 'bg-purple-100 text-purple-800',
      IC: 'bg-blue-100 text-blue-800',
      MANAGER: 'bg-orange-100 text-orange-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  // Sort members: Leads first, then ICs
  const sortedMembers = [...(team.members || [])].sort((a, b) => {
    if (a.role === 'LEAD' && b.role !== 'LEAD') return -1;
    if (a.role !== 'LEAD' && b.role === 'LEAD') return 1;
    return (a.user?.name || '').localeCompare(b.user?.name || '');
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{team.name} - Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedMembers && sortedMembers.length > 0 ? (
            sortedMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Avatar */}
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarFallback className="bg-blue-200 text-sm font-semibold">
                    {getInitials(member.user?.name || 'U')}
                  </AvatarFallback>
                </Avatar>

                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{member.user?.name}</h3>
                    <Badge className={getRoleColor(member.role)}>{member.role}</Badge>
                  </div>

                  {/* Title */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Briefcase size={14} />
                    <span>{member.title}</span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Mail size={14} />
                    <span className="truncate">{member.user?.email}</span>
                  </div>

                  {/* Manager Info */}
                  {member.manager && (
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
                      Reports to: <span className="font-semibold">{member.manager.name}</span>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0 text-right">
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No members in this team</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
