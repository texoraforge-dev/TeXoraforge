/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import {
  School,
  User,
  SchoolClass,
  Student,
  Submission,
  AttendanceRecord,
  NotificationItem,
  SubmissionStatus,
  ScoreSheet,
  HomeworkItem,
  StudentReportCard,
  SubjectReportItem,
  ClassTimetable,
  ExamTimetable,
  AuditLogEntry,
  AdminPermission,
  ChatRoom,
  ChatMessage,
  PublicChatMessage,
  GeneratedExamSet,
  ExamQuestion,
  CurriculumSubject,
  CBTExam,
  CBTAttempt,
  StudentRiskProfile,
  RemedialPackage,
  SchoolDocument,
  FinancialRecord,
  SchoolEvent,
  TransportRoute,
  TransportStop,
  AttendanceSettings,
  StaffAttendanceRecord,
  SalaryProfile,
  DeductionRule,
  PayrollRecord,
  StudentAccountCredentials,
  ClassChatMessage,
  ChatModerationLog,
  PaymentTransaction,
  SchoolBankAccountDetails
} from './types';
import {
  INITIAL_SCHOOLS,
  INITIAL_CLASSES,
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_ATTENDANCE,
  INITIAL_NOTIFICATIONS,
  INITIAL_SCORE_SHEETS,
  INITIAL_HOMEWORK,
  INITIAL_TIMETABLES,
  INITIAL_CLASS_TIMETABLES,
  INITIAL_EXAM_TIMETABLES,
  INITIAL_AUDIT_LOGS,
  INITIAL_CHAT_ROOMS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_PUBLIC_CHAT_MESSAGES,
  INITIAL_EXAM_SETS,
  DEFAULT_SCHOOL_SUBJECTS,
  INITIAL_CURRICULA,
  INITIAL_CBT_EXAMS,
  INITIAL_CBT_ATTEMPTS,
  INITIAL_STUDENT_RISK_PROFILES,
  INITIAL_REMEDIAL_PACKAGES,
  INITIAL_DOCUMENTS,
  INITIAL_FINANCIALS,
  INITIAL_EVENTS,
  INITIAL_TRANSPORT_ROUTES,
  INITIAL_ATTENDANCE_SETTINGS,
  INITIAL_STAFF_ATTENDANCE,
  INITIAL_SALARY_PROFILES,
  INITIAL_DEDUCTION_RULES,
  INITIAL_PAYROLL_RECORDS,
  INITIAL_STUDENT_CREDENTIALS,
  INITIAL_CLASS_CHAT_MESSAGES,
  INITIAL_CHAT_MODERATION_LOGS,
  INITIAL_PAYMENT_TRANSACTIONS,
  SUBJECT_OPTIONS_BY_TIER
} from './mockData';
import { SupabaseService } from './lib/supabaseService';
import { DEFAULT_ROLE_PERMISSIONS } from './lib/permissions';
import { isSupabaseConfigured, supabase } from './lib/supabase';

const STORAGE_KEYS = {
  SCHOOLS: 'texora_schools_v1',
  CLASSES: 'texora_classes_v1',
  USERS: 'texora_users_v1',
  STUDENTS: 'texora_students_v1',
  SUBMISSIONS: 'texora_submissions_v1',
  ATTENDANCE: 'texora_attendance_v1',
  NOTIFICATIONS: 'texora_notifications_v1',
  SCORE_SHEETS: 'texora_scoresheets_v1',
  HOMEWORK: 'texora_homework_v1',
  CLASS_TIMETABLES: 'texora_class_timetables_v2',
  EXAM_TIMETABLES: 'texora_exam_timetables_v2',
  AUDIT_LOGS: 'texora_audit_logs_v1',
  CHAT_ROOMS: 'texora_chat_rooms_v1',
  CHAT_MESSAGES: 'texora_chat_messages_v1',
  PUBLIC_CHAT_MESSAGES: 'texora_public_chat_messages_v1',
  EXAM_SETS: 'texora_exam_sets_v1',
  CURRICULA: 'texora_curricula_v1',
  CBT_EXAMS: 'texora_cbt_exams_v1',
  CBT_ATTEMPTS: 'texora_cbt_attempts_v1',
  STUDENT_RISK_PROFILES: 'texora_student_risk_v1',
  REMEDIAL_PACKAGES: 'texora_remedials_v1',
  SCHOOL_DOCUMENTS: 'texora_documents_v1',
  FINANCIAL_RECORDS: 'texora_financials_v1',
  SCHOOL_EVENTS: 'texora_events_v1',
  TRANSPORT_ROUTES: 'texora_transport_v1',
  ATTENDANCE_SETTINGS: 'texora_attendance_settings_v1',
  STAFF_ATTENDANCE: 'texora_staff_attendance_v1',
  SALARY_PROFILES: 'texora_salary_profiles_v1',
  DEDUCTION_RULES: 'texora_deduction_rules_v1',
  PAYROLL_RECORDS: 'texora_payroll_records_v1',
  STUDENT_CREDENTIALS: 'texora_student_credentials_v1',
  CLASS_CHAT_MESSAGES: 'texora_class_chat_messages_v1',
  CHAT_MODERATION_LOGS: 'texora_chat_moderation_logs_v1',
  PAYMENT_TRANSACTIONS: 'texora_payment_transactions_v1',
  CURRENT_USER_ID: 'texora_current_user_id_v1',
  CURRENT_SCHOOL_ID: 'texora_current_school_id_v1',
};

