/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, UserRole, AdminPermission } from '../types';

export const ALL_PERMISSIONS: { key: AdminPermission; label: string; description: string; module: string }[] = [
  // Student & Admissions
  { key: 'ADMISSIONS', label: 'Student Admissions', description: 'Register and admit new students to the school', module: 'Admissions' },
  { key: 'STUDENT_MANAGEMENT', label: 'Student Profile Management', description: 'Edit student profiles and toggle active status', module: 'Admissions' },
  { key: 'STUDENT_RECORDS', label: 'Student Records Access', description: 'View student information and academic profiles', module: 'Admissions' },
  { key: 'GUARDIAN_MANAGEMENT', label: 'Guardian Information', description: 'View and manage guardian and parent contacts', module: 'Admissions' },
  { key: 'CLASS_ASSIGNMENT', label: 'Class Assignment & Transfers', description: 'Assign students to classes and handle transfers', module: 'Admissions' },
  { key: 'STUDENT_PROMOTION', label: 'Student Class Promotion', description: 'Promote students to next class level at session end', module: 'Admissions' },

  // Academic Administration
  { key: 'LESSON_NOTE_REVIEW', label: 'Lesson Note Review & Approval', description: 'Review, approve, reject or request edits on lesson notes', module: 'Academic Admin' },
  { key: 'LESSON_PLAN_REVIEW', label: 'Lesson Plan Review & Approval', description: 'Review and approve teacher lesson plans', module: 'Academic Admin' },
  { key: 'WEEKLY_DIARY_REVIEW', label: 'Weekly Teaching Diary Review', description: 'Monitor weekly teaching diaries submitted by teachers', module: 'Academic Admin' },
  { key: 'EXAM_ADMINISTRATION', label: 'Exam Timetables & Schedules', description: 'Manage class and examination timetables', module: 'Academic Admin' },
  { key: 'ACADEMIC_REVIEW', label: 'Score Approvals & Report Cards', description: 'Review and approve continuous assessment scores and report cards', module: 'Academic Admin' },

  // System & Management
  { key: 'USER_ROLE_MANAGEMENT', label: 'User & Permission Management', description: 'Create and manage VP, School Admin, and Teacher accounts', module: 'System & Admin' },
  { key: 'SYSTEM_SETTINGS', label: 'School Settings & Subjects', description: 'Manage school details, motto, logo, session, term, and subjects', module: 'System & Admin' },
  { key: 'PROPRIETOR_MANAGEMENT', label: 'Full Executive Oversight', description: 'Highest level administrative control and management', module: 'System & Admin' },
  { key: 'AUDIT_LOG_VIEW', label: 'View Activity Audit Logs', description: 'Monitor all administrative actions performed across the school', module: 'System & Admin' },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, AdminPermission[]> = {
  PROPRIETOR: [
    'ADMISSIONS',
    'STUDENT_MANAGEMENT',
    'STUDENT_RECORDS',
    'GUARDIAN_MANAGEMENT',
    'CLASS_ASSIGNMENT',
    'STUDENT_PROMOTION',
    'LESSON_NOTE_REVIEW',
    'LESSON_PLAN_REVIEW',
    'WEEKLY_DIARY_REVIEW',
    'EXAM_ADMINISTRATION',
    'ACADEMIC_REVIEW',
    'USER_ROLE_MANAGEMENT',
    'SYSTEM_SETTINGS',
    'PROPRIETOR_MANAGEMENT',
    'AUDIT_LOG_VIEW'
  ],
  VICE_PRINCIPAL: [
    'ADMISSIONS',
    'STUDENT_MANAGEMENT',
    'STUDENT_RECORDS',
    'GUARDIAN_MANAGEMENT',
    'CLASS_ASSIGNMENT',
    'STUDENT_PROMOTION',
    'AUDIT_LOG_VIEW'
  ],
  SCHOOL_ADMIN: [
    'LESSON_NOTE_REVIEW',
    'LESSON_PLAN_REVIEW',
    'WEEKLY_DIARY_REVIEW',
    'EXAM_ADMINISTRATION',
    'ACADEMIC_REVIEW'
  ],
  TEACHER: [],
  PARENT: []
};

/**
 * Checks if a user has a specific permission.
 * Proprietors always have all permissions.
 */
export function hasPermission(user: User | null | undefined, permission: AdminPermission): boolean {
  if (!user) return false;
  if (user.role === 'PROPRIETOR') return true;

  const userPermissions = user.permissions ?? DEFAULT_ROLE_PERMISSIONS[user.role] ?? [];
  return userPermissions.includes(permission);
}

/**
 * Determines if a user can access a given navigation view / module.
 */
export function canAccessView(user: User | null | undefined, view: string): boolean {
  if (!user) return false;
  if (user.role === 'PROPRIETOR') return true;

  switch (view) {
    case 'dashboard':
      return true;
    case 'school_students':
    case 'students':
      return hasPermission(user, 'ADMISSIONS') || hasPermission(user, 'STUDENT_RECORDS');
    case 'teachers':
      return user.role === 'SCHOOL_ADMIN' || hasPermission(user, 'USER_ROLE_MANAGEMENT');
    case 'classes':
      return hasPermission(user, 'CLASS_ASSIGNMENT') || hasPermission(user, 'STUDENT_MANAGEMENT') || user.role === 'SCHOOL_ADMIN';
    case 'timetable':
      return true; // Timetables visible to staff/teachers/students/parents
    case 'scores':
      return hasPermission(user, 'ACADEMIC_REVIEW') || user.role === 'TEACHER' || user.role === 'PARENT';
    case 'submissions':
      return hasPermission(user, 'LESSON_NOTE_REVIEW') || hasPermission(user, 'LESSON_PLAN_REVIEW');
    case 'exam_questions':
      return user.role === 'TEACHER' || user.role === 'SCHOOL_ADMIN' || user.role === 'VICE_PRINCIPAL' || hasPermission(user, 'EXAM_ADMINISTRATION');
    case 'attendance':
      return true;
    case 'settings':
      return hasPermission(user, 'SYSTEM_SETTINGS');
    case 'audit_logs':
      return hasPermission(user, 'AUDIT_LOG_VIEW');
    case 'user_permissions':
      return hasPermission(user, 'USER_ROLE_MANAGEMENT');
    default:
      return true;
  }
}

/**
 * Get display info for a user role.
 */
export function getRoleBadgeInfo(role: UserRole): { label: string; bgClass: string; textClass: string; borderClass: string } {
  switch (role) {
    case 'PROPRIETOR':
      return {
        label: 'Proprietor (Owner)',
        bgClass: 'bg-amber-100 dark:bg-amber-950/70',
        textClass: 'text-amber-800 dark:text-amber-300',
        borderClass: 'border-amber-300 dark:border-amber-800'
      };
    case 'VICE_PRINCIPAL':
      return {
        label: 'Vice Principal',
        bgClass: 'bg-blue-100 dark:bg-blue-950/70',
        textClass: 'text-blue-800 dark:text-blue-300',
        borderClass: 'border-blue-300 dark:border-blue-800'
      };
    case 'SCHOOL_ADMIN':
      return {
        label: 'School Admin',
        bgClass: 'bg-purple-100 dark:bg-purple-950/70',
        textClass: 'text-purple-800 dark:text-purple-300',
        borderClass: 'border-purple-300 dark:border-purple-800'
      };
    case 'TEACHER':
      return {
        label: 'Subject Teacher',
        bgClass: 'bg-emerald-100 dark:bg-emerald-950/70',
        textClass: 'text-emerald-800 dark:text-emerald-300',
        borderClass: 'border-emerald-300 dark:border-emerald-800'
      };
    case 'PARENT':
      return {
        label: 'Parent / Guardian',
        bgClass: 'bg-slate-100 dark:bg-slate-800',
        textClass: 'text-slate-700 dark:text-slate-300',
        borderClass: 'border-slate-300 dark:border-slate-700'
      };
  }
}
