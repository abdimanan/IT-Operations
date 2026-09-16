export type CompanyStatus = 'Active' | 'On Hold' | 'Completed' | 'Prospective';

export interface Company {
  id: string;
  name: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  industry: string;
  status: CompanyStatus;
  notes?: string;
  createdAt: string;
}

export type ProjectStatus = 'Planned' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';

export interface Project {
  id: string;
  companyId: string;
  name: string;
  description: string;
  startDate: string;
  deadline: string;
  status: ProjectStatus;
  progress: number; // 0 to 100
  managerId: string; // IT Staff assignee id
  createdAt: string;
}

export type ResourceType = 'Domain' | 'File' | 'Report' | 'Document' | 'Link' | 'Other';

export interface Resource {
  id: string;
  projectId: string;
  name: string;
  type: ResourceType;
  description: string;
  reference: string; // URL, file path, hostname, non-sensitive ref
  addedDate: string;
}

export type TaskType = 
  | 'Development'
  | 'Bug Fix'
  | 'Testing'
  | 'Deployment'
  | 'Design'
  | 'Documentation'
  | 'Research'
  | 'Maintenance';

export type TaskLevel = 'Low' | 'Normal' | 'High' | 'Critical';

export type TaskStatus = 'Unassigned' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  assigneeId?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  deadline: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId?: string; // IT staff id or undefined if unassigned
  taskType: TaskType;
  taskLevel: TaskLevel;
  status: TaskStatus;
  startDateTime: string; // e.g. "2026-09-18T09:00"
  deadline: string; // e.g. "2026-09-25T17:00"
  notes?: string;
  createdAt: string;
}

export interface DepartmentAssignee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  avatarInitials: string;
  colorScheme: string; // Tailwind color class for tag/avatar
}

export interface TaskTypeConfig {
  id: string;
  name: TaskType;
  description: string;
  color: string;
}

export interface TaskLevelConfig {
  id: string;
  level: TaskLevel;
  description: string;
  badgeClass: string;
  dotColor: string;
}

export type NavigationTab = 
  | 'dashboard'
  | 'companies'
  | 'projects'
  | 'tasks'
  | 'resources'
  | 'task-calendar'
  | 'project-calendar'
  | 'settings';
