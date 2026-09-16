import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Company, 
  Project, 
  Resource, 
  Task, 
  Subtask, 
  DepartmentAssignee, 
  TaskTypeConfig, 
  TaskLevelConfig,
  TaskStatus
} from '../types';
import { 
  INITIAL_COMPANIES, 
  INITIAL_PROJECTS, 
  INITIAL_RESOURCES, 
  INITIAL_TASKS, 
  INITIAL_SUBTASKS, 
  INITIAL_STAFF, 
  TASK_TYPES_CONFIG, 
  TASK_LEVELS_CONFIG 
} from '../data/initialData';

// Simulated current system date matching the prompt environment
export const SYSTEM_CURRENT_DATE = '2026-09-16';

interface DataContextType {
  companies: Company[];
  projects: Project[];
  resources: Resource[];
  tasks: Task[];
  subtasks: Subtask[];
  staff: DepartmentAssignee[];
  taskTypes: TaskTypeConfig[];
  taskLevels: TaskLevelConfig[];
  currentDate: string;

  // Selected entities for drill-down navigation
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;

  // Company operations
  addCompany: (company: Omit<Company, 'id' | 'createdAt'>) => Company;
  updateCompany: (id: string, patch: Partial<Company>) => void;
  deleteCompany: (id: string) => void;

  // Project operations
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Resource operations
  addResource: (resource: Omit<Resource, 'id' | 'addedDate'>) => Resource;
  updateResource: (id: string, patch: Partial<Resource>) => void;
  deleteResource: (id: string) => void;

  // Task operations
  addTask: (task: Omit<Task, 'id' | 'createdAt'>, initialSubtasks?: string[]) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTaskStatus: (taskId: string, status: TaskStatus) => void;

  // Subtask operations
  addSubtask: (taskId: string, title: string, deadline?: string, assigneeId?: string) => Subtask;
  toggleSubtask: (subtaskId: string) => void;
  updateSubtask: (id: string, patch: Partial<Subtask>) => void;
  deleteSubtask: (id: string) => void;

  // Staff operations
  addStaff: (staff: Omit<DepartmentAssignee, 'id' | 'avatarInitials'>) => DepartmentAssignee;
  updateStaff: (id: string, patch: Partial<DepartmentAssignee>) => void;
  toggleStaffStatus: (id: string) => void;

  // Helpers
  getCompany: (id?: string) => Company | undefined;
  getProject: (id?: string) => Project | undefined;
  getStaff: (id?: string) => DepartmentAssignee | undefined;
  getCompanyProjects: (companyId: string) => Project[];
  getProjectTasks: (projectId: string) => Task[];
  getProjectResources: (projectId: string) => Resource[];
  getTaskSubtasks: (taskId: string) => Subtask[];
  getStaffAssignedTasksCount: (staffId: string) => number;
  isTaskOverdue: (task: Task) => boolean;
  isProjectOverdue: (project: Project) => boolean;

  resetToSampleData: () => void;
}

