/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'SCHOOL_ADMIN' | 'TEACHER' | 'PARENT';

export interface School {
  id: string;
  name: string;
  motto: string;
  code: string;
  logoUrl?: string;
  address: string;
  academicSession: string; // e.g. "2025/2026"
  academicTerm: 'First Term' | 'Second Term' | 'Third Term';
  subjects?: string[]; // Custom list of academic subjects managed by School Admin
  createdAt: string;
}

export interface User {
  id: string;
  schoolId: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  // For Teacher accounts:
  employeeId?: string;
  assignedClassIds: string[]; // e.g. ['primary_1', 'jss_2']
  assignedSubjects: string[]; // e.g. ['Mathematics', 'Basic Science']
  active: boolean;
  // For Parent accounts:
  linkedStudentAccessCodes?: string[];
  createdAt: string;
}

export interface SchoolClass {
  id: string;
  schoolId: string;
  name: string; // e.g. "Pre-Nursery", "Nursery 1", "Primary 1", "JSS 2", "SS 3"
  category: 'Pre-Nursery & Nursery' | 'Primary' | 'Junior Secondary' | 'Senior Secondary';
  arm?: string; // e.g. "Buttercups", "Gold", "A"
  capacity: number;
}

export interface PromotionRecord {
  id: string;
  fromClassId: string;
  fromClassName: string;
  toClassId: string;
  toClassName: string;
  academicSession: string;
  promotedAt: string;
  status: 'PROMOTED' | 'REPEATED' | 'GRADUATED';
  remarks?: string;
}

export interface Student {
  id: string;
  schoolId: string;
  classId: string;
  admissionNo: string;
  fullName: string;
  gender: 'Male' | 'Female';
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  address?: string;
  dob?: string;
  dateAdmitted?: string;
  photoUrl?: string;
  accessCode: string; // Unique access code for parent/student portal
  enrolledSubjects?: string[]; // Specific subjects student/pupil is studying
  active: boolean;
  promotionStatus?: 'PROMOTED' | 'REPEATED' | 'GRADUATED' | 'ACTIVE';
  promotionHistory?: PromotionRecord[];
}

export interface SubjectScore {
  studentId: string;
  studentName: string;
  admissionNo?: string;
  assignmentScore: number; // max 10
  classworkScore: number;  // max 10
  projectScore: number;    // max 10
  testScore: number;       // max 20
  examScore: number;       // max 50
  totalScore: number;      // max 100
  grade: string;           // A, B, C, D, E, F
  positionInSubject?: number;
  teacherRemark?: string;
}

export interface ScoreSheet {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  academicSession: string;
  academicTerm: string;
  status: 'DRAFT' | 'SUBMITTED_FOR_APPROVAL' | 'APPROVED' | 'REJECTED';
  scores: SubjectScore[];
  adminComment?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectReportItem {
  subject: string;
  assignment: number;
  classwork: number;
  project: number;
  test: number;
  exam: number;
  total: number;
  grade: string;
  position: number;
  teacherRemark?: string;
}

export interface StudentReportCard {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  photoUrl?: string;
  classId: string;
  className: string;
  academicSession: string;
  academicTerm: string;
  subjectScores: SubjectReportItem[];
  grandTotal: number;
  averageScore: number;
  positionInClass: number;
  totalStudentsInClass: number;
  overallGrade: string;
  attendanceSummary: {
    daysPresent: number;
    totalDays: number;
  };
  teacherRemarks: string;
  principalRemarks: string;
  status: 'DRAFT' | 'APPROVED';
  createdAt: string;
  updatedAt: string;
}

export interface HomeworkItem {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  subject: string;
  teacherName: string;
  title: string;
  description: string;
  dueDate: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface ClassPeriod {
  id?: string;
  time: string;
  subject: string;
  teacherName?: string;
  venue?: string;
  isBreak?: boolean;
}

export interface TimetableDay {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periods: ClassPeriod[];
}

export interface ClassTimetable {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  academicSession: string;
  academicTerm: string;
  days: TimetableDay[];
  updatedAt: string;
}

export interface ExamTimetableEntry {
  id: string;
  date: string; // YYYY-MM-DD
  day: string; // e.g. "Monday"
  timeSlot: string; // e.g. "09:00 AM - 11:30 AM"
  subject: string;
  hallOrVenue: string; // e.g. "Main Multipurpose Hall"
  invigilators?: string; // e.g. "Mr. David Okon, Mrs. Sarah Jenkins"
  instructions?: string; // e.g. "Come with scientific calculator"
}

export interface ExamTimetable {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  examTitle: string; // e.g. "First Term Final Examinations"
  academicSession: string;
  academicTerm: string;
  entries: ExamTimetableEntry[];
  updatedAt: string;
}

export type SubmissionType = 'LESSON_NOTE' | 'LESSON_PLAN' | 'WEEKLY_DIARY';
export type SubmissionStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';

export interface LessonNoteContent {
  weekNumber: number;
  durationMinutes: number; // e.g. 80
  topic: string;
  subTopic: string;
  behavioralObjectives: string[]; // e.g. ["Define magnetism", "List 3 magnetic materials"]
  instructionalMaterials: string[]; // e.g. ["Bar Magnets", "Iron Filings", "Chart"]
  introduction: string;
  coreContentSteps: {
    stepNumber: number;
    title: string; // e.g. "Step 1: Definition & Demonstration"
    teacherActivity: string;
    studentActivity: string;
  }[];
  summary: string;
  evaluationQuestions: string[];
  assignment: string;
}

export interface LessonPlanContent {
  weekNumber: number;
  topic: string;
  learningObjectives: string[];
  teachingStrategies: string[]; // e.g. ["Interactive Discussion", "Group Work"]
  differentiationPlan: string;
  assessmentMethods: string[];
  vocabulary: string[];
}

export interface WeeklyDiaryContent {
  subject?: string;
  topic: string;
  date: string;
  // Legacy optional fields
  weekNumber?: number;
  startDate?: string;
  endDate?: string;
  topicsCovered?: string[];
  comprehensionRatePercent?: number;
  challengesEncountered?: string;
  remedialActions?: string;
  generalRemarks?: string;
}

export interface AttachmentFile {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  dataUrl?: string; // base64 or object URL for viewing
}

export interface Submission {
  id: string;
  schoolId: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  subject: string;
  type: SubmissionType;
  title: string;
  status: SubmissionStatus;
  qualityScore?: number; // Quality rating score (0 - 100)
  
  // Specific content based on type
  lessonNoteContent?: LessonNoteContent;
  lessonPlanContent?: LessonPlanContent;
  weeklyDiaryContent?: WeeklyDiaryContent;
  pdfAttachment?: AttachmentFile;

  // Review metadata
  adminFeedback?: string;
  reviewedByAdminId?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface StudentAttendanceItem {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  subject?: string;
  date: string; // YYYY-MM-DD
  teacherId: string;
  teacherName: string;
  records: StudentAttendanceItem[];
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  schoolId: string;
  recipientUserId: string; // 'ALL_ADMINS' or specific teacherId
  senderName: string;
  title: string;
  message: string;
  type: 'APPROVAL' | 'REJECTION' | 'CORRECTION' | 'SUBMISSION' | 'SYSTEM';
  read: boolean;
  linkId?: string; // ID of related submission
  createdAt: string;
}
