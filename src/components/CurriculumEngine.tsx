/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  Calendar
} from 'lucide-react';
import { useAppStore } from '../storage';
import { CurriculumSubject, CurriculumTopic } from '../types';

export const CurriculumEngine: React.FC = () => {
  const { school, classes, curricula, actions, currentUser } = useAppStore();
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSubject, setSelectedSubject] = useState<string>(school?.subjects[0] || 'Mathematics');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiPromptTopic, setAiPromptTopic] = useState<string>('');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];

  // Find or filter current active curriculum for selected class and subject
  const activeCurriculum = curricula.find(
    c => (c.classId === selectedClassId || c.className === activeClass?.name) && c.subject === selectedSubject
  );

  const topics: CurriculumTopic[] = activeCurriculum?.topics || [
    {
      id: 'topic_demo_1',
      weekNumber: 1,
      topic: 'Introduction & Core Concepts of ' + selectedSubject,
      subtopics: ['Fundamental Definitions', 'Standard Units & Principles'],
      learningObjectives: ['Define basic terminology', 'Apply foundational formulas'],
      activities: ['Classroom discussion and diagrammatic illustration'],
      assessmentMethod: 'Short Quiz',
      status: 'COMPLETED',
      actualTaughtDate: '2025-09-15'
    },
    {
      id: 'topic_demo_2',
      weekNumber: 2,
      topic: 'Intermediate Problem Solving & Applications',
      subtopics: ['Real-world Case Studies', 'Worked Examples'],
      learningObjectives: ['Solve multi-step exercises', 'Analyze sample problems'],
      activities: ['Group problem solving workshop'],
      assessmentMethod: 'Homework Assignment',
      status: 'IN_PROGRESS'
    },
    {
      id: 'topic_demo_3',
      weekNumber: 3,
      topic: 'Advanced Synthesis & Critical Analysis',
      subtopics: ['Complex Problem Sets', 'Practical Applications'],
      learningObjectives: ['Synthesize multi-concept solutions', 'Formulate hypothesis'],
      activities: ['Laboratory / Workshop session'],
      assessmentMethod: 'Continuous Assessment Test',
      status: 'NOT_STARTED'
    }
  ];

  const completedCount = topics.filter(t => t.status === 'COMPLETED').length;
  const inProgressCount = topics.filter(t => t.status === 'IN_PROGRESS').length;
  const behindCount = topics.filter(t => t.status === 'BEHIND').length;
  const progressPercent = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

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
      id: activeCurriculum?.id || `cur_${Date.now()}`,
      schoolId: school?.id || 'school_apex',
      classId: activeClass?.id || 'cls_1',
      className: activeClass?.name || 'Primary 5',
      subject: selectedSubject,
      academicSession: school?.academicSession || '2025/2026',
      academicTerm: school?.academicTerm || 'First Term',
      topics: updatedTopics,
      progressPercent: Math.round((updatedTopics.filter(t => t.status === 'COMPLETED').length / updatedTopics.length) * 100)
    };

    actions.saveCurriculum(newCurriculum);
  };

  const handleGenerateAICurriculum = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/suggest-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: activeClass?.name || 'SS 3',
          subject: selectedSubject,
          topic: aiPromptTopic || `Comprehensive 6-Week Scheme of Work for ${selectedSubject}`,
          subTopic: 'Syllabus Breakdown & Lesson Structure',
          prompt: `Generate a structured 6-week curriculum scheme of work for ${activeClass?.name} ${selectedSubject}.`
        })
      });

      const data = await response.json();
      const aiSuggestions = data.suggestions || {};

      // Build structured 6 week curriculum topics from AI response
      const generatedTopics: CurriculumTopic[] = Array.from({ length: 6 }).map((_, idx) => ({
        id: `cur_topic_${Date.now()}_${idx + 1}`,
        weekNumber: idx + 1,
        topic: idx === 0 && aiPromptTopic ? aiPromptTopic : `${selectedSubject} Module ${idx + 1}: ${aiSuggestions.title || 'Core Topic ' + (idx + 1)}`,
        subtopics: aiSuggestions.keyPoints || [`Subtopic ${idx + 1}.1`, `Subtopic ${idx + 1}.2`],
        learningObjectives: aiSuggestions.learningObjectives || [`Understand core concepts of week ${idx + 1}`],
        activities: aiSuggestions.activities || ['Interactive classroom lecture', 'Group problem solving'],
        assessmentMethod: idx % 2 === 0 ? 'Class Quiz' : 'Homework Assignment',
        status: idx === 0 ? 'COMPLETED' : idx === 1 ? 'IN_PROGRESS' : 'NOT_STARTED',
        actualTaughtDate: idx === 0 ? new Date().toISOString().split('T')[0] : undefined
      }));

      const newCurriculum: CurriculumSubject = {
        id: `cur_${selectedClassId}_${selectedSubject.replace(/\s+/g, '_')}`,
        schoolId: school?.id || 'school_apex',
        classId: activeClass?.id || selectedClassId,
        className: activeClass?.name || 'Class',
        subject: selectedSubject,
        academicSession: school?.academicSession || '2025/2026',
        academicTerm: school?.academicTerm || 'First Term',
        topics: generatedTopics,
        progressPercent: 17
      };

      actions.saveCurriculum(newCurriculum);
      setAiPromptTopic('');
    } catch (err) {
      console.error('AI Curriculum generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Brain className="h-4 w-4" />
              <span>Phase 8: AI Curriculum Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Curriculum & Scheme of Work Intelligence</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Real-time syllabus completion tracking, week-by-week topic status, and AI-powered curriculum generation aligned with Ministry & Examination Standards.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
            <BarChart3 className="h-8 w-8 text-indigo-300" />
            <div>
              <p className="text-[10px] font-bold text-slate-300 uppercase">Syllabus Coverage</p>
              <p className="text-2xl font-black text-emerald-400">{progressPercent}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selector Controls & AI Generator Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class & Subject Selector */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Select Class & Subject</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Target Class</label>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Academic Subject</label>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
              >
                {(school?.subjects || []).map(subj => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* AI Auto-Generator Box */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-slate-800 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>AI Scheme of Work Generator</span>
            </h2>
            <span className="text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full">
              Gemini Powered
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            Automatically generate a complete 6 to 12 week structured scheme of work with subtopics, learning objectives, and assessment plans for <strong className="text-indigo-700 dark:text-indigo-300">{activeClass?.name} - {selectedSubject}</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Optional focus topic e.g. Organic Chemistry & Hydrocarbons"
              value={aiPromptTopic}
              onChange={e => setAiPromptTopic(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleGenerateAICurriculum}
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate AI Scheme</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Completed</p>
            <p className="text-lg font-black text-slate-800 dark:text-slate-100">{completedCount} Topics</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">In Progress</p>
            <p className="text-lg font-black text-slate-800 dark:text-slate-100">{inProgressCount} Topics</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Behind Schedule</p>
            <p className="text-lg font-black text-slate-800 dark:text-slate-100">{behindCount} Topics</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl">
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
          <span className="text-indigo-600 dark:text-indigo-400">{progressPercent}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Topics Breakdown List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Week-by-Week Scheme of Work breakdown</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Click topic to view objectives & activities
          </span>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {topics.map((t) => {
            const isExpanded = expandedTopicId === t.id;
            return (
              <div key={t.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 cursor-pointer flex-1" onClick={() => setExpandedTopicId(isExpanded ? null : t.id)}>
                    <div className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold shrink-0">
                      Week {t.weekNumber}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.topic}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Subtopics: {t.subtopics.join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
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

                    <button
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
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl">
                      <p className="font-bold text-slate-700 dark:text-slate-300">Learning Objectives:</p>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                        {t.learningObjectives.map((obj, idx) => (
                          <li key={idx}>{obj}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl">
                      <p className="font-bold text-slate-700 dark:text-slate-300">Class Activities & Assessment:</p>
                      <p className="text-slate-600 dark:text-slate-400"><strong>Activities:</strong> {t.activities.join(', ')}</p>
                      <p className="text-slate-600 dark:text-slate-400"><strong>Assessment:</strong> {t.assessmentMethod}</p>
                      {t.actualTaughtDate && (
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Taught on: {t.actualTaughtDate}
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
  );
};
