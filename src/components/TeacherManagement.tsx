/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Key,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Check,
  X,
  Copy,
  CheckCircle2,
  Lock,
  Trash2,
  Edit2
} from 'lucide-react';
import { useAppStore } from '../storage';
import { User } from '../types';
import { SUBJECT_OPTIONS_BY_TIER } from '../mockData';

export const TeacherManagement: React.FC = () => {
  const { school, users, classes, actions } = useAppStore();
  const teachers = users.filter(u => u.role === 'TEACHER');

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [createdTeacherCredentials, setCreatedTeacherCredentials] = useState<{ teacher: User; pin: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // New Teacher form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [initialPin, setInitialPin] = useState('TEX-' + Math.floor(1000 + Math.random() * 9000));
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.employeeId && t.employeeId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const allAvailableSubjects = school?.id ? actions.getSchoolSubjects(school.id) : Array.from(new Set([
    ...(SUBJECT_OPTIONS_BY_TIER['Pre-Nursery & Nursery'] || []),
    ...SUBJECT_OPTIONS_BY_TIER.Primary,
    ...SUBJECT_OPTIONS_BY_TIER['Junior Secondary'],
    ...SUBJECT_OPTIONS_BY_TIER['Senior Secondary']
  ]));

  const toggleClassSelect = (classId: string) => {
    if (selectedClassIds.includes(classId)) {
      setSelectedClassIds(selectedClassIds.filter(id => id !== classId));
    } else {
      setSelectedClassIds([...selectedClassIds, classId]);
    }
  };

  const toggleSubjectSelect = (subj: string) => {
    if (selectedSubjects.includes(subj)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subj));
    } else {
      setSelectedSubjects([...selectedSubjects, subj]);
    }
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !fullName || !email) return;

    const newTeacher = actions.createTeacher({
      schoolId: school.id,
      name: fullName,
      email,
      phone,
      employeeId: employeeId || 'EMP-' + Math.floor(100 + Math.random() * 900),
      assignedClassIds: selectedClassIds,
      assignedSubjects: selectedSubjects,
      active: true,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`
    });

    setCreatedTeacherCredentials({ teacher: newTeacher, pin: initialPin });
    setShowAddModal(false);

    // Reset form
    setFullName('');
    setEmail('');
    setPhone('');
    setEmployeeId('');
    setSelectedClassIds([]);
    setSelectedSubjects([]);
    setInitialPin('TEX-' + Math.floor(1000 + Math.random() * 9000));
  };

  const copyCredentials = () => {
    if (!createdTeacherCredentials) return;
    const text = `TeXora Forge - Teacher Credentials Slip
School: ${school?.name}
Teacher Name: ${createdTeacherCredentials.teacher.name}
Login Email: ${createdTeacherCredentials.teacher.email}
Initial Access PIN: ${createdTeacherCredentials.pin}
Assigned Classes: ${createdTeacherCredentials.teacher.assignedClassIds.map(id => classes.find(c => c.id === id)?.name).join(', ')}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Teacher Account Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Provision teacher accounts and assign classes & subjects securely.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> Provision New Teacher Account
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search teacher by name, email, or employee ID..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Teachers Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((t) => {
          const assignedClassNames = t.assignedClassIds
            .map(id => classes.find(c => c.id === id)?.name)
            .filter(Boolean);

          return (
            <div
              key={t.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={t.name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{t.employeeId || 'EMP-2025'}</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Active
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">{t.email}</span>
                </div>
                {t.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{t.phone}</span>
                  </div>
                )}
              </div>

              {/* Assigned Classes */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" /> Assigned Classes ({assignedClassNames.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {assignedClassNames.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No classes assigned</span>
                  ) : (
                    assignedClassNames.map((cn, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200/60 dark:border-indigo-800">
                        {cn}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Assigned Subjects */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> Assigned Subjects
                </p>
                <div className="flex flex-wrap gap-1">
                  {t.assignedSubjects.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No subjects assigned</span>
                  ) : (
                    t.assignedSubjects.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-medium">
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <button
                  onClick={() => actions.deleteTeacher(t.id)}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Revoke Account
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Provision Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Provision Teacher Account
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Teachers cannot self-register. Create unique login credentials and assign classes.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Mr. David Okon"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Official Teacher Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. d.okon@school.edu"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. +234 803 111 2233"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Employee Staff ID</label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={e => setEmployeeId(e.target.value)}
                    placeholder="e.g. EMP-2025-04"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Class Assignment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Assign Class(es) * (Restricts teacher to only selected classes)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  {classes.map((cls) => {
                    const isSelected = selectedClassIds.includes(cls.id);
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => toggleClassSelect(cls.id)}
                        className={`p-2 rounded-lg text-xs font-bold text-left border flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span>{cls.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject Assignment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Assign Subject(s) *
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  {allAvailableSubjects.map((subj) => {
                    const isSelected = selectedSubjects.includes(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => toggleSubjectSelect(subj)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {subj}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Provision Account & Generate PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generated Credentials Slip Modal */}
      {createdTeacherCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Teacher Account Provisioned!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Provide these login credentials to the teacher.</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">School:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{school?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Teacher:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{createdTeacherCredentials.teacher.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Login Email:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{createdTeacherCredentials.teacher.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Access PIN:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-sm">{createdTeacherCredentials.pin}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyCredentials}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Credentials Slip'}
              </button>
              <button
                onClick={() => setCreatedTeacherCredentials(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
