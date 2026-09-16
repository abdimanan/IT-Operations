import React, { useState } from 'react';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Building2, 
  FolderKanban,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { TaskStatusBadge, TaskLevelBadge } from '../common/StatusBadges';
import { Task } from '../../types';

interface TaskCalendarViewProps {
  onOpenTaskDetails: (taskId: string) => void;
}

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({ onOpenTaskDetails }) => {
  const { 
    tasks, 
    projects, 
    companies, 
    staff, 
    getProject, 
    getCompany, 
    getStaff, 
    currentDate,
    isTaskOverdue 
  } = useData();

  // Calendar year and month navigation - default to September 2026
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 0-indexed: 8 = September

  // Filters
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('ALL');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('ALL');
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(8); // September
  };

  // Month metadata
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Filter tasks based on settings
  const filteredTasks = tasks.filter(t => {
    const project = getProject(t.projectId);
    const matchesCompany = selectedCompanyFilter === 'ALL' || (project && project.companyId === selectedCompanyFilter);
    const matchesProject = selectedProjectFilter === 'ALL' || t.projectId === selectedProjectFilter;
    const matchesAssignee = selectedAssigneeFilter === 'ALL' || t.assigneeId === selectedAssigneeFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || t.status === selectedStatusFilter;
    const matchesLevel = selectedLevelFilter === 'ALL' || t.taskLevel === selectedLevelFilter;

    return matchesCompany && matchesProject && matchesAssignee && matchesStatus && matchesLevel;
  });

  // Map tasks to days in the month (matching either start date or deadline date)
  const getTasksForDay = (day: number) => {
    const formattedDay = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return filteredTasks.filter(t => {
      const taskStartDay = t.startDateTime.split('T')[0];
      const taskDeadlineDay = t.deadline.split('T')[0];
      return taskStartDay === formattedDay || taskDeadlineDay === formattedDay;
    });
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        {/* Navigation & Month Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <span>{monthNames[currentMonth]} {currentYear}</span>
            </h2>

            <div className="flex items-center space-x-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                onClick={handlePrevMonth}
                className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-white"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-2 py-0.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded hover:bg-white"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-white"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Simulated System Date: <span className="font-semibold text-slate-800">{currentDate}</span>
          </div>
        </div>

        {/* 5 Filters Row as requested: Company, Project, Assignee, Task status, Task level */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
          {/* 1. Company */}
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

          {/* 2. Project */}
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

          {/* 3. Assignee */}
          <select
            value={selectedAssigneeFilter}
            onChange={(e) => setSelectedAssigneeFilter(e.target.value)}
            className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 truncate"
          >
            <option value="ALL">All Assignees</option>
            {staff.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* 4. Task status */}
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

          {/* 5. Task level */}
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
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-slate-50 text-slate-500 border-b border-slate-200 text-xs font-semibold text-center py-2.5">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Date cells grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200 border-b border-slate-200">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="min-h-[110px] bg-slate-50/50 p-2 text-slate-300 select-none text-xs" />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateStr === currentDate;
            const dayTasks = getTasksForDay(dayNum);

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-[110px] p-2 transition-colors flex flex-col justify-between ${
                  isToday ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'
                }`}
              >
                {/* Cell Header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      isToday 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  )}
                </div>

                {/* Day Tasks List */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-24">
                  {dayTasks.map((task) => {
                    const isDeadline = task.deadline.split('T')[0] === dateStr;
                    const assignee = getStaff(task.assigneeId);
                    const overdue = isTaskOverdue(task);

                    return (
                      <div
                        key={task.id}
                        onClick={() => onOpenTaskDetails(task.id)}
                        className={`p-1.5 rounded text-[11px] font-medium border cursor-pointer hover:shadow-xs transition truncate ${
                          overdue 
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : task.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : task.taskLevel === 'Critical'
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                        title={`${task.title} • Assignee: ${assignee?.name || 'Unassigned'} • Deadline: ${task.deadline}`}
                      >
                        <div className="flex items-center space-x-1 truncate">
                          {isDeadline && (
                            <Clock className="w-2.5 h-2.5 shrink-0 text-slate-500" />
                          )}
                          <span className="truncate">{task.title}</span>
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-slate-500 mt-0.5">
                          <span className="truncate font-mono">{assignee ? assignee.name.split(' ')[0] : 'Unassigned'}</span>
                          <span className="font-semibold">{task.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
