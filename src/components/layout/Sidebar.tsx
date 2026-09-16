import React from 'react';
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  CheckSquare,
  Layers,
  CalendarDays,
  CalendarRange,
  Settings,
  Server,
  SlidersHorizontal,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  settingsSubTab: 'types' | 'levels' | 'assignees';
  setSettingsSubTab: (tab: 'types' | 'levels' | 'assignees') => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  settingsSubTab,
  setSettingsSubTab,
  isOpenMobile,
  setIsOpenMobile,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { companies, projects, tasks, resources, isTaskOverdue } = useData();

  const activeProjectsCount = projects.filter(p => p.status === 'Active').length;
  const openTasksCount = tasks.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled').length;
  const overdueTasksCount = tasks.filter(isTaskOverdue).length;

  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: overdueTasksCount > 0 ? `${overdueTasksCount} overdue` : undefined,
      badgeType: 'danger',
    },
    {
      id: 'companies' as NavigationTab,
      label: 'Companies',
      icon: Building2,
      count: companies.length,
    },
    {
      id: 'projects' as NavigationTab,
      label: 'Projects',
      icon: FolderKanban,
      count: activeProjectsCount,
      countLabel: 'active',
    },
    {
      id: 'tasks' as NavigationTab,
      label: 'Tasks',
      icon: CheckSquare,
      count: openTasksCount,
    },
    {
      id: 'resources' as NavigationTab,
      label: 'Resources',
      icon: Layers,
      count: resources.length,
    },
    {
      id: 'task-calendar' as NavigationTab,
      label: 'Task Calendar',
      icon: CalendarDays,
    },
    {
      id: 'project-calendar' as NavigationTab,
      label: 'Project Calendar',
      icon: CalendarRange,
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-xs"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        id="sidebar"
        className={`fixed lg:static inset-y-0 left-0 z-40 shrink-0 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-[transform,width] duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-64 lg:w-20' : 'w-64'}`}
      >
        {/* Brand header */}
        <div className={`h-16 flex items-center border-b border-slate-800 ${isCollapsed ? 'lg:justify-center lg:px-2 px-5 justify-between' : 'px-5 justify-between'}`}>
          <div className={`flex items-center space-x-3 min-w-0 ${isCollapsed ? 'lg:hidden' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                IT Operations
                <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-950 text-blue-400 px-1.5 py-0.5 rounded border border-blue-800">
                  Internal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">Client Tech Projects</p>
            </div>
          </div>

          <div className={`hidden w-8 h-8 rounded-lg bg-blue-600 items-center justify-center text-white shadow-xs shrink-0 ${isCollapsed ? 'lg:flex' : ''}`}>
            <Server className="w-4 h-4" />
          </div>

          <button
            id="btn-toggle-sidebar-collapse"
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
          <div className={`px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase ${isCollapsed ? 'lg:hidden' : ''}`}>
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="space-y-0.5">
                <button
                  id={`nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpenMobile(false);
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isCollapsed ? 'lg:justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className={`truncate ${isCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tight shrink-0 ${isCollapsed ? 'lg:hidden' : ''} ${
                      item.badgeType === 'danger'
                        ? isActive ? 'bg-rose-500 text-white' : 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  ) : item.count !== undefined ? (
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono shrink-0 ${isCollapsed ? 'lg:hidden' : ''} ${
                        isActive
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  ) : null}
                </button>

                {/* Sub-navigation if Settings is active */}
                {item.id === 'settings' && activeTab === 'settings' && (
                  <div className={`ml-7 pl-2 border-l border-slate-700 py-1 space-y-1 ${isCollapsed ? 'lg:hidden' : ''}`}>
                    <button
                      onClick={() => setSettingsSubTab('types')}
                      className={`w-full text-left px-2.5 py-1 text-xs rounded-md transition-colors ${
                        settingsSubTab === 'types'
                          ? 'text-white font-medium bg-slate-800'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Task Types
                    </button>
                    <button
                      onClick={() => setSettingsSubTab('levels')}
                      className={`w-full text-left px-2.5 py-1 text-xs rounded-md transition-colors ${
                        settingsSubTab === 'levels'
                          ? 'text-white font-medium bg-slate-800'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Task Levels
                    </button>
                    <button
                      onClick={() => setSettingsSubTab('assignees')}
                      className={`w-full text-left px-2.5 py-1 text-xs rounded-md transition-colors ${
                        settingsSubTab === 'assignees'
                          ? 'text-white font-medium bg-slate-800'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Department Assignees
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Hierarchy Context Footnote */}
        <div className={`p-3 border-t border-slate-800 bg-slate-950/40 ${isCollapsed ? 'lg:hidden' : ''}`}>
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-400 leading-relaxed">
            <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-blue-400" />
              Hierarchy Architecture
            </div>
            <div className="font-mono text-[10px] text-slate-300">
              Company → Project → Resources / Tasks → Subtasks
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
