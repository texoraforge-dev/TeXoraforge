/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'PROPRIETOR' | 'VICE_PRINCIPAL' | 'SCHOOL_ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT';

export type AdminPermission =
  | 'ADMISSIONS'
  | 'STUDENT_MANAGEMENT'
  | 'STUDENT_RECORDS'
  | 'GUARDIAN_MANAGEMENT'
  | 'CLASS_ASSIGNMENT'
  | 'STUDENT_PROMOTION'
  | 'LESSON_NOTE_REVIEW'
  | 'LESSON_PLAN_REVIEW'
  | 'WEEKLY_DIARY_REVIEW'
  | 'EXAM_ADMINISTRATION'
  | 'ACADEMIC_REVIEW'
  | 'USER_ROLE_MANAGEMENT'
  | 'SYSTEM_SETTINGS'
  | 'PROPRIETOR_MANAGEMENT'
  | 'AUDIT_LOG_VIEW'
  | 'PAYROLL_MANAGEMENT'
  | 'STAFF_ATTENDANCE_MANAGEMENT'
  | 'STUDENT_CHAT_MODERATION';

export interface AuditLogEntry {
  id: string;
  schoolId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string; // e.g. "Admitted Student", "Approved Lesson Note"
  module: 'ADMISSIONS' | 'ACADEMIC' | 'CLASSES' | 'LESSON_NOTES' | 'EXAMINATIONS' | 'USER_MANAGEMENT' | 'SETTINGS';
  details: string;
  createdAt: string;
}

export type SubscriptionPlanTier = 'FREE' | 'GROWTH' | 'PRO' | 'ENTERPRISE';
export type BillingCycle = 'MONTHLY' | 'ANNUAL';
export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'CANCELLED';

export interface SubscriptionInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
  paymentMethod: string;
  pdfUrl?: string;
}

export interface SchoolSubscription {
  planTier: SubscriptionPlanTier;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  maxStudents: number;
  maxTeachers: number;
  storageGb: number;
  startDate: string;
  renewsAt: string;
  amountPaid: number;
  currency: string;
  autoRenew: boolean;
  paymentMethod?: {
    type: string;
    last4: string;
    cardBrand: string;
    expDate: string;
  };
  invoiceHistory: SubscriptionInvoice[];
}

export interface SchoolBankAccountDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  sortCodeOrBranch?: string;
  paymentInstructions?: string;
  currencySymbol?: string;
}

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
  subscription?: SchoolSubscription;
  bankAccountDetails?: SchoolBankAccountDetails;
  createdAt: string;
}

export interface User {
  id: string;
  schoolId: string;
  name: string;
  email: string;
  role: UserRole;
  permissions?: AdminPermission[]; // Custom granular permissions for PROPRIETOR, VICE_PRINCIPAL, SCHOOL_ADMIN
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

export interface LessonVersion {
  id: string;
  versionNumber: number;
  content: LessonNoteContent | LessonPlanContent | WeeklyDiaryContent;
  submittedAt: string;
  adminFeedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  status: SubmissionStatus;
}

export interface LessonQualityCheck {
  academicQualityScore: number; // 0 - 100
  curriculumAlignment: string;
  ageAppropriateness: string;
  learningStructure: string;
  assessmentAlignment: string;
  recommendations: string[];
}

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
  qualityAnalysis?: LessonQualityCheck;
  versions?: LessonVersion[];
  
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

export type QuestionType = 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'TRUE_FALSE' | 'ESSAY';

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  questionText: string;
  options?: string[]; // e.g. ["A. Faraday's Law", "B. Ohm's Law", "C. Lenz's Law", "D. Joule's Law"]
  correctAnswer: string;
  explanation?: string;
  marks: number;
}

