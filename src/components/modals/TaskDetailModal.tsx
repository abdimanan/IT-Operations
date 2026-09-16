import React, { useState } from 'react';
import { 
  X, 
  CheckSquare, 
  Building2, 
  FolderKanban, 
  User, 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { TaskStatusBadge, TaskLevelBadge, TaskTypeBadge, OverdueBadge } from '../common/StatusBadges';
import { TaskStatus, TaskLevel, TaskType } from '../../types';

interface TaskDetailModalProps {
  taskId: string | null;
  onClose: () => void;
  onOpenProjectDetails: (projectId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  taskId,
  onClose,
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
    updateTask, 
    deleteTask,
    toggleSubtask, 
    addSubtask, 
    deleteSubtask,
    isTaskOverdue 
  } = useData();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!taskId) return null;

  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;

  const project = getProject(task.projectId);
  const company = project ? getCompany(project.companyId) : undefined;
  const assignee = getStaff(task.assigneeId);
  const taskSubtasks = subtasks.filter(s => s.taskId === task.id);
  const completedSubtasksCount = taskSubtasks.filter(s => s.status === 'Completed').length;
  const isOverdue = isTaskOverdue(task);

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-3 bg-slate-50/70">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-xs font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                {company?.name || 'Client'}
              </span>
              <span className="text-slate-400">/</span>
              <button
                onClick={() => {
                  onClose();
                  if (project) onOpenProjectDetails(project.id);
                }}
                className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
              >
                <FolderKanban className="w-3 h-3 text-blue-500" />
                <span>{project?.name || 'Project'}</span>
              </button>
              <TaskTypeBadge type={task.taskType} />
              <TaskLevelBadge level={task.taskLevel} />
              {isOverdue && <OverdueBadge />}
            </div>

            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {task.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Description */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Description
            </h4>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {task.description || 'No description provided.'}
            </p>
          </div>

          {/* Quick status & assignee controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 border border-slate-200 rounded-lg bg-white">
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">
                Task Status
              </label>
              <select
                value={task.status}
                onChange={(e) => setTaskStatus(task.id, e.target.value as TaskStatus)}
                className="w-full text-xs font-semibold py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800"
              >
                <option value="Unassigned">Unassigned</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg bg-white">
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">
                IT Staff Assignee
              </label>
              <select
                value={task.assigneeId || 'UNASSIGNED'}
                onChange={(e) => {
                  const val = e.target.value === 'UNASSIGNED' ? undefined : e.target.value;
                  updateTask(task.id, { assigneeId: val });
                }}
                className="w-full text-xs font-semibold py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800"
              >
                <option value="UNASSIGNED">Unassigned</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Timeline & SLA Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50">
              <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">Start Time</span>
              <span className="text-slate-700 font-medium text-xs mt-1 block">
                {task.startDateTime.replace('T', ' ')}
              </span>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50">
              <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">Target Deadline</span>
              <span className={`text-xs font-semibold mt-1 block ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                {task.deadline.replace('T', ' ')}
              </span>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Subtasks ({completedSubtasksCount}/{taskSubtasks.length})
                </h4>
                <p className="text-[11px] text-slate-500">Atomic checklists to complete this task</p>
              </div>

              {taskSubtasks.length > 0 && (
                <div className="w-28 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${(completedSubtasksCount / taskSubtasks.length) * 100}%` }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              {taskSubtasks.map((sub) => {
                const isDone = sub.status === 'Completed';

                return (
                  <div
                    key={sub.id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 transition ${
                      isDone ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggleSubtask(sub.id)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`text-xs font-medium truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {sub.title}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-500">
                        {sub.deadline}
                      </span>
                      <button
                        onClick={() => deleteSubtask(sub.id)}
                        className="text-slate-300 hover:text-rose-500 p-0.5"
                        title="Delete subtask"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {taskSubtasks.length === 0 && (
                <p className="text-xs text-slate-500 italic p-2 text-center bg-slate-50 rounded">
                  No subtasks defined.
                </p>
              )}
            </div>

            {/* Add Subtask Form */}
            <form onSubmit={handleAddSubtask} className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add another subtask..."
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-xs"
              >
                Add
              </button>
            </form>
          </div>

          {/* Notes */}
          {task.notes && (
            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-amber-900">
              <span className="font-semibold block mb-0.5 text-[11px] uppercase">Notes:</span>
              <p className="text-xs">{task.notes}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Delete this task?')) {
                deleteTask(task.id);
                onClose();
              }
            }}
            className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Task</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
