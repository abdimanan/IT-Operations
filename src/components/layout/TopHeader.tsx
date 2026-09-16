import React, { useState } from 'react';
import { 
  Menu, 
  Plus, 
  Search, 
  AlertTriangle, 
  Calendar,
  Building2,
  FolderKanban,
  CheckSquare,
  Layers,
  ChevronDown
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { useData } from '../../context/DataContext';

interface TopHeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onOpenSidebar: () => void;
  onOpenCreateCompany: () => void;
  onOpenCreateProject: () => void;
  onOpenCreateTask: () => void;
  onOpenCreateResource: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSidebar,
  onOpenCreateCompany,
  onOpenCreateProject,
  onOpenCreateTask,
  onOpenCreateResource,
  searchQuery,
  setSearchQuery,
}) => {
  const { tasks, isTaskOverdue, currentDate } = useData();
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);

  const overdueCount = tasks.filter(isTaskOverdue).length;

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'IT Operations Dashboard';
      case 'companies': return 'Client Companies';
      case 'projects': return 'Client Projects';
      case 'tasks': return 'Project Tasks & Subtasks';
      case 'resources': return 'Project Resources & Deliverables';
      case 'task-calendar': return 'Task Schedule Calendar';
      case 'project-calendar': return 'Project Milestones Calendar';
      case 'settings': return 'System Settings';
      default: return 'IT Project Management';
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'High-level status of clients, active technical builds, deadlines, and resources';
      case 'companies': return 'External client organizations for which the IT team delivers technology solutions';
      case 'projects': return 'Software systems, infrastructure, and web applications built for clients';
      case 'tasks': return 'Actionable development, testing, and deployment units with subtasks';
      case 'resources': return 'Domains, credentials refs, documents, reports, and architecture files';
      case 'task-calendar': return 'Operational timeline of task start dates, deadlines, and engineer assignments';
      case 'project-calendar': return 'Management view of overall project start dates and delivery deadlines';
      case 'settings': return 'Task types, priority levels, and internal IT department staff members';
      default: return '';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center space-x-3">
        <button
          id="btn-open-mobile-sidebar"
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 focus:outline-hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">
            {getPageTitle()}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {getPageSubtitle()}
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2.5">
        {/* Global Search */}
        <div className="relative w-44 sm:w-60">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across board..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:bg-white transition-colors"
          />
        </div>

        {/* Date reference indicator */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{currentDate}</span>
        </div>

        {/* Overdue alert pill */}
        {overdueCount > 0 && (
          <button
            id="btn-overdue-alert"
            onClick={() => setActiveTab('tasks')}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200 hover:bg-rose-100 transition-colors"
            title={`${overdueCount} task(s) past deadline`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>{overdueCount} Overdue</span>
          </button>
        )}

        {/* Quick "+ New" Dropdown */}
        <div className="relative">
          <button
            id="btn-quick-create"
            onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
          </button>

          {isNewMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-20" 
                onClick={() => setIsNewMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30 text-xs text-slate-700">
                <button
                  id="action-new-task"
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onOpenCreateTask();
                  }}
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-slate-50 font-medium text-slate-800"
                >
                  <CheckSquare className="w-4 h-4 mr-2 text-blue-600" />
                  New Task
                </button>
                <button
                  id="action-new-project"
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onOpenCreateProject();
                  }}
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-slate-50 font-medium text-slate-800"
                >
                  <FolderKanban className="w-4 h-4 mr-2 text-indigo-600" />
                  New Project
                </button>
                <button
                  id="action-new-resource"
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onOpenCreateResource();
                  }}
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-slate-50 font-medium text-slate-800"
                >
                  <Layers className="w-4 h-4 mr-2 text-emerald-600" />
                  New Resource
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  id="action-new-company"
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onOpenCreateCompany();
                  }}
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-slate-50 font-medium text-slate-800"
                >
                  <Building2 className="w-4 h-4 mr-2 text-slate-600" />
                  New Client Company
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
