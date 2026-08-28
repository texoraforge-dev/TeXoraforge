/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
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
  Download,
  CreditCard,
  Wand2,
  UserPlus,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { useAppStore } from '../storage';
import { Submission, User } from '../types';
import { SubmissionsTrendChart } from './SubmissionsTrendChart';
import { SubjectPerformanceChart } from './SubjectPerformanceChart';
import { downloadAdminReportCSV } from '../lib/reportExporter';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SupabaseService } from '../lib/supabaseService';

interface AdminDashboardProps {
  onNavigate: (view: string, extraId?: string) => void;
  onReviewSubmission: (submission: Submission) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onReviewSubmission
}) => {
  const { school, users, classes, students, submissions, attendance, currentUser, actions } = useAppStore();
  const [authUser, setAuthUser] = useState<any>(null);

  // Fetch current authenticated user via supabase.auth.getUser()
  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setAuthUser(user);
        }
      }).catch(console.warn);
    }
  }, []);

  const isProprietor = currentUser?.role === 'PROPRIETOR';
  const isPrincipal = currentUser?.role === 'PRINCIPAL';
  const isVP = currentUser?.role === 'VICE_PRINCIPAL';
  const isAdmin = currentUser?.role === 'SCHOOL_ADMIN';

  const teachers = users.filter(u => u.role === 'TEACHER');
  const pendingSubmissions = submissions.filter(s => s.status === 'PENDING');
  const approvedCount = submissions.filter(s => s.status === 'APPROVED').length;
  const revisionCount = submissions.filter(s => s.status === 'REVISION_REQUESTED').length;

  // Calculate today or latest average attendance %
  let latestAttendanceRate = 0;
  if (attendance.length > 0) {
    let totalRecords = 0;
    let totalPresent = 0;
    attendance.forEach(att => {
      att.records.forEach(r => {
        totalRecords++;
        if (r.status === 'PRESENT' || r.status === 'LATE') {
          totalPresent++;
        }
      });
    });
    latestAttendanceRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;
  }

  // Handle downloading report CSV
  const handleDownloadCSVReport = () => {
    downloadAdminReportCSV(school, submissions, attendance, users, classes, students);
  };

  return (
    <div className="space-y-6">
      
      {/* Executive Command Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border text-white relative overflow-hidden shadow-2xl transition-all ${
        isProprietor
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/60 border-amber-800/40 ring-1 ring-amber-500/20'
          : isVP
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/60 border-blue-800/40 ring-1 ring-blue-500/20'
          : 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 border-indigo-800/40 ring-1 ring-indigo-500/20'
      }`}>
        {/* Ambient Glows */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-bold mb-3.5 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>
              {isProprietor ? 'Executive Board & Proprietor Oversight' : isVP ? 'Vice Principal & Academic Admissions' : 'Principal & School Command Center'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display text-white">
            {school?.name || 'TeXora Forge Academic Platform'}
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Welcome back, <span className="font-bold text-white">{currentUser?.name || 'Administrator'}</span></span>
            <span className="text-slate-500">•</span>
            <span className="px-2 py-0.5 rounded-md bg-white/10 text-indigo-300 font-mono text-[11px] font-bold">
              {currentUser?.role.replace('_', ' ')}
            </span>
            {school?.motto && (
              <>
                <span className="text-slate-500">•</span>
                <span className="italic text-indigo-200">"{school.motto}"</span>
              </>
            )}
          </p>

          {/* Quick Action Dock */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('ai_studio')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ring-1 ring-white/20"
            >
              <Wand2 className="h-4 w-4 text-amber-300" /> AI Creative & Video Studio
            </button>
            <button
              onClick={() => onNavigate('school_students')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-900/20 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              <Users className="h-4 w-4" /> Student Directory
            </button>
            <button
              onClick={() => onNavigate('students')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <GraduationCap className="h-4 w-4 text-indigo-400" /> Admit Student & IDs
            </button>
            <button
              onClick={() => onNavigate('scores')}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <FileCheck2 className="h-4 w-4" /> Score Approvals
            </button>
            {isProprietor && (
              <button
                onClick={() => onNavigate('accounts')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
              >
                <UserPlus className="h-4 w-4" /> Provision Accounts
              </button>
            )}
            <button
              onClick={() => onNavigate('textbook_library')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <BookOpen className="h-4 w-4" /> Textbook Library
            </button>
            <button
              onClick={() => onNavigate('parent_fees')}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <CreditCard className="h-4 w-4" /> Fees & Finance
            </button>
            <button
              onClick={handleDownloadCSVReport}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ml-auto"
              title="Export complete attendance & submission statistics as CSV"
            >
              <Download className="h-4 w-4" /> Export (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Command Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Faculty Teachers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-lg transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Teachers</p>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800/60 text-purple-600 dark:text-purple-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 font-display tracking-tight">{teachers.length}</p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Faculty Staff Members</span>
            <button onClick={() => onNavigate('teachers')} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              Manage →
            </button>
          </div>
        </div>

        {/* Classes & Student Count */}
        <div
          onClick={() => onNavigate('school_students')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all hover:-translate-y-0.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Class Levels / Pupils</p>
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-800/60 text-sky-600 dark:text-sky-400">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">{classes.length}</p>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Classes ({students.length} Enrolled)</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 group-hover:underline">
              View Student Directory <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div 
          onClick={() => onNavigate('submissions')}
          className={`p-5 rounded-2xl border transition-all hover:-translate-y-0.5 cursor-pointer group ${
            pendingSubmissions.length > 0 
              ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/80 shadow-xs hover:shadow-lg' 
              : 'bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Pending Approvals</p>
            <div className={`p-2.5 rounded-xl text-xs font-extrabold ${
              pendingSubmissions.length > 0
                ? 'bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 animate-pulse'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
            }`}>
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className={`text-3xl font-extrabold mt-3 font-display tracking-tight ${
            pendingSubmissions.length > 0 ? 'text-amber-900 dark:text-amber-200' : 'text-slate-900 dark:text-white'
          }`}>
            {pendingSubmissions.length}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs font-semibold">
            <span className={pendingSubmissions.length > 0 ? 'text-amber-800 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}>
              {pendingSubmissions.length > 0 ? 'Action required in queue' : 'All lesson notes reviewed'}
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:underline">Review →</span>
          </div>
        </div>

        {/* Daily Attendance Rate */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Attendance Rate</p>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400">
              <CalendarCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">{latestAttendanceRate}%</p>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Daily School Average</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:underline">Logs →</span>
          </div>
        </div>

      </div>

      {/* Analytics Trend Visualizations */}
      <SubmissionsTrendChart submissions={submissions} onExportCSV={handleDownloadCSVReport} />

      {/* Subject Academic Performance Chart */}
      <SubjectPerformanceChart submissions={submissions} onNavigate={onNavigate} />

      {/* Two Column Grid: Pending Review Queue + Faculty Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pending Submissions Queue (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Pending Teacher Submissions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Review, approve, or request corrections on lesson notes and weekly diaries</p>
            </div>
            <button
              onClick={() => onNavigate('submissions')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All ({submissions.length}) <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {pendingSubmissions.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">Review Queue Cleared!</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All teacher lesson notes and weekly logs have been reviewed and approved.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        {sub.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{sub.className}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{sub.subject}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{sub.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      By <span className="font-semibold text-slate-700 dark:text-slate-200">{sub.teacherName}</span> • Submitted {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onReviewSubmission(sub)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all cursor-pointer shadow-xs shadow-indigo-600/20"
                    >
                      Inspect & Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Submissions Status Cards */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200">{approvedCount} Approved</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Ready for classroom teaching</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-amber-900 dark:text-amber-200">{revisionCount} In Revision</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">Pending teacher updates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Faculty Snippet (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Teachers Faculty
            </h2>
            <button
              onClick={() => onNavigate('teachers')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Manage
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 divide-y divide-slate-100 dark:divide-slate-700/60 shadow-xs overflow-hidden">
            {teachers.slice(0, 5).map((t) => (
              <div key={t.id} className="p-3.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                <img
                  src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={t.name}
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{t.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {(t.assignedSubjects || []).slice(0, 2).join(', ') || 'General Educator'}
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                  {t.assignedClassIds?.length || 0} Classes
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('teachers')}
            className="w-full py-3 rounded-2xl border border-dashed border-indigo-300 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Teacher to Faculty
          </button>
        </div>

      </div>

    </div>
  );
};

