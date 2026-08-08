/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Download,
  MessageSquare,
  Search,
  Filter,
  X,
  FileText,
  UserCheck,
  Edit2
} from 'lucide-react';
import { useAppStore } from '../storage';
import { Submission, SubmissionStatus } from '../types';
import { generateSubmissionPDF } from '../lib/pdfGenerator';
import { downloadSubmissionsCSV } from '../lib/reportExporter';

interface SubmissionsReviewProps {
  selectedSubmissionForReview?: Submission | null;
  onClearSelectedSubmission?: () => void;
}

export const SubmissionsReview: React.FC<SubmissionsReviewProps> = ({
  selectedSubmissionForReview,
  onClearSelectedSubmission
}) => {
  const { school, currentUser, submissions, actions } = useAppStore();

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REVISION_REQUESTED'>('PENDING');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeInspectionSub, setActiveInspectionSub] = useState<Submission | null>(
    selectedSubmissionForReview || null
  );

  const [adminFeedback, setAdminFeedback] = useState(selectedSubmissionForReview?.adminFeedback || '');

  // Keep activeInspectionSub in sync when prop changes
  useEffect(() => {
    if (selectedSubmissionForReview) {
      setActiveInspectionSub(selectedSubmissionForReview);
      setAdminFeedback(selectedSubmissionForReview.adminFeedback || '');
      setActiveTab('ALL');
    }
  }, [selectedSubmissionForReview]);

  const filteredSubmissions = submissions.filter(sub => {
    if (activeTab === 'PENDING' && sub.status !== 'PENDING') return false;
    if (activeTab === 'APPROVED' && sub.status !== 'APPROVED') return false;
    if (activeTab === 'REVISION_REQUESTED' && sub.status !== 'REVISION_REQUESTED') return false;
    if (typeFilter !== 'ALL' && sub.type !== typeFilter) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        sub.title.toLowerCase().includes(q) ||
        sub.teacherName.toLowerCase().includes(q) ||
        sub.className.toLowerCase().includes(q) ||
        sub.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleReviewAction = (status: SubmissionStatus) => {
    if (!activeInspectionSub || !currentUser) return;

    actions.reviewSubmission(activeInspectionSub.id, status, adminFeedback, currentUser);
    setActiveInspectionSub(null);
    if (onClearSelectedSubmission) onClearSelectedSubmission();
  };

  const openInspection = (sub: Submission) => {
    setActiveInspectionSub(sub);
    setAdminFeedback(sub.adminFeedback || '');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileCheck2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Academic Submissions & Approval Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Review, approve, or request revisions on teacher Lesson Notes, Plans, and Diaries.
          </p>
        </div>

        <div>
          <button
            onClick={() => downloadSubmissionsCSV(filteredSubmissions, 'academic_submissions_review')}
            disabled={filteredSubmissions.length === 0}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            title="Export currently filtered submission records to CSV"
          >
            <Download className="h-4 w-4" /> Download CSV ({filteredSubmissions.length})
          </button>
        </div>
      </div>

      {/* Filter Tabs & Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
          
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            {(['PENDING', 'APPROVED', 'REVISION_REQUESTED', 'ALL'] as const).map((tab) => {
              const count = submissions.filter(s => tab === 'ALL' ? true : s.status === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {tab === 'PENDING' ? 'Pending Review' : tab === 'REVISION_REQUESTED' ? 'Needs Revision' : tab} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
            >
              <option value="ALL">All Submission Types</option>
              <option value="LESSON_NOTE">Lesson Notes Only</option>
              <option value="LESSON_PLAN">Lesson Plans Only</option>
              <option value="WEEKLY_DIARY">Weekly Diaries Only</option>
            </select>
          </div>

        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by topic, teacher name, class, or subject..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-white">No submissions found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">There are no records matching your active filters.</p>
          </div>
        ) : (
          filteredSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
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

                <h3 className="text-base font-bold text-slate-900 dark:text-white">{sub.title}</h3>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  By <span className="font-semibold text-slate-800 dark:text-slate-200">{sub.teacherName}</span> • Submitted: {new Date(sub.createdAt).toLocaleDateString()}
                </p>

                {sub.adminFeedback && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Admin Feedback: </span>
                      <span>{sub.adminFeedback}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => generateSubmissionPDF(sub, school)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  title="Download PDF Lesson Note"
                >
                  <Download className="h-4 w-4" />
                </button>

                <button
                  onClick={() => openInspection(sub)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  Inspect & Review
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Inspection & Review Modal */}
      {activeInspectionSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  {activeInspectionSub.type.replace('_', ' ')}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {activeInspectionSub.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Teacher: <span className="font-bold text-slate-700 dark:text-slate-200">{activeInspectionSub.teacherName}</span> • Class: <span className="font-bold">{activeInspectionSub.className}</span> • Subject: <span className="font-bold">{activeInspectionSub.subject}</span>
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveInspectionSub(null);
                  if (onClearSelectedSubmission) onClearSelectedSubmission();
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Document Content Sections */}
            {/* 1. LESSON NOTE CONTENT */}
            {(activeInspectionSub.type === 'LESSON_NOTE' || activeInspectionSub.lessonNoteContent) && (
              <div className="space-y-4 text-xs text-slate-800 dark:text-slate-200">
                {activeInspectionSub.lessonNoteContent ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold">
                      <div><span className="text-[10px] text-slate-400 block uppercase">Week</span><span className="text-indigo-600 dark:text-indigo-400 font-extrabold">Week {activeInspectionSub.lessonNoteContent.weekNumber || 1}</span></div>
                      <div><span className="text-[10px] text-slate-400 block uppercase">Duration</span><span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{activeInspectionSub.lessonNoteContent.durationMinutes || 80} Mins</span></div>
                      <div><span className="text-[10px] text-slate-400 block uppercase">Topic</span><span className="font-bold">{activeInspectionSub.lessonNoteContent.topic || activeInspectionSub.title}</span></div>
                      <div><span className="text-[10px] text-slate-400 block uppercase">Sub-Topic</span><span className="font-bold">{activeInspectionSub.lessonNoteContent.subTopic || 'N/A'}</span></div>
                    </div>

                    {/* Objectives */}
                    {activeInspectionSub.lessonNoteContent.behavioralObjectives?.length > 0 && (
                      <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-1.5">
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-200 uppercase text-[10px] tracking-wider">Behavioral Objectives</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {activeInspectionSub.lessonNoteContent.behavioralObjectives.map((obj, i) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Instructional Materials */}
                    {activeInspectionSub.lessonNoteContent.instructionalMaterials?.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold uppercase text-[10px] text-slate-500 mb-1">Instructional Materials / Teaching Aids</h4>
                        <p>{activeInspectionSub.lessonNoteContent.instructionalMaterials.join(', ')}</p>
                      </div>
                    )}

                    {/* Presentation Steps */}
                    {activeInspectionSub.lessonNoteContent.coreContentSteps?.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-bold uppercase text-[10px] text-slate-500">Presentation Steps & Activities</h4>
                        {activeInspectionSub.lessonNoteContent.coreContentSteps.map((step, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                            <p className="font-bold text-slate-900 dark:text-white">{step.title}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Teacher Activity</p>
                                <p className="mt-0.5">{step.teacherActivity}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Student Activity</p>
                                <p className="mt-0.5">{step.studentActivity}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Evaluation & Assignment */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeInspectionSub.lessonNoteContent.evaluationQuestions?.length > 0 && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          <h4 className="font-bold uppercase text-[10px] text-slate-500 mb-1">Evaluation Questions</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {activeInspectionSub.lessonNoteContent.evaluationQuestions.map((q, i) => (
                              <li key={i}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {activeInspectionSub.lessonNoteContent.assignment && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          <h4 className="font-bold uppercase text-[10px] text-slate-500 mb-1">Assignment / Homework</h4>
                          <p>{activeInspectionSub.lessonNoteContent.assignment}</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{activeInspectionSub.title}</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Class: {activeInspectionSub.className} • Subject: {activeInspectionSub.subject}</p>
                  </div>
                )}
              </div>
            )}

            {/* 2. LESSON PLAN CONTENT */}
            {(activeInspectionSub.type === 'LESSON_PLAN' || activeInspectionSub.lessonPlanContent) && !activeInspectionSub.lessonNoteContent && (
              <div className="space-y-4 text-xs text-slate-800 dark:text-slate-200">
                <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold">
                  <div>Week Number: <span className="text-indigo-600 dark:text-indigo-400">Week {activeInspectionSub.lessonPlanContent?.weekNumber || 1}</span></div>
                  <div>Topic: <span className="font-bold">{activeInspectionSub.lessonPlanContent?.topic || activeInspectionSub.title}</span></div>
                </div>

                {activeInspectionSub.lessonPlanContent?.learningObjectives && activeInspectionSub.lessonPlanContent.learningObjectives.length > 0 && (
                  <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-1.5">
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-200 uppercase text-[10px] tracking-wider">Learning Objectives</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {activeInspectionSub.lessonPlanContent.learningObjectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeInspectionSub.lessonPlanContent?.teachingStrategies && activeInspectionSub.lessonPlanContent.teachingStrategies.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold uppercase text-[10px] text-slate-500 mb-1">Teaching Strategies</h4>
                    <p>{activeInspectionSub.lessonPlanContent.teachingStrategies.join(', ')}</p>
                  </div>
                )}

                {activeInspectionSub.lessonPlanContent?.differentiationPlan && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold uppercase text-[10px] text-slate-500 mb-1">Differentiation Plan</h4>
                    <p>{activeInspectionSub.lessonPlanContent.differentiationPlan}</p>
                  </div>
                )}

                {activeInspectionSub.lessonPlanContent?.vocabulary && activeInspectionSub.lessonPlanContent.vocabulary.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold uppercase text-[10px] text-slate-500 mb-1">Key Vocabulary</h4>
                    <p>{activeInspectionSub.lessonPlanContent.vocabulary.join(', ')}</p>
                  </div>
                )}
              </div>
            )}

            {/* 3. WEEKLY DIARY CONTENT */}
            {activeInspectionSub.type === 'WEEKLY_DIARY' && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-600 dark:text-slate-300 uppercase text-[11px] tracking-wider">
                    Weekly Teaching Diary Entry
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px]">
                    Subject, Topic & Date Log
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Subject</p>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                      {activeInspectionSub.weeklyDiaryContent?.subject || activeInspectionSub.subject}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs sm:col-span-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Topic</p>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                      {activeInspectionSub.weeklyDiaryContent?.topic || activeInspectionSub.weeklyDiaryContent?.topicsCovered?.join(', ') || activeInspectionSub.title}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Date</p>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                      {activeInspectionSub.weeklyDiaryContent?.date || activeInspectionSub.weeklyDiaryContent?.startDate || new Date(activeInspectionSub.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. PDF ATTACHMENT CARD */}
            {activeInspectionSub.pdfAttachment && (
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{activeInspectionSub.pdfAttachment.fileName}</p>
                      <p className="text-xs text-slate-400">{activeInspectionSub.pdfAttachment.fileSize} • PDF Document Attachment</p>
                    </div>
                  </div>

                  {activeInspectionSub.pdfAttachment.dataUrl && (
                    <a
                      href={activeInspectionSub.pdfAttachment.dataUrl}
                      download={activeInspectionSub.pdfAttachment.fileName}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <Download className="h-4 w-4" /> Download PDF
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Admin Feedback Input Area */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
              <label className="block text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-indigo-400" />
                Principal / Admin Feedback Notes to Teacher
              </label>
              <textarea
                rows={3}
                value={adminFeedback}
                onChange={e => setAdminFeedback(e.target.value)}
                placeholder="Enter approval comments or specific revision instructions for the teacher..."
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => generateSubmissionPDF(activeInspectionSub, school)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2"
              >
                <Download className="h-4 w-4" /> Download Official PDF
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReviewAction('REVISION_REQUESTED')}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <AlertTriangle className="h-4 w-4" /> Request Revision
                </button>

                <button
                  onClick={() => handleReviewAction('APPROVED')}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve Lesson Note
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
