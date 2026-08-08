/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { X, Printer, Shield, User, School as SchoolIcon, QrCode } from 'lucide-react';
import { Student, SchoolClass, School } from '../../types';

interface StudentIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  studentClass?: SchoolClass | null;
  school?: School | null;
}

export function StudentIdCardModal({
  isOpen,
  onClose,
  student,
  studentClass,
  school
}: StudentIdCardModalProps) {
  if (!isOpen || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
              Official Student ID Card
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - ID Card Graphic */}
        <div className="p-6 flex flex-col items-center justify-center">
          <div id="student-id-card" className="w-full max-w-xs bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-xl border border-indigo-500/30 overflow-hidden p-5 flex flex-col items-center text-center relative">
            {/* Top Accent Line */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400"></div>

            {/* School Header */}
            <div className="flex items-center justify-center space-x-2 mb-3 mt-1">
              {school?.logoUrl ? (
                <img src={school.logoUrl} alt="School Logo" className="w-8 h-8 rounded-full object-cover border border-white/30" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  <SchoolIcon className="w-4 h-4" />
                </div>
              )}
              <div>
                <h4 className="font-extrabold text-sm tracking-wide text-white uppercase">{school?.name || 'Apex Horizon Academy'}</h4>
                <p className="text-[10px] text-indigo-200 italic">{school?.motto || 'Excellence & Innovation'}</p>
              </div>
            </div>

            {/* Passport Photo */}
            <div className="relative my-2">
              <div className="w-24 h-24 rounded-2xl border-2 border-indigo-400/50 overflow-hidden bg-slate-800 shadow-inner flex items-center justify-center">
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-500" />
                )}
              </div>
              <span className="absolute -bottom-2 -right-1 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                ACTIVE
              </span>
            </div>

            {/* Student Name & Details */}
            <h3 className="font-bold text-base text-white mt-2 leading-snug">{student.fullName}</h3>
            <p className="text-xs text-indigo-300 font-medium">{studentClass ? studentClass.name : 'Class Student'}</p>

            <div className="w-full my-3 border-t border-slate-700/60 pt-3 text-left space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Admission No:</span>
                <span className="font-mono font-bold text-white">{student.admissionNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gender / DOB:</span>
                <span className="font-medium text-slate-200">{student.gender} • {student.dob || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Guardian Tel:</span>
                <span className="font-medium text-slate-200">{student.guardianPhone}</span>
              </div>
            </div>

            {/* Access Code Footer */}
            <div className="w-full bg-indigo-900/60 rounded-xl p-2.5 border border-indigo-500/30 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[9px] font-semibold tracking-wider text-indigo-300 uppercase block">Parent Access Code</span>
                <span className="font-mono font-bold text-emerald-400 text-sm tracking-wide">{student.accessCode}</span>
              </div>
              <QrCode className="w-7 h-7 text-indigo-300 opacity-80" />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official verifiable ID badge
          </p>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print ID Card</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
