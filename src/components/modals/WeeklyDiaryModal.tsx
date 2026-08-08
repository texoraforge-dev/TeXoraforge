/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Tag,
  GraduationCap
} from 'lucide-react';
import { useAppStore } from '../../storage';
import { Submission, WeeklyDiaryContent } from '../../types';

interface WeeklyDiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingSubmission?: Submission | null;
}

export const WeeklyDiaryModal: React.FC<WeeklyDiaryModalProps> = ({
  isOpen,
  onClose,
  existingSubmission
}) => {
  const { school, currentUser, classes, actions } = useAppStore();

  const availableClasses = currentUser && currentUser.role === 'TEACHER' && currentUser.assignedClassIds.length > 0
    ? classes.filter(c => currentUser.assignedClassIds.includes(c.id))
    : classes;

  const availableSubjects = currentUser && currentUser.role === 'TEACHER' && currentUser.assignedSubjects.length > 0
    ? currentUser.assignedSubjects
    : (school?.id ? actions.getSchoolSubjects(school.id) : ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Basic Science & Tech', 'Literature in English', 'Civic Education']);

  // Form State: ONLY Subject, Topic, Date + Class selection
  const [classId, setClassId] = useState(existingSubmission?.classId || availableClasses[0]?.id || '');
  const [subject, setSubject] = useState(existingSubmission?.weeklyDiaryContent?.subject || existingSubmission?.subject || availableSubjects[0] || '');
  const [topic, setTopic] = useState(existingSubmission?.weeklyDiaryContent?.topic || existingSubmission?.title || '');
  const [date, setDate] = useState(
    existingSubmission?.weeklyDiaryContent?.date ||
    existingSubmission?.weeklyDiaryContent?.startDate ||
    new Date().toISOString().split('T')[0]
  );

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (existingSubmission) {
      setClassId(existingSubmission.classId);
      setSubject(existingSubmission.weeklyDiaryContent?.subject || existingSubmission.subject || availableSubjects[0]);
      setTopic(existingSubmission.weeklyDiaryContent?.topic || existingSubmission.title || '');
      setDate(
        existingSubmission.weeklyDiaryContent?.date ||
        existingSubmission.weeklyDiaryContent?.startDate ||
        new Date().toISOString().split('T')[0]
      );
    } else {
      if (availableClasses[0]?.id) setClassId(availableClasses[0].id);
      if (availableSubjects[0]) setSubject(availableSubjects[0]);
      setTopic('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [existingSubmission, isOpen]);

  if (!isOpen || !currentUser || !school) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setFormError('Please select or specify a Subject.');
      return;
    }
    if (!topic.trim()) {
      setFormError('Please enter the Topic covered.');
      return;
    }
    if (!date) {
      setFormError('Please select a Date for this diary entry.');
      return;
    }

    setFormError('');
    const targetClassObj = classes.find(c => c.id === classId);

    const weeklyDiaryContent: WeeklyDiaryContent = {
      subject: subject.trim(),
      topic: topic.trim(),
      date
    };

    if (existingSubmission) {
      actions.updateSubmission(existingSubmission.id, {
        title: `Weekly Diary: ${topic.trim()}`,
        classId,
        className: targetClassObj?.name || 'Class',
        subject: subject.trim(),
        weeklyDiaryContent,
        status: 'PENDING'
      });
    } else {
      actions.createSubmission({
        schoolId: school.id,
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        classId,
        className: targetClassObj?.name || 'Class',
        subject: subject.trim(),
        type: 'WEEKLY_DIARY',
        title: `Weekly Diary: ${topic.trim()}`,
        weeklyDiaryContent
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {existingSubmission ? 'Edit Weekly Diary Entry' : 'New Weekly Diary Entry'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record your teaching topic, subject, and date
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Class Selection */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
              Target Class
            </label>
            <select
              value={classId}
              onChange={e => setClassId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {availableClasses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* 1. Subject */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-emerald-500" />
              Subject
            </label>
            <div className="space-y-2">
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {availableSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Topic */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
              Topic
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Quadratic Equations or Photosynthesis in Plants"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 3. Date */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-amber-500" />
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              {existingSubmission ? 'Update Weekly Diary' : 'Submit Weekly Diary'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
