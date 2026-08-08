/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Upload,
  Download,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Search,
  BookOpen,
  CalendarCheck2,
  Edit3
} from 'lucide-react';
import { useAppStore } from '../storage';
import { Submission } from '../types';
import { generateSubmissionPDF } from '../lib/pdfGenerator';
import { downloadSubmissionsCSV } from '../lib/reportExporter';

interface TeacherSubmissionsProps {
  onOpenCreateLessonNote: () => void;
  onOpenUploadPdf: () => void;
  onOpenCreateLessonPlan: () => void;
  onOpenCreateWeeklyDiary: () => void;
  onEditSubmission?: (sub: Submission) => void;
}

export const TeacherSubmissions: React.FC<TeacherSubmissionsProps> = ({
  onOpenCreateLessonNote,
  onOpenUploadPdf,
  onOpenCreateLessonPlan,
  onOpenCreateWeeklyDiary,
  onEditSubmission
}) => {
  const { school, currentUser, submissions } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  if (!currentUser) return null;

  const mySubmissions = submissions.filter(s => s.teacherId === currentUser.id);

  const filtered = mySubmissions.filter(sub => {
    if (statusFilter !== 'ALL' && sub.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        sub.title.toLowerCase().includes(q) ||
        sub.className.toLowerCase().includes(q) ||
        sub.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            My Submissions & Academic Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track approvals, review feedback, and edit rejected notes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadSubmissionsCSV(filtered, `${currentUser.name}_submissions`)}
            disabled={filtered.length === 0}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            title="Export currently filtered submission records to CSV"
          >
            <Download className="h-4 w-4" /> Export CSV ({filtered.length})
          </button>
          <button
            onClick={onOpenCreateLessonNote}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Lesson Note
          </button>
          <button
            onClick={onOpenUploadPdf}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="h-4 w-4 text-indigo-400" /> Upload PDF
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search my submissions..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {['ALL', 'PENDING', 'APPROVED', 'REVISION_REQUESTED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {status === 'REVISION_REQUESTED' ? 'Needs Revision' : status}
            </button>
          ))}
        </div>

      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-white">No submissions recorded</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Use the action buttons above to submit your first Lesson Note or Plan.</p>
          </div>
        ) : (
          filtered.map((sub) => (
            <div
              key={sub.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    sub.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    sub.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                    sub.status === 'REVISION_REQUESTED' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                  }`}>
                    {sub.status.replace('_', ' ')}
                  </span>

                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold">
                    {sub.type.replace('_', ' ')}
                  </span>

                  <span className="text-xs font-bold text-slate-900 dark:text-white">{sub.className}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{sub.subject}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateSubmissionPDF(sub, school)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-xs font-semibold flex items-center gap-1"
                  >
                    <Download className="h-3.5 w-3.5" /> PDF
                  </button>

                  {onEditSubmission && (
                    <button
                      onClick={() => onEditSubmission(sub)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">{sub.title}</h3>

              {sub.type === 'WEEKLY_DIARY' && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Subject</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{sub.weeklyDiaryContent?.subject || sub.subject}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Topic</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{sub.weeklyDiaryContent?.topic || sub.weeklyDiaryContent?.topicsCovered?.join(', ') || sub.title}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{sub.weeklyDiaryContent?.date || sub.weeklyDiaryContent?.startDate || new Date(sub.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              {sub.adminFeedback && (
                <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Principal Feedback: </span>
                    <span>"{sub.adminFeedback}"</span>
                  </div>
                </div>
              )}

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <span>Submitted: {new Date(sub.createdAt).toLocaleString()}</span>
                {sub.reviewedAt && <span>Reviewed: {new Date(sub.reviewedAt).toLocaleDateString()}</span>}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
