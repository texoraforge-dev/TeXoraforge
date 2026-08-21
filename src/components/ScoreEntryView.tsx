/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Lock,
  Edit3,
  FileSpreadsheet,
  BarChart2,
  Download,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { useAppStore } from '../storage';
import { ScoreSheet, SubjectScore, User, Student } from '../types';
import { generateReportCardPDF } from '../lib/pdfGenerator';

export function ScoreEntryView() {
  const { currentUser, classes, students, scoreSheets, school, actions } = useAppStore();

  const isAdmin = currentUser?.role === 'SCHOOL_ADMIN';
  const isTeacher = currentUser?.role === 'TEACHER';

  // State selection
  const teacherClasses = classes.filter(c => 
    isAdmin || (currentUser?.assignedClassIds || []).includes(c.id)
  );

  const [selectedClassId, setSelectedClassId] = useState<string>(teacherClasses[0]?.id || 'cls_ss3');

  const selectedClass = classes.find(c => c.id === selectedClassId) || teacherClasses[0] || classes[0];
  const classSubjects = selectedClass ? actions.getClassSubjects(selectedClass.id) : [];

  const availableSubjectsForSelection = isTeacher && currentUser?.assignedSubjects?.length
    ? currentUser.assignedSubjects
    : (classSubjects.length > 0 ? classSubjects : (school?.subjects || ['Mathematics', 'English Language']));

  const [selectedSubject, setSelectedSubject] = useState<string>(availableSubjectsForSelection[0] || 'Mathematics');
  const [adminComment, setAdminComment] = useState<string>('');

  // Current Working Score Sheet
  const [activeSheet, setActiveSheet] = useState<Partial<ScoreSheet> | null>(null);
  const [scoresState, setScoresState] = useState<Record<string, Partial<SubjectScore>>>({});

  // Sync / Load Score Sheet whenever Class or Subject changes
  useEffect(() => {
    if (!selectedClassId || !selectedSubject) return;

    const existing = scoreSheets.find(
      s => s.classId === selectedClassId && s.subject.toLowerCase() === selectedSubject.toLowerCase()
    );

    const classStudents = students.filter(s =>
      s.classId === selectedClassId &&
      (!s.enrolledSubjects || s.enrolledSubjects.includes(selectedSubject))
    );

    if (existing) {
      setActiveSheet(existing);
      const scoresMap: Record<string, Partial<SubjectScore>> = {};
      (existing.scores || []).forEach(sc => {
        scoresMap[sc.studentId] = { ...sc };
      });
      // Fill missing students if any new student was admitted recently
      classStudents.forEach(st => {
        if (!scoresMap[st.id]) {
          scoresMap[st.id] = {
            studentId: st.id,
            studentName: st.fullName,
            admissionNo: st.admissionNo,
            assignmentScore: 0,
            classworkScore: 0,
            projectScore: 0,
            testScore: 0,
            examScore: 0,
            totalScore: 0,
            grade: 'F',
            teacherRemark: 'Satisfactory'
          };
        }
      });
      setScoresState(scoresMap);
    } else {
      // Create new fresh state sheet
      const targetClass = classes.find(c => c.id === selectedClassId);
      setActiveSheet({
        schoolId: school?.id || 'school_apex',
        classId: selectedClassId,
        className: targetClass ? targetClass.name : 'Class',
        subject: selectedSubject,
        teacherId: currentUser?.id || 'usr_t1',
        teacherName: currentUser?.name || 'Subject Teacher',
        academicTerm: school?.academicTerm || 'First Term',
        academicSession: school?.academicSession || '2025/2026',
        status: 'DRAFT',
        scores: []
      });

      const initialScoresMap: Record<string, Partial<SubjectScore>> = {};
      classStudents.forEach(st => {
        initialScoresMap[st.id] = {
          studentId: st.id,
          studentName: st.fullName,
          admissionNo: st.admissionNo,
          assignmentScore: 8,
          classworkScore: 8,
          projectScore: 8,
          testScore: 16,
          examScore: 40,
          totalScore: 80,
          grade: 'A',
          teacherRemark: 'Exemplary performance'
        };
      });
      setScoresState(initialScoresMap);
    }
  }, [selectedClassId, selectedSubject, scoreSheets, students, classes, school, currentUser]);

  // Helper to re-calculate grades and total
  const computeStudentScore = (
    studentId: string,
    field: keyof SubjectScore,
    val: number | string
  ) => {
    if (activeSheet?.status === 'APPROVED' && isTeacher) return; // Locked for teachers

    setScoresState(prev => {
      const current = prev[studentId] || { studentId };
      const updated = { ...current, [field]: val };

      const ass = Math.min(10, Math.max(0, Number(updated.assignmentScore || 0)));
      const cw = Math.min(10, Math.max(0, Number(updated.classworkScore || 0)));
      const prj = Math.min(10, Math.max(0, Number(updated.projectScore || 0)));
      const tst = Math.min(20, Math.max(0, Number(updated.testScore || 0)));
      const exm = Math.min(50, Math.max(0, Number(updated.examScore || 0)));

      const total = ass + cw + prj + tst + exm;

      let grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' = 'F';
      if (total >= 70) grade = 'A';
      else if (total >= 60) grade = 'B';
      else if (total >= 50) grade = 'C';
      else if (total >= 45) grade = 'D';
      else if (total >= 40) grade = 'E';

      return {
        ...prev,
        [studentId]: {
          ...updated,
          assignmentScore: ass,
          classworkScore: cw,
          projectScore: prj,
          testScore: tst,
          examScore: exm,
          totalScore: total,
          grade
        }
      };
    });
  };

  // Convert map to array with subject ranking
  const getCompiledScoresList = (): SubjectScore[] => {
    const list = Object.values(scoresState) as SubjectScore[];
    list.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

    return list.map((item, idx) => ({
      ...item,
      positionInSubject: idx + 1
    }));
  };

  const handleSaveDraft = () => {
    if (!selectedClassId || !selectedSubject) return;
    const compiled = getCompiledScoresList();
    const targetClass = classes.find(c => c.id === selectedClassId);

    actions.saveScoreSheet({
      id: activeSheet?.id,
      schoolId: school?.id || 'school_apex',
      classId: selectedClassId,
      className: targetClass ? targetClass.name : 'Class',
      subject: selectedSubject,
      teacherId: currentUser?.id || 'usr_t1',
      teacherName: currentUser?.name || 'Subject Teacher',
      academicTerm: school?.academicTerm || 'First Term',
      academicSession: school?.academicSession || '2025/2026',
      status: 'DRAFT',
      scores: compiled
    });

    alert('Score sheet saved as DRAFT.');
  };

  const handleSubmitForApproval = () => {
    if (!selectedClassId || !selectedSubject) return;
    const compiled = getCompiledScoresList();
    const targetClass = classes.find(c => c.id === selectedClassId);

    actions.saveScoreSheet({
      id: activeSheet?.id,
      schoolId: school?.id || 'school_apex',
      classId: selectedClassId,
      className: targetClass ? targetClass.name : 'Class',
      subject: selectedSubject,
      teacherId: currentUser?.id || 'usr_t1',
      teacherName: currentUser?.name || 'Subject Teacher',
      academicTerm: school?.academicTerm || 'First Term',
      academicSession: school?.academicSession || '2025/2026',
      status: 'SUBMITTED_FOR_APPROVAL',
      scores: compiled
    });

    alert('Score sheet successfully submitted to School Admin for review!');
  };

  const handleAdminApprove = () => {
    if (!activeSheet?.id) {
      // Save and approve directly if admin created it
      const compiled = getCompiledScoresList();
      const targetClass = classes.find(c => c.id === selectedClassId);
      const saved = actions.saveScoreSheet({
        schoolId: school?.id || 'school_apex',
        classId: selectedClassId,
        className: targetClass ? targetClass.name : 'Class',
        subject: selectedSubject,
        teacherId: currentUser?.id || 'usr_a1',
        teacherName: currentUser?.name || 'School Admin',
        academicTerm: school?.academicTerm || 'First Term',
        academicSession: school?.academicSession || '2025/2026',
        status: 'APPROVED',
        scores: compiled
      });
      actions.reviewScoreSheet(saved.id, 'APPROVED', adminComment);
    } else {
      actions.reviewScoreSheet(activeSheet.id, 'APPROVED', adminComment);
    }
    alert('Scores APPROVED and locked! Automatically computed terminal analytics.');
  };

  const handleAdminReject = () => {
    if (activeSheet?.id) {
      actions.reviewScoreSheet(activeSheet.id, 'REJECTED', adminComment || 'Please verify test and exam mark allocations.');
      alert('Score sheet returned to teacher for revision.');
    }
  };

  const handleBulkGenerateReportCards = () => {
    const classStudents = students.filter(s => s.classId === selectedClassId);
    let count = 0;
    classStudents.forEach(st => {
      const rep = actions.computeReportCard(st.id);
      if (rep && rep.subjectScores.length > 0) {
        generateReportCardPDF(rep, school);
        count++;
      }
    });

    if (count > 0) {
      alert(`Successfully generated report card PDFs for ${count} students in this class!`);
    } else {
      alert('No approved scores available yet to generate terminal report cards.');
    }
  };

  const isLocked = activeSheet?.status === 'APPROVED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
            <FileSpreadsheet className="w-7 h-7 mr-2 text-indigo-600 dark:text-indigo-400" />
            Continuous Assessment & Score Entry Module
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAdmin 
              ? 'Review teacher score submissions, approve terminal grades, and lock report card registers.' 
              : 'Enter continuous assessment scores for your assigned subject and submit for admin approval.'}
          </p>
        </div>

        {/* Action button header */}
        {isAdmin && (
          <button
            onClick={handleBulkGenerateReportCards}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Generate Class Report Cards PDF</span>
          </button>
        )}
      </div>

      {/* Selector Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Class Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Target Class
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name} {cls.arm ? `(${cls.arm})` : ''}</option>
            ))}
          </select>
        </div>

        {/* Subject Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {availableSubjectsForSelection.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        {/* Current Score Sheet Status Tag */}
        <div className="flex items-center justify-start md:justify-end">
          <div className="text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Score Sheet Approval Status</span>
            {activeSheet?.status === 'APPROVED' ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-300 dark:border-emerald-800">
                <Lock className="w-3.5 h-3.5" />
                <span>APPROVED & LOCKED</span>
              </span>
            ) : activeSheet?.status === 'SUBMITTED_FOR_APPROVAL' ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold text-xs border border-amber-300 dark:border-amber-800">
                <Clock className="w-3.5 h-3.5" />
                <span>PENDING ADMIN REVIEW</span>
              </span>
            ) : activeSheet?.status === 'REJECTED' ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-bold text-xs border border-rose-300 dark:border-rose-800">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>REVISION NEEDED</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-300 dark:border-slate-700">
                <Edit3 className="w-3.5 h-3.5" />
                <span>DRAFT (EDITABLE)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Admin Comment Banner if Rejected */}
      {activeSheet?.status === 'REJECTED' && activeSheet?.adminComment && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-sm flex items-start space-x-3">
          <MessageSquare className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold block">Administrator Feedback:</span>
            <p className="mt-0.5 text-xs">{activeSheet.adminComment}</p>
          </div>
        </div>
      )}

      {/* Main Score Entry Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {selectedSubject} Register — {classes.find(c => c.id === selectedClassId)?.name} ({Object.keys(scoresState).length} Enrolled Students)
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Breakdown: Ass (10) + CW (10) + Prj (10) + Test (20) + Exam (50) = 100 Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 min-w-[180px]">Student Name</th>
                <th className="py-3 px-3 text-center">Ass (10)</th>
                <th className="py-3 px-3 text-center">CW (10)</th>
                <th className="py-3 px-3 text-center">Prj (10)</th>
                <th className="py-3 px-3 text-center">Test (20)</th>
                <th className="py-3 px-3 text-center">Exam (50)</th>
                <th className="py-3 px-3 text-center">Total (100)</th>
                <th className="py-3 px-3 text-center">Grade</th>
                <th className="py-3 px-4 min-w-[180px]">Subject Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {Object.keys(scoresState).length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No students currently enrolled in this class.
                  </td>
                </tr>
              ) : (
                (Object.values(scoresState) as SubjectScore[]).map((sc) => {
                  const student = students.find(s => s.id === sc.studentId);
                  const total = sc.totalScore || 0;
                  const grade = sc.grade || 'F';

                  return (
                    <tr key={sc.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Name & Adm No */}
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        <span className="block font-bold">{sc.studentName || student?.fullName}</span>
                        <span className="text-xs text-slate-500 font-mono">{sc.admissionNo || student?.admissionNo}</span>
                      </td>

                      {/* Assignment (10) */}
                      <td className="py-3 px-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={10}
                          disabled={isLocked && isTeacher}
                          value={sc.assignmentScore ?? 0}
                          onChange={(e) => computeStudentScore(sc.studentId!, 'assignmentScore', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                        />
                      </td>

                      {/* Classwork (10) */}
                      <td className="py-3 px-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={10}
                          disabled={isLocked && isTeacher}
                          value={sc.classworkScore ?? 0}
                          onChange={(e) => computeStudentScore(sc.studentId!, 'classworkScore', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                        />
                      </td>

                      {/* Project (10) */}
                      <td className="py-3 px-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={10}
                          disabled={isLocked && isTeacher}
                          value={sc.projectScore ?? 0}
                          onChange={(e) => computeStudentScore(sc.studentId!, 'projectScore', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                        />
                      </td>

                      {/* Test (20) */}
                      <td className="py-3 px-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          disabled={isLocked && isTeacher}
                          value={sc.testScore ?? 0}
                          onChange={(e) => computeStudentScore(sc.studentId!, 'testScore', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                        />
                      </td>

                      {/* Exam (50) */}
                      <td className="py-3 px-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={50}
                          disabled={isLocked && isTeacher}
                          value={sc.examScore ?? 0}
                          onChange={(e) => computeStudentScore(sc.studentId!, 'examScore', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                        />
                      </td>

                      {/* Auto Calculated Total */}
                      <td className="py-3 px-3 text-center font-extrabold text-sm text-slate-900 dark:text-white">
                        {total}
                      </td>

                      {/* Auto Grade Badge */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs ${
                          grade === 'A' || grade === 'B' 
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' 
                            : grade === 'C' || grade === 'D'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                        }`}>
                          {grade}
                        </span>
                      </td>

                      {/* Subject Remark */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          disabled={isLocked && isTeacher}
                          value={sc.teacherRemark || ''}
                          onChange={(e) => computeStudentScore(sc.studentId!, 'teacherRemark', e.target.value)}
                          placeholder="e.g. Excellent comprehension"
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Approval Section / Teacher Submit Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {isAdmin ? (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-2" />
              Administrator Score Verification & Approval
            </h4>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Admin Audit Remarks / Rejection Feedback
              </label>
              <textarea
                rows={2}
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Write any feedback or instructions for the teacher here..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-3 justify-end items-center">
              <button
                onClick={handleAdminReject}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-semibold text-xs transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject & Request Revision</span>
              </button>

              <button
                onClick={handleAdminApprove}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Lock Score Sheet</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ensure all test and exam scores are double-checked before submitting to the school administrator.
            </p>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
              >
                Save Draft
              </button>
              <button
                type="button"
                disabled={isLocked}
                onClick={handleSubmitForApproval}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Submit to Admin for Approval</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
