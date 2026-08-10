/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Copy,
  Check,
  Phone,
  BookOpen,
  Eye,
  FileText,
  Download,
  Printer,
  Sparkles,
  Award
} from 'lucide-react';
import { useAppStore } from '../storage';
import { Student, SchoolClass } from '../types';
import { DEFAULT_SCHOOL_SUBJECTS } from '../mockData';
import { AdmitStudentModal } from './modals/AdmitStudentModal';
import { StudentIdCardModal } from './modals/StudentIdCardModal';
import { generateAdmissionLetterPDF, generateReportCardPDF } from '../lib/pdfGenerator';

export const SchoolStudentRoster: React.FC = () => {
  const { school, classes, students, users, actions } = useAppStore();

  const allSchoolSubjects = (school?.subjects && school.subjects.length > 0)
    ? school.subjects
    : DEFAULT_SCHOOL_SUBJECTS;

  const teachers = users.filter(u => u.role === 'TEACHER');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Collapse state for each class section
  const [collapsedClasses, setCollapsedClasses] = useState<Record<string, boolean>>({});

  // Modals state
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [selectedStudentForIdCard, setSelectedStudentForIdCard] = useState<Student | null>(null);

  const toggleClassCollapse = (classId: string) => {
    setCollapsedClasses(prev => ({
      ...prev,
      [classId]: !prev[classId]
    }));
  };

  const expandAllClasses = () => {
    setCollapsedClasses({});
  };

  const collapseAllClasses = () => {
    const allCollapsed: Record<string, boolean> = {};
    classes.forEach(c => {
      allCollapsed[c.id] = true;
    });
    setCollapsedClasses(allCollapsed);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudentForEdit(student);
    setIsAdmitModalOpen(true);
  };

  const handleViewIdCard = (student: Student) => {
    setSelectedStudentForIdCard(student);
    setIsIdCardModalOpen(true);
  };

  const handlePrintAdmissionLetter = (student: Student) => {
    const studentClass = classes.find(c => c.id === student.classId);
    generateAdmissionLetterPDF(student, studentClass, school);
  };

  const handleDownloadClassCSV = (cls: SchoolClass, classStudents: Student[]) => {
    if (classStudents.length === 0) {
      alert(`No students found in ${cls.name} to export.`);
      return;
    }

    const headers = ['S/N', 'Admission No', 'Full Name', 'Gender', 'Subjects Count', 'Guardian Name', 'Guardian Phone', 'Access Code', 'Status'];
    const rows = classStudents.map((s, idx) => [
      idx + 1,
      `"${s.admissionNo}"`,
      `"${s.fullName}"`,
      `"${s.gender}"`,
      s.enrolledSubjects ? s.enrolledSubjects.length : allSchoolSubjects.length,
      `"${s.guardianName}"`,
      `"${s.guardianPhone}"`,
      `"${s.accessCode}"`,
      s.active ? 'Enrolled' : 'Inactive'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${school?.name || 'School'}_${cls.name.replace(/\s+/g, '_')}_Student_List.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPage = () => {
    window.print();
  };

  // Filtered classes list
  const displayClasses = classes.filter(c => selectedClassFilter === 'ALL' || c.id === selectedClassFilter);

  // Overall Statistics
  const totalStudents = students.length;
  const totalMale = students.filter(s => s.gender === 'Male').length;
  const totalFemale = students.filter(s => s.gender === 'Female').length;
  const avgClassSize = classes.length > 0 ? Math.round(totalStudents / classes.length) : 0;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Whole School Academic Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            School Students List (Separated by Classes)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete master roster of all enrolled students in <span className="font-semibold text-slate-800 dark:text-slate-200">{school?.name}</span>, categorized class-by-class with individual subject offerings and access keys.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setSelectedStudentForEdit(null);
              setIsAdmitModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Admit New Student</span>
          </button>
          <button
            onClick={handlePrintPage}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
            title="Print entire school roster"
          >
            <Printer className="w-4 h-4" />
            <span>Print Roster</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Students</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{totalStudents}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Classes</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{classes.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gender Ratio</p>
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              <span className="text-blue-600 dark:text-blue-400">{totalMale} Male</span> • <span className="text-pink-600 dark:text-pink-400">{totalFemale} Female</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Class Size</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">~{avgClassSize} <span className="text-xs text-slate-400 font-medium">Students/Class</span></p>
          </div>
        </div>
      </div>

      {/* Quick Jump-to-Class Pills Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-indigo-500" />
            Quick Class Navigator
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={expandAllClasses}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Expand All
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={collapseAllClasses}
              className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:underline"
            >
              Collapse All
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedClassFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedClassFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Classes ({classes.length})
          </button>
          {classes.map((cls) => {
            const classStudentCount = students.filter(s => s.classId === cls.id).length;
            const isSelected = selectedClassFilter === cls.id;
            return (
              <button
                key={cls.id}
                onClick={() => {
                  setSelectedClassFilter(cls.id);
                  const el = document.getElementById(`class-section-${cls.id}`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cls.name}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                  isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {classStudentCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Search & Gender Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student name, adm no, guardian..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Filter Gender:</span>
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">All Genders</option>
            <option value="Male">Male Only</option>
            <option value="Female">Female Only</option>
          </select>
        </div>
      </div>

      {/* Class-by-Class Student Rosters */}
      <div className="space-y-6">
        {displayClasses.map((cls) => {
          // Filter students belonging to this class
          const classStudents = students.filter((s) => {
            if (s.classId !== cls.id) return false;

            const matchesSearch =
              s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
              s.guardianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              s.accessCode.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesGender = selectedGender === 'ALL' || s.gender === selectedGender;

            return matchesSearch && matchesGender;
          });

          const classTeacher = teachers.find(t => t.assignedClassIds?.includes(cls.id));
          const isCollapsed = !!collapsedClasses[cls.id];
          const maleCount = classStudents.filter(s => s.gender === 'Male').length;
          const femaleCount = classStudents.filter(s => s.gender === 'Female').length;

          return (
            <div
              key={cls.id}
              id={`class-section-${cls.id}`}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
            >
              {/* Class Section Header */}
              <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                    {cls.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {cls.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-black">
                        {classStudents.length} Students
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>Grade: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{cls.gradeLevel}</strong></span>
                      <span>•</span>
                      <span>Teacher: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{classTeacher?.name || 'Unassigned'}</strong></span>
                      <span>•</span>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">{maleCount} M</span>
                      <span>/</span>
                      <span className="text-pink-600 dark:text-pink-400 font-semibold">{femaleCount} F</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadClassCSV(cls, classStudents)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Export CSV for this class"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>

                  <button
                    onClick={() => toggleClassCollapse(cls.id)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title={isCollapsed ? 'Expand class table' : 'Collapse class table'}
                  >
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Class Student Table */}
              {!isCollapsed && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/30 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <th className="py-3 px-4 w-12 text-center">S/N</th>
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Adm No.</th>
                        <th className="py-3 px-4">Gender</th>
                        <th className="py-3 px-4">Offered Subjects</th>
                        <th className="py-3 px-4">Guardian Details</th>
                        <th className="py-3 px-4">Parent Access Code</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-medium">
                      {classStudents.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                            No students currently enrolled in {cls.name} matching search.
                          </td>
                        </tr>
                      ) : (
                        classStudents.map((std, idx) => {
                          const enrolledCount = std.enrolledSubjects ? std.enrolledSubjects.length : allSchoolSubjects.length;
                          return (
                            <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                              {/* S/N */}
                              <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                                {idx + 1}
                              </td>

                              {/* Student Name & Avatar */}
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={std.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                                    alt={std.fullName}
                                    className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
                                  />
                                  <div>
                                    <span className="font-bold text-slate-900 dark:text-white block">
                                      {std.fullName}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      Admitted: {std.dateAdmitted || 'Current Session'}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Admission Number */}
                              <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                {std.admissionNo}
                              </td>

                              {/* Gender */}
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  std.gender === 'Female'
                                    ? 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                }`}>
                                  {std.gender}
                                </span>
                              </td>

                              {/* Offered Subjects */}
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleEditStudent(std)}
                                  title="Click to edit subjects offered"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold hover:bg-indigo-100 transition-colors"
                                >
                                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                                  <span>{enrolledCount} Subjects</span>
                                </button>
                              </td>

                              {/* Guardian */}
                              <td className="py-3 px-4">
                                <p className="font-semibold text-slate-900 dark:text-slate-200">{std.guardianName}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  {std.guardianPhone}
                                </p>
                              </td>

                              {/* Parent Access Code */}
                              <td className="py-3 px-4">
                                <div className="inline-flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                                  <span>{std.accessCode}</span>
                                  <button
                                    onClick={() => handleCopyCode(std.accessCode)}
                                    className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    title="Copy parent code"
                                  >
                                    {copiedCode === std.accessCode ? (
                                      <Check className="w-3 h-3 text-emerald-500" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-slate-400" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end space-x-1">
                                  <button
                                    onClick={() => handleViewIdCard(std)}
                                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    title="Student ID Card"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handlePrintAdmissionLetter(std)}
                                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    title="Download Official Admission Letter"
                                  >
                                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <AdmitStudentModal
        isOpen={isAdmitModalOpen}
        onClose={() => {
          setIsAdmitModalOpen(false);
          setSelectedStudentForEdit(null);
        }}
        existingStudent={selectedStudentForEdit}
      />

      <StudentIdCardModal
        isOpen={isIdCardModalOpen}
        onClose={() => {
          setIsIdCardModalOpen(false);
          setSelectedStudentForIdCard(null);
        }}
        student={selectedStudentForIdCard}
        studentClass={classes.find(c => c.id === selectedStudentForIdCard?.classId)}
      />
    </div>
  );
};
