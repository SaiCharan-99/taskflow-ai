import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { teamsApi } from '@/api/teams.api';
import { Users, Briefcase, Target } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  department: string;
  manager: { name: string };
  members: any[];
}

export function TeamMetrics() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [directReports, setDirectReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const [teamsArr, reportsArr] = await Promise.all([
          teamsApi.getAllTeams(),
          teamsApi.getDirectReports(),
        ]);
        setTeams(Array.isArray(teamsArr) ? teamsArr : []);
        setDirectReports(Array.isArray(reportsArr) ? reportsArr : []);
      } catch (error) {
        console.error('Failed to fetch team data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  const getDepartmentColor = (dept: string) => {
    const colors: Record<string, string> = {
      Engineering: 'bg-blue-100 text-blue-800',
      Product: 'bg-purple-100 text-purple-800',
      Operations: 'bg-green-100 text-green-800',
    };
    return colors[dept] || 'bg-gray-100 text-gray-800';
  };

  const totalTeamMembers = teams.reduce((sum, team) => sum + (team.members?.length || 0), 0);

  if (loading) {
    return <div>Loading team metrics...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Team Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Teams</p>
                <p className="text-2xl font-bold">{teams.length}</p>
              </div>
              <Briefcase className="text-blue-500" size={28} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Team Members</p>
                <p className="text-2xl font-bold">{totalTeamMembers}</p>
              </div>
              <Users className="text-green-500" size={28} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Direct Reports</p>
                <p className="text-2xl font-bold">{directReports.length}</p>
              </div>
              <Target className="text-purple-500" size={28} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Teams Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{team.name}</h4>
                  <p className="text-sm text-gray-600">{team.manager.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{team.members?.length || 0} members</Badge>
                  <Badge className={getDepartmentColor(team.department)}>
                    {team.department}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
