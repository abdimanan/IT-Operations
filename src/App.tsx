import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { DashboardView } from './components/dashboard/DashboardView';
import { CompaniesView } from './components/companies/CompaniesView';
import { ProjectsView } from './components/projects/ProjectsView';
import { TasksView } from './components/tasks/TasksView';
import { ResourcesView } from './components/resources/ResourcesView';
import { TaskCalendarView } from './components/calendar/TaskCalendarView';
import { ProjectCalendarView } from './components/calendar/ProjectCalendarView';
import { SettingsView } from './components/settings/SettingsView';
import { 
  AddCompanyModal, 
  AddProjectModal, 
  AddTaskModal, 
  AddResourceModal, 
  AddStaffModal 
} from './components/modals/ActionModals';
import { TaskDetailModal } from './components/modals/TaskDetailModal';
import { NavigationTab } from './types';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [settingsSubTab, setSettingsSubTab] = useState<'types' | 'levels' | 'assignees'>('types');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleSetIsSidebarCollapsed = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    try {
      localStorage.setItem('sidebar-collapsed', String(collapsed));
    } catch {
      // ignore storage errors (private browsing, etc.)
    }
  };

  // Selected item states for contextual cross-navigation
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Modal open states
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  // Helper navigators
  const navigateToProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveTab('projects');
  };

  const navigateToCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setActiveTab('companies');
  };

  const navigateToTask = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settingsSubTab={settingsSubTab}
        setSettingsSubTab={setSettingsSubTab}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={handleSetIsSidebarCollapsed}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCreateCompany={() => setIsAddCompanyOpen(true)}
          onOpenCreateProject={() => setIsAddProjectOpen(true)}
          onOpenCreateTask={() => setIsAddTaskOpen(true)}
          onOpenCreateResource={() => setIsAddResourceOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dynamic Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenProjectDetails={navigateToProject}
                onOpenTaskDetails={navigateToTask}
              />
            )}

            {activeTab === 'companies' && (
              <CompaniesView
                selectedCompanyId={selectedCompanyId}
                setSelectedCompanyId={setSelectedCompanyId}
                onOpenCreateCompany={() => setIsAddCompanyOpen(true)}
                onOpenCreateProject={() => setIsAddProjectOpen(true)}
                onOpenProjectDetails={navigateToProject}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectsView
                selectedProjectId={selectedProjectId}
                setSelectedProjectId={setSelectedProjectId}
                onOpenCreateProject={() => setIsAddProjectOpen(true)}
                onOpenCreateTask={() => setIsAddTaskOpen(true)}
                onOpenCreateResource={() => setIsAddResourceOpen(true)}
                onOpenCompanyDetails={navigateToCompany}
                onOpenTaskDetails={navigateToTask}
              />
            )}

            {activeTab === 'tasks' && (
              <TasksView
                onOpenCreateTask={() => setIsAddTaskOpen(true)}
                selectedTaskId={selectedTaskId}
                setSelectedTaskId={setSelectedTaskId}
                onOpenProjectDetails={navigateToProject}
              />
            )}

            {activeTab === 'resources' && (
              <ResourcesView
                onOpenCreateResource={() => setIsAddResourceOpen(true)}
                onOpenProjectDetails={navigateToProject}
              />
            )}

            {activeTab === 'task-calendar' && (
              <TaskCalendarView
                onOpenTaskDetails={navigateToTask}
              />
            )}

            {activeTab === 'project-calendar' && (
              <ProjectCalendarView
                onOpenProjectDetails={navigateToProject}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                currentSubTab={settingsSubTab}
                setCurrentSubTab={setSettingsSubTab}
                onOpenAddStaff={() => setIsAddStaffOpen(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Action Modals */}
      <AddCompanyModal
        isOpen={isAddCompanyOpen}
        onClose={() => setIsAddCompanyOpen(false)}
      />

      <AddProjectModal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        preselectedCompanyId={selectedCompanyId || undefined}
      />

      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        preselectedProjectId={selectedProjectId || undefined}
      />

      <AddResourceModal
        isOpen={isAddResourceOpen}
        onClose={() => setIsAddResourceOpen(false)}
        preselectedProjectId={selectedProjectId || undefined}
      />

      <AddStaffModal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
      />

      <TaskDetailModal
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onOpenProjectDetails={navigateToProject}
      />
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <MainAppContent />
    </DataProvider>
  );
}
