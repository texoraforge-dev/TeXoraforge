/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Save,
  Check,
  AlertCircle,
  FileText,
  Printer,
  ShieldAlert,
  Coffee,
  HelpCircle,
  RotateCcw,
  Table as TableIcon,
  List
} from 'lucide-react';
import { useAppStore } from '../storage';
import { ClassTimetable, ExamTimetable, ExamTimetableEntry, ClassPeriod, TimetableDay } from '../types';

const DAYS_OF_WEEK: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

interface TimetableManagementProps {
  onNavigate?: (view: string) => void;
  initialClassId?: string;
}

export const TimetableManagement: React.FC<TimetableManagementProps> = ({
  initialClassId
}) => {
  const { school, currentUser, classes, users, classTimetables, examTimetables, actions } = useAppStore();

  const isAdmin = currentUser?.role === 'SCHOOL_ADMIN';
  const isTeacher = currentUser?.role === 'TEACHER';
  const isParent = currentUser?.role === 'PARENT';
  const isStudent = currentUser?.role === 'STUDENT';

  // Available classes selection for user role
  const visibleClasses = isStudent
    ? classes.filter(c => currentUser?.assignedClassIds?.includes(c.id))
    : classes;
  const effectiveClasses = visibleClasses.length > 0 ? visibleClasses : (classes.length > 0 ? [classes[0]] : []);

  const defaultClassId = (isStudent && currentUser?.assignedClassIds?.[0]) || initialClassId || effectiveClasses[0]?.id || 'cls_ss3';
  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId);

  // Main Mode Tab: 'CLASS' or 'EXAM'
  const [activeTab, setActiveTab] = useState<'CLASS' | 'EXAM'>('CLASS');

  // Table View Style: 'MATRIX' (Days vs Time Slots) or 'LIST_TABLE' (Row-per-period tabular view)
  const [classTableViewMode, setClassTableViewMode] = useState<'MATRIX' | 'LIST_TABLE'>('MATRIX');

  // Selected Day Filter for Class Timetable ('ALL' or specific day)
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL');

  // Toast / Status Message
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Current Active Class object
  const activeClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // Teachers list for dropdowns
  const teacherUsers = useMemo(() => {
    return users.filter(u => u.role === 'TEACHER');
  }, [users]);

  // Subjects for dropdown
  const schoolSubjects = useMemo(() => {
    return actions.getSchoolSubjects(school?.id);
  }, [actions, school]);

  // Retrieve current class timetable for selected class
  const existingClassTT = useMemo(() => {
    return classTimetables.find(t => t.classId === selectedClassId) || null;
  }, [classTimetables, selectedClassId]);

  // Retrieve current exam timetable for selected class
  const existingExamTT = useMemo(() => {
    return examTimetables.find(t => t.classId === selectedClassId) || null;
  }, [examTimetables, selectedClassId]);

  // Local draft state for Class Timetable editing
  const [classDays, setClassDays] = useState<TimetableDay[]>([]);
  const [isEditingClassTT, setIsEditingClassTT] = useState<boolean>(false);

  // Modal for Adding / Editing Class Period
  const [periodModalOpen, setPeriodModalOpen] = useState(false);
  const [editingDayName, setEditingDayName] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  const [editingPeriodIndex, setEditingPeriodIndex] = useState<number | null>(null);
  const [periodForm, setPeriodForm] = useState<{
    time: string;
    subject: string;
    teacherName: string;
    venue: string;
    isBreak: boolean;
  }>({
    time: '08:00 AM - 08:45 AM',
    subject: 'Mathematics',
    teacherName: '',
    venue: '',
    isBreak: false
  });

  // Local draft state for Exam Timetable editing
  const [examTitle, setExamTitle] = useState<string>('');
  const [examEntries, setExamEntries] = useState<ExamTimetableEntry[]>([]);
  const [isEditingExamTT, setIsEditingExamTT] = useState<boolean>(false);

  // Modal for Adding / Editing Exam Entry
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examForm, setExamForm] = useState<{
    date: string;
    day: string;
    timeSlot: string;
    subject: string;
    hallOrVenue: string;
    invigilators: string;
    instructions: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    day: 'Monday',
    timeSlot: '09:00 AM - 11:30 AM',
    subject: 'Mathematics',
    hallOrVenue: 'Main Multipurpose Hall',
    invigilators: '',
    instructions: ''
  });

  // Load class timetable into local state when selectedClassId or existingClassTT changes
  React.useEffect(() => {
    if (existingClassTT && existingClassTT.days && existingClassTT.days.length > 0) {
      setClassDays(existingClassTT.days);
    } else {
      // Default empty 5 days
      setClassDays([
        { day: 'Monday', periods: [] },
        { day: 'Tuesday', periods: [] },
        { day: 'Wednesday', periods: [] },
        { day: 'Thursday', periods: [] },
        { day: 'Friday', periods: [] }
      ]);
    }
  }, [selectedClassId, existingClassTT]);

  // Load exam timetable into local state when selectedClassId or existingExamTT changes
  React.useEffect(() => {
    if (existingExamTT) {
      setExamTitle(existingExamTT.examTitle || 'First Term Final Examinations');
      setExamEntries(existingExamTT.entries || []);
    } else {
      setExamTitle('First Term Final Examinations');
      setExamEntries([]);
    }
  }, [selectedClassId, existingExamTT]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // --- CLASS TIMETABLE HANDLERS ---
  const handleOpenAddPeriod = (dayName: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday', presetTime?: string) => {
    setEditingDayName(dayName);
    setEditingPeriodIndex(null);
    setPeriodForm({
      time: presetTime || '08:00 AM - 08:45 AM',
      subject: schoolSubjects[0] || 'Mathematics',
      teacherName: teacherUsers[0]?.name || '',
      venue: activeClass ? `${activeClass.name} Classroom` : 'Classroom 1',
      isBreak: false
    });
    setPeriodModalOpen(true);
  };

  const handleOpenEditPeriod = (
    dayName: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday',
    idx: number,
    period: ClassPeriod
  ) => {
    setEditingDayName(dayName);
    setEditingPeriodIndex(idx);
    setPeriodForm({
      time: period.time || '08:00 AM - 08:45 AM',
      subject: period.subject || 'Mathematics',
      teacherName: period.teacherName || '',
      venue: period.venue || '',
      isBreak: !!period.isBreak
    });
    setPeriodModalOpen(true);
  };

  const handleSavePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodForm.time.trim() || !periodForm.subject.trim()) {
      showToast('error', 'Please enter time range and subject name.');
      return;
    }

    const newDays = [...classDays];
    let dayObj = newDays.find(d => d.day === editingDayName);
    if (!dayObj) {
      dayObj = { day: editingDayName, periods: [] };
      newDays.push(dayObj);
    }

    const periodData: ClassPeriod = {
      id: editingPeriodIndex !== null && dayObj.periods[editingPeriodIndex]?.id
        ? dayObj.periods[editingPeriodIndex].id
        : 'p_' + Date.now(),
      time: periodForm.time.trim(),
      subject: periodForm.subject.trim(),
      teacherName: periodForm.isBreak ? undefined : periodForm.teacherName.trim(),
      venue: periodForm.venue.trim(),
      isBreak: periodForm.isBreak
    };

    if (editingPeriodIndex !== null) {
      dayObj.periods[editingPeriodIndex] = periodData;
    } else {
      dayObj.periods.push(periodData);
    }

    setClassDays(newDays);
    setPeriodModalOpen(false);
    showToast('success', `Period updated for ${editingDayName}. Click 'Save Class Timetable' to apply.`);
  };

  const handleDeletePeriod = (dayName: string, periodIdx: number) => {
    const newDays = classDays.map(d => {
      if (d.day === dayName) {
        return {
          ...d,
          periods: d.periods.filter((_, i) => i !== periodIdx)
        };
      }
      return d;
    });
    setClassDays(newDays);
    showToast('success', 'Period removed from draft.');
  };

  const handleSaveClassTimetableToStore = () => {
    if (!school) return;
    const payload = {
      id: existingClassTT?.id,
      schoolId: school.id,
      classId: selectedClassId,
      className: activeClass?.name || 'Class',
      academicSession: school.academicSession,
      academicTerm: school.academicTerm,
      days: classDays
    };

    actions.saveClassTimetable(payload);
    setIsEditingClassTT(false);
    showToast('success', `Class timetable saved successfully for ${activeClass?.name}!`);
  };

  const handleSeedClassTimetableTemplate = () => {
    const templateDays: TimetableDay[] = [
      {
        day: 'Monday',
        periods: [
          { id: 's1', time: '08:00 AM - 08:30 AM', subject: 'Assembly & Registration', isBreak: true },
          { id: 's2', time: '08:30 AM - 09:15 AM', subject: 'Mathematics', teacherName: teacherUsers[0]?.name || 'Mr. Okon', venue: `${activeClass?.name} Room` },
          { id: 's3', time: '09:15 AM - 10:00 AM', subject: 'English Language', teacherName: teacherUsers[1]?.name || 'Mrs. Jenkins', venue: `${activeClass?.name} Room` },
          { id: 's4', time: '10:00 AM - 10:30 AM', subject: 'Morning Snack Break', isBreak: true },
          { id: 's5', time: '10:30 AM - 11:15 AM', subject: 'Basic Science', teacherName: teacherUsers[2]?.name || 'Mr. Nwosu', venue: 'Science Lab' },
          { id: 's6', time: '11:15 AM - 12:00 PM', subject: 'Civic Education', teacherName: teacherUsers[1]?.name || 'Mrs. Jenkins', venue: `${activeClass?.name} Room` }
        ]
      },
      {
        day: 'Tuesday',
        periods: [
          { id: 's7', time: '08:00 AM - 08:30 AM', subject: 'Assembly & Devotion', isBreak: true },
          { id: 's8', time: '08:30 AM - 09:15 AM', subject: 'Physics / Science Lab', teacherName: teacherUsers[0]?.name || 'Mr. Okon', venue: 'Science Lab' },
          { id: 's9', time: '09:15 AM - 10:00 AM', subject: 'Computer Studies', teacherName: teacherUsers[2]?.name || 'Mr. Nwosu', venue: 'ICT Suite' },
          { id: 's10', time: '10:00 AM - 10:30 AM', subject: 'Snack Break', isBreak: true },
          { id: 's11', time: '10:30 AM - 11:15 AM', subject: 'Agricultural Science', teacherName: teacherUsers[2]?.name || 'Mr. Nwosu', venue: `${activeClass?.name} Room` },
          { id: 's12', time: '11:15 AM - 12:00 PM', subject: 'Social Studies', teacherName: teacherUsers[1]?.name || 'Mrs. Jenkins', venue: `${activeClass?.name} Room` }
        ]
      },
      {
        day: 'Wednesday',
        periods: [
          { id: 's13', time: '08:00 AM - 08:30 AM', subject: 'Assembly & Roll Call', isBreak: true },
          { id: 's14', time: '08:30 AM - 09:15 AM', subject: 'English Language', teacherName: teacherUsers[1]?.name || 'Mrs. Jenkins', venue: `${activeClass?.name} Room` },
          { id: 's15', time: '09:15 AM - 10:00 AM', subject: 'Mathematics', teacherName: teacherUsers[0]?.name || 'Mr. Okon', venue: `${activeClass?.name} Room` },
          { id: 's16', time: '10:00 AM - 10:30 AM', subject: 'Snack Break', isBreak: true },
          { id: 's17', time: '10:30 AM - 11:15 AM', subject: 'Chemistry / Nature Study', teacherName: 'Dr. Vance', venue: 'Science Lab' },
          { id: 's18', time: '11:15 AM - 12:00 PM', subject: 'Economics / Business', teacherName: teacherUsers[1]?.name || 'Mrs. Jenkins', venue: `${activeClass?.name} Room` }
        ]
      },
      {
        day: 'Thursday',
        periods: [
          { id: 's19', time: '08:00 AM - 08:30 AM', subject: 'Assembly & Devotion', isBreak: true },
          { id: 's20', time: '08:30 AM - 09:15 AM', subject: 'Physics', teacherName: teacherUsers[0]?.name || 'Mr. Okon', venue: `${activeClass?.name} Room` },
          { id: 's21', time: '09:15 AM - 10:00 AM', subject: 'Mathematics', teacherName: teacherUsers[0]?.name || 'Mr. Okon', venue: `${activeClass?.name} Room` },
          { id: 's22', time: '10:00 AM - 10:30 AM', subject: 'Snack Break', isBreak: true },
          { id: 's23', time: '10:30 AM - 11:15 AM', subject: 'Biology', teacherName: teacherUsers[1]?.name || 'Mrs. Jenkins', venue: 'Biology Lab' },
          { id: 's24', time: '11:15 AM - 12:00 PM', subject: 'Sports & Health Ed', teacherName: teacherUsers[2]?.name || 'Mr. Nwosu', venue: 'Sports Pitch' }
        ]
      },
      {
        day: 'Friday',
        periods: [
          { id: 's25', time: '08:00 AM - 08:30 AM', subject: 'Assembly & Briefing', isBreak: true },
          { id: 's26', time: '08:30 AM - 09:15 AM', subject: 'Civic Education', teacherName: teacherUsers[1]?.name || 'Mrs. Jenkins', venue: `${activeClass?.name} Room` },
          { id: 's27', time: '09:15 AM - 10:00 AM', subject: 'Creative Arts & Music', teacherName: teacherUsers[2]?.name || 'Mr. Nwosu', venue: 'Arts Studio' },
          { id: 's28', time: '10:00 AM - 10:30 AM', subject: 'Snack Break', isBreak: true },
          { id: 's29', time: '10:30 AM - 11:15 AM', subject: 'Weekly Assessment', teacherName: 'All Teachers', venue: `${activeClass?.name} Room` },
          { id: 's30', time: '11:15 AM - 12:00 PM', subject: 'Clubs & Extra-Curricular', teacherName: 'School Admin', venue: 'Auditorium' }
        ]
      }
    ];

    setClassDays(templateDays);
    showToast('success', 'Loaded standard 5-day class schedule template. Remember to click Save.');
  };

  // --- EXAM TIMETABLE HANDLERS ---
  const handleOpenAddExamEntry = () => {
    setEditingExamId(null);
    const defaultDate = new Date().toISOString().split('T')[0];
    setExamForm({
      date: defaultDate,
      day: getDayOfWeekName(defaultDate),
      timeSlot: '09:00 AM - 11:30 AM',
      subject: schoolSubjects[0] || 'Mathematics',
      hallOrVenue: 'Main Multipurpose Hall',
      invigilators: teacherUsers.map(t => t.name).slice(0, 2).join(', '),
      instructions: 'Candidates must bring complete stationery set.'
    });
    setExamModalOpen(true);
  };

  const handleOpenEditExamEntry = (entry: ExamTimetableEntry) => {
    setEditingExamId(entry.id);
    setExamForm({
      date: entry.date,
      day: entry.day || getDayOfWeekName(entry.date),
      timeSlot: entry.timeSlot,
      subject: entry.subject,
      hallOrVenue: entry.hallOrVenue,
      invigilators: entry.invigilators || '',
      instructions: entry.instructions || ''
    });
    setExamModalOpen(true);
  };

  const getDayOfWeekName = (dateStr: string) => {
    if (!dateStr) return 'Monday';
    const d = new Date(dateStr);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[d.getDay()] || 'Monday';
  };

  const handleSaveExamEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.date || !examForm.subject.trim() || !examForm.timeSlot.trim()) {
      showToast('error', 'Please fill in date, time slot, and subject.');
      return;
    }

    const computedDay = examForm.day || getDayOfWeekName(examForm.date);

    const entryData: ExamTimetableEntry = {
      id: editingExamId || 'ee_' + Date.now(),
      date: examForm.date,
      day: computedDay,
      timeSlot: examForm.timeSlot.trim(),
      subject: examForm.subject.trim(),
      hallOrVenue: examForm.hallOrVenue.trim() || 'Exam Hall',
      invigilators: examForm.invigilators.trim(),
      instructions: examForm.instructions.trim()
    };

    let updatedList: ExamTimetableEntry[];
    if (editingExamId) {
      updatedList = examEntries.map(e => e.id === editingExamId ? entryData : e);
    } else {
      updatedList = [...examEntries, entryData];
    }

    // Sort entries by date and time
    updatedList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setExamEntries(updatedList);
    setExamModalOpen(false);
    showToast('success', `Exam entry for ${entryData.subject} updated. Click 'Save Exam Timetable' to finalize.`);
  };

  const handleDeleteExamEntry = (entryId: string) => {
    setExamEntries(prev => prev.filter(e => e.id !== entryId));
    showToast('success', 'Exam paper entry removed from draft.');
  };

  const handleSaveExamTimetableToStore = () => {
    if (!school) return;
    const payload = {
      id: existingExamTT?.id,
      schoolId: school.id,
      classId: selectedClassId,
      className: activeClass?.name || 'Class',
      examTitle: examTitle.trim() || 'Final Examinations',
      academicSession: school.academicSession,
      academicTerm: school.academicTerm,
      entries: examEntries
    };

    actions.saveExamTimetable(payload);
    setIsEditingExamTT(false);
    showToast('success', `Exam timetable saved for ${activeClass?.name}!`);
  };

  const handleSeedExamTimetableTemplate = () => {
    const today = new Date();
    const formatDate = (offsetDays: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split('T')[0];
    };

    const d1 = formatDate(14);
    const d2 = formatDate(15);
    const d3 = formatDate(16);

    const templateEntries: ExamTimetableEntry[] = [
      {
        id: 'ee_t1',
        date: d1,
        day: getDayOfWeekName(d1),
        timeSlot: '09:00 AM - 11:30 AM',
        subject: 'Mathematics (Paper I & II)',
        hallOrVenue: 'Main Assembly Hall',
        invigilators: teacherUsers.map(t => t.name).join(', ') || 'Mr. Okon, Mrs. Jenkins',
        instructions: 'Mathematical set and HB pencils mandatory.'
      },
      {
        id: 'ee_t2',
        date: d1,
        day: getDayOfWeekName(d1),
        timeSlot: '01:00 PM - 02:30 PM',
        subject: 'Civic Education',
        hallOrVenue: 'Main Assembly Hall',
        invigilators: 'Mr. Nwosu',
        instructions: 'Answer all 50 multiple choice questions.'
      },
      {
        id: 'ee_t3',
        date: d2,
        day: getDayOfWeekName(d2),
        timeSlot: '09:00 AM - 11:30 AM',
        subject: 'English Language',
        hallOrVenue: 'Main Assembly Hall',
        invigilators: 'Mrs. Jenkins',
        instructions: 'Use blue or black fountain pen.'
      },
      {
        id: 'ee_t4',
        date: d3,
        day: getDayOfWeekName(d3),
        timeSlot: '09:00 AM - 11:00 AM',
        subject: 'Basic Science & Technology / Physics',
        hallOrVenue: 'Science Laboratory',
        invigilators: 'Mr. Okon, Dr. Vance',
        instructions: 'Scientific calculators allowed.'
      }
    ];

    setExamTitle(`${school?.academicTerm || 'First Term'} Final Examinations`);
    setExamEntries(templateEntries);
    showToast('success', 'Loaded sample examination timetable. Click Save to publish.');
  };

  // Print view trigger
  const handlePrint = () => {
    window.print();
  };

  // Filtered days for display
  const displayDays = useMemo(() => {
    if (selectedDayFilter === 'ALL') return classDays;
    return classDays.filter(d => d.day === selectedDayFilter);
  }, [classDays, selectedDayFilter]);

  // Unique time slots for Matrix Table View
  const matrixTimeSlots = useMemo(() => {
    const defaultSlots = [
      '08:00 AM - 08:30 AM',
      '08:30 AM - 09:15 AM',
      '09:15 AM - 10:00 AM',
      '10:00 AM - 10:30 AM',
      '10:30 AM - 11:15 AM',
      '11:15 AM - 12:00 PM'
    ];

    const foundSlots = new Set<string>();
    classDays.forEach(d => {
      (d.periods || []).forEach(p => {
        if (p.time) foundSlots.add(p.time.trim());
      });
    });

    if (foundSlots.size === 0) return defaultSlots;
    const arraySlots = Array.from(foundSlots);
    return arraySlots.sort((a, b) => a.localeCompare(b));
  }, [classDays]);

  // Active days list for Matrix Table columns (Mon to Fri/Sat)
  const matrixDays = useMemo(() => {
    if (selectedDayFilter !== 'ALL') return [selectedDayFilter];
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  }, [selectedDayFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Toast Notification */}
      {statusMsg && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm font-semibold shadow-md animate-in fade-in duration-200 ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
            : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {statusMsg.type === 'success' ? <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
            <span>{statusMsg.text}</span>
          </div>
        </div>
      )}

      {/* Main Header & Role Context Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-2">
            <TableIcon className="h-3.5 w-3.5 text-indigo-400" />
            <span>Academic Schedule Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Class & Examination Timetables
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            {isAdmin && 'Manage and publish structured weekly lesson schedules and official examination tables.'}
            {isTeacher && 'View official weekly class timetables and examination schedules in clear tabular format.'}
            {isParent && 'Track your child’s weekly class schedule and upcoming term examination dates.'}
          </p>
        </div>

        {/* Role Permission Badge & Class Picker */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          
          {/* Permission Status Pill */}
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            isAdmin
              ? 'bg-purple-950/80 border-purple-700 text-purple-200'
              : 'bg-slate-800/90 border-slate-700 text-slate-300'
          }`}>
            <ShieldAlert className={`w-4 h-4 ${isAdmin ? 'text-purple-400' : 'text-slate-400'}`} />
            <span>{isAdmin ? 'Admin Mode (Editable)' : 'Read-Only View Mode'}</span>
          </div>

          {/* Class Picker */}
          <div className="relative min-w-[180px]">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              {isStudent ? 'Enrolled Class:' : 'Select Class:'}
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={isStudent && effectiveClasses.length <= 1}
              className="w-full bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-80"
            >
              {effectiveClasses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all cursor-pointer self-end sm:self-auto"
            title="Print schedule"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Class Context Banner & Mode Switcher Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {activeClass?.name} Timetable Table
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 font-semibold text-slate-600 dark:text-slate-300">
                {activeClass?.category}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Academic Session: <span className="font-semibold text-slate-700 dark:text-slate-300">{school?.academicSession || '2025/2026'}</span> • {school?.academicTerm || 'First Term'}
            </p>
          </div>
        </div>

        {/* Timetable Type Tabs: CLASS vs EXAM */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('CLASS')}
            className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'CLASS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>1. Class Timetable Table</span>
          </button>

          <button
            onClick={() => setActiveTab('EXAM')}
            className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'EXAM'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Exam Schedule Table</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CLASS TIMETABLE (TABULAR FORM)                                     */}
      {/* ========================================================================= */}
      {activeTab === 'CLASS' && (
        <div className="space-y-6">
          
          {/* Controls Bar for Class Timetable */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            
            {/* View Mode & Day Filter Pills */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Tabular Layout Switcher */}
              <div className="flex items-center p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setClassTableViewMode('MATRIX')}
                  className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                    classTableViewMode === 'MATRIX'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                  title="Weekly Matrix Table (Days as Columns)"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Weekly Matrix Table</span>
                </button>
                <button
                  onClick={() => setClassTableViewMode('LIST_TABLE')}
                  className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                    classTableViewMode === 'LIST_TABLE'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                  title="Detailed Row-by-Row Table"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Detailed Day Table</span>
                </button>
              </div>

              {/* Day Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedDayFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap transition-all ${
                    selectedDayFilter === 'ALL'
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  All Days
                </button>
                {DAYS_OF_WEEK.slice(0, 5).map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDayFilter(day)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap transition-all ${
                      selectedDayFilter === day
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Action Bar */}
            {isAdmin && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {isEditingClassTT ? (
                  <>
                    <button
                      onClick={handleSeedClassTimetableTemplate}
                      className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Prefill 5-day template"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Seed Template</span>
                    </button>

                    <button
                      onClick={handleSaveClassTimetableToStore}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Class Timetable</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditingClassTT(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Class Timetable</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Edit Mode Notice for Admin */}
          {isAdmin && isEditingClassTT && (
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/80 text-purple-900 dark:text-purple-200 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>You are in <strong>Admin Edit Mode</strong> for {activeClass?.name}. Click any cell or "+ Add Period" to customize periods directly.</span>
              </div>
              <button
                onClick={() => setIsEditingClassTT(false)}
                className="text-purple-700 dark:text-purple-300 hover:underline font-bold text-[11px]"
              >
                Done Editing
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TABULAR FORM OPTION A: WEEKLY MATRIX TABLE (DAYS AS COLUMNS)              */}
          {/* ========================================================================= */}
          {classTableViewMode === 'MATRIX' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  {/* Table Header */}
                  <thead>
                    <tr className="bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider">
                      <th className="py-3.5 px-4 border-b border-slate-800 w-44">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Time Slot</span>
                        </div>
                      </th>
                      {matrixDays.map(dayName => (
                        <th key={dayName} className="py-3.5 px-4 border-b border-r border-slate-800 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span>{dayName}</span>
                            {isAdmin && isEditingClassTT && (
                              <button
                                onClick={() => handleOpenAddPeriod(dayName as any)}
                                className="p-1 hover:bg-slate-800 rounded text-indigo-400"
                                title={`Add period to ${dayName}`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700/80 text-xs">
                    {matrixTimeSlots.map((timeSlot, sIdx) => (
                      <tr key={timeSlot} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                        
                        {/* Time Column */}
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 bg-slate-50/80 dark:bg-slate-900/40 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span>{timeSlot}</span>
                          </div>
                        </td>

                        {/* Day Cells */}
                        {matrixDays.map(dayName => {
                          const dayData = classDays.find(d => d.day === dayName);
                          const periodIdx = (dayData?.periods || []).findIndex(p => p.time?.trim() === timeSlot.trim());
                          const period = periodIdx !== -1 ? dayData?.periods[periodIdx] : null;

                          return (
                            <td
                              key={dayName}
                              className={`py-3 px-3 border-r border-slate-200 dark:border-slate-700 align-top transition-colors ${
                                period?.isBreak
                                  ? 'bg-amber-50/70 dark:bg-amber-950/30'
                                  : period
                                  ? 'bg-white dark:bg-slate-800'
                                  : 'bg-slate-50/30 dark:bg-slate-900/20'
                              }`}
                            >
                              {period ? (
                                <div className="group relative space-y-1">
                                  {/* Period Badge / Subject */}
                                  {period.isBreak ? (
                                    <div className="p-2 rounded-lg bg-amber-100/80 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 font-bold border border-amber-300 dark:border-amber-700/60 text-center">
                                      <div className="flex items-center justify-center gap-1 text-[11px]">
                                        <Coffee className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                        <span>{period.subject}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                                      <p className="font-extrabold text-slate-900 dark:text-white text-xs">
                                        {period.subject}
                                      </p>
                                      {period.teacherName && (
                                        <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                                          <User className="w-3 h-3 text-indigo-500 shrink-0" />
                                          <span className="truncate">{period.teacherName}</span>
                                        </div>
                                      )}
                                      {period.venue && (
                                        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                          <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                                          <span className="truncate">{period.venue}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Admin Actions */}
                                  {isAdmin && isEditingClassTT && (
                                    <div className="flex items-center justify-end gap-1 pt-1">
                                      <button
                                        onClick={() => handleOpenEditPeriod(dayName as any, periodIdx, period)}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-indigo-600 dark:text-indigo-400"
                                        title="Edit slot"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeletePeriod(dayName, periodIdx)}
                                        className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950 rounded text-rose-600"
                                        title="Delete slot"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="h-full min-h-[50px] flex items-center justify-center">
                                  {isAdmin && isEditingClassTT ? (
                                    <button
                                      onClick={() => handleOpenAddPeriod(dayName as any, timeSlot)}
                                      className="text-[11px] font-semibold text-slate-400 hover:text-indigo-600 flex items-center gap-1 py-2 px-2 rounded border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 w-full justify-center"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>Assign</span>
                                    </button>
                                  ) : (
                                    <span className="text-[11px] text-slate-300 dark:text-slate-600 font-serif font-semibold">—</span>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TABULAR FORM OPTION B: ROW-BY-ROW DETAILED DAY TABLE                      */}
          {/* ========================================================================= */}
          {classTableViewMode === 'LIST_TABLE' && (
            <div className="space-y-6">
              {displayDays.map(dayObj => {
                const periods = dayObj.periods || [];

                return (
                  <div
                    key={dayObj.day}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-xs"
                  >
                    {/* Day Header */}
                    <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                        <h3 className="text-sm font-extrabold tracking-wide uppercase">{dayObj.day} Schedule</h3>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                          {periods.length} Period{periods.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {isAdmin && isEditingClassTT && (
                        <button
                          onClick={() => handleOpenAddPeriod(dayObj.day)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Period Row</span>
                        </button>
                      )}
                    </div>

                    {/* Day Table */}
                    <div className="overflow-x-auto">
                      {periods.length === 0 ? (
                        <div className="p-8 text-center border-b border-slate-200 dark:border-slate-700">
                          <Coffee className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            No lesson periods assigned for {dayObj.day}.
                          </p>
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse min-w-[650px] text-xs">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                              <th className="py-2.5 px-4 border-r border-slate-200 dark:border-slate-800 w-12 text-center">#</th>
                              <th className="py-2.5 px-4 border-r border-slate-200 dark:border-slate-800 w-44">Time Slot</th>
                              <th className="py-2.5 px-4 border-r border-slate-200 dark:border-slate-800">Subject / Lesson</th>
                              <th className="py-2.5 px-4 border-r border-slate-200 dark:border-slate-800">Assigned Teacher</th>
                              <th className="py-2.5 px-4 border-r border-slate-200 dark:border-slate-800">Classroom / Venue</th>
                              {isAdmin && isEditingClassTT && <th className="py-2.5 px-4 text-center w-24">Actions</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {periods.map((period, pIdx) => (
                              <tr
                                key={period.id || pIdx}
                                className={`hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors ${
                                  period.isBreak ? 'bg-amber-50/60 dark:bg-amber-950/20' : ''
                                }`}
                              >
                                <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 text-center font-bold text-slate-500">
                                  {pIdx + 1}
                                </td>

                                <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                    <span>{period.time}</span>
                                  </div>
                                </td>

                                <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 font-extrabold text-slate-900 dark:text-white">
                                  {period.isBreak ? (
                                    <span className="inline-flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold">
                                      <Coffee className="w-3.5 h-3.5 text-amber-600" />
                                      {period.subject} (Recess)
                                    </span>
                                  ) : (
                                    period.subject
                                  )}
                                </td>

                                <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                  {period.teacherName ? (
                                    <div className="flex items-center gap-1.5 font-medium">
                                      <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                      <span>{period.teacherName}</span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic">—</span>
                                  )}
                                </td>

                                <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                                  {period.venue ? (
                                    <div className="flex items-center gap-1.5">
                                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                      <span>{period.venue}</span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic">—</span>
                                  )}
                                </td>

                                {isAdmin && isEditingClassTT && (
                                  <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        onClick={() => handleOpenEditPeriod(dayObj.day, pIdx, period)}
                                        className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded"
                                        title="Edit Period"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeletePeriod(dayObj.day, pIdx)}
                                        className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded"
                                        title="Delete Period"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EXAM TIMETABLE (OFFICIAL TABULAR SCHEDULE)                         */}
      {/* ========================================================================= */}
      {activeTab === 'EXAM' && (
        <div className="space-y-6">
          
          {/* Controls Bar for Exam Timetable */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Exam Title:</p>
                {isAdmin && isEditingExamTT ? (
                  <input
                    type="text"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder="e.g. First Term Final Examinations 2025/2026"
                    className="text-sm font-extrabold px-3 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                ) : (
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {examTitle || 'First Term Final Examinations'}
                  </h3>
                )}
              </div>
            </div>

            {/* Admin Action Bar for Exams */}
            {isAdmin && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {isEditingExamTT ? (
                  <>
                    <button
                      onClick={handleSeedExamTimetableTemplate}
                      className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Seed Sample Exam</span>
                    </button>

                    <button
                      onClick={handleOpenAddExamEntry}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Exam Paper Row</span>
                    </button>

                    <button
                      onClick={handleSaveExamTimetableToStore}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Exam Timetable</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditingExamTT(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Exam Timetable</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Official Examination Schedule Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {examEntries.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No Examination Schedule Published Yet</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    {isAdmin
                      ? 'Click Edit Exam Timetable to insert examination papers, dates, venues, and invigilator details.'
                      : 'The examination timetable for this class has not been released by the administration yet.'}
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsEditingExamTT(true);
                        handleSeedExamTimetableTemplate();
                      }}
                      className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Examination Timetable Table
                    </button>
                  )}
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[850px] text-xs">
                  {/* Table Header */}
                  <thead>
                    <tr className="bg-slate-900 text-white font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-800">
                      <th className="py-3.5 px-4 border-r border-slate-800 text-center w-12">S/N</th>
                      <th className="py-3.5 px-4 border-r border-slate-800 w-36">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Date & Day</span>
                        </div>
                      </th>
                      <th className="py-3.5 px-4 border-r border-slate-800 w-40">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Time / Duration</span>
                        </div>
                      </th>
                      <th className="py-3.5 px-4 border-r border-slate-800">Subject Paper Title</th>
                      <th className="py-3.5 px-4 border-r border-slate-800">Venue / Hall</th>
                      <th className="py-3.5 px-4 border-r border-slate-800">Invigilator(s)</th>
                      <th className="py-3.5 px-4 border-r border-slate-800">Candidate Instructions</th>
                      {isAdmin && isEditingExamTT && <th className="py-3.5 px-4 text-center w-24">Actions</th>}
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {examEntries.map((entry, idx) => (
                      <tr key={entry.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                        
                        {/* Serial Number */}
                        <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>

                        {/* Date & Day */}
                        <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                          <div>
                            <span className="text-indigo-600 dark:text-indigo-400">{entry.date}</span>
                            <span className="block text-[11px] text-slate-500 font-medium">({entry.day})</span>
                          </div>
                        </td>

                        {/* Time Slot */}
                        <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap font-bold text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>{entry.timeSlot}</span>
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 font-extrabold text-slate-900 dark:text-white">
                          {entry.subject}
                        </td>

                        {/* Hall / Venue */}
                        <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="font-semibold">{entry.hallOrVenue}</span>
                          </div>
                        </td>

                        {/* Invigilators */}
                        <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                          {entry.invigilators ? (
                            <div className="flex items-center gap-1.5 font-medium">
                              <User className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                              <span>{entry.invigilators}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">—</span>
                          )}
                        </td>

                        {/* Instructions */}
                        <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
                          {entry.instructions ? (
                            <div className="flex items-start gap-1">
                              <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span className="italic">{entry.instructions}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        {isAdmin && isEditingExamTT && (
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEditExamEntry(entry)}
                                className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded"
                                title="Edit Paper"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteExamEntry(entry.id)}
                                className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded"
                                title="Delete Paper"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT CLASS PERIOD                                          */}
      {/* ========================================================================= */}
      {periodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{editingPeriodIndex !== null ? 'Edit Period Slot' : `Add Period (${editingDayName})`}</span>
              </h3>
              <button
                onClick={() => setPeriodModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePeriod} className="space-y-4">
              
              {/* Day selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Day of Week</label>
                <select
                  value={editingDayName}
                  onChange={(e) => setEditingDayName(e.target.value as any)}
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {DAYS_OF_WEEK.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Time Slot */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Time Slot Range</label>
                <input
                  type="text"
                  value={periodForm.time}
                  onChange={(e) => setPeriodForm({ ...periodForm, time: e.target.value })}
                  placeholder="e.g. 08:00 AM - 08:45 AM"
                  required
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Break toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isBreak"
                  checked={periodForm.isBreak}
                  onChange={(e) => setPeriodForm({ ...periodForm, isBreak: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isBreak" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  This slot is a Break / Recess / Assembly
                </label>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {periodForm.isBreak ? 'Break Title' : 'Subject Name'}
                </label>
                {periodForm.isBreak ? (
                  <input
                    type="text"
                    value={periodForm.subject}
                    onChange={(e) => setPeriodForm({ ...periodForm, subject: e.target.value })}
                    placeholder="e.g. Morning Snack Break"
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                ) : (
                  <div className="space-y-1.5">
                    <select
                      value={periodForm.subject}
                      onChange={(e) => setPeriodForm({ ...periodForm, subject: e.target.value })}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      {schoolSubjects.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                      <option value="Custom">Custom Subject...</option>
                    </select>

                    {(!schoolSubjects.includes(periodForm.subject) || periodForm.subject === 'Custom') && (
                      <input
                        type="text"
                        value={periodForm.subject === 'Custom' ? '' : periodForm.subject}
                        onChange={(e) => setPeriodForm({ ...periodForm, subject: e.target.value })}
                        placeholder="Enter custom subject name"
                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    )}
                  </div>
                )}
              </div>

              {!periodForm.isBreak && (
                <>
                  {/* Teacher Assign */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Teacher</label>
                    <select
                      value={periodForm.teacherName}
                      onChange={(e) => setPeriodForm({ ...periodForm, teacherName: e.target.value })}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Unassigned / Subject Teacher</option>
                      {teacherUsers.map(t => (
                        <option key={t.id} value={t.name}>{t.name} ({t.assignedSubjects.join(', ') || 'Teacher'})</option>
                      ))}
                    </select>
                  </div>

                  {/* Venue */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Classroom / Venue</label>
                    <input
                      type="text"
                      value={periodForm.venue}
                      onChange={(e) => setPeriodForm({ ...periodForm, venue: e.target.value })}
                      placeholder="e.g. SS 3 Classroom or Physics Lab"
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPeriodModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
                >
                  Confirm Period
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT EXAM ENTRY                                            */}
      {/* ========================================================================= */}
      {examModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{editingExamId ? 'Edit Exam Paper Session' : 'Add Examination Paper'}</span>
              </h3>
              <button
                onClick={() => setExamModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExamEntry} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                {/* Exam Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Exam Date</label>
                  <input
                    type="date"
                    value={examForm.date}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setExamForm({ ...examForm, date: newDate, day: getDayOfWeekName(newDate) });
                    }}
                    required
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Day of Week */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Day</label>
                  <input
                    type="text"
                    value={examForm.day}
                    onChange={(e) => setExamForm({ ...examForm, day: e.target.value })}
                    readOnly
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  />
                </div>
              </div>

              {/* Time Slot */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Time Range</label>
                <input
                  type="text"
                  value={examForm.timeSlot}
                  onChange={(e) => setExamForm({ ...examForm, timeSlot: e.target.value })}
                  placeholder="e.g. 09:00 AM - 11:30 AM"
                  required
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject & Paper</label>
                <select
                  value={examForm.subject}
                  onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white mb-1"
                >
                  {schoolSubjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                  <option value="Custom">Custom Exam Name...</option>
                </select>

                {(!schoolSubjects.includes(examForm.subject) || examForm.subject === 'Custom') && (
                  <input
                    type="text"
                    value={examForm.subject === 'Custom' ? '' : examForm.subject}
                    onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                    placeholder="e.g. Mathematics Paper I & II"
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                )}
              </div>

              {/* Venue */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Examination Hall / Venue</label>
                <input
                  type="text"
                  value={examForm.hallOrVenue}
                  onChange={(e) => setExamForm({ ...examForm, hallOrVenue: e.target.value })}
                  placeholder="e.g. Multipurpose Hall or Science Lab"
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Invigilators */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Invigilator(s)</label>
                <input
                  type="text"
                  value={examForm.invigilators}
                  onChange={(e) => setExamForm({ ...examForm, invigilators: e.target.value })}
                  placeholder="e.g. Mr. Okon, Mrs. Jenkins"
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Candidate Instructions</label>
                <textarea
                  value={examForm.instructions}
                  onChange={(e) => setExamForm({ ...examForm, instructions: e.target.value })}
                  placeholder="e.g. Bring HB pencils and mathematical sets."
                  rows={2}
                  className="w-full text-xs font-semibold p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setExamModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
                >
                  Confirm Exam Paper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
