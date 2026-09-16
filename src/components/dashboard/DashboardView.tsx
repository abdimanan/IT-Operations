import React from 'react';
import { 
  Building2, 
  FolderKanban, 
  CheckSquare, 
  AlertCircle, 
  Clock, 
  ArrowUpRight, 
  Globe, 
  FileCode, 
  BarChart3, 
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { 
  ProjectStatusBadge, 
  TaskStatusBadge, 
  TaskLevelBadge, 
  OverdueBadge 
} from '../common/StatusBadges';
import { NavigationTab, Project, Task } from '../../types';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenProjectDetails: (projectId: string) => void;
  onOpenTaskDetails: (taskId: string) => void;
  onOpenCompanyDetails: (companyId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenProjectDetails,
  onOpenTaskDetails,
  onOpenCompanyDetails,
}) => {
  const { 
    companies, 
    projects, 
    tasks, 
    resources, 
    staff, 
    getCompany, 
    getProject, 
    getStaff, 
    isTaskOverdue, 
    isProjectOverdue,
    currentDate 
  } = useData();

  // Metrics
  const totalCompanies = companies.length;
  const activeProjects = projects.filter(p => p.status === 'Active');
  const openTasks = tasks.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled');
  const overdueTasks = tasks.filter(isTaskOverdue);

  // Resource breakdown
  const domainCount = resources.filter(r => r.type === 'Domain').length;
  const fileCount = resources.filter(r => r.type === 'File' || r.type === 'Document').length;
  const reportCount = resources.filter(r => r.type === 'Report').length;
  const otherCount = resources.filter(r => r.type === 'Link' || r.type === 'Other').length;

  // Upcoming deadlines (projects & tasks due soon)
  const upcomingDeadlinesList = [
    ...projects
      .filter(p => p.status !== 'Completed' && p.status !== 'Cancelled')
      .map(p => ({
        kind: 'project' as const,
        id: p.id,
        title: p.name,
        deadline: p.deadline,
        companyName: getCompany(p.companyId)?.name || 'Unknown Client',
        isOverdue: isProjectOverdue(p),
        status: p.status,
      })),
    ...tasks
      .filter(t => t.status !== 'Completed' && t.status !== 'Cancelled')
      .map(t => {
        const proj = getProject(t.projectId);
        const comp = proj ? getCompany(proj.companyId) : undefined;
        return {
          kind: 'task' as const,
          id: t.id,
          title: t.title,
          deadline: t.deadline.split('T')[0],
          companyName: comp?.name || 'Unknown Client',
          isOverdue: isTaskOverdue(t),
          status: t.status,
          taskLevel: t.taskLevel,
        };
      })
  ]
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 6);

  // Recent/Upcoming Tasks
  const recentTasks = [...tasks]
    .filter(t => t.status !== 'Cancelled')
    .sort((a, b) => {
      // Prioritize overdue/in-progress first, then nearest deadline
      if (isTaskOverdue(a) && !isTaskOverdue(b)) return -1;
      if (!isTaskOverdue(a) && isTaskOverdue(b)) return 1;
      return a.deadline.localeCompare(b.deadline);
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 1. Top Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Companies */}
        <div 
          onClick={() => onNavigate('companies')}
          className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-xs transition cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Companies</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalCompanies}</h3>
            <span className="text-[11px] text-slate-500 mt-0.5 inline-block">External client accounts</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Active Projects */}
        <div 
          onClick={() => onNavigate('projects')}
          className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-xs transition cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Projects</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{activeProjects.length}</h3>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 inline-block">
              {projects.filter(p => p.status === 'Completed').length} completed to date
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>

        {/* Open Tasks */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-xs transition cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Open Tasks</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{openTasks.length}</h3>
            <span className="text-[11px] text-slate-500 mt-0.5 inline-block">
              {tasks.filter(t => t.status === 'In Progress').length} currently in progress
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Overdue Tasks */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="bg-white rounded-xl border border-slate-200 p-4 hover:border-rose-300 hover:shadow-xs transition cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overdue Tasks</p>
            <h3 className={`text-2xl font-bold mt-1 ${overdueTasks.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {overdueTasks.length}
            </h3>
            <span className="text-[11px] text-slate-500 mt-0.5 inline-block">
              {overdueTasks.length > 0 ? 'Action required by assignees' : 'All tasks on schedule'}
            </span>
          </div>
          <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border ${
            overdueTasks.length > 0
              ? 'bg-rose-50 text-rose-600 border-rose-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Project Overview Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Project Overview</h2>
            <p className="text-xs text-slate-500">Current software & infrastructure projects being built for client companies</p>
          </div>
          <button
            onClick={() => onNavigate('projects')}
            className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 gap-1"
          >
            <span>View All Projects</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-5 py-2.5">Company</th>
                <th className="px-5 py-2.5">Project</th>
                <th className="px-5 py-2.5">Status</th>
                <th className="px-5 py-2.5">Start Date</th>
                <th className="px-5 py-2.5">Deadline</th>
                <th className="px-5 py-2.5 w-40">Progress</th>
                <th className="px-5 py-2.5 text-center">Open Tasks</th>
                <th className="px-5 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {projects.map((project) => {
                const company = getCompany(project.companyId);
                const projectTasks = tasks.filter(t => t.projectId === project.id);
                const projectOpenTasks = projectTasks.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled');
                const isOverdue = isProjectOverdue(project);

                return (
                  <tr 
                    key={project.id} 
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onOpenProjectDetails(project.id)}
                  >
                    <td className="px-5 py-3 font-medium text-slate-900">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (company) onOpenCompanyDetails(company.id);
                        }}
                        className="hover:text-blue-600 hover:underline flex items-center gap-1.5"
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{company?.name || 'Unknown'}</span>
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-900">{project.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">{project.description}</div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <ProjectStatusBadge status={project.status} />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                      {project.startDate}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`font-mono text-[11px] ${isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}>
                        {project.deadline}
                      </span>
                      {isOverdue && (
                        <span className="ml-1.5 inline-block text-[10px] text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                          Overdue
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              project.progress === 100 ? 'bg-blue-600' :
                              project.progress >= 70 ? 'bg-emerald-500' :
                              project.progress >= 40 ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 w-8 text-right">
                          {project.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                        projectOpenTasks.length > 0 ? 'bg-slate-100 text-slate-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {projectOpenTasks.length}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProjectDetails(project.id);
                        }}
                        className="text-slate-400 hover:text-blue-600 p-1 rounded-md"
                        title="View project details & tasks"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Lower Section: Recent Tasks, Upcoming Deadlines, and Resource Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Recent / Upcoming Tasks */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent / Upcoming Tasks</h2>
              <p className="text-xs text-slate-500">Active tasks requiring execution by the IT engineering team</p>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>All Tasks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-200 flex-1">
            {recentTasks.map((task) => {
              const project = getProject(task.projectId);
              const company = project ? getCompany(project.companyId) : undefined;
              const assignee = getStaff(task.assigneeId);
              const isOverdue = isTaskOverdue(task);

              return (
                <div
                  key={task.id}
                  onClick={() => onOpenTaskDetails(task.id)}
                  className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-1.5">
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {task.title}
                      </span>
                      {isOverdue && <OverdueBadge />}
                    </div>

                    <div className="flex items-center flex-wrap gap-2 text-[11px] text-slate-500">
                      <span className="text-slate-700 font-medium">{company?.name}</span>
                      <span>•</span>
                      <span className="text-slate-600 truncate">{project?.name}</span>
                    </div>

                    <div className="flex items-center flex-wrap gap-2 pt-1">
                      <TaskLevelBadge level={task.taskLevel} />
                      <TaskStatusBadge status={task.status} />
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-xs shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {assignee ? (
                      <div className="flex items-center space-x-1.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${assignee.colorScheme}`}>
                          {assignee.avatarInitials}
                        </div>
                        <span className="text-slate-700 font-medium text-[11px]">{assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                    )}

                    <div className="flex items-center text-slate-500 text-[11px] font-mono mt-1">
                      <Clock className="w-3 h-3 mr-1 text-slate-400" />
                      <span>{task.deadline.split('T')[0]}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Upcoming Deadlines & Resource Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Deadlines Widget */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Upcoming Deadlines</h2>
                <p className="text-xs text-slate-500">Approaching milestones and task targets</p>
              </div>
              <button
                onClick={() => onNavigate('task-calendar')}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Calendar
              </button>
            </div>

            <div className="p-3 divide-y divide-slate-100">
              {upcomingDeadlinesList.map((item, idx) => (
                <div
                  key={`${item.kind}-${item.id}-${idx}`}
                  onClick={() => {
                    if (item.kind === 'project') onOpenProjectDetails(item.id);
                    else onOpenTaskDetails(item.id);
                  }}
                  className="py-2.5 px-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        item.kind === 'project' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {item.kind}
                      </span>
                      <p className="text-xs font-medium text-slate-800 truncate">{item.title}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate ml-1">{item.companyName}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-xs font-mono font-medium ${
                      item.isOverdue ? 'text-rose-600' : 'text-slate-600'
                    }`}>
                      {item.deadline}
                    </span>
                    {item.isOverdue && (
                      <div className="text-[10px] text-rose-600 font-bold">Past Due</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Summary Widget */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Resource Summary</h2>
                <p className="text-xs text-slate-500">Materials attached to client projects</p>
              </div>
              <button
                onClick={() => onNavigate('resources')}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Browse</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-2 gap-3">
              <div 
                onClick={() => onNavigate('resources')}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition cursor-pointer flex items-center space-x-3"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 leading-none">{domainCount}</div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">Domains</div>
                </div>
              </div>

              <div 
                onClick={() => onNavigate('resources')}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition cursor-pointer flex items-center space-x-3"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 leading-none">{fileCount}</div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">Files & Docs</div>
                </div>
              </div>

              <div 
                onClick={() => onNavigate('resources')}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition cursor-pointer flex items-center space-x-3"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 leading-none">{reportCount}</div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">Reports</div>
                </div>
              </div>

              <div 
                onClick={() => onNavigate('resources')}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition cursor-pointer flex items-center space-x-3"
              >
                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 leading-none">{otherCount}</div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">Other & Links</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
