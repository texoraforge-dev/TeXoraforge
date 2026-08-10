/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, UserPlus, Upload, Camera, FileText, Key, CheckCircle2, RefreshCw, BookOpen, Check, Plus } from 'lucide-react';
import { Student, SchoolClass, School } from '../../types';
import { useAppStore } from '../../storage';
import { DEFAULT_SCHOOL_SUBJECTS } from '../../mockData';
import { generateAdmissionLetterPDF } from '../../lib/pdfGenerator';

interface AdmitStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingStudent?: Student | null;
  onSuccess?: () => void;
}

export function AdmitStudentModal({
  isOpen,
  onClose,
  existingStudent,
  onSuccess
}: AdmitStudentModalProps) {
  const { classes, school, actions } = useAppStore();

  const availableSubjects = (school?.subjects && school.subjects.length > 0)
    ? school.subjects
    : DEFAULT_SCHOOL_SUBJECTS;

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [classId, setClassId] = useState('');
  const [dob, setDob] = useState('2015-05-10');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [enrolledSubjects, setEnrolledSubjects] = useState<string[]>([]);
  const [customSubjectInput, setCustomSubjectInput] = useState('');

  const handleAddCustomSubject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customSubjectInput.trim();
    if (!trimmed) return;

    // Support comma-separated subjects typed at once
    const subjectsToAdd = trimmed.split(',').map(s => s.trim()).filter(Boolean);
    
    subjectsToAdd.forEach(sub => {
      if (school?.id) {
        actions.addSchoolSubject(school.id, sub);
      }
      if (!enrolledSubjects.includes(sub)) {
        setEnrolledSubjects(prev => [...prev, sub]);
      }
    });

    setCustomSubjectInput('');
  };

  // Auto generate credentials when opening modal for new admission
  useEffect(() => {
    if (isOpen) {
      if (existingStudent) {
        setFullName(existingStudent.fullName);
        setGender(existingStudent.gender);
        setClassId(existingStudent.classId);
        setDob(existingStudent.dob || '2015-05-10');
        setGuardianName(existingStudent.guardianName);
        setGuardianPhone(existingStudent.guardianPhone);
        setGuardianEmail(existingStudent.guardianEmail || '');
        setAddress(existingStudent.address || '');
        setPhotoUrl(existingStudent.photoUrl || '');
        setAdmissionNo(existingStudent.admissionNo);
        setAccessCode(existingStudent.accessCode);
        setEnrolledSubjects(existingStudent.enrolledSubjects || availableSubjects);
      } else {
        const yr = new Date().getFullYear();
        const randNum = Math.floor(100 + Math.random() * 900);
        const codeSuffix = Math.floor(1000 + Math.random() * 9000);
        setFullName('');
        setGender('Male');
        setClassId(classes[0]?.id || '');
        setDob('2016-04-12');
        setGuardianName('');
        setGuardianPhone('');
        setGuardianEmail('');
        setAddress('');
        setPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
        setAdmissionNo(`APX/${yr}/${randNum}`);
        setAccessCode(`PAR-${yr}-${codeSuffix}`);
        setEnrolledSubjects(availableSubjects);
      }
    }
  }, [isOpen, existingStudent, classes, school]);

  if (!isOpen) return null;

  const handleRegenerateCodes = () => {
    const yr = new Date().getFullYear();
    const randNum = Math.floor(100 + Math.random() * 900);
    const codeSuffix = Math.floor(1000 + Math.random() * 9000);
    setAdmissionNo(`APX/${yr}/${randNum}`);
    setAccessCode(`PAR-${yr}-${codeSuffix}`);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !guardianName.trim() || !guardianPhone.trim()) {
      alert('Please fill in student full name, guardian name, and contact phone number.');
      return;
    }

    if (existingStudent) {
      actions.updateStudent(existingStudent.id, {
        fullName: fullName.trim(),
        gender,
        classId: classId || classes[0]?.id,
        dob,
        guardianName: guardianName.trim(),
        guardianPhone: guardianPhone.trim(),
        guardianEmail: guardianEmail.trim(),
        address: address.trim(),
        photoUrl,
        admissionNo,
        accessCode,
        enrolledSubjects
      });
    } else {
      actions.createStudent({
        schoolId: school?.id || 'school_apex',
        fullName: fullName.trim(),
        gender,
        classId: classId || classes[0]?.id,
        admissionNo,
        guardianName: guardianName.trim(),
        guardianPhone: guardianPhone.trim(),
        guardianEmail: guardianEmail.trim(),
        address: address.trim(),
        dob,
        dateAdmitted: new Date().toISOString().split('T')[0],
        photoUrl,
        accessCode,
        enrolledSubjects,
        active: true
      });
    }

    if (onSuccess) onSuccess();
    onClose();
  };

  const handleDownloadLetter = () => {
    const targetClass = classes.find(c => c.id === classId);
    const dummyStudent: Student = {
      id: existingStudent?.id || 'temp',
      schoolId: school?.id || 'school_apex',
      classId,
      admissionNo,
      fullName: fullName || 'New Student',
      gender,
      guardianName: guardianName || 'Guardian',
      guardianPhone: guardianPhone || '+234 800 000 0000',
      guardianEmail,
      address,
      dob,
      dateAdmitted: new Date().toISOString().split('T')[0],
      photoUrl,
      accessCode,
      active: true
    };

    generateAdmissionLetterPDF(dummyStudent, targetClass, school);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 my-8 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                {existingStudent ? 'Edit Student Record' : 'Admit New Student'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Provide student profile details, assign class, and issue parent portal credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Top Section: Passport Photo Upload & Generated Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            {/* Passport Photo */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="relative w-24 h-28 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center group">
                {photoUrl ? (
                  <img src={photoUrl} alt="Passport Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2">
                    <Camera className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-500">Upload Photo</span>
                  </div>
                )}
                <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer text-xs font-semibold">
                  <Upload className="w-4 h-4 mr-1" /> Change
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Passport Photo</span>
            </div>

            {/* Generated Admission Info */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center">
                  <Key className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                  System Generated Identifiers
                </span>
                {!existingStudent && (
                  <button
                    type="button"
                    onClick={handleRegenerateCodes}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Regenerate
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Admission No</label>
                  <input
                    type="text"
                    value={admissionNo}
                    onChange={(e) => setAdmissionNo(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Parent Access Code</label>
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xs"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Student Personal Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Student Particulars
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Adebayo Tobi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Class *
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {cls.arm ? `(${cls.arm})` : ''} - {cls.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Parent / Guardian Particulars */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Parent & Guardian Contact Info
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Guardian Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chief Adebayo Sr."
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Guardian Phone Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. +234 803 000 1111"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Guardian Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. parent@domain.com"
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12 Admiralty Way, Victoria Island"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Offered Academic Subjects Selection */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Offered Academic Subjects ({enrolledSubjects.length} of {availableSubjects.length} Selected)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select which subjects this student/pupil will study and offer this term.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEnrolledSubjects([...availableSubjects])}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold hover:bg-indigo-100 transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setEnrolledSubjects([])}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-bold hover:bg-rose-100 transition-colors"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Manual Type-In Subject Field */}
            <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60">
              <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-300 mb-1.5 flex items-center gap-1">
                <Plus className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                Type Subject Manually (e.g., Technical Drawing, Robotics, French)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customSubjectInput}
                  onChange={(e) => setCustomSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSubject();
                    }
                  }}
                  placeholder="Type subject name here and click Add..."
                  className="flex-1 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomSubject()}
                  disabled={!customSubjectInput.trim()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Subject
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 max-h-52 overflow-y-auto">
              {availableSubjects.map((sub) => {
                const isSelected = enrolledSubjects.includes(sub);
                return (
                  <div
                    key={sub}
                    onClick={() => {
                      if (isSelected) {
                        setEnrolledSubjects(enrolledSubjects.filter(s => s !== sub));
                      } else {
                        setEnrolledSubjects([...enrolledSubjects, sub]);
                      }
                    }}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs font-semibold transition-all select-none border ${
                      isSelected
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{sub}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 items-center justify-between">
            <button
              type="button"
              onClick={handleDownloadLetter}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs transition-colors"
            >
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Print Admission Letter PDF</span>
            </button>

            <div className="flex items-center space-x-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{existingStudent ? 'Save Changes' : 'Confirm Admission'}</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
