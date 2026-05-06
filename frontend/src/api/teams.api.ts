import client from './client';

// Backend wraps all team responses as { success, count?, data }
// These helpers unwrap automatically so callers get the inner data directly.
const unwrap = (res: any) => res.data?.data ?? res.data;

export const teamsApi = {
  // Get all teams (returns Team[])
  getAllTeams: () => client.get('/api/teams').then(unwrap),

  // Get team by ID (returns Team)
  getTeamById: (teamId: string) => client.get(`/api/teams/${teamId}`).then(unwrap),

  // Get organizational hierarchy tree
  getHierarchyTree: () => client.get('/api/teams/hierarchy/tree').then(unwrap),

  // Get direct reports for current user
  getDirectReports: () => client.get('/api/teams/reports/direct').then(unwrap),

  // Get team members
  getTeamMembers: (teamId: string, role?: string) => {
    const qs = role ? `?role=${role}` : '';
    return client.get(`/api/teams/${teamId}/members${qs}`).then(unwrap);
  },

  // Get team workload
  getTeamWorkload: (teamId: string) => client.get(`/api/teams/${teamId}/workload`).then(unwrap),

  // Create team (Admin only)
  createTeam: (data: { name: string; description?: string; department: string; managerId: string }) =>
    client.post('/api/teams', data).then(unwrap),

  // Add member to team
  addTeamMember: (teamId: string, data: { userId: string; role?: string; title?: string; managerId?: string }) =>
    client.post(`/api/teams/${teamId}/members`, data).then(unwrap),

  // Update team member
  updateTeamMember: (teamId: string, memberId: string, data: any) =>
    client.patch(`/api/teams/${teamId}/members/${memberId}`, data).then(unwrap),

  // Remove team member
  removeTeamMember: (teamId: string, memberId: string) =>
    client.delete(`/api/teams/${teamId}/members/${memberId}`).then((r) => r.data),
};
