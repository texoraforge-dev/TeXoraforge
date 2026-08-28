/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  FileText,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '../../storage';
import { Submission, LessonNoteContent } from '../../types';

interface LessonNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingSubmission?: Submission | null;
}

export const LessonNoteModal: React.FC<LessonNoteModalProps> = ({
  isOpen,
  onClose,
  existingSubmission
}) => {
  const { school, currentUser, classes, actions } = useAppStore();

  // Filter classes & subjects
  const availableClasses = currentUser && currentUser.role === 'TEACHER' && currentUser.assignedClassIds && currentUser.assignedClassIds.length > 0
    ? classes.filter(c => currentUser.assignedClassIds.includes(c.id))
    : classes;

  const availableSubjects = currentUser && currentUser.role === 'TEACHER' && currentUser.assignedSubjects && currentUser.assignedSubjects.length > 0
    ? currentUser.assignedSubjects
    : (school?.id ? actions.getSchoolSubjects(school.id) : ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Basic Science & Tech']);

  // Form State
  const [classId, setClassId] = useState(existingSubmission?.classId || availableClasses[0]?.id || '');
  const [subject, setSubject] = useState(existingSubmission?.subject || availableSubjects?.[0] || 'Mathematics');
  const [title, setTitle] = useState(existingSubmission?.title || '');
  const [weekNumber, setWeekNumber] = useState<number>(existingSubmission?.lessonNoteContent?.weekNumber || 3);
  const [durationMinutes, setDurationMinutes] = useState<number>(existingSubmission?.lessonNoteContent?.durationMinutes || 80);
  const [topic, setTopic] = useState(existingSubmission?.lessonNoteContent?.topic || '');
  const [subTopic, setSubTopic] = useState(existingSubmission?.lessonNoteContent?.subTopic || '');

  const [behavioralObjectives, setBehavioralObjectives] = useState<string[]>(
    existingSubmission?.lessonNoteContent?.behavioralObjectives || ['Define the key concept clearly.', 'List at least 3 practical real-world applications.']
  );

  const [instructionalMaterials, setInstructionalMaterials] = useState<string[]>(
    existingSubmission?.lessonNoteContent?.instructionalMaterials || ['Whiteboard & Markers', 'Textbooks', 'Chart Diagrams']
  );

  const [introduction, setIntroduction] = useState(existingSubmission?.lessonNoteContent?.introduction || '');

  const [coreContentSteps, setCoreContentSteps] = useState(
    existingSubmission?.lessonNoteContent?.coreContentSteps || [
      { stepNumber: 1, title: 'Step 1: Introduction & Demonstration', teacherActivity: 'Explain core concept and show visual diagram.', studentActivity: 'Observe and note down key definitions.' },
      { stepNumber: 2, title: 'Step 2: Guided Class Activity', teacherActivity: 'Work through example problem on board.', studentActivity: 'Solve sample questions in exercise books.' }
    ]
  );

  const [evaluationQuestions, setEvaluationQuestions] = useState<string[]>(
    existingSubmission?.lessonNoteContent?.evaluationQuestions || ['State two characteristics of the topic.', 'Solve Question 1 from the board.']
  );

  const [assignment, setAssignment] = useState(existingSubmission?.lessonNoteContent?.assignment || '');

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  if (!isOpen || !currentUser || !school) return null;

  // Auto-generate content using Gemini API endpoint
  const handleAiAutoFill = async () => {
    if (!topic || !subject) {
      setAiError('Please enter a Topic and select a Subject first before generating with AI.');
      return;
    }

    setAiError('');
    setIsAiGenerating(true);

    const targetClassObj = classes.find(c => c.id === classId);

    try {
      const res = await fetch('/api/ai/suggest-lesson', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          topic,
          subject,
          className: targetClassObj?.name || 'Secondary Class',
          durationMinutes
        })
      });

      const contentType = res.headers.get('content-type') || '';
      const rawText = await res.text();

      if (!res.ok) {
        throw new Error(`AI request failed (HTTP ${res.status}): ${rawText.slice(0, 150)}`);
      }

      if (!contentType.includes('application/json')) {
        throw new Error(`Unexpected server response format (${contentType})`);
      }

      const json = JSON.parse(rawText);
      if (!json.success || !json.data) {
        throw new Error(json.error || 'AI generation failed');
      }

      const data = json.data;
      if (data.subTopic) setSubTopic(data.subTopic);
      if (data.behavioralObjectives) setBehavioralObjectives(data.behavioralObjectives);
      if (data.instructionalMaterials) setInstructionalMaterials(data.instructionalMaterials);
      if (data.introduction) setIntroduction(data.introduction);
      if (data.coreContentSteps) setCoreContentSteps(data.coreContentSteps);
      if (data.evaluationQuestions) setEvaluationQuestions(data.evaluationQuestions);
      if (data.assignment) setAssignment(data.assignment);
      if (!title) setTitle(`${topic} Lesson Note`);

    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Failed to connect to AI Assistant service.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClassObj = classes.find(c => c.id === classId);

    const lessonNoteContent: LessonNoteContent = {
      weekNumber,
      durationMinutes,
      topic,
      subTopic,
      behavioralObjectives,
      instructionalMaterials,
      introduction,
      coreContentSteps,
      summary: `Lesson note for ${topic} covering key objectives and practical exercises.`,
      evaluationQuestions,
      assignment
    };

    if (existingSubmission) {
      actions.updateSubmission(existingSubmission.id, {
        title: title || `${topic} Lesson Note`,
        classId,
        className: targetClassObj?.name || 'Class',
        subject,
        lessonNoteContent,
        status: 'PENDING' // reset to pending on resubmission
      });
    } else {
      actions.createSubmission({
        schoolId: school.id,
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        classId,
        className: targetClassObj?.name || 'Class',
        subject,
        type: 'LESSON_NOTE',
        title: title || `${topic} Lesson Note`,
        lessonNoteContent
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 my-8 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              {existingSubmission ? 'Edit & Resubmit Lesson Note' : 'Create Structured Lesson Note'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Prepare a comprehensive curriculum note for Principal review.
            </p>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* AI Generator Helper Button Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold flex items-center gap-1.5 text-indigo-300">
              <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
              Gemini Curriculum Assistant
            </h3>
            <p className="text-[11px] text-slate-300">
              Enter a Topic and Subject below, then click to auto-generate objectives, teaching steps & questions!
            </p>
          </div>

          <button
            type="button"
            onClick={handleAiAutoFill}
            disabled={isAiGenerating}
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isAiGenerating ? 'Generating Content...' : '✨ AI Auto-Fill Lesson Note'}
          </button>
        </div>

        {aiError && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Class Level *</label>
              <select
                value={classId}
                onChange={e => setClassId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              >
                {availableClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              >
                {availableSubjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Week & Duration</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={weekNumber}
                  onChange={e => setWeekNumber(Number(e.target.value))}
                  placeholder="Week #"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
                <input
                  type="number"
                  step={10}
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  placeholder="Duration (mins)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Main Topic *</label>
              <input
                type="text"
                required
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Electromagnetic Induction"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sub-Topic</label>
              <input
                type="text"
                value={subTopic}
                onChange={e => setSubTopic(e.target.value)}
                placeholder="e.g. Faraday's Law & Lenz's Law"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          {/* Behavioral Objectives */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Behavioral Objectives</label>
              <button
                type="button"
                onClick={() => setBehavioralObjectives([...behavioralObjectives, ''])}
                className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add Objective
              </button>
            </div>
            <div className="space-y-2">
              {behavioralObjectives.map((obj, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={obj}
                    onChange={e => {
                      const updated = [...behavioralObjectives];
                      updated[idx] = e.target.value;
                      setBehavioralObjectives(updated);
                    }}
                    placeholder={`Objective ${idx + 1}...`}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  {behavioralObjectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setBehavioralObjectives(behavioralObjectives.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructional Materials */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Teaching Aids / Instructional Materials</label>
            <input
              type="text"
              value={instructionalMaterials.join(', ')}
              onChange={e => setInstructionalMaterials(e.target.value.split(',').map(s => s.trim()))}
              placeholder="Separate with commas (e.g. Bar Magnets, Galvanometer, Coils)"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* Core Content Steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Presentation Steps & Methodology</label>
              <button
                type="button"
                onClick={() => setCoreContentSteps([
                  ...coreContentSteps,
                  { stepNumber: coreContentSteps.length + 1, title: `Step ${coreContentSteps.length + 1}: `, teacherActivity: '', studentActivity: '' }
                ])}
                className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add Step
              </button>
            </div>

            <div className="space-y-3">
              {coreContentSteps.map((step, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={step.title}
                      onChange={e => {
                        const updated = [...coreContentSteps];
                        updated[idx].title = e.target.value;
                        setCoreContentSteps(updated);
                      }}
                      className="font-bold text-slate-900 dark:text-white bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none px-1"
                    />
                    {coreContentSteps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setCoreContentSteps(coreContentSteps.filter((_, i) => i !== idx))}
                        className="text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <textarea
                      rows={2}
                      value={step.teacherActivity}
                      onChange={e => {
                        const updated = [...coreContentSteps];
                        updated[idx].teacherActivity = e.target.value;
                        setCoreContentSteps(updated);
                      }}
                      placeholder="Teacher Activity..."
                      className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <textarea
                      rows={2}
                      value={step.studentActivity}
                      onChange={e => {
                        const updated = [...coreContentSteps];
                        updated[idx].studentActivity = e.target.value;
                        setCoreContentSteps(updated);
                      }}
                      placeholder="Student Activity..."
                      className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluation & Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Evaluation Questions (One per line)</label>
              <textarea
                rows={3}
                value={evaluationQuestions.join('\n')}
                onChange={e => setEvaluationQuestions(e.target.value.split('\n'))}
                placeholder="Enter evaluation questions..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assignment / Homework</label>
              <textarea
                rows={3}
                value={assignment}
                onChange={e => setAssignment(e.target.value)}
                placeholder="Enter homework instructions or textbook page exercises..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md cursor-pointer"
            >
              Submit Lesson Note for Review
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