export interface GeneratedExamSet {
  id: string;
  schoolId: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  subject: string;
  lessonNoteId?: string;
  lessonNoteTitle: string;
  title: string; // e.g. "SS 3 Physics First Term Examination Questions"
  academicTerm: string;
  academicSession: string;
  questions: ExamQuestion[];
  totalMarks: number;
  instructions?: string;
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

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatarUrl?: string;
  content: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface PublicChatMessage {
  id: string;
  schoolId: string;
  channel: 'general-announcements' | 'pta-forum' | 'academic-qa' | 'school-events';
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatarUrl?: string;
  content: string;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  className: string;
  parentUserId: string;
  parentName: string;
  teacherUserId: string;
  teacherName: string;
  subject: string; // e.g. "Physics Progress - Adebayo Tobi", "Attendance Query"
  lastMessage: string;
  lastMessageAt: string;
  unreadByParent: boolean;
  unreadByTeacher: boolean;
  createdAt: string;
}

// Curriculum Intelligence Engine
export interface CurriculumTopic {
  id: string;
  weekNumber: number;
  topic: string;
  subtopics: string[];
  learningObjectives: string[];
  activities: string[];
  assessmentMethod: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'BEHIND' | 'NOT_STARTED';
  actualTaughtDate?: string;
}

export interface CurriculumSubject {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  subject: string;
  academicSession: string;
  academicTerm: string;
  topics: CurriculumTopic[];
  progressPercent: number; // calculated e.g. 75%
}

// CBT Engine
export interface CBTExam {
  id: string;
  schoolId: string;
  examSetId?: string;
  classId: string;
  className: string;
  subject: string;
  title: string;
  instructions: string;
  durationMinutes: number; // e.g. 45
  passMarkPercent: number; // e.g. 50
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  questions: ExamQuestion[];
  createdAt: string;
}

export interface CBTAttempt {
  id: string;
  schoolId: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  className: string;
  answers: Record<string, string>; // questionId -> selectedAnswer
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  startedAt: string;
  completedAt: string;
  topicBreakdown?: { topic: string; score: number; total: number }[];
}

// Student Early Warning System & Remedial Learning
export interface StudentRiskProfile {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  className: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reasons: string[];
  recommendedInterventions: string[];
  updatedAt: string;
}

export interface RemedialPackage {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  className: string;
  subject: string;
  topic: string;
  explanation: string;
  workedExamples: { title: string; problem: string; solution: string }[];
  practiceQuestions: ExamQuestion[];
  miniTestScore?: number;
  completed: boolean;
  createdAt: string;
}

// Document Vault, Transport, Financials, Calendar
export interface SchoolDocument {
  id: string;
  schoolId: string;
  title: string;
  category: 'ACADEMIC' | 'POLICY' | 'STUDENT_RECORD' | 'FINANCE' | 'EXAM_PAPER' | 'OTHER';
  fileName: string;
  fileSize: string;
  fileUrl?: string;
  uploadedByName: string;
  uploadedByRole: UserRole;
  accessRoles: UserRole[];
  createdAt: string;
}

export interface FinancialRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  className: string;
  feeTitle: string; // e.g. "First Term Tuition Fee"
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
  lastPaymentDate?: string;
}

