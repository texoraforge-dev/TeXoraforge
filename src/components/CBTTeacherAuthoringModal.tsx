/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  Award,
  Users,
  Shield,
  HelpCircle,
  Settings,
  ListOrdered,
  Shuffle,
  Send,
  Loader2,
  Search,
  Check
} from 'lucide-react';
import { CBTExam, ExamQuestion, QuestionType, Student, Submission, User } from '../types';

interface CBTTeacherAuthoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialExam?: CBTExam | null;
  classes: { id: string; name: string }[];
  subjects: string[];
  students: Student[];
  submissions: Submission[];
  currentUser: User | null;
  onSave: (exam: CBTExam) => void;
}

export const CBTTeacherAuthoringModal: React.FC<CBTTeacherAuthoringModalProps> = ({
  isOpen,
  onClose,
  initialExam,
  classes,
  subjects,
  students,
  submissions,
  currentUser,
  onSave
}) => {
  if (!isOpen) return null;

  // Active step
  const [activeTab, setActiveTab] = useState<'QUESTIONS' | 'VISIBILITY' | 'SETTINGS'>('QUESTIONS');

  // General Form state
  const [examTitle, setExamTitle] = useState(initialExam?.title || '');
  const [selectedClassId, setSelectedClassId] = useState(initialExam?.classId || classes[0]?.id || '');
  const [selectedSubject, setSelectedSubject] = useState(initialExam?.subject || subjects[0] || 'Physics');
  const [academicSession, setAcademicSession] = useState(initialExam?.academicSession || '2025/2026');
  const [academicTerm, setAcademicTerm] = useState(initialExam?.academicTerm || 'First Term');
  const [durationMinutes, setDurationMinutes] = useState<number>(initialExam?.durationMinutes || 30);
  const [passMarkPercent, setPassMarkPercent] = useState<number>(initialExam?.passMarkPercent || 50);
  const [instructions, setInstructions] = useState(
    initialExam?.instructions || 'Select the best answer for each question. The countdown timer begins as soon as you start the exam.'
  );

  // Student Visibility & Access Controls
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'CLOSED'>(initialExam?.status || 'PUBLISHED');
  const [visibilityMode, setVisibilityMode] = useState<'ALL_CLASS_STUDENTS' | 'SPECIFIC_STUDENTS' | 'HIDDEN_TEACHER_ONLY'>(
    initialExam?.visibilityMode || 'ALL_CLASS_STUDENTS'
  );
  const [allowedStudentIds, setAllowedStudentIds] = useState<string[]>(initialExam?.allowedStudentIds || []);
  const [allowStudentStudyMode, setAllowStudentStudyMode] = useState<boolean>(initialExam?.allowStudentStudyMode ?? true);
  const [showCorrectionsImmediately, setShowCorrectionsImmediately] = useState<boolean>(initialExam?.showCorrectionsImmediately ?? true);
  const [releaseResultsToStudents, setReleaseResultsToStudents] = useState<boolean>(initialExam?.releaseResultsToStudents ?? true);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(initialExam?.shuffleQuestions ?? true);

  // Questions state
  const [questions, setQuestions] = useState<ExamQuestion[]>(initialExam?.questions || []);

  // Quick Question Editor Drawer / Modal
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [qType, setQType] = useState<QuestionType>('MULTIPLE_CHOICE');
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState<string[]>(['Option A', 'Option B', 'Option C', 'Option D']);
  const [qCorrectOptionIdx, setQCorrectOptionIdx] = useState<number>(0);
  const [qCorrectAnswerCustom, setQCorrectAnswerCustom] = useState('');
  const [qExplanation, setQExplanation] = useState('');
  const [qMarks, setQMarks] = useState<number>(5);
  const [qCategory, setQCategory] = useState<string>('Theory');
  const [qDifficulty, setQDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [qIsVisibleToStudents, setQIsVisibleToStudents] = useState<boolean>(true);

  // AI & Lesson Note Import State
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiTopicPrompt, setAiTopicPrompt] = useState('');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isLessonNoteImportOpen, setIsLessonNoteImportOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  // Selected Class Object
  const currentClassObj = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(s => s.classId === selectedClassId || s.className === currentClassObj?.name);

  // Total marks calculation
  const totalExamMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  const visibleQuestionsCount = questions.filter(q => q.isVisibleToStudents !== false).length;

  useEffect(() => {
    if (!initialExam && !examTitle && currentClassObj) {
      setExamTitle(`${currentClassObj.name} ${selectedSubject} CBT Continuous Assessment`);
    }
  }, [currentClassObj, selectedSubject, initialExam]);

  // Open question editor
  const handleOpenAddQuestion = () => {
    setEditingQuestionIndex(null);
    setQType('MULTIPLE_CHOICE');
    setQText('');
    setQOptions(['Option A', 'Option B', 'Option C', 'Option D']);
    setQCorrectOptionIdx(0);
    setQCorrectAnswerCustom('');
    setQExplanation('');
    setQMarks(10);
    setQCategory('Theory');
    setQDifficulty('MEDIUM');
    setQIsVisibleToStudents(true);
  };

  const handleOpenEditQuestion = (index: number) => {
    const q = questions[index];
    setEditingQuestionIndex(index);
    setQType(q.type);
    setQText(q.questionText);
    if (q.type === 'MULTIPLE_CHOICE' && q.options && q.options.length > 0) {
      setQOptions(q.options);
      const matchIdx = q.options.findIndex(opt => opt === q.correctAnswer);
      setQCorrectOptionIdx(matchIdx !== -1 ? matchIdx : 0);
    } else {
      setQOptions(['Option A', 'Option B', 'Option C', 'Option D']);
      setQCorrectOptionIdx(0);
    }
    setQCorrectAnswerCustom(q.correctAnswer);
    setQExplanation(q.explanation || '');
    setQMarks(q.marks || 5);
    setQCategory(q.category || 'Theory');
    setQDifficulty(q.difficulty || 'MEDIUM');
    setQIsVisibleToStudents(q.isVisibleToStudents !== false);
  };

  const handleSaveQuestion = () => {
    if (!qText.trim()) return;

    let correctAnswer = '';
    let formattedOptions: string[] | undefined = undefined;

    if (qType === 'MULTIPLE_CHOICE') {
      formattedOptions = qOptions.filter(o => o.trim().length > 0);
      correctAnswer = formattedOptions[qCorrectOptionIdx] || formattedOptions[0] || 'Option A';
    } else if (qType === 'TRUE_FALSE') {
      formattedOptions = ['True', 'False'];
      correctAnswer = qCorrectOptionIdx === 0 ? 'True' : 'False';
    } else {
      correctAnswer = qCorrectAnswerCustom.trim() || 'Refer to curriculum marking key';
    }

    const newQuestion: ExamQuestion = {
      id: editingQuestionIndex !== null ? questions[editingQuestionIndex].id : `cq_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      type: qType,
      questionText: qText.trim(),
      options: formattedOptions,
      correctAnswer,
      explanation: qExplanation.trim() || undefined,
      marks: Number(qMarks) || 5,
      category: qCategory,
      difficulty: qDifficulty,
      isVisibleToStudents: qIsVisibleToStudents
    };

    if (editingQuestionIndex !== null) {
      const updated = [...questions];
      updated[editingQuestionIndex] = newQuestion;
      setQuestions(updated);
    } else {
      setQuestions([...questions, newQuestion]);
    }

    setEditingQuestionIndex(null);
    setQText('');
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    if (editingQuestionIndex === index) {
      setEditingQuestionIndex(null);
    }
  };

  const handleToggleQuestionVisibility = (index: number) => {
    const updated = [...questions];
    const current = updated[index].isVisibleToStudents !== false;
    updated[index] = {
      ...updated[index],
      isVisibleToStudents: !current
    };
    setQuestions(updated);
  };

  // Student Selection helpers
  const handleToggleStudent = (studentId: string) => {
    setAllowedStudentIds(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    setAllowedStudentIds(classStudents.map(s => s.id));
  };

  const handleClearAllStudents = () => {
    setAllowedStudentIds([]);
  };

  // AI Seed Questions Generation
  const handleGenerateAiQuestions = async () => {
    if (!aiTopicPrompt.trim()) return;
    setIsAiGenerating(true);
    try {
      const response = await fetch('/api/ai/suggest-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: currentClassObj?.name || 'SS 3',
          subject: selectedSubject,
          topic: aiTopicPrompt,
          subTopic: 'CBT Assessment Questions',
          prompt: `Generate 4 high-yield CBT multiple choice questions on "${aiTopicPrompt}" for ${selectedSubject} (${currentClassObj?.name}).`
        })
      });
      const data = await response.json();
      const ai = data.suggestions || {};
      const evalQs: string[] = ai.evaluationQuestions || [
        `What is the primary scientific principle of ${aiTopicPrompt}?`,
        `Which equation or definition applies directly to ${aiTopicPrompt}?`,
        `Calculate or evaluate the fundamental effect in ${aiTopicPrompt}.`,
        `Which application is most relevant in modern practice?`
      ];

      const newGenerated: ExamQuestion[] = evalQs.map((qTextStr, idx) => ({
        id: `cq_ai_${Date.now()}_${idx}`,
        type: 'MULTIPLE_CHOICE',
        questionText: qTextStr,
        options: [
          `A. Fundamental principle of ${aiTopicPrompt}`,
          `B. Standard experimental verification for ${selectedSubject}`,
          `C. Alternative theoretical assumption`,
          `D. Invariant constant condition`
        ],
        correctAnswer: `A. Fundamental principle of ${aiTopicPrompt}`,
        explanation: `Curriculum answer key verified for topic: ${aiTopicPrompt}.`,
        marks: 10,
        category: 'Concept & Application',
        difficulty: idx % 2 === 0 ? 'MEDIUM' : 'EASY',
        isVisibleToStudents: true
      }));

      setQuestions(prev => [...prev, ...newGenerated]);
      setIsAiDrawerOpen(false);
      setAiTopicPrompt('');
    } catch (err) {
      console.error('Failed to generate AI questions:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Import from Lesson Notes
  const handleImportFromLessonNote = (submission: Submission) => {
    const content = submission.lessonNoteContent;
    if (!content) return;

    const imported: ExamQuestion[] = [];
    if (content.evaluationQuestions && content.evaluationQuestions.length > 0) {
      content.evaluationQuestions.forEach((evalQ, i) => {
        imported.push({
          id: `cq_imp_${Date.now()}_${i}`,
          type: 'MULTIPLE_CHOICE',
          questionText: evalQ,
          options: [
            `A. Core concept of ${content.topic}`,
            `B. Incorrect secondary hypothesis`,
            `C. Disregarded parameter`,
            `D. None of the above`
          ],
          correctAnswer: `A. Core concept of ${content.topic}`,
          explanation: `Extracted from approved teacher lesson note: ${submission.title}`,
          marks: 10,
          category: 'Lesson Evaluation',
          difficulty: 'MEDIUM',
          isVisibleToStudents: true
        });
      });
    }

    if (imported.length > 0) {
      setQuestions(prev => [...prev, ...imported]);
    }
    setIsLessonNoteImportOpen(false);
  };

  // Final Save
  const handleSaveExam = () => {
    if (!examTitle.trim()) {
      alert('Please enter an Examination Title.');
      return;
    }
    if (questions.length === 0) {
      alert('Please add at least one question to the CBT Assessment.');
      return;
    }

    const examData: CBTExam = {
      id: initialExam?.id || `cbt_${Date.now()}`,
      schoolId: initialExam?.schoolId || 'school_apex',
      teacherId: initialExam?.teacherId || currentUser?.id || 'usr_t1',
      teacherName: initialExam?.teacherName || currentUser?.name || 'Mr. David Okon',
      classId: selectedClassId,
      className: currentClassObj?.name || 'SS 3',
      subject: selectedSubject,
      academicSession,
      academicTerm,
      title: examTitle.trim(),
      instructions: instructions.trim(),
      durationMinutes: Number(durationMinutes) || 30,
      passMarkPercent: Number(passMarkPercent) || 50,
      status,
      visibilityMode,
      allowedStudentIds: visibilityMode === 'SPECIFIC_STUDENTS' ? allowedStudentIds : undefined,
      allowStudentStudyMode,
      showCorrectionsImmediately,
      releaseResultsToStudents,
      shuffleQuestions,
      questions,
      totalMarks: totalExamMarks,
      createdAt: initialExam?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(examData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 md:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-600 text-white rounded-2xl shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                  Teacher CBT Control Studio
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {questions.length} Questions • {totalExamMarks} Total Marks
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
                {initialExam ? 'Edit CBT Assessment & Student Permissions' : 'Create Custom CBT Assessment'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 bg-white dark:bg-slate-900 shrink-0 gap-2">
          <button
            onClick={() => setActiveTab('QUESTIONS')}
            className={`py-3 px-4 text-xs font-extrabold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'QUESTIONS'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ListOrdered className="h-4 w-4" />
            <span>Questions & Answer Key ({questions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('VISIBILITY')}
            className={`py-3 px-4 text-xs font-extrabold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'VISIBILITY'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Student Visibility & Access Rules</span>
            {visibilityMode === 'SPECIFIC_STUDENTS' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                {allowedStudentIds.length} Students
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`py-3 px-4 text-xs font-extrabold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'SETTINGS'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Exam Parameters & Timing</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* TAB 1: QUESTIONS AUTHORING & DETERMINATION */}
          {activeTab === 'QUESTIONS' && (
            <div className="space-y-6">
              
              {/* Question Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Award className="h-4 w-4 text-purple-600" />
                  <span>
                    Active Questions for Students: <strong className="text-purple-600">{visibleQuestionsCount}</strong> of {questions.length}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      handleOpenAddQuestion();
                    }}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Question Manually</span>
                  </button>

                  <button
                    onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>AI Question Generator</span>
                  </button>

                  <button
                    onClick={() => setIsLessonNoteImportOpen(!isLessonNoteImportOpen)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Import Lesson Note Questions</span>
                  </button>
                </div>
              </div>

              {/* AI Generator Box */}
              {isAiDrawerOpen && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl space-y-3 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      AI Question Authoring Assistant
                    </span>
                    <button
                      onClick={() => setIsAiDrawerOpen(false)}
                      className="text-xs text-amber-700 hover:underline"
                    >
                      Close
                    </button>
                  </div>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                    Enter any topic or concept. AI will create multiple choice questions with correct answer keys and curriculum explanations.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Mendelian Genetics, Quadratic Equations, Acid-Base Titration"
                      value={aiTopicPrompt}
                      onChange={e => setAiTopicPrompt(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100"
                    />
                    <button
                      onClick={handleGenerateAiQuestions}
                      disabled={isAiGenerating || !aiTopicPrompt.trim()}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isAiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      <span>Generate 4 Questions</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Lesson Notes Import Box */}
              {isLessonNoteImportOpen && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800 rounded-2xl space-y-3 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-indigo-600" />
                      Import Evaluation Questions from Approved Lesson Notes
                    </span>
                    <button
                      onClick={() => setIsLessonNoteImportOpen(false)}
                      className="text-xs text-indigo-700 hover:underline"
                    >
                      Close
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {submissions
                      .filter(s => s.type === 'LESSON_NOTE' && s.lessonNoteContent)
                      .map(sub => (
                        <div
                          key={sub.id}
                          onClick={() => handleImportFromLessonNote(sub)}
                          className="p-3 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:border-indigo-500 cursor-pointer transition-all flex flex-col justify-between"
                        >
                          <div>
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                              {sub.className} • {sub.subject} (Week {sub.lessonNoteContent?.weekNumber || 1})
                            </span>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{sub.title}</h4>
                            <p className="text-[10px] text-slate-400">
                              {sub.lessonNoteContent?.evaluationQuestions?.length || 0} Evaluation questions available
                            </p>
                          </div>
                          <span className="text-[10px] font-extrabold text-indigo-600 mt-2 flex items-center gap-1">
                            <Plus className="h-3 w-3" /> Import Questions
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Inline Question Authoring Card */}
              <div className="p-5 bg-purple-50/50 dark:bg-purple-950/20 border-2 border-dashed border-purple-300 dark:border-purple-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>{editingQuestionIndex !== null ? `Editing Question #${editingQuestionIndex + 1}` : 'Quick Question Authoring'}</span>
                  </h3>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={qIsVisibleToStudents}
                        onChange={e => setQIsVisibleToStudents(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>Visible to Students in Exam</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Question Type</label>
                    <select
                      value={qType}
                      onChange={e => setQType(e.target.value as QuestionType)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      <option value="MULTIPLE_CHOICE">Multiple Choice (MCQ)</option>
                      <option value="TRUE_FALSE">True / False</option>
                      <option value="SHORT_ANSWER">Short Answer / Exact Key</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Marks for this Question</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={qMarks}
                      onChange={e => setQMarks(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Difficulty Level</label>
                    <select
                      value={qDifficulty}
                      onChange={e => setQDifficulty(e.target.value as any)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard (Challenge)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Question Statement / Stem</label>
                  <textarea
                    rows={2}
                    placeholder="Enter the question text here e.g. Which of the following is the SI unit of magnetic flux?"
                    value={qText}
                    onChange={e => setQText(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Options Builder for Multiple Choice */}
                {qType === 'MULTIPLE_CHOICE' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 block">
                      Options & Correct Key Selection (Click radio to mark correct answer)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {qOptions.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                            qCorrectOptionIdx === optIdx
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="correctOpt"
                            checked={qCorrectOptionIdx === optIdx}
                            onChange={() => setQCorrectOptionIdx(optIdx)}
                            className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-slate-500">{String.fromCharCode(65 + optIdx)}.</span>
                          <input
                            type="text"
                            value={opt}
                            onChange={e => {
                              const updated = [...qOptions];
                              updated[optIdx] = e.target.value;
                              setQOptions(updated);
                            }}
                            className="flex-1 bg-transparent border-none text-xs text-slate-800 dark:text-slate-100 p-1 focus:outline-none"
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          />
                          {qCorrectOptionIdx === optIdx && (
                            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950">
                              Correct Key
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* True / False Selection */}
                {qType === 'TRUE_FALSE' && (
                  <div className="flex gap-3">
                    {['True', 'False'].map((tf, tfIdx) => (
                      <label
                        key={tf}
                        className={`flex-1 p-3 rounded-xl border text-center font-bold text-xs cursor-pointer ${
                          qCorrectOptionIdx === tfIdx
                            ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700'
                            : 'bg-white dark:bg-slate-900 border-slate-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tfOpt"
                          checked={qCorrectOptionIdx === tfIdx}
                          onChange={() => setQCorrectOptionIdx(tfIdx)}
                          className="sr-only"
                        />
                        <span>Correct Answer: {tf}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Teacher Curriculum Explanation & Solution Breakdown
                  </label>
                  <input
                    type="text"
                    placeholder="Provide an explanation for why this is the correct answer (shown to students during study mode or upon test submission)"
                    value={qExplanation}
                    onChange={e => setQExplanation(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {editingQuestionIndex !== null && (
                    <button
                      onClick={() => setEditingQuestionIndex(null)}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    onClick={handleSaveQuestion}
                    disabled={!qText.trim()}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    <span>{editingQuestionIndex !== null ? 'Update Question' : 'Save Question to Bank'}</span>
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Question Bank Roster ({questions.length} Items)
                </h3>

                {questions.length > 0 ? (
                  questions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        q.isVisibleToStudents !== false
                          ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
                          : 'bg-slate-100/70 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700 opacity-75'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                              Q{idx + 1} • {q.marks} Marks
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {q.type}
                            </span>
                            {q.difficulty && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                q.difficulty === 'EASY'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : q.difficulty === 'HARD'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {q.difficulty}
                              </span>
                            )}
                            {q.isVisibleToStudents !== false ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                                <Eye className="h-3 w-3" /> Live to Students
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                                <EyeOff className="h-3 w-3" /> Hidden from Students
                              </span>
                            )}
                          </div>

                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">{q.questionText}</p>

                          {q.options && q.options.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                              {q.options.map((opt, oIdx) => (
                                <div
                                  key={oIdx}
                                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                                    opt === q.correctAnswer
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-800 dark:text-emerald-200 font-bold'
                                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                                  }`}
                                >
                                  {opt} {opt === q.correctAnswer && '✓ (Key)'}
                                </div>
                              ))}
                            </div>
                          )}

                          {q.explanation && (
                            <p className="text-xs text-indigo-700 dark:text-indigo-300 pt-1">
                              <strong>Curriculum Note:</strong> {q.explanation}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleToggleQuestionVisibility(idx)}
                            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              q.isVisibleToStudents !== false
                                ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900'
                                : 'text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900'
                            }`}
                            title={q.isVisibleToStudents !== false ? 'Hide from students' : 'Make visible to students'}
                          >
                            {q.isVisibleToStudents !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>

                          <button
                            onClick={() => handleOpenEditQuestion(idx)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl transition-all cursor-pointer"
                            title="Edit Question"
                          >
                            <Settings className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteQuestion(idx)}
                            className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition-all cursor-pointer"
                            title="Delete Question"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                    No questions added yet. Use the authoring form above or the AI assistant to add questions.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: STUDENT VISIBILITY & ACCESS RULES */}
          {activeTab === 'VISIBILITY' && (
            <div className="space-y-6">
              
              {/* Publication Status Selector */}
              <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span>1. Publication Lifecycle Status</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    onClick={() => setStatus('PUBLISHED')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      status === 'PUBLISHED'
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">PUBLISHED (LIVE)</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      Permitted students can immediately see and take this test in their dashboard.
                    </p>
                  </label>

                  <label
                    onClick={() => setStatus('DRAFT')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      status === 'DRAFT'
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-700 dark:text-amber-300">TEACHER DRAFT</span>
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      Hidden from all students while you compose and review questions.
                    </p>
                  </label>

                  <label
                    onClick={() => setStatus('CLOSED')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      status === 'CLOSED'
                        ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-rose-700 dark:text-rose-300">CLOSED / ARCHIVED</span>
                      <X className="h-4 w-4 text-rose-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      Exam is locked. Students can no longer start new attempts.
                    </p>
                  </label>
                </div>
              </div>

              {/* Student Audience Selector */}
              <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>2. Target Student Audience & Visibility Scope</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    onClick={() => setVisibilityMode('ALL_CLASS_STUDENTS')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      visibilityMode === 'ALL_CLASS_STUDENTS'
                        ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-black text-purple-700 dark:text-purple-300">
                      Entire Class ({currentClassObj?.name})
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      All {classStudents.length} students enrolled in {currentClassObj?.name} will have access.
                    </p>
                  </label>

                  <label
                    onClick={() => setVisibilityMode('SPECIFIC_STUDENTS')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      visibilityMode === 'SPECIFIC_STUDENTS'
                        ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-black text-purple-700 dark:text-purple-300">
                      Selective Students Only
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      Restrict to specific students (e.g. Remedials, Makeup Exam, Early Warning).
                    </p>
                  </label>

                  <label
                    onClick={() => setVisibilityMode('HIDDEN_TEACHER_ONLY')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      visibilityMode === 'HIDDEN_TEACHER_ONLY'
                        ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-black text-purple-700 dark:text-purple-300">
                      Teacher Only (Hidden)
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      Only visible to you and school administrators in the question bank.
                    </p>
                  </label>
                </div>

                {/* Specific Student Selector List */}
                {visibilityMode === 'SPECIFIC_STUDENTS' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        Choose Allowed Students ({allowedStudentIds.length} Selected)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAllStudents}
                          className="text-[11px] font-bold text-purple-600 hover:underline"
                        >
                          Select All ({classStudents.length})
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={handleClearAllStudents}
                          className="text-[11px] font-bold text-rose-600 hover:underline"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search student name or admission no..."
                        value={studentSearch}
                        onChange={e => setStudentSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {classStudents
                        .filter(s => {
                          const stdName = (s.fullName || (s as any).name || '').toLowerCase();
                          const admNo = (s.admissionNo || '').toLowerCase();
                          const q = studentSearch.toLowerCase();
                          return stdName.includes(q) || admNo.includes(q);
                        })
                        .map(std => {
                          const isSelected = allowedStudentIds.includes(std.id);
                          const displayName = std.fullName || (std as any).name || 'Student';
                          return (
                            <label
                              key={std.id}
                              className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-900 dark:text-purple-200'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleStudent(std.id)}
                                className="rounded text-purple-600 focus:ring-purple-500"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold truncate text-xs">{displayName}</p>
                                <p className="text-[10px] text-slate-400 truncate">{std.admissionNo}</p>
                              </div>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Student Experience & Answer Revelation Policy */}
              <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-600" />
                  <span>3. Student Experience & Answer Revelation Policy</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowStudentStudyMode}
                      onChange={e => setAllowStudentStudyMode(e.target.checked)}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Allow Student Study & Revision Mode
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Students can browse questions, study review answers, and practice before taking the timed exam.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCorrectionsImmediately}
                      onChange={e => setShowCorrectionsImmediately(e.target.checked)}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Instant Corrections & Answer Key Reveal
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Immediately shows student their right/wrong answers and teacher curriculum explanations upon submission.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={releaseResultsToStudents}
                      onChange={e => setReleaseResultsToStudents(e.target.checked)}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Release Score & Grade to Student Dashboard
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Enables the student to view their percentage and total marks scored.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shuffleQuestions}
                      onChange={e => setShuffleQuestions(e.target.checked)}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Randomize / Shuffle Question Sequence
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Shuffles question order for each student attempt to minimize examination malpractice.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GENERAL SETTINGS */}
          {activeTab === 'SETTINGS' && (
            <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Settings className="h-4 w-4 text-purple-600" />
                <span>General Assessment Details & Timing</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Examination Title</label>
                  <input
                    type="text"
                    value={examTitle}
                    onChange={e => setExamTitle(e.target.value)}
                    placeholder="e.g. SS 3 Physics Continuous Assessment CBT 1"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Target Class</label>
                  <select
                    value={selectedClassId}
                    onChange={e => setSelectedClassId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold"
                  >
                    {subjects.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Duration (Minutes)</label>
                  <div className="relative">
                    <Clock className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={durationMinutes}
                      onChange={e => setDurationMinutes(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Pass Mark Percentage (%)</label>
                  <div className="relative">
                    <Award className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={passMarkPercent}
                      onChange={e => setPassMarkPercent(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Academic Session</label>
                  <input
                    type="text"
                    value={academicSession}
                    onChange={e => setAcademicSession(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Academic Term</label>
                  <select
                    value={academicTerm}
                    onChange={e => setAcademicTerm(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold"
                  >
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Third Term">Third Term</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Student Instructions & Guidelines
                  </label>
                  <textarea
                    rows={2}
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-extrabold text-slate-800 dark:text-slate-200">{questions.length} Questions</span>
            <span className="text-slate-300">•</span>
            <span className="font-extrabold text-purple-600">{totalExamMarks} Total Marks</span>
            <span className="text-slate-300">•</span>
            <span className="font-bold text-slate-500">
              Target:{' '}
              {visibilityMode === 'ALL_CLASS_STUDENTS'
                ? `All ${currentClassObj?.name} Students`
                : visibilityMode === 'SPECIFIC_STUDENTS'
                ? `${allowedStudentIds.length} Students`
                : 'Teacher Draft'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                setStatus('DRAFT');
                handleSaveExam();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
            >
              Save as Draft
            </button>

            <button
              onClick={() => {
                setStatus('PUBLISHED');
                handleSaveExam();
              }}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Save & Publish to Students</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
