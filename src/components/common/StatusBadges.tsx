import React from 'react';
import { 
  ProjectStatus, 
  TaskStatus, 
  TaskLevel, 
  TaskType, 
  ResourceType, 
  CompanyStatus 
} from '../../types';
import { 
  Globe, 
  FileText, 
  BarChart3, 
  FileCode, 
  ExternalLink, 
  FolderArchive,
  Code2,
  Bug,
  CheckCircle2,
  Rocket,
  Palette,
  BookOpen,
  Search,
  Wrench,
  AlertCircle
} from 'lucide-react';

export const ProjectStatusBadge: React.FC<{ status: ProjectStatus; className?: string }> = ({ status, className = '' }) => {
  const styles: Record<ProjectStatus, string> = {
    Planned: 'bg-slate-100 text-slate-700 border-slate-200',
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'On Hold': 'bg-amber-50 text-amber-800 border-amber-200',
    Completed: 'bg-blue-50 text-blue-700 border-blue-200',
    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[status] || 'bg-slate-100 text-slate-700 border-slate-200'} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'Active' ? 'bg-emerald-500' :
        status === 'Completed' ? 'bg-blue-500' :
        status === 'On Hold' ? 'bg-amber-500' :
        status === 'Cancelled' ? 'bg-rose-500' : 'bg-slate-400'
      }`} />
      {status}
    </span>
  );
};

export const TaskStatusBadge: React.FC<{ status: TaskStatus; className?: string }> = ({ status, className = '' }) => {
  const styles: Record<TaskStatus, string> = {
    Unassigned: 'bg-slate-100 text-slate-600 border-slate-200',
    Assigned: 'bg-sky-50 text-sky-700 border-sky-200',
    'In Progress': 'bg-amber-50 text-amber-800 border-amber-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[status] || 'bg-slate-100 text-slate-700 border-slate-200'} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'In Progress' ? 'bg-amber-500 animate-pulse' :
        status === 'Completed' ? 'bg-emerald-500' :
        status === 'Assigned' ? 'bg-sky-500' :
        status === 'Cancelled' ? 'bg-rose-500' : 'bg-slate-400'
      }`} />
      {status}
    </span>
  );
};

export const TaskLevelBadge: React.FC<{ level: TaskLevel; className?: string }> = ({ level, className = '' }) => {
  const styles: Record<TaskLevel, string> = {
    Low: 'bg-slate-100 text-slate-600 border-slate-200',
    Normal: 'bg-slate-100 text-slate-800 border-slate-200',
    High: 'bg-amber-50 text-amber-800 border-amber-200',
    Critical: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const dots: Record<TaskLevel, string> = {
    Low: 'bg-slate-400',
    Normal: 'bg-blue-500',
    High: 'bg-amber-500',
    Critical: 'bg-rose-600',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[level]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dots[level]}`} />
      {level}
    </span>
  );
};

export const TaskTypeBadge: React.FC<{ type: TaskType; className?: string }> = ({ type, className = '' }) => {
  const icons: Record<TaskType, React.ReactNode> = {
    Development: <Code2 className="w-3 h-3 mr-1 text-blue-600" />,
    'Bug Fix': <Bug className="w-3 h-3 mr-1 text-rose-600" />,
    Testing: <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />,
    Deployment: <Rocket className="w-3 h-3 mr-1 text-purple-600" />,
    Design: <Palette className="w-3 h-3 mr-1 text-amber-600" />,
    Documentation: <BookOpen className="w-3 h-3 mr-1 text-teal-600" />,
    Research: <Search className="w-3 h-3 mr-1 text-indigo-600" />,
    Maintenance: <Wrench className="w-3 h-3 mr-1 text-slate-600" />,
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200 ${className}`}
    >
      {icons[type]}
      {type}
    </span>
  );
};

export const ResourceTypeBadge: React.FC<{ type: ResourceType; className?: string }> = ({ type, className = '' }) => {
  const config: Record<ResourceType, { icon: React.ReactNode; class: string }> = {
    Domain: {
      icon: <Globe className="w-3 h-3 mr-1 text-blue-600" />,
      class: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    File: {
      icon: <FileCode className="w-3 h-3 mr-1 text-indigo-600" />,
      class: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    Report: {
      icon: <BarChart3 className="w-3 h-3 mr-1 text-emerald-600" />,
      class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    Document: {
      icon: <FileText className="w-3 h-3 mr-1 text-amber-700" />,
      class: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    Link: {
      icon: <ExternalLink className="w-3 h-3 mr-1 text-purple-600" />,
      class: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    Other: {
      icon: <FolderArchive className="w-3 h-3 mr-1 text-slate-600" />,
      class: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  };

  const item = config[type] || config.Other;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${item.class} ${className}`}
    >
      {item.icon}
      {type}
    </span>
  );
};

export const CompanyStatusBadge: React.FC<{ status: CompanyStatus; className?: string }> = ({ status, className = '' }) => {
  const styles: Record<CompanyStatus, string> = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'On Hold': 'bg-amber-50 text-amber-800 border-amber-200',
    Completed: 'bg-blue-50 text-blue-700 border-blue-200',
    Prospective: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[status]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'Active' ? 'bg-emerald-500' :
        status === 'Completed' ? 'bg-blue-500' :
        status === 'On Hold' ? 'bg-amber-500' : 'bg-slate-400'
      }`} />
      {status}
    </span>
  );
};

export const OverdueBadge: React.FC<{ daysOverdue?: number }> = ({ daysOverdue }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
      <AlertCircle className="w-3 h-3 mr-1 text-rose-600" />
      {daysOverdue !== undefined && daysOverdue > 0 ? `${daysOverdue}d overdue` : 'Overdue'}
    </span>
  );
};
