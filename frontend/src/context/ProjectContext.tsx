import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { projectsApi } from '@/api/projects.api';
import type { Project } from '@/types';
import { useAuthContext } from './AuthContext';

interface ProjectCtx {
  projects: Project[];
  activeProject: Project | null;
  setActiveProjectId: (id: string) => void;
  isLoading: boolean;
  reload: () => Promise<void>;
}

const Ctx = createContext<ProjectCtx | undefined>(undefined);
const STORAGE_KEY = 'taskflow:activeProjectId';

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuthContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY),
  );
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await projectsApi.list();
      setProjects(data);
      // Use functional form to read current activeId without capturing it as a dep
      setActiveId((current) => {
        if (!current && data.length) {
          localStorage.setItem(STORAGE_KEY, data[0].id);
          return data[0].id;
        }
        return current;
      });
    } catch {
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  // ISSUE-05 FIX: removed activeId from deps — it was causing reload to re-create on every
  // active-project change, which re-triggered the useEffect and could cause infinite re-fetches.
  }, [user]);

  useEffect(() => {
    if (user) reload();
  }, [user, reload]);

  const setActiveProjectId = (id: string) => {
    setActiveId(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const activeProject = projects.find((p) => p.id === activeId) ?? null;

  return (
    <Ctx.Provider value={{ projects, activeProject, setActiveProjectId, isLoading, reload }}>
      {children}
    </Ctx.Provider>
  );
};

export const useProjectContext = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useProjectContext must be inside ProjectProvider');
  return v;
};