export interface PaymentTransaction {
  id: string;
  schoolId: string;
  financialRecordId?: string;
  studentId: string;
  studentName: string;
  className: string;
  parentUserId: string;
  parentName: string;
  feeTitle: string;
  amountPaid: number;
  paymentMethod: 'BANK_TRANSFER' | 'POS' | 'CASH' | 'ONLINE';
  paymentReference: string; // Teller no, Transfer Ref, transaction ID
  paymentDate: string; // YYYY-MM-DD
  proofAttachmentUrl?: string;
  notes?: string;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'REJECTED';
  confirmedByProprietorId?: string;
  confirmedByProprietorName?: string;
  confirmedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface SchoolEvent {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  eventDate: string; // YYYY-MM-DD
  category: 'EXAM' | 'HOLIDAY' | 'PTA' | 'MEETING' | 'EVENT';
  targetAudience: 'ALL' | 'TEACHERS' | 'PARENTS' | 'STUDENTS';
  createdBy: string;
  createdAt: string;
}

export interface TransportRoute {
  id: string;
  schoolId: string;
  routeName: string;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  pickupLocations: string[];
  assignedStudentIds: string[];
  capacity: number;
}

// PART 1: Staff Attendance & Geofencing
export interface AttendanceSettings {
  schoolId: string;
  schoolLatitude: number;
  schoolLongitude: number;
  allowedRadiusMeters: number; // e.g. 150
  startTime: string; // e.g. "07:30"
  closingTime: string; // e.g. "16:00"
  lateThresholdMinutes: number; // e.g. 15
  earlyDepartureThresholdMinutes: number; // e.g. 30
  requireGeofenceForSignOut: boolean;
  updatedAt: string;
}

export interface StaffAttendanceRecord {
  id: string;
  schoolId: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  role: UserRole;
  department?: string;
  date: string; // YYYY-MM-DD
  signInTime: string; // ISO string
  signInLat: number;
  signInLng: number;
  signInDistanceMeters: number;
  signInStatus: 'ON_TIME' | 'LATE';
  signOutTime?: string; // ISO string
  signOutLat?: number;
  signOutLng?: number;
  signOutDistanceMeters?: number;
  signOutStatus?: 'NORMAL' | 'EARLY_DEPARTURE' | 'MISSING_SIGN_OUT';
  totalHoursWorked?: number;
  deviceInfo?: string;
  flaggedSuspicious?: boolean;
  suspiciousReason?: string;
  modifiedBy?: string;
  modificationReason?: string;
  originalRecord?: {
    signInTime?: string;
    signOutTime?: string;
    signInStatus?: string;
    signOutStatus?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// PART 2: Staff Salary & Payroll Management
export interface SalaryProfile {
  id: string;
  schoolId: string;
  staffId: string;
  staffName: string;
  role: UserRole;
  department: string; // e.g. "Academic", "Administration", "Security", "Transport"
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
  baseSalary: number; // e.g. 150000 (in Naira)
  salaryFrequency: 'MONTHLY' | 'WEEKLY' | 'CUSTOM';
  effectiveDate: string;
  allowances: { title: string; amount: number }[]; // e.g. Transport, Housing
  customDeductions?: { title: string; amount: number }[];
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  updatedAt: string;
}

export interface DeductionRule {
  id: string;
  schoolId: string;
  name: string; // e.g. "Late arrival", "Unauthorized absence", "Missing sign-out", "Early departure"
  triggerType: 'LATE_ARRIVAL' | 'ABSENCE' | 'MISSING_SIGN_OUT' | 'EARLY_DEPARTURE' | 'MANUAL';
  active: boolean;
  deductionType: 'FIXED' | 'PERCENTAGE';
  value: number; // e.g. 500 fixed or 1%
  maxDeductionPerPeriod?: number;
  requiresManualApproval: boolean;
  description?: string;
}

export interface ProposedDeduction {
  id: string;
  staffId: string;
  staffName: string;
  ruleId: string;
  ruleName: string;
  date: string;
  calculatedAmount: number;
  reason: string;
  approved: boolean;
  approvedBy?: string;
}

export interface StaffPayrollItem {
  staffId: string;
  staffName: string;
  role: UserRole;
  department: string;
  baseSalary: number;
  allowancesBreakdown: { title: string; amount: number }[];
  totalAllowances: number;
  deductionsBreakdown: { title: string; amount: number; reason: string; approved: boolean }[];
  totalDeductions: number;
  netSalary: number;
  paymentStatus: 'UNPAID' | 'PAID';
  paymentDate?: string;
  payslipId: string;
}

export interface PayrollRecord {
  id: string;
  schoolId: string;
  periodName: string; // e.g. "August 2026"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PAID';
  staffPayrollItems: StaffPayrollItem[];
  totalPayroll: number;
  totalAllowances: number;
  totalDeductions: number;
  netPayroll: number;
  approvedBy?: string;
  approvedAt?: string;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}

// PART 3, 4, 5: Student Accounts, CBT & Class Chat
export interface StudentAccountCredentials {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  studentCode: string; // e.g. TXR-P5-00482
  accessPin: string;
  activationStatus: 'PENDING_ACTIVATION' | 'ACTIVE' | 'RESTRICTED';
  activatedAt?: string;
  createdByTeacherName: string;
  chatMuted: boolean;
  chatMutedReason?: string;
}

export interface ClassChatMessage {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatarUrl?: string;
  content: string;
  attachmentUrl?: string;
  replyToMessageId?: string;
  reactions?: Record<string, string[]>; // reaction -> userIds
  isAnnouncement?: boolean;
  flaggedByAi?: boolean;
  aiFlagCategory?: 'BULLYING' | 'INAPPROPRIATE_LANGUAGE' | 'SAFE';
  aiFlagReason?: string;
  hidden?: boolean;
  hiddenBy?: string;
  hiddenReason?: string;
  createdAt: string;
}

export interface ChatModerationLog {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  moderatorId: string;
  moderatorName: string;
  moderatorRole: UserRole;
  action: 'DELETE_MESSAGE' | 'HIDE_MESSAGE' | 'MUTE_STUDENT' | 'UNMUTE_STUDENT' | 'WARN_STUDENT' | 'PIN_ANNOUNCEMENT';
  targetStudentId?: string;
  targetStudentName?: string;
  messageId?: string;
  reason: string;
  createdAt: string;
}

