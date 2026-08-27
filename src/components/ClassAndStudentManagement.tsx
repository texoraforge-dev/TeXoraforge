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
  BookOpen,
  TrendingUp,
  Trash2,
  Layers,
  Sparkles,
  CheckSquare,
  Settings2
} from 'lucide-react';
import { useAppStore } from '../storage';
import { SchoolClass, Student } from '../types';
import { DEFAULT_SCHOOL_SUBJECTS, SUBJECT_OPTIONS_BY_TIER } from '../mockData';
import { StudentPromotionModal } from './modals/StudentPromotionModal';

export const ClassAndStudentManagement: React.FC = () => {
  const { school, classes, students, actions } = useAppStore();

  const [activeTier, setActiveTier] = useState<'Pre-Nursery & Nursery' | 'Primary' | 'Junior Secondary' | 'Senior Secondary'>('Pre-Nursery & Nursery');
  const [selectedClassId, setSelectedClassId] = useState<string>('cls_prenursery');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [selectedStudentForPromotion, setSelectedStudentForPromotion] = useState<Student | null>(null);

  // Class Subject Management in-place state
  const [isCurriculumDrawerOpen, setIsCurriculumDrawerOpen] = useState(false);
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [curriculumSuccessMsg, setCurriculumSuccessMsg] = useState('');

  // New Student form
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  const tierClasses = classes.filter(c => c.category === activeTier);
  const currentClass = classes.find(c => c.id === selectedClassId) || tierClasses[0] || classes[0] || null;
  const currentClassSubjects = currentClass ? actions.getClassSubjects(currentClass.id) : [];

  const classStudents = students.filter(s => s.classId === currentClass?.id);
  const filteredStudents = classStudents.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSubjectToActive = (subjectName: string) => {
    if (!currentClass || !subjectName.trim()) return;
    const cleanSub = subjectName.trim();
    if (currentClassSubjects.some(s => s.toLowerCase() === cleanSub.toLowerCase())) return;

    actions.addSubjectToClass(currentClass.id, cleanSub);
    setNewSubjectInput('');
    setCurriculumSuccessMsg(`Added "${cleanSub}" to ${currentClass.name}. Synced to all ${classStudents.length} student(s)!`);
    setTimeout(() => setCurriculumSuccessMsg(''), 3000);
  };

  const handleRemoveSubjectFromActive = (subjectName: string) => {
    if (!currentClass) return;
    actions.removeSubjectFromClass(currentClass.id, subjectName);
    setCurriculumSuccessMsg(`Removed "${subjectName}" from ${currentClass.name}.`);
    setTimeout(() => setCurriculumSuccessMsg(''), 3000);
  };

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
      active: true,
      enrolledSubjects: currentClassSubjects
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedStudentForPromotion(null);
              setIsPromotionModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer shrink-0"
          >
            <TrendingUp className="h-4 w-4" /> Promote {currentClass?.name || 'Class'} Students
          </button>

          <button
            onClick={() => setShowAddStudentModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="h-4 w-4" /> Enroll New Student to {currentClass?.name}
          </button>
        </div>
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
          const subCount = (cls.subjects || []).length;

          return (
            <button
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-500 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <span>{cls.name}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                {count} std • {subCount} subs
              </span>
            </button>
          );
        })}
      </div>

      {/* Class Curriculum & Subject Allocation Banner */}
      {currentClass && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/40 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800 border border-indigo-100 dark:border-slate-700/80 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{currentClass.name} Curriculum Allocation:</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-extrabold">
                    {currentClassSubjects.length} Subjects Configured
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Principal determined curriculum • Any student admitted to {currentClass.name} automatically offers these {currentClassSubjects.length} subjects.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCurriculumDrawerOpen(!isCurriculumDrawerOpen)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-200 hover:text-indigo-600 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors self-start sm:self-auto shrink-0"
            >
              <Settings2 className="h-3.5 w-3.5 text-indigo-500" />
              {isCurriculumDrawerOpen ? 'Hide Subject Controls' : 'Edit Class Subjects'}
            </button>
          </div>

          {/* Feedback Msg */}
          {curriculumSuccessMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>{curriculumSuccessMsg}</span>
            </div>
          )}

          {/* Quick Subject Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {currentClassSubjects.map(sub => (
              <span
                key={sub}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs"
              >
                <CheckSquare className="h-3 w-3 text-emerald-500" />
                {sub}
                {isCurriculumDrawerOpen && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSubjectFromActive(sub)}
                    className="ml-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title={`Remove ${sub} from ${currentClass.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>

          {/* In-Place Drawer to Add/Reduce Subjects */}
          {isCurriculumDrawerOpen && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 space-y-3 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="flex items-center gap-1.5 w-full sm:flex-1">
                  <input
                    type="text"
                    value={newSubjectInput}
                    onChange={e => setNewSubjectInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubjectToActive(newSubjectInput);
                      }
                    }}
                    placeholder={`Add subject specifically to ${currentClass.name}...`}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSubjectToActive(newSubjectInput)}
                    disabled={!newSubjectInput.trim()}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
              </div>

              {/* Quick additions */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400">Quick Electives:</span>
                {['Coding & Robotics', 'French', 'Music', 'Technical Drawing', 'Civic Education', 'Agricultural Science', 'Data Processing', 'History']
                  .filter(s => !currentClassSubjects.some(t => t.toLowerCase() === s.toLowerCase()))
                  .map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddSubjectToActive(s)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      <Plus className="h-2.5 w-2.5 text-indigo-500" />
                      {s}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Student Roster Area */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              {currentClass?.name} Student Register ({classStudents.length} Students)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Class Arm: {currentClass?.arm || 'Standard'} • Capacity: Unlimited Students (Current: {classStudents.length})</p>
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
                  const classSubjects = actions.getClassSubjects(std.classId);
                  const subjectCount = std.enrolledSubjects && std.enrolledSubjects.length > 0 ? std.enrolledSubjects.length : classSubjects.length;
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

              {/* Automatic Subject Inheritance Notice */}
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 space-y-1">
                <p className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  Auto-Assigned Curriculum ({currentClassSubjects.length} Subjects):
                </p>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                  {currentClass?.name} currently offers: {currentClassSubjects.slice(0, 6).join(', ')}{currentClassSubjects.length > 6 ? ` +${currentClassSubjects.length - 6} more` : ''}.
                  This student will automatically be registered for all {currentClassSubjects.length} subjects upon enrollment.
                </p>
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

      {/* Student Promotion Modal */}
      <StudentPromotionModal
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
        student={selectedStudentForPromotion}
        initialClassId={selectedClassId}
      />

    </div>
  );
};
