import React, { useState } from 'react';
import { 
  FolderKanban, 
  Building2, 
  Calendar, 
  User, 
  Plus, 
  Search, 
  CheckSquare, 
  Layers, 
  ExternalLink,
  Clock,
  ChevronRight,
  ListTodo,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
  Globe
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { 
  ProjectStatusBadge, 
  TaskStatusBadge, 
  TaskLevelBadge, 
  ResourceTypeBadge,
  OverdueBadge 
} from '../common/StatusBadges';
import { Project, ProjectStatus, Task, Subtask, Resource } from '../../types';

interface ProjectsViewProps {
  onOpenCreateProject: () => void;
  onOpenCreateTaskForProject: (projectId: string) => void;
  onOpenCreateResourceForProject: (projectId: string) => void;
  onOpenTaskDetails: (taskId: string) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  onOpenCreateProject,
  onOpenCreateTaskForProject,
  onOpenCreateResourceForProject,
  onOpenTaskDetails,
  selectedProjectId,
  setSelectedProjectId,
}) => {
  const { 
    projects, 
    companies, 
    tasks, 
    subtasks, 
    resources, 
    staff, 
    getCompany, 
    getStaff, 
    updateProject, 
    toggleSubtask,
    addSubtask,
    setTaskStatus,
    isProjectOverdue,
    isTaskOverdue 
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'tasks' | 'subtasks' | 'resources'>('overview');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [targetTaskIdForSubtask, setTargetTaskIdForSubtask] = useState<string>('');

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const comp = getCompany(p.companyId);
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comp && comp.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCompany = selectedCompanyFilter === 'ALL' || p.companyId === selectedCompanyFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || p.status === selectedStatusFilter;

    return matchesSearch && matchesCompany && matchesStatus;
  });

  const currentProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;
  const currentCompany = currentProject ? getCompany(currentProject.companyId) : null;
  const currentManager = currentProject ? getStaff(currentProject.managerId) : null;
  const projectTasks = currentProject ? tasks.filter(t => t.projectId === currentProject.id) : [];
  const projectResources = currentProject ? resources.filter(r => r.projectId === currentProject.id) : [];

  // Project subtasks: all subtasks belonging to tasks of this project
  const projectTaskIds = new Set(projectTasks.map(t => t.id));
  const projectSubtasks = subtasks.filter(s => projectTaskIds.has(s.taskId));

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !targetTaskIdForSubtask) return;
    addSubtask(targetTaskIdForSubtask, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Search */}
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, client, tech..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          {/* Company filter */}
          <select
            value={selectedCompanyFilter}
            onChange={(e) => setSelectedCompanyFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">All Client Companies ({companies.length})</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="Planned">Planned</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <button
          id="btn-add-project"
          onClick={onOpenCreateProject}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Main Layout: Project Grid & Details View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Projects List */}
        <div className={currentProject ? "lg:col-span-5 space-y-3" : "lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
          {filteredProjects.map((project) => {
            const company = getCompany(project.companyId);
            const manager = getStaff(project.managerId);
            const projTasks = tasks.filter(t => t.projectId === project.id);
            const projResources = resources.filter(r => r.projectId === project.id);
            const isOverdue = isProjectOverdue(project);
            const isSelected = selectedProjectId === project.id;

            return (
              <div
                key={project.id}
                id={`project-card-${project.id}`}
                onClick={() => setSelectedProjectId(isSelected ? null : project.id)}
                className={`bg-white rounded-xl border p-5 transition cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 truncate max-w-[180px]">
                      {company?.name || 'Unknown Client'}
                    </span>
                    <ProjectStatusBadge status={project.status} />
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 mt-2 hover:text-blue-600">
                    {project.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 text-[11px]">Milestone Completion</span>
                      <span className="font-mono font-semibold text-slate-700">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          project.progress === 100 ? 'bg-blue-600' :
                          project.progress >= 70 ? 'bg-emerald-500' :
                          project.progress >= 40 ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Timeline & Manager */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Timeline</span>
                      <span className="font-mono text-[11px] text-slate-700 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {project.deadline}
                      </span>
                      {isOverdue && (
                        <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">Overdue</span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Lead PM</span>
                      <span className="text-[11px] font-medium text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        {manager?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer stats */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                      {projTasks.length} tasks
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      {projResources.length} resources
                    </span>
                  </div>

                  <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                    <span>{isSelected ? 'Viewing' : 'Open Tabs'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}

          {filteredProjects.length === 0 && (
            <div className="col-span-full bg-white rounded-xl border border-slate-200 p-8 text-center">
              <FolderKanban className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">No projects match criteria</p>
              <p className="text-xs text-slate-500 mt-1">Try clearing filters or create a new project.</p>
            </div>
          )}
        </div>

        {/* Project Detail View with 4 Mandated Tabs: Overview, Tasks, Subtasks, Resources */}
        {currentProject && (
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col self-start sticky top-20">
            {/* Header with Project Title & Company context */}
            <div className="p-5 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                      {currentCompany?.name}
                    </span>
                    <ProjectStatusBadge status={currentProject.status} />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1.5">{currentProject.name}</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{currentProject.description}</p>
                </div>

                <button
                  onClick={() => setSelectedProjectId(null)}
                  className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100"
                >
                  Close
                </button>
              </div>

              {/* 4 Detail Tabs */}
              <div className="flex items-center space-x-1 mt-5 border-b border-slate-200 -mb-5">
                <button
                  onClick={() => setActiveDetailTab('overview')}
                  className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeDetailTab === 'overview'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Overview
                </button>

                <button
                  onClick={() => setActiveDetailTab('tasks')}
                  className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeDetailTab === 'tasks'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Tasks ({projectTasks.length})
                </button>

                <button
                  onClick={() => setActiveDetailTab('subtasks')}
                  className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeDetailTab === 'subtasks'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ListTodo className="w-3.5 h-3.5" />
                  Subtasks ({projectSubtasks.length})
                </button>

                <button
                  onClick={() => setActiveDetailTab('resources')}
                  className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeDetailTab === 'resources'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Resources ({projectResources.length})
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="p-5 overflow-y-auto max-h-[calc(100vh-280px)]">
              {/* TAB 1: OVERVIEW */}
              {activeDetailTab === 'overview' && (
                <div className="space-y-5">
                  {/* Progress Controller */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Delivery Progress
                      </span>
                      <span className="font-mono text-sm font-bold text-blue-600">
                        {currentProject.progress}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentProject.progress}
                      onChange={(e) => updateProject(currentProject.id, { progress: Number(e.target.value) })}
                      className="w-full accent-blue-600 cursor-pointer"
                    />

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                      <span>Quick Status:</span>
                      <div className="flex items-center space-x-1.5">
                        {(['Planned', 'Active', 'On Hold', 'Completed', 'Cancelled'] as ProjectStatus[]).map((st) => (
                          <button
                            key={st}
                            onClick={() => updateProject(currentProject.id, { status: st })}
                            className={`px-2 py-0.5 text-[10px] rounded font-medium border ${
                              currentProject.status === st
                                ? 'bg-slate-800 text-white border-slate-800'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-slate-200 bg-white">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Start Date</span>
                      <span className="font-mono font-medium text-slate-800 mt-1 block">{currentProject.startDate}</span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 bg-white">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Ultimate Deadline</span>
                      <span className="font-mono font-medium text-slate-800 mt-1 block">{currentProject.deadline}</span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 bg-white">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Assigned Lead PM</span>
                      <span className="font-medium text-slate-800 mt-1 block">{currentManager?.name || 'Unassigned'}</span>
                      <span className="text-[10px] text-slate-500">{currentManager?.role}</span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 bg-white">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Client Account</span>
                      <span className="font-medium text-slate-800 mt-1 block">{currentCompany?.name}</span>
                      <span className="text-[10px] text-slate-500">{currentCompany?.contactEmail}</span>
                    </div>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-center">
                      <div className="text-xl font-bold text-blue-900">{projectTasks.length}</div>
                      <div className="text-[11px] text-blue-700 font-medium">Total Tasks</div>
                    </div>
                    <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 text-center">
                      <div className="text-xl font-bold text-emerald-900">
                        {projectTasks.filter(t => t.status === 'Completed').length}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-medium">Tasks Completed</div>
                    </div>
                    <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-100 text-center">
                      <div className="text-xl font-bold text-purple-900">{projectResources.length}</div>
                      <div className="text-[11px] text-purple-700 font-medium">Resources</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TASKS */}
              {activeDetailTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Project Tasks ({projectTasks.length})
                      </h4>
                      <p className="text-[11px] text-slate-500">Tasks scoped for this build</p>
                    </div>
                    <button
                      onClick={() => onOpenCreateTaskForProject(currentProject.id)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Task</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {projectTasks.map((task) => {
                      const assignee = getStaff(task.assigneeId);
                      const isOverdue = isTaskOverdue(task);

                      return (
                        <div
                          key={task.id}
                          className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition flex items-start justify-between gap-3"
                        >
                          <div 
                            className="space-y-1 cursor-pointer flex-1"
                            onClick={() => onOpenTaskDetails(task.id)}
                          >
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="font-semibold text-xs text-slate-900 hover:text-blue-600">
                                {task.title}
                              </span>
                              <TaskLevelBadge level={task.taskLevel} />
                              {isOverdue && <OverdueBadge />}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{task.description}</p>
                            
                            <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-mono pt-1">
                              <span>Deadline: {task.deadline.split('T')[0]}</span>
                              <span>•</span>
                              <span>Assignee: {assignee?.name || 'Unassigned'}</span>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center space-x-2">
                            <select
                              value={task.status}
                              onChange={(e) => setTaskStatus(task.id, e.target.value as any)}
                              className="text-xs py-1 px-2 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-700"
                            >
                              <option value="Unassigned">Unassigned</option>
                              <option value="Assigned">Assigned</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}

                    {projectTasks.length === 0 && (
                      <div className="p-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <p className="text-xs text-slate-500">No tasks created yet for this project.</p>
                        <button
                          onClick={() => onOpenCreateTaskForProject(currentProject.id)}
                          className="mt-2 inline-flex items-center text-xs font-semibold text-blue-600 hover:underline"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add the first task
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SUBTASKS */}
              {activeDetailTab === 'subtasks' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Project Subtasks ({projectSubtasks.length})
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Granular subtasks across all tasks for {currentProject.name}
                      </p>
                    </div>
                  </div>

                  {/* Add subtask mini form */}
                  {projectTasks.length > 0 && (
                    <form 
                      onSubmit={handleAddSubtaskSubmit}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row gap-2"
                    >
                      <select
                        value={targetTaskIdForSubtask || (projectTasks[0]?.id ?? '')}
                        onChange={(e) => setTargetTaskIdForSubtask(e.target.value)}
                        className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 sm:w-44 shrink-0"
                      >
                        {projectTasks.map(t => (
                          <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Add new subtask title..."
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 flex-1 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                      />

                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 shrink-0"
                      >
                        Add Subtask
                      </button>
                    </form>
                  )}

                  {/* Subtask list */}
                  <div className="space-y-2">
                    {projectSubtasks.map((sub) => {
                      const parentTask = projectTasks.find(t => t.id === sub.taskId);
                      const isDone = sub.status === 'Completed';

                      return (
                        <div
                          key={sub.id}
                          className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition ${
                            isDone ? 'bg-slate-50/70 border-slate-200' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => toggleSubtask(sub.id)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <div className="min-w-0">
                              <span className={`text-xs font-medium block truncate ${
                                isDone ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}>
                                {sub.title}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate block">
                                Under: {parentTask?.title || 'Unknown Task'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="text-[10px] font-mono text-slate-500">
                              Due {sub.deadline}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              isDone ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {sub.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {projectSubtasks.length === 0 && (
                      <div className="p-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <p className="text-xs text-slate-500">No subtasks recorded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: RESOURCES */}
              {activeDetailTab === 'resources' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Project Resources ({projectResources.length})
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Required infrastructure, specs, domains, and files
                      </p>
                    </div>
                    <button
                      onClick={() => onOpenCreateResourceForProject(currentProject.id)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Resource</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {projectResources.map((res) => (
                      <div
                        key={res.id}
                        className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-xs text-slate-900">{res.name}</span>
                            <ResourceTypeBadge type={res.type} />
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">Added {res.addedDate}</span>
                        </div>

                        <p className="text-[11px] text-slate-600 leading-relaxed">{res.description}</p>

                        <div className="pt-1 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200 max-w-md truncate">
                            <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{res.reference}</span>
                          </div>

                          {res.reference.startsWith('http') && (
                            <a
                              href={res.reference}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1"
                            >
                              <span>Open</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}

                    {projectResources.length === 0 && (
                      <div className="p-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <p className="text-xs text-slate-500">No resources linked to this project yet.</p>
                        <button
                          onClick={() => onOpenCreateResourceForProject(currentProject.id)}
                          className="mt-2 inline-flex items-center text-xs font-semibold text-blue-600 hover:underline"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add first resource
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
