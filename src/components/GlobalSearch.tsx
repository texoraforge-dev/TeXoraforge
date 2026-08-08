/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  GraduationCap,
  School as SchoolIcon,
  FileText,
  ChevronRight,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '../storage';
import { Student, SchoolClass, Submission } from '../types';

interface GlobalSearchProps {
  onNavigate: (view: string) => void;
  onSelectSubmission?: (submission: Submission) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onNavigate,
  onSelectSubmission
}) => {
  const { students, classes, submissions } = useAppStore();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Listen for Ctrl+K or Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter logic
  const trimmedQuery = query.trim().toLowerCase();

  const matchingStudents = trimmedQuery.length >= 1
    ? students.filter(s => {
        const studentClass = classes.find(c => c.id === s.classId);
        const classNameStr = studentClass ? `${studentClass.name} ${studentClass.arm || ''}` : '';
        return (
          s.fullName.toLowerCase().includes(trimmedQuery) ||
          s.admissionNo.toLowerCase().includes(trimmedQuery) ||
          classNameStr.toLowerCase().includes(trimmedQuery) ||
          s.guardianName.toLowerCase().includes(trimmedQuery)
        );
      }).slice(0, 5)
    : [];

  const matchingClasses = trimmedQuery.length >= 1
    ? classes.filter(c =>
        c.name.toLowerCase().includes(trimmedQuery) ||
        (c.arm && c.arm.toLowerCase().includes(trimmedQuery)) ||
        c.category.toLowerCase().includes(trimmedQuery)
      ).slice(0, 5)
    : [];

  const matchingSubmissions = trimmedQuery.length >= 1
    ? submissions.filter(sub => {
        const topicStr = sub.lessonNoteContent?.topic || sub.lessonPlanContent?.topic || '';
        const subTopicStr = sub.lessonNoteContent?.subTopic || '';
        const introStr = sub.lessonNoteContent?.introduction || '';
        return (
          sub.title.toLowerCase().includes(trimmedQuery) ||
          sub.subject.toLowerCase().includes(trimmedQuery) ||
          sub.teacherName.toLowerCase().includes(trimmedQuery) ||
          sub.className.toLowerCase().includes(trimmedQuery) ||
          topicStr.toLowerCase().includes(trimmedQuery) ||
          subTopicStr.toLowerCase().includes(trimmedQuery) ||
          introStr.toLowerCase().includes(trimmedQuery)
        );
      }).slice(0, 5)
    : [];

  const totalResultsCount = matchingStudents.length + matchingClasses.length + matchingSubmissions.length;

  const handleSelectStudent = (student: Student) => {
    onNavigate('classes');
    setQuery('');
    setIsOpen(false);
  };

  const handleSelectClass = (cls: SchoolClass) => {
    onNavigate('classes');
    setQuery('');
    setIsOpen(false);
  };

  const handleSelectSubmission = (sub: Submission) => {
    if (onSelectSubmission) {
      onSelectSubmission(sub);
    } else {
      onNavigate('submissions');
    }
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md mx-2 sm:mx-4">
      {/* Search Bar Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder="Search students, classes, or notes... (⌘K)"
          className="w-full pl-9 pr-16 py-1.5 text-xs rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-xs"
        />

        {query ? (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden md:inline-flex absolute right-2.5 items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs">
            <span>⌘</span>K
          </kbd>
        )}
      </div>

      {/* Dropdown Overlay Results */}
      {isOpen && trimmedQuery.length >= 1 && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/90 py-3 z-50 max-h-[75vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
          
          {totalResultsCount === 0 ? (
            <div className="px-4 py-8 text-center space-y-2">
              <Search className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No matching records found
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                No student, class, or lesson note matched "{query}". Try searching by student name, subject, or class.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              
              {/* STUDENTS SECTION */}
              {matchingStudents.length > 0 && (
                <div>
                  <div className="px-3 pb-1.5 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-700/60">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5" /> Students ({matchingStudents.length})
                    </span>
                  </div>
                  <div className="pt-1">
                    {matchingStudents.map((student) => {
                      const studentClass = classes.find(c => c.id === student.classId);
                      const classNameStr = studentClass ? `${studentClass.name} (${studentClass.arm || ''})` : 'Unassigned';
                      return (
                        <button
                          key={student.id}
                          onClick={() => handleSelectStudent(student)}
                          className="w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-indigo-50/60 dark:hover:bg-slate-700/60 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60">
                              <User className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                {student.fullName}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                Admission No: <span className="font-mono text-slate-700 dark:text-slate-300">{student.admissionNo}</span> • Class: {classNameStr}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CLASSES SECTION */}
              {matchingClasses.length > 0 && (
                <div>
                  <div className="px-3 pb-1.5 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 border-b border-slate-100 dark:border-slate-700/60">
                    <span className="flex items-center gap-1.5">
                      <SchoolIcon className="h-3.5 w-3.5" /> Classes & Arms ({matchingClasses.length})
                    </span>
                  </div>
                  <div className="pt-1">
                    {matchingClasses.map((cls) => {
                      const enrolledCount = students.filter(s => s.classId === cls.id).length;
                      return (
                        <button
                          key={cls.id}
                          onClick={() => handleSelectClass(cls)}
                          className="w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-sky-50/60 dark:hover:bg-slate-700/60 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/60">
                              <SchoolIcon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate group-hover:text-sky-600 dark:group-hover:text-sky-400">
                                {cls.name} {cls.arm ? `(${cls.arm})` : ''}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                Category: {cls.category} • Enrolled: {enrolledCount}/{cls.capacity} Students
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* LESSON NOTES / SUBMISSIONS SECTION */}
              {matchingSubmissions.length > 0 && (
                <div>
                  <div className="px-3 pb-1.5 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-700/60">
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Lesson Notes & Documents ({matchingSubmissions.length})
                    </span>
                  </div>
                  <div className="pt-1">
                    {matchingSubmissions.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleSelectSubmission(sub)}
                        className="w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-emerald-50/60 dark:hover:bg-slate-700/60 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60">
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                {sub.title}
                              </p>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold shrink-0 uppercase ${
                                sub.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                                  : sub.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                              }`}>
                                {sub.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              Subject: <strong className="text-slate-700 dark:text-slate-300">{sub.subject}</strong> • Class: {sub.className} • Teacher: {sub.teacherName}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          <div className="px-3.5 pt-2 mt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Press <kbd className="font-semibold text-slate-500 dark:text-slate-300">ESC</kbd> to exit</span>
            <span className="flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
              Instant Global Search <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>

        </div>
      )}
    </div>
  );
};
