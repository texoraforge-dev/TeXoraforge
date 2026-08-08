/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CalendarCheck2,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Check,
  TrendingUp,
  Search,
  Filter,
  Printer
} from 'lucide-react';
import { useAppStore } from '../storage';
import { AttendanceStatus, StudentAttendanceItem } from '../types';
import { generateAttendancePDF } from '../lib/pdfGenerator';

export const AttendanceView: React.FC = () => {
  const { school, currentUser, classes, students, attendance, actions } = useAppStore();
  const isAdmin = currentUser?.role === 'SCHOOL_ADMIN';

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // For Teacher view
  const teacherClassIds = currentUser?.assignedClassIds || [];
  const availableClasses = isAdmin ? classes : classes.filter(c => teacherClassIds.includes(c.id));

  const [selectedClassId, setSelectedClassId] = useState<string>(
    availableClasses[0]?.id || classes[0]?.id || ''
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Student Attendance Items state for active class & date
  const activeClass = classes.find(c => c.id === selectedClassId) || availableClasses[0];
  const classStudents = students.filter(s => s.classId === activeClass?.id);

  // Check if existing record exists for this date and class
  const existingRecord = attendance.find(r => r.classId === activeClass?.id && r.date === date);

  const [items, setItems] = useState<StudentAttendanceItem[]>(() => {
    if (existingRecord) return existingRecord.records;
    return classStudents.map(s => ({
      studentId: s.id,
      studentName: s.fullName,
      status: 'PRESENT'
    }));
  });

  // Re-sync items if activeClass or date changes
  React.useEffect(() => {
    if (existingRecord) {
      setItems(existingRecord.records);
    } else {
      setItems(classStudents.map(s => ({
        studentId: s.id,
        studentName: s.fullName,
        status: 'PRESENT'
      })));
    }
  }, [selectedClassId, date]);

  const updateStatus = (studentId: string, status: AttendanceStatus) => {
    setItems(items.map(item => item.studentId === studentId ? { ...item, status } : item));
  };

  const updateNote = (studentId: string, note: string) => {
    setItems(items.map(item => item.studentId === studentId ? { ...item, note } : item));
  };

  const markAllPresent = () => {
    setItems(items.map(item => ({ ...item, status: 'PRESENT' })));
  };

  const handleSave = () => {
    if (!school || !activeClass || !currentUser) return;

    actions.recordAttendance({
      schoolId: school.id,
      classId: activeClass.id,
      className: activeClass.name,
      date,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      records: items
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePrintPDF = () => {
    if (!activeClass || !currentUser) return;
    generateAttendancePDF(
      activeClass.name,
      date,
      currentUser.name,
      items,
      school
    );
  };

  const filteredItems = items.filter(i =>
    i.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const presentCount = items.filter(i => i.status === 'PRESENT').length;
  const lateCount = items.filter(i => i.status === 'LATE').length;
  const absentCount = items.filter(i => i.status === 'ABSENT').length;
  const excusedCount = items.filter(i => i.status === 'EXCUSED').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarCheck2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            {isAdmin ? 'School-Wide Attendance Center' : 'Daily Student Attendance Register'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Mark daily attendance registers and analyze presence trends per class.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Date:</span>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Class Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {availableClasses.map((cls) => (
          <button
            key={cls.id}
            onClick={() => setSelectedClassId(cls.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedClassId === cls.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {cls.name} Register
          </button>
        ))}
      </div>

      {/* Register Summary Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {activeClass?.name} Attendance for {date}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total Enrolled Students: <strong className="text-slate-800 dark:text-slate-200">{items.length}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllPresent}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Mark All Present 🟢
            </button>

            <button
              onClick={handlePrintPDF}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Export and print official physical filing PDF register"
            >
              <Printer className="h-4 w-4 text-slate-300" />
              <span>Print PDF</span>
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              {savedSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {savedSuccess ? 'Register Saved!' : 'Save Register'}
            </button>
          </div>
        </div>

        {/* Attendance Counter Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 font-bold text-emerald-800 dark:text-emerald-200 flex justify-between items-center">
            <span>Present 🟢</span>
            <span className="text-base font-extrabold">{presentCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 font-bold text-amber-800 dark:text-amber-200 flex justify-between items-center">
            <span>Late 🟡</span>
            <span className="text-base font-extrabold">{lateCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 font-bold text-rose-800 dark:text-rose-200 flex justify-between items-center">
            <span>Absent 🔴</span>
            <span className="text-base font-extrabold">{absentCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 font-bold text-sky-800 dark:text-sky-200 flex justify-between items-center">
            <span>Excused 🔵</span>
            <span className="text-base font-extrabold">{excusedCount}</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search student in register..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none"
          />
        </div>

        {/* Student Register Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">Attendance Status</th>
                <th className="py-3 px-3">Reason / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
              {filteredItems.map((item, idx) => (
                <tr key={item.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                  <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{item.studentName}</td>
                  
                  {/* Status Toggle Radio Group */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      {(['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => updateStatus(item.studentId, st)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                            item.status === st
                              ? st === 'PRESENT' ? 'bg-emerald-600 text-white shadow-xs' :
                                st === 'LATE' ? 'bg-amber-500 text-white shadow-xs' :
                                st === 'ABSENT' ? 'bg-rose-600 text-white shadow-xs' :
                                'bg-sky-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <input
                      type="text"
                      value={item.note || ''}
                      onChange={e => updateNote(item.studentId, e.target.value)}
                      placeholder="e.g. Sick bay, late bus..."
                      className="w-full px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
