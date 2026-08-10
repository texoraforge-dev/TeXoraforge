/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Users,
  UserPlus,
  Phone,
  CheckCircle2,
  X,
  FileSpreadsheet,
  BookOpen
} from 'lucide-react';
import { useAppStore } from '../storage';
import { SchoolClass, Student } from '../types';
import { DEFAULT_SCHOOL_SUBJECTS } from '../mockData';

export const ClassAndStudentManagement: React.FC = () => {
  const { school, classes, students, actions } = useAppStore();

  const [activeTier, setActiveTier] = useState<'Pre-Nursery & Nursery' | 'Primary' | 'Junior Secondary' | 'Senior Secondary'>('Pre-Nursery & Nursery');
  const [selectedClassId, setSelectedClassId] = useState<string>('cls_prenursery');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // New Student form
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  const tierClasses = classes.filter(c => c.category === activeTier);
  const currentClass = classes.find(c => c.id === selectedClassId) || tierClasses[0] || classes[0];

  const classStudents = students.filter(s => s.classId === currentClass?.id);
  const filteredStudents = classStudents.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !currentClass || !fullName) return;

    actions.createStudent({
      schoolId: school.id,
      classId: currentClass.id,
      admissionNo: `APX/2025/${Math.floor(100 + Math.random() * 900)}`,
      fullName,
      gender,
      guardianName: guardianName || 'Guardian',
      guardianPhone: guardianPhone || '+234 800 000 0000',
      accessCode: `PAR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      active: true
    });

    setShowAddStudentModal(false);
    setFullName('');
    setGuardianName('');
    setGuardianPhone('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Class Hierarchy & Student Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage Pre-Nursery, Nursery 1–3, Primary 1–5, JSS 1–3, and SS 1–3 classes & student enrollment registers.
          </p>
        </div>

        <button
          onClick={() => setShowAddStudentModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="h-4 w-4" /> Enroll New Student to {currentClass?.name}
        </button>
      </div>

      {/* Tier Tabs (Pre-Nursery & Nursery, Primary, Junior Secondary, Senior Secondary) */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {(['Pre-Nursery & Nursery', 'Primary', 'Junior Secondary', 'Senior Secondary'] as const).map((tier) => (
          <button
            key={tier}
            onClick={() => {
              setActiveTier(tier);
              const firstClassInTier = classes.find(c => c.category === tier);
              if (firstClassInTier) setSelectedClassId(firstClassInTier.id);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTier === tier
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {tier} Tier
          </button>
        ))}
      </div>

      {/* Class Level Selector Buttons */}
      <div className="flex flex-wrap gap-2">
        {tierClasses.map((cls) => {
          const count = students.filter(s => s.classId === cls.id).length;
          const isSelected = selectedClassId === cls.id;

          return (
            <button
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-500'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <span>{cls.name}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Student Roster Area */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              {currentClass?.name} Student Register ({classStudents.length} Students)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Class Arm: {currentClass?.arm || 'Standard'} • Capacity: {currentClass?.capacity || 35}</p>
          </div>

          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search student or admission no..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Roster Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Admission No</th>
                <th className="py-3 px-3">Full Name</th>
                <th className="py-3 px-3">Gender</th>
                <th className="py-3 px-3">Subjects Offered</th>
                <th className="py-3 px-3">Guardian Name</th>
                <th className="py-3 px-3">Guardian Contact</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 italic">
                    No students enrolled in {currentClass?.name} matching your search.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => {
                  const availableSubjects = (school?.subjects && school.subjects.length > 0) ? school.subjects : DEFAULT_SCHOOL_SUBJECTS;
                  const subjectCount = std.enrolledSubjects ? std.enrolledSubjects.length : availableSubjects.length;
                  return (
                    <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{std.admissionNo}</td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{std.fullName}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${std.gender === 'Female' ? 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'}`}>
                          {std.gender}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                          <BookOpen className="h-3 w-3 text-indigo-500" />
                          {subjectCount} Subjects
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{std.guardianName}</td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {std.guardianPhone}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Enrolled
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Enroll Student in {currentClass?.name}
              </h3>
              <button onClick={() => setShowAddStudentModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Adebayo Tobi"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Gender *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('Male')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${gender === 'Male' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('Female')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${gender === 'Female' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={e => setGuardianName(e.target.value)}
                  placeholder="e.g. Chief Adebayo"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Guardian Contact Phone</label>
                <input
                  type="text"
                  value={guardianPhone}
                  onChange={e => setGuardianPhone(e.target.value)}
                  placeholder="e.g. +234 803 000 1111"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
                >
                  Save & Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
