import client from './client';
import type { User } from '@/types';

export const authApi = {
  me: () => client.get<User>('/api/auth/me').then((r) => r.data),
  login: (email: string, password: string) =>
    client.post<{ token: string; [key: string]: any }>('/api/auth/login', { email, password }).then((r) => {
      if (r.data.token) {
        localStorage.setItem('authToken', r.data.token);
      }
      return r.data;
    }),
  signup: (name: string, email: string, password: string) =>
    client.post<{ email: string }>('/api/auth/signup', { name, email, password }).then((r) => r.data),
  verifyOtp: (email: string, code: string) =>
    client.post<{ token: string; [key: string]: any }>('/api/auth/verify-otp', { email, code }).then((r) => {
      if (r.data.token) {
        localStorage.setItem('authToken', r.data.token);
      }
      return r.data;
    }),
  resendOtp: (email: string) => client.post('/api/auth/resend-otp', { email }).then((r) => r.data),
  updateProfile: (data: { name: string }) =>
    client.patch<User>('/api/auth/profile', data).then((r) => r.data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    client.post('/api/auth/change-password', data).then((r) => r.data),
  logout: () => {
    localStorage.removeItem('authToken');
    return client.post('/api/auth/logout').then((r) => r.data);
  },
};
