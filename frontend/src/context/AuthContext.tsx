import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '@/api/auth.api';
import type { User } from '@/types';

interface AuthCtx {
  user: User | null;
  isLoading: boolean;
  setUser: (u: User | null) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    try {
      const u = await authApi.me();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    // ISSUE-11 FIX: clear the JWT so axios interceptor stops sending it after logout
    localStorage.removeItem('authToken');
    setUser(null);
    window.location.href = '/login';
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <Ctx.Provider value={{ user, isLoading, setUser, refresh, logout }}>{children}</Ctx.Provider>
  );
};

export const useAuthContext = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuthContext must be inside AuthProvider');
  return v;
};
