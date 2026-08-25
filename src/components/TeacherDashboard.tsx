/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CalendarCheck2,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  MessageSquare,
  X,
  Zap,
  CheckSquare,
  Wand2
} from 'lucide-react';
import { useAppStore } from '../storage';
import { Submission } from '../types';

interface TeacherDashboardProps {
  onNavigate: (view: string) => void;
  onOpenCreateLessonNote: () => void;
  onOpenUploadPdf: () => void;
  onOpenCreateLessonPlan: () => void;
  onOpenCreateWeeklyDiary: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onNavigate,
  onOpenCreateLessonNote,
  onOpenUploadPdf,
  onOpenCreateLessonPlan,
  onOpenCreateWeeklyDiary
}) => {
  const { currentUser, classes, submissions } = useAppStore();
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  if (!currentUser || currentUser.role !== 'TEACHER') {
    return <div className="p-8 text-center text-slate-500">Access Restricted to Teacher Accounts</div>;
  }

  const mySubmissions = submissions.filter(s => s.teacherId === currentUser.id);
  const approvedCount = mySubmissions.filter(s => s.status === 'APPROVED').length;
  const pendingCount = mySubmissions.filter(s => s.status === 'PENDING').length;
  const revisionCount = mySubmissions.filter(s => s.status === 'REVISION_REQUESTED').length;

  const assignedClassNames = (currentUser.assignedClassIds || [])
    .map(id => classes.find(c => c.id === id)?.name)
    .filter(Boolean);

  const revisionsNeededList = mySubmissions.filter(s => s.status === 'REVISION_REQUESTED');

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Subject Teacher Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.name}!
          </h1>
          
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">Assigned Classes:</span>
            {assignedClassNames.length === 0 ? (
              <span className="text-xs text-amber-400">None assigned yet</span>
            ) : (
              assignedClassNames.map((c, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-md bg-indigo-500/30 text-indigo-200 text-xs font-bold border border-indigo-400/30">
                  {c}
                </span>
              ))
            )}

            <span className="text-xs text-slate-400 font-bold ml-2">Subjects:</span>
            {(currentUser.assignedSubjects || []).map((s, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700">
                {s}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('ai_studio')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-purple-900/40 transition-all cursor-pointer"
            >
              <Wand2 className="h-4 w-4 text-amber-300" /> AI Creative & Video Studio
            </button>

            <button
              onClick={onOpenCreateLessonNote}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Create Lesson Note
            </button>

            <button
              onClick={onOpenUploadPdf}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="h-4 w-4 text-indigo-400" /> Upload PDF Lesson Note
            </button>

            <button
              onClick={() => onNavigate('textbook_library')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <BookOpen className="h-4 w-4" /> Textbook Library
            </button>
          </div>
        </div>
      </div>

      {/* Scope Isolation Banner */}
      <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-300 text-xs flex items-center gap-2.5">
        <ShieldAlert className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
        <span>
          <strong className="font-bold">Strict Access Control Engaged:</strong> Your view is isolated exclusively to your assigned classes ({assignedClassNames.join(', ') || 'None'}) and subjects ({(currentUser.assignedSubjects || []).join(', ')}).
        </span>
      </div>

      {/* Immediate Revision Required Notice Box */}
      {revisionsNeededList.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Attention: {revisionsNeededList.length} Submission(s) Require Revisions / Corrections</span>
          </div>

          <div className="space-y-2">
            {revisionsNeededList.map((rev) => (
              <div key={rev.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 flex items-start justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{rev.title} ({rev.className} {rev.subject})</p>
                  {rev.adminFeedback && (
                    <div className="mt-1 text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span><strong>Admin Remark:</strong> "{rev.adminFeedback}"</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onNavigate('teacher_submissions')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shrink-0 cursor-pointer"
                >
                  Edit & Resubmit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Approved Notes</p>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">{approvedCount}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">Cleared for teaching</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Review</p>
            <Clock className="h-5 w-5 text-sky-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">{pendingCount}</p>
          <p className="text-xs text-sky-600 dark:text-sky-400 mt-1 font-semibold">Awaiting Principal Review</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Needs Revision</p>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">{revisionCount}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold">Requires your action</p>
        </div>

      </div>

      {/* Quick Action Workflows */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Academic Workflow Submission Launchers
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={onOpenCreateLessonNote}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 cursor-pointer transition-all shadow-xs group"
          >
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 w-fit text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">Structured Lesson Note</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Fill objectives, materials, step-by-step activities & evaluation questions.
            </p>
          </div>

          <div
            onClick={onOpenUploadPdf}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 cursor-pointer transition-all shadow-xs group"
          >
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 w-fit text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">Upload PDF Lesson Note</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Attach external PDF notes directly for Principal approval.
            </p>
          </div>

          <div
            onClick={onOpenCreateLessonPlan}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 cursor-pointer transition-all shadow-xs group"
          >
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 w-fit text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">Submit Lesson Plan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Outline teaching strategies, vocabulary, and differentiation plans.
            </p>
          </div>

          <div
            onClick={onOpenCreateWeeklyDiary}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 cursor-pointer transition-all shadow-xs group"
          >
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 w-fit text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <CalendarCheck2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">Weekly Teaching Diary</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Log topics completed, student comprehension %, and remedial actions.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Quick Actions Speed-Dial Menu */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {/* Backdrop overlay when menu is open */}
        {isQuickMenuOpen && (
          <div
            onClick={() => setIsQuickMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs z-30 animate-in fade-in duration-150"
          />
        )}

        {/* Speed-Dial Menu Options */}
        {isQuickMenuOpen && (
          <div className="relative z-40 mb-3 space-y-2.5 animate-in slide-in-from-bottom-5 zoom-in-95 duration-200">
            
            {/* Create Structured Lesson Note */}
            <button
              onClick={() => {
                setIsQuickMenuOpen(false);
                onOpenCreateLessonNote();
              }}
              className="flex items-center gap-3 p-2.5 pr-4 rounded-2xl bg-indigo-600 text-white shadow-xl hover:bg-indigo-500 transition-all cursor-pointer group text-xs font-bold float-right clear-both"
            >
              <div className="p-2 rounded-xl bg-indigo-700 group-hover:bg-indigo-600 transition-colors">
                <FileText className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p>New Lesson Note</p>
                <p className="text-[10px] text-indigo-200 font-normal">Structured multi-step note</p>
              </div>
            </button>

            {/* Daily / Weekly Teaching Diary Entry */}
            <button
              onClick={() => {
                setIsQuickMenuOpen(false);
                onOpenCreateWeeklyDiary();
              }}
              className="flex items-center gap-3 p-2.5 pr-4 rounded-2xl bg-emerald-600 text-white shadow-xl hover:bg-emerald-500 transition-all cursor-pointer group text-xs font-bold float-right clear-both"
            >
              <div className="p-2 rounded-xl bg-emerald-700 group-hover:bg-emerald-600 transition-colors">
                <CalendarCheck2 className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p>Teaching Diary Entry</p>
                <p className="text-[10px] text-emerald-200 font-normal">Log daily progress & topics</p>
              </div>
            </button>

            {/* Create Lesson Plan */}
            <button
              onClick={() => {
                setIsQuickMenuOpen(false);
                onOpenCreateLessonPlan();
              }}
              className="flex items-center gap-3 p-2.5 pr-4 rounded-2xl bg-purple-600 text-white shadow-xl hover:bg-purple-500 transition-all cursor-pointer group text-xs font-bold float-right clear-both"
            >
              <div className="p-2 rounded-xl bg-purple-700 group-hover:bg-purple-600 transition-colors">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p>Submit Lesson Plan</p>
                <p className="text-[10px] text-purple-200 font-normal">Teaching strategies & aims</p>
              </div>
            </button>

            {/* Upload PDF Lesson Note */}
            <button
              onClick={() => {
                setIsQuickMenuOpen(false);
                onOpenUploadPdf();
              }}
              className="flex items-center gap-3 p-2.5 pr-4 rounded-2xl bg-sky-600 text-white shadow-xl hover:bg-sky-500 transition-all cursor-pointer group text-xs font-bold float-right clear-both"
            >
              <div className="p-2 rounded-xl bg-sky-700 group-hover:bg-sky-600 transition-colors">
                <Upload className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p>Upload PDF Note</p>
                <p className="text-[10px] text-sky-200 font-normal">Direct document attach</p>
              </div>
            </button>

            {/* Mark Class Attendance */}
            <button
              onClick={() => {
                setIsQuickMenuOpen(false);
                onNavigate('attendance');
              }}
              className="flex items-center gap-3 p-2.5 pr-4 rounded-2xl bg-slate-800 dark:bg-slate-700 text-white shadow-xl hover:bg-slate-700 dark:hover:bg-slate-600 transition-all cursor-pointer group text-xs font-bold float-right clear-both"
            >
              <div className="p-2 rounded-xl bg-slate-900 group-hover:bg-slate-800 transition-colors">
                <CheckSquare className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-left">
                <p>Class Register</p>
                <p className="text-[10px] text-slate-300 font-normal">Take instant attendance</p>
              </div>
            </button>

          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button
          onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
          className={`relative z-40 p-4 rounded-full text-white shadow-2xl flex items-center justify-center transition-all transform cursor-pointer ${
            isQuickMenuOpen
              ? 'bg-slate-900 rotate-45 scale-110 ring-4 ring-slate-800'
              : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95 ring-4 ring-indigo-500/30'
          }`}
          title={isQuickMenuOpen ? "Close Quick Actions" : "Open Quick Actions"}
        >
          {isQuickMenuOpen ? (
            <Plus className="h-6 w-6" />
          ) : (
            <div className="flex items-center gap-1.5">
              <Zap className="h-6 w-6 fill-amber-300 text-amber-300 animate-pulse" />
            </div>
          )}
        </button>
      </div>

    </div>
  );
};
