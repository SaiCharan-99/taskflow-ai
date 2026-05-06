import client from './client';

export const roleRequestsApi = {
  // Create a new role request
  createRequest: (data: { requestedRole: string; reason: string; position?: string }) =>
    client.post('/role-requests', data),

  // Get all pending role requests (admin only)
  getAll: () =>
    client.get('/role-requests'),

  // Get current user's role request
  getMyRequest: () =>
    client.get('/role-requests/user/me'),

  // Approve or reject a role request (admin only)
  reviewRequest: (id: string, data: { status: 'APPROVED' | 'REJECTED'; reviewNotes?: string }) =>
    client.patch(`/role-requests/${id}`, data),
};
