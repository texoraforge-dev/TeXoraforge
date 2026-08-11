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
  ExamQuestion
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
  DEFAULT_SCHOOL_SUBJECTS
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
    if (!schoolId) return classes;
    return classes.filter(c => c.schoolId === schoolId);
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
    const cls: SchoolClass = { ...newClass, id: 'cls_' + Date.now() };
    classes.push(cls);
    setStored(STORAGE_KEYS.CLASSES, classes);

    if (isSupabaseConfigured()) {
      SupabaseService.upsertClass(cls).catch(console.error);
    }

    return cls;
  }

  static createStudent(student: Omit<Student, 'id'>) {
    const students = this.getStudents();
    const newStd: Student = { ...student, id: 'std_' + Date.now() };
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
        details: `Admitted student ${newStd.fullName} (Admission No: ${newStd.admissionNo}).`
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
  static updateStudent(studentId: string, updates: Partial<Student>) {
    const students = getStored<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const idx = students.findIndex(s => s.id === studentId);
    if (idx !== -1) {
      students[idx] = { ...students[idx], ...updates };
      setStored(STORAGE_KEYS.STUDENTS, students);
      if (isSupabaseConfigured()) {
        SupabaseService.upsertStudent(students[idx]).catch(console.error);
      }
    }
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

    const updatedStudent: Student = {
      ...student,
      classId: status === 'REPEATED' ? student.classId : targetClassId,
      promotionStatus: status,
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

  static deleteStudent(studentId: string) {
    let students = getStored<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    students = students.filter(s => s.id !== studentId);
    setStored(STORAGE_KEYS.STUDENTS, students);
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
