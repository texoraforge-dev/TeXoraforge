/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  Users,
  Award,
  FileText,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { useAppStore } from '../../storage';
import { Student, SchoolClass } from '../../types';
import { generatePromotionCertificatePDF } from '../../lib/pdfGenerator';

interface StudentPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  // If provided, single student transition mode. If null/undefined, batch class transition mode.
  student?: Student | null;
  // Pre-selected class filter for batch mode
  initialClassId?: string;
}

export const StudentPromotionModal: React.FC<StudentPromotionModalProps> = ({
  isOpen,
  onClose,
  student,
  initialClassId
}) => {
  const { school, classes, students, actions } = useAppStore();

  const isSingleMode = !!student;

  // Selected Source Class for Batch Mode
  const [sourceClassId, setSourceClassId] = useState<string>(
    student ? student.classId : initialClassId || classes[0]?.id || ''
  );

  // Target Class for transition
  const [targetClassId, setTargetClassId] = useState<string>('');

  // Target Academic Session
  const [targetSession, setTargetSession] = useState<string>('2026/2027');

  // Promotion Status (for single mode)
  const [promotionStatus, setPromotionStatus] = useState<'PROMOTED' | 'REPEATED' | 'GRADUATED'>('PROMOTED');

  // Remarks
  const [remarks, setRemarks] = useState<string>('');

  // Auto PDF certificate checkbox
  const [generateCertificate, setGenerateCertificate] = useState<boolean>(true);

  // Batch Mode selection state: studentId -> boolean
  const [selectedStudentIds, setSelectedStudentIds] = useState<Record<string, boolean>>({});

  // Batch Mode individual decisions: studentId -> 'PROMOTED' | 'REPEATED' | 'GRADUATED'
  const [studentDecisions, setStudentDecisions] = useState<Record<string, 'PROMOTED' | 'REPEATED' | 'GRADUATED'>>({});

  // Feedback message
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state when modal opens or source class / student changes
  useEffect(() => {
    if (!isOpen) return;

    const currentClsId = student ? student.classId : sourceClassId || classes[0]?.id || '';
    setSourceClassId(currentClsId);

    // Auto-detect next class in array
    const curIdx = classes.findIndex(c => c.id === currentClsId);
    let nextClsId = '';
    if (curIdx !== -1 && curIdx + 1 < classes.length) {
      nextClsId = classes[curIdx + 1].id;
    } else {
      nextClsId = currentClsId;
    }
    setTargetClassId(nextClsId);

    // Default target session
    if (school?.academicSession) {
      const parts = school.academicSession.split('/');
      if (parts.length === 2 && !isNaN(parseInt(parts[0]))) {
        const nextStart = parseInt(parts[0]) + 1;
        const nextEnd = parseInt(parts[1]) + 1;
        setTargetSession(`${nextStart}/${nextEnd}`);
      } else {
        setTargetSession('2026/2027');
      }
    }

    // Initialize batch mode selections for students in source class
    const inClass = students.filter(s => s.classId === currentClsId);
    const initialSelected: Record<string, boolean> = {};
    const initialDecisions: Record<string, 'PROMOTED' | 'REPEATED' | 'GRADUATED'> = {};

    inClass.forEach(s => {
      initialSelected[s.id] = true;
      initialDecisions[s.id] = 'PROMOTED';
    });

    setSelectedStudentIds(initialSelected);
    setStudentDecisions(initialDecisions);
    setRemarks('');
    setToastMsg(null);
  }, [isOpen, student, sourceClassId, classes, school, students]);

  // Source Class Object
  const sourceClass = useMemo(() => {
    return classes.find(c => c.id === (student ? student.classId : sourceClassId));
  }, [classes, student, sourceClassId]);

  // Target Class Object
  const targetClass = useMemo(() => {
    return classes.find(c => c.id === targetClassId);
  }, [classes, targetClassId]);

  // Students list in source class for batch mode
  const sourceClassStudents = useMemo(() => {
    return students.filter(s => s.classId === sourceClassId);
  }, [students, sourceClassId]);

  if (!isOpen) return null;

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Toggle selection for all students in source class
  const handleToggleSelectAll = (checked: boolean) => {
    const updated: Record<string, boolean> = {};
    sourceClassStudents.forEach(s => {
      updated[s.id] = checked;
    });
    setSelectedStudentIds(updated);
  };

  // Single Student Promotion Handler
  const handleSinglePromote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    if (!targetClassId && promotionStatus !== 'GRADUATED') {
      showToast('error', 'Please select a destination class for promotion.');
      return;
    }

    const updated = actions.promoteStudent(
      student.id,
      targetClassId,
      targetSession,
      promotionStatus,
      remarks || `Promoted to ${targetClass?.name || 'Next Class'} for ${targetSession}`
    );

    if (updated) {
      if (generateCertificate) {
        generatePromotionCertificatePDF(
          updated,
          sourceClass,
          targetClass,
          school,
          targetSession,
          promotionStatus,
          remarks
        );
      }

      showToast('success', `${student.fullName} transitioned successfully to ${promotionStatus === 'GRADUATED' ? 'Graduated Alumni' : targetClass?.name || 'Next Class'}!`);
      setTimeout(() => onClose(), 1500);
    } else {
      showToast('error', 'Failed to update student record.');
    }
  };

  // Batch Promotion Handler
  const handleBatchPromote = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedIds = Object.keys(selectedStudentIds).filter(id => selectedStudentIds[id]);

    if (selectedIds.length === 0) {
      showToast('error', 'Please select at least one student to transition.');
      return;
    }

    if (!targetClassId) {
      showToast('error', 'Please select a target destination class.');
      return;
    }

    let processedCount = 0;

    selectedIds.forEach(stId => {
      const decision = studentDecisions[stId] || 'PROMOTED';
      const res = actions.promoteStudent(
        stId,
        targetClassId,
        targetSession,
        decision,
        remarks || `Batch transition to ${targetClass?.name || 'Next Class'} for ${targetSession}`
      );
      if (res) processedCount++;
    });

    showToast('success', `Successfully transitioned ${processedCount} student(s) to ${targetClass?.name || 'Next Class'} for session ${targetSession}!`);
    setTimeout(() => onClose(), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Academic Transition Manager</span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">
                {isSingleMode
                  ? `Promote Student: ${student?.fullName}`
                  : `Class-Wide Batch Student Promotion`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-100 text-sm">
          
          {/* Toast Banner */}
          {toastMsg && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-bold ${
              toastMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}>
              {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
              <span>{toastMsg.text}</span>
            </div>
          )}

          {/* SINGLE MODE HEADER BANNER */}
          {isSingleMode && student && (
            <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <img
                  src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={student.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500"
                />
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{student.fullName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Adm No: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{student.admissionNo}</span> • Current Class: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{sourceClass?.name || 'Class'}</span>
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-xs">
                Single Transition
              </span>
            </div>
          )}

          {/* BATCH MODE SOURCE CLASS SELECTOR */}
          {!isSingleMode && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  1. Source Class (Current):
                </label>
                <select
                  value={sourceClassId}
                  onChange={(e) => setSourceClassId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category}) — {students.filter(s => s.classId === c.id).length} Students
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  2. Destination Target Class:
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-bold text-xs focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TRANSITION CONFIGURATION FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Target Class (Single mode) */}
            {isSingleMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Destination Class:
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  disabled={promotionStatus === 'GRADUATED'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Target Academic Session */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                New Academic Session:
              </label>
              <input
                type="text"
                value={targetSession}
                onChange={(e) => setTargetSession(e.target.value)}
                placeholder="e.g. 2026/2027"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Transition Decision Badge (Single mode) */}
            {isSingleMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Transition Decision:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPromotionStatus('PROMOTED')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-extrabold transition-all ${
                      promotionStatus === 'PROMOTED'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    Promote
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromotionStatus('REPEATED')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-extrabold transition-all ${
                      promotionStatus === 'REPEATED'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    Repeat
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromotionStatus('GRADUATED')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-extrabold transition-all ${
                      promotionStatus === 'GRADUATED'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    Graduate
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Transition Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Transition Remarks / Principal Note:
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Promoted with high distinction based on cumulative 3-term average."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* BATCH MODE STUDENT ROSTER TABLE */}
          {!isSingleMode && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                    Students in {sourceClass?.name} ({sourceClassStudents.length}):
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <label className="flex items-center space-x-1.5 cursor-pointer font-bold text-indigo-600 dark:text-indigo-400">
                    <input
                      type="checkbox"
                      checked={sourceClassStudents.length > 0 && sourceClassStudents.every(s => selectedStudentIds[s.id])}
                      onChange={(e) => handleToggleSelectAll(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Select All ({sourceClassStudents.length})</span>
                  </label>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                {sourceClassStudents.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No active students found in {sourceClass?.name}. Choose another source class.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-[10px]">
                        <th className="py-2.5 px-3 w-10 text-center">Sel</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Adm No.</th>
                        <th className="py-2.5 px-3">Parent Code</th>
                        <th className="py-2.5 px-3 text-right">Individual Decision</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {sourceClassStudents.map(std => {
                        const isSelected = !!selectedStudentIds[std.id];
                        const decision = studentDecisions[std.id] || 'PROMOTED';

                        return (
                          <tr
                            key={std.id}
                            className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                              isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : 'opacity-60'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => setSelectedStudentIds(prev => ({ ...prev, [std.id]: e.target.checked }))}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>

                            <td className="py-2.5 px-3">
                              <div className="flex items-center space-x-2">
                                <img
                                  src={std.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                                  alt={std.fullName}
                                  className="w-7 h-7 rounded-full object-cover"
                                />
                                <span className="font-bold text-slate-900 dark:text-white">{std.fullName}</span>
                              </div>
                            </td>

                            <td className="py-2.5 px-3 font-mono font-semibold text-slate-600 dark:text-slate-400">
                              {std.admissionNo}
                            </td>

                            <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                              {std.accessCode}
                            </td>

                            <td className="py-2.5 px-3 text-right">
                              <select
                                value={decision}
                                onChange={(e) => setStudentDecisions(prev => ({ ...prev, [std.id]: e.target.value as any }))}
                                disabled={!isSelected}
                                className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-extrabold text-[11px] focus:ring-1 focus:ring-indigo-500 outline-none disabled:opacity-50 cursor-pointer"
                              >
                                <option value="PROMOTED">Promote</option>
                                <option value="REPEATED">Repeat</option>
                                <option value="GRADUATED">Graduate</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Certificate Checkbox */}
          {isSingleMode && (
            <label className="flex items-center space-x-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 cursor-pointer text-xs font-semibold">
              <input
                type="checkbox"
                checked={generateCertificate}
                onChange={(e) => setGenerateCertificate(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300">
                Automatically generate & download <strong>Official Promotion Certificate PDF</strong> upon transition.
              </span>
            </label>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          {isSingleMode ? (
            <button
              onClick={handleSinglePromote}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Confirm Transition ({promotionStatus})</span>
            </button>
          ) : (
            <button
              onClick={handleBatchPromote}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Transition Selected Students ({Object.keys(selectedStudentIds).filter(id => selectedStudentIds[id]).length})</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