// Helper for local storage parsing with fallback
function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Failed to parse localStorage key "${key}"`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('texora_storage_change'));
  } catch (err) {
    console.error(`Failed to set localStorage key "${key}"`, err);
  }
}

export class AppStorage {
  // Initialization
  static initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.SCHOOLS)) {
      setStored(STORAGE_KEYS.SCHOOLS, INITIAL_SCHOOLS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
      setStored(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      setStored(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      setStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
      setStored(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      setStored(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      setStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCORE_SHEETS)) {
      setStored(STORAGE_KEYS.SCORE_SHEETS, INITIAL_SCORE_SHEETS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.HOMEWORK)) {
      setStored(STORAGE_KEYS.HOMEWORK, INITIAL_HOMEWORK);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLASS_TIMETABLES)) {
      setStored(STORAGE_KEYS.CLASS_TIMETABLES, INITIAL_CLASS_TIMETABLES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXAM_TIMETABLES)) {
      setStored(STORAGE_KEYS.EXAM_TIMETABLES, INITIAL_EXAM_TIMETABLES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      setStored(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHAT_ROOMS)) {
      setStored(STORAGE_KEYS.CHAT_ROOMS, INITIAL_CHAT_ROOMS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES)) {
      setStored(STORAGE_KEYS.CHAT_MESSAGES, INITIAL_CHAT_MESSAGES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRICULA)) {
      setStored(STORAGE_KEYS.CURRICULA, INITIAL_CURRICULA);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CBT_EXAMS)) {
      setStored(STORAGE_KEYS.CBT_EXAMS, INITIAL_CBT_EXAMS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CBT_ATTEMPTS)) {
      setStored(STORAGE_KEYS.CBT_ATTEMPTS, INITIAL_CBT_ATTEMPTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDENT_RISK_PROFILES)) {
      setStored(STORAGE_KEYS.STUDENT_RISK_PROFILES, INITIAL_STUDENT_RISK_PROFILES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REMEDIAL_PACKAGES)) {
      setStored(STORAGE_KEYS.REMEDIAL_PACKAGES, INITIAL_REMEDIAL_PACKAGES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCHOOL_DOCUMENTS)) {
      setStored(STORAGE_KEYS.SCHOOL_DOCUMENTS, INITIAL_DOCUMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FINANCIAL_RECORDS)) {
      setStored(STORAGE_KEYS.FINANCIAL_RECORDS, INITIAL_FINANCIALS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCHOOL_EVENTS)) {
      setStored(STORAGE_KEYS.SCHOOL_EVENTS, INITIAL_EVENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSPORT_ROUTES)) {
      setStored(STORAGE_KEYS.TRANSPORT_ROUTES, INITIAL_TRANSPORT_ROUTES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE_SETTINGS)) {
      setStored(STORAGE_KEYS.ATTENDANCE_SETTINGS, INITIAL_ATTENDANCE_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STAFF_ATTENDANCE)) {
      setStored(STORAGE_KEYS.STAFF_ATTENDANCE, INITIAL_STAFF_ATTENDANCE);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SALARY_PROFILES)) {
      setStored(STORAGE_KEYS.SALARY_PROFILES, INITIAL_SALARY_PROFILES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.DEDUCTION_RULES)) {
      setStored(STORAGE_KEYS.DEDUCTION_RULES, INITIAL_DEDUCTION_RULES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYROLL_RECORDS)) {
      setStored(STORAGE_KEYS.PAYROLL_RECORDS, INITIAL_PAYROLL_RECORDS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDENT_CREDENTIALS)) {
      setStored(STORAGE_KEYS.STUDENT_CREDENTIALS, INITIAL_STUDENT_CREDENTIALS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLASS_CHAT_MESSAGES)) {
      setStored(STORAGE_KEYS.CLASS_CHAT_MESSAGES, INITIAL_CLASS_CHAT_MESSAGES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHAT_MODERATION_LOGS)) {
      setStored(STORAGE_KEYS.CHAT_MODERATION_LOGS, INITIAL_CHAT_MODERATION_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_SCHOOL_ID)) {
      setStored(STORAGE_KEYS.CURRENT_SCHOOL_ID, 'school_apex');
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      setStored(STORAGE_KEYS.CURRENT_USER_ID, 'usr_proprietor1'); // Default to Proprietor
    }

    if (isSupabaseConfigured()) {
      SupabaseService.seedInitialData(
        INITIAL_SCHOOLS,
        INITIAL_USERS,
        INITIAL_CLASSES,
        INITIAL_STUDENTS,
        INITIAL_SUBMISSIONS,
        INITIAL_ATTENDANCE,
        INITIAL_NOTIFICATIONS
      ).catch(err => console.warn('Supabase seed error:', err));
    }
  }

  static resetToDemo() {
    localStorage.clear();
    this.initDefaults();
    window.dispatchEvent(new Event('texora_storage_change'));
  }

  // Getters
  static getSchools(): School[] {
    return getStored<School[]>(STORAGE_KEYS.SCHOOLS, INITIAL_SCHOOLS);
  }

  static getCurrentSchool(): School | null {
    const currentSchoolId = getStored<string>(STORAGE_KEYS.CURRENT_SCHOOL_ID, 'school_apex');
    const schools = this.getSchools();
    return schools.find(s => s.id === currentSchoolId) || schools[0] || null;
  }

  static setCurrentSchoolId(schoolId: string) {
    setStored(STORAGE_KEYS.CURRENT_SCHOOL_ID, schoolId);
  }

  static getSchoolSubjects(schoolId?: string): string[] {
    const schools = this.getSchools();
    const currentSchool = schoolId ? schools.find(s => s.id === schoolId) : this.getCurrentSchool();
    if (currentSchool && currentSchool.subjects && currentSchool.subjects.length > 0) {
      return currentSchool.subjects;
    }
    return DEFAULT_SCHOOL_SUBJECTS;
  }

  static updateSchoolSubjects(schoolId: string, subjects: string[]) {
    const schools = this.getSchools();
    const idx = schools.findIndex(s => s.id === schoolId);
    if (idx !== -1) {
      schools[idx] = {
        ...schools[idx],
        subjects
      };
      setStored(STORAGE_KEYS.SCHOOLS, schools);
      if (isSupabaseConfigured()) {
        SupabaseService.upsertSchool(schools[idx]).catch(console.error);
      }
    }
  }

  static addSchoolSubject(schoolId: string, subjectName: string) {
    const trimmed = subjectName.trim();
    if (!trimmed) return;
    const currentSubjects = this.getSchoolSubjects(schoolId);
    if (currentSubjects.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      return; // already exists
    }
    const updated = [...currentSubjects, trimmed];
    this.updateSchoolSubjects(schoolId, updated);
  }

  static removeSchoolSubject(schoolId: string, subjectName: string) {
    const currentSubjects = this.getSchoolSubjects(schoolId);
    const updated = currentSubjects.filter(s => s.toLowerCase() !== subjectName.toLowerCase());
    this.updateSchoolSubjects(schoolId, updated);
  }

  static getUsers(schoolId?: string): User[] {
    const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    if (!schoolId) return users;
    return users.filter(u => u.schoolId === schoolId);
  }

  static getCurrentUser(): User | null {
    const currentUserId = getStored<string | null>(STORAGE_KEYS.CURRENT_USER_ID, 'usr_proprietor1');
    if (!currentUserId) return null;
    const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    return users.find(u => u.id === currentUserId) || null;
  }

  static getAuditLogs(schoolId?: string): AuditLogEntry[] {
    const logs = getStored<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    if (!schoolId) return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return logs.filter(l => l.schoolId === schoolId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): AuditLogEntry {
    const logs = getStored<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    const newEntry: AuditLogEntry = {
      ...entry,
      id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString()
    };
    logs.unshift(newEntry); // Latest first
    setStored(STORAGE_KEYS.AUDIT_LOGS, logs);
    return newEntry;
  }

  static setCurrentUserId(userId: string | null) {
    setStored(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  static getClasses(schoolId?: string): SchoolClass[] {
    let classes = getStored<SchoolClass[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    // Ensure Pre-Nursery and Nursery classes exist if missing from older cached storage
    const hasEarlyYears = classes.some(c => c.category === 'Pre-Nursery & Nursery' || c.name.toUpperCase().includes('NURSERY'));
    if (!hasEarlyYears) {
      const earlyClasses = INITIAL_CLASSES.filter(c => c.category === 'Pre-Nursery & Nursery');
      classes = [...earlyClasses, ...classes];
      setStored(STORAGE_KEYS.CLASSES, classes);
    }

    // Ensure every class has defined subjects array
    let updatedSubjectsNeeded = false;
    classes = classes.map(c => {
      if (!c.subjects || c.subjects.length === 0) {
        const initialMatch = INITIAL_CLASSES.find(ic => ic.id === c.id || ic.name.toLowerCase() === c.name.toLowerCase());
        const defaultTierSubjects = SUBJECT_OPTIONS_BY_TIER[c.category] || DEFAULT_SCHOOL_SUBJECTS;
        updatedSubjectsNeeded = true;
        return {
          ...c,
          subjects: initialMatch?.subjects || defaultTierSubjects
        };
      }
      return c;
    });

    if (updatedSubjectsNeeded) {
      setStored(STORAGE_KEYS.CLASSES, classes);
    }

    if (!schoolId) return classes;
    return classes.filter(c => c.schoolId === schoolId);
  }

  static getClassSubjects(classId: string): string[] {
    const classes = this.getClasses();
    const cls = classes.find(c => c.id === classId);
    if (!cls) return DEFAULT_SCHOOL_SUBJECTS;
    if (cls.subjects && cls.subjects.length > 0) {
      return cls.subjects;
    }
    return SUBJECT_OPTIONS_BY_TIER[cls.category] || DEFAULT_SCHOOL_SUBJECTS;
  }

  static getStudents(schoolId?: string, classId?: string): Student[] {
    let students = getStored<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    if (schoolId) students = students.filter(s => s.schoolId === schoolId);
    if (classId) students = students.filter(s => s.classId === classId);
    return students;
  }

  static getSubmissions(schoolId?: string, teacherId?: string): Submission[] {
    let submissions = getStored<Submission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    if (schoolId) submissions = submissions.filter(s => s.schoolId === schoolId);
    if (teacherId) submissions = submissions.filter(s => s.teacherId === teacherId);
    return submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static getAttendanceRecords(schoolId?: string, classId?: string): AttendanceRecord[] {
    let records = getStored<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    if (schoolId) records = records.filter(r => r.schoolId === schoolId);
    if (classId) records = records.filter(r => r.classId === classId);
    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static getNotifications(userId: string): NotificationItem[] {
    const allNotifs = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return allNotifs
      .filter(n => n.recipientUserId === userId || n.recipientUserId === 'ALL_ADMINS')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Actions
  static createSchoolAndAdmin(schoolName: string, motto: string, adminName: string, adminEmail: string, logoUrl?: string) {
    const schoolId = 'school_' + Date.now();
    const adminId = 'usr_admin_' + Date.now();

    const newSchool: School = {
      id: schoolId,
      name: schoolName,
      motto: motto || 'Excellence in Education',
      code: 'SCH-' + Math.floor(1000 + Math.random() * 9000),
      logoUrl: logoUrl || undefined,
      address: 'Main Campus',
      academicSession: '2025/2026',
      academicTerm: 'First Term',
      createdAt: new Date().toISOString()
    };

    const newProprietor: User = {
      id: adminId,
      schoolId: schoolId,
      name: adminName,
      email: adminEmail,
      role: 'PROPRIETOR',
      phone: '+234 800 000 0000',
      assignedClassIds: [],
      assignedSubjects: [],
      active: true,
      permissions: DEFAULT_ROLE_PERMISSIONS.PROPRIETOR,
      createdAt: new Date().toISOString()
    };

    const schools = this.getSchools();
    schools.push(newSchool);
    setStored(STORAGE_KEYS.SCHOOLS, schools);

    const users = this.getUsers();
    users.push(newProprietor);
    setStored(STORAGE_KEYS.USERS, users);

    this.setCurrentSchoolId(schoolId);
    this.setCurrentUserId(adminId);

    // Create default class structure for new school
    const defaultClasses: SchoolClass[] = [
      { id: `cls_${schoolId}_pn`, schoolId, name: 'PRE-NURSERY', category: 'Pre-Nursery & Nursery', arm: 'Buttercups', capacity: 20 },
      { id: `cls_${schoolId}_n1`, schoolId, name: 'NURSERY 1', category: 'Pre-Nursery & Nursery', arm: 'Sunflowers', capacity: 25 },
      { id: `cls_${schoolId}_n2`, schoolId, name: 'NURSERY 2', category: 'Pre-Nursery & Nursery', arm: 'Daffodils', capacity: 25 },
      { id: `cls_${schoolId}_n3`, schoolId, name: 'NURSERY 3', category: 'Pre-Nursery & Nursery', arm: 'Bluebells', capacity: 25 },
      { id: `cls_${schoolId}_p1`, schoolId, name: 'Primary 1', category: 'Primary', arm: 'Gold', capacity: 30 },
      { id: `cls_${schoolId}_p2`, schoolId, name: 'Primary 2', category: 'Primary', arm: 'Gold', capacity: 30 },
      { id: `cls_${schoolId}_j1`, schoolId, name: 'JSS 1', category: 'Junior Secondary', arm: 'A', capacity: 35 },
      { id: `cls_${schoolId}_s1`, schoolId, name: 'SS 1', category: 'Senior Secondary', arm: 'Science', capacity: 30 },
    ];
    const classes = this.getClasses();
    setStored(STORAGE_KEYS.CLASSES, [...classes, ...defaultClasses]);

    if (isSupabaseConfigured()) {
      SupabaseService.upsertSchool(newSchool).catch(console.error);
      SupabaseService.upsertUser(newProprietor).catch(console.error);
      for (const cls of defaultClasses) {
        SupabaseService.upsertClass(cls).catch(console.error);
      }
    }
  }

  static createUser(user: Omit<User, 'id' | 'createdAt'>, actor?: User) {
    const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const newUserId = 'usr_' + Date.now();
    const newUser: User = {
      ...user,
      id: newUserId,
      active: true,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);

    // Audit log
    const actorUser = actor || this.getCurrentUser();
    if (actorUser) {
      this.addAuditLog({
        schoolId: newUser.schoolId,
        userId: actorUser.id,
        userName: actorUser.name,
        userRole: actorUser.role,
        action: `Created ${newUser.role.replace('_', ' ')} Account`,
        module: 'USER_MANAGEMENT',
        details: `Created account for ${newUser.name} (${newUser.email}) with role ${newUser.role}.`
      });
    }

    if (isSupabaseConfigured()) {
      SupabaseService.upsertUser(newUser).catch(console.error);
    }

    return newUser;
  }

  static updateUserPermissions(userId: string, permissions: AdminPermission[], actor?: User): User | null {
    const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return null;

    const targetUser = users[idx];
    users[idx] = {
      ...targetUser,
      permissions
    };
    setStored(STORAGE_KEYS.USERS, users);

    // Audit log
    const actorUser = actor || this.getCurrentUser();
    if (actorUser) {
      this.addAuditLog({
        schoolId: targetUser.schoolId,
        userId: actorUser.id,
        userName: actorUser.name,
        userRole: actorUser.role,
        action: 'Updated User Permissions',
        module: 'USER_MANAGEMENT',
        details: `Updated permissions for ${targetUser.name} (${targetUser.role}): ${permissions.length} permission(s) assigned.`
      });
    }

    if (isSupabaseConfigured()) {
      SupabaseService.upsertUser(users[idx]).catch(console.error);
    }

    return users[idx];
  }

  static toggleUserActive(userId: string, actor?: User): User | null {
    const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return null;

    const newActiveState = !users[idx].active;
    users[idx] = {
      ...users[idx],
      active: newActiveState
    };
    setStored(STORAGE_KEYS.USERS, users);

    // Audit log
    const actorUser = actor || this.getCurrentUser();
    if (actorUser) {
      this.addAuditLog({
        schoolId: users[idx].schoolId,
        userId: actorUser.id,
        userName: actorUser.name,
        userRole: actorUser.role,
        action: newActiveState ? 'Activated User Account' : 'Deactivated User Account',
        module: 'USER_MANAGEMENT',
        details: `${newActiveState ? 'Activated' : 'Deactivated'} account for ${users[idx].name} (${users[idx].role}).`
      });
    }

    if (isSupabaseConfigured()) {
      SupabaseService.upsertUser(users[idx]).catch(console.error);
    }

    return users[idx];
  }

  static createTeacher(teacher: Omit<User, 'id' | 'createdAt' | 'role'>, actor?: User) {
    const users = this.getUsers();
    const newTeacher: User = {
      ...teacher,
      id: 'usr_t_' + Date.now(),
      role: 'TEACHER',
      active: true,
      createdAt: new Date().toISOString()
    };
    users.push(newTeacher);
    setStored(STORAGE_KEYS.USERS, users);

    // Audit log
    const actorUser = actor || this.getCurrentUser();
    if (actorUser) {
      this.addAuditLog({
        schoolId: teacher.schoolId,
        userId: actorUser.id,
        userName: actorUser.name,
        userRole: actorUser.role,
        action: 'Provisioned Teacher Account',
        module: 'USER_MANAGEMENT',
        details: `Provisioned teacher account for ${newTeacher.name} (${newTeacher.email}).`
      });
    }

    // Notify teacher
    this.sendNotification({
      schoolId: teacher.schoolId,
      recipientUserId: newTeacher.id,
      senderName: 'School Administrator',
      title: 'Welcome to TeXora Forge!',
      message: `Your teacher account has been provisioned. Assigned classes: ${teacher.assignedClassIds.length} class(es).`,
      type: 'SYSTEM'
    });

    if (isSupabaseConfigured()) {
      SupabaseService.upsertUser(newTeacher).catch(console.error);
    }

    return newTeacher;
  }

  static updateTeacher(teacherId: string, updates: Partial<User>) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === teacherId);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      setStored(STORAGE_KEYS.USERS, users);
      if (isSupabaseConfigured()) {
        SupabaseService.upsertUser(users[idx]).catch(console.error);
      }
    }
  }

  static deleteTeacher(teacherId: string) {
    let users = this.getUsers();
    users = users.filter(u => u.id !== teacherId);
    setStored(STORAGE_KEYS.USERS, users);

    if (isSupabaseConfigured()) {
      SupabaseService.deleteUser(teacherId).catch(console.error);
    }
  }

  static createClass(newClass: Omit<SchoolClass, 'id'>) {
    const classes = this.getClasses();
    const defaultSubjects = newClass.subjects && newClass.subjects.length > 0
      ? newClass.subjects
      : (SUBJECT_OPTIONS_BY_TIER[newClass.category] || DEFAULT_SCHOOL_SUBJECTS);

    const cls: SchoolClass = {
      ...newClass,
      subjects: defaultSubjects,
      id: 'cls_' + Date.now()
    };
    classes.push(cls);
    setStored(STORAGE_KEYS.CLASSES, classes);

    // Audit log
    const actorUser = this.getCurrentUser();
    if (actorUser) {
      this.addAuditLog({
        schoolId: cls.schoolId,
        userId: actorUser.id,
        userName: actorUser.name,
        userRole: actorUser.role,
        action: 'Created New Class',
        module: 'CLASSES',
        details: `Created class ${cls.name} (${cls.category}) with ${cls.subjects?.length || 0} offered subjects.`
      });
    }

    if (isSupabaseConfigured()) {
      SupabaseService.upsertClass(cls).catch(console.error);
    }

    return cls;
  }

  static updateClass(classId: string, updates: Partial<SchoolClass>, syncToStudents = true): SchoolClass | null {
    const classes = this.getClasses();
    const idx = classes.findIndex(c => c.id === classId);
    if (idx === -1) return null;

    const oldSubjectsCount = classes[idx].subjects?.length || 0;
    classes[idx] = {
      ...classes[idx],
      ...updates
    };
    setStored(STORAGE_KEYS.CLASSES, classes);

    // If subjects were updated and syncToStudents is true, auto-sync all enrolled students
    if (updates.subjects && syncToStudents) {
      this.syncClassSubjectsToStudents(classId, updates.subjects);
    }

    // Audit log
    const actorUser = this.getCurrentUser();
    if (actorUser) {
      const subjectDetail = updates.subjects
        ? ` (Curriculum: ${updates.subjects.length} subjects offered, changed from ${oldSubjectsCount})`
        : '';
      this.addAuditLog({
        schoolId: classes[idx].schoolId,
        userId: actorUser.id,
        userName: actorUser.name,
        userRole: actorUser.role,
        action: 'Updated Class Configuration',
        module: 'CLASSES',
        details: `Updated class ${classes[idx].name}${subjectDetail}.`
      });
    }

    if (isSupabaseConfigured()) {
      SupabaseService.upsertClass(classes[idx]).catch(console.error);
    }

    return classes[idx];
  }

  static updateClassSubjects(classId: string, subjects: string[], syncToStudents = true): SchoolClass | null {
    return this.updateClass(classId, { subjects }, syncToStudents);
  }

  static addSubjectToClass(classId: string, subject: string, syncToStudents = true): SchoolClass | null {
    const trimmed = subject.trim();
    if (!trimmed) return null;
    const current = this.getClassSubjects(classId);
    if (current.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      return null; // Already exists
    }
    const updated = [...current, trimmed];
    return this.updateClass(classId, { subjects: updated }, syncToStudents);
  }

  static removeSubjectFromClass(classId: string, subject: string, syncToStudents = true): SchoolClass | null {
    const trimmed = subject.trim();
    if (!trimmed) return null;
    const current = this.getClassSubjects(classId);
    const updated = current.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
    return this.updateClass(classId, { subjects: updated }, syncToStudents);
  }

  static syncClassSubjectsToStudents(classId: string, explicitSubjects?: string[]): number {
    const targetSubjects = explicitSubjects || this.getClassSubjects(classId);
    let students = this.getStudents();
    let updatedCount = 0;

    students = students.map(s => {
      if (s.classId === classId) {
        updatedCount++;
        return {
          ...s,
          enrolledSubjects: [...targetSubjects]
        };
      }
      return s;
    });

    if (updatedCount > 0) {
      setStored(STORAGE_KEYS.STUDENTS, students);
    }
    return updatedCount;
  }

  static createStudent(student: Omit<Student, 'id'>) {
    const students = this.getStudents();
    // Auto-inherit class subjects if none explicitly provided
    const classSubjects = this.getClassSubjects(student.classId);
    const enrolledSubjects = (student.enrolledSubjects && student.enrolledSubjects.length > 0)
      ? student.enrolledSubjects
      : [...classSubjects];

    const newStd: Student = {
      ...student,
      enrolledSubjects,
      id: 'std_' + Date.now()
    };
    students.push(newStd);
    setStored(STORAGE_KEYS.STUDENTS, students);

    // Audit log
    const actorUser = this.getCurrentUser();
    if (actorUser) {
      this.addAuditLog({
        schoolId: student.schoolId,
        userId: actorUser.id,
        userName: actorUser.name,
        userRole: actorUser.role,
        action: 'Admitted New Student',
        module: 'ADMISSIONS',
        details: `Admitted student ${newStd.fullName} (Admission No: ${newStd.admissionNo}) into class with ${enrolledSubjects.length} auto-assigned subjects.`
      });
    }

    if (isSupabaseConfigured()) {
      SupabaseService.upsertStudent(newStd).catch(console.error);
    }

    return newStd;
  }

  static createSubmission(submission: Omit<Submission, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
    const submissions = this.getSubmissions();
    const newSub: Submission = {
      ...submission,
      id: 'sub_' + Date.now(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    submissions.push(newSub);
    setStored(STORAGE_KEYS.SUBMISSIONS, submissions);

    // Send notification to school admin
    this.sendNotification({
      schoolId: submission.schoolId,
      recipientUserId: 'ALL_ADMINS',
      senderName: submission.teacherName,
      title: `New ${submission.type.replace('_', ' ')} Submitted`,
      message: `${submission.teacherName} submitted ${submission.title} for ${submission.className} ${submission.subject}.`,
      type: 'SUBMISSION',
      linkId: newSub.id
    });

    if (isSupabaseConfigured()) {
      SupabaseService.upsertSubmission(newSub).catch(console.error);
    }

    return newSub;
  }

  static updateSubmission(submissionId: string, updates: Partial<Submission>) {
    const submissions = getStored<Submission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    const idx = submissions.findIndex(s => s.id === submissionId);
    if (idx !== -1) {
      submissions[idx] = {
        ...submissions[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      setStored(STORAGE_KEYS.SUBMISSIONS, submissions);

      if (isSupabaseConfigured()) {
        SupabaseService.upsertSubmission(submissions[idx]).catch(console.error);
      }
    }
  }

  static reviewSubmission(submissionId: string, status: SubmissionStatus, feedback: string, adminUser: User) {
    const submissions = getStored<Submission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub) return;

    sub.status = status;
    sub.adminFeedback = feedback;
    sub.reviewedByAdminId = adminUser.id;
    sub.reviewedAt = new Date().toISOString();
    sub.updatedAt = new Date().toISOString();

    setStored(STORAGE_KEYS.SUBMISSIONS, submissions);

    // Audit log
    this.addAuditLog({
      schoolId: sub.schoolId,
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: status === 'APPROVED' ? 'Approved Lesson Submission' : status === 'REJECTED' ? 'Rejected Lesson Submission' : 'Requested Revision on Submission',
      module: 'LESSON_NOTES',
      details: `${status === 'APPROVED' ? 'Approved' : status === 'REJECTED' ? 'Rejected' : 'Requested revision on'} ${sub.type.replace('_', ' ')} "${sub.title}" by ${sub.teacherName}.`
    });

    if (isSupabaseConfigured()) {
      SupabaseService.upsertSubmission(sub).catch(console.error);
    }

    // Notify teacher
    let title = 'Submission Approved! 🎉';
    let type: NotificationItem['type'] = 'APPROVAL';
    if (status === 'REJECTED') {
      title = 'Submission Rejected';
      type = 'REJECTION';
    } else if (status === 'REVISION_REQUESTED') {
      title = 'Revision Requested on Submission';
      type = 'CORRECTION';
    }

    this.sendNotification({
      schoolId: sub.schoolId,
      recipientUserId: sub.teacherId,
      senderName: `${adminUser.name} (School Admin)`,
      title,
      message: feedback || `Your ${sub.type.replace('_', ' ')} "${sub.title}" status changed to ${status}.`,
      type,
      linkId: sub.id
    });
  }

  static recordAttendance(attendance: Omit<AttendanceRecord, 'id' | 'createdAt'>) {
    const records = getStored<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    
    // Replace existing if same class & date
    const existingIdx = records.findIndex(r => r.classId === attendance.classId && r.date === attendance.date);
    const newRecord: AttendanceRecord = {
      ...attendance,
      id: existingIdx !== -1 ? records[existingIdx].id : 'att_' + Date.now(),
      createdAt: new Date().toISOString()
    };

    if (existingIdx !== -1) {
      records[existingIdx] = newRecord;
    } else {
      records.push(newRecord);
    }

    setStored(STORAGE_KEYS.ATTENDANCE, records);

    if (isSupabaseConfigured()) {
      SupabaseService.upsertAttendanceRecord(newRecord).catch(console.error);
    }

    return newRecord;
  }

  static sendNotification(notif: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>) {
    const notifications = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const item: NotificationItem = {
      ...notif,
      id: 'notif_' + Date.now(),
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications.push(item);
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifications);

    if (isSupabaseConfigured()) {
      SupabaseService.upsertNotification(item).catch(console.error);
    }
  }

  static markNotificationRead(notifId: string) {
    const notifications = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const item = notifications.find(n => n.id === notifId);
    if (item) {
      item.read = true;
      setStored(STORAGE_KEYS.NOTIFICATIONS, notifications);

      if (isSupabaseConfigured()) {
        SupabaseService.upsertNotification(item).catch(console.error);
      }
    }
  }

  static markAllNotificationsRead(userId: string) {
    const notifications = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    notifications.forEach(n => {
      if (n.recipientUserId === userId || n.recipientUserId === 'ALL_ADMINS') {
        n.read = true;
        if (isSupabaseConfigured()) {
          SupabaseService.upsertNotification(n).catch(console.error);
        }
      }
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  // Score Sheets Management
  static getScoreSheets(schoolId?: string, classId?: string, subject?: string): ScoreSheet[] {
    let sheets = getStored<ScoreSheet[]>(STORAGE_KEYS.SCORE_SHEETS, INITIAL_SCORE_SHEETS);
    if (schoolId) sheets = sheets.filter(s => s.schoolId === schoolId);
    if (classId) sheets = sheets.filter(s => s.classId === classId);
    if (subject) sheets = sheets.filter(s => s.subject.toLowerCase() === subject.toLowerCase());
    return sheets;
  }

  static saveScoreSheet(scoreSheet: Omit<ScoreSheet, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): ScoreSheet {
    const sheets = getStored<ScoreSheet[]>(STORAGE_KEYS.SCORE_SHEETS, INITIAL_SCORE_SHEETS);
    const now = new Date().toISOString();
    let saved: ScoreSheet;

    if (scoreSheet.id) {
      const idx = sheets.findIndex(s => s.id === scoreSheet.id);
      if (idx !== -1) {
        saved = {
          ...sheets[idx],
          ...scoreSheet,
          updatedAt: now
        };
        sheets[idx] = saved;
      } else {
        saved = {
          ...scoreSheet,
          id: scoreSheet.id,
          createdAt: now,
          updatedAt: now
        } as ScoreSheet;
        sheets.push(saved);
      }
    } else {
      saved = {
        ...scoreSheet,
        id: 'sc_' + Date.now(),
        createdAt: now,
        updatedAt: now
      } as ScoreSheet;
      sheets.push(saved);
    }

    setStored(STORAGE_KEYS.SCORE_SHEETS, sheets);

    if (saved.status === 'SUBMITTED_FOR_APPROVAL') {
      this.sendNotification({
        schoolId: saved.schoolId,
        recipientUserId: 'ALL_ADMINS',
        senderName: saved.teacherName,
        title: 'New Score Sheet Pending Review',
        message: `${saved.teacherName} submitted ${saved.subject} scores for ${saved.className}.`,
        type: 'SUBMISSION',
        linkId: saved.id
      });
    }

    return saved;
  }

  static reviewScoreSheet(sheetId: string, status: 'APPROVED' | 'REJECTED', adminComment?: string) {
    const sheets = getStored<ScoreSheet[]>(STORAGE_KEYS.SCORE_SHEETS, INITIAL_SCORE_SHEETS);
    const idx = sheets.findIndex(s => s.id === sheetId);
    if (idx !== -1) {
      sheets[idx].status = status;
      if (adminComment) sheets[idx].adminComment = adminComment;
      sheets[idx].approvedAt = status === 'APPROVED' ? new Date().toISOString() : undefined;
      sheets[idx].updatedAt = new Date().toISOString();
      setStored(STORAGE_KEYS.SCORE_SHEETS, sheets);

      this.sendNotification({
        schoolId: sheets[idx].schoolId,
        recipientUserId: sheets[idx].teacherId,
        senderName: 'School Administrator',
        title: status === 'APPROVED' ? 'Score Sheet Approved! 🎉' : 'Score Sheet Revision Needed',
        message: status === 'APPROVED' 
          ? `Your ${sheets[idx].subject} score sheet for ${sheets[idx].className} has been approved and locked.`
          : `Your ${sheets[idx].subject} score sheet for ${sheets[idx].className} requires revision. ${adminComment || ''}`,
        type: status === 'APPROVED' ? 'APPROVAL' : 'CORRECTION',
        linkId: sheetId
      });
    }
  }

  // Homework Management
  static getHomework(schoolId?: string, classId?: string): HomeworkItem[] {
    let list = getStored<HomeworkItem[]>(STORAGE_KEYS.HOMEWORK, INITIAL_HOMEWORK);
    if (schoolId) list = list.filter(h => h.schoolId === schoolId);
    if (classId) list = list.filter(h => h.classId === classId);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static addHomework(item: Omit<HomeworkItem, 'id' | 'createdAt'>): HomeworkItem {
    const list = getStored<HomeworkItem[]>(STORAGE_KEYS.HOMEWORK, INITIAL_HOMEWORK);
    const newItem: HomeworkItem = {
      ...item,
      id: 'hw_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    list.push(newItem);
    setStored(STORAGE_KEYS.HOMEWORK, list);
    return newItem;
  }

  // Student CRUD Operations
  static updateStudent(studentId: string, updates: Partial<Student>): Student | null {
    const students = getStored<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const idx = students.findIndex(s => s.id === studentId);
    if (idx === -1) return null;

    const oldStudent = students[idx];
    let finalEnrolledSubjects = updates.enrolledSubjects || oldStudent.enrolledSubjects;

    // If classId is changing and enrolledSubjects is not explicitly given, auto-inherit new class's subjects
    if (updates.classId && updates.classId !== oldStudent.classId && !updates.enrolledSubjects) {
      finalEnrolledSubjects = this.getClassSubjects(updates.classId);
    }

    students[idx] = {
      ...oldStudent,
      ...updates,
      enrolledSubjects: finalEnrolledSubjects
    };
    setStored(STORAGE_KEYS.STUDENTS, students);

    // Audit log
    const actorUser = this.getCurrentUser();
    if (actorUser) {
      this.addAuditLog({
        schoolId: students[idx].schoolId,
        userId: actorUser.id,
        userName: actorUser.name,
        userRole: actorUser.role,
        action: 'Updated Student Profile',
        module: 'ADMISSIONS',
        details: `Updated details for student ${students[idx].fullName} (${students[idx].admissionNo}).`
      });
    }

    if (isSupabaseConfigured()) {
      SupabaseService.upsertStudent(students[idx]).catch(console.error);
    }

    return students[idx];
  }

  static promoteStudent(
    studentId: string,
    targetClassId: string,
    academicSession: string,
    status: 'PROMOTED' | 'REPEATED' | 'GRADUATED' = 'PROMOTED',
    remarks?: string
  ): Student | null {
    const students = getStored<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const classes = this.getClasses();
    const idx = students.findIndex(s => s.id === studentId);
    if (idx === -1) return null;

    const student = students[idx];
    const fromClass = classes.find(c => c.id === student.classId);
    const toClass = classes.find(c => c.id === targetClassId);

    const fromClassName = fromClass ? `${fromClass.name} ${fromClass.arm || ''}`.trim() : 'Previous Class';
    const toClassName = toClass ? `${toClass.name} ${toClass.arm || ''}`.trim() : (status === 'GRADUATED' ? 'Graduated Alumni' : 'Next Class');

    const newRecord = {
      id: 'prom_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      fromClassId: student.classId,
      fromClassName,
      toClassId: targetClassId,
      toClassName,
      academicSession,
      promotedAt: new Date().toISOString(),
      status,
      remarks: remarks || `Academic Transition: ${status.toLowerCase()} to ${toClassName}`
    };

    const history = student.promotionHistory || [];
    const newClassSubjects = status === 'REPEATED'
      ? student.enrolledSubjects
      : this.getClassSubjects(targetClassId);

    const updatedStudent: Student = {
      ...student,
      classId: status === 'REPEATED' ? student.classId : targetClassId,
      promotionStatus: status,
      enrolledSubjects: newClassSubjects,
      promotionHistory: [newRecord, ...history]
    };

    students[idx] = updatedStudent;
    setStored(STORAGE_KEYS.STUDENTS, students);

    if (isSupabaseConfigured()) {
      SupabaseService.upsertStudent(updatedStudent).catch(console.error);
    }

    // Send notification to linked parents
    const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const linkedParents = users.filter(u => u.role === 'PARENT' && u.linkedStudentAccessCodes?.includes(student.accessCode));

    linkedParents.forEach(p => {
      this.sendNotification({
        schoolId: student.schoolId,
        recipientUserId: p.id,
        senderName: 'School Management',
        title: status === 'PROMOTED' ? `Academic Promotion Notice: ${student.fullName} 🎉` : `Academic Status Update: ${student.fullName}`,
        message: status === 'PROMOTED'
          ? `Congratulations! ${student.fullName} has been officially PROMOTED from ${fromClassName} to ${toClassName} for the ${academicSession} session.`
          : status === 'GRADUATED'
          ? `Congratulations! ${student.fullName} has successfully GRADUATED from ${fromClassName} as an Alumni!`
          : `${student.fullName} will be repeating ${fromClassName} for the ${academicSession} academic session.`,
        type: 'SYSTEM'
      });
    });

    return updatedStudent;
  }

  static promoteStudentsBatch(
    studentIds: string[],
    targetClassId: string,
    academicSession: string,
    status: 'PROMOTED' | 'REPEATED' | 'GRADUATED' = 'PROMOTED',
    remarks?: string
  ): number {
    let count = 0;
    studentIds.forEach(id => {
      const res = this.promoteStudent(id, targetClassId, academicSession, status, remarks);
      if (res) count++;
    });
    return count;
  }

  static deleteStudent(studentId: string): void {
    let students = getStored<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const target = students.find(s => s.id === studentId);
    students = students.filter(s => s.id !== studentId);
    setStored(STORAGE_KEYS.STUDENTS, students);

    // Audit log
    const actorUser = this.getCurrentUser();
    if (actorUser && target) {
      this.addAuditLog({
        schoolId: target.schoolId,
        userId: actorUser.id,
        userName: actorUser.name,
        userRole: actorUser.role,
        action: 'Deleted Student Record',
        module: 'ADMISSIONS',
        details: `Deleted student record for ${target.fullName} (${target.admissionNo}).`
      });
    }
  }

  static getStudentByAccessCode(accessCode: string): Student | undefined {
    const clean = accessCode.trim().toUpperCase();
    const students = getStored<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    return students.find(s => (s.accessCode || '').toUpperCase() === clean);
  }

  // Parent Linking & Access Code Auth
  static linkStudentToParent(parentUserId: string, accessCode: string): { success: boolean; message: string; student?: Student } {
    const student = this.getStudentByAccessCode(accessCode);
    if (!student) {
      return { success: false, message: 'Invalid Student Access Code. Please verify the code provided on the student’s admission letter or ID card.' };
    }

    const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const idx = users.findIndex(u => u.id === parentUserId);
    if (idx !== -1) {
      const currentCodes = users[idx].linkedStudentAccessCodes || [];
      if (currentCodes.includes(student.accessCode)) {
        return { success: true, message: `${student.fullName} is already linked to your parent portal account.`, student };
      }
      users[idx].linkedStudentAccessCodes = [...currentCodes, student.accessCode];
      setStored(STORAGE_KEYS.USERS, users);
      return { success: true, message: `Successfully linked ${student.fullName} (${student.admissionNo}) to your parent account!`, student };
    }

    return { success: false, message: 'Parent account session error.' };
  }

  static loginAsParentWithAccessCode(accessCode: string): User | null {
    const student = this.getStudentByAccessCode(accessCode);
    if (!student) return null;

    const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    let parent = users.find(u => u.role === 'PARENT' && u.linkedStudentAccessCodes?.includes(student.accessCode));
    if (!parent) {
      parent = {
        id: 'usr_p_' + Date.now(),
        schoolId: student.schoolId,
        name: student.guardianName || `Parent of ${student.fullName}`,
        email: student.guardianEmail || `parent.${student.admissionNo.toLowerCase().replace(/[^a-z0-9]/g, '')}@parentportal.edu`,
        role: 'PARENT',
        phone: student.guardianPhone,
        assignedClassIds: [],
        assignedSubjects: [],
        linkedStudentAccessCodes: [student.accessCode],
        active: true,
        createdAt: new Date().toISOString()
      };
      users.push(parent);
      setStored(STORAGE_KEYS.USERS, users);
    }

    this.setCurrentUserId(parent.id);
    this.setCurrentSchoolId(student.schoolId);
    return parent;
  }

  // Report Card Calculation Engine
  static computeReportCard(studentId: string): StudentReportCard | null {
    const students = getStored<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const student = students.find(s => s.id === studentId);
    if (!student) return null;

    const school = this.getCurrentSchool();
    const classes = this.getClasses();
    const studentClass = classes.find(c => c.id === student.classId);
    const className = studentClass ? `${studentClass.name} ${studentClass.arm || ''}`.trim() : 'Class';

    const approvedSheets = this.getScoreSheets(student.schoolId, student.classId).filter(s => s.status === 'APPROVED');
    
    // Calculate subject scores for this student
    const subjectScores: SubjectReportItem[] = [];
    let grandTotal = 0;

    approvedSheets.forEach(sheet => {
      const scoreItem = sheet.scores.find(sc => sc.studentId === student.id);
      if (scoreItem) {
        subjectScores.push({
          subject: sheet.subject,
          assignment: scoreItem.assignmentScore || 0,
          classwork: scoreItem.classworkScore || 0,
          project: scoreItem.projectScore || 0,
          test: scoreItem.testScore || 0,
          exam: scoreItem.examScore || 0,
          total: scoreItem.totalScore || 0,
          grade: scoreItem.grade || 'F',
          position: scoreItem.positionInSubject || 1,
          teacherRemark: scoreItem.teacherRemark || 'Satisfactory progress'
        });
        grandTotal += scoreItem.totalScore || 0;
      }
    });

    const numSubjects = subjectScores.length || 1;
    const averageScore = Math.round((grandTotal / numSubjects) * 10) / 10;

    let overallGrade = 'F';
    if (averageScore >= 70) overallGrade = 'A';
    else if (averageScore >= 60) overallGrade = 'B';
    else if (averageScore >= 50) overallGrade = 'C';
    else if (averageScore >= 45) overallGrade = 'D';
    else if (averageScore >= 40) overallGrade = 'E';

    // Compute Class Rank / Position among all class students
    const classStudents = students.filter(s => s.classId === student.classId);
    const studentTotals = classStudents.map(st => {
      let stTotal = 0;
      approvedSheets.forEach(sh => {
        const sc = sh.scores.find(item => item.studentId === st.id);
        if (sc) stTotal += sc.totalScore || 0;
      });
      return { id: st.id, total: stTotal };
    });

    studentTotals.sort((a, b) => b.total - a.total);
    const rankIndex = studentTotals.findIndex(item => item.id === student.id);
    const positionInClass = rankIndex !== -1 ? rankIndex + 1 : 1;

    // Attendance records
    const attendanceRecords = this.getAttendanceRecords(student.schoolId, student.classId);
    let totalDays = attendanceRecords.length;
    let daysPresent = 0;
    attendanceRecords.forEach(att => {
      const rec = att.records.find(r => r.studentId === student.id);
      if (rec && (rec.status === 'PRESENT' || rec.status === 'LATE')) {
        daysPresent++;
      }
    });

    if (totalDays === 0) {
      totalDays = 60;
      daysPresent = 56;
    }

    let teacherRemarks = 'Demonstrates exemplary conduct, steady focus, and admirable peer support.';
    if (averageScore < 50) teacherRemarks = 'Encouraging effort, but needs consistent revision in science and numerical subjects.';
    else if (averageScore >= 80) teacherRemarks = 'Outstanding academic performance! An exceptional student with commendable discipline.';

    let principalRemarks = 'Promoted to the next academic level with high honors.';
    if (averageScore < 50) principalRemarks = 'Advised to attend vacation tutorials and intensify study hours next term.';

    return {
      id: `rep_${student.id}_${Date.now()}`,
      schoolId: student.schoolId,
      studentId: student.id,
      studentName: student.fullName,
      admissionNo: student.admissionNo,
      photoUrl: student.photoUrl,
      classId: student.classId,
      className,
      academicSession: school?.academicSession || '2025/2026',
      academicTerm: school?.academicTerm || 'First Term',
      subjectScores,
      grandTotal,
      averageScore,
      positionInClass,
      totalStudentsInClass: classStudents.length,
      overallGrade,
      attendanceSummary: {
        daysPresent,
        totalDays
      },
      teacherRemarks,
      principalRemarks,
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Timetables
  static getTimetableForClass(classId: string) {
    const classTimetables = this.getClassTimetables();
    const found = classTimetables.find(t => t.classId === classId);
    if (found && found.days) return found.days;
    const timetables = getStored<Record<string, any>>('texora_timetables_v1', INITIAL_TIMETABLES);
    if (timetables[classId]) return timetables[classId];
    return INITIAL_TIMETABLES['cls_ss3']; // Fallback
  }

  static getClassTimetables(schoolId?: string, classId?: string): ClassTimetable[] {
    let timetables = getStored<ClassTimetable[]>(STORAGE_KEYS.CLASS_TIMETABLES, INITIAL_CLASS_TIMETABLES);
    if (schoolId) timetables = timetables.filter(t => t.schoolId === schoolId);
    if (classId) timetables = timetables.filter(t => t.classId === classId);
    return timetables;
  }

  static getClassTimetableForClass(schoolId: string, classId: string): ClassTimetable | null {
    const list = this.getClassTimetables(schoolId, classId);
    return list.length > 0 ? list[0] : null;
  }

  static saveClassTimetable(timetable: Omit<ClassTimetable, 'id' | 'updatedAt'> & { id?: string }): ClassTimetable {
    const list = getStored<ClassTimetable[]>(STORAGE_KEYS.CLASS_TIMETABLES, INITIAL_CLASS_TIMETABLES);
    const now = new Date().toISOString();
    let saved: ClassTimetable;

    const existingIdx = timetable.id
      ? list.findIndex(t => t.id === timetable.id)
      : list.findIndex(t => t.schoolId === timetable.schoolId && t.classId === timetable.classId);

    if (existingIdx !== -1) {
      saved = {
        ...list[existingIdx],
        ...timetable,
        updatedAt: now
      };
      list[existingIdx] = saved;
    } else {
      saved = {
        ...timetable,
        id: timetable.id || 'ct_' + Date.now(),
        updatedAt: now
      };
      list.push(saved);
    }

    setStored(STORAGE_KEYS.CLASS_TIMETABLES, list);
    return saved;
  }

  static getExamTimetables(schoolId?: string, classId?: string): ExamTimetable[] {
    let timetables = getStored<ExamTimetable[]>(STORAGE_KEYS.EXAM_TIMETABLES, INITIAL_EXAM_TIMETABLES);
    if (schoolId) timetables = timetables.filter(t => t.schoolId === schoolId);
    if (classId) timetables = timetables.filter(t => t.classId === classId);
    return timetables;
  }

  static getExamTimetableForClass(schoolId: string, classId: string): ExamTimetable | null {
    const list = this.getExamTimetables(schoolId, classId);
    return list.length > 0 ? list[0] : null;
  }

  static saveExamTimetable(timetable: Omit<ExamTimetable, 'id' | 'updatedAt'> & { id?: string }): ExamTimetable {
    const list = getStored<ExamTimetable[]>(STORAGE_KEYS.EXAM_TIMETABLES, INITIAL_EXAM_TIMETABLES);
    const now = new Date().toISOString();
    let saved: ExamTimetable;

    const existingIdx = timetable.id
      ? list.findIndex(t => t.id === timetable.id)
      : list.findIndex(t => t.schoolId === timetable.schoolId && t.classId === timetable.classId);

    if (existingIdx !== -1) {
      saved = {
        ...list[existingIdx],
        ...timetable,
        updatedAt: now
      };
      list[existingIdx] = saved;
    } else {
      saved = {
        ...timetable,
        id: timetable.id || 'et_' + Date.now(),
        updatedAt: now
      };
      list.push(saved);
    }

    setStored(STORAGE_KEYS.EXAM_TIMETABLES, list);
    return saved;
  }

  static deleteExamEntry(timetableId: string, entryId: string): ExamTimetable | null {
    const list = getStored<ExamTimetable[]>(STORAGE_KEYS.EXAM_TIMETABLES, INITIAL_EXAM_TIMETABLES);
    const idx = list.findIndex(t => t.id === timetableId);
    if (idx !== -1) {
      list[idx].entries = list[idx].entries.filter(e => e.id !== entryId);
      list[idx].updatedAt = new Date().toISOString();
      setStored(STORAGE_KEYS.EXAM_TIMETABLES, list);
      return list[idx];
    }
    return null;
  }

  // Chat & Messaging Methods
  static getChatRooms(schoolId?: string): ChatRoom[] {
    const rooms = getStored<ChatRoom[]>(STORAGE_KEYS.CHAT_ROOMS, INITIAL_CHAT_ROOMS);
    if (!schoolId) return rooms;
    return rooms.filter(r => r.schoolId === schoolId);
  }

  static getChatMessages(chatRoomId?: string): ChatMessage[] {
    const msgs = getStored<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, INITIAL_CHAT_MESSAGES);
    if (!chatRoomId) return msgs;
    return msgs.filter(m => m.chatRoomId === chatRoomId);
  }

  static saveChatRoom(room: Partial<ChatRoom> & { schoolId: string; studentId: string; parentUserId: string; teacherUserId: string; subject: string }): ChatRoom {
    const rooms = getStored<ChatRoom[]>(STORAGE_KEYS.CHAT_ROOMS, INITIAL_CHAT_ROOMS);
    const existingIndex = rooms.findIndex(r => r.id === room.id || (r.studentId === room.studentId && r.teacherUserId === room.teacherUserId && r.parentUserId === room.parentUserId));
    
    let savedRoom: ChatRoom;
    if (existingIndex >= 0) {
      savedRoom = {
        ...rooms[existingIndex],
        ...room,
      };
      rooms[existingIndex] = savedRoom;
    } else {
      savedRoom = {
        id: room.id || 'cr_' + Date.now(),
        schoolId: room.schoolId,
        studentId: room.studentId,
        studentName: room.studentName || 'Student',
        className: room.className || 'Class',
        parentUserId: room.parentUserId,
        parentName: room.parentName || 'Parent',
        teacherUserId: room.teacherUserId,
        teacherName: room.teacherName || 'Teacher',
        subject: room.subject,
        lastMessage: room.lastMessage || 'Chat room opened.',
        lastMessageAt: room.lastMessageAt || new Date().toISOString(),
        unreadByParent: room.unreadByParent ?? false,
        unreadByTeacher: room.unreadByTeacher ?? false,
        createdAt: room.createdAt || new Date().toISOString()
      };
      rooms.unshift(savedRoom);
    }
    setStored(STORAGE_KEYS.CHAT_ROOMS, rooms);
    return savedRoom;
  }

  static sendChatMessage(chatRoomId: string, sender: User, content: string, attachmentUrl?: string): ChatMessage {
    const msgs = getStored<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, INITIAL_CHAT_MESSAGES);
    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      chatRoomId,
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.role,
      senderAvatarUrl: sender.avatarUrl,
      content,
      attachmentUrl,
      createdAt: new Date().toISOString()
    };
    msgs.push(newMsg);
    setStored(STORAGE_KEYS.CHAT_MESSAGES, msgs);

    // Update room lastMessage
    const rooms = getStored<ChatRoom[]>(STORAGE_KEYS.CHAT_ROOMS, INITIAL_CHAT_ROOMS);
    const roomIdx = rooms.findIndex(r => r.id === chatRoomId);
    if (roomIdx !== -1) {
      rooms[roomIdx].lastMessage = sender.role === 'PROPRIETOR' ? `[Proprietor Note]: ${content}` : content;
      rooms[roomIdx].lastMessageAt = newMsg.createdAt;
      if (sender.role === 'TEACHER') {
        rooms[roomIdx].unreadByParent = true;
      } else if (sender.role === 'PARENT') {
        rooms[roomIdx].unreadByTeacher = true;
      }
      setStored(STORAGE_KEYS.CHAT_ROOMS, rooms);
    }

    return newMsg;
  }

  static markChatRoomRead(chatRoomId: string, role: string): void {
    const rooms = getStored<ChatRoom[]>(STORAGE_KEYS.CHAT_ROOMS, INITIAL_CHAT_ROOMS);
    const idx = rooms.findIndex(r => r.id === chatRoomId);
    if (idx !== -1) {
      let changed = false;
      if (role === 'PARENT' && rooms[idx].unreadByParent) {
        rooms[idx].unreadByParent = false;
        changed = true;
      }
      if (role === 'TEACHER' && rooms[idx].unreadByTeacher) {
        rooms[idx].unreadByTeacher = false;
        changed = true;
      }
      if (changed) {
        setStored(STORAGE_KEYS.CHAT_ROOMS, rooms);
      }
    }
  }

  static getPublicChatMessages(schoolId?: string): PublicChatMessage[] {
    const msgs = getStored<PublicChatMessage[]>(STORAGE_KEYS.PUBLIC_CHAT_MESSAGES, INITIAL_PUBLIC_CHAT_MESSAGES);
    if (!schoolId) return msgs;
    return msgs.filter(m => m.schoolId === schoolId);
  }

  static sendPublicChatMessage(
    schoolId: string,
    channel: 'general-announcements' | 'pta-forum' | 'academic-qa' | 'school-events',
    sender: User,
    content: string
  ): PublicChatMessage {
    const msgs = getStored<PublicChatMessage[]>(STORAGE_KEYS.PUBLIC_CHAT_MESSAGES, INITIAL_PUBLIC_CHAT_MESSAGES);
    const newMsg: PublicChatMessage = {
      id: 'pmsg_' + Date.now(),
      schoolId,
      channel,
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.role,
      senderAvatarUrl: sender.avatarUrl,
      content,
      createdAt: new Date().toISOString()
    };
    msgs.push(newMsg);
    setStored(STORAGE_KEYS.PUBLIC_CHAT_MESSAGES, msgs);
    return newMsg;
  }

  // --- EXAM QUESTIONS AUTO-GENERATION & MANAGEMENT ---
  static getExamSets(schoolId?: string, teacherId?: string): GeneratedExamSet[] {
    let sets = getStored<GeneratedExamSet[]>(STORAGE_KEYS.EXAM_SETS, INITIAL_EXAM_SETS);
    if (schoolId) {
      sets = sets.filter(s => s.schoolId === schoolId);
    }
    if (teacherId) {
      sets = sets.filter(s => s.teacherId === teacherId);
    }
    return sets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static saveExamSet(examSet: GeneratedExamSet): void {
    const sets = getStored<GeneratedExamSet[]>(STORAGE_KEYS.EXAM_SETS, INITIAL_EXAM_SETS);
    const index = sets.findIndex(s => s.id === examSet.id);
    if (index >= 0) {
      sets[index] = { ...examSet, updatedAt: new Date().toISOString() };
    } else {
      sets.unshift(examSet);
    }
    setStored(STORAGE_KEYS.EXAM_SETS, sets);
  }

  static deleteExamSet(id: string): void {
    const sets = getStored<GeneratedExamSet[]>(STORAGE_KEYS.EXAM_SETS, INITIAL_EXAM_SETS);
    const filtered = sets.filter(s => s.id !== id);
    setStored(STORAGE_KEYS.EXAM_SETS, filtered);
  }

  static generateExamFromLessonNote(
    submission: Submission,
    school: School,
    customExamTitle?: string
  ): GeneratedExamSet {
    const content = submission.lessonNoteContent;
    const topic = content?.topic || submission.title;
    const subTopic = content?.subTopic || 'General Assessment';
    const objectives = content?.behavioralObjectives || ['Demonstrate subject comprehension'];
    const steps = content?.coreContentSteps || [];
    const summary = content?.summary || `Evaluation of ${topic}`;
    const evalQuestions = content?.evaluationQuestions || [];
    const assignment = content?.assignment || '';

    const questions: ExamQuestion[] = [];
    let qCounter = 1;

    // 1. Generate Multiple Choice Questions (MCQs) from Behavioral Objectives & Steps
    objectives.forEach((obj, idx) => {
      const qText = `Which of the following best aligns with the learning objective: "${obj}"?`;
      questions.push({
        id: `q_${Date.now()}_${qCounter++}`,
        type: 'MULTIPLE_CHOICE',
        questionText: qText,
        options: [
          `A. Accurately explaining the key principles of ${topic} and its practical applications.`,
          `B. Disregarding the foundational theories of ${subTopic}.`,
          `C. Memorizing unrelated formulas without conceptual understanding.`,
          `D. Assuming all variables remain constant in every situation.`
        ],
        correctAnswer: `A. Accurately explaining the key principles of ${topic} and its practical applications.`,
        explanation: `This question tests student mastery of behavioral objective #${idx + 1}: ${obj}.`,
        marks: 5
      });
    });

    // MCQs from Core Steps
    steps.forEach((step, idx) => {
      questions.push({
        id: `q_${Date.now()}_${qCounter++}`,
        type: 'MULTIPLE_CHOICE',
        questionText: `In Step ${step.stepNumber} (${step.title}), what primary concept was demonstrated regarding ${subTopic}?`,
        options: [
          `A. ${step.teacherActivity.slice(0, 70)}...`,
          `B. ${step.studentActivity.slice(0, 70)}...`,
          `C. Discontinuing the analysis of ${subTopic}.`,
          `D. None of the above.`
        ],
        correctAnswer: `A. ${step.teacherActivity.slice(0, 70)}...`,
        explanation: `Refers directly to Step ${step.stepNumber} instructional breakdown in the approved lesson note.`,
        marks: 5
      });
    });

    // 2. Generate True / False Questions from Summary
    questions.push({
      id: `q_${Date.now()}_${qCounter++}`,
      type: 'TRUE_FALSE',
      questionText: `True or False: According to the lesson summary on ${topic}, ${summary}`,
      correctAnswer: 'True',
      explanation: `Verified directly from the teacher's lesson summary statement.`,
      marks: 5
    });

    // 3. Generate Short Answer Questions from Evaluation Questions in Lesson Note
    if (evalQuestions.length > 0) {
      evalQuestions.forEach((eq, idx) => {
        questions.push({
          id: `q_${Date.now()}_${qCounter++}`,
          type: 'SHORT_ANSWER',
          questionText: eq,
          correctAnswer: `Comprehensive answer based on ${topic} - ${subTopic}.`,
          explanation: `Derived from evaluation question #${idx + 1} of the submitted lesson note.`,
          marks: 10
        });
      });
    } else {
      questions.push({
        id: `q_${Date.now()}_${qCounter++}`,
        type: 'SHORT_ANSWER',
        questionText: `Briefly define ${subTopic} and list two real-world applications discussed in class.`,
        correctAnswer: `Student should provide clear definition and two valid practical examples.`,
        explanation: `Assesses recall and application of key sub-topic terms.`,
        marks: 10
      });
    }

    // 4. Generate Structured Essay / Theory Question
    questions.push({
      id: `q_${Date.now()}_${qCounter++}`,
      type: 'ESSAY',
      questionText: `Theory Section: With clear diagrams, formulas, or step-by-step reasoning, provide a detailed explanation of ${topic} (${subTopic}). ${assignment ? 'Include insights from: ' + assignment : ''}`,
      correctAnswer: `Full essay credit awarded for logical progression, accurate diagrams/formulas, and comprehensive explanation.`,
      explanation: `Extended response question testing deep conceptual synthesis.`,
      marks: 20
    });

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    const generatedExamSet: GeneratedExamSet = {
      id: 'exam_' + Date.now(),
      schoolId: submission.schoolId || school.id,
      teacherId: submission.teacherId,
      teacherName: submission.teacherName,
      classId: submission.classId,
      className: submission.className,
      subject: submission.subject,
      lessonNoteId: submission.id,
      lessonNoteTitle: submission.title,
      title: customExamTitle || `${submission.className} ${submission.subject} - Examination Questions (${topic})`,
      academicTerm: school.academicTerm,
      academicSession: school.academicSession,
      instructions: 'Answer ALL questions in Section A and Section B. Write clearly and show all steps.',
      questions,
      totalMarks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    AppStorage.saveExamSet(generatedExamSet);
    return generatedExamSet;
  }

  // --- Curriculum Methods ---
  static getCurricula(schoolId?: string): CurriculumSubject[] {
    const list = getStored<CurriculumSubject[]>(STORAGE_KEYS.CURRICULA, INITIAL_CURRICULA);
    const sId = schoolId || this.getCurrentSchool()?.id;
    return sId ? list.filter(c => c.schoolId === sId) : list;
  }

  static saveCurriculum(curriculum: CurriculumSubject): void {
    const list = getStored<CurriculumSubject[]>(STORAGE_KEYS.CURRICULA, INITIAL_CURRICULA);
    const idx = list.findIndex(c => c.id === curriculum.id);
    if (idx !== -1) {
      list[idx] = curriculum;
    } else {
      list.unshift(curriculum);
    }
    setStored(STORAGE_KEYS.CURRICULA, list);
  }

  // --- CBT Methods ---
  static getCBTExams(schoolId?: string): CBTExam[] {
    const list = getStored<CBTExam[]>(STORAGE_KEYS.CBT_EXAMS, INITIAL_CBT_EXAMS);
    const sId = schoolId || this.getCurrentSchool()?.id;
    return sId ? list.filter(e => e.schoolId === sId) : list;
  }

  static saveCBTExam(exam: CBTExam, actor?: User): CBTExam {
    const list = getStored<CBTExam[]>(STORAGE_KEYS.CBT_EXAMS, INITIAL_CBT_EXAMS);
    const user = actor || this.getCurrentUser();
    
    // Auto-calculate totalMarks from questions
    const totalMarks = (exam.questions || []).reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    
    const enrichedExam: CBTExam = {
      ...exam,
      teacherId: exam.teacherId || (user?.role === 'TEACHER' ? user.id : 'usr_t1'),
      teacherName: exam.teacherName || (user?.role === 'TEACHER' ? user.name : 'Teacher'),
      visibilityMode: exam.visibilityMode || 'ALL_CLASS_STUDENTS',
      totalMarks,
      updatedAt: new Date().toISOString()
    };

    const idx = list.findIndex(e => e.id === exam.id);
    if (idx !== -1) {
      list[idx] = enrichedExam;
    } else {
      list.unshift(enrichedExam);
    }
    setStored(STORAGE_KEYS.CBT_EXAMS, list);

    // Audit log
    if (user) {
      this.addAuditLog({
        schoolId: enrichedExam.schoolId,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: idx !== -1 ? 'Updated CBT Assessment' : 'Created CBT Assessment',
        module: 'EXAMINATIONS',
        details: `${user.name} (${user.role}) saved CBT Exam "${enrichedExam.title}" for ${enrichedExam.className} [Status: ${enrichedExam.status}, Visibility: ${enrichedExam.visibilityMode}, ${enrichedExam.questions.length} questions]`
      });
    }

    // If published, notify students
    if (enrichedExam.status === 'PUBLISHED') {
      this.sendNotification({
        schoolId: enrichedExam.schoolId,
        recipientUserId: 'ALL_STUDENTS',
        senderName: enrichedExam.teacherName || 'Teacher',
        title: `New CBT Assessment Published: ${enrichedExam.title}`,
        message: `${enrichedExam.teacherName || 'Your teacher'} published a ${enrichedExam.subject} CBT examination for ${enrichedExam.className}. ${enrichedExam.durationMinutes} mins, ${enrichedExam.questions.length} questions.`,
        type: 'SUBMISSION',
        linkId: enrichedExam.id
      });
    }

    return enrichedExam;
  }

  static deleteCBTExam(examId: string, actor?: User): void {
    let list = getStored<CBTExam[]>(STORAGE_KEYS.CBT_EXAMS, INITIAL_CBT_EXAMS);
    const target = list.find(e => e.id === examId);
    list = list.filter(e => e.id !== examId);
    setStored(STORAGE_KEYS.CBT_EXAMS, list);

    const user = actor || this.getCurrentUser();
    if (user && target) {
      this.addAuditLog({
        schoolId: target.schoolId,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'Deleted CBT Assessment',
        module: 'EXAMINATIONS',
        details: `${user.name} deleted CBT Exam "${target.title}" for ${target.className}`
      });
    }
  }

  static toggleCBTExamStatus(examId: string, status: 'DRAFT' | 'PUBLISHED' | 'CLOSED', actor?: User): CBTExam | null {
    const list = getStored<CBTExam[]>(STORAGE_KEYS.CBT_EXAMS, INITIAL_CBT_EXAMS);
    const idx = list.findIndex(e => e.id === examId);
    if (idx === -1) return null;

    list[idx].status = status;
    list[idx].updatedAt = new Date().toISOString();
    setStored(STORAGE_KEYS.CBT_EXAMS, list);

    const user = actor || this.getCurrentUser();
    if (user) {
      this.addAuditLog({
        schoolId: list[idx].schoolId,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: `Changed CBT Status to ${status}`,
        module: 'EXAMINATIONS',
        details: `${user.name} changed status of CBT Exam "${list[idx].title}" to ${status}`
      });
    }

    if (status === 'PUBLISHED') {
      this.sendNotification({
        schoolId: list[idx].schoolId,
        recipientUserId: 'ALL_STUDENTS',
        senderName: list[idx].teacherName || 'Teacher',
        title: `CBT Test Live: ${list[idx].title}`,
        message: `${list[idx].teacherName} has made ${list[idx].title} live for ${list[idx].className}. You can now start the test.`,
        type: 'SUBMISSION',
        linkId: list[idx].id
      });
    }

    return list[idx];
  }

  static updateCBTExamVisibility(
    examId: string,
    visibilityConfig: {
      visibilityMode: 'ALL_CLASS_STUDENTS' | 'SPECIFIC_STUDENTS' | 'HIDDEN_TEACHER_ONLY';
      allowedStudentIds?: string[];
      allowStudentStudyMode?: boolean;
      showCorrectionsImmediately?: boolean;
      releaseResultsToStudents?: boolean;
      shuffleQuestions?: boolean;
    },
    actor?: User
  ): CBTExam | null {
    const list = getStored<CBTExam[]>(STORAGE_KEYS.CBT_EXAMS, INITIAL_CBT_EXAMS);
    const idx = list.findIndex(e => e.id === examId);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      ...visibilityConfig,
      updatedAt: new Date().toISOString()
    };
    setStored(STORAGE_KEYS.CBT_EXAMS, list);

    const user = actor || this.getCurrentUser();
    if (user) {
      this.addAuditLog({
        schoolId: list[idx].schoolId,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'Updated CBT Student Visibility Permissions',
        module: 'EXAMINATIONS',
        details: `${user.name} configured student visibility for "${list[idx].title}" (Mode: ${visibilityConfig.visibilityMode}, Allowed: ${visibilityConfig.allowedStudentIds?.length || 'ALL'} students)`
      });
    }

    return list[idx];
  }

  static toggleQuestionVisibilityInExam(examId: string, questionId: string): CBTExam | null {
    const list = getStored<CBTExam[]>(STORAGE_KEYS.CBT_EXAMS, INITIAL_CBT_EXAMS);
    const idx = list.findIndex(e => e.id === examId);
    if (idx === -1) return null;

    const qIdx = list[idx].questions.findIndex(q => q.id === questionId);
    if (qIdx === -1) return null;

    const currentVis = list[idx].questions[qIdx].isVisibleToStudents !== false;
    list[idx].questions[qIdx].isVisibleToStudents = !currentVis;
    list[idx].updatedAt = new Date().toISOString();
    setStored(STORAGE_KEYS.CBT_EXAMS, list);

    return list[idx];
  }

  static getCBTAttempts(schoolId?: string): CBTAttempt[] {
    const list = getStored<CBTAttempt[]>(STORAGE_KEYS.CBT_ATTEMPTS, INITIAL_CBT_ATTEMPTS);
    const sId = schoolId || this.getCurrentSchool()?.id;
    return sId ? list.filter(a => a.schoolId === sId) : list;
  }

  static saveCBTAttempt(attempt: CBTAttempt): void {
    const list = getStored<CBTAttempt[]>(STORAGE_KEYS.CBT_ATTEMPTS, INITIAL_CBT_ATTEMPTS);
    const idx = list.findIndex(a => a.id === attempt.id);
    if (idx !== -1) {
      list[idx] = attempt;
    } else {
      list.unshift(attempt);
    }
    setStored(STORAGE_KEYS.CBT_ATTEMPTS, list);
  }

  static updateCBTAttemptTeacherRemark(attemptId: string, teacherRemark: string, adjustedScore?: number): CBTAttempt | null {
    const list = getStored<CBTAttempt[]>(STORAGE_KEYS.CBT_ATTEMPTS, INITIAL_CBT_ATTEMPTS);
    const idx = list.findIndex(a => a.id === attemptId);
    if (idx === -1) return null;

    list[idx].teacherRemark = teacherRemark;
    if (adjustedScore !== undefined) {
      list[idx].score = adjustedScore;
      list[idx].percentage = Math.round((adjustedScore / list[idx].totalMarks) * 100);
    }
    setStored(STORAGE_KEYS.CBT_ATTEMPTS, list);
    return list[idx];
  }

  // --- Student Risk Profiles & Remedials ---
  static getStudentRiskProfiles(schoolId?: string): StudentRiskProfile[] {
    const list = getStored<StudentRiskProfile[]>(STORAGE_KEYS.STUDENT_RISK_PROFILES, INITIAL_STUDENT_RISK_PROFILES);
    const sId = schoolId || this.getCurrentSchool()?.id;
    return sId ? list.filter(r => r.schoolId === sId) : list;
  }

  static saveStudentRiskProfile(profile: StudentRiskProfile): void {
    const list = getStored<StudentRiskProfile[]>(STORAGE_KEYS.STUDENT_RISK_PROFILES, INITIAL_STUDENT_RISK_PROFILES);
    const idx = list.findIndex(r => r.id === profile.id);
    if (idx !== -1) {
      list[idx] = profile;
    } else {
      list.unshift(profile);
    }
    setStored(STORAGE_KEYS.STUDENT_RISK_PROFILES, list);
  }

  static getRemedialPackages(schoolId?: string): RemedialPackage[] {
    const list = getStored<RemedialPackage[]>(STORAGE_KEYS.REMEDIAL_PACKAGES, INITIAL_REMEDIAL_PACKAGES);
    const sId = schoolId || this.getCurrentSchool()?.id;
    return sId ? list.filter(r => r.schoolId === sId) : list;
  }

  static saveRemedialPackage(pkg: RemedialPackage): void {
    const list = getStored<RemedialPackage[]>(STORAGE_KEYS.REMEDIAL_PACKAGES, INITIAL_REMEDIAL_PACKAGES);
    const idx = list.findIndex(r => r.id === pkg.id);
    if (idx !== -1) {
      list[idx] = pkg;
    } else {
      list.unshift(pkg);
    }
    setStored(STORAGE_KEYS.REMEDIAL_PACKAGES, list);
  }

  // --- Documents, Financials, Events, Transport ---
  static getSchoolDocuments(schoolId?: string): SchoolDocument[] {
    const list = getStored<SchoolDocument[]>(STORAGE_KEYS.SCHOOL_DOCUMENTS, INITIAL_DOCUMENTS);
    const sId = schoolId || this.getCurrentSchool()?.id;
    return sId ? list.filter(d => d.schoolId === sId) : list;
  }

  static saveSchoolDocument(doc: SchoolDocument): void {
    const list = getStored<SchoolDocument[]>(STORAGE_KEYS.SCHOOL_DOCUMENTS, INITIAL_DOCUMENTS);
    const idx = list.findIndex(d => d.id === doc.id);
    if (idx !== -1) {
      list[idx] = doc;
    } else {
      list.unshift(doc);
    }
    setStored(STORAGE_KEYS.SCHOOL_DOCUMENTS, list);
  }

  static getFinancialRecords(schoolId?: string): FinancialRecord[] {
    const list = getStored<FinancialRecord[]>(STORAGE_KEYS.FINANCIAL_RECORDS, INITIAL_FINANCIALS);
    const sId = schoolId || this.getCurrentSchool()?.id;
    return sId ? list.filter(f => f.schoolId === sId) : list;
  }

  static saveFinancialRecord(record: FinancialRecord): void {
    const list = getStored<FinancialRecord[]>(STORAGE_KEYS.FINANCIAL_RECORDS, INITIAL_FINANCIALS);
    const idx = list.findIndex(f => f.id === record.id);
    if (idx !== -1) {
      list[idx] = record;
    } else {
      list.unshift(record);
    }
    setStored(STORAGE_KEYS.FINANCIAL_RECORDS, list);
  }

  // --- Parent & Proprietor Fees & Payments ---
  static getPaymentTransactions(schoolId?: string): PaymentTransaction[] {
    const list = getStored<PaymentTransaction[]>(STORAGE_KEYS.PAYMENT_TRANSACTIONS, INITIAL_PAYMENT_TRANSACTIONS);
    const sId = schoolId || this.getCurrentSchool()?.id;
    return sId ? list.filter(p => p.schoolId === sId) : list;
  }

  static savePaymentTransaction(transaction: PaymentTransaction): void {
    const list = getStored<PaymentTransaction[]>(STORAGE_KEYS.PAYMENT_TRANSACTIONS, INITIAL_PAYMENT_TRANSACTIONS);
    const idx = list.findIndex(p => p.id === transaction.id);
    if (idx !== -1) {
      list[idx] = transaction;
    } else {
      list.unshift(transaction);
    }
    setStored(STORAGE_KEYS.PAYMENT_TRANSACTIONS, list);

    // Notify Proprietor and School Admin
    const school = this.getCurrentSchool();
    this.sendNotification({
      schoolId: transaction.schoolId || school?.id || 'school_apex',
      recipientUserId: 'ALL_ADMINS',
      senderName: transaction.parentName,
      title: 'New Fee Payment Submitted',
      message: `${transaction.parentName} submitted payment of ₦${transaction.amountPaid.toLocaleString()} for ${transaction.studentName} (${transaction.feeTitle}). Ref: ${transaction.paymentReference}. Awaiting Proprietor confirmation.`,
      type: 'SUBMISSION',
      linkId: transaction.id
    });

    this.addAuditLog({
      schoolId: transaction.schoolId || school?.id || 'school_apex',
      userId: transaction.parentUserId,
      userName: transaction.parentName,
      userRole: 'PARENT',
      action: 'Submitted Fee Payment',
      module: 'SETTINGS',
      details: `Submitted payment of ₦${transaction.amountPaid.toLocaleString()} for ${transaction.studentName}. Ref: ${transaction.paymentReference}`
    });
  }

  static confirmPaymentTransaction(txId: string, confirmedByUserId: string, confirmedByName: string): PaymentTransaction | null {
    const list = getStored<PaymentTransaction[]>(STORAGE_KEYS.PAYMENT_TRANSACTIONS, INITIAL_PAYMENT_TRANSACTIONS);
    const idx = list.findIndex(p => p.id === txId);
    if (idx === -1) return null;

    const tx = list[idx];
    const updatedTx: PaymentTransaction = {
      ...tx,
      status: 'CONFIRMED',
      confirmedByProprietorId: confirmedByUserId,
      confirmedByProprietorName: confirmedByName,
      confirmedAt: new Date().toISOString()
    };
    list[idx] = updatedTx;
    setStored(STORAGE_KEYS.PAYMENT_TRANSACTIONS, list);

    // Automatically update student FinancialRecord
    const financials = this.getFinancialRecords(tx.schoolId);
    const finIdx = financials.findIndex(f => f.studentId === tx.studentId || (tx.financialRecordId && f.id === tx.financialRecordId));
    if (finIdx !== -1) {
      const rec = financials[finIdx];
      const newPaid = Math.min(rec.totalAmount, rec.paidAmount + tx.amountPaid);
      const newStatus = newPaid >= rec.totalAmount ? 'PAID' : newPaid > 0 ? 'PARTIAL' : 'UNPAID';
      financials[finIdx] = {
        ...rec,
        paidAmount: newPaid,
        status: newStatus,
        lastPaymentDate: tx.paymentDate || new Date().toISOString().split('T')[0]
      };
      setStored(STORAGE_KEYS.FINANCIAL_RECORDS, financials);
    }

    // Notify Parent
    this.sendNotification({
      schoolId: tx.schoolId,
      recipientUserId: tx.parentUserId,
      senderName: confirmedByName,
      title: 'Payment Confirmed by Proprietor 🎉',
      message: `Your payment of ₦${tx.amountPaid.toLocaleString()} for ${tx.studentName} (${tx.feeTitle}) has been verified and officially confirmed by Proprietor ${confirmedByName}.`,
      type: 'APPROVAL',
      linkId: tx.id
    });

    this.addAuditLog({
      schoolId: tx.schoolId,
      userId: confirmedByUserId,
      userName: confirmedByName,
      userRole: 'PROPRIETOR',
      action: 'Confirmed Student Fee Payment',
      module: 'SETTINGS',
      details: `Proprietor ${confirmedByName} confirmed payment of ₦${tx.amountPaid.toLocaleString()} for ${tx.studentName}. Ref: ${tx.paymentReference}`
    });

    return updatedTx;
  }

  static rejectPaymentTransaction(txId: string, rejectionReason: string, rejectedByUserId: string, rejectedByName: string): PaymentTransaction | null {
    const list = getStored<PaymentTransaction[]>(STORAGE_KEYS.PAYMENT_TRANSACTIONS, INITIAL_PAYMENT_TRANSACTIONS);
    const idx = list.findIndex(p => p.id === txId);
    if (idx === -1) return null;

    const tx = list[idx];
    const updatedTx: PaymentTransaction = {
      ...tx,
      status: 'REJECTED',
      rejectionReason,
      confirmedByProprietorId: rejectedByUserId,
      confirmedByProprietorName: rejectedByName,
      confirmedAt: new Date().toISOString()
    };
    list[idx] = updatedTx;
    setStored(STORAGE_KEYS.PAYMENT_TRANSACTIONS, list);

    this.sendNotification({
      schoolId: tx.schoolId,
      recipientUserId: tx.parentUserId,
      senderName: rejectedByName,
      title: 'Payment Record Flagged / Rejected',
      message: `Your payment submission of ₦${tx.amountPaid.toLocaleString()} for ${tx.studentName} was rejected. Reason: ${rejectionReason}. Please verify and resubmit.`,
      type: 'REJECTION',
      linkId: tx.id
    });

    return updatedTx;
  }

  static updateSchoolBankAccount(bankDetails: SchoolBankAccountDetails): void {
    const school = this.getCurrentSchool();
    if (!school) return;

    const updatedSchool: School = {
      ...school,
      bankAccountDetails: bankDetails
    };

    const schools = this.getSchools();
    const sIdx = schools.findIndex(s => s.id === school.id);
    if (sIdx !== -1) {
      schools[sIdx] = updatedSchool;
      setStored(STORAGE_KEYS.SCHOOLS, schools);
    }

    const user = this.getCurrentUser();
    this.addAuditLog({
      schoolId: school.id,
      userId: user?.id || 'proprietor',
      userName: user?.name || 'Proprietor',
      userRole: user?.role || 'PROPRIETOR',
      action: 'Updated School Bank Account Details',
      module: 'SETTINGS',
      details: `Updated bank account to ${bankDetails.bankName} - ${bankDetails.accountNumber} (${bankDetails.accountName})`
    });
  }

  static getSchoolEvents(schoolId?: string): SchoolEvent[] {
    const list = getStored<SchoolEvent[]>(STORAGE_KEYS.SCHOOL_EVENTS, INITIAL_EVENTS);
    const sId = schoolId || this.getCurrentSchool()?.id;
    return sId ? list.filter(e => e.schoolId === sId) : list;
  }

  static saveSchoolEvent(event: SchoolEvent): void {
    const list = getStored<SchoolEvent[]>(STORAGE_KEYS.SCHOOL_EVENTS, INITIAL_EVENTS);
    const idx = list.findIndex(e => e.id === event.id);
    if (idx !== -1) {
      list[idx] = event;
    } else {
      list.unshift(event);
    }
    setStored(STORAGE_KEYS.SCHOOL_EVENTS, list);
  }

  static getTransportRoutes(schoolId?: string): TransportRoute[] {
    const list = getStored<TransportRoute[]>(STORAGE_KEYS.TRANSPORT_ROUTES, INITIAL_TRANSPORT_ROUTES);
    const sId = schoolId || this.getCurrentSchool()?.id;
    return sId ? list.filter(t => t.schoolId === sId) : list;
  }

  static getTransportRouteById(routeId: string): TransportRoute | undefined {
    const list = getStored<TransportRoute[]>(STORAGE_KEYS.TRANSPORT_ROUTES, INITIAL_TRANSPORT_ROUTES);
    return list.find(t => t.id === routeId);
  }

  static getTransportRouteByDriver(driverUserIdOrCode: string): TransportRoute | undefined {
    const clean = driverUserIdOrCode.trim().toUpperCase();
    const list = getStored<TransportRoute[]>(STORAGE_KEYS.TRANSPORT_ROUTES, INITIAL_TRANSPORT_ROUTES);
    return list.find(t => 
      (t.driverUserId && t.driverUserId.toUpperCase() === clean) ||
      (t.driverAccessCode && t.driverAccessCode.trim().toUpperCase() === clean) ||
      (t.driverPhone && t.driverPhone.replace(/[^0-9]/g, '') === clean.replace(/[^0-9]/g, ''))
    );
  }

  static saveTransportRoute(route: TransportRoute): void {
    const list = getStored<TransportRoute[]>(STORAGE_KEYS.TRANSPORT_ROUTES, INITIAL_TRANSPORT_ROUTES);
    const idx = list.findIndex(t => t.id === route.id);
    if (idx !== -1) {
      list[idx] = route;
    } else {
      list.unshift(route);
    }
    setStored(STORAGE_KEYS.TRANSPORT_ROUTES, list);
  }

  static toggleDriverTracking(
    routeId: string,
    isTrackingActive: boolean,
    tripStatus?: TransportRoute['tripStatus'],
    customLocation?: TransportRoute['currentLocation']
  ): TransportRoute | null {
    const list = getStored<TransportRoute[]>(STORAGE_KEYS.TRANSPORT_ROUTES, INITIAL_TRANSPORT_ROUTES);
    const idx = list.findIndex(t => t.id === routeId);
    if (idx === -1) return null;

    const route = list[idx];
    const newStatus = tripStatus || (isTrackingActive ? (route.tripStatus === 'IDLE' ? 'AFTERNOON_DROPOFF' : route.tripStatus) : 'IDLE');

    let updatedLoc = route.currentLocation;
    if (customLocation) {
      updatedLoc = customLocation;
    } else if (route.currentLocation) {
      updatedLoc = {
        ...route.currentLocation,
        speedKmH: isTrackingActive ? (route.currentLocation.speedKmH || 35) : 0,
        lastUpdated: new Date().toISOString()
      };
    }

    const updatedRoute: TransportRoute = {
      ...route,
      isTrackingActive,
      tripStatus: newStatus,
      currentLocation: updatedLoc
    };

    list[idx] = updatedRoute;
    setStored(STORAGE_KEYS.TRANSPORT_ROUTES, list);

    // Send notification to school community / parents
    if (isTrackingActive) {
      this.sendNotification({
        schoolId: route.schoolId,
        recipientUserId: 'ALL_PARENTS',
        senderName: route.driverName,
        title: `School Bus Live: ${route.routeName} 🚌`,
        message: `${route.driverName} has started live GPS tracking for ${route.vehicleNo} (${newStatus === 'MORNING_PICKUP' ? 'Morning Pickup' : 'Afternoon Drop-off'}). Track real-time progress on your portal.`,
        type: 'SYSTEM'
      });
    }

    return updatedRoute;
  }

  static updateDriverLocation(routeId: string, location: NonNullable<TransportRoute['currentLocation']>): TransportRoute | null {
    const list = getStored<TransportRoute[]>(STORAGE_KEYS.TRANSPORT_ROUTES, INITIAL_TRANSPORT_ROUTES);
    const idx = list.findIndex(t => t.id === routeId);
    if (idx === -1) return null;

    const history = list[idx].locationHistory || [];
    const newHistory = [
      { lat: location.lat, lng: location.lng, timestamp: location.lastUpdated, speedKmH: location.speedKmH },
      ...history.slice(0, 30)
    ];

    list[idx] = {
      ...list[idx],
      currentLocation: location,
      locationHistory: newHistory
    };

    setStored(STORAGE_KEYS.TRANSPORT_ROUTES, list);
    return list[idx];
  }

  static broadcastDriverAlert(
    routeId: string,
    alert: TransportRoute['activeAlert']
  ): TransportRoute | null {
    const list = getStored<TransportRoute[]>(STORAGE_KEYS.TRANSPORT_ROUTES, INITIAL_TRANSPORT_ROUTES);
    const idx = list.findIndex(t => t.id === routeId);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      activeAlert: alert
    };

    setStored(STORAGE_KEYS.TRANSPORT_ROUTES, list);

    if (alert) {
      this.sendNotification({
        schoolId: list[idx].schoolId,
        recipientUserId: 'ALL_PARENTS',
        senderName: list[idx].driverName,
        title: `Bus Transit Alert: ${list[idx].vehicleNo} ⚠️`,
        message: alert.message,
        type: 'SYSTEM'
      });
    }

    return list[idx];
  }

  static createDriverAccount(data: {
    routeName: string;
    vehicleNo: string;
    vehicleModel?: string;
    driverName: string;
    driverPhone: string;
    pickupLocations: string[];
    stops?: TransportStop[];
    assignedStudentIds: string[];
    capacity: number;
    driverAccessCode?: string;
    driverPin?: string;
    schoolId?: string;
  }): { route: TransportRoute; user: User } {
    const schoolId = data.schoolId || this.getCurrentSchool()?.id || 'school_apex';
    const driverAccessCode = (data.driverAccessCode && data.driverAccessCode.trim()) || `DRV-${Math.floor(1000 + Math.random() * 9000)}-BUS`;
    const driverUserId = 'usr_drv_' + Date.now();

    const initialStops: TransportStop[] = data.stops && data.stops.length > 0
      ? data.stops
      : data.pickupLocations.map((loc, i) => ({
          id: 'stp_' + Date.now() + '_' + i,
          name: loc,
          lat: 6.4281 + (i * 0.0085),
          lng: 3.4219 + (i * 0.025),
          estimatedTime: `${15 + Math.floor(i * 15 / 60)}:${((i * 15) % 60).toString().padStart(2, '0')}`,
          studentCount: i === 0 ? 0 : 1
        }));

    const newRoute: TransportRoute = {
      id: 'tr_' + Date.now(),
      schoolId,
      routeName: data.routeName,
      vehicleNo: data.vehicleNo.toUpperCase(),
      vehicleModel: data.vehicleModel || 'Standard School Shuttle Bus',
      driverName: data.driverName,
      driverPhone: data.driverPhone,
      driverUserId,
      driverAccessCode,
      driverPin: data.driverPin || '1234',
      driverPhotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
      capacity: data.capacity || 25,
      assignedStudentIds: data.assignedStudentIds || [],
      pickupLocations: data.pickupLocations,
      stops: initialStops,
      isTrackingActive: false,
      tripStatus: 'IDLE',
      currentLocation: {
        lat: initialStops[0]?.lat || 6.4281,
        lng: initialStops[0]?.lng || 3.4219,
        speedKmH: 0,
        heading: 0,
        lastUpdated: new Date().toISOString(),
        currentStopIndex: 0,
        addressDescription: 'Stationed at School Campus Bus Terminal',
        batteryLevel: 100
      },
      locationHistory: [],
      activeAlert: null
    };

    const newUser: User = {
      id: driverUserId,
      schoolId,
      name: data.driverName,
      email: `${driverAccessCode.toLowerCase().replace(/[^a-z0-9]/g, '')}@driver.texora.edu`,
      role: 'DRIVER',
      phone: data.driverPhone,
      assignedClassIds: [],
      assignedSubjects: [],
      active: true,
      createdAt: new Date().toISOString()
    };

    // Save route
    const routes = getStored<TransportRoute[]>(STORAGE_KEYS.TRANSPORT_ROUTES, INITIAL_TRANSPORT_ROUTES);
    routes.unshift(newRoute);
    setStored(STORAGE_KEYS.TRANSPORT_ROUTES, routes);

    // Save user
    const users = this.getUsers();
    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);

    const currentUser = this.getCurrentUser();
    this.addAuditLog({
      schoolId,
      userId: currentUser?.id || 'proprietor',
      userName: currentUser?.name || 'Proprietor',
      userRole: currentUser?.role || 'PROPRIETOR',
      action: 'Created Driver Account & Bus Route',
      module: 'SETTINGS',
      details: `Created Driver Account for ${data.driverName} (${data.vehicleNo}) with Access Code: ${driverAccessCode}`
    });

    return { route: newRoute, user: newUser };
  }

  static deleteDriverAccount(routeId: string): void {
    let routes = getStored<TransportRoute[]>(STORAGE_KEYS.TRANSPORT_ROUTES, INITIAL_TRANSPORT_ROUTES);
    const target = routes.find(r => r.id === routeId);
    if (!target) return;

    routes = routes.filter(r => r.id !== routeId);
    setStored(STORAGE_KEYS.TRANSPORT_ROUTES, routes);

    if (target.driverUserId) {
      let users = this.getUsers();
      users = users.filter(u => u.id !== target.driverUserId);
      setStored(STORAGE_KEYS.USERS, users);
    }

    const currentUser = this.getCurrentUser();
    this.addAuditLog({
      schoolId: target.schoolId,
      userId: currentUser?.id || 'proprietor',
      userName: currentUser?.name || 'Proprietor',
      userRole: currentUser?.role || 'PROPRIETOR',
      action: 'Deleted Driver Account & Bus Route',
      module: 'SETTINGS',
      details: `Deleted Driver ${target.driverName} (${target.vehicleNo} - ${target.routeName})`
    });
  }

  static loginAsDriverWithCode(driverCode: string, pin?: string): { user: User; route: TransportRoute } | null {
    const codeClean = driverCode.trim().toUpperCase();
    const routes = getStored<TransportRoute[]>(STORAGE_KEYS.TRANSPORT_ROUTES, INITIAL_TRANSPORT_ROUTES);
    const foundRoute = routes.find(r => 
      (r.driverAccessCode && r.driverAccessCode.trim().toUpperCase() === codeClean) ||
      (r.id.toUpperCase() === codeClean)
    );

    if (!foundRoute) {
      return null;
    }

    if (pin && foundRoute.driverPin && foundRoute.driverPin.trim() !== pin.trim()) {
      return null;
    }

    const users = this.getUsers();
    let driverUser = users.find(u => 
      (foundRoute.driverUserId && u.id === foundRoute.driverUserId) ||
      (u.role === 'DRIVER' && u.name.toLowerCase() === foundRoute.driverName.toLowerCase()) ||
      (u.email.toLowerCase().includes(codeClean.toLowerCase().replace(/[^a-z0-9]/g, '')))
    );

    if (!driverUser) {
      driverUser = {
        id: foundRoute.driverUserId || 'usr_drv_' + Date.now(),
        schoolId: foundRoute.schoolId || 'school_apex',
        name: foundRoute.driverName,
        email: `${codeClean.toLowerCase().replace(/[^a-z0-9]/g, '')}@driver.texora.edu`,
        role: 'DRIVER',
        phone: foundRoute.driverPhone,
        assignedClassIds: [],
        assignedSubjects: [],
        active: true,
        createdAt: new Date().toISOString()
      };
      users.push(driverUser);
      setStored(STORAGE_KEYS.USERS, users);
    }

    this.setCurrentUserId(driverUser.id);
    this.setCurrentSchoolId(driverUser.schoolId);

    return { user: driverUser, route: foundRoute };
  }

  // PART 1: Staff Attendance & Geofence Settings
  static getAttendanceSettings(schoolId?: string): AttendanceSettings {
    const sId = schoolId || this.getCurrentSchool()?.id || 'school_apex';
    const settings = getStored<AttendanceSettings>(STORAGE_KEYS.ATTENDANCE_SETTINGS, INITIAL_ATTENDANCE_SETTINGS);
    return { ...settings, schoolId: sId };
  }

  static saveAttendanceSettings(settings: AttendanceSettings): void {
    setStored(STORAGE_KEYS.ATTENDANCE_SETTINGS, settings);
    const user = this.getCurrentUser();
    this.addAuditLog({
      schoolId: settings.schoolId || 'school_apex',
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      userRole: user?.role || 'PROPRIETOR',
      action: 'Updated Geofence Attendance Settings',
      module: 'SETTINGS',
      details: `Latitude: ${settings.schoolLatitude}, Longitude: ${settings.schoolLongitude}, Radius: ${settings.allowedRadiusMeters}m, Hours: ${settings.startTime} - ${settings.closingTime}`
    });
  }

  static getStaffAttendanceRecords(schoolId?: string): StaffAttendanceRecord[] {
    const list = getStored<StaffAttendanceRecord[]>(STORAGE_KEYS.STAFF_ATTENDANCE, INITIAL_STAFF_ATTENDANCE);
    const sId = schoolId || this.getCurrentSchool()?.id;
    return sId ? list.filter(a => a.schoolId === sId) : list;
  }

  static recordStaffSignIn(recordData: Partial<StaffAttendanceRecord>): StaffAttendanceRecord {
    const list = getStored<StaffAttendanceRecord[]>(STORAGE_KEYS.STAFF_ATTENDANCE, INITIAL_STAFF_ATTENDANCE);
    const school = this.getCurrentSchool();

    const record: StaffAttendanceRecord = {
      id: 'stf_att_' + Date.now(),
      schoolId: recordData.schoolId || school?.id || 'school_apex',
      staffId: recordData.staffId || '',
      staffName: recordData.staffName || '',
      staffEmail: recordData.staffEmail || '',
      role: recordData.role || 'TEACHER',
      department: recordData.department || 'Academic',
      date: recordData.date || new Date().toISOString().split('T')[0],
      signInTime: recordData.signInTime || new Date().toISOString(),
      signInLat: recordData.signInLat || 0,
      signInLng: recordData.signInLng || 0,
      signInDistanceMeters: recordData.signInDistanceMeters || 0,
      signInStatus: recordData.signInStatus || 'ON_TIME',
      deviceInfo: recordData.deviceInfo || 'Standard Browser GPS',
      flaggedSuspicious: recordData.flaggedSuspicious || false,
      suspiciousReason: recordData.suspiciousReason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list.unshift(record);
    setStored(STORAGE_KEYS.STAFF_ATTENDANCE, list);

    const user = this.getCurrentUser();
    this.addAuditLog({
      schoolId: record.schoolId,
      userId: record.staffId || user?.id || 'system',
      userName: record.staffName || user?.name || 'Staff',
      userRole: record.role,
      action: `Staff Signed In (${record.signInStatus})`,
      module: 'USER_MANAGEMENT',
      details: `${record.staffName} signed in at ${new Date(record.signInTime).toLocaleTimeString()} (${Math.round(record.signInDistanceMeters)}m from school perimeter)`
    });

    return record;
  }

  static recordStaffSignOut(staffId: string, signOutData: Partial<StaffAttendanceRecord>): StaffAttendanceRecord | null {
    const list = getStored<StaffAttendanceRecord[]>(STORAGE_KEYS.STAFF_ATTENDANCE, INITIAL_STAFF_ATTENDANCE);
    const todayStr = new Date().toISOString().split('T')[0];

    const idx = list.findIndex(a => a.staffId === staffId && a.date === todayStr);
    if (idx === -1) return null;

    const existing = list[idx];
    const signOutTime = signOutData.signOutTime || new Date().toISOString();
    const signInMs = new Date(existing.signInTime).getTime();
    const signOutMs = new Date(signOutTime).getTime();
    const hoursWorked = Math.max(0, parseFloat(((signOutMs - signInMs) / (1000 * 60 * 60)).toFixed(1)));

    const updated: StaffAttendanceRecord = {
      ...existing,
      signOutTime,
      signOutLat: signOutData.signOutLat || existing.signInLat,
      signOutLng: signOutData.signOutLng || existing.signInLng,
      signOutDistanceMeters: signOutData.signOutDistanceMeters || existing.signInDistanceMeters,
      signOutStatus: signOutData.signOutStatus || 'NORMAL',
      totalHoursWorked: hoursWorked,
      updatedAt: new Date().toISOString()
    };

    list[idx] = updated;
    setStored(STORAGE_KEYS.STAFF_ATTENDANCE, list);

    const user = this.getCurrentUser();
    this.addAuditLog({
      schoolId: updated.schoolId,
      userId: updated.staffId || user?.id || 'system',
      userName: updated.staffName || user?.name || 'Staff',
      userRole: updated.role,
      action: `Staff Signed Out (${updated.signOutStatus})`,
      module: 'USER_MANAGEMENT',
      details: `${updated.staffName} signed out at ${new Date(signOutTime).toLocaleTimeString()} (Worked ${hoursWorked} hours)`
    });

    return updated;
  }

  static overrideStaffAttendance(recordId: string, updates: Partial<StaffAttendanceRecord>, modifiedBy: string, reason: string): void {
    const list = getStored<StaffAttendanceRecord[]>(STORAGE_KEYS.STAFF_ATTENDANCE, INITIAL_STAFF_ATTENDANCE);
    const idx = list.findIndex(a => a.id === recordId);
    if (idx === -1) return;

    const original = list[idx];
    const updated: StaffAttendanceRecord = {
      ...original,
      ...updates,
      modifiedBy,
      modificationReason: reason,
      originalRecord: {
        signInTime: original.signInTime,
        signOutTime: original.signOutTime,
        signInStatus: original.signInStatus,
        signOutStatus: original.signOutStatus
      },
      updatedAt: new Date().toISOString()
    };

    list[idx] = updated;
    setStored(STORAGE_KEYS.STAFF_ATTENDANCE, list);

    const user = this.getCurrentUser();
    this.addAuditLog({
      schoolId: original.schoolId,
      userId: user?.id || 'system',
      userName: modifiedBy || user?.name || 'Proprietor',
      userRole: 'PROPRIETOR',
      action: 'Manual Attendance Override by Proprietor',
      module: 'USER_MANAGEMENT',
      details: `Modified record for ${original.staffName} on ${original.date}. Reason: ${reason}`
    });
  }

  // PART 2: Staff Salary & Payroll Management
  static getSalaryProfiles(schoolId?: string): SalaryProfile[] {
    const list = getStored<SalaryProfile[]>(STORAGE_KEYS.SALARY_PROFILES, INITIAL_SALARY_PROFILES);
    const sId = schoolId || this.getCurrentSchool()?.id;
    return sId ? list.filter(s => s.schoolId === sId) : list;
  }

  static saveSalaryProfile(profile: SalaryProfile): void {
    const list = getStored<SalaryProfile[]>(STORAGE_KEYS.SALARY_PROFILES, INITIAL_SALARY_PROFILES);
    const idx = list.findIndex(s => s.id === profile.id || s.staffId === profile.staffId);
    if (idx !== -1) {
      list[idx] = profile;
    } else {
      list.unshift(profile);
    }
    setStored(STORAGE_KEYS.SALARY_PROFILES, list);

    const user = this.getCurrentUser();
    this.addAuditLog({
      schoolId: profile.schoolId,
      userId: user?.id || 'system',
      userName: user?.name || 'Proprietor',
      userRole: user?.role || 'PROPRIETOR',
      action: 'Updated Staff Salary Profile',
      module: 'SETTINGS',
      details: `Set base salary for ${profile.staffName} (${profile.role}) to ₦${profile.baseSalary.toLocaleString()}`
    });
  }

  static getDeductionRules(schoolId?: string): DeductionRule[] {
    const list = getStored<DeductionRule[]>(STORAGE_KEYS.DEDUCTION_RULES, INITIAL_DEDUCTION_RULES);
    const sId = schoolId || this.getCurrentSchool()?.id;
    return sId ? list.filter(d => d.schoolId === sId) : list;
  }

  static saveDeductionRule(rule: DeductionRule): void {
    const list = getStored<DeductionRule[]>(STORAGE_KEYS.DEDUCTION_RULES, INITIAL_DEDUCTION_RULES);
    const idx = list.findIndex(d => d.id === rule.id);
    if (idx !== -1) {
      list[idx] = rule;
    } else {
      list.unshift(rule);
    }
    setStored(STORAGE_KEYS.DEDUCTION_RULES, list);

    const user = this.getCurrentUser();
    this.addAuditLog({
      schoolId: rule.schoolId,
      userId: user?.id || 'system',
      userName: user?.name || 'Proprietor',
      userRole: user?.role || 'PROPRIETOR',
      action: 'Configured Salary Deduction Rule',
      module: 'SETTINGS',
      details: `Rule: ${rule.name} (${rule.deductionType === 'FIXED' ? '₦' + rule.value : rule.value + '%'})`
    });
  }

  static getPayrollRecords(schoolId?: string): PayrollRecord[] {
    const list = getStored<PayrollRecord[]>(STORAGE_KEYS.PAYROLL_RECORDS, INITIAL_PAYROLL_RECORDS);
    const sId = schoolId || this.getCurrentSchool()?.id;
    return sId ? list.filter(p => p.schoolId === sId) : list;
  }

  static savePayrollRecord(payroll: PayrollRecord): void {
    const list = getStored<PayrollRecord[]>(STORAGE_KEYS.PAYROLL_RECORDS, INITIAL_PAYROLL_RECORDS);
    const idx = list.findIndex(p => p.id === payroll.id);
    if (idx !== -1) {
      list[idx] = payroll;
    } else {
      list.unshift(payroll);
    }
    setStored(STORAGE_KEYS.PAYROLL_RECORDS, list);

    const user = this.getCurrentUser();
    this.addAuditLog({
      schoolId: payroll.schoolId,
      userId: user?.id || 'system',
      userName: user?.name || 'Proprietor',
      userRole: user?.role || 'PROPRIETOR',
      action: `Generated Payroll (${payroll.periodName})`,
      module: 'SETTINGS',
      details: `Net Payroll: ₦${payroll.netPayroll.toLocaleString()} across ${payroll.staffPayrollItems.length} staff members`
    });
  }

  static updatePayrollStatus(payrollId: string, status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PAID', approvedBy?: string): void {
    const list = getStored<PayrollRecord[]>(STORAGE_KEYS.PAYROLL_RECORDS, INITIAL_PAYROLL_RECORDS);
    const idx = list.findIndex(p => p.id === payrollId);
    if (idx === -1) return;

    list[idx].status = status;
    if (approvedBy) {
      list[idx].approvedBy = approvedBy;
      list[idx].approvedAt = new Date().toISOString();
      list[idx].locked = true;
    }
    if (status === 'PAID') {
      list[idx].staffPayrollItems.forEach(item => {
        item.paymentStatus = 'PAID';
        item.paymentDate = new Date().toISOString();
      });
    }

    setStored(STORAGE_KEYS.PAYROLL_RECORDS, list);

    const user = this.getCurrentUser();
    this.addAuditLog({
      schoolId: list[idx].schoolId,
      userId: user?.id || 'system',
      userName: approvedBy || user?.name || 'Proprietor',
      userRole: 'PROPRIETOR',
      action: `Updated Payroll Status to ${status}`,
      module: 'SETTINGS',
      details: `Payroll Period: ${list[idx].periodName}, Status: ${status}${approvedBy ? ' by ' + approvedBy : ''}`
    });
  }

  // PART 3, 4, 5: Student Accounts, CBT & Class Chat
  static getStudentCredentials(schoolId?: string): StudentAccountCredentials[] {
    return getStored<StudentAccountCredentials[]>(STORAGE_KEYS.STUDENT_CREDENTIALS, INITIAL_STUDENT_CREDENTIALS);
  }

  static createStudentAccount(studentId: string, studentName: string, classId: string, className: string, createdByTeacherName: string): StudentAccountCredentials {
    const list = getStored<StudentAccountCredentials[]>(STORAGE_KEYS.STUDENT_CREDENTIALS, INITIAL_STUDENT_CREDENTIALS);
    const existing = list.find(s => s.studentId === studentId);
    if (existing) return existing;

    const classPrefix = className.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const studentCode = `TXR-${classPrefix}-${randomNum}`;
    const accessPin = Math.floor(1000 + Math.random() * 9000).toString();

    const credential: StudentAccountCredentials = {
      studentId,
      studentName,
      classId,
      className,
      studentCode,
      accessPin,
      activationStatus: 'ACTIVE',
      activatedAt: new Date().toISOString(),
      createdByTeacherName,
      chatMuted: false
    };

    list.unshift(credential);
    setStored(STORAGE_KEYS.STUDENT_CREDENTIALS, list);

    // Also register user account for login
    const users = this.getUsers();
    if (!users.some(u => u.id === 'usr_student_' + studentId)) {
      users.push({
        id: 'usr_student_' + studentId,
        schoolId: this.getCurrentSchool()?.id || 'school_apex',
        name: studentName,
        email: `${studentCode.toLowerCase()}@student.texora.edu`,
        role: 'STUDENT',
        assignedClassIds: [classId],
        assignedSubjects: [],
        active: true,
        createdAt: new Date().toISOString()
      });
      setStored(STORAGE_KEYS.USERS, users);
    }

    const user = this.getCurrentUser();
    this.addAuditLog({
      schoolId: this.getCurrentSchool()?.id || 'school_apex',
      userId: user?.id || 'system',
      userName: createdByTeacherName || user?.name || 'Teacher',
      userRole: user?.role || 'TEACHER',
      action: 'Created Student Account & Credentials',
      module: 'USER_MANAGEMENT',
      details: `Created login for ${studentName} (${className}). Student Code: ${studentCode}`
    });

    return credential;
  }

  static loginAsStudentWithCode(studentCode: string, pin?: string): User | null {
    const codeClean = studentCode.trim().toUpperCase();
    const creds = getStored<StudentAccountCredentials[]>(STORAGE_KEYS.STUDENT_CREDENTIALS, INITIAL_STUDENT_CREDENTIALS);
    const foundCred = creds.find(c => c.studentCode.trim().toUpperCase() === codeClean);

    const users = this.getUsers();

    if (!foundCred) {
      // Check if user exists by email prefix, student user id or student code
      const studentUser = users.find(u => u.role === 'STUDENT' && (
        u.email.toLowerCase().includes(studentCode.trim().toLowerCase()) ||
        u.name.toLowerCase().includes(studentCode.trim().toLowerCase()) ||
        u.id.toLowerCase().includes(studentCode.trim().toLowerCase())
      ));
      if (studentUser) {
        this.setCurrentUserId(studentUser.id);
        this.setCurrentSchoolId(studentUser.schoolId);
        return studentUser;
      }
      return null;
    }

    if (pin && foundCred.accessPin && foundCred.accessPin.trim() !== pin.trim()) {
      return null; // Invalid PIN
    }

    let studentUser = users.find(u => u.id === 'usr_student_' + foundCred.studentId || u.email.toLowerCase().startsWith(foundCred.studentCode.toLowerCase()));

    if (!studentUser) {
      studentUser = {
        id: 'usr_student_' + foundCred.studentId,
        schoolId: this.getCurrentSchool()?.id || 'school_apex',
        name: foundCred.studentName,
        email: `${foundCred.studentCode.toLowerCase()}@student.texora.edu`,
        role: 'STUDENT',
        assignedClassIds: [foundCred.classId],
        assignedSubjects: [],
        active: true,
        createdAt: new Date().toISOString()
      };
      users.push(studentUser);
      setStored(STORAGE_KEYS.USERS, users);
    }

    this.setCurrentUserId(studentUser.id);
    this.setCurrentSchoolId(studentUser.schoolId);

    return studentUser;
  }

  static getClassChatMessages(schoolId?: string, classId?: string): ClassChatMessage[] {
    const list = getStored<ClassChatMessage[]>(STORAGE_KEYS.CLASS_CHAT_MESSAGES, INITIAL_CLASS_CHAT_MESSAGES);
    const sId = schoolId || this.getCurrentSchool()?.id;
    let filtered = sId ? list.filter(m => m.schoolId === sId) : list;
    if (classId) {
      filtered = filtered.filter(m => m.classId === classId);
    }
    return filtered;
  }

  static addClassChatMessage(msg: ClassChatMessage): void {
    const list = getStored<ClassChatMessage[]>(STORAGE_KEYS.CLASS_CHAT_MESSAGES, INITIAL_CLASS_CHAT_MESSAGES);
    list.push(msg);
    setStored(STORAGE_KEYS.CLASS_CHAT_MESSAGES, list);
  }

  static deleteClassChatMessage(messageId: string, moderatorName: string, reason: string): void {
    let list = getStored<ClassChatMessage[]>(STORAGE_KEYS.CLASS_CHAT_MESSAGES, INITIAL_CLASS_CHAT_MESSAGES);
    const msg = list.find(m => m.id === messageId);
    list = list.filter(m => m.id !== messageId);
    setStored(STORAGE_KEYS.CLASS_CHAT_MESSAGES, list);

    if (msg) {
      const user = this.getCurrentUser();
      this.addAuditLog({
        schoolId: msg.schoolId,
        userId: user?.id || 'system',
        userName: moderatorName || user?.name || 'Moderator',
        userRole: user?.role || 'SCHOOL_ADMIN',
        action: 'Moderated Student Class Chat (Deleted Message)',
        module: 'USER_MANAGEMENT',
        details: `Deleted message by ${msg.senderName} in ${msg.className}. Reason: ${reason} (Moderated by ${moderatorName})`
      });
    }
  }

  static hideClassChatMessage(messageId: string, moderatorName: string, reason: string): void {
    const list = getStored<ClassChatMessage[]>(STORAGE_KEYS.CLASS_CHAT_MESSAGES, INITIAL_CLASS_CHAT_MESSAGES);
    const idx = list.findIndex(m => m.id === messageId);
    if (idx !== -1) {
      list[idx].hidden = true;
      list[idx].hiddenBy = moderatorName;
      list[idx].hiddenReason = reason;
      setStored(STORAGE_KEYS.CLASS_CHAT_MESSAGES, list);

      const user = this.getCurrentUser();
      this.addAuditLog({
        schoolId: list[idx].schoolId,
        userId: user?.id || 'system',
        userName: moderatorName || user?.name || 'Moderator',
        userRole: user?.role || 'SCHOOL_ADMIN',
        action: 'Moderated Student Class Chat (Hidden Message)',
        module: 'USER_MANAGEMENT',
        details: `Hidden message by ${list[idx].senderName} in ${list[idx].className}. Reason: ${reason}`
      });
    }
  }

  static muteStudentInChat(studentId: string, moderatorName: string, reason: string): void {
    const creds = getStored<StudentAccountCredentials[]>(STORAGE_KEYS.STUDENT_CREDENTIALS, INITIAL_STUDENT_CREDENTIALS);
    const idx = creds.findIndex(c => c.studentId === studentId);
    if (idx !== -1) {
      creds[idx].chatMuted = !creds[idx].chatMuted;
      creds[idx].chatMutedReason = reason;
      setStored(STORAGE_KEYS.STUDENT_CREDENTIALS, creds);

      const user = this.getCurrentUser();
      this.addAuditLog({
        schoolId: this.getCurrentSchool()?.id || 'school_apex',
        userId: user?.id || 'system',
        userName: moderatorName || user?.name || 'Moderator',
        userRole: user?.role || 'SCHOOL_ADMIN',
        action: `Chat Privileges Updated for Student (${creds[idx].chatMuted ? 'Muted' : 'Unmuted'})`,
        module: 'USER_MANAGEMENT',
        details: `Student: ${creds[idx].studentName}. Moderator: ${moderatorName}. Reason: ${reason}`
      });
    }
  }

  static getChatModerationLogs(schoolId?: string): ChatModerationLog[] {
    const list = getStored<ChatModerationLog[]>(STORAGE_KEYS.CHAT_MODERATION_LOGS, INITIAL_CHAT_MODERATION_LOGS);
    const sId = schoolId || this.getCurrentSchool()?.id;
    return sId ? list.filter(m => m.schoolId === sId) : list;
  }
}

