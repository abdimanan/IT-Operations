import React, { useState } from 'react';
import { 
  CheckSquare, 
  Building2, 
  FolderKanban, 
  User, 
  Plus, 
  Search, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Trash2, 
  FileText,
  Calendar,
  CheckCircle2,
  Tag,
  ListTodo
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { 
  TaskStatusBadge, 
  TaskLevelBadge, 
  TaskTypeBadge, 
  OverdueBadge 
} from '../common/StatusBadges';
import { Task, TaskStatus, TaskLevel, TaskType } from '../../types';

interface TasksViewProps {
  onOpenCreateTask: () => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  onOpenProjectDetails: (projectId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  onOpenCreateTask,
  selectedTaskId,
  setSelectedTaskId,
  onOpenProjectDetails,
}) => {
  const { 
    tasks, 
    subtasks, 
    projects, 
    companies, 
    staff, 
    getProject, 
    getCompany, 
    getStaff, 
    setTaskStatus, 
    deleteTask,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    isTaskOverdue 
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('ALL');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('ALL');
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');

  // Track expanded tasks for inline subtasks viewing
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set(['task-1']));
  const [newSubtaskInputs, setNewSubtaskInputs] = useState<Record<string, string>>({});

  const toggleTaskExpand = (taskId: string) => {
    setExpandedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const proj = getProject(t.projectId);
    const comp = proj ? getCompany(proj.companyId) : undefined;
    const assignee = getStaff(t.assigneeId);

    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (proj && proj.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (comp && comp.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCompany = selectedCompanyFilter === 'ALL' || (proj && proj.companyId === selectedCompanyFilter);
    const matchesProject = selectedProjectFilter === 'ALL' || t.projectId === selectedProjectFilter;
    const matchesAssignee = selectedAssigneeFilter === 'ALL' || (selectedAssigneeFilter === 'UNASSIGNED' ? !t.assigneeId : t.assigneeId === selectedAssigneeFilter);
    const matchesStatus = selectedStatusFilter === 'ALL' || t.status === selectedStatusFilter;
    const matchesLevel = selectedLevelFilter === 'ALL' || t.taskLevel === selectedLevelFilter;
    const matchesType = selectedTypeFilter === 'ALL' || t.taskType === selectedTypeFilter;

    return matchesSearch && matchesCompany && matchesProject && matchesAssignee && matchesStatus && matchesLevel && matchesType;
  });

  const handleAddSubtask = (taskId: string) => {
    const title = newSubtaskInputs[taskId];
    if (!title || !title.trim()) return;
    addSubtask(taskId, title.trim());
    setNewSubtaskInputs(prev => ({ ...prev, [taskId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Controls & Multi-Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, descriptions, notes..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <button
            id="btn-add-task"
            onClick={onOpenCreateTask}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-2xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Filters row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 border-t border-slate-100">
          {/* Company */}
          <select
            value={selectedCompanyFilter}
            onChange={(e) => {
              setSelectedCompanyFilter(e.target.value);
              setSelectedProjectFilter('ALL');
            }}
            className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 truncate"
          >
            <option value="ALL">All Companies</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Project */}
          <select
            value={selectedProjectFilter}
            onChange={(e) => setSelectedProjectFilter(e.target.value)}
            className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 truncate"
          >
            <option value="ALL">All Projects</option>
            {projects
              .filter(p => selectedCompanyFilter === 'ALL' || p.companyId === selectedCompanyFilter)
              .map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
          </select>

          {/* Assignee */}
          <select
            value={selectedAssigneeFilter}
            onChange={(e) => setSelectedAssigneeFilter(e.target.value)}
            className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 truncate"
          >
            <option value="ALL">All Assignees</option>
            <option value="UNASSIGNED">Unassigned Only</option>
            {staff.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.role.split(' ')[0]})</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="Unassigned">Unassigned</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Level */}
          <select
            value={selectedLevelFilter}
            onChange={(e) => setSelectedLevelFilter(e.target.value)}
            className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="ALL">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          {/* Type */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="ALL">All Types</option>
            <option value="Development">Development</option>
            <option value="Bug Fix">Bug Fix</option>
            <option value="Testing">Testing</option>
            <option value="Deployment">Deployment</option>
            <option value="Design">Design</option>
            <option value="Documentation">Documentation</option>
            <option value="Research">Research</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Tasks List Table / Cards */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const project = getProject(task.projectId);
          const company = project ? getCompany(project.companyId) : undefined;
          const assignee = getStaff(task.assigneeId);
          const taskSubtasks = subtasks.filter(s => s.taskId === task.id);
          const completedSubtasksCount = taskSubtasks.filter(s => s.status === 'Completed').length;
          const isExpanded = expandedTaskIds.has(task.id);
          const isOverdue = isTaskOverdue(task);

          return (
            <div
              key={task.id}
              id={`task-item-${task.id}`}
              className={`bg-white rounded-xl border transition shadow-2xs overflow-hidden ${
                isOverdue ? 'border-rose-300' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Task Header Bar */}
              <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  {/* Company & Project Context Header */}
                  <div className="flex items-center flex-wrap gap-2 text-xs">
                    <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      {company?.name || 'Unknown Client'}
                    </span>
                    <span className="text-slate-400">/</span>
                    <button
                      onClick={() => project && onOpenProjectDetails(project.id)}
                      className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <FolderKanban className="w-3 h-3 text-blue-500" />
                      {project?.name || 'Unknown Project'}
                    </button>
                    <span className="text-slate-300">•</span>
                    <TaskTypeBadge type={task.taskType} />
                    <TaskLevelBadge level={task.taskLevel} />
                    {isOverdue && <OverdueBadge />}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {task.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  {/* Notes if available */}
                  {task.notes && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 rounded px-2 py-1 border border-slate-100 italic inline-block mt-1">
                      Note: {task.notes}
                    </div>
                  )}

                  {/* Dates & Timeline */}
                  <div className="flex items-center flex-wrap gap-4 text-[11px] font-mono text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Start: {task.startDateTime.replace('T', ' ')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Deadline: <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}>{task.deadline.replace('T', ' ')}</span>
                    </span>
                  </div>
                </div>

                {/* Right Actions & Assignee */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                  {/* Status Dropdown */}
                  <div className="flex items-center space-x-2">
                    <select
                      value={task.status}
                      onChange={(e) => setTaskStatus(task.id, e.target.value as TaskStatus)}
                      className="text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="Unassigned">Unassigned</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Assignee Badge */}
                  <div className="flex items-center space-x-2">
                    {assignee ? (
                      <div className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${assignee.colorScheme}`}>
                          {assignee.avatarInitials}
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-semibold text-slate-800 leading-none">{assignee.name}</div>
                          <div className="text-[10px] text-slate-400 leading-none mt-0.5">{assignee.role.split(' ')[0]}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        Unassigned
                      </span>
                    )}
                  </div>

                  {/* Toggle Subtasks Button */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => toggleTaskExpand(task.id)}
                      className="inline-flex items-center space-x-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100"
                    >
                      <ListTodo className="w-3.5 h-3.5" />
                      <span>Subtasks ({completedSubtasksCount}/{taskSubtasks.length})</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable Subtasks Checklist */}
              {isExpanded && (
                <div className="bg-slate-50/80 border-t border-slate-200 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Subtasks Checklist
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500">
                        ({completedSubtasksCount} of {taskSubtasks.length} completed)
                      </span>
                    </div>

                    {/* Progress indicator */}
                    {taskSubtasks.length > 0 && (
                      <div className="w-32 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${(completedSubtasksCount / taskSubtasks.length) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Subtasks Items */}
                  <div className="space-y-2">
                    {taskSubtasks.map((sub) => {
                      const isCompleted = sub.status === 'Completed';
                      const subAssignee = getStaff(sub.assigneeId);

                      return (
                        <div
                          key={sub.id}
                          className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 transition ${
                            isCompleted 
                              ? 'bg-white/60 border-slate-200 text-slate-400' 
                              : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() => toggleSubtask(sub.id)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className={`text-xs font-medium truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {sub.title}
                            </span>
                          </div>

                          <div className="flex items-center space-x-3 text-xs shrink-0">
                            {subAssignee && (
                              <span className="text-[10px] text-slate-500 font-medium">
                                {subAssignee.name.split(' ')[0]}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-500">
                              Due {sub.deadline}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {sub.status}
                            </span>
                            <button
                              onClick={() => deleteSubtask(sub.id)}
                              className="text-slate-300 hover:text-rose-500 p-0.5"
                              title="Delete subtask"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {taskSubtasks.length === 0 && (
                      <p className="text-xs text-slate-500 italic">No subtasks defined yet for this task.</p>
                    )}
                  </div>

                  {/* Add Subtask Inline Form */}
                  <div className="pt-2 flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Add another subtask (e.g. 'Validate customer payment payload')..."
                      value={newSubtaskInputs[task.id] || ''}
                      onChange={(e) => setNewSubtaskInputs({ ...newSubtaskInputs, [task.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubtask(task.id);
                        }
                      }}
                      className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                    />
                    <button
                      onClick={() => handleAddSubtask(task.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <CheckSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No tasks found</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting filters or adding a new task.</p>
          </div>
        )}
      </div>
    </div>
  );
};
