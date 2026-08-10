/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Users,
  GraduationCap,
  FileCheck2,
  CalendarCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Plus,
  BookOpen,
  TrendingUp,
  Sparkles,
  Download
} from 'lucide-react';
import { useAppStore } from '../storage';
import { Submission } from '../types';
import { SubmissionsTrendChart } from './SubmissionsTrendChart';
import { SubjectPerformanceChart } from './SubjectPerformanceChart';
import { downloadAdminReportCSV } from '../lib/reportExporter';

interface AdminDashboardProps {
  onNavigate: (view: string, extraId?: string) => void;
  onReviewSubmission: (submission: Submission) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onReviewSubmission
}) => {
  const { school, users, classes, students, submissions, attendance } = useAppStore();

  const teachers = users.filter(u => u.role === 'TEACHER');
  const pendingSubmissions = submissions.filter(s => s.status === 'PENDING');
  const approvedCount = submissions.filter(s => s.status === 'APPROVED').length;
  const revisionCount = submissions.filter(s => s.status === 'REVISION_REQUESTED').length;

  // Calculate today or latest average attendance %
  let latestAttendanceRate = 95;
  if (attendance.length > 0) {
    const latest = attendance[0];
    const presentCount = latest.records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    latestAttendanceRate = Math.round((presentCount / (latest.records.length || 1)) * 100);
  }

  // Handle downloading report CSV
  const handleDownloadCSVReport = () => {
    downloadAdminReportCSV(school, submissions, attendance, users, classes, students);
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>School Principal & Executive Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {school?.name || 'Academic System'}
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Motto: <span className="italic text-indigo-200">"{school?.motto}"</span> • Academic Term: <span className="font-semibold text-white">{school?.academicSession} ({school?.academicTerm})</span>
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('school_students')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Users className="h-4 w-4" /> View All Students List
            </button>
            <button
              onClick={() => onNavigate('students')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <GraduationCap className="h-4 w-4" /> Admit Student & IDs
            </button>
            <button
              onClick={() => onNavigate('scores')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <FileCheck2 className="h-4 w-4" /> Score Approvals & Reports
            </button>
            <button
              onClick={() => onNavigate('teachers')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Provision Teacher
            </button>
            <button
              onClick={handleDownloadCSVReport}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              title="Export complete attendance & submission statistics as CSV"
            >
              <Download className="h-4 w-4" /> Download Report (CSV)
            </button>
          </div>
        </div>

        {/* Subtle decorative graphic */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block opacity-15 pointer-events-none">
          <BookOpen className="w-56 h-56 text-indigo-300" />
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Teachers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Teachers</p>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">{teachers.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium">
            Active Accounts Provisioned
          </p>
        </div>

        {/* Classes & Student Count */}
        <div
          onClick={() => onNavigate('school_students')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Classes / Students</p>
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{classes.length}</p>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Classes ({students.length} Students)</span>
          </div>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-semibold flex items-center gap-1 group-hover:underline">
            View All Students List <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Pending Approvals */}
        <div className={`p-5 rounded-2xl border transition-all ${
          pendingSubmissions.length > 0 
            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 shadow-xs' 
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Pending Approvals</p>
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-extrabold text-xs">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 dark:text-amber-200 mt-3">{pendingSubmissions.length}</p>
          <p className="text-xs text-amber-800 dark:text-amber-400 mt-1 font-semibold">
            {pendingSubmissions.length > 0 ? 'Requires Principal Attention' : 'All Review Queues Cleared!'}
          </p>
        </div>

        {/* Attendance Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Attendance Rate</p>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{latestAttendanceRate}%</p>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Daily School Average</p>
        </div>

      </div>

      {/* Recharts Submission Approvals & Rejections Trend Card */}
      <SubmissionsTrendChart submissions={submissions} onExportCSV={handleDownloadCSVReport} />

      {/* Recharts Subject Performance & Quality Scores Card */}
      <SubjectPerformanceChart submissions={submissions} onNavigate={onNavigate} />

      {/* Main Two Column Area: Pending Submissions Queue + Teacher Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pending Submissions Queue (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Pending Teacher Submissions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Review, approve, or request corrections on lesson notes and plans</p>
            </div>
            <button
              onClick={() => onNavigate('submissions')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View All Submissions ({submissions.length}) <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {pendingSubmissions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-white">Review Queue Empty!</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All teacher lesson notes and weekly logs have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {sub.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{sub.className}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{sub.subject}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{sub.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      By <span className="font-semibold text-slate-700 dark:text-slate-200">{sub.teacherName}</span> • Submitted {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onReviewSubmission(sub)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      Inspect & Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Stats on Submissions History */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">{approvedCount} Approved</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Ready for classroom teaching</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">{revisionCount} In Revision</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">Pending teacher updates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Roster Snippet (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Teachers Overview
            </h2>
            <button
              onClick={() => onNavigate('teachers')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700/60">
            {teachers.map((t) => (
              <div key={t.id} className="p-3.5 flex items-center gap-3">
                <img
                  src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={t.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{t.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {t.assignedSubjects.slice(0, 2).join(', ')}
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                  {t.assignedClassIds.length} Classes
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('teachers')}
            className="w-full py-2.5 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Teacher Account
          </button>
        </div>

      </div>

    </div>
  );
};
