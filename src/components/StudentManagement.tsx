/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Copy,
  Check,
  FileText,
  Shield,
  Edit2,
  Trash2,
  Award,
  Phone,
  Eye,
  Key,
  Download
} from 'lucide-react';
import { useAppStore } from '../storage';
import { Student } from '../types';
import { AdmitStudentModal } from './modals/AdmitStudentModal';
import { StudentIdCardModal } from './modals/StudentIdCardModal';
import { generateAdmissionLetterPDF, generateReportCardPDF } from '../lib/pdfGenerator';

interface StudentManagementProps {
  onSelectStudentForReportCard?: (student: Student) => void;
}

export function StudentManagement({ onSelectStudentForReportCard }: StudentManagementProps) {
  const { students, classes, school, actions } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal States
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);

  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [selectedStudentForIdCard, setSelectedStudentForIdCard] = useState<Student | null>(null);

  // Filtering
  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.accessCode && s.accessCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.guardianName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClassId === 'ALL' || s.classId === selectedClassId;
    const matchesGender = selectedGender === 'ALL' || s.gender === selectedGender;

    return matchesSearch && matchesClass && matchesGender;
  });

  const handleCopyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleOpenAdmitModal = () => {
    setSelectedStudentForEdit(null);
    setIsAdmitModalOpen(true);
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

  const handleGenerateReportCard = (student: Student) => {
    const rep = actions.computeReportCard(student.id);
    if (rep) {
      generateReportCardPDF(rep, school);
    } else {
      alert(`No approved exam score sheets available for ${student.fullName} yet.`);
    }
  };

  const handleDeleteStudent = (student: Student) => {
    if (confirm(`Are you sure you want to deactivate or remove ${student.fullName}?`)) {
      actions.deleteStudent(student.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
            <Users className="w-7 h-7 mr-2 text-indigo-600 dark:text-indigo-400" />
            Student Admission & Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Admit students, manage academic profiles, issue secure parent codes, and print official credentials
          </p>
        </div>

        <button
          onClick={handleOpenAdmitModal}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20"
        >
          <UserPlus className="w-5 h-5" />
          <span>+ Admit New Student</span>
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Enrolled</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{students.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Access Codes Active</span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{students.filter(s => s.accessCode).length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Active Classes</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{classes.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Male / Female</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {students.filter(s => s.gender === 'Male').length} M / {students.filter(s => s.gender === 'Female').length} F
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search student, adm. no, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Class Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="ALL">All Classes ({students.length})</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name} {cls.arm ? `(${cls.arm})` : ''}</option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Adm No.</th>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4">Guardian Contact</th>
                <th className="py-3.5 px-4">Parent Access Code</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No students match your search filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => {
                  const stdClass = classes.find(c => c.id === std.classId);
                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Photo & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={std.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt={std.fullName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{std.fullName}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{std.gender}</span>
                          </div>
                        </div>
                      </td>

                      {/* Adm No */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-xs text-slate-700 dark:text-slate-300">
                        {std.admissionNo}
                      </td>

                      {/* Class */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {stdClass ? `${stdClass.name} ${stdClass.arm ? `(${stdClass.arm})` : ''}` : 'Unassigned'}
                        </span>
                      </td>

                      {/* Guardian */}
                      <td className="py-3.5 px-4 text-xs">
                        <span className="font-semibold text-slate-900 dark:text-slate-200 block">{std.guardianName}</span>
                        <span className="text-slate-500 dark:text-slate-400 flex items-center mt-0.5">
                          <Phone className="w-3 h-3 mr-1" /> {std.guardianPhone}
                        </span>
                      </td>

                      {/* Access Code */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xs">
                          <span>{std.accessCode}</span>
                          <button
                            onClick={() => handleCopyAccessCode(std.accessCode)}
                            title="Copy Access Code"
                            className="p-1 hover:bg-emerald-200/50 dark:hover:bg-emerald-900/50 rounded transition-colors"
                          >
                            {copiedCode === std.accessCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Student ID Card */}
                          <button
                            onClick={() => handleViewIdCard(std)}
                            title="Student ID Card"
                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                          </button>

                          {/* Admission Letter */}
                          <button
                            onClick={() => handlePrintAdmissionLetter(std)}
                            title="Download Admission Letter PDF"
                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Report Card */}
                          <button
                            onClick={() => handleGenerateReportCard(std)}
                            title="Generate Terminal Report Card PDF"
                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                          >
                            <Award className="w-4 h-4" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => handleEditStudent(std)}
                            title="Edit Student Record"
                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete / Deactivate */}
                          <button
                            onClick={() => handleDeleteStudent(std)}
                            title="Deactivate Student"
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Modals */}
      <AdmitStudentModal
        isOpen={isAdmitModalOpen}
        onClose={() => setIsAdmitModalOpen(false)}
        existingStudent={selectedStudentForEdit}
      />

      <StudentIdCardModal
        isOpen={isIdCardModalOpen}
        onClose={() => setIsIdCardModalOpen(false)}
        student={selectedStudentForIdCard}
        studentClass={classes.find(c => c.id === selectedStudentForIdCard?.classId)}
        school={school}
      />
    </div>
  );
}
