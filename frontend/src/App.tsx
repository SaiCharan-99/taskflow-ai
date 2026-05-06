import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuthContext } from '@/context/AuthContext';
import { ProjectProvider } from '@/context/ProjectContext';
import { useProjectContext } from '@/context/ProjectContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import OtpPage from '@/pages/OtpPage';
import ProjectsPage from '@/pages/ProjectsPage';
import DashboardPage from '@/pages/DashboardPage';
import BoardPage from '@/pages/BoardPage';
import TasksPage from '@/pages/TasksPage';
import TeamsPage from '@/pages/TeamsPage';
import SettingsPage from '@/pages/SettingsPage';
import ProjectSettingsPage from '@/pages/ProjectSettingsPage';
import NotFoundPage from '@/pages/NotFoundPage';
import RoleRequestPage from '@/pages/RoleRequestPage';
import AdminRoleRequestsPage from '@/pages/AdminRoleRequestsPage';

const queryClient = new QueryClient();

const Protected = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuthContext();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="text-blue-400 animate-spin" size={28} />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
};

const RootRedirect = () => {
  const { user, isLoading } = useAuthContext();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="text-blue-400 animate-spin" size={28} />
      </div>
    );
  }
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
};

const DashboardIndexRoute = () => {
  const { activeProject, isLoading } = useProjectContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="text-blue-400 animate-spin" size={28} />
      </div>
    );
  }

  // If there's an active project, go straight to its dashboard
  if (activeProject) {
    return <Navigate to={`/dashboard/${activeProject.id}`} replace />;
  }

  // Otherwise show the projects picker
  return <Navigate to="/projects" replace />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ProjectProvider>
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/verify-otp" element={<OtpPage />} />
                <Route path="/role-request" element={<RoleRequestPage />} />
                <Route
                  path="/admin/role-requests"
                  element={
                    <Protected>
                      <AdminRoleRequestsPage />
                    </Protected>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <Protected>
                      <DashboardIndexRoute />
                    </Protected>
                  }
                />
                <Route
                  path="/dashboard/:projectId"
                  element={
                    <Protected>
                      <DashboardPage />
                    </Protected>
                  }
                />
                <Route
                  path="/projects/:id/board"
                  element={
                    <Protected>
                      <BoardPage />
                    </Protected>
                  }
                />
                <Route
                  path="/projects/:id/tasks"
                  element={
                    <Protected>
                      <TasksPage />
                    </Protected>
                  }
                />
                <Route
                  path="/projects"
                  element={
                    <Protected>
                      <ProjectsPage />
                    </Protected>
                  }
                />
                <Route
                  path="/teams"
                  element={
                    <Protected>
                      <TeamsPage />
                    </Protected>
                  }
                />
                <Route
                  path="/projects/:id/team"
                  element={<Navigate to="/teams" replace />}
                />
                <Route
                  path="/settings"
                  element={
                    <Protected>
                      <SettingsPage />
                    </Protected>
                  }
                />
                <Route
                  path="/projects/:id/settings"
                  element={
                    <Protected>
                      <ProjectSettingsPage />
                    </Protected>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ProjectProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
