/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  UserCheck,
  Award,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  TrendingUp,
  Download,
  Key,
  ChevronRight,
  ShieldCheck,
  User,
  Plus,
  Sparkles,
  Brain,
  MessageSquare,
  HelpCircle,
  Loader2,
  Send,
  Laptop,
  AlertTriangle,
  FolderLock
} from 'lucide-react';
import { useAppStore } from '../storage';
import { Student, StudentReportCard } from '../types';
import { generateReportCardPDF, generatePromotionCertificatePDF } from '../lib/pdfGenerator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ParentPortalProps {
  initialTab?: string;
  onNavigate?: (view: string) => void;
}

export function ParentPortal({ initialTab, onNavigate }: ParentPortalProps) {
  const { currentUser, students, classes, homework, school, actions, cbtExams, remedialPackages, schoolDocuments } = useAppStore();

  const [linkAccessCodeInput, setLinkAccessCodeInput] = useState('');
  const [linkStatusMsg, setLinkStatusMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Parent's linked students
  const parentAccessCodes = currentUser?.linkedStudentAccessCodes || [];
  const linkedStudents = students.filter(s => parentAccessCodes.includes(s.accessCode));

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    linkedStudents[0]?.id || students[0]?.id || ''
  );

  const activeStudent = students.find(s => s.id === selectedStudentId) || linkedStudents[0] || students[0];
  const activeClass = classes.find(c => c.id === activeStudent?.classId);

  // Compute live report card for active student
  const reportCard: StudentReportCard | null = activeStudent ? actions.computeReportCard(activeStudent.id) : null;
  const activeHomework = activeStudent ? homework.filter(h => h.classId === activeStudent.classId) : [];
  const activeTimetable = activeStudent ? actions.getTimetableForClass(activeStudent.classId) : null;

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REPORT_CARD' | 'SCORES' | 'HOMEWORK' | 'ATTENDANCE' | 'TIMETABLE' | 'AI_ASSISTANT'>(
    (initialTab as any) || 'AI_ASSISTANT'
  );

  // AI Parent Assistant State
  const [aiSubject, setAiSubject] = useState<string>('Mathematics');
  const [aiTopic, setAiTopic] = useState<string>('Quadratic Equations & Homework Guidance');
  const [aiMode, setAiMode] = useState<'EXPLAIN' | 'QUIZ' | 'REAL_WORLD'>('EXPLAIN');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  const handleAskAITutor = async () => {
    setIsAiThinking(true);
    setAiResponse(null);
    try {
      const response = await fetch('/api/ai/suggest-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: activeClass?.name || 'SS 3',
          subject: aiSubject,
          topic: aiTopic,
          subTopic: `Parent Homework Assistant Mode: ${aiMode}`,
          prompt: `You are TeXora AI Parent Assistant. A parent is asking for help to guide their child in ${aiSubject} on topic "${aiTopic}". Mode: ${aiMode}. Provide clear, friendly, step-by-step explanation or practice questions with answers.`
        })
      });

      const data = await response.json();
      const resText = data.suggestions?.summary || data.data?.summary || `Here is guidance for ${aiTopic} in ${aiSubject}:\n\n1. Break the problem into small, manageable parts.\n2. Practice with 2-3 similar examples.\n3. Verify the final answer step by step.`;
      setAiResponse(resText);
    } catch (err) {
      setAiResponse('TeXora AI Tutor encountered a network issue. Please retry.');
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleLinkChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkAccessCodeInput.trim() || !currentUser) return;

    const res = actions.linkStudentToParent(currentUser.id, linkAccessCodeInput.trim());
    setLinkStatusMsg({ success: res.success, text: res.message });
    if (res.success && res.student) {
      setSelectedStudentId(res.student.id);
      setLinkAccessCodeInput('');
    }
  };

  const handleDownloadPDF = () => {
    if (reportCard) {
      generateReportCardPDF(reportCard, school);
    } else {
      alert('Report card not generated yet.');
    }
  };

  const handleDownloadPromotionCert = () => {
    if (!activeStudent) return;
    const latestProm = activeStudent.promotionHistory?.[0];
    const fromCls = classes.find(c => c.id === latestProm?.fromClassId) || activeClass;
    const toCls = classes.find(c => c.id === (latestProm?.toClassId || activeStudent.classId));
    generatePromotionCertificatePDF(
      activeStudent,
      fromCls,
      toCls,
      school,
      latestProm?.academicSession || '2026/2027',
      activeStudent.promotionStatus || 'PROMOTED',
      latestProm?.remarks || 'Officially transitioned to the next academic level.'
    );
  };

  // Prepare chart data for subject performance
  const chartData = (reportCard?.subjectScores || []).map(s => ({
    subject: s.subject.length > 12 ? s.subject.substring(0, 12) + '...' : s.subject,
    score: s.total,
    grade: s.grade
  }));

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10">
          <ShieldCheck className="w-64 h-64 text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OFFICIAL PARENT PORTAL (READ ONLY)</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {currentUser?.name || 'Parent / Guardian'}
            </h2>
            <p className="text-sm text-indigo-200 max-w-xl">
              Monitor your child’s live academic continuous assessments, report cards, attendance records, homework assignments, and teacher notes in real-time.
            </p>
          </div>

          {/* Child Selector & Link Form */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 max-w-sm w-full space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-200">
              <span>Select Child Profile:</span>
              <span>{linkedStudents.length} Linked</span>
            </div>

            {linkedStudents.length > 0 ? (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900/90 text-white border border-indigo-400/40 text-xs font-bold focus:ring-2 focus:ring-indigo-400 outline-none"
              >
                {linkedStudents.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.admissionNo})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-amber-300">
                No child linked yet. Enter the Parent Access Code from your child’s admission letter below.
              </p>
            )}

            {/* Quick Link Form */}
            <form onSubmit={handleLinkChild} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Access Code (e.g. PAR-2026-1049)"
                value={linkAccessCodeInput}
                onChange={(e) => setLinkAccessCodeInput(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900/80 text-white border border-slate-700 text-xs font-mono focus:ring-2 focus:ring-indigo-400 outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
              >
                Link
              </button>
            </form>

            {linkStatusMsg && (
              <p className={`text-[11px] font-medium ${linkStatusMsg.success ? 'text-emerald-300' : 'text-rose-300'}`}>
                {linkStatusMsg.text}
              </p>
            )}
          </div>
        </div>
      </div>

      {activeStudent && (
        <>
          {/* Student Profile Card Header */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={activeStudent.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={activeStudent.fullName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                  ENROLLED
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{activeStudent.fullName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Admission No: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeStudent.admissionNo}</span>
                  {' • '} Class: <span className="font-bold text-indigo-600 dark:text-indigo-400">{activeClass?.name} {activeClass?.arm}</span>
                </p>
                <div className="flex items-center space-x-2 mt-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    {activeStudent.gender}
                  </span>
                  <span>Parent Code: <strong className="font-mono text-emerald-600">{activeStudent.accessCode}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 w-full md:w-auto text-center border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
              <div className="p-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Terminal Avg</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{reportCard?.averageScore || 0}%</span>
              </div>
              <div className="p-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Class Rank</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">#{reportCard?.positionInClass || 1}</span>
              </div>
              <div className="p-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Attendance</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {reportCard ? Math.round((reportCard.attendanceSummary.daysPresent / reportCard.attendanceSummary.totalDays) * 100) : 95}%
                </span>
              </div>
            </div>
          </div>

          {/* Academic Promotion & Transition Status Banner */}
          <div className="bg-gradient-to-r from-emerald-900/90 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-emerald-500/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                    ACADEMIC TRANSITION
                  </span>
                  <span className="text-xs font-bold text-emerald-300">
                    Status: {activeStudent.promotionStatus || 'PROMOTED'}
                  </span>
                </div>
                <h4 className="text-base font-extrabold mt-0.5">
                  {activeStudent.fullName} is Enrolled in {activeClass?.name} {activeClass?.arm ? `(${activeClass.arm})` : ''}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  {activeStudent.promotionHistory && activeStudent.promotionHistory.length > 0
                    ? `Transition Record: Promoted from ${activeStudent.promotionHistory[0].fromClassName} to ${activeStudent.promotionHistory[0].toClassName} (${activeStudent.promotionHistory[0].academicSession})`
                    : `Active academic status verified for session ${school?.academicSession || '2025/2026'}.`}
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadPromotionCert}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md flex items-center space-x-2 transition-all cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Promotion Certificate</span>
            </button>
          </div>
        </>
      )}

      {/* Navigation Tabs */}
          <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
            {[
              { id: 'AI_ASSISTANT', label: 'AI Parent & Tutor Assistant', icon: Sparkles },
              { id: 'OVERVIEW', label: 'Overview & Charts', icon: TrendingUp },
              { id: 'REPORT_CARD', label: 'Terminal Report Card', icon: Award },
              { id: 'SCORES', label: 'Assessment Breakdowns', icon: BookOpen },
              { id: 'HOMEWORK', label: 'Homework & Tasks', icon: FileText },
              { id: 'TIMETABLE', label: 'Class Timetable', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Overview & Analytics */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Performance Bar Chart */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
                  Subject Score Distribution
                </h3>
                {chartData.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            color: '#fff'
                          }}
                        />
                        <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.score >= 70 ? '#10b981' : entry.score >= 50 ? '#6366f1' : '#f59e0b'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 py-8 text-center">
                    No approved subject scores uploaded for this term yet.
                  </p>
                )}
              </div>

              {/* Remarks Summary */}
              {reportCard && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-xs uppercase tracking-wider mb-2">
                      Class Teacher Remarks
                    </h4>
                    <p className="text-sm text-slate-800 dark:text-slate-200 italic">
                      "{reportCard.teacherRemarks}"
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
                    <h4 className="font-bold text-purple-900 dark:text-purple-300 text-xs uppercase tracking-wider mb-2">
                      Principal Remarks
                    </h4>
                    <p className="text-sm text-slate-800 dark:text-slate-200 italic">
                      "{reportCard.principalRemarks}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Terminal Report Card */}
          {activeTab === 'REPORT_CARD' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Official Terminal Report Card ({reportCard?.academicTerm || 'First Term'})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verified and issued by {school?.name || 'School Principal'}
                  </p>
                </div>

                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-lg shadow-indigo-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report Card PDF</span>
                </button>
              </div>

              {reportCard && reportCard.subjectScores.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-3 text-center">Ass (10)</th>
                        <th className="py-3 px-3 text-center">CW (10)</th>
                        <th className="py-3 px-3 text-center">Prj (10)</th>
                        <th className="py-3 px-3 text-center">Test (20)</th>
                        <th className="py-3 px-3 text-center">Exam (50)</th>
                        <th className="py-3 px-3 text-center">Total</th>
                        <th className="py-3 px-3 text-center">Grade</th>
                        <th className="py-3 px-4">Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                      {(reportCard?.subjectScores || []).map((s) => (
                        <tr key={s.subject} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{s.subject}</td>
                          <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">{s.assignment}</td>
                          <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">{s.classwork}</td>
                          <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">{s.project}</td>
                          <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">{s.test}</td>
                          <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">{s.exam}</td>
                          <td className="py-3 px-3 text-center font-extrabold text-slate-900 dark:text-white">{s.total}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded font-black ${
                              s.grade === 'A' || s.grade === 'B'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {s.grade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400 italic">{s.teacherRemark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  Scores for this term are currently being evaluated and will appear once approved by the academic board.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Continuous Assessment Breakdowns */}
          {activeTab === 'SCORES' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Real-Time Assessment Records
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(reportCard?.subjectScores || []).map(s => (
                  <div key={s.subject} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{s.subject}</span>
                      <span className="font-extrabold text-indigo-600 text-sm">{s.total}/100 ({s.grade})</span>
                    </div>
                    <div className="grid grid-cols-5 text-center text-[11px] pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 block">Ass</span>
                        <span className="font-bold">{s.assignment}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">CW</span>
                        <span className="font-bold">{s.classwork}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Prj</span>
                        <span className="font-bold">{s.project}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Test</span>
                        <span className="font-bold">{s.test}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Exam</span>
                        <span className="font-bold">{s.exam}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Homework & Projects */}
          {activeTab === 'HOMEWORK' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Assigned Homework & Class Projects ({activeHomework.length})
              </h3>
              {activeHomework.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">No active homework posted for this class.</p>
              ) : (
                <div className="space-y-3">
                  {activeHomework.map(hw => (
                    <div key={hw.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{hw.subject}</span>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{hw.title}</h4>
                        </div>
                        <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-semibold">
                          Due: {hw.dueDate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{hw.description}</p>
                      <p className="text-[11px] text-slate-400">Assigned by: {hw.teacherName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: AI Parent & Student Assistant */}
          {activeTab === 'AI_ASSISTANT' && (
            <div className="space-y-6">
              {/* AI Banner */}
              <div className="bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 text-white p-6 rounded-2xl border border-indigo-500/30 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 text-indigo-300">
                      <Sparkles className="w-7 h-7 animate-pulse text-indigo-300" />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-extrabold uppercase tracking-widest border border-indigo-400/20">
                        GEMINI 3.6 FLASH POWERED
                      </span>
                      <h3 className="text-xl font-black mt-1">TeXora AI Parent & Homework Assistant</h3>
                      <p className="text-xs text-indigo-200">
                        Instant step-by-step guidance for homework, CBT practice tests, and school documents.
                      </p>
                    </div>
                  </div>

                  {/* Voice Assistant Shortcut */}
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-300" />
                      <span>Voice Assistant Active (Floating Bottom-Right)</span>
                    </div>
                  </div>
                </div>

                {/* Quick Feature Launchers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={() => onNavigate && onNavigate('cbt_engine')}
                    className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-indigo-500/30 text-left transition-all hover:scale-[1.01] cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-indigo-300 mb-1">
                      <Laptop className="w-5 h-5" />
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="font-bold text-xs text-white">AI CBT Practice Hub</div>
                    <div className="text-[10px] text-slate-300">Practice timed CBT exams with {activeStudent?.fullName || 'your child'}</div>
                  </button>

                  <button
                    onClick={() => onNavigate && onNavigate('early_warning')}
                    className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-amber-500/30 text-left transition-all hover:scale-[1.01] cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-amber-300 mb-1">
                      <AlertTriangle className="w-5 h-5" />
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="font-bold text-xs text-white">Child Risk & Remedials</div>
                    <div className="text-[10px] text-slate-300">View personalized AI remedial packages & weaknesses</div>
                  </button>

                  <button
                    onClick={() => onNavigate && onNavigate('document_vault')}
                    className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-emerald-500/30 text-left transition-all hover:scale-[1.01] cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-emerald-300 mb-1">
                      <FolderLock className="w-5 h-5" />
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="font-bold text-xs text-white">Vault & Fee Receipts</div>
                    <div className="text-[10px] text-slate-300">Access official school letters, syllabi, and fee records</div>
                  </button>
                </div>
              </div>

              {/* Interactive Homework Tutor */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <span>Interactive AI Homework & Tutor Assistant</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Helping parents guide student learning for <strong className="text-slate-800 dark:text-slate-200">{activeStudent?.fullName} ({activeClass?.name})</strong>
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[11px]">
                    Online & Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Subject
                    </label>
                    <select
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="English Language">English Language</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Civic Education">Civic Education</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Economics">Economics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Assistance Goal
                    </label>
                    <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setAiMode('EXPLAIN')}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                          aiMode === 'EXPLAIN' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Step-by-Step
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiMode('QUIZ')}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                          aiMode === 'QUIZ' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Practice Quiz
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiMode('REAL_WORLD')}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                          aiMode === 'REAL_WORLD' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Real Examples
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Homework Topic or Question
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="e.g. Simultaneous Equations,Photosynthesis, Shakespeare's Macbeth..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAskAITutor}
                      disabled={isAiThinking || !aiTopic.trim()}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all cursor-pointer shrink-0"
                    >
                      {isAiThinking ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Consulting AI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Ask AI Tutor</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* AI Response Output Container */}
                {aiResponse && (
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                      <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        AI Parent Guidance Output
                      </span>
                      <button
                        onClick={() => setAiResponse(null)}
                        className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold cursor-pointer"
                      >
                        Clear Response
                      </button>
                    </div>
                    <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
                      {aiResponse}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 5: Class Timetable */}
          {activeTab === 'TIMETABLE' && activeTimetable && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Weekly Class Schedule — {activeClass?.name}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                      <th className="py-3 px-4">Day</th>
                      <th className="py-3 px-3">Period 1</th>
                      <th className="py-3 px-3">Period 2</th>
                      <th className="py-3 px-3">Period 3</th>
                      <th className="py-3 px-3">Period 4</th>
                      <th className="py-3 px-3">Period 5</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {activeTimetable.map((day: any) => (
                      <tr key={day.day}>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{day.day}</td>
                        {day.slots.map((s: any, idx: number) => (
                          <td key={idx} className="py-3 px-3">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 block">{s.subject}</span>
                            <span className="text-[10px] text-slate-400 block">{s.time}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!activeStudent && activeTab !== 'AI_ASSISTANT' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center space-y-4 border border-slate-200 dark:border-slate-800">
              <Key className="w-12 h-12 text-indigo-500 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Student Linked Yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Please enter your child’s Parent Access Code (found on their admission letter or ID badge) in the top form to link their account.
              </p>
            </div>
          )}
    </div>
  );
}
