import React, { useState } from 'react';
import { 
  CalendarRange, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  FolderKanban, 
  Clock, 
  Flag,
  ArrowRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ProjectStatusBadge } from '../common/StatusBadges';
import { Project } from '../../types';

interface ProjectCalendarViewProps {
  onOpenProjectDetails: (projectId: string) => void;
}

export const ProjectCalendarView: React.FC<ProjectCalendarViewProps> = ({ onOpenProjectDetails }) => {
  const { projects, companies, getCompany, isProjectOverdue, currentDate } = useData();

  // Navigation state - default to September 2026
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // September (0-indexed)

  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
    setCurrentMonth(8);
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesCompany = selectedCompanyFilter === 'ALL' || p.companyId === selectedCompanyFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || p.status === selectedStatusFilter;
    return matchesCompany && matchesStatus;
  });

  // Projects relevant to this calendar month (either starting, ending, or spanning through)
  const monthStartStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  const monthEndStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  const activeInMonthProjects = filteredProjects.filter(p => {
    return p.startDate <= monthEndStr && p.deadline >= monthStartStr;
  });

  // Get milestones for specific day
  const getProjectEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const starts = filteredProjects.filter(p => p.startDate === dateStr);
    const deadlines = filteredProjects.filter(p => p.deadline === dateStr);

    return { starts, deadlines };
  };

  return (
    <div className="space-y-6">
      {/* Management Calendar Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-indigo-600" />
              <span>Project Delivery Calendar: {monthNames[currentMonth]} {currentYear}</span>
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
            High-Level Project Timeline
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-slate-100">
          <select
            value={selectedCompanyFilter}
            onChange={(e) => setSelectedCompanyFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="ALL">All Client Companies ({companies.length})</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="ALL">All Project Statuses</option>
            <option value="Planned">Planned</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* High-level Project Spans Timeline Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
          <span>Active Project Windows for {monthNames[currentMonth]} {currentYear}</span>
          <span className="font-mono text-slate-500 font-normal">
            {activeInMonthProjects.length} project(s) spanning this month
          </span>
        </h3>

        <div className="space-y-2.5">
          {activeInMonthProjects.map((project) => {
            const company = getCompany(project.companyId);
            const isOverdue = isProjectOverdue(project);

            return (
              <div
                key={project.id}
                onClick={() => onOpenProjectDetails(project.id)}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs text-slate-900 truncate">
                      {project.name}
                    </span>
                    <ProjectStatusBadge status={project.status} />
                    {isOverdue && (
                      <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 font-bold">
                        Past Deadline
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-600">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{company?.name}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs font-mono shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-sans">Start & Target</div>
                    <div className="text-slate-700 flex items-center gap-1.5 mt-0.5">
                      <span>{project.startDate}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-900 font-semibold'}>
                        {project.deadline}
                      </span>
                    </div>
                  </div>

                  <div className="w-14 text-right">
                    <div className="text-xs font-bold text-blue-600">{project.progress}%</div>
                    <div className="text-[10px] text-slate-400 font-sans">Progress</div>
                  </div>
                </div>
              </div>
            );
          })}

          {activeInMonthProjects.length === 0 && (
            <p className="text-xs text-slate-500 italic p-3 text-center">No projects spanning this month.</p>
          )}
        </div>
      </div>

      {/* Calendar Grid with Start Dates and Ultimate Deadlines */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-50 text-slate-500 border-b border-slate-200 text-xs font-semibold text-center py-2.5">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200 border-b border-slate-200">
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-p-${index}`} className="min-h-[110px] bg-slate-50/50 p-2 text-slate-300 select-none text-xs" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateStr === currentDate;
            const { starts, deadlines } = getProjectEventsForDay(dayNum);

            return (
              <div
                key={`p-day-${dayNum}`}
                className={`min-h-[110px] p-2 transition-colors flex flex-col justify-between ${
                  isToday ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'
                }`}
              >
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
                </div>

                <div className="space-y-1 flex-1 overflow-y-auto max-h-24">
                  {/* Start Events */}
                  {starts.map(p => {
                    const comp = getCompany(p.companyId);
                    return (
                      <div
                        key={`start-${p.id}`}
                        onClick={() => onOpenProjectDetails(p.id)}
                        className="p-1 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-pointer hover:shadow-xs truncate"
                        title={`Project Kickoff: ${p.name} (${comp?.name})`}
                      >
                        <span className="font-bold">▶ Start:</span> {p.name}
                      </div>
                    );
                  })}

                  {/* Deadline Events */}
                  {deadlines.map(p => {
                    const comp = getCompany(p.companyId);
                    const isOverdue = isProjectOverdue(p);
                    return (
                      <div
                        key={`deadline-${p.id}`}
                        onClick={() => onOpenProjectDetails(p.id)}
                        className={`p-1 rounded text-[10px] font-medium border cursor-pointer hover:shadow-xs truncate ${
                          isOverdue 
                            ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                        title={`Project Deadline: ${p.name} (${comp?.name}) - Status: ${p.status}`}
                      >
                        <span className="font-bold">🏁 Target:</span> {p.name}
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
