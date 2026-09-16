import React, { useState } from 'react';
import { 
  Settings, 
  Tag, 
  AlertOctagon, 
  Users, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Shield,
  Briefcase,
  Layers,
  Code2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { TaskTypeBadge, TaskLevelBadge } from '../common/StatusBadges';
import { DepartmentAssignee } from '../../types';

interface SettingsViewProps {
  currentSubTab: 'types' | 'levels' | 'assignees';
  setCurrentSubTab: (subTab: 'types' | 'levels' | 'assignees') => void;
  onOpenAddStaff: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentSubTab,
  setCurrentSubTab,
  onOpenAddStaff,
}) => {
  const { 
    taskTypes, 
    taskLevels, 
    staff, 
    tasks, 
    toggleStaffStatus, 
    getStaffAssignedTasksCount,
    resetToSampleData 
  } = useData();

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Subtab Navigation Pill Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1">
          <button
            id="tab-task-types"
            onClick={() => setCurrentSubTab('types')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              currentSubTab === 'types'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Task Types ({taskTypes.length})</span>
          </button>

          <button
            id="tab-task-levels"
            onClick={() => setCurrentSubTab('levels')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              currentSubTab === 'levels'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Task Levels ({taskLevels.length})</span>
          </button>

          <button
            id="tab-department-assignees"
            onClick={() => setCurrentSubTab('assignees')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              currentSubTab === 'assignees'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Department Assignees ({staff.length})</span>
          </button>
        </div>

        {/* Prototype Reset */}
        <div>
          {confirmResetOpen ? (
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-rose-600 font-medium">Reset sample data?</span>
              <button
                onClick={() => {
                  resetToSampleData();
                  setConfirmResetOpen(false);
                }}
                className="px-2 py-1 bg-rose-600 text-white text-[11px] font-semibold rounded hover:bg-rose-700"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="px-2 py-1 bg-slate-100 text-slate-600 text-[11px] rounded hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmResetOpen(true)}
              className="inline-flex items-center space-x-1 text-slate-500 hover:text-slate-800 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
              title="Re-seed prototype data"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Reset Prototype Data</span>
            </button>
          )}
        </div>
      </div>

      {/* SUBTAB 1: TASK TYPES */}
      {currentSubTab === 'types' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Task Types</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configured task categories utilized by the IT department to classify software development and engineering work.
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {taskTypes.map((typeConfig) => {
              const taskCount = tasks.filter(t => t.taskType === typeConfig.name).length;

              return (
                <div key={typeConfig.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <TaskTypeBadge type={typeConfig.name} />
                    </div>
                    <p className="text-xs text-slate-600">{typeConfig.description}</p>
                  </div>

                  <div className="flex items-center space-x-3 text-xs shrink-0">
                    <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                      {taskCount} task{taskCount === 1 ? '' : 's'} assigned
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 text-[10px] font-semibold uppercase px-2 py-0.5 rounded border border-emerald-200">
                      Standard Type
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: TASK LEVELS */}
      {currentSubTab === 'levels' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Task Priority Levels</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Severity and SLA prioritization levels applied across all client projects.
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {taskLevels.map((lvl) => {
              const activeCount = tasks.filter(t => t.taskLevel === lvl.level && t.status !== 'Completed').length;

              return (
                <div key={lvl.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <TaskLevelBadge level={lvl.level} />
                    </div>
                    <p className="text-xs text-slate-600">{lvl.description}</p>
                  </div>

                  <div className="flex items-center space-x-3 text-xs shrink-0">
                    <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                      {activeCount} active task{activeCount === 1 ? '' : 's'}
                    </span>
                    <span className="text-slate-600 bg-slate-50 text-[10px] font-semibold uppercase px-2 py-0.5 rounded border border-slate-200">
                      Active SLA
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: DEPARTMENT ASSIGNEES */}
      {currentSubTab === 'assignees' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Assignees (IT Staff)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Internal engineers, architects, DevOps specialists, and QA analysts responsible for client delivery.
              </p>
            </div>

            <button
              id="btn-add-staff"
              onClick={onOpenAddStaff}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-2xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add IT Staff Member</span>
            </button>
          </div>

          <div className="px-5 pb-5 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Staff Member</th>
                  <th className="px-4 py-2.5">Role</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-center">Assigned Open Tasks</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {staff.map((member) => {
                  const assignedCount = getStaffAssignedTasksCount(member.id);
                  const isActive = member.status === 'Active';

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${member.colorScheme}`}>
                            {member.avatarInitials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{member.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {member.role}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                          isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {member.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-xs font-semibold ${
                          assignedCount > 3 ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          assignedCount > 0 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {assignedCount} tasks
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => toggleStaffStatus(member.id)}
                          className="text-xs font-semibold text-slate-600 hover:text-blue-600 underline"
                        >
                          Mark as {isActive ? 'Inactive' : 'Active'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