// React custom hook for auto-syncing state on changes with Supabase live fetch
export function useAppStore() {
  const [version, setVersion] = useState(0);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(isSupabaseConfigured());

  useEffect(() => {
    AppStorage.initDefaults();

    const handleStorageChange = () => {
      setVersion(v => v + 1);
    };

    window.addEventListener('texora_storage_change', handleStorageChange);

    // If Supabase is configured, fetch live remote data into local state cache
    if (isSupabaseConfigured()) {
      Promise.all([
        SupabaseService.getSchools(),
        SupabaseService.getUsers(),
        SupabaseService.getClasses(),
        SupabaseService.getStudents(),
        SupabaseService.getSubmissions(),
        SupabaseService.getAttendanceRecords(),
        SupabaseService.getNotifications('ALL_ADMINS')
      ]).then(([dbSchools, dbUsers, dbClasses, dbStudents, dbSubmissions, dbAttendance, dbNotifications]) => {
        if (dbSchools.length > 0) setStored(STORAGE_KEYS.SCHOOLS, dbSchools);
        if (dbUsers.length > 0) setStored(STORAGE_KEYS.USERS, dbUsers);
        if (dbClasses.length > 0) setStored(STORAGE_KEYS.CLASSES, dbClasses);
        if (dbStudents.length > 0) setStored(STORAGE_KEYS.STUDENTS, dbStudents);
        if (dbSubmissions.length > 0) setStored(STORAGE_KEYS.SUBMISSIONS, dbSubmissions);
        if (dbAttendance.length > 0) setStored(STORAGE_KEYS.ATTENDANCE, dbAttendance);
        if (dbNotifications.length > 0) setStored(STORAGE_KEYS.NOTIFICATIONS, dbNotifications);
        setIsLoadingSupabase(false);
      }).catch(err => {
        console.warn('Supabase fetch error, using local state:', err);
        setIsLoadingSupabase(false);
      });

      // Listen for auth state changes if Supabase Auth is active
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user?.email) {
          const users = AppStorage.getUsers();
          const matchedUser = users.find(u => u.email.toLowerCase() === session.user.email?.toLowerCase());
          if (matchedUser) {
            AppStorage.setCurrentUserId(matchedUser.id);
          }
        }
      });

      return () => {
        window.removeEventListener('texora_storage_change', handleStorageChange);
        authListener.subscription.unsubscribe();
      };
    }

    return () => window.removeEventListener('texora_storage_change', handleStorageChange);
  }, []);

  const storeData = useMemo(() => {
    const school = AppStorage.getCurrentSchool();
    const currentUser = AppStorage.getCurrentUser();
    const users = AppStorage.getUsers(school?.id);
    const classes = AppStorage.getClasses(school?.id);
    const students = AppStorage.getStudents(school?.id);
    const submissions = AppStorage.getSubmissions(school?.id);
    const attendance = AppStorage.getAttendanceRecords(school?.id);
    const scoreSheets = AppStorage.getScoreSheets(school?.id);
    const homework = AppStorage.getHomework(school?.id);
    const classTimetables = AppStorage.getClassTimetables(school?.id);
    const examTimetables = AppStorage.getExamTimetables(school?.id);
    const auditLogs = AppStorage.getAuditLogs(school?.id);
    const notifications = currentUser ? AppStorage.getNotifications(currentUser.id) : [];
    const chatRooms = AppStorage.getChatRooms(school?.id);
    const chatMessages = AppStorage.getChatMessages();
    const publicChatMessages = AppStorage.getPublicChatMessages(school?.id);
    const examSets = AppStorage.getExamSets(school?.id);
    const curricula = AppStorage.getCurricula(school?.id);
    const cbtExams = AppStorage.getCBTExams(school?.id);
    const cbtAttempts = AppStorage.getCBTAttempts(school?.id);
    const studentRiskProfiles = AppStorage.getStudentRiskProfiles(school?.id);
    const remedialPackages = AppStorage.getRemedialPackages(school?.id);
    const schoolDocuments = AppStorage.getSchoolDocuments(school?.id);
    const financialRecords = AppStorage.getFinancialRecords(school?.id);
    const schoolEvents = AppStorage.getSchoolEvents(school?.id);
    const transportRoutes = AppStorage.getTransportRoutes(school?.id);
    const attendanceSettings = AppStorage.getAttendanceSettings(school?.id);
    const staffAttendance = AppStorage.getStaffAttendanceRecords(school?.id);
    const salaryProfiles = AppStorage.getSalaryProfiles(school?.id);
    const deductionRules = AppStorage.getDeductionRules(school?.id);
    const payrollRecords = AppStorage.getPayrollRecords(school?.id);
    const studentCredentials = AppStorage.getStudentCredentials(school?.id);
    const classChatMessages = AppStorage.getClassChatMessages(school?.id);
    const chatModerationLogs = AppStorage.getChatModerationLogs(school?.id);
    const paymentTransactions = AppStorage.getPaymentTransactions(school?.id);

    return {
      school,
      currentUser,
      users,
      classes,
      students,
      submissions,
      attendance,
      scoreSheets,
      homework,
      classTimetables,
      examTimetables,
      auditLogs,
      notifications,
      chatRooms,
      chatMessages,
      publicChatMessages,
      examSets,
      curricula,
      cbtExams,
      cbtAttempts,
      studentRiskProfiles,
      remedialPackages,
      schoolDocuments,
      financialRecords,
      schoolEvents,
      transportRoutes,
      attendanceSettings,
      staffAttendance,
      salaryProfiles,
      deductionRules,
      payrollRecords,
      studentCredentials,
      classChatMessages,
      chatModerationLogs,
      paymentTransactions,
      schools: AppStorage.getSchools(),
    };
  }, [version]);

  return {
    version,
    isLoadingSupabase,
    isSupabaseActive: isSupabaseConfigured(),
    ...storeData,
    actions: AppStorage
  };
}
