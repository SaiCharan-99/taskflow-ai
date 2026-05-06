export type Role = 'ADMIN' | 'MANAGER' | 'MEMBER';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskType = 'BUG' | 'FEATURE' | 'IMPROVEMENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  email: string;
  name: string;
  globalRole: Role;
  isVerified: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  riskLevel: RiskLevel;
  memberCount: number;
  taskCount: number;
  createdAt: string;
  createdBy: string; // ID of the user who created the project
}

export interface ProjectMember {
  userId: string;
  user: User;
  role: Role;
  joinedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  type: TaskType;
  status: TaskStatus;
  projectId: string;
  assigneeId?: string;
  assignee?: User;
  creatorId: string;
  creator: User;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  user: User;
  taskId?: string;
  task?: Task;
  action: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface DashboardData {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  workloadPerUser: { userId: string; name: string; taskCount: number; role: Role }[];
  recentActivity: ActivityLog[];
  riskLevel: RiskLevel;
  insights: string[];
}

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  toolResult?: {
    type:
      | 'task_list'
      | 'task_created'
      | 'status_updated'
      | 'dashboard_summary'
      | 'workload_summary'   // ISSUE-04 FIX: was missing
      | 'project_created'   // ISSUE-04 FIX: was missing
      | 'action_confirmed'  // ISSUE-04 FIX: was missing
      | 'error';
    data: unknown;
  };
  requiresConfirmation?: boolean;
  confirmationText?: string;
}
