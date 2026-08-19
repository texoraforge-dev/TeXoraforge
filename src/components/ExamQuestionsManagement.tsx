/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Printer,
  Copy,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Users,
  Building2,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  ChevronRight,
  GraduationCap,
  Download,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '../storage';
import { GeneratedExamSet, ExamQuestion, QuestionType, Submission, CBTExam } from '../types';

export const ExamQuestionsManagement: React.FC = () => {
  const { school, classes, currentUser, users, submissions, examSets, actions } = useAppStore();

  const isTeacher = currentUser?.role === 'TEACHER';
  const isProprietor = currentUser?.role === 'PROPRIETOR';
  const isAdmin = currentUser?.role === 'SCHOOL_ADMIN' || currentUser?.role === 'VICE_PRINCIPAL';

  // Filters
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('ALL');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Active Exam Set
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('');
  const [customExamTitle, setCustomExamTitle] = useState('');

  // Active viewing/editing exam set
  const [activeExamSet, setActiveExamSet] = useState<GeneratedExamSet | null>(null);
  const [isPrintPreviewModalOpen, setIsPrintPreviewModalOpen] = useState(false);
  const [showMarkingSchemeInPrint, setShowMarkingSchemeInPrint] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Edit/Add Question State
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);
  const [isNewQuestionModalOpen, setIsNewQuestionModalOpen] = useState(false);
  const [newQType, setNewQType] = useState<QuestionType>('MULTIPLE_CHOICE');
  const [newQText, setNewQText] = useState('');
  const [newQOptions, setNewQOptions] = useState<string[]>(['A. ', 'B. ', 'C. ', 'D. ']);
  const [newQAnswer, setNewQAnswer] = useState('');
  const [newQExplanation, setNewQExplanation] = useState('');
  const [newQMarks, setNewQMarks] = useState(5);

  // Appointed classes for current user
  const visibleClasses = useMemo(() => {
    if (isTeacher) {
      const assigned = currentUser?.assignedClassIds || [];
      const filtered = classes.filter(c => assigned.includes(c.id));
      return filtered.length > 0 ? filtered : (classes.length > 0 ? [classes[0]] : []);
    }
    return classes;
  }, [classes, isTeacher, currentUser]);

  // Filter available submissions for auto-generation (Lesson Notes)
  const availableLessonNotes = useMemo(() => {
    return submissions.filter(s => {
      if (s.type !== 'LESSON_NOTE' && !s.lessonNoteContent) return false;
      if (isTeacher) {
        const isTeacherOwner = s.teacherId === currentUser?.id;
        const isAppointedClass = !s.classId || currentUser?.assignedClassIds?.includes(s.classId);
        return isTeacherOwner && isAppointedClass;
      }
      if (selectedTeacherId !== 'ALL') return s.teacherId === selectedTeacherId;
      return true;
    });
  }, [submissions, isTeacher, currentUser, selectedTeacherId]);

  // Teachers list for filter
  const teachersList = useMemo(() => {
    return users.filter(u => u.role === 'TEACHER');
  }, [users]);

  // Filtered Exam Sets based on user role and selected filters
  const filteredExamSets = useMemo(() => {
    return examSets.filter(set => {
      // Role access rules: Teachers only see their questions and appointed classes; Proprietor/Admin see ALL
      if (isTeacher) {
        if (set.teacherId !== currentUser?.id) {
          return false;
        }
        const teacherAssignedClassIds = currentUser?.assignedClassIds || [];
        if (set.classId && teacherAssignedClassIds.length > 0 && !teacherAssignedClassIds.includes(set.classId)) {
          return false;
        }
      }
      if (!isTeacher && selectedTeacherId !== 'ALL' && set.teacherId !== selectedTeacherId) {
        return false;
      }
      if (selectedClassId !== 'ALL' && set.classId !== selectedClassId) {
        return false;
      }
      if (selectedSubject !== 'ALL' && set.subject !== selectedSubject) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = set.title.toLowerCase().includes(q);
        const matchesSubject = set.subject.toLowerCase().includes(q);
        const matchesTeacher = set.teacherName.toLowerCase().includes(q);
        const matchesLessonNote = set.lessonNoteTitle?.toLowerCase().includes(q);
        return matchesTitle || matchesSubject || matchesTeacher || matchesLessonNote;
      }
      return true;
    });
  }, [examSets, isTeacher, currentUser, selectedTeacherId, selectedClassId, selectedSubject, searchQuery]);

  // Trigger auto generation from selected lesson note
  const handleAutoGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionId || !school) return;

    const submission = submissions.find(s => s.id === selectedSubmissionId);
    if (!submission) return;

    const generatedSet = actions.generateExamFromLessonNote(
      submission,
      school,
      customExamTitle.trim() || undefined
    );

    setIsGenerateModalOpen(false);
    setSelectedSubmissionId('');
    setCustomExamTitle('');
    setActiveExamSet(generatedSet);
  };

  // Add question to active exam set
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExamSet || !newQText.trim()) return;

    const newQuestion: ExamQuestion = {
      id: 'q_' + Date.now(),
      type: newQType,
      questionText: newQText.trim(),
      options: newQType === 'MULTIPLE_CHOICE' ? newQOptions.map(o => o.trim()).filter(Boolean) : undefined,
      correctAnswer: newQAnswer.trim() || 'Refer to teacher notes',
      explanation: newQExplanation.trim() || undefined,
      marks: Number(newQMarks) || 5
    };

    const updatedQuestions = [...activeExamSet.questions, newQuestion];
    const updatedTotalMarks = updatedQuestions.reduce((sum, q) => sum + q.marks, 0);

    const updatedSet: GeneratedExamSet = {
      ...activeExamSet,
      questions: updatedQuestions,
      totalMarks: updatedTotalMarks,
      updatedAt: new Date().toISOString()
    };

    actions.saveExamSet(updatedSet);
    setActiveExamSet(updatedSet);

    // Reset Form
    setIsNewQuestionModalOpen(false);
    setNewQText('');
    setNewQOptions(['A. ', 'B. ', 'C. ', 'D. ']);
    setNewQAnswer('');
    setNewQExplanation('');
    setNewQMarks(5);
  };

  // Delete question from active exam set
  const handleDeleteQuestion = (questionId: string) => {
    if (!activeExamSet) return;
    const updatedQuestions = activeExamSet.questions.filter(q => q.id !== questionId);
    const updatedTotalMarks = updatedQuestions.reduce((sum, q) => sum + q.marks, 0);

    const updatedSet: GeneratedExamSet = {
      ...activeExamSet,
      questions: updatedQuestions,
      totalMarks: updatedTotalMarks,
      updatedAt: new Date().toISOString()
    };

    actions.saveExamSet(updatedSet);
    setActiveExamSet(updatedSet);
  };

  // Convert Active Exam Set into CBT Online Examination
  const handleDeployToCBT = () => {
    if (!activeExamSet) return;

    const newCbt: CBTExam = {
      id: `cbt_${Date.now()}`,
      schoolId: activeExamSet.schoolId,
      examSetId: activeExamSet.id,
      teacherId: activeExamSet.teacherId,
      teacherName: activeExamSet.teacherName,
      classId: activeExamSet.classId,
      className: activeExamSet.className,
      subject: activeExamSet.subject,
      academicSession: activeExamSet.academicSession,
      academicTerm: activeExamSet.academicTerm,
      title: `${activeExamSet.title} (CBT Online Assessment)`,
      instructions: activeExamSet.instructions || 'Answer all questions. Timer begins when you click Start Exam.',
      durationMinutes: 30,
      passMarkPercent: 50,
      status: 'PUBLISHED',
      visibilityMode: 'ALL_CLASS_STUDENTS',
      allowStudentStudyMode: true,
      showCorrectionsImmediately: true,
      releaseResultsToStudents: true,
      shuffleQuestions: true,
      questions: activeExamSet.questions.map(q => ({
        ...q,
        isVisibleToStudents: true,
        category: q.category || 'General Assessment',
        difficulty: q.difficulty || 'MEDIUM'
      })),
      totalMarks: activeExamSet.totalMarks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    actions.saveCBTExam(newCbt, currentUser || undefined);
    alert(`Successfully deployed "${activeExamSet.title}" to CBT Online Exam Center for ${activeExamSet.className}! Students can now view and take the assessment.`);
  };

  // Delete entire exam set
  const handleDeleteExamSet = (setId: string) => {
    if (confirm('Are you sure you want to delete this Exam Question Paper?')) {
      actions.deleteExamSet(setId);
      if (activeExamSet?.id === setId) {
        setActiveExamSet(null);
      }
    }
  };

  // Copy plain text exam paper to clipboard
  const handleCopyExamPaper = (includeAnswers: boolean) => {
    if (!activeExamSet) return;

    let text = `==================================================\n`;
    text += `${school?.name || 'TeXora Academy'}\n`;
    text += `${activeExamSet.title}\n`;
    text += `Class: ${activeExamSet.className} | Subject: ${activeExamSet.subject}\n`;
    text += `Teacher: ${activeExamSet.teacherName} | Total Marks: ${activeExamSet.totalMarks}\n`;
    text += `Academic Session: ${activeExamSet.academicSession} (${activeExamSet.academicTerm})\n`;
    text += `Instructions: ${activeExamSet.instructions || 'Answer all questions clearly.'}\n`;
    text += `==================================================\n\n`;

    activeExamSet.questions.forEach((q, idx) => {
      text += `QUESTION ${idx + 1} (${q.type.replace('_', ' ')}) - [${q.marks} Marks]\n`;
      text += `${q.questionText}\n`;
      if (q.type === 'MULTIPLE_CHOICE' && q.options) {
        q.options.forEach(opt => {
          text += `  ${opt}\n`;
        });
      }
      if (includeAnswers) {
        text += `\n>>> ANSWER: ${q.correctAnswer}\n`;
        if (q.explanation) text += `>>> EXPLANATION: ${q.explanation}\n`;
      }
      text += `\n--------------------------------------------------\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 rounded-xl border border-indigo-500/30">
              <Sparkles className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Exam Question Generator & Question Banks
              </h1>
              <p className="text-xs text-indigo-200 font-medium">
                Auto-generate comprehensive examination papers, test banks, and marking schemes directly from submitted Lesson Notes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            Auto-Generate Exam Paper
          </button>
        </div>
      </div>

      {/* Role Access Callout for Proprietor and School Admin */}
      {(isProprietor || isAdmin) && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <span className="font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Executive Proprietor & Admin Oversight:
            </span>{' '}
            You have full authorization to view, review, print, edit, and generate exam question banks across all teachers in the school. Select a teacher from the filter below to inspect their question papers.
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search exam papers..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            >
              <option value="ALL">{isTeacher ? 'All Appointed Classes' : 'All Classes'}</option>
              {visibleClasses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Teacher Filter (For Proprietor/Admin) */}
          {!isTeacher && (
            <div>
              <select
                value={selectedTeacherId}
                onChange={e => setSelectedTeacherId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              >
                <option value="ALL">All Teachers ({teachersList.length})</option>
                {teachersList.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.assignedSubjects?.join(', ') || 'Teacher'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            >
              <option value="ALL">All Subjects</option>
              {school?.subjects?.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Result Count Indicator */}
          <div className="flex items-center justify-end px-2 sm:col-span-2 md:col-span-4 lg:col-span-1">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
              Showing {filteredExamSets.length} Exam Paper{filteredExamSets.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Question Set Cards & Active Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: List of Exam Question Sets */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
            Question Banks ({filteredExamSets.length})
          </h2>

          {filteredExamSets.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-full w-12 h-12 mx-auto flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">No Exam Question Papers Found</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Click "Auto-Generate Exam Paper" to build questions directly from any submitted Lesson Note.
                </p>
              </div>
            </div>
          ) : (
            filteredExamSets.map(set => {
              const isSelected = activeExamSet?.id === set.id;
              return (
                <div
                  key={set.id}
                  onClick={() => setActiveExamSet(set)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {set.subject}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {set.questions.length} Qs • {set.totalMarks} Marks
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {set.title}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                      <span>{set.className}</span>
                      <span>•</span>
                      <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{set.teacherName}</span>
                    </p>
                  </div>

                  {set.lessonNoteTitle && (
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[10px] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 truncate flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3 text-indigo-500 shrink-0" />
                      <span className="truncate">From: {set.lessonNoteTitle}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Exam Question Inspector & Editor */}
        <div className="lg:col-span-2">
          {!activeExamSet ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center space-y-3 h-[500px]">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/60 rounded-full text-indigo-500">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
                Select an Exam Question Paper to Inspect
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Choose a question bank from the left list to review questions, edit options, print student papers, or export marking schemes.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 p-6">
              
              {/* Paper Header & Actions */}
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {activeExamSet.className} • {activeExamSet.subject}
                    </span>
                    <h2 className="text-base font-black text-slate-900 dark:text-white mt-1">
                      {activeExamSet.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Teacher: <span className="font-extrabold text-slate-700 dark:text-slate-300">{activeExamSet.teacherName}</span> | Session: {activeExamSet.academicSession} ({activeExamSet.academicTerm})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      onClick={handleDeployToCBT}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                      title="Make this exam paper available for students on the CBT Online Portal"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-purple-200" />
                      Deploy to CBT Online
                    </button>

                    <button
                      onClick={() => setIsPrintPreviewModalOpen(true)}
                      className="px-3.5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Printer className="h-3.5 w-3.5 text-indigo-400" />
                      Print / Export Paper
                    </button>

                    <button
                      onClick={() => handleDeleteExamSet(activeExamSet.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-all border border-red-200 dark:border-red-900/50"
                      title="Delete Exam Paper"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Info Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Questions</span>
                    <span className="font-black text-slate-900 dark:text-white text-sm">{activeExamSet.questions.length}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Marks</span>
                    <span className="font-black text-slate-900 dark:text-white text-sm">{activeExamSet.totalMarks} Marks</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Multiple Choice</span>
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                      {activeExamSet.questions.filter(q => q.type === 'MULTIPLE_CHOICE').length}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Theory / Essay</span>
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                      {activeExamSet.questions.filter(q => q.type === 'ESSAY' || q.type === 'SHORT_ANSWER').length}
                    </span>
                  </div>
                </div>

                {/* Instructions Box */}
                {activeExamSet.instructions && (
                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                    <span className="font-black uppercase text-[10px] tracking-wider text-indigo-600 dark:text-indigo-400 block mb-0.5">Exam Instructions:</span>
                    {activeExamSet.instructions}
                  </div>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Questions List ({activeExamSet.questions.length})
                  </h3>

                  <button
                    onClick={() => setIsNewQuestionModalOpen(true)}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-all border border-indigo-200 dark:border-indigo-800 flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Custom Question
                  </button>
                </div>

                {activeExamSet.questions.map((q, qIndex) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {qIndex + 1}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                          {q.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">
                          [{q.marks} Marks]
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-all"
                        title="Delete Question"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Question Text */}
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed pl-8">
                      {q.questionText}
                    </p>

                    {/* Options if MCQ */}
                    {q.type === 'MULTIPLE_CHOICE' && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-xl border ${
                              opt.trim() === q.correctAnswer.trim()
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 font-extrabold text-emerald-900 dark:text-emerald-200'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Answer & Explanation Box */}
                    <div className="ml-8 p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200 font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Correct Answer / Marking Scheme:</span>
                      </div>
                      <p className="text-emerald-950 dark:text-emerald-100 font-medium pl-5">
                        {q.correctAnswer}
                      </p>
                      {q.explanation && (
                        <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 italic pl-5 pt-0.5">
                          Note: {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Auto-Generate Exam Paper Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Auto-Generate Questions from Lesson Note
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select an approved or submitted Lesson Note to synthesize structured exam questions.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAutoGenerate} className="space-y-4">
              
              {/* Select Lesson Note Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Source Lesson Note *
                </label>
                <select
                  required
                  value={selectedSubmissionId}
                  onChange={e => setSelectedSubmissionId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose a submitted Lesson Note --</option>
                  {availableLessonNotes.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      [{sub.className} - {sub.subject}] {sub.title} ({sub.teacherName})
                    </option>
                  ))}
                </select>
                {availableLessonNotes.length === 0 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                    No lesson notes found for the selected teacher. Submit or approve a lesson note first.
                  </p>
                )}
              </div>

              {/* Custom Exam Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Exam Paper Title (Optional Custom Name)
                </label>
                <input
                  type="text"
                  value={customExamTitle}
                  onChange={e => setCustomExamTitle(e.target.value)}
                  placeholder="e.g., SS 3 Physics First Term Examination Questions"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                <span className="font-black block mb-0.5">✨ AI Question Synthesis Engine:</span>
                The system will analyze behavioral objectives, teaching steps, and evaluation questions to generate Multiple Choice Questions, True/False, Short Answer, and Theory questions.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedSubmissionId}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Generate Exam Paper</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Custom Question Modal */}
      {isNewQuestionModalOpen && activeExamSet && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-500" />
                Add Question to "{activeExamSet.subject}"
              </h3>
              <button
                onClick={() => setIsNewQuestionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-3 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Question Type
                </label>
                <select
                  value={newQType}
                  onChange={e => setNewQType(e.target.value as QuestionType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice (MCQ)</option>
                  <option value="SHORT_ANSWER">Short Answer / Fill in the Blanks</option>
                  <option value="TRUE_FALSE">True / False</option>
                  <option value="ESSAY">Theory / Essay Question</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Question Text *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newQText}
                  onChange={e => setNewQText(e.target.value)}
                  placeholder="Type the question text..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Options for MCQ */}
              {newQType === 'MULTIPLE_CHOICE' && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Multiple Choice Options
                  </label>
                  {newQOptions.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={opt}
                      onChange={e => {
                        const updated = [...newQOptions];
                        updated[idx] = e.target.value;
                        setNewQOptions(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                    />
                  ))}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Correct Answer / Marking Solution *
                </label>
                <input
                  type="text"
                  required
                  value={newQAnswer}
                  onChange={e => setNewQAnswer(e.target.value)}
                  placeholder="e.g. Option A or 400 Volts"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Marks Awarded
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={newQMarks}
                  onChange={e => setNewQMarks(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewQuestionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-600/20"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Printable Exam Paper View */}
      {isPrintPreviewModalOpen && activeExamSet && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            
            {/* Modal Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Exam Paper Print & Export Preview
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Toggle Marking Scheme */}
                <button
                  onClick={() => setShowMarkingSchemeInPrint(!showMarkingSchemeInPrint)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    showMarkingSchemeInPrint
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                  }`}
                >
                  {showMarkingSchemeInPrint ? '✓ Showing Marking Scheme' : '+ Show Marking Scheme'}
                </button>

                <button
                  onClick={() => handleCopyExamPaper(showMarkingSchemeInPrint)}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-100 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedNotification ? 'Copied!' : 'Copy Text'}
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Paper
                </button>

                <button
                  onClick={() => setIsPrintPreviewModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Exam Paper Content */}
            <div className="space-y-6 text-slate-900 dark:text-slate-100 font-serif">
              
              {/* Institutional Header */}
              <div className="text-center space-y-1.5 pb-4 border-b-2 border-slate-900 dark:border-slate-100 flex flex-col items-center">
                {school?.logoUrl ? (
                  <img src={school.logoUrl} alt={school.name || 'School Logo'} className="h-16 w-auto max-w-[220px] object-contain mb-1" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mb-1">
                    <GraduationCap className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                  </div>
                )}
                <h1 className="text-2xl font-black uppercase tracking-wider font-sans text-slate-900 dark:text-white">
                  {school?.name || 'TeXora Academy'}
                </h1>
                {school?.motto && (
                  <p className="text-xs italic font-sans text-slate-600 dark:text-slate-300">
                    "{school.motto}"
                  </p>
                )}
                {school?.address && (
                  <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400">
                    {school.address}
                  </p>
                )}
                <p className="text-sm font-sans font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 pt-1">
                  {activeExamSet.title}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-sans font-medium text-slate-700 dark:text-slate-300 pt-1">
                  <span>Class: <strong>{activeExamSet.className}</strong></span>
                  <span>•</span>
                  <span>Subject: <strong>{activeExamSet.subject}</strong></span>
                  <span>•</span>
                  <span>Term: <strong>{activeExamSet.academicTerm} ({activeExamSet.academicSession})</strong></span>
                  <span>•</span>
                  <span>Total Marks: <strong>{activeExamSet.totalMarks}</strong></span>
                </div>
              </div>

              {/* Student Details Fields */}
              <div className="grid grid-cols-2 gap-4 text-xs font-sans font-bold p-3 border border-slate-300 dark:border-slate-700 rounded-xl">
                <div>STUDENT NAME: _____________________________________</div>
                <div>ADM NO: __________________</div>
                <div>DATE: _______________________</div>
                <div>SCORE: _____ / {activeExamSet.totalMarks}</div>
              </div>

              {/* Instructions */}
              <div className="text-xs font-sans font-medium text-slate-800 dark:text-slate-200">
                <strong>INSTRUCTIONS:</strong> {activeExamSet.instructions || 'Answer all questions clearly. Show all calculations where necessary.'}
              </div>

              {/* Questions Section */}
              <div className="space-y-6 font-sans">
                {activeExamSet.questions.map((q, idx) => (
                  <div key={q.id} className="space-y-2 text-xs">
                    <div className="flex items-start justify-between font-bold">
                      <span>{idx + 1}. {q.questionText}</span>
                      <span className="shrink-0 text-slate-500">[{q.marks} Marks]</span>
                    </div>

                    {q.type === 'MULTIPLE_CHOICE' && q.options && (
                      <div className="grid grid-cols-2 gap-2 pl-4 text-slate-700 dark:text-slate-300 font-medium">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx}>{opt}</div>
                        ))}
                      </div>
                    )}

                    {/* If marking scheme mode active */}
                    {showMarkingSchemeInPrint && (
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-300 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 font-mono">
                        <strong>ANSWER:</strong> {q.correctAnswer} {q.explanation ? `| Note: ${q.explanation}` : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
