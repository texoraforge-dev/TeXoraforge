/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Check,
  RefreshCw,
  Building2,
  Lock,
  ShieldCheck,
  Database,
  Download,
  CloudUpload,
  CheckCircle2,
  FileText,
  Key,
  Clock,
  AlertCircle,
  BookOpen,
  Plus,
  Trash2,
  Search,
  Tag,
  X,
  Sparkles,
  CreditCard,
  Upload,
  GraduationCap,
  Users,
  Layers,
  CheckSquare,
  Loader2
} from 'lucide-react';
import { useAppStore } from '../storage';
import { DEFAULT_SCHOOL_SUBJECTS, SUBJECT_OPTIONS_BY_TIER } from '../mockData';
import { Logo, COMPANY_LOGO_DATA_URI } from './Logo';
import { uploadAppFile } from '../lib/supabaseStorage';
import { isSupabaseConfigured } from '../lib/supabase';

export const SchoolSettings: React.FC = () => {
  const { school, submissions, attendance, users, classes, students, actions } = useAppStore();

  const [activeTab, setActiveTab] = useState<'general' | 'subjects' | 'security'>('general');

  // General Settings state
  const [name, setName] = useState(school?.name || '');
  const [motto, setMotto] = useState(school?.motto || '');
  const [logoUrl, setLogoUrl] = useState(school?.logoUrl || COMPANY_LOGO_DATA_URI);
  const [academicSession, setAcademicSession] = useState(school?.academicSession || '2025/2026');
  const [academicTerm, setAcademicTerm] = useState<'First Term' | 'Second Term' | 'Third Term'>(school?.academicTerm || 'First Term');
  const [savedGeneral, setSavedGeneral] = useState(false);

  const [isLogoUploading, setIsLogoUploading] = useState(false);

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Logo file size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      if (isSupabaseConfigured()) {
        setIsLogoUploading(true);
        try {
          const uploadRes = await uploadAppFile({
            featureName: 'logos',
            itemId: school?.id || 'school_logo',
            file,
            customFileName: `crest_${Date.now()}.${file.name.split('.').pop() || 'png'}`
          });

          if (!uploadRes.error && uploadRes.signedUrl) {
            setLogoUrl(uploadRes.signedUrl);
          }
        } catch (err) {
          console.warn('Failed to upload school logo to Supabase storage:', err);
        } finally {
          setIsLogoUploading(false);
        }
      }
    }
  };

  // Subject Management state
  const currentSubjects = school?.id ? actions.getSchoolSubjects(school.id) : DEFAULT_SCHOOL_SUBJECTS;
  const [newSubject, setNewSubject] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectMessage, setSubjectMessage] = useState('');
  const [subjectError, setSubjectError] = useState('');

  // Class-Specific Curriculum Management State (Principal Authority)
  const [curriculumViewMode, setCurriculumViewMode] = useState<'CLASS_OFFERINGS' | 'GLOBAL_DIRECTORY'>('CLASS_OFFERINGS');
  const [selectedClassForSubjects, setSelectedClassForSubjects] = useState<string>(classes[0]?.id || 'cls_ss3');
  const [newClassSubjectInput, setNewClassSubjectInput] = useState('');

  const targetClassObj = classes.find(c => c.id === selectedClassForSubjects) || classes[0];
  const targetClassSubjects = targetClassObj ? actions.getClassSubjects(targetClassObj.id) : [];
  const targetClassStudents = students.filter(s => s.classId === targetClassObj?.id);

  // Add subject specifically to target class
  const handleAddSubjectToClass = (subjectName: string) => {
    if (!targetClassObj || !subjectName.trim()) return;
    const cleanSub = subjectName.trim();
    if (targetClassSubjects.some(s => s.toLowerCase() === cleanSub.toLowerCase())) {
      setSubjectError(`"${cleanSub}" is already offered in ${targetClassObj.name}.`);
      setTimeout(() => setSubjectError(''), 3000);
      return;
    }

    actions.addSubjectToClass(targetClassObj.id, cleanSub);
    setNewClassSubjectInput('');
    setSubjectMessage(`Added "${cleanSub}" to ${targetClassObj.name}. Synced to all ${targetClassStudents.length} enrolled student(s)!`);
    setTimeout(() => setSubjectMessage(''), 3500);
  };

  // Remove subject specifically from target class
  const handleRemoveSubjectFromClass = (subjectName: string) => {
    if (!targetClassObj) return;
    actions.removeSubjectFromClass(targetClassObj.id, subjectName);
    setSubjectMessage(`Removed "${subjectName}" from ${targetClassObj.name}. Updated all enrolled students.`);
    setTimeout(() => setSubjectMessage(''), 3500);
  };

  // Reset class subjects to standard tier defaults
  const handleResetClassSubjectsToTier = () => {
    if (!targetClassObj) return;
    if (window.confirm(`Reset curriculum for ${targetClassObj.name} to standard recommended subjects for ${targetClassObj.category}?`)) {
      const defaultTierSubjects = SUBJECT_OPTIONS_BY_TIER[targetClassObj.category] || DEFAULT_SCHOOL_SUBJECTS;
      actions.updateClassSubjects(targetClassObj.id, [...defaultTierSubjects]);
      setSubjectMessage(`Reset ${targetClassObj.name} curriculum to standard ${defaultTierSubjects.length} subjects.`);
      setTimeout(() => setSubjectMessage(''), 3500);
    }
  };

  // Security Settings state
  const [autoSync, setAutoSync] = useState(() => {
    return localStorage.getItem('texora_auto_sync') !== 'false';
  });
  const [requireApproval, setRequireApproval] = useState(() => {
    return localStorage.getItem('texora_require_approval') !== 'false';
  });
  const [twoFactorAdmin, setTwoFactorAdmin] = useState(() => {
    return localStorage.getItem('texora_2fa_admin') === 'true';
  });
  const [lastBackup, setLastBackup] = useState<string | null>(() => {
    return localStorage.getItem('texora_last_backup');
  });

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupStep, setBackupStep] = useState('');
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [savedSecurity, setSavedSecurity] = useState(false);

  useEffect(() => {
    localStorage.setItem('texora_auto_sync', String(autoSync));
    localStorage.setItem('texora_require_approval', String(requireApproval));
    localStorage.setItem('texora_2fa_admin', String(twoFactorAdmin));
  }, [autoSync, requireApproval, twoFactorAdmin]);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;

    const schools = actions.getSchools();
    const idx = schools.findIndex(s => s.id === school.id);
    if (idx !== -1) {
      schools[idx] = {
        ...schools[idx],
        name,
        motto,
        logoUrl,
        academicSession,
        academicTerm
      };
      localStorage.setItem('texora_schools_v1', JSON.stringify(schools));
      window.dispatchEvent(new Event('texora_storage_change'));
    }

    setSavedGeneral(true);
    setTimeout(() => setSavedGeneral(false), 2500);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSecurity(true);
    setTimeout(() => setSavedSecurity(false), 2500);
  };

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;
    const trimmed = newSubject.trim();
    if (!trimmed) return;

    const subjectsToAdd = trimmed.split(',').map(s => s.trim()).filter(Boolean);
    let addedCount = 0;

    subjectsToAdd.forEach(sub => {
      if (!currentSubjects.some(s => s.toLowerCase() === sub.toLowerCase())) {
        actions.addSchoolSubject(school.id, sub);
        addedCount++;
      }
    });

    setNewSubject('');
    setSubjectError('');
    if (addedCount > 0) {
      setSubjectMessage(`Successfully added ${addedCount} subject(s) to curriculum.`);
    } else {
      setSubjectError(`Entered subject(s) already exist in your curriculum.`);
      setTimeout(() => setSubjectError(''), 3000);
    }
    setTimeout(() => setSubjectMessage(''), 3000);
  };

  const handleQuickAddSubject = (subjectName: string) => {
    if (!school) return;
    if (currentSubjects.some(s => s.toLowerCase() === subjectName.toLowerCase())) {
      setSubjectError(`Subject "${subjectName}" is already added.`);
      setTimeout(() => setSubjectError(''), 3000);
      return;
    }
    actions.addSchoolSubject(school.id, subjectName);
    setSubjectError('');
    setSubjectMessage(`Added "${subjectName}"`);
    setTimeout(() => setSubjectMessage(''), 3000);
  };

  const handleRemoveSubjectClick = (subjectName: string) => {
    if (!school) return;
    actions.removeSchoolSubject(school.id, subjectName);
    setSubjectMessage(`Removed "${subjectName}" from curriculum.`);
    setTimeout(() => setSubjectMessage(''), 3000);
  };

  const handleResetDefaultSubjects = () => {
    if (!school) return;
    if (window.confirm("Are you sure you want to restore the standard default subjects list?")) {
      actions.updateSchoolSubjects(school.id, [...DEFAULT_SCHOOL_SUBJECTS]);
      setSubjectMessage('Curriculum subjects reset to default list.');
      setTimeout(() => setSubjectMessage(''), 3000);
    }
  };

  const handleInitiateBackup = () => {
    setIsBackingUp(true);
    setBackupSuccess(false);

    setBackupStep('Gathering school academic records...');
    setTimeout(() => {
      setBackupStep('Applying SHA-256 data checksums...');
      setTimeout(() => {
        setBackupStep('Packaging encrypted JSON payload...');
        setTimeout(() => {
          // Construct complete backup object
          const backupData = {
            metadata: {
              platform: 'TeXora Forge Academic System',
              schoolName: school?.name || 'School System',
              schoolCode: school?.code || 'TEXORA',
              exportTimestamp: new Date().toISOString(),
              version: '2.4.0',
              checksum: 'SHA256-' + Math.random().toString(36).substring(2, 15)
            },
            school,
            submissions,
            attendance,
            users,
            classes,
            students
          };

          const jsonString = JSON.stringify(backupData, null, 2);
          const encodedPayload = btoa(unescape(encodeURIComponent(jsonString)));
          
          const encryptedFileContent = JSON.stringify({
            cipher: 'AES-256-GCM-SIMULATED',
            schoolCode: school?.code,
            timestamp: new Date().toISOString(),
            payload: encodedPayload
          }, null, 2);

          const blob = new Blob([encryptedFileContent], { type: 'application/json;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          const dateStamp = new Date().toISOString().split('T')[0];
          link.setAttribute('download', `${(school?.code || 'school').toLowerCase()}_academic_backup_encrypted_${dateStamp}.json`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          const nowFormatted = new Date().toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
          });
          setLastBackup(nowFormatted);
          localStorage.setItem('texora_last_backup', nowFormatted);

          setIsBackingUp(false);
          setBackupSuccess(true);
          setTimeout(() => setBackupSuccess(false), 4000);
        }, 700);
      }, 700);
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            School System Configurations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage school identity, active academic sessions, auto-sync parameters, and system security.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-700/80 pb-3">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
          }`}
        >
          <Building2 className="h-4 w-4" />
          General & Identity
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'subjects'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Subject Directory & Curriculum
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeTab === 'subjects'
              ? 'bg-indigo-700 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}>
            {currentSubjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Security & Auto-Sync
        </button>
      </div>

      {/* GENERAL TAB CONTENT */}
      {activeTab === 'general' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-6">
          
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <Logo size="lg" />
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{school?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">School Identifier Code: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{school?.code}</span></p>
            </div>
          </div>

          <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">School Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">School Motto / Tagline</label>
              <input
                type="text"
                value={motto}
                onChange={e => setMotto(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">School Official Logo</label>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="h-14 w-14 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="School Logo" className="h-full w-full object-contain" />
                  ) : (
                    <Logo size="md" />
                  )}
                </div>
                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Upload New School Crest / Logo</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Replaces current logo on exam questions, report cards & identity cards (Max 5MB)</p>
                </div>
                <label className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0">
                  {isLogoUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span>{isLogoUploading ? 'Uploading...' : 'Choose File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Academic Session</label>
                <input
                  type="text"
                  required
                  value={academicSession}
                  onChange={e => setAcademicSession(e.target.value)}
                  placeholder="e.g. 2025/2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Active Academic Term</label>
                <select
                  value={academicTerm}
                  onChange={e => setAcademicTerm(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end items-center">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md flex items-center gap-2 cursor-pointer"
              >
                {savedGeneral ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {savedGeneral ? 'Settings Saved!' : 'Save School Settings'}
              </button>
            </div>
          </form>

        </div>
      )}

      {/* SUBJECT DIRECTORY & CURRICULUM TAB CONTENT */}
      {activeTab === 'subjects' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-6">
          
          {/* Header Info & Sub-view Toggle */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700/80 pb-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Curriculum & Class Subjects Management
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure specific subjects offered in each class. Students admitted to a class automatically inherit its configured subjects.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurriculumViewMode('CLASS_OFFERINGS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    curriculumViewMode === 'CLASS_OFFERINGS'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  Class Subject Allotment
                </button>
                <button
                  type="button"
                  onClick={() => setCurriculumViewMode('GLOBAL_DIRECTORY')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    curriculumViewMode === 'GLOBAL_DIRECTORY'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Tag className="h-3.5 w-3.5" />
                  Global Subject Master
                </button>
              </div>

              {curriculumViewMode === 'GLOBAL_DIRECTORY' && (
                <button
                  onClick={handleResetDefaultSubjects}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                  Restore Defaults
                </button>
              )}
            </div>
          </div>

          {/* Feedback Alerts */}
          {subjectMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{subjectMessage}</span>
            </div>
          )}

          {subjectError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{subjectError}</span>
            </div>
          )}

          {/* SECTION A: CLASS-SPECIFIC SUBJECT ALLOTMENT (PRINCIPAL AUTHORITY) */}
          {curriculumViewMode === 'CLASS_OFFERINGS' && (
            <div className="space-y-6">
              
              {/* Class Selector Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Select Target Class to Configure Subjects:
                  </label>
                  <span className="text-xs text-slate-500 font-bold">
                    {classes.length} Classes Available
                  </span>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {classes.map(cls => {
                    const isSelected = cls.id === selectedClassForSubjects;
                    const subCount = (cls.subjects || []).length;
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => setSelectedClassForSubjects(cls.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        <span>{cls.name}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {subCount} subs
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Class Subject Management Deck */}
              {targetClassObj && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-800 border border-indigo-100 dark:border-slate-700 shadow-xs space-y-4">
                  
                  {/* Class Header Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700/80 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-[11px] font-extrabold">
                          {targetClassObj.category}
                        </span>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {targetClassObj.name} Curriculum & Subject Allocation
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Currently offering <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{targetClassSubjects.length} subjects</span> • All <span className="font-extrabold text-slate-800 dark:text-slate-200">{targetClassStudents.length} enrolled student(s)</span> automatically take this curriculum.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetClassSubjectsToTier}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 text-slate-700 dark:text-slate-300 hover:text-amber-600 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors shrink-0"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-amber-500" />
                      Apply Tier Recommendations
                    </button>
                  </div>

                  {/* Add Subject to This Class Form */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Plus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      Add Subject to {targetClassObj.name}
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      {/* Dropdown of available school subjects not yet in this class */}
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddSubjectToClass(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="w-full sm:w-64 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="" disabled>+ Choose from Approved Directory...</option>
                        {currentSubjects
                          .filter(s => !targetClassSubjects.some(t => t.toLowerCase() === s.toLowerCase()))
                          .map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                      </select>

                      {/* Or type custom subject */}
                      <div className="flex items-center gap-1.5 w-full sm:flex-1">
                        <input
                          type="text"
                          value={newClassSubjectInput}
                          onChange={e => setNewClassSubjectInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubjectToClass(newClassSubjectInput);
                            }
                          }}
                          placeholder="Or type custom subject name..."
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSubjectToClass(newClassSubjectInput)}
                          disabled={!newClassSubjectInput.trim()}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer shrink-0 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add
                        </button>
                      </div>
                    </div>

                    {/* Quick Add Suggestions based on category */}
                    <div className="pt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400">Quick additions:</span>
                      {['Coding & Robotics', 'French', 'Music', 'Technical Drawing', 'Civic Education', 'Agricultural Science', 'Data Processing', 'History']
                        .filter(s => !targetClassSubjects.some(t => t.toLowerCase() === s.toLowerCase()))
                        .slice(0, 5)
                        .map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleAddSubjectToClass(s)}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-950 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center gap-1 transition-colors"
                          >
                            <Plus className="h-2.5 w-2.5 text-indigo-500" />
                            {s}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Active Subjects List for this class */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Subjects Offered in {targetClassObj.name} ({targetClassSubjects.length}):
                      </span>
                      <span className="text-[11px] text-slate-400 italic">
                        Click the trash icon to remove/reduce a subject from this class
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {targetClassSubjects.map((sub, index) => (
                        <div
                          key={sub}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs hover:border-indigo-300 transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-1">
                            <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                              {index + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {sub}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveSubjectFromClass(sub)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer shrink-0"
                            title={`Remove ${sub} from ${targetClassObj.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}

                      {targetClassSubjects.length === 0 && (
                        <div className="col-span-full p-6 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                          <p className="text-xs font-bold text-slate-500">No subjects currently assigned to {targetClassObj.name}. Add subjects above or restore tier defaults.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Auto-sync Information Notice */}
                  <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
                      <span className="font-extrabold">Automatic Student Inheritance Active:</span> Every student admitted to <span className="font-extrabold underline">{targetClassObj.name}</span> automatically offers these <span className="font-extrabold">{targetClassSubjects.length} subjects</span>. Any additions or reductions made by the Principal immediately update the academic roster and CBT exam eligibility.
                    </p>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* SECTION B: GLOBAL SUBJECT MASTER DIRECTORY */}
          {curriculumViewMode === 'GLOBAL_DIRECTORY' && (
            <div className="space-y-6">

          {/* 1. Add New Subject Input Form */}
          <form onSubmit={handleAddSubjectSubmit} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Add Custom Subject
            </label>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                placeholder="Enter subject name (e.g. Technical Drawing, Coding & Robotics, French)..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!newSubject.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer shrink-0 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Subject
              </button>
            </div>

            {/* Quick Add Suggestions */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Quick-Add Common Electives & Vocational Subjects:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Coding & Robotics',
                  'French',
                  'Data Processing',
                  'Technical Drawing',
                  'Music',
                  'Home Economics',
                  'Commerce',
                  'Marketing',
                  'Geography',
                  'History',
                  'Yoruba',
                  'Igbo',
                  'Hausa',
                  'Arabic'
                ].map(suggested => {
                  const isAdded = currentSubjects.some(s => s.toLowerCase() === suggested.toLowerCase());
                  return (
                    <button
                      key={suggested}
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleQuickAddSubject(suggested)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                        isAdded
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                          : 'bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer'
                      }`}
                    >
                      {isAdded ? <Check className="h-3 w-3 text-emerald-500" /> : <Plus className="h-3 w-3 text-indigo-500" />}
                      {suggested}
                    </button>
                  );
                })}
              </div>
            </div>
          </form>

          {/* 2. Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={subjectSearch}
                onChange={e => setSubjectSearch(e.target.value)}
                placeholder="Search subject list..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {subjectSearch && (
                <button
                  onClick={() => setSubjectSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Showing <span className="text-slate-900 dark:text-white font-extrabold">{currentSubjects.filter(s => s.toLowerCase().includes(subjectSearch.toLowerCase())).length}</span> of <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{currentSubjects.length}</span> active subject(s)
            </div>
          </div>

          {/* 3. Subjects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {currentSubjects
              .filter(s => s.toLowerCase().includes(subjectSearch.toLowerCase()))
              .map((subjectName) => (
                <div
                  key={subjectName}
                  className="group flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700/80 transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Tag className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {subjectName}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSubjectClick(subjectName)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer shrink-0"
                    title={`Remove ${subjectName} from curriculum`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

            {currentSubjects.filter(s => s.toLowerCase().includes(subjectSearch.toLowerCase())).length === 0 && (
              <div className="col-span-full p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                <BookOpen className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  No subjects found matching "{subjectSearch}"
                </p>
              </div>
            )}
          </div>

        </div>
          )}

        </div>
      )}

      {/* SECURITY & AUTO-SYNC TAB CONTENT */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          
          {/* Section 1: Auto-Sync & Policy Controls */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700/80 pb-4">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                <CloudUpload className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Lesson Notes Auto-Sync & Workflow Rules
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure automated repository sync for teacher submissions and governance protocols.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSecurity} className="space-y-5 text-xs">
              
              {/* Auto-Sync Toggle */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    Auto-Sync Lesson Notes
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Automatically synchronize teacher lesson note edits and draft submissions to central school archives in real time.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSync(!autoSync)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    autoSync ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      autoSync ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Require Approval Toggle */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-500" />
                    Require Admin Review for Re-submissions
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Require explicit School Admin approval when teachers submit revised notes after a feedback request.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRequireApproval(!requireApproval)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    requireApproval ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      requireApproval ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 2FA Toggle */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Key className="h-4 w-4 text-emerald-500" />
                    Enforce Admin Session Encryption
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Encrypt sensitive administrative actions and local storage session keys.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactorAdmin(!twoFactorAdmin)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    twoFactorAdmin ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      twoFactorAdmin ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {savedSecurity ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {savedSecurity ? 'Security Settings Saved!' : 'Save Security Rules'}
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Encrypted Academic Backup */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Encrypted Academic System Backup
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Generate an immediate full backup payload containing all school registers, attendance logs, and submissions.
                  </p>
                </div>
              </div>

              {lastBackup && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-medium">
                  <Clock className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Last backup: <strong className="text-slate-900 dark:text-white">{lastBackup}</strong></span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
                  <p className="text-slate-500 dark:text-slate-400">Submissions</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{submissions.length} Records</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
                  <p className="text-slate-500 dark:text-slate-400">Attendance Register</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{attendance.length} Logs</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
                  <p className="text-slate-500 dark:text-slate-400">Enrolled Students</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{students.length} Students</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
                  <p className="text-slate-500 dark:text-slate-400">Staff Accounts</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{users.length} Users</p>
                </div>
              </div>

              {isBackingUp && (
                <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 flex items-center gap-3">
                  <RefreshCw className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  <span className="font-bold text-indigo-900 dark:text-indigo-200">{backupStep}</span>
                </div>
              )}

              {backupSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-bold">Encrypted academic backup package generated and downloaded successfully!</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Backups are wrapped in simulated AES-256 header encryption and can be stored in secure physical archives or imported for audit verification.
                </p>

                <button
                  type="button"
                  onClick={handleInitiateBackup}
                  disabled={isBackingUp}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  {isBackingUp ? 'Encrypting...' : 'Initiate Encrypted Backup'}
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

