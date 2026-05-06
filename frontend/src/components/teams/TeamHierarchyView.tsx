import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface TeamNode {
  id: string;
  name: string;
  department: string;
  manager: { id: string; name: string; email: string };
  teamLead: any;
  memberCount: number;
  members: {
    leads: any[];
    ics: any[];
  };
}

interface TeamHierarchyViewProps {
  hierarchyData: TeamNode[];
}

export default function TeamHierarchyView({ hierarchyData }: TeamHierarchyViewProps) {
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  const toggleTeam = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getDepartmentColor = (dept: string) => {
    const colors: Record<string, string> = {
      Engineering: 'bg-blue-100 text-blue-800',
      Product: 'bg-purple-100 text-purple-800',
      Operations: 'bg-green-100 text-green-800',
      Sales: 'bg-orange-100 text-orange-800',
      Marketing: 'bg-pink-100 text-pink-800',
    };
    return colors[dept] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organizational Hierarchy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hierarchyData && hierarchyData.length > 0 ? (
            <div className="space-y-3">
              {hierarchyData.map((team) => (
                <div key={team.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  {/* Team Header */}
                  <button
                    onClick={() => toggleTeam(team.id)}
                    className="w-full text-left flex items-center justify-between hover:opacity-80"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${expandedTeams.has(team.id) ? 'rotate-180' : ''}`}
                      />
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        <p className="text-sm text-gray-600">{team.manager.name} (Manager)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{team.memberCount} members</Badge>
                      <Badge className={getDepartmentColor(team.department)}>
                        {team.department}
                      </Badge>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedTeams.has(team.id) && (
                    <div className="mt-4 ml-8 space-y-4">
                      {/* Team Leads */}
                      {team.members.leads.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Team Leads</h4>
                          <div className="space-y-2">
                            {team.members.leads.map((lead) => (
                              <div key={lead.id} className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs bg-blue-200">
                                    {getInitials(lead.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{lead.name}</p>
                                  <p className="text-xs text-gray-600">{lead.title}</p>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  LEAD
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Individual Contributors */}
                      {team.members.ics.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Team Members ({team.members.ics.length})
                          </h4>
                          <div className="space-y-2">
                            {team.members.ics.map((ic) => (
                              <div key={ic.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs bg-gray-300">
                                    {getInitials(ic.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{ic.name}</p>
                                  <p className="text-xs text-gray-600">{ic.title}</p>
                                  {ic.manager && (
                                    <p className="text-xs text-gray-500">Reports to: {ic.manager}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No teams found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
