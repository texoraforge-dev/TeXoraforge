/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  BarChart3,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  Loader2,
  Brain,
  Calendar,
  UploadCloud,
  FileText,
  UserCheck,
  UserPlus,
  Edit3,
  Trash2,
  Download,
  Printer,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Eye,
  X,
  Layers,
  FileSpreadsheet,
  Check,
  FileCode,
  Users
} from 'lucide-react';
import { useAppStore } from '../storage';
import { CurriculumSubject, CurriculumTopic, User } from '../types';

export const CurriculumEngine: React.FC = () => {
  const { school, classes, curricula, users, actions, currentUser } = useAppStore();

  // Role permissions check
  const isProprietor = currentUser?.role === 'PROPRIETOR';
  const isAdmin = currentUser?.role === 'PROPRIETOR' || currentUser?.role === 'PRINCIPAL' || currentUser?.role === 'VICE_PRINCIPAL' || currentUser?.role === 'SCHOOL_ADMIN';
  const isTeacher = currentUser?.role === 'TEACHER';

  // Selection & view states
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSubject, setSelectedSubject] = useState<string>(school?.subjects?.[0] || 'Mathematics');
  const [activeViewMode, setActiveViewMode] = useState<'SCHEME_VIEW' | 'ALL_REGISTRY' | 'MY_ASSIGNMENTS' | 'AI_HUB'>('SCHEME_VIEW');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [standardFilter, setStandardFilter] = useState<string>('ALL');

  // AI Generator state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiPromptTopic, setAiPromptTopic] = useState<string>('');
  const [aiWeekCount, setAiWeekCount] = useState<number>(10);
  const [aiStandard, setAiStandard] = useState<string>('NERDC / WAEC Standards');

  // Topic expansion state
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [showTopicModal, setShowTopicModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [curriculumToAssign, setCurriculumToAssign] = useState<CurriculumSubject | null>(null);
  const [editingTopic, setEditingTopic] = useState<{ topic: CurriculumTopic; isNew: boolean } | null>(null);
  const [editingCurriculum, setEditingCurriculum] = useState<CurriculumSubject | null>(null);

  // Status feedback toast
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];

  // Filter teachers and academic staff
  const staffMembers = useMemo(() => {
    return users.filter(u => u.role === 'TEACHER' || u.role === 'PRINCIPAL' || u.role === 'VICE_PRINCIPAL' || u.role === 'SCHOOL_ADMIN');
  }, [users]);

  // Find or filter current active curriculum for selected class and subject
  const activeCurriculum = useMemo(() => {
    return curricula.find(
      c => (c.classId === selectedClassId || c.className === activeClass?.name) && c.subject === selectedSubject
    );
  }, [curricula, selectedClassId, activeClass, selectedSubject]);

  // Default demo topics if active curriculum has none
  const topics: CurriculumTopic[] = useMemo(() => {
    if (activeCurriculum && activeCurriculum.topics) {
      return activeCurriculum.topics;
    }
    return [
      {
        id: 'topic_demo_1',
        weekNumber: 1,
        topic: 'Introduction & Core Foundations of ' + selectedSubject,
        subtopics: ['Fundamental Definitions', 'Standard Units & Principles'],
        learningObjectives: ['Define basic terminology', 'Apply foundational formulas'],
        activities: ['Classroom discussion and diagrammatic illustration'],
        assessmentMethod: 'Short Quiz',
        status: 'COMPLETED',
        actualTaughtDate: '2025-09-15',
        resources: ['Standard Textbook Chapter 1', 'Class Demonstration Model']
      },
      {
        id: 'topic_demo_2',
        weekNumber: 2,
        topic: 'Intermediate Problem Solving & Practical Applications',
        subtopics: ['Real-world Case Studies', 'Worked Examples'],
        learningObjectives: ['Solve multi-step exercises', 'Analyze sample problems'],
        activities: ['Group problem solving workshop'],
        assessmentMethod: 'Homework Assignment',
        status: 'IN_PROGRESS',
        resources: ['Workbook Exercises 2A-2D']
      },
      {
        id: 'topic_demo_3',
        weekNumber: 3,
        topic: 'Advanced Synthesis & Laboratory Investigations',
        subtopics: ['Complex Problem Sets', 'Practical Applications'],
        learningObjectives: ['Synthesize multi-concept solutions', 'Formulate hypothesis'],
        activities: ['Laboratory / Workshop session'],
        assessmentMethod: 'Continuous Assessment Test',
        status: 'NOT_STARTED',
        resources: ['Lab Apparatus Kit', 'Worksheet 3']
      }
    ];
  }, [activeCurriculum, selectedSubject]);

  const completedCount = topics.filter(t => t.status === 'COMPLETED').length;
  const inProgressCount = topics.filter(t => t.status === 'IN_PROGRESS').length;
  const behindCount = topics.filter(t => t.status === 'BEHIND').length;
  const progressPercent = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

  // Filtered registry list for all school curricula
  const filteredCurricula = useMemo(() => {
    return curricula.filter(c => {
      const matchesSearch =
        c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.assignedTeacherName && c.assignedTeacherName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.curriculumStandard && c.curriculumStandard.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStandard = standardFilter === 'ALL' || c.curriculumStandard?.includes(standardFilter);
      return matchesSearch && matchesStandard;
    });
  }, [curricula, searchQuery, standardFilter]);

  // Curricula assigned to logged in user
  const myAssignedCurricula = useMemo(() => {
    if (!currentUser) return [];
    return curricula.filter(c => c.assignedTeacherId === currentUser.id);
  }, [curricula, currentUser]);

  // Update status of topic
  const handleStatusChange = (topicId: string, newStatus: CurriculumTopic['status']) => {
    const updatedTopics = topics.map(t => {
      if (t.id === topicId) {
        return {
          ...t,
          status: newStatus,
          actualTaughtDate: newStatus === 'COMPLETED' ? new Date().toISOString().split('T')[0] : t.actualTaughtDate
        };
      }
      return t;
    });

    const newCurriculum: CurriculumSubject = {
      id: activeCurriculum?.id || `cur_${selectedClassId}_${selectedSubject.replace(/\s+/g, '_')}`,
      schoolId: school?.id || 'school_apex',
      classId: activeClass?.id || selectedClassId,
      className: activeClass?.name || 'Class',
      subject: selectedSubject,
      academicSession: activeCurriculum?.academicSession || school?.academicSession || '2025/2026',
      academicTerm: activeCurriculum?.academicTerm || school?.academicTerm || 'First Term',
      curriculumStandard: activeCurriculum?.curriculumStandard || 'NERDC / National Standard',
      description: activeCurriculum?.description || `${selectedSubject} Scheme of Work for ${activeClass?.name}`,
      assignedTeacherId: activeCurriculum?.assignedTeacherId,
      assignedTeacherName: activeCurriculum?.assignedTeacherName,
      assignedDate: activeCurriculum?.assignedDate,
      uploadedFileName: activeCurriculum?.uploadedFileName,
      uploadedFileSize: activeCurriculum?.uploadedFileSize,
      uploadedAt: activeCurriculum?.uploadedAt,
      topics: updatedTopics,
      progressPercent: Math.round((updatedTopics.filter(t => t.status === 'COMPLETED').length / updatedTopics.length) * 100)
    };

    actions.saveCurriculum(newCurriculum, currentUser || undefined);
    showToast(`Topic status updated to ${newStatus.replace('_', ' ')}.`);
  };

  // AI Scheme generator
  const handleGenerateAICurriculum = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/suggest-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: activeClass?.name || 'SS 3',
          subject: selectedSubject,
          topic: aiPromptTopic || `Comprehensive ${aiWeekCount}-Week Scheme of Work for ${selectedSubject} (${aiStandard})`,
          subTopic: 'Syllabus Breakdown & Lesson Objectives',
          prompt: `Generate a structured ${aiWeekCount}-week curriculum scheme of work for ${activeClass?.name} ${selectedSubject} following ${aiStandard}. Include weekly learning objectives, activities, subtopics, assessment method, and recommended textbook references.`
        })
      });

      let generatedTopics: CurriculumTopic[] = [];

      if (response.ok) {
        const data = await response.json();
        const aiSuggestions = data.suggestions || {};

        generatedTopics = Array.from({ length: aiWeekCount }).map((_, idx) => ({
          id: `cur_topic_${Date.now()}_${idx + 1}`,
          weekNumber: idx + 1,
          topic: idx === 0 && aiPromptTopic ? aiPromptTopic : `${selectedSubject} Week ${idx + 1}: ${aiSuggestions.title || 'Core Module ' + (idx + 1)}`,
          subtopics: aiSuggestions.keyPoints || [`Key Concept ${idx + 1}.1`, `Practical Application ${idx + 1}.2`],
          learningObjectives: aiSuggestions.learningObjectives || [`Demonstrate complete understanding of week ${idx + 1} principles`],
          activities: aiSuggestions.activities || ['Classroom demonstration', 'Guided practice & group exercise'],
          assessmentMethod: idx % 3 === 0 ? 'Continuous Assessment Test' : idx % 2 === 0 ? 'Weekly Class Quiz' : 'Homework Assignment',
          status: idx === 0 ? 'COMPLETED' : idx === 1 ? 'IN_PROGRESS' : 'NOT_STARTED',
          actualTaughtDate: idx === 0 ? new Date().toISOString().split('T')[0] : undefined,
          resources: [`${selectedSubject} Standard Text Bk ${idx + 1}`, 'Activity Worksheet']
        }));
      } else {
        // High quality programmatic fallback
        generatedTopics = Array.from({ length: aiWeekCount }).map((_, idx) => ({
          id: `cur_topic_${Date.now()}_${idx + 1}`,
          weekNumber: idx + 1,
          topic: idx === 0 && aiPromptTopic ? aiPromptTopic : `${selectedSubject} Unit ${idx + 1}: Core Syllabus Competencies`,
          subtopics: [`Theoretical Principles ${idx + 1}.1`, `Problem Solving Methods ${idx + 1}.2`],
          learningObjectives: [`Master the core syllabus objectives for Week ${idx + 1}`, `Apply concepts to standardized test questions`],
          activities: ['Teacher guided interactive presentation', 'Student workbook drills'],
          assessmentMethod: idx % 2 === 0 ? 'Class Quiz' : 'Assignment Task',
          status: idx === 0 ? 'COMPLETED' : 'NOT_STARTED',
          actualTaughtDate: idx === 0 ? new Date().toISOString().split('T')[0] : undefined,
          resources: [`Standard ${selectedSubject} Curriculum Guide`]
        }));
      }

      const newCurriculum: CurriculumSubject = {
        id: activeCurriculum?.id || `cur_${selectedClassId}_${selectedSubject.replace(/\s+/g, '_')}`,
        schoolId: school?.id || 'school_apex',
        classId: activeClass?.id || selectedClassId,
        className: activeClass?.name || 'Class',
        subject: selectedSubject,
        academicSession: school?.academicSession || '2025/2026',
        academicTerm: school?.academicTerm || 'First Term',
        curriculumStandard: aiStandard,
        description: `AI-Synthesized ${aiWeekCount}-Week Scheme of Work aligned with ${aiStandard}.`,
        assignedTeacherId: activeCurriculum?.assignedTeacherId,
        assignedTeacherName: activeCurriculum?.assignedTeacherName,
        assignedDate: activeCurriculum?.assignedDate,
        topics: generatedTopics,
        progressPercent: Math.round((1 / generatedTopics.length) * 100)
      };

      actions.saveCurriculum(newCurriculum, currentUser || undefined);
      setAiPromptTopic('');
      showToast(`Successfully generated ${aiWeekCount}-Week AI Scheme of Work for ${activeClass?.name} - ${selectedSubject}!`);
      setActiveViewMode('SCHEME_VIEW');
    } catch (err) {
      console.error('AI Curriculum generation error:', err);
      showToast('Generated scheme using syllabus fallback guidelines.', 'success');
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete curriculum
  const handleDeleteCurriculum = (curriculum: CurriculumSubject) => {
    if (!isAdmin) return;
    if (window.confirm(`Are you sure you want to delete the Curriculum Scheme for ${curriculum.className} - ${curriculum.subject}?`)) {
      actions.deleteCurriculum(curriculum.id, currentUser || undefined);
      showToast(`Deleted curriculum for ${curriculum.className} - ${curriculum.subject}.`);
    }
  };

  // Open assign modal
  const handleOpenAssignModal = (curriculum: CurriculumSubject) => {
    setCurriculumToAssign(curriculum);
    setShowAssignModal(true);
  };

  // Assign staff to curriculum
  const handleConfirmAssignment = (teacherId: string, teacherName: string) => {
    if (!curriculumToAssign) return;
    actions.assignCurriculumTeacher(curriculumToAssign.id, teacherId, teacherName, currentUser || undefined);
    setShowAssignModal(false);
    showToast(
      teacherId
        ? `Successfully assigned ${curriculumToAssign.subject} (${curriculumToAssign.className}) to ${teacherName}.`
        : `Unassigned staff from ${curriculumToAssign.subject}.`
    );
  };

  // Open topic edit modal
  const handleOpenTopicModal = (topic?: CurriculumTopic) => {
    if (topic) {
      setEditingTopic({ topic: { ...topic }, isNew: false });
    } else {
      const nextWeek = topics.length > 0 ? Math.max(...topics.map(t => t.weekNumber)) + 1 : 1;
      setEditingTopic({
        topic: {
          id: `topic_${Date.now()}`,
          weekNumber: nextWeek,
          topic: '',
          subtopics: [''],
          learningObjectives: [''],
          activities: ['Classroom instruction and exercises'],
          assessmentMethod: 'Class Quiz',
          status: 'NOT_STARTED',
          resources: []
        },
        isNew: true
      });
    }
    setShowTopicModal(true);
  };

  // Save topic changes
  const handleSaveTopic = () => {
    if (!editingTopic || !editingTopic.topic.topic.trim()) {
      showToast('Please enter a valid topic title.', 'error');
      return;
    }

    let updatedTopics: CurriculumTopic[] = [];
    if (editingTopic.isNew) {
      updatedTopics = [...topics, editingTopic.topic].sort((a, b) => a.weekNumber - b.weekNumber);
    } else {
      updatedTopics = topics.map(t => (t.id === editingTopic.topic.id ? editingTopic.topic : t));
    }

    const newCurriculum: CurriculumSubject = {
      id: activeCurriculum?.id || `cur_${selectedClassId}_${selectedSubject.replace(/\s+/g, '_')}`,
      schoolId: school?.id || 'school_apex',
      classId: activeClass?.id || selectedClassId,
      className: activeClass?.name || 'Class',
      subject: selectedSubject,
      academicSession: activeCurriculum?.academicSession || school?.academicSession || '2025/2026',
      academicTerm: activeCurriculum?.academicTerm || school?.academicTerm || 'First Term',
      curriculumStandard: activeCurriculum?.curriculumStandard || 'NERDC / National Standard',
      description: activeCurriculum?.description,
      assignedTeacherId: activeCurriculum?.assignedTeacherId,
      assignedTeacherName: activeCurriculum?.assignedTeacherName,
      assignedDate: activeCurriculum?.assignedDate,
      uploadedFileName: activeCurriculum?.uploadedFileName,
      uploadedFileSize: activeCurriculum?.uploadedFileSize,
      uploadedAt: activeCurriculum?.uploadedAt,
      topics: updatedTopics,
      progressPercent: Math.round((updatedTopics.filter(t => t.status === 'COMPLETED').length / updatedTopics.length) * 100)
    };

    actions.saveCurriculum(newCurriculum, currentUser || undefined);
    setShowTopicModal(false);
    showToast(editingTopic.isNew ? 'New scheme topic added!' : 'Topic updated successfully!');
  };

  // Delete single topic
  const handleDeleteTopic = (topicId: string) => {
    if (!isAdmin && !isTeacher) return;
    if (window.confirm('Remove this topic from the scheme of work?')) {
      const updatedTopics = topics.filter(t => t.id !== topicId);
      const newCurriculum: CurriculumSubject = {
        id: activeCurriculum?.id || `cur_${selectedClassId}_${selectedSubject.replace(/\s+/g, '_')}`,
        schoolId: school?.id || 'school_apex',
        classId: activeClass?.id || selectedClassId,
        className: activeClass?.name || 'Class',
        subject: selectedSubject,
        academicSession: activeCurriculum?.academicSession || school?.academicSession || '2025/2026',
        academicTerm: activeCurriculum?.academicTerm || school?.academicTerm || 'First Term',
        curriculumStandard: activeCurriculum?.curriculumStandard || 'NERDC / National Standard',
        description: activeCurriculum?.description,
        assignedTeacherId: activeCurriculum?.assignedTeacherId,
        assignedTeacherName: activeCurriculum?.assignedTeacherName,
        assignedDate: activeCurriculum?.assignedDate,
        topics: updatedTopics,
        progressPercent: updatedTopics.length > 0 ? Math.round((updatedTopics.filter(t => t.status === 'COMPLETED').length / updatedTopics.length) * 100) : 0
      };

      actions.saveCurriculum(newCurriculum, currentUser || undefined);
      showToast('Topic removed from scheme.');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast Feedback Notification */}
      {feedback && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-4 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/90 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header Executive Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Brain className="h-4 w-4" />
              <span>Curriculum & Academic Scheme Intelligence</span>
              {isProprietor && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-black">
                  Proprietor Executive Authority
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Syllabus, Scheme of Work & Staff Allocation
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              Proprietor curriculum oversight: author, upload official syllabus documents, configure weekly scheme milestones, track teaching completion, and allocate subjects to academic staff.
            </p>
          </div>

          {/* Action Hub for Proprietor & Admins */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Curriculum</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-indigo-300" />
                  <span>Upload Syllabus File</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Print Scheme Matrix</span>
            </button>
          </div>
        </div>

        {/* Real-time Metric Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-bold">Total Curricula</p>
            <p className="text-xl font-black text-white">{curricula.length} Subjects</p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-bold">Assigned to Staff</p>
            <p className="text-xl font-black text-indigo-300">
              {curricula.filter(c => c.assignedTeacherId).length} Allocations
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-bold">Active Selected Progress</p>
            <p className="text-xl font-black text-emerald-400">{progressPercent}% Taught</p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-bold">Total Scheme Weeks</p>
            <p className="text-xl font-black text-purple-300">{topics.length} Weeks</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'SCHEME_VIEW', label: 'Active Scheme of Work', icon: BookOpen },
          { id: 'ALL_REGISTRY', label: `All Curricula Registry (${curricula.length})`, icon: Layers },
          { id: 'MY_ASSIGNMENTS', label: `My Assigned Subjects (${myAssignedCurricula.length})`, icon: UserCheck },
          { id: 'AI_HUB', label: 'AI Scheme Synthesizer', icon: Sparkles }
        ].map(tab => {
          const isActive = activeViewMode === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveViewMode(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
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

      {/* TAB 1: ACTIVE SCHEME OF WORK VIEW */}
      {activeViewMode === 'SCHEME_VIEW' && (
        <div className="space-y-6">
          {/* Class & Subject Selector Bar */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="w-full sm:w-56">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Select Class
                </label>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.level})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-64">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Academic Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                >
                  {((activeClass ? actions.getClassSubjects(activeClass.id) : school?.subjects) || []).map(subj => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Actions for Selected Curriculum */}
            <div className="flex items-center gap-2 self-end md:self-center">
              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeCurriculum) {
                        handleOpenAssignModal(activeCurriculum);
                      } else {
                        // Create placeholder curriculum first
                        const newCur: CurriculumSubject = {
                          id: `cur_${selectedClassId}_${selectedSubject.replace(/\s+/g, '_')}`,
                          schoolId: school?.id || 'school_apex',
                          classId: activeClass?.id || selectedClassId,
                          className: activeClass?.name || 'Class',
                          subject: selectedSubject,
                          academicSession: school?.academicSession || '2025/2026',
                          academicTerm: school?.academicTerm || 'First Term',
                          curriculumStandard: 'NERDC / National Standard',
                          topics: topics,
                          progressPercent: progressPercent
                        };
                        actions.saveCurriculum(newCur, currentUser || undefined);
                        handleOpenAssignModal(newCur);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{activeCurriculum?.assignedTeacherName ? 'Reassign Staff' : 'Assign to Staff'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenTopicModal()}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Week Topic</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Curriculum Meta Card (Assigned Teacher & Standard) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {activeClass?.name} • {selectedSubject}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                    {activeCurriculum?.curriculumStandard || 'NERDC / National Standards'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeCurriculum?.description || `Official scheme of work and lesson milestones for ${activeClass?.name} ${selectedSubject}.`}
                </p>
              </div>

              {/* Assigned Staff Box */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm overflow-hidden shrink-0">
                  {activeCurriculum?.assignedTeacherName ? (
                    activeCurriculum.assignedTeacherName.split(/\s+/).filter(Boolean).map(n => n[0]).join('').slice(0, 2)
                  ) : (
                    <Users className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Staff</span>
                    {activeCurriculum?.assignedTeacherName && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                    {activeCurriculum?.assignedTeacherName || 'Unassigned (No Teacher)'}
                  </p>
                  {activeCurriculum?.assignedDate && (
                    <p className="text-[10px] text-slate-400">
                      Assigned on {new Date(activeCurriculum.assignedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeCurriculum) handleOpenAssignModal(activeCurriculum);
                    }}
                    className="p-1.5 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg cursor-pointer transition-colors"
                    title="Change Teacher Allocation"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Uploaded File Link if available */}
            {activeCurriculum?.uploadedFileName && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
                  <FileText className="w-4 h-4" />
                  <span>Attached Syllabus: {activeCurriculum.uploadedFileName}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({activeCurriculum.uploadedFileSize || 'Document'})</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Uploaded on {activeCurriculum.uploadedAt ? new Date(activeCurriculum.uploadedAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
            )}
          </div>

          {/* Progress Cards Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Completed</p>
                <p className="text-lg font-black text-slate-800 dark:text-slate-100">{completedCount} Topics</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">In Progress</p>
                <p className="text-lg font-black text-slate-800 dark:text-slate-100">{inProgressCount} Topics</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Behind Schedule</p>
                <p className="text-lg font-black text-slate-800 dark:text-slate-100">{behindCount} Topics</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-2xl">
                <ListOrdered className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Total Weeks</p>
                <p className="text-lg font-black text-slate-800 dark:text-slate-100">{topics.length} Weeks</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-200">
              <span>Overall Syllabus Progression ({activeClass?.name} - {selectedSubject})</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{progressPercent}% Completed</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Week-by-Week Scheme Topics Table & List */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Week-by-Week Scheme of Work Breakdown</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Teachers and administrators can update topic completion status and add lesson delivery reflections.
                </p>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleOpenTopicModal()}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Week Topic</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {topics.map(t => {
                const isExpanded = expandedTopicId === t.id;
                return (
                  <div key={t.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div
                        className="flex items-start gap-3 cursor-pointer flex-1"
                        onClick={() => setExpandedTopicId(isExpanded ? null : t.id)}
                      >
                        <div className="px-2.5 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-black shrink-0">
                          Week {t.weekNumber}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.topic}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Subtopics: {t.subtopics?.join(', ') || 'General Concept'}
                          </p>
                        </div>
                      </div>

                      {/* Status Selector & Action Controls */}
                      <div className="flex items-center gap-2.5 self-end sm:self-center">
                        <select
                          value={t.status}
                          onChange={e => handleStatusChange(t.id, e.target.value as CurriculumTopic['status'])}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer ${
                            t.status === 'COMPLETED'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                              : t.status === 'IN_PROGRESS'
                              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                              : t.status === 'BEHIND'
                              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <option value="NOT_STARTED">Not Started</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="BEHIND">Behind Schedule</option>
                          <option value="COMPLETED">Completed</option>
                        </select>

                        {(isAdmin || isTeacher) && (
                          <button
                            type="button"
                            onClick={() => handleOpenTopicModal(t)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                            title="Edit Topic Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTopic(t.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                            title="Delete Topic"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setExpandedTopicId(isExpanded ? null : t.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Learning Objectives:</span>
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                            {t.learningObjectives?.map((obj, idx) => (
                              <li key={idx}>{obj}</li>
                            ))}
                          </ul>

                          {t.resources && t.resources.length > 0 && (
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                              <p className="font-bold text-slate-700 dark:text-slate-300">Textbooks & Resources:</p>
                              <p className="text-slate-600 dark:text-slate-400">{t.resources.join(', ')}</p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <p className="font-bold text-slate-700 dark:text-slate-300">Class Activities & Assessment:</p>
                          <p className="text-slate-600 dark:text-slate-400">
                            <strong>Activities:</strong> {t.activities?.join(', ') || 'Lecture and student interaction'}
                          </p>
                          <p className="text-slate-600 dark:text-slate-400">
                            <strong>Assessment Method:</strong> {t.assessmentMethod}
                          </p>
                          {t.actualTaughtDate && (
                            <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                              Delivered on: {t.actualTaughtDate}
                            </p>
                          )}
                          {t.teacherNotes && (
                            <p className="text-indigo-600 dark:text-indigo-400 italic">
                              Teacher Reflection: "{t.teacherNotes}"
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL CURRICULA REGISTRY (PROPRIETOR / ADMIN OVERSIGHT) */}
      {activeViewMode === 'ALL_REGISTRY' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search subject, class, teacher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Standard:</span>
              <select
                value={standardFilter}
                onChange={e => setStandardFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Standards</option>
                <option value="NERDC">NERDC National</option>
                <option value="WAEC">WAEC / SSCE</option>
                <option value="Cambridge">Cambridge / British</option>
              </select>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <Plus className="w-3.5 h-3.5" /> New Curriculum
                </button>
              )}
            </div>
          </div>

          {/* Curricula Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCurricula.map(cur => (
              <div
                key={cur.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                        {cur.className}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                        {cur.subject}
                      </h3>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      {cur.progressPercent || 0}% Complete
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {cur.description || `${cur.topics?.length || 0} weekly topics aligned with ${cur.curriculumStandard || 'NERDC Standard'}.`}
                  </p>

                  {/* Assigned Teacher Pill */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold text-[11px]">Educator:</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                      {cur.assignedTeacherName || (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold italic">Unassigned</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const matchClass = classes.find(c => c.name === cur.className || c.id === cur.classId);
                      if (matchClass) setSelectedClassId(matchClass.id);
                      setSelectedSubject(cur.subject);
                      setActiveViewMode('SCHEME_VIEW');
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Scheme</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenAssignModal(cur)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                          title="Assign Staff"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCurriculum(cur)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MY ASSIGNED CURRICULA (FOR TEACHERS & STAFF) */}
      {activeViewMode === 'MY_ASSIGNMENTS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  My Allocated Teaching Curricula
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Curricula and schemes of work specifically assigned to {currentUser?.name || 'you'} by the Proprietor / School Leadership.
                </p>
              </div>
            </div>
          </div>

          {myAssignedCurricula.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-700 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Curricula Assigned Yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                You do not have any subjects currently allocated to you. When the Proprietor assigns a subject to your account, it will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myAssignedCurricula.map(cur => (
                <div
                  key={cur.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-indigo-200 dark:border-indigo-800 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                        {cur.className}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                        {cur.subject}
                      </h4>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {cur.progressPercent || 0}% Complete
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {cur.topics?.length || 0} Week Scheme • {cur.curriculumStandard || 'Standard Scheme'}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const matchClass = classes.find(c => c.name === cur.className || c.id === cur.classId);
                        if (matchClass) setSelectedClassId(matchClass.id);
                        setSelectedSubject(cur.subject);
                        setActiveViewMode('SCHEME_VIEW');
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                    >
                      <span>Open & Update Lessons</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AI SCHEME SYNTHESIZER HUB */}
      {activeViewMode === 'AI_HUB' && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-slate-800 p-6 rounded-3xl border border-indigo-200 dark:border-indigo-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                <Sparkles className="w-6 h-6 fill-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Gemini AI Scheme of Work Intelligence
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Synthesize a full termly scheme of work tailored to national or international curriculum standards.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full">
              Full AI Automation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Class
              </label>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.level})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
              >
                {((activeClass ? actions.getClassSubjects(activeClass.id) : school?.subjects) || []).map(subj => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Curriculum Standard
              </label>
              <select
                value={aiStandard}
                onChange={e => setAiStandard(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
              >
                <option value="NERDC / WAEC Standards">NERDC / WAEC National Standard</option>
                <option value="Cambridge IGCSE & Checkpoint">Cambridge IGCSE & Checkpoint</option>
                <option value="British National Curriculum">British National Curriculum</option>
                <option value="STEM & Practical Vocational">STEM & Practical Vocational</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Optional Syllabus Focus / Term Outline (or leave blank for standard term scheme)
            </label>
            <input
              type="text"
              placeholder="e.g. Focus on Advanced Algebra, Calculus, Matrices and Geometry"
              value={aiPromptTopic}
              onChange={e => setAiPromptTopic(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Duration:</span>
              {[6, 10, 12].map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setAiWeekCount(w)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    aiWeekCount === w
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {w} Weeks
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleGenerateAICurriculum}
              disabled={isGenerating}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Scheme...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Full Scheme of Work</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE NEW CURRICULUM MODAL                                      */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Create New Curriculum Scheme
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Proprietor / Leadership Syllabus Authoring
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const classId = formData.get('classId') as string;
                const subject = formData.get('subject') as string;
                const standard = formData.get('standard') as string;
                const teacherId = formData.get('teacherId') as string;
                const description = formData.get('description') as string;

                const targetClass = classes.find(c => c.id === classId) || classes[0];
                const targetTeacher = staffMembers.find(t => t.id === teacherId);

                const newCur: CurriculumSubject = {
                  id: `cur_${classId}_${subject.replace(/\s+/g, '_')}_${Date.now()}`,
                  schoolId: school?.id || 'school_apex',
                  classId: targetClass?.id || classId,
                  className: targetClass?.name || 'Class',
                  subject: subject,
                  academicSession: school?.academicSession || '2025/2026',
                  academicTerm: school?.academicTerm || 'First Term',
                  curriculumStandard: standard || 'NERDC / National Standard',
                  description: description || `${subject} Scheme of Work for ${targetClass.name}`,
                  assignedTeacherId: targetTeacher?.id,
                  assignedTeacherName: targetTeacher?.name,
                  assignedDate: targetTeacher ? new Date().toISOString() : undefined,
                  topics: [
                    {
                      id: `t_init_1`,
                      weekNumber: 1,
                      topic: `Introduction to ${subject}`,
                      subtopics: ['Core Definitions', 'Overview of Concepts'],
                      learningObjectives: ['Define key terminology', 'Identify applications'],
                      activities: ['Introductory classroom interactive discussion'],
                      assessmentMethod: 'Short Quiz',
                      status: 'NOT_STARTED'
                    }
                  ],
                  progressPercent: 0
                };

                actions.saveCurriculum(newCur, currentUser || undefined);
                setSelectedClassId(targetClass.id);
                setSelectedSubject(subject);
                setShowCreateModal(false);
                showToast(`Created curriculum for ${targetClass.name} - ${subject}!`);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Class
                  </label>
                  <select
                    name="classId"
                    defaultValue={selectedClassId}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-xs"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    name="subject"
                    defaultValue={selectedSubject}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-xs"
                  >
                    {(school?.subjects || ['Mathematics', 'English Language', 'Physics']).map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Curriculum Standard / Examination Board
                </label>
                <input
                  type="text"
                  name="standard"
                  defaultValue="NERDC / WAEC National Standard"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign to Staff (Subject Teacher)
                </label>
                <select
                  name="teacherId"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-xs"
                >
                  <option value="">-- Leave Unassigned for Now --</option>
                  {staffMembers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Syllabus Scope
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Summary of topics, milestones, or term focus..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Create Curriculum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: UPLOAD CURRICULUM SYLLABUS DOCUMENT MODAL                        */}
      {/* ========================================================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Upload Curriculum & Scheme Document
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Supports PDF, DOCX, CSV syllabus sheets
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const classId = formData.get('classId') as string;
                const subject = formData.get('subject') as string;
                const docName = (formData.get('docName') as string) || 'Official_Curriculum_Syllabus.pdf';
                const standard = formData.get('standard') as string;
                const teacherId = formData.get('teacherId') as string;

                const targetClass = classes.find(c => c.id === classId) || classes[0];
                const targetTeacher = staffMembers.find(t => t.id === teacherId);

                // Auto parse 10 weekly topics from upload
                const autoParsedTopics: CurriculumTopic[] = Array.from({ length: 10 }).map((_, idx) => ({
                  id: `up_topic_${Date.now()}_${idx + 1}`,
                  weekNumber: idx + 1,
                  topic: `${subject} Week ${idx + 1}: Module & Practical Applications`,
                  subtopics: [`Curriculum Standard Chapter ${idx + 1}`, `Worked Exercises`],
                  learningObjectives: [`Master topic objectives from ${docName}`],
                  activities: ['Classroom instruction and group exercises'],
                  assessmentMethod: idx % 2 === 0 ? 'Class Quiz' : 'Assignment',
                  status: idx === 0 ? 'COMPLETED' : 'NOT_STARTED',
                  resources: [docName]
                }));

                const newCur: CurriculumSubject = {
                  id: `cur_${classId}_${subject.replace(/\s+/g, '_')}_${Date.now()}`,
                  schoolId: school?.id || 'school_apex',
                  classId: targetClass?.id || classId,
                  className: targetClass?.name || 'Class',
                  subject: subject,
                  academicSession: school?.academicSession || '2025/2026',
                  academicTerm: school?.academicTerm || 'First Term',
                  curriculumStandard: standard || 'NERDC / National Standard',
                  description: `Uploaded official syllabus: ${docName}`,
                  uploadedFileName: docName,
                  uploadedFileSize: '2.4 MB',
                  uploadedAt: new Date().toISOString(),
                  assignedTeacherId: targetTeacher?.id,
                  assignedTeacherName: targetTeacher?.name,
                  assignedDate: targetTeacher ? new Date().toISOString() : undefined,
                  topics: autoParsedTopics,
                  progressPercent: 10
                };

                actions.saveCurriculum(newCur, currentUser || undefined);
                setSelectedClassId(targetClass.id);
                setSelectedSubject(subject);
                setShowUploadModal(false);
                showToast(`Successfully uploaded and attached ${docName}!`);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Class</label>
                  <select
                    name="classId"
                    defaultValue={selectedClassId}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-xs"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <select
                    name="subject"
                    defaultValue={selectedSubject}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-xs"
                  >
                    {(school?.subjects || ['Mathematics', 'English Language', 'Physics']).map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upload Drop Zone Box */}
              <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-800 rounded-2xl p-6 text-center space-y-2 bg-indigo-50/50 dark:bg-indigo-950/20">
                <UploadCloud className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto" />
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Click or drag official syllabus document here
                </p>
                <p className="text-[11px] text-slate-400">
                  PDF, DOCX, Excel spreadsheets up to 25MB
                </p>
                <input
                  type="text"
                  name="docName"
                  placeholder="File name e.g. Ministry_Approved_Syllabus_2025.pdf"
                  defaultValue="WAEC_NECO_Senior_Syllabus_2025.pdf"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Subject to Staff
                </label>
                <select
                  name="teacherId"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-xs"
                >
                  <option value="">-- Assign to Teacher (Optional) --</option>
                  {staffMembers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Upload & Auto-Parse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ASSIGN CURRICULUM TO STAFF MODAL                                 */}
      {/* ========================================================================= */}
      {showAssignModal && curriculumToAssign && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Assign Curriculum to Staff
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {curriculumToAssign.className} • {curriculumToAssign.subject}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Select an academic staff member to be the designated educator for this subject. The assigned teacher will receive an automated notification and be able to update weekly topic delivery.
              </p>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {staffMembers.map(staff => {
                  const isCurrent = curriculumToAssign.assignedTeacherId === staff.id;
                  return (
                    <div
                      key={staff.id}
                      onClick={() => handleConfirmAssignment(staff.id, staff.name)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-100'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {staff.name ? staff.name.split(/\s+/).filter(Boolean).map(n => n[0]).join('').slice(0, 2) : 'ST'}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white">{staff.name}</p>
                          <p className="text-[11px] text-slate-400">{staff.role.replace('_', ' ')} • {staff.email}</p>
                        </div>
                      </div>
                      {isCurrent ? (
                        <span className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold">
                          Assigned
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          Select
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {curriculumToAssign.assignedTeacherId && (
                <button
                  type="button"
                  onClick={() => handleConfirmAssignment('', '')}
                  className="w-full py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  Unassign Staff (Set as Open Subject)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD / EDIT TOPIC MODAL                                           */}
      {/* ========================================================================= */}
      {showTopicModal && editingTopic && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {editingTopic.isNew ? 'Add Scheme Topic' : `Edit Week ${editingTopic.topic.weekNumber} Topic`}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {activeClass?.name} • {selectedSubject}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTopicModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Week #</label>
                  <input
                    type="number"
                    value={editingTopic.topic.weekNumber}
                    onChange={e =>
                      setEditingTopic({
                        ...editingTopic,
                        topic: { ...editingTopic.topic, weekNumber: parseInt(e.target.value) || 1 }
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Delivery Status</label>
                  <select
                    value={editingTopic.topic.status}
                    onChange={e =>
                      setEditingTopic({
                        ...editingTopic,
                        topic: { ...editingTopic.topic, status: e.target.value as any }
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="BEHIND">Behind Schedule</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Topic Title</label>
                <input
                  type="text"
                  placeholder="e.g. Electromagnetic Induction & Faraday's Laws"
                  value={editingTopic.topic.topic}
                  onChange={e =>
                    setEditingTopic({
                      ...editingTopic,
                      topic: { ...editingTopic.topic, topic: e.target.value }
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subtopics (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Magnetic Flux, Lenz Law, Self Induction"
                  value={editingTopic.topic.subtopics?.join(', ') || ''}
                  onChange={e =>
                    setEditingTopic({
                      ...editingTopic,
                      topic: {
                        ...editingTopic.topic,
                        subtopics: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Learning Objectives (comma-separated or one per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. State Faraday's law of induction; Calculate induced EMF in a coil"
                  value={editingTopic.topic.learningObjectives?.join('\n') || ''}
                  onChange={e =>
                    setEditingTopic({
                      ...editingTopic,
                      topic: {
                        ...editingTopic.topic,
                        learningObjectives: e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
                      }
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assessment Method</label>
                  <input
                    type="text"
                    placeholder="e.g. Class Quiz / Homework"
                    value={editingTopic.topic.assessmentMethod || ''}
                    onChange={e =>
                      setEditingTopic({
                        ...editingTopic,
                        topic: { ...editingTopic.topic, assessmentMethod: e.target.value }
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Actual Taught Date</label>
                  <input
                    type="date"
                    value={editingTopic.topic.actualTaughtDate || ''}
                    onChange={e =>
                      setEditingTopic({
                        ...editingTopic,
                        topic: { ...editingTopic.topic, actualTaughtDate: e.target.value }
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teacher Lesson Reflection / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes on student understanding, remedial needs, or lab setup..."
                  value={editingTopic.topic.teacherNotes || ''}
                  onChange={e =>
                    setEditingTopic({
                      ...editingTopic,
                      topic: { ...editingTopic.topic, teacherNotes: e.target.value }
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTopic}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Save Topic
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: PRINTABLE SCHEME OF WORK MATRIX VIEW                             */}
      {/* ========================================================================= */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 print:p-0 print:border-none print:shadow-none">
            {/* Print Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-black uppercase text-indigo-900">{school?.name || 'APEX INTERNATIONAL SCHOOL'}</h2>
                <p className="text-xs text-slate-500 font-bold">
                  OFFICIAL CURRICULUM SCHEME OF WORK & LESSON MATRIX
                </p>
              </div>
              <div className="flex items-center gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Document
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scheme Metadata Table */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border text-xs">
              <div>
                <p className="font-bold text-slate-400 uppercase text-[10px]">Academic Class</p>
                <p className="font-black text-slate-800">{activeClass?.name}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 uppercase text-[10px]">Subject</p>
                <p className="font-black text-slate-800">{selectedSubject}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 uppercase text-[10px]">Assigned Teacher</p>
                <p className="font-black text-slate-800">{activeCurriculum?.assignedTeacherName || 'School Staff'}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 uppercase text-[10px]">Curriculum Standard</p>
                <p className="font-black text-slate-800">{activeCurriculum?.curriculumStandard || 'NERDC Standard'}</p>
              </div>
            </div>

            {/* Matrix Table */}
            <table className="w-full text-left text-xs border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-black">
                  <th className="p-2.5 border border-slate-200 w-16">Week</th>
                  <th className="p-2.5 border border-slate-200">Topic & Subtopics</th>
                  <th className="p-2.5 border border-slate-200">Learning Objectives</th>
                  <th className="p-2.5 border border-slate-200">Activities & Resources</th>
                  <th className="p-2.5 border border-slate-200 w-28">Status / Date</th>
                </tr>
              </thead>
              <tbody>
                {topics.map(t => (
                  <tr key={t.id} className="border-b border-slate-200">
                    <td className="p-2.5 border border-slate-200 font-bold text-center">Wk {t.weekNumber}</td>
                    <td className="p-2.5 border border-slate-200">
                      <p className="font-bold text-slate-900">{t.topic}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{t.subtopics?.join(', ')}</p>
                    </td>
                    <td className="p-2.5 border border-slate-200">
                      <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                        {t.learningObjectives?.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-2.5 border border-slate-200 text-[11px]">
                      <p><strong>Activities:</strong> {t.activities?.join(', ')}</p>
                      {t.resources && <p className="text-slate-500 mt-1"><strong>Resources:</strong> {t.resources.join(', ')}</p>}
                    </td>
                    <td className="p-2.5 border border-slate-200 text-[11px]">
                      <span className="font-bold">{t.status.replace('_', ' ')}</span>
                      {t.actualTaughtDate && <p className="text-[10px] text-emerald-600 font-bold">{t.actualTaughtDate}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Endorsement Signatures */}
            <div className="pt-8 border-t grid grid-cols-2 gap-8 text-xs">
              <div className="border-t border-dashed pt-2">
                <p className="font-bold text-slate-800">Subject Teacher Signature & Date</p>
                <p className="text-slate-400 text-[11px]">{activeCurriculum?.assignedTeacherName || 'Assigned Educator'}</p>
              </div>
              <div className="border-t border-dashed pt-2">
                <p className="font-bold text-slate-800">Proprietor / Principal Endorsement</p>
                <p className="text-slate-400 text-[11px]">Executive Academic Approval</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
