import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  ExternalLink, 
  Building2, 
  FolderKanban, 
  Calendar, 
  Globe, 
  FileCode, 
  BarChart3, 
  FileText, 
  Trash2, 
  Copy, 
  Check,
  ShieldCheck
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ResourceTypeBadge } from '../common/StatusBadges';
import { Resource, ResourceType } from '../../types';

interface ResourcesViewProps {
  onOpenCreateResource: () => void;
  onOpenProjectDetails: (projectId: string) => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  onOpenCreateResource,
  onOpenProjectDetails,
}) => {
  const { 
    resources, 
    projects, 
    companies, 
    getProject, 
    getCompany, 
    deleteResource 
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('ALL');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyRef = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter resources
  const filteredResources = resources.filter(r => {
    const project = getProject(r.projectId);
    const company = project ? getCompany(project.companyId) : undefined;

    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project && project.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company && company.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedTypeFilter === 'ALL' || r.type === selectedTypeFilter;
    const matchesCompany = selectedCompanyFilter === 'ALL' || (project && project.companyId === selectedCompanyFilter);
    const matchesProject = selectedProjectFilter === 'ALL' || r.projectId === selectedProjectFilter;

    return matchesSearch && matchesType && matchesCompany && matchesProject;
  });

  const types: ResourceType[] = ['Domain', 'File', 'Report', 'Document', 'Link', 'Other'];

  return (
    <div className="space-y-6">
      {/* Top Resource Type Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {types.map((type) => {
          const count = resources.filter(r => r.type === type).length;
          const isSelected = selectedTypeFilter === type;

          return (
            <button
              key={type}
              onClick={() => setSelectedTypeFilter(isSelected ? 'ALL' : type)}
              className={`p-3 rounded-xl border text-left transition ${
                isSelected 
                  ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100' 
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                {type}
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">{count}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {isSelected ? 'Active filter' : 'Filter by this'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Search */}
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources, references, files..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="ALL">All Types ({resources.length})</option>
            {types.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Company Filter */}
          <select
            value={selectedCompanyFilter}
            onChange={(e) => {
              setSelectedCompanyFilter(e.target.value);
              setSelectedProjectFilter('ALL');
            }}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="ALL">All Companies</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Project Filter */}
          <select
            value={selectedProjectFilter}
            onChange={(e) => setSelectedProjectFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 truncate max-w-[200px]"
          >
            <option value="ALL">All Projects</option>
            {projects
              .filter(p => selectedCompanyFilter === 'ALL' || p.companyId === selectedCompanyFilter)
              .map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
          </select>
        </div>

        <button
          id="btn-add-resource"
          onClick={onOpenCreateResource}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Security note */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 flex items-center space-x-2 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          <strong>Security Policy:</strong> Store safe domain hostnames, specification URLs, or IT Vault reference tags. Plaintext credentials are strictly restricted.
        </span>
      </div>

      {/* Resource Table / Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Resource Name</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Project & Client</th>
                <th className="px-5 py-3">Reference / Location</th>
                <th className="px-5 py-3">Added Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredResources.map((resource) => {
                const project = getProject(resource.projectId);
                const company = project ? getCompany(project.companyId) : undefined;
                const isCopied = copiedId === resource.id;

                return (
                  <tr key={resource.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 text-xs">{resource.name}</div>
                      <div className="text-[11px] text-slate-500 max-w-sm line-clamp-1 mt-0.5">{resource.description}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <ResourceTypeBadge type={resource.type} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <button
                        onClick={() => project && onOpenProjectDetails(project.id)}
                        className="font-medium text-slate-900 hover:text-blue-600 flex items-center gap-1.5"
                      >
                        <FolderKanban className="w-3.5 h-3.5 text-blue-500" />
                        <span>{project?.name || 'Unknown Project'}</span>
                      </button>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span>{company?.name || 'Unknown Client'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-1.5 max-w-xs">
                        <span className="font-mono text-[11px] text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200 truncate">
                          {resource.reference}
                        </span>
                        <button
                          onClick={() => handleCopyRef(resource.id, resource.reference)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                          title="Copy reference"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        {resource.reference.startsWith('http') && (
                          <a
                            href={resource.reference}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                            title="Open external link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {resource.addedDate}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => deleteResource(resource.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                        title="Delete resource"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredResources.length === 0 && (
            <div className="p-8 text-center bg-white">
              <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">No resources found</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting your search or attach a new resource.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
