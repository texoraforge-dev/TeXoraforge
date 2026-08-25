/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Play,
  Brain,
  Plus,
  Loader2,
  BarChart,
  BookOpen,
  Send,
  Eye,
  EyeOff,
  Users,
  Shield,
  Trash2,
  Settings,
  Filter,
  Check,
  AlertTriangle,
  RotateCcw,
  Search,
  FileText,
  ChevronRight,
  UserCheck,
  CheckSquare
} from 'lucide-react';
import { useAppStore } from '../storage';
import { CBTExam, CBTAttempt, ExamQuestion, QuestionType } from '../types';
import { CBTTeacherAuthoringModal } from './CBTTeacherAuthoringModal';

export const CBTEngine: React.FC = () => {
  const {
    school,
    classes,
    cbtExams,
    cbtAttempts,
    actions,
    currentUser,
    students,
    submissions
  } = useAppStore();

  const isStudent = currentUser?.role === 'STUDENT';
  const isTeacher = currentUser?.role === 'TEACHER';
  const isAdmin = currentUser?.role === 'SCHOOL_ADMIN' || currentUser?.role === 'VICE_PRINCIPAL' || currentUser?.role === 'PROPRIETOR';
  const isTeacherOrAdmin = isTeacher || isAdmin;

  // Available appointed classes for current user
  const visibleClasses = useMemo(() => {
    if (isTeacher || isStudent) {
      const assigned = currentUser?.assignedClassIds || [];
      const filtered = classes.filter(c => assigned.includes(c.id));
      return filtered.length > 0 ? filtered : (classes.length > 0 ? [classes[0]] : []);
    }
    return classes;
  }, [classes, isTeacher, isStudent, currentUser]);

  const effectiveClasses = visibleClasses.length > 0 ? visibleClasses : (classes.length > 0 ? [classes[0]] : []);

  // Filter selections
  const [selectedClassId, setSelectedClassId] = useState<string>(
    currentUser?.assignedClassIds?.[0] || effectiveClasses[0]?.id || ''
  );
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'CLOSED'>('ALL');
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'ASSESSMENTS' | 'STUDENT_TEST' | 'STUDY_MODE' | 'GRADEBOOK'>('ASSESSMENTS');

  // Teacher Authoring Modal
  const [isAuthoringModalOpen, setIsAuthoringModalOpen] = useState<boolean>(false);
  const [editingExam, setEditingExam] = useState<CBTExam | null>(null);

  // Active Test / Exam Taking State
  const [activeExam, setActiveExam] = useState<CBTExam | null>(null);
  const [testQuestions, setTestQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [isTestSubmitting, setIsTestSubmitting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<CBTAttempt | null>(null);
  const [studyCardIndex, setStudyCardIndex] = useState<number>(0);
  const [studyShowAnswer, setStudyShowAnswer] = useState<boolean>(false);

  // Gradebook Inspection State
  const [inspectingExamId, setInspectingExamId] = useState<string | null>(null);
  const [selectedAttemptForReview, setSelectedAttemptForReview] = useState<CBTAttempt | null>(null);
  const [teacherRemarkText, setTeacherRemarkText] = useState<string>('');

  // -------------------------------------------------------------
  // STUDENT & TEACHER VISIBILITY FILTERING ENGINE
  // -------------------------------------------------------------
  const filteredExams = useMemo(() => {
    return cbtExams.filter(exam => {
      // If student, strictly enforce student visibility rules
      if (isStudent) {
        // 1. Exam must be PUBLISHED (not Draft or Closed)
        if (exam.status !== 'PUBLISHED') return false;

        // 2. School-wide check (all school students have access)
        if (exam.visibilityMode === 'ALL_SCHOOL_STUDENTS') {
          return true;
        }

        // 3. Class match
        const studentAssignedClasses = currentUser?.assignedClassIds || [];
        const isClassMatch = !exam.classId || studentAssignedClasses.includes(exam.classId) || (currentUser?.className && exam.className === currentUser.className);
        if (!isClassMatch && exam.visibilityMode !== 'SPECIFIC_STUDENTS') return false;

        // 4. Visibility mode check
        if (exam.visibilityMode === 'HIDDEN_TEACHER_ONLY') {
          return false;
        }
        if (exam.visibilityMode === 'SPECIFIC_STUDENTS') {
          const currentStudentId = currentUser?.id;
          if (!currentStudentId || !exam.allowedStudentIds?.includes(currentStudentId)) {
            return false;
          }
        }

        return true;
      }

      // If teacher: STRICTLY restrict to class/classes appointed to them
      if (isTeacher) {
        const teacherAssignedClassIds = currentUser?.assignedClassIds || [];
        const isAppointedClass = !exam.classId || teacherAssignedClassIds.includes(exam.classId) || exam.teacherId === currentUser?.id;
        if (!isAppointedClass) return false;
      }

      // Teacher / Admin filtering
      if (selectedClassId && exam.classId && exam.classId !== selectedClassId) return false;
      if (selectedSubjectFilter !== 'ALL' && exam.subject !== selectedSubjectFilter) return false;
      if (selectedStatusFilter !== 'ALL' && exam.status !== selectedStatusFilter) return false;

      return true;
    });
  }, [cbtExams, isStudent, isTeacher, currentUser, selectedClassId, selectedSubjectFilter, selectedStatusFilter]);

  // Attempts filtering
  const visibleAttempts = useMemo(() => {
    if (isStudent) {
      return cbtAttempts.filter(att => 
        att.studentId === currentUser?.id || 
        att.studentName?.toLowerCase() === currentUser?.name?.toLowerCase()
      );
    }
    if (inspectingExamId) {
      return cbtAttempts.filter(att => att.examId === inspectingExamId);
    }
    if (isTeacher) {
      const teacherAssignedClassIds = currentUser?.assignedClassIds || [];
      const teacherClassNames = classes.filter(c => teacherAssignedClassIds.includes(c.id)).map(c => c.name);
      return cbtAttempts.filter(att => 
        (att.classId && teacherAssignedClassIds.includes(att.classId)) ||
        (att.className && teacherClassNames.includes(att.className)) ||
        (selectedClassId ? att.className === classes.find(c => c.id === selectedClassId)?.name : true)
      );
    }
    if (selectedClassId) {
      const cls = classes.find(c => c.id === selectedClassId);
      return cbtAttempts.filter(att => att.className === cls?.name);
    }
    return cbtAttempts;
  }, [cbtAttempts, isStudent, isTeacher, currentUser, inspectingExamId, selectedClassId, classes]);

  // Timer countdown
  useEffect(() => {
    if (activeTab !== 'STUDENT_TEST' || !activeExam || testResult) return;

    if (timeLeftSeconds <= 0) {
      handleCompleteTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCompleteTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTab, activeExam, timeLeftSeconds, testResult]);

  // Start Exam
  const handleStartExam = (exam: CBTExam, isStudyMode = false) => {
    setActiveExam(exam);
    // Filter questions: only questions where teacher marked isVisibleToStudents !== false
    let qs = (exam.questions || []).filter(q => q.isVisibleToStudents !== false);
    if (exam.shuffleQuestions && !isStudyMode) {
      qs = [...qs].sort(() => Math.random() - 0.5);
    }
    setTestQuestions(qs);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setFlaggedQuestions({});
    setTimeLeftSeconds(exam.durationMinutes * 60);
    setTestResult(null);
    setStudyCardIndex(0);
    setStudyShowAnswer(false);

    if (isStudyMode) {
      setActiveTab('STUDY_MODE');
    } else {
      setActiveTab('STUDY_MODE' === activeTab ? 'STUDY_MODE' : 'STUDENT_TEST');
    }
  };

  // Select Option
  const handleSelectOption = (questionId: string, option: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  // Toggle Flag
  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Submit and Auto-Grade Test
  const handleCompleteTest = () => {
    if (!activeExam) return;
    setIsTestSubmitting(true);

    let calculatedScore = 0;
    const totalPossibleMarks = testQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

    testQuestions.forEach(q => {
      const selected = userAnswers[q.id];
      if (selected) {
        // Match string exactly or match option letter
        if (selected.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
          calculatedScore += Number(q.marks) || 0;
        }
      }
    });

    const percentage = totalPossibleMarks > 0 ? Math.round((calculatedScore / totalPossibleMarks) * 100) : 0;
    const passed = percentage >= (activeExam.passMarkPercent || 50);
    const timeSpent = (activeExam.durationMinutes * 60) - Math.max(0, timeLeftSeconds);

    const attemptData: CBTAttempt = {
      id: `cbta_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      schoolId: activeExam.schoolId || school?.id || 'school_apex',
      examId: activeExam.id,
      examTitle: activeExam.title,
      studentId: currentUser?.id || 'std_temp',
      studentName: currentUser?.name || 'Adebayo Tobi',
      className: activeExam.className,
      answers: userAnswers,
      score: calculatedScore,
      totalMarks: totalPossibleMarks,
      percentage,
      passed,
      timeSpentSeconds: timeSpent,
      startedAt: new Date(Date.now() - (timeSpent * 1000)).toISOString(),
      completedAt: new Date().toISOString()
    };

    actions.saveCBTAttempt(attemptData);
    setTestResult(attemptData);
    setIsTestSubmitting(false);
  };

  // Quick Action: Toggle Status
  const handleToggleStatus = (examId: string, currentStatus: 'DRAFT' | 'PUBLISHED' | 'CLOSED') => {
    const nextStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    actions.toggleCBTExamStatus(examId, nextStatus, currentUser || undefined);
  };

  // Delete Exam
  const handleDeleteExam = (exam: CBTExam) => {
    if (window.confirm(`Are you sure you want to delete "${exam.title}"?`)) {
      actions.deleteCBTExam(exam.id, currentUser || undefined);
    }
  };

  // Save Exam from Authoring Modal
  const handleSaveExamFromModal = (savedExam: CBTExam) => {
    actions.saveCBTExam(savedExam, currentUser || undefined);
    setIsAuthoringModalOpen(false);
    setEditingExam(null);
  };

  // Save Teacher Remark on Attempt
  const handleSaveTeacherRemark = (attemptId: string) => {
    if (!teacherRemarkText.trim()) return;
    actions.updateCBTAttemptTeacherRemark(attemptId, teacherRemarkText.trim());
    if (selectedAttemptForReview) {
      setSelectedAttemptForReview({
        ...selectedAttemptForReview,
        teacherRemark: teacherRemarkText.trim()
      });
    }
    alert('Teacher remark saved successfully!');
  };

  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/30">
              {isStudent ? 'Student Assessment Portal' : 'Teacher CBT Determination & Authoring Studio'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-300" /> Unlimited CBT Seating & Student Capacity
            </span>
            <span className="text-xs text-purple-200/80">
              {filteredExams.length} Available CBT Exams
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Computer-Based Testing (CBT) Center
          </h1>
          <p className="text-xs text-purple-200/80 max-w-xl">
            {isStudent
              ? 'Access scheduled continuous assessments, study revision questions, and take timed examinations assigned by your subject teachers.'
              : 'Determine curriculum questions, configure student visibility permissions (All Class vs Selective Students), and control test revelation settings.'}
          </p>
        </div>

        {isTeacherOrAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingExam(null);
                setIsAuthoringModalOpen(true);
              }}
              className="px-5 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Create CBT Assessment</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('ASSESSMENTS');
              setActiveExam(null);
              setTestResult(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'ASSESSMENTS'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>{isStudent ? 'Assigned Exams & Quizzes' : 'Teacher Question Banks & Exams'}</span>
          </button>

          {isTeacherOrAdmin && (
            <button
              onClick={() => {
                setActiveTab('GRADEBOOK');
                setActiveExam(null);
                setTestResult(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'GRADEBOOK'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Student Submissions & Gradebook</span>
            </button>
          )}

          {activeExam && activeTab === 'STUDENT_TEST' && (
            <span className="px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-black flex items-center gap-1.5 animate-pulse">
              <Clock className="h-3.5 w-3.5" />
              <span>Exam in Progress: {activeExam.title}</span>
            </span>
          )}

          {activeExam && activeTab === 'STUDY_MODE' && (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5" />
              <span>Study & Revision Mode: {activeExam.title}</span>
            </span>
          )}
        </div>

        {/* Filters for Teachers */}
        {!isStudent && activeTab === 'ASSESSMENTS' && (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold"
            >
              <option value="">{isTeacher ? 'My Appointed Classes' : 'All Classes'}</option>
              {visibleClasses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value as any)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published (Live)</option>
              <option value="DRAFT">Teacher Draft</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ASSESSMENTS LIST (Teacher & Student Views) */}
      {/* ========================================================= */}
      {activeTab === 'ASSESSMENTS' && (
        <div className="space-y-4">
          
          {filteredExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExams.map(exam => {
                const totalMarks = exam.totalMarks || (exam.questions || []).reduce((s, q) => s + (Number(q.marks) || 0), 0);
                const visibleQsCount = (exam.questions || []).filter(q => q.isVisibleToStudents !== false).length;
                const studentAttempt = visibleAttempts.find(a => a.examId === exam.id);

                return (
                  <div
                    key={exam.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
                  >
                    {/* Top Accent Strip */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                      exam.status === 'PUBLISHED'
                        ? 'bg-emerald-500'
                        : exam.status === 'DRAFT'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`} />

                    <div className="space-y-3">
                      
                      {/* Badge Ribbon */}
                      <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          {exam.className} • {exam.subject}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {exam.status === 'PUBLISHED' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Live
                            </span>
                          ) : exam.status === 'DRAFT' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                              <EyeOff className="h-3 w-3" /> Draft
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              Closed
                            </span>
                          )}

                          {isTeacherOrAdmin && (
                            <button
                              onClick={() => handleToggleStatus(exam.id, exam.status)}
                              className="text-[10px] font-bold text-slate-500 hover:text-purple-600 underline cursor-pointer"
                              title="Toggle Publish Status"
                            >
                              {exam.status === 'PUBLISHED' ? 'Unpublish' : 'Make Live'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title & Teacher Info */}
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 line-clamp-2">
                          {exam.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                          Teacher: <strong className="text-slate-700 dark:text-slate-300">{exam.teacherName || 'Subject Teacher'}</strong>
                        </p>
                      </div>

                      {/* Student Visibility Mode Box */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] font-bold uppercase text-slate-400">Student Visibility Scope:</span>
                          {exam.visibilityMode === 'ALL_SCHOOL_STUDENTS' ? (
                            <span className="font-extrabold text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                              <Users className="h-3 w-3" /> Whole School • Unlimited Candidates
                            </span>
                          ) : exam.visibilityMode === 'ALL_CLASS_STUDENTS' ? (
                            <span className="font-extrabold text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <Users className="h-3 w-3" /> All {exam.className} Students
                            </span>
                          ) : exam.visibilityMode === 'SPECIFIC_STUDENTS' ? (
                            <span className="font-extrabold text-[10px] text-purple-600 dark:text-purple-400 flex items-center gap-1">
                              <Shield className="h-3 w-3" /> Restricted ({exam.allowedStudentIds?.length || 0} Students)
                            </span>
                          ) : (
                            <span className="font-extrabold text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <EyeOff className="h-3 w-3" /> Teacher Only Draft
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                          <div className="p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                            <span className="text-[9px] text-slate-400 block">Duration</span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200">{exam.durationMinutes}m</span>
                          </div>
                          <div className="p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                            <span className="text-[9px] text-slate-400 block">Questions</span>
                            <span className="text-xs font-black text-purple-600">{visibleQsCount} Qs</span>
                          </div>
                          <div className="p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                            <span className="text-[9px] text-slate-400 block">Total Marks</span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200">{totalMarks} M</span>
                          </div>
                        </div>
                      </div>

                      {/* Student Past Attempt Summary (if any) */}
                      {studentAttempt && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs flex items-center justify-between">
                          <span className="font-bold text-emerald-800 dark:text-emerald-200">
                            Your Score: {studentAttempt.score}/{studentAttempt.totalMarks} ({studentAttempt.percentage}%)
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            studentAttempt.passed ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                          }`}>
                            {studentAttempt.passed ? 'PASSED' : 'RETAKE SUGGESTED'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      
                      {/* Student Actions */}
                      {isStudent && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartExam(exam, false)}
                            className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Play className="h-3.5 w-3.5" />
                            <span>{studentAttempt ? 'Retake Timed Exam' : 'Start Timed Exam'}</span>
                          </button>

                          {exam.allowStudentStudyMode && (
                            <button
                              onClick={() => handleStartExam(exam, true)}
                              className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                              title="Study & Revision Mode"
                            >
                              <Brain className="h-3.5 w-3.5" />
                              <span>Study Mode</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Teacher Actions */}
                      {isTeacherOrAdmin && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingExam(exam);
                                setIsAuthoringModalOpen(true);
                              }}
                              className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Settings className="h-3.5 w-3.5 text-purple-400" />
                              <span>Manage Exam & Visibility</span>
                            </button>

                            <button
                              onClick={() => handleDeleteExam(exam)}
                              className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition-all border border-rose-200 dark:border-rose-900/50 cursor-pointer"
                              title="Delete Exam"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <button
                              onClick={() => {
                                setInspectingExamId(exam.id);
                                setActiveTab('GRADEBOOK');
                              }}
                              className="font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                            >
                              <Users className="h-3 w-3" />
                              <span>View Submissions ({cbtAttempts.filter(a => a.examId === exam.id).length})</span>
                            </button>

                            <button
                              onClick={() => handleStartExam(exam, false)}
                              className="font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                            >
                              <Play className="h-3 w-3" />
                              <span>Simulate Test</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-950/60 rounded-full w-14 h-14 mx-auto flex items-center justify-center text-purple-600">
                <Brain className="h-7 w-7" />
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
                {isStudent ? 'No Active CBT Exams Found for Your Account' : 'No CBT Assessments Created Yet'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {isStudent
                  ? 'Your subject teachers have not published any CBT exams for your class yet or this test is restricted.'
                  : 'Get started by creating a CBT examination paper from scratch, importing approved lesson note questions, or using AI assistance.'}
              </p>
              {isTeacherOrAdmin && (
                <button
                  onClick={() => {
                    setEditingExam(null);
                    setIsAuthoringModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Your First CBT Exam</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: INTERACTIVE TEST TAKING PORTAL */}
      {/* ========================================================= */}
      {activeTab === 'STUDENT_TEST' && activeExam && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* If test finished, show result screen */}
          {testResult ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-lg space-y-6">
              
              {/* Result Header */}
              <div className="text-center space-y-2 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                  testResult.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                }`}>
                  {testResult.passed ? <CheckCircle2 className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                  {testResult.passed ? 'Assessment Completed — Great Performance!' : 'Assessment Completed'}
                </h2>
                <p className="text-xs text-slate-500">
                  Exam: <strong className="text-slate-700 dark:text-slate-300">{activeExam.title}</strong>
                </p>
              </div>

              {/* Scorecard */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800">
                  <span className="text-[10px] font-bold text-purple-600 uppercase block">Score Scored</span>
                  <span className="text-2xl font-black text-purple-900 dark:text-purple-200">
                    {testResult.score} / {testResult.totalMarks}
                  </span>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase block">Percentage</span>
                  <span className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
                    {testResult.percentage}%
                  </span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Time Spent</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-200">
                    {Math.floor(testResult.timeSpentSeconds / 60)}m {testResult.timeSpentSeconds % 60}s
                  </span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Result Status</span>
                  <span className={`text-xl font-black ${testResult.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {testResult.passed ? 'PASSED' : 'NEEDS REVISION'}
                  </span>
                </div>
              </div>

              {/* Answer Key & Teacher Corrections (Conditional based on teacher settings) */}
              {activeExam.showCorrectionsImmediately ? (
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-emerald-600" />
                      <span>Detailed Answer Review & Teacher Explanations</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {testQuestions.map((q, qIdx) => {
                      const userAns = testResult.answers[q.id];
                      const isCorrect = userAns && userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                      return (
                        <div
                          key={q.id}
                          className={`p-4 rounded-2xl border ${
                            isCorrect
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1.5 flex-1">
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                Question {qIdx + 1} ({q.marks} Marks)
                              </span>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{q.questionText}</p>
                              
                              <div className="text-xs space-y-1 pt-1">
                                <p>
                                  Your Answer:{' '}
                                  <strong className={isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>
                                    {userAns || 'No Answer Provided'}
                                  </strong>
                                </p>
                                {!isCorrect && (
                                  <p className="text-emerald-700 dark:text-emerald-300">
                                    Correct Answer: <strong>{q.correctAnswer}</strong>
                                  </p>
                                )}
                              </div>

                              {q.explanation && (
                                <p className="text-[11px] text-indigo-700 dark:text-indigo-300 pt-1">
                                  <strong>Teacher Explanation:</strong> {q.explanation}
                                </p>
                              )}
                            </div>

                            <div className="shrink-0">
                              {isCorrect ? (
                                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700 inline-block">
                                  <CheckCircle2 className="h-5 w-5" />
                                </span>
                              ) : (
                                <span className="p-2 rounded-xl bg-rose-100 text-rose-700 inline-block">
                                  <XCircle className="h-5 w-5" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 text-center">
                  <Shield className="h-5 w-5 mx-auto text-indigo-600 mb-1" />
                  <p className="font-bold">Exam Submitted Successfully to Teacher</p>
                  <p className="text-[11px] text-indigo-700/80 mt-0.5">
                    Your answers are under review. Full question-by-question explanations will be revealed once released by your teacher.
                  </p>
                </div>
              )}

              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setActiveExam(null);
                    setTestResult(null);
                    setActiveTab('ASSESSMENTS');
                  }}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer"
                >
                  Return to Assessments Center
                </button>
              </div>

            </div>
          ) : (
            /* Active Question Taking Engine */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Question Screen (3 Cols) */}
              <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md flex flex-col justify-between space-y-6">
                
                {/* Top Info Strip */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {activeExam.subject} • {activeExam.className}
                    </span>
                    <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">
                      {activeExam.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-black">
                      <Clock className="h-4 w-4 animate-pulse text-purple-600" />
                      <span>{formatTime(timeLeftSeconds)}</span>
                    </div>

                    <button
                      onClick={() => handleToggleFlag(testQuestions[currentQuestionIdx]?.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        flaggedQuestions[testQuestions[currentQuestionIdx]?.id]
                          ? 'bg-amber-100 text-amber-800 border border-amber-400'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {flaggedQuestions[testQuestions[currentQuestionIdx]?.id] ? 'Flagged ★' : 'Flag for Review'}
                    </button>
                  </div>
                </div>

                {/* Current Question Body */}
                {testQuestions[currentQuestionIdx] && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-400">
                        Question {currentQuestionIdx + 1} of {testQuestions.length}
                      </span>
                      <span className="text-xs font-bold text-purple-600">
                        {testQuestions[currentQuestionIdx].marks} Marks
                      </span>
                    </div>

                    <p className="text-base font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                      {testQuestions[currentQuestionIdx].questionText}
                    </p>

                    {/* Options list */}
                    {testQuestions[currentQuestionIdx].options && (
                      <div className="space-y-2.5">
                        {testQuestions[currentQuestionIdx].options?.map((opt, oIdx) => {
                          const isSelected = userAnswers[testQuestions[currentQuestionIdx].id] === opt;
                          return (
                            <label
                              key={oIdx}
                              onClick={() => handleSelectOption(testQuestions[currentQuestionIdx].id, opt)}
                              className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-100 shadow-sm'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q_${testQuestions[currentQuestionIdx].id}`}
                                checked={isSelected}
                                onChange={() => handleSelectOption(testQuestions[currentQuestionIdx].id, opt)}
                                className="sr-only"
                              />
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                                isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                              }`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="text-xs font-semibold flex-1">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    disabled={currentQuestionIdx === 0}
                    onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
                  >
                    Previous Question
                  </button>

                  {currentQuestionIdx < testQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleCompleteTest}
                      disabled={isTestSubmitting}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-lg cursor-pointer flex items-center gap-2"
                    >
                      {isTestSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      <span>Submit & Finish Exam</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Question Navigation Navigator (1 Col) */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-md space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Question Palette
                </h3>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {testQuestions.map((q, idx) => {
                    const isAnswered = !!userAnswers[q.id];
                    const isCurrent = currentQuestionIdx === idx;
                    const isFlagged = !!flaggedQuestions[q.id];

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIdx(idx)}
                        className={`h-9 rounded-xl text-xs font-black transition-all flex items-center justify-center relative cursor-pointer ${
                          isCurrent
                            ? 'ring-2 ring-purple-600 bg-purple-600 text-white'
                            : isAnswered
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span>{idx + 1}</span>
                        {isFlagged && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1 right-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span>Answered: {Object.keys(userAnswers).length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />
                    <span>Unanswered: {testQuestions.length - Object.keys(userAnswers).length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span>Flagged for Review</span>
                  </div>
                </div>

                <button
                  onClick={handleCompleteTest}
                  className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  Submit Examination
                </button>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: STUDY & REVISION MODE */}
      {/* ========================================================= */}
      {activeTab === 'STUDY_MODE' && activeExam && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
          
          <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 block">
                Study & Curriculum Revision Mode
              </span>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{activeExam.title}</h2>
            </div>

            <button
              onClick={() => {
                setActiveExam(null);
                setActiveTab('ASSESSMENTS');
              }}
              className="text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:underline"
            >
              Exit Study Mode
            </button>
          </div>

          {/* Flashcard Card */}
          {testQuestions[studyCardIndex] && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-lg space-y-6 min-h-[380px] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold">
                    Question {studyCardIndex + 1} of {testQuestions.length}
                  </span>
                  <span className="font-extrabold text-purple-600">
                    Category: {testQuestions[studyCardIndex].category || 'Theory & Concept'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {testQuestions[studyCardIndex].questionText}
                </h3>

                {testQuestions[studyCardIndex].options && (
                  <div className="space-y-2 pt-2">
                    {testQuestions[studyCardIndex].options?.map((opt, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-xs font-medium ${
                          studyShowAnswer && opt === testQuestions[studyCardIndex].correctAnswer
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}

                {/* Solution Reveal */}
                {studyShowAnswer && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300 dark:border-emerald-800 text-xs space-y-1 animate-in fade-in">
                    <p className="font-bold text-emerald-900 dark:text-emerald-200">
                      Correct Answer: {testQuestions[studyCardIndex].correctAnswer}
                    </p>
                    {testQuestions[studyCardIndex].explanation && (
                      <p className="text-slate-600 dark:text-slate-300">
                        {testQuestions[studyCardIndex].explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  disabled={studyCardIndex === 0}
                  onClick={() => {
                    setStudyCardIndex(prev => prev - 1);
                    setStudyShowAnswer(false);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  onClick={() => setStudyShowAnswer(!studyShowAnswer)}
                  className="px-4 py-2 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold"
                >
                  {studyShowAnswer ? 'Hide Solution' : 'Reveal Solution & Note'}
                </button>

                <button
                  disabled={studyCardIndex === testQuestions.length - 1}
                  onClick={() => {
                    setStudyCardIndex(prev => prev + 1);
                    setStudyShowAnswer(false);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: TEACHER GRADEBOOK & ATTEMPT ANALYSIS */}
      {/* ========================================================= */}
      {activeTab === 'GRADEBOOK' && isTeacherOrAdmin && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-black uppercase text-purple-600">Student CBT Submissions</span>
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-200">
                {inspectingExamId
                  ? `Submissions for: ${cbtExams.find(e => e.id === inspectingExamId)?.title}`
                  : 'All Class CBT Submissions & Grading'}
              </h2>
            </div>

            {inspectingExamId && (
              <button
                onClick={() => setInspectingExamId(null)}
                className="text-xs font-bold text-purple-600 hover:underline"
              >
                Clear Exam Filter (Show All)
              </button>
            )}
          </div>

          {visibleAttempts.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Student Name</th>
                      <th className="p-3.5">Class</th>
                      <th className="p-3.5">Exam Title</th>
                      <th className="p-3.5">Score</th>
                      <th className="p-3.5">Percentage</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Time Spent</th>
                      <th className="p-3.5">Completed At</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {visibleAttempts.map(att => (
                      <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{att.studentName}</td>
                        <td className="p-3.5 text-slate-500">{att.className}</td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 max-w-xs truncate">{att.examTitle}</td>
                        <td className="p-3.5 font-extrabold text-purple-600">{att.score} / {att.totalMarks}</td>
                        <td className="p-3.5 font-bold">{att.percentage}%</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            att.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {att.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">{Math.floor(att.timeSpentSeconds / 60)}m {att.timeSpentSeconds % 60}s</td>
                        <td className="p-3.5 text-slate-400 text-[11px]">{new Date(att.completedAt).toLocaleDateString()}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedAttemptForReview(att);
                              setTeacherRemarkText(att.teacherRemark || '');
                            }}
                            className="px-3 py-1.5 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 hover:bg-purple-100 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Review & Remark
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              No student submissions recorded for this selection yet.
            </div>
          )}

          {/* Teacher Review Attempt Modal */}
          {selectedAttemptForReview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-6 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-purple-600">Teacher Evaluation Review</span>
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                      {selectedAttemptForReview.studentName} — {selectedAttemptForReview.examTitle}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedAttemptForReview(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Score</span>
                    <span className="font-bold text-purple-600 text-sm">
                      {selectedAttemptForReview.score}/{selectedAttemptForReview.totalMarks}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Percentage</span>
                    <span className="font-bold text-emerald-600 text-sm">
                      {selectedAttemptForReview.percentage}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Status</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {selectedAttemptForReview.passed ? 'PASSED' : 'RETAKE REQUIRED'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Teacher Feedback & Academic Remark
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter individualized feedback for this student e.g. Good mastery on circuit principles, review Faraday equation derivation."
                    value={teacherRemarkText}
                    onChange={e => setTeacherRemarkText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSelectedAttemptForReview(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveTeacherRemark(selectedAttemptForReview.id)}
                    className="px-5 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    Save Teacher Feedback
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* TEACHER AUTHORING & VISIBILITY MODAL */}
      {/* ========================================================= */}
      {isAuthoringModalOpen && (
        <CBTTeacherAuthoringModal
          isOpen={isAuthoringModalOpen}
          onClose={() => {
            setIsAuthoringModalOpen(false);
            setEditingExam(null);
          }}
          initialExam={editingExam}
          classes={visibleClasses}
          subjects={isTeacher && currentUser?.assignedSubjects?.length ? currentUser.assignedSubjects : (school?.subjects || ['Physics', 'Mathematics', 'Biology', 'Chemistry', 'English Language'])}
          students={isTeacher ? students.filter(s => currentUser?.assignedClassIds?.includes(s.classId)) : students}
          submissions={isTeacher ? submissions.filter(s => s.teacherId === currentUser?.id) : submissions}
          currentUser={currentUser}
          onSave={handleSaveExamFromModal}
        />
      )}

    </div>
  );
};
