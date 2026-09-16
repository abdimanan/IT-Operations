import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  Plus, 
  Search, 
  Briefcase, 
  ChevronRight, 
  Calendar, 
  ArrowUpRight,
  ExternalLink,
  Tag
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { CompanyStatusBadge, ProjectStatusBadge } from '../common/StatusBadges';
import { Company, CompanyStatus } from '../../types';

interface CompaniesViewProps {
  onOpenCreateCompany: () => void;
  onOpenProjectDetails: (projectId: string) => void;
  onOpenCreateProjectForCompany: (companyId: string) => void;
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({
  onOpenCreateCompany,
  onOpenProjectDetails,
  onOpenCreateProjectForCompany,
  selectedCompanyId,
  setSelectedCompanyId,
}) => {
  const { companies, projects, tasks, resources, getCompany } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter companies
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedCompany = selectedCompanyId ? getCompany(selectedCompanyId) : null;
  const companyProjects = selectedCompanyId 
    ? projects.filter(p => p.companyId === selectedCompanyId) 
    : [];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Search */}
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies, contacts, industry..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">All Statuses ({companies.length})</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Prospective">Prospective</option>
          </select>
        </div>

        <button
          id="btn-add-company"
          onClick={onOpenCreateCompany}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client Company</span>
        </button>
      </div>

      {/* Main Grid: Companies list + Detail Panel if selected */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Company Cards List */}
        <div className={selectedCompany ? "lg:col-span-6 space-y-3" : "lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
          {filteredCompanies.map((company) => {
            const clientProjects = projects.filter(p => p.companyId === company.id);
            const activeCount = clientProjects.filter(p => p.status === 'Active').length;
            const completedCount = clientProjects.filter(p => p.status === 'Completed').length;
            const isSelected = selectedCompanyId === company.id;

            return (
              <div
                key={company.id}
                id={`company-card-${company.id}`}
                onClick={() => setSelectedCompanyId(isSelected ? null : company.id)}
                className={`bg-white rounded-xl border p-5 transition cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm border border-slate-200">
                        <Building2 className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                          {company.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">{company.industry}</p>
                      </div>
                    </div>
                    <CompanyStatusBadge status={company.status} />
                  </div>

                  {/* Contact info */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 font-medium w-16 text-[11px]">Contact:</span>
                      <span className="text-slate-900 font-medium truncate">{company.contactPerson}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-600 text-[11px]">{company.contactEmail}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-600 text-[11px]">{company.contactPhone}</span>
                    </div>
                  </div>

                  {/* Project preview badges */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Projects ({clientProjects.length})</span>
                      <span className="font-normal text-slate-400">{activeCount} active</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {clientProjects.slice(0, 3).map(p => (
                        <span key={p.id} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium truncate max-w-full">
                          {p.name}
                        </span>
                      ))}
                      {clientProjects.length > 3 && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                          +{clientProjects.length - 3} more
                        </span>
                      )}
                      {clientProjects.length === 0 && (
                        <span className="text-[11px] text-slate-400 italic">No projects yet</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer metrics & click hint */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3 text-[11px]">
                    <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      {activeCount} Active
                    </span>
                    <span className="text-blue-700 font-medium bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                      {completedCount} Completed
                    </span>
                  </div>

                  <span className="inline-flex items-center text-blue-600 font-medium text-xs hover:underline gap-0.5">
                    <span>{isSelected ? 'Viewing' : 'Details'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}

          {filteredCompanies.length === 0 && (
            <div className="col-span-full bg-white rounded-xl border border-slate-200 p-8 text-center">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">No client companies found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or register a new company.</p>
            </div>
          )}
        </div>

        {/* Company Details Side Drawer / Panel */}
        {selectedCompany && (
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-5 self-start sticky top-20">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-slate-900">{selectedCompany.name}</h2>
                  <CompanyStatusBadge status={selectedCompany.status} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{selectedCompany.industry} • Added on {selectedCompany.createdAt}</p>
              </div>
              <button
                onClick={() => setSelectedCompanyId(null)}
                className="text-xs text-slate-400 hover:text-slate-700 p-1"
              >
                Close
              </button>
            </div>

            {/* Contact Details Card */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2 text-xs">
              <div className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Primary Account Contact</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Name</span>
                  <span className="font-medium text-slate-900">{selectedCompany.contactPerson}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Phone</span>
                  <span className="font-medium text-slate-900">{selectedCompany.contactPhone}</span>
                </div>
                <div className="col-span-full">
                  <span className="text-[10px] text-slate-400 block uppercase">Email</span>
                  <span className="font-medium text-slate-900">{selectedCompany.contactEmail}</span>
                </div>
              </div>
              {selectedCompany.notes && (
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block uppercase">Operational Notes</span>
                  <p className="text-slate-600 text-xs italic mt-0.5">{selectedCompany.notes}</p>
                </div>
              )}
            </div>

            {/* Projects for this Company */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Client Projects ({companyProjects.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">Systems & applications delivered for {selectedCompany.name}</p>
                </div>
                <button
                  onClick={() => onOpenCreateProjectForCompany(selectedCompany.id)}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Project</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {companyProjects.map((project) => {
                  const projTasks = tasks.filter(t => t.projectId === project.id);
                  const openCount = projTasks.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled').length;
                  const projResources = resources.filter(r => r.projectId === project.id);

                  return (
                    <div
                      key={project.id}
                      onClick={() => onOpenProjectDetails(project.id)}
                      className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 transition cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs text-slate-900 hover:text-blue-600 truncate">
                            {project.name}
                          </span>
                          <ProjectStatusBadge status={project.status} />
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{project.description}</p>
                        
                        <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono pt-1">
                          <span>Deadline: {project.deadline}</span>
                          <span>•</span>
                          <span>{openCount} open tasks</span>
                          <span>•</span>
                          <span>{projResources.length} resources</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center space-x-2">
                        <div className="text-xs font-mono font-semibold text-slate-700">
                          {project.progress}%
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                      </div>
                    </div>
                  );
                })}

                {companyProjects.length === 0 && (
                  <div className="p-4 rounded-lg bg-slate-50 text-center border border-dashed border-slate-300">
                    <p className="text-xs text-slate-500">No active projects yet for this company.</p>
                    <button
                      onClick={() => onOpenCreateProjectForCompany(selectedCompany.id)}
                      className="mt-2 inline-flex items-center text-xs font-semibold text-blue-600 hover:underline"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Create the first project
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
