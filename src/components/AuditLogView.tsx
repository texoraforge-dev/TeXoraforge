/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Users,
  FileCheck2,
  GraduationCap,
  Settings,
  Calendar,
  Download,
  CheckCircle2,
  Activity,
  Layers
} from 'lucide-react';
import { useAppStore } from '../storage';
import { AuditLogEntry, UserRole } from '../types';
import { getRoleBadgeInfo } from '../lib/permissions';

export const AuditLogView: React.FC = () => {
  const { auditLogs, currentUser } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');

  // Filter audit log entries
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || log.userRole === roleFilter;
    const matchesModule = moduleFilter === 'ALL' || log.module === moduleFilter;

    return matchesSearch && matchesRole && matchesModule;
  });

  // Export audit logs as CSV
  const handleExportCSV = () => {
    const headers = ['Log ID', 'User', 'Role', 'Action', 'Module', 'Details', 'Date & Time'];
    const rows = filteredLogs.map(l => [
      l.id,
      `"${l.userName}"`,
      l.userRole,
      `"${l.action}"`,
      l.module,
      `"${l.details.replace(/"/g, '""')}"`,
      new Date(l.createdAt).toLocaleString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span>Executive Oversight & System Audit Log</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Administrative Activity & Audit Log</h1>
          <p className="text-sm text-slate-300">
            Real-time tracking of all administrative decisions, admissions, score approvals, user modifications, and system events.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <Download className="h-4 w-4" /> Export CSV Audit Trail
        </button>
      </div>

      {/* Log Feed & Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 transition-colors">
        
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter actions, administrator name, or details..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400 hidden sm:inline" />
            
            {/* Filter by Role */}
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">All Administrator Roles</option>
              <option value="PROPRIETOR">Proprietor</option>
              <option value="VICE_PRINCIPAL">Vice Principal</option>
              <option value="SCHOOL_ADMIN">School Admin</option>
              <option value="TEACHER">Teacher</option>
            </select>

            {/* Filter by Module */}
            <select
              value={moduleFilter}
              onChange={e => setModuleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">All Modules</option>
              <option value="ADMISSIONS">Admissions</option>
              <option value="CLASSES">Class Assignments</option>
              <option value="LESSON_NOTES">Lesson Notes & Submissions</option>
              <option value="EXAMINATIONS">Examinations & Scores</option>
              <option value="USER_MANAGEMENT">User & Permissions</option>
              <option value="SETTINGS">School Settings</option>
            </select>
          </div>
        </div>

        {/* Audit Trail List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-bold">Timestamp</th>
                <th className="py-3 px-4 font-bold">Administrator</th>
                <th className="py-3 px-4 font-bold">Action</th>
                <th className="py-3 px-4 font-bold">Module</th>
                <th className="py-3 px-4 font-bold">Action Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">No audit log entries match your filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const roleBadge = getRoleBadgeInfo(log.userRole);
                  const dateObj = new Date(log.createdAt);

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 shrink-0 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{dateObj.toLocaleDateString()}</span>
                          <span className="text-slate-400">• {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{log.userName}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${roleBadge.bgClass} ${roleBadge.textClass} ${roleBadge.borderClass}`}>
                            {roleBadge.label}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {log.action}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {log.module.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-md">
                        <p className="line-clamp-2">{log.details}</p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