const STORAGE_KEYS = {
  COMPANIES: 'it_pm_companies_v1',
  PROJECTS: 'it_pm_projects_v1',
  RESOURCES: 'it_pm_resources_v1',
  TASKS: 'it_pm_tasks_v1',
  SUBTASKS: 'it_pm_subtasks_v1',
  STAFF: 'it_pm_staff_v1',
};

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESOURCES);
    return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [subtasks, setSubtasks] = useState<Subtask[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBTASKS);
    return saved ? JSON.parse(saved) : INITIAL_SUBTASKS;
  });

  const [staff, setStaff] = useState<DepartmentAssignee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBTASKS, JSON.stringify(subtasks));
  }, [subtasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  }, [staff]);

  // Reset helper
  const resetToSampleData = () => {
    setCompanies(INITIAL_COMPANIES);
    setProjects(INITIAL_PROJECTS);
    setResources(INITIAL_RESOURCES);
    setTasks(INITIAL_TASKS);
    setSubtasks(INITIAL_SUBTASKS);
    setStaff(INITIAL_STAFF);
    localStorage.clear();
  };

  // Company CRUD
  const addCompany = (companyData: Omit<Company, 'id' | 'createdAt'>): Company => {
    const newCompany: Company = {
      ...companyData,
      id: `comp-${Date.now()}`,
      createdAt: SYSTEM_CURRENT_DATE,
    };
    setCompanies(prev => [newCompany, ...prev]);
    return newCompany;
  };

  const updateCompany = (id: string, patch: Partial<Company>) => {
    setCompanies(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));
  };

  const deleteCompany = (id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
  };

  // Project CRUD
  const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>): Project => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      createdAt: SYSTEM_CURRENT_DATE,
    };
    setProjects(prev => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = (id: string, patch: Partial<Project>) => {
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // Resource CRUD
  const addResource = (resourceData: Omit<Resource, 'id' | 'addedDate'>): Resource => {
    const newResource: Resource = {
      ...resourceData,
      id: `res-${Date.now()}`,
      addedDate: SYSTEM_CURRENT_DATE,
    };
    setResources(prev => [newResource, ...prev]);
    return newResource;
  };

  const updateResource = (id: string, patch: Partial<Resource>) => {
    setResources(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
  };

  const deleteResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
  };

  // Task CRUD
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>, initialSubtaskTitles?: string[]): Task => {
    const newTaskId = `task-${Date.now()}`;
    const newTask: Task = {
      ...taskData,
      id: newTaskId,
      createdAt: SYSTEM_CURRENT_DATE,
    };
    setTasks(prev => [newTask, ...prev]);

    if (initialSubtaskTitles && initialSubtaskTitles.length > 0) {
      const newSubs: Subtask[] = initialSubtaskTitles.map((title, idx) => ({
        id: `sub-${Date.now()}-${idx}`,
        taskId: newTaskId,
        title: title.trim(),
        assigneeId: taskData.assigneeId,
        status: 'Pending',
        deadline: taskData.deadline.split('T')[0] || SYSTEM_CURRENT_DATE,
      }));
      setSubtasks(prev => [...prev, ...newSubs]);
    }

    return newTask;
  };

  const updateTask = (id: string, patch: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setSubtasks(prev => prev.filter(s => s.taskId !== id));
  };

  const setTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        // If task marked completed, optionally update subtasks if requested or just status
        return { ...t, status };
      }
      return t;
    }));
  };

  // Subtask CRUD
  const addSubtask = (taskId: string, title: string, deadline?: string, assigneeId?: string): Subtask => {
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      taskId,
      title,
      assigneeId,
      status: 'Pending',
      deadline: deadline || SYSTEM_CURRENT_DATE,
    };
    setSubtasks(prev => [...prev, newSub]);
    return newSub;
  };

  const toggleSubtask = (subtaskId: string) => {
    setSubtasks(prev => prev.map(s => {
      if (s.id === subtaskId) {
        const nextStatus = s.status === 'Completed' ? 'Pending' : 'Completed';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const updateSubtask = (id: string, patch: Partial<Subtask>) => {
    setSubtasks(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  };

  const deleteSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  // Staff CRUD
  const addStaff = (staffData: Omit<DepartmentAssignee, 'id' | 'avatarInitials'>): DepartmentAssignee => {
    const initials = staffData.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const colors = [
      'bg-blue-600 text-white',
      'bg-emerald-600 text-white',
      'bg-purple-600 text-white',
      'bg-amber-600 text-white',
      'bg-rose-600 text-white',
      'bg-cyan-600 text-white',
    ];
    const chosenColor = colors[staff.length % colors.length];

    const newStaff: DepartmentAssignee = {
      ...staffData,
      id: `staff-${Date.now()}`,
      avatarInitials: initials,
      colorScheme: staffData.colorScheme || chosenColor,
    };
    setStaff(prev => [...prev, newStaff]);
    return newStaff;
  };

  const updateStaff = (id: string, patch: Partial<DepartmentAssignee>) => {
    setStaff(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  };

  const toggleStaffStatus = (id: string) => {
    setStaff(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return s;
    }));
  };

  // Helpers
  const getCompany = (id?: string) => companies.find(c => c.id === id);
  const getProject = (id?: string) => projects.find(p => p.id === id);
  const getStaff = (id?: string) => staff.find(s => s.id === id);

  const getCompanyProjects = (companyId: string) => 
    projects.filter(p => p.companyId === companyId);

  const getProjectTasks = (projectId: string) => 
    tasks.filter(t => t.projectId === projectId);

  const getProjectResources = (projectId: string) => 
    resources.filter(r => r.projectId === projectId);

  const getTaskSubtasks = (taskId: string) => 
    subtasks.filter(s => s.taskId === taskId);

  const getStaffAssignedTasksCount = (staffId: string) => 
    tasks.filter(t => t.assigneeId === staffId && t.status !== 'Completed' && t.status !== 'Cancelled').length;

  const isTaskOverdue = (task: Task) => {
    if (task.status === 'Completed' || task.status === 'Cancelled') return false;
    const deadlineDate = task.deadline.split('T')[0];
    return deadlineDate < SYSTEM_CURRENT_DATE;
  };

  const isProjectOverdue = (project: Project) => {
    if (project.status === 'Completed' || project.status === 'Cancelled') return false;
    return project.deadline < SYSTEM_CURRENT_DATE;
  };

  return (
    <DataContext.Provider
      value={{
        companies,
        projects,
        resources,
        tasks,
        subtasks,
        staff,
        taskTypes: TASK_TYPES_CONFIG,
        taskLevels: TASK_LEVELS_CONFIG,
        currentDate: SYSTEM_CURRENT_DATE,

        selectedCompanyId,
        setSelectedCompanyId,
        selectedProjectId,
        setSelectedProjectId,
        selectedTaskId,
        setSelectedTaskId,

        addCompany,
        updateCompany,
        deleteCompany,

        addProject,
        updateProject,
        deleteProject,

        addResource,
        updateResource,
        deleteResource,

        addTask,
        updateTask,
        deleteTask,
        setTaskStatus,

        addSubtask,
        toggleSubtask,
        updateSubtask,
        deleteSubtask,

        addStaff,
        updateStaff,
        toggleStaffStatus,

        getCompany,
        getProject,
        getStaff,
        getCompanyProjects,
        getProjectTasks,
        getProjectResources,
        getTaskSubtasks,
        getStaffAssignedTasksCount,
        isTaskOverdue,
        isProjectOverdue,

        resetToSampleData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
