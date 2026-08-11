/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { School, User, SchoolClass, Student, Submission, AttendanceRecord, NotificationItem, ScoreSheet, HomeworkItem, TimetableDay, ClassTimetable, ExamTimetable, AuditLogEntry, ChatRoom, ChatMessage, PublicChatMessage, GeneratedExamSet } from './types';
import { COMPANY_LOGO_DATA_URI } from './components/Logo';

export const DEFAULT_SCHOOL_SUBJECTS: string[] = [
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Basic Science & Tech',
  'Basic Technology',
  'Computer Studies',
  'Further Mathematics',
  'Economics',
  'Financial Accounting',
  'Literature in English',
  'Government',
  'Civic Education',
  'Agricultural Science',
  'Social Studies',
  'Business Studies',
  'Creative Arts',
  'Physical & Health Ed',
  'Geography',
  'History'
];

export const INITIAL_SCHOOLS: School[] = [
  {
    id: 'school_apex',
    name: 'Apex Horizon Academy',
    motto: 'Excellence, Character & Innovation',
    code: 'APEX-8821',
    logoUrl: COMPANY_LOGO_DATA_URI,
    address: '14 Academic Crest Way, Victoria Island',
    academicSession: '2025/2026',
    academicTerm: 'First Term',
    subjects: [...DEFAULT_SCHOOL_SUBJECTS],
    subscription: {
      planTier: 'PRO',
      billingCycle: 'ANNUAL',
      status: 'ACTIVE',
      maxStudents: 1000,
      maxTeachers: 100,
      storageGb: 50,
      startDate: '2025-09-01T08:00:00.000Z',
      renewsAt: '2026-09-01T08:00:00.000Z',
      amountPaid: 1350,
      currency: 'USD',
      autoRenew: true,
      paymentMethod: {
        type: 'CARD',
        last4: '4242',
        cardBrand: 'Visa',
        expDate: '12/28'
      },
      invoiceHistory: [
        {
          id: 'inv_1001',
          invoiceNo: 'INV-2025-0901',
          date: '2025-09-01T08:00:00.000Z',
          amount: 1350,
          currency: 'USD',
          description: 'TeXora Pro Excellence Plan - Annual Subscription (1,000 Students & 100 Teachers)',
          status: 'PAID',
          paymentMethod: 'Visa ending in 4242'
        },
        {
          id: 'inv_0988',
          invoiceNo: 'INV-2024-0901',
          date: '2024-09-01T08:00:00.000Z',
          amount: 450,
          currency: 'USD',
          description: 'TeXora Growth Standard Plan - Annual Subscription (250 Students & 25 Teachers)',
          status: 'PAID',
          paymentMethod: 'Mastercard ending in 8812'
        }
      ]
    },
    createdAt: '2025-09-01T08:00:00.000Z',
  },
  {
    id: 'school_stjude',
    name: 'St. Jude International College',
    motto: 'Knowledge is Power and Light',
    code: 'STJUDE-4019',
    logoUrl: COMPANY_LOGO_DATA_URI,
    address: '88 Heritage Drive, Ikeja',
    academicSession: '2025/2026',
    academicTerm: 'First Term',
    subjects: [...DEFAULT_SCHOOL_SUBJECTS],
    subscription: {
      planTier: 'GROWTH',
      billingCycle: 'MONTHLY',
      status: 'ACTIVE',
      maxStudents: 250,
      maxTeachers: 25,
      storageGb: 15,
      startDate: '2026-01-01T08:00:00.000Z',
      renewsAt: '2026-09-01T08:00:00.000Z',
      amountPaid: 49,
      currency: 'USD',
      autoRenew: true,
      paymentMethod: {
        type: 'CARD',
        last4: '1111',
        cardBrand: 'Mastercard',
        expDate: '08/27'
      },
      invoiceHistory: [
        {
          id: 'inv_2001',
          invoiceNo: 'INV-2026-0101',
          date: '2026-01-01T08:00:00.000Z',
          amount: 49,
          currency: 'USD',
          description: 'TeXora Growth Plan - Monthly Subscription',
          status: 'PAID',
          paymentMethod: 'Mastercard ending in 1111'
        }
      ]
    },
    createdAt: '2025-09-02T08:00:00.000Z',
  }
];

export const INITIAL_CLASSES: SchoolClass[] = [
  // Early Childhood / Pre-Nursery & Nursery Tier (Before Primary)
  { id: 'cls_prenursery', schoolId: 'school_apex', name: 'PRE-NURSERY', category: 'Pre-Nursery & Nursery', arm: 'Buttercups', capacity: 20 },
  { id: 'cls_nursery1', schoolId: 'school_apex', name: 'NURSERY 1', category: 'Pre-Nursery & Nursery', arm: 'Sunflowers', capacity: 25 },
  { id: 'cls_nursery2', schoolId: 'school_apex', name: 'NURSERY 2', category: 'Pre-Nursery & Nursery', arm: 'Daffodils', capacity: 25 },
  { id: 'cls_nursery3', schoolId: 'school_apex', name: 'NURSERY 3', category: 'Pre-Nursery & Nursery', arm: 'Bluebells', capacity: 25 },

  // Primary Tier
  { id: 'cls_pri1', schoolId: 'school_apex', name: 'Primary 1', category: 'Primary', arm: 'Gold', capacity: 30 },
  { id: 'cls_pri2', schoolId: 'school_apex', name: 'Primary 2', category: 'Primary', arm: 'Gold', capacity: 30 },
  { id: 'cls_pri3', schoolId: 'school_apex', name: 'Primary 3', category: 'Primary', arm: 'Silver', capacity: 28 },
  { id: 'cls_pri4', schoolId: 'school_apex', name: 'Primary 4', category: 'Primary', arm: 'Gold', capacity: 32 },
  { id: 'cls_pri5', schoolId: 'school_apex', name: 'Primary 5', category: 'Primary', arm: 'Diamond', capacity: 30 },

  // Junior Secondary Tier
  { id: 'cls_jss1', schoolId: 'school_apex', name: 'JSS 1', category: 'Junior Secondary', arm: 'A', capacity: 35 },
  { id: 'cls_jss2', schoolId: 'school_apex', name: 'JSS 2', category: 'Junior Secondary', arm: 'A', capacity: 35 },
  { id: 'cls_jss3', schoolId: 'school_apex', name: 'JSS 3', category: 'Junior Secondary', arm: 'B', capacity: 35 },

  // Senior Secondary Tier
  { id: 'cls_ss1', schoolId: 'school_apex', name: 'SS 1', category: 'Senior Secondary', arm: 'Science', capacity: 30 },
  { id: 'cls_ss2', schoolId: 'school_apex', name: 'SS 2', category: 'Senior Secondary', arm: 'Arts & Commercial', capacity: 30 },
  { id: 'cls_ss3', schoolId: 'school_apex', name: 'SS 3', category: 'Senior Secondary', arm: 'Science', capacity: 28 },
];

export const SUBJECT_OPTIONS_BY_TIER: Record<string, string[]> = {
  'Pre-Nursery & Nursery': ['Numeracy', 'Literacy & Phonics', 'Rhymes & Songs', 'Basic Science & Nature', 'Social Norms', 'Creative & Fine Arts', 'Physical & Health Ed', 'Handwriting'],
  Primary: ['Mathematics', 'English Language', 'Basic Science & Tech', 'Social Studies', 'Civic Education', 'Agricultural Science', 'Creative Arts', 'Physical & Health Ed'],
  'Junior Secondary': ['Mathematics', 'English Language', 'Basic Science', 'Basic Technology', 'Business Studies', 'Computer Science', 'Social Studies', 'Agricultural Science'],
  'Senior Secondary': ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Further Mathematics', 'Economics', 'Financial Accounting', 'Literature in English', 'Government', 'Computer Studies']
};

export const INITIAL_USERS: User[] = [
  // Proprietor / Super Admin for Apex Horizon
  {
    id: 'usr_proprietor1',
    schoolId: 'school_apex',
    name: 'Chief Dr. Arthur Pendelton',
    email: 'proprietor@apexhorizon.edu',
    role: 'PROPRIETOR',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    phone: '+234 801 999 8888',
    assignedClassIds: [],
    assignedSubjects: [],
    active: true,
    createdAt: '2025-08-15T08:00:00.000Z',
  },
  // Vice Principal (Admissions & Student Administration)
  {
    id: 'usr_vp1',
    schoolId: 'school_apex',
    name: 'Mrs. Margaret Folorunsho',
    email: 'vp@apexhorizon.edu',
    role: 'VICE_PRINCIPAL',
    permissions: [
      'ADMISSIONS',
      'STUDENT_MANAGEMENT',
      'STUDENT_RECORDS',
      'GUARDIAN_MANAGEMENT',
      'CLASS_ASSIGNMENT',
      'STUDENT_PROMOTION',
      'AUDIT_LOG_VIEW'
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=150&q=80',
    phone: '+234 802 333 4455',
    assignedClassIds: [],
    assignedSubjects: [],
    active: true,
    createdAt: '2025-08-20T09:00:00.000Z',
  },
  // School Admin (Academic Administration & Approvals)
  {
    id: 'usr_admin1',
    schoolId: 'school_apex',
    name: 'Dr. Eleanor Vance',
    email: 'admin@apexhorizon.edu',
    role: 'SCHOOL_ADMIN',
    permissions: [
      'LESSON_NOTE_REVIEW',
      'LESSON_PLAN_REVIEW',
      'WEEKLY_DIARY_REVIEW',
      'EXAM_ADMINISTRATION',
      'ACADEMIC_REVIEW'
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    phone: '+234 802 111 2233',
    assignedClassIds: [],
    assignedSubjects: [],
    active: true,
    createdAt: '2025-09-01T08:30:00.000Z',
  },
  // Teacher 1: Mr. David Okon (Mathematics & Physics)
  {
    id: 'usr_t1',
    schoolId: 'school_apex',
    name: 'Mr. David Okon',
    email: 'd.okon@apexhorizon.edu',
    role: 'TEACHER',
    employeeId: 'EMP-2025-01',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    phone: '+234 803 456 7890',
    assignedClassIds: ['cls_ss2', 'cls_ss3'],
    assignedSubjects: ['Physics', 'Mathematics'],
    active: true,
    createdAt: '2025-09-02T09:00:00.000Z',
  },
  // Teacher 2: Mrs. Sarah Jenkins (English & Literature)
  {
    id: 'usr_t2',
    schoolId: 'school_apex',
    name: 'Mrs. Sarah Jenkins',
    email: 's.jenkins@apexhorizon.edu',
    role: 'TEACHER',
    employeeId: 'EMP-2025-02',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    phone: '+234 805 123 4567',
    assignedClassIds: ['cls_jss2', 'cls_jss3'],
    assignedSubjects: ['English Language', 'Literature in English'],
    active: true,
    createdAt: '2025-09-02T10:00:00.000Z',
  },
  // Teacher 3: Mr. Chimedi Nwosu (Primary 3 Class Teacher & Basic Science)
  {
    id: 'usr_t3',
    schoolId: 'school_apex',
    name: 'Mr. Chimedi Nwosu',
    email: 'c.nwosu@apexhorizon.edu',
    role: 'TEACHER',
    employeeId: 'EMP-2025-03',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    phone: '+234 809 987 6543',
    assignedClassIds: ['cls_pri3'],
    assignedSubjects: ['Mathematics', 'Basic Science & Tech', 'Social Studies'],
    active: true,
    createdAt: '2025-09-03T11:00:00.000Z',
  },
  // Parent 1: Chief Adebayo
  {
    id: 'usr_p1',
    schoolId: 'school_apex',
    name: 'Chief Adebayo Tobi Sr.',
    email: 'parent@apexhorizon.edu',
    role: 'PARENT',
    phone: '+234 803 000 1111',
    assignedClassIds: [],
    assignedSubjects: [],
    linkedStudentAccessCodes: ['PAR-2022-001', 'PAR-2023-101'],
    active: true,
    createdAt: '2025-09-05T12:00:00.000Z',
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log_101',
    schoolId: 'school_apex',
    userId: 'usr_proprietor1',
    userName: 'Chief Dr. Arthur Pendelton',
    userRole: 'PROPRIETOR',
    action: 'Created Vice Principal Account',
    module: 'USER_MANAGEMENT',
    details: 'Created Vice Principal account for Mrs. Margaret Folorunsho with Admissions and Student Admin permissions.',
    createdAt: '2025-08-20T09:05:00.000Z'
  },
  {
    id: 'log_102',
    schoolId: 'school_apex',
    userId: 'usr_vp1',
    userName: 'Mrs. Margaret Folorunsho',
    userRole: 'VICE_PRINCIPAL',
    action: 'Admitted New Student',
    module: 'ADMISSIONS',
    details: 'Admitted student Kenneth Sowore (APX/2024/302) into class Primary 3.',
    createdAt: '2025-09-08T10:15:00.000Z'
  },
  {
    id: 'log_103',
    schoolId: 'school_apex',
    userId: 'usr_admin1',
    userName: 'Dr. Eleanor Vance',
    userRole: 'SCHOOL_ADMIN',
    action: 'Approved Lesson Note',
    module: 'LESSON_NOTES',
    details: 'Approved Week 2 Physics Lesson Note "Electromagnetic Induction & Faraday Laws" submitted by Mr. David Okon.',
    createdAt: '2025-09-10T14:30:00.000Z'
  },
  {
    id: 'log_104',
    schoolId: 'school_apex',
    userId: 'usr_vp1',
    userName: 'Mrs. Margaret Folorunsho',
    userRole: 'VICE_PRINCIPAL',
    action: 'Assigned Student Class Transfer',
    module: 'CLASSES',
    details: 'Transferred student Grace Ibrahim from Primary 5 to SS 2 (Science Arm).',
    createdAt: '2025-09-12T11:20:00.000Z'
  },
  {
    id: 'log_105',
    schoolId: 'school_apex',
    userId: 'usr_proprietor1',
    userName: 'Chief Dr. Arthur Pendelton',
    userRole: 'PROPRIETOR',
    action: 'Updated School Settings',
    module: 'SETTINGS',
    details: 'Updated Academic Session to 2025/2026 and confirmed custom subject catalog.',
    createdAt: '2025-09-15T16:00:00.000Z'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  // SS 3 Students
  { id: 'std_ss3_1', schoolId: 'school_apex', classId: 'cls_ss3', admissionNo: 'APX/2022/001', fullName: 'Adebayo Tobi', gender: 'Male', guardianName: 'Chief Adebayo', guardianPhone: '+2348030001111', guardianEmail: 'parent@apexhorizon.edu', address: '12 Admiralty Way, Lekki Phase 1', dob: '2008-04-12', dateAdmitted: '2022-09-10', photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80', accessCode: 'PAR-2022-001', active: true },
  { id: 'std_ss3_2', schoolId: 'school_apex', classId: 'cls_ss3', admissionNo: 'APX/2022/002', fullName: 'Chidinma Eze', gender: 'Female', guardianName: 'Mrs. Eze', guardianPhone: '+2348030001112', guardianEmail: 'mrs.eze@gmail.com', address: '45 Glover Road, Ikoyi', dob: '2008-08-23', dateAdmitted: '2022-09-10', photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', accessCode: 'PAR-2022-002', active: true },
  { id: 'std_ss3_3', schoolId: 'school_apex', classId: 'cls_ss3', admissionNo: 'APX/2022/003', fullName: 'David Oladipo', gender: 'Male', guardianName: 'Engr. Oladipo', guardianPhone: '+2348030001113', guardianEmail: 'engr.oladipo@yahoo.com', address: '8 Banana Island Crescent', dob: '2008-01-15', dateAdmitted: '2022-09-10', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', accessCode: 'PAR-2022-003', active: true },
  { id: 'std_ss3_4', schoolId: 'school_apex', classId: 'cls_ss3', admissionNo: 'APX/2022/004', fullName: 'Fatima Abubakar', gender: 'Female', guardianName: 'Alhaji Abubakar', guardianPhone: '+2348030001114', guardianEmail: 'abubakar.fam@gmail.com', address: '19 Parkview Estate', dob: '2008-11-05', dateAdmitted: '2022-09-10', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', accessCode: 'PAR-2022-004', active: true },
  { id: 'std_ss3_5', schoolId: 'school_apex', classId: 'cls_ss3', admissionNo: 'APX/2022/005', fullName: 'Gabriel Okafor', gender: 'Male', guardianName: 'Dr. Okafor', guardianPhone: '+2348030001115', guardianEmail: 'dr.okafor@clinic.ng', address: '22 Bourdillon Road, Ikoyi', dob: '2008-06-30', dateAdmitted: '2022-09-10', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', accessCode: 'PAR-2022-005', active: true },

  // SS 2 Students
  { id: 'std_ss2_1', schoolId: 'school_apex', classId: 'cls_ss2', admissionNo: 'APX/2023/101', fullName: 'Grace Ibrahim', gender: 'Female', guardianName: 'Chief Adebayo', guardianPhone: '+2348030001111', guardianEmail: 'parent@apexhorizon.edu', address: '12 Admiralty Way, Lekki Phase 1', dob: '2009-02-14', dateAdmitted: '2023-09-12', photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80', accessCode: 'PAR-2023-101', active: true },
  { id: 'std_ss2_2', schoolId: 'school_apex', classId: 'cls_ss2', admissionNo: 'APX/2023/102', fullName: 'Hannah Kalu', gender: 'Female', guardianName: 'Prof. Kalu', guardianPhone: '+2348030002222', guardianEmail: 'prof.kalu@unilag.edu', address: '15 Commercial Ave, Yaba', dob: '2009-07-19', dateAdmitted: '2023-09-12', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', accessCode: 'PAR-2023-102', active: true },
  { id: 'std_ss2_3', schoolId: 'school_apex', classId: 'cls_ss2', admissionNo: 'APX/2023/103', fullName: 'Israel Danjuma', gender: 'Male', guardianName: 'Capt. Danjuma', guardianPhone: '+2348030002223', guardianEmail: 'capt.danjuma@navy.gov', address: '7 Isaac John St, Ikeja', dob: '2009-10-02', dateAdmitted: '2023-09-12', photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80', accessCode: 'PAR-2023-103', active: true },

  // Primary 3 Students
  { id: 'std_pri3_1', schoolId: 'school_apex', classId: 'cls_pri3', admissionNo: 'APX/2024/301', fullName: 'Joy Nnamdi', gender: 'Female', guardianName: 'Mrs. Nnamdi', guardianPhone: '+2348030003331', guardianEmail: 'nnamdi.joy@gmail.com', address: '10 Chevron Drive, Lekki', dob: '2016-03-20', dateAdmitted: '2024-09-08', photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', accessCode: 'PAR-2024-301', active: true },
  { id: 'std_pri3_2', schoolId: 'school_apex', classId: 'cls_pri3', admissionNo: 'APX/2024/302', fullName: 'Kenneth Sowore', gender: 'Male', guardianName: 'Mr. Sowore', guardianPhone: '+2348030003332', guardianEmail: 'sowore.k@gmail.com', address: '3 Allen Avenue, Ikeja', dob: '2016-09-11', dateAdmitted: '2024-09-08', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', accessCode: 'PAR-2024-302', active: true },
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub_001',
    schoolId: 'school_apex',
    teacherId: 'usr_t1',
    teacherName: 'Mr. David Okon',
    classId: 'cls_ss3',
    className: 'SS 3',
    subject: 'Physics',
    type: 'LESSON_NOTE',
    title: 'Electromagnetic Induction & Faraday Laws',
    status: 'APPROVED',
    adminFeedback: 'Excellent breakdown of Faraday & Lenz laws with clear practical demonstrations and step-by-step student activities.',
    reviewedByAdminId: 'usr_admin1',
    reviewedAt: '2026-08-05T14:30:00.000Z',
    createdAt: '2026-08-04T10:15:00.000Z',
    updatedAt: '2026-08-05T14:30:00.000Z',
    lessonNoteContent: {
      weekNumber: 3,
      durationMinutes: 80,
      topic: 'Electromagnetic Induction',
      subTopic: 'Faraday’s Law & Lenz’s Law',
      behavioralObjectives: [
        'State Faraday’s law of electromagnetic induction.',
        'Derive the equation for induced electromotive force (e.m.f).',
        'Apply Lenz’s law to determine induced current direction.',
        'Calculate induced e.m.f in a moving conductor coil.'
      ],
      instructionalMaterials: [
        'Bar Magnets',
        'Galvanometer',
        'Copper Coils',
        'Digital Physics Simulation Interactive Board'
      ],
      introduction: 'Review magnetic field lines around a current-carrying solenoid. Introduce the concept of magnetic flux linkage and changing flux producing electricity without a physical battery.',
      coreContentSteps: [
        {
          stepNumber: 1,
          title: 'Faraday’s Discovery & Experiments',
          teacherActivity: 'Demonstrate plunging a bar magnet into a stationary coil connected to a center-zero galvanometer.',
          studentActivity: 'Observe the galvanometer needle deflection and record direction for relative motion speed.'
        },
        {
          stepNumber: 2,
          title: 'Quantitative Formulation',
          teacherActivity: 'Write equation E = -N (dΦ/dt) on the board and explain rate of flux linkage.',
          studentActivity: 'Copy the equation into lab notebooks and define symbols E, N, Φ, t.'
        },
        {
          stepNumber: 3,
          title: 'Lenz’s Law & Conservation of Energy',
          teacherActivity: 'Explain why the minus sign represents energy conservation in magnetic reaction.',
          studentActivity: 'Solve worked example 1 calculation of induced e.m.f.'
        }
      ],
      summary: 'Induced current flows only when there is relative motion between flux and conductor, proportional to the speed of flux cuts.',
      evaluationQuestions: [
        'State two ways to increase the magnitude of induced e.m.f in a coil.',
        'Why does a galvanometer needle return to zero when the magnet stops moving inside the coil?'
      ],
      assignment: 'Complete Questions 4-8 on Page 142 of Senior Secondary Physics by Nelkon.'
    }
  },
  {
    id: 'sub_002',
    schoolId: 'school_apex',
    teacherId: 'usr_t1',
    teacherName: 'Mr. David Okon',
    classId: 'cls_ss2',
    className: 'SS 2',
    subject: 'Mathematics',
    type: 'LESSON_NOTE',
    title: 'Quadratic Equations & Completing the Square',
    status: 'PENDING',
    createdAt: '2026-08-06T16:00:00.000Z',
    updatedAt: '2026-08-06T16:00:00.000Z',
    lessonNoteContent: {
      weekNumber: 4,
      durationMinutes: 80,
      topic: 'Algebraic Equations',
      subTopic: 'Solving Quadratic Equations by Completing the Square',
      behavioralObjectives: [
        'Express quadratic expressions in perfect square form.',
        'Solve general quadratic equations ax^2 + bx + c = 0 using completing the square method.'
      ],
      instructionalMaterials: [
        'Graph sheets',
        'Whiteboard algebra tiles',
        'Scientific calculators'
      ],
      introduction: 'Brief recap of factorisation method and its limitations when roots are surds or irrational.',
      coreContentSteps: [
        {
          stepNumber: 1,
          title: 'Making Coefficient of x^2 Unity',
          teacherActivity: 'Divide through by "a" and transpose constant term to RHS.',
          studentActivity: 'Follow step-by-step example for 2x^2 + 5x - 3 = 0.'
        },
        {
          stepNumber: 2,
          title: 'Adding Square of Half the Coefficient of x',
          teacherActivity: 'Add (b/2a)^2 to both sides and factorize LHS as perfect square.',
          studentActivity: 'Simplify fractional terms and take square root of both sides.'
        }
      ],
      summary: 'Completing the square provides a general direct proof for the Quadratic Formula.',
      evaluationQuestions: [
        'Solve 3x^2 - 7x + 2 = 0 by completing the square.',
        'What constant must be added to x^2 + 8x to make it a perfect square?'
      ],
      assignment: 'Exercise 6C, Numbers 1 to 10 in New General Mathematics Book 2.'
    }
  },
  {
    id: 'sub_003',
    schoolId: 'school_apex',
    teacherId: 'usr_t2',
    teacherName: 'Mrs. Sarah Jenkins',
    classId: 'cls_jss3',
    className: 'JSS 3',
    subject: 'Literature in English',
    type: 'LESSON_PLAN',
    title: 'Analysis of Dramatic Devices in West African Plays',
    status: 'REVISION_REQUESTED',
    adminFeedback: 'Please expand the differentiation plan to specify support for struggling readers and include vocabulary list for literary terms.',
    reviewedByAdminId: 'usr_admin1',
    reviewedAt: '2026-08-06T11:00:00.000Z',
    createdAt: '2026-08-05T09:20:00.000Z',
    updatedAt: '2026-08-06T11:00:00.000Z',
    lessonPlanContent: {
      weekNumber: 4,
      topic: 'Dramatic Devices in West African Drama',
      learningObjectives: [
        'Identify dramatic irony, soliloquy, and symbolism in the prescribed text.',
        'Analyze character motives during key dramatic climax scenes.'
      ],
      teachingStrategies: [
        'Role Play',
        'Small Group Character Analysis',
        'Guided Textual Annotation'
      ],
      differentiationPlan: 'Group students with mixed reading fluency for peer support.',
      assessmentMethods: [
        'In-class oral dramatic reading evaluation',
        '5-question short character analysis quiz'
      ],
      vocabulary: ['Dramatic Irony', 'Soliloquy', 'Aside', 'Proscenium', 'Climax']
    }
  },
  {
    id: 'sub_004',
    schoolId: 'school_apex',
    teacherId: 'usr_t3',
    teacherName: 'Mr. Chimedi Nwosu',
    classId: 'cls_pri3',
    className: 'Primary 3',
    subject: 'Basic Science & Tech',
    type: 'WEEKLY_DIARY',
    title: 'Weekly Diary: Living & Non-Living Things',
    status: 'APPROVED',
    adminFeedback: 'Well documented. Great job engaging the Primary 3 learners with outdoor nature walk activities.',
    reviewedByAdminId: 'usr_admin1',
    reviewedAt: '2026-08-04T16:45:00.000Z',
    createdAt: '2026-08-04T12:00:00.000Z',
    updatedAt: '2026-08-04T16:45:00.000Z',
    weeklyDiaryContent: {
      subject: 'Basic Science & Tech',
      topic: 'Living & Non-Living Things',
      date: '2026-08-04'
    }
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att_001',
    schoolId: 'school_apex',
    classId: 'cls_ss3',
    className: 'SS 3',
    subject: 'Physics',
    date: '2026-08-06',
    teacherId: 'usr_t1',
    teacherName: 'Mr. David Okon',
    records: [
      { studentId: 'std_ss3_1', studentName: 'Adebayo Tobi', status: 'PRESENT' },
      { studentId: 'std_ss3_2', studentName: 'Chidinma Eze', status: 'PRESENT' },
      { studentId: 'std_ss3_3', studentName: 'David Oladipo', status: 'LATE', note: 'Arrived 10 mins late due to school bus delay' },
      { studentId: 'std_ss3_4', studentName: 'Fatima Abubakar', status: 'PRESENT' },
      { studentId: 'std_ss3_5', studentName: 'Gabriel Okafor', status: 'EXCUSED', note: 'Sick bay visit' }
    ],
    createdAt: '2026-08-06T08:30:00.000Z'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_001',
    schoolId: 'school_apex',
    recipientUserId: 'usr_t1',
    senderName: 'Dr. Eleanor Vance (School Admin)',
    title: 'Lesson Note Approved! 🎉',
    message: 'Your Lesson Note for SS 3 Physics ("Electromagnetic Induction") was reviewed and approved.',
    type: 'APPROVAL',
    read: false,
    linkId: 'sub_001',
    createdAt: '2026-08-05T14:30:00.000Z'
  },
  {
    id: 'notif_002',
    schoolId: 'school_apex',
    recipientUserId: 'usr_t2',
    senderName: 'Dr. Eleanor Vance (School Admin)',
    title: 'Revision Requested on Lesson Plan',
    message: 'Please update your JSS 3 Literature Lesson Plan with vocabulary definitions and differentiation details.',
    type: 'CORRECTION',
    read: false,
    linkId: 'sub_003',
    createdAt: '2026-08-06T11:00:00.000Z'
  },
  {
    id: 'notif_003',
    schoolId: 'school_apex',
    recipientUserId: 'usr_admin1',
    senderName: 'Mr. David Okon',
    title: 'New Lesson Note Pending Review',
    message: 'Submitted SS 2 Mathematics ("Quadratic Equations by Completing the Square") for review.',
    type: 'SUBMISSION',
    read: true,
    linkId: 'sub_002',
    createdAt: '2026-08-06T16:00:00.000Z'
  }
];

export const INITIAL_SCORE_SHEETS: ScoreSheet[] = [
  {
    id: 'sc_ss3_physics',
    schoolId: 'school_apex',
    classId: 'cls_ss3',
    className: 'SS 3',
    subject: 'Physics',
    teacherId: 'usr_t1',
    teacherName: 'Mr. David Okon',
    academicSession: '2025/2026',
    academicTerm: 'First Term',
    status: 'APPROVED',
    approvedAt: '2026-08-05T10:00:00.000Z',
    createdAt: '2026-08-04T09:00:00.000Z',
    updatedAt: '2026-08-05T10:00:00.000Z',
    scores: [
      { studentId: 'std_ss3_1', studentName: 'Adebayo Tobi', assignmentScore: 9, classworkScore: 8, projectScore: 9, testScore: 18, examScore: 45, totalScore: 89, grade: 'A', positionInSubject: 1, teacherRemark: 'Outstanding performance and deep conceptual grasp.' },
      { studentId: 'std_ss3_2', studentName: 'Chidinma Eze', assignmentScore: 8, classworkScore: 9, projectScore: 8, testScore: 16, examScore: 42, totalScore: 83, grade: 'A', positionInSubject: 2, teacherRemark: 'Excellent worker, very attentive in lab sessions.' },
      { studentId: 'std_ss3_3', studentName: 'David Oladipo', assignmentScore: 7, classworkScore: 7, projectScore: 8, testScore: 14, examScore: 38, totalScore: 74, grade: 'A', positionInSubject: 3, teacherRemark: 'Good progress, keep practicing numerical proofs.' },
      { studentId: 'std_ss3_4', studentName: 'Fatima Abubakar', assignmentScore: 8, classworkScore: 7, projectScore: 7, testScore: 13, examScore: 32, totalScore: 67, grade: 'B', positionInSubject: 4, teacherRemark: 'Punctual with assignments, revise circuit theory.' },
      { studentId: 'std_ss3_5', studentName: 'Gabriel Okafor', assignmentScore: 6, classworkScore: 6, projectScore: 6, testScore: 11, examScore: 28, totalScore: 57, grade: 'C', positionInSubject: 5, teacherRemark: 'Needs additional practice on wave optics.' }
    ]
  },
  {
    id: 'sc_ss3_maths',
    schoolId: 'school_apex',
    classId: 'cls_ss3',
    className: 'SS 3',
    subject: 'Mathematics',
    teacherId: 'usr_t1',
    teacherName: 'Mr. David Okon',
    academicSession: '2025/2026',
    academicTerm: 'First Term',
    status: 'APPROVED',
    approvedAt: '2026-08-05T11:00:00.000Z',
    createdAt: '2026-08-04T10:00:00.000Z',
    updatedAt: '2026-08-05T11:00:00.000Z',
    scores: [
      { studentId: 'std_ss3_1', studentName: 'Adebayo Tobi', assignmentScore: 10, classworkScore: 9, projectScore: 9, testScore: 19, examScore: 46, totalScore: 93, grade: 'A', positionInSubject: 1, teacherRemark: 'Brilliant mathematical reasoning.' },
      { studentId: 'std_ss3_2', studentName: 'Chidinma Eze', assignmentScore: 8, classworkScore: 8, projectScore: 9, testScore: 17, examScore: 41, totalScore: 83, grade: 'A', positionInSubject: 2, teacherRemark: 'Very consistent accurate solver.' },
      { studentId: 'std_ss3_3', studentName: 'David Oladipo', assignmentScore: 7, classworkScore: 8, projectScore: 7, testScore: 15, examScore: 39, totalScore: 76, grade: 'A', positionInSubject: 3, teacherRemark: 'Strong algebra skills.' },
      { studentId: 'std_ss3_4', studentName: 'Fatima Abubakar', assignmentScore: 8, classworkScore: 7, projectScore: 8, testScore: 12, examScore: 35, totalScore: 70, grade: 'A', positionInSubject: 4, teacherRemark: 'Good effort in trigonometry.' },
      { studentId: 'std_ss3_5', studentName: 'Gabriel Okafor', assignmentScore: 7, classworkScore: 6, projectScore: 6, testScore: 10, examScore: 30, totalScore: 59, grade: 'C', positionInSubject: 5, teacherRemark: 'Focus on geometry proofs.' }
    ]
  },
  {
    id: 'sc_ss2_physics',
    schoolId: 'school_apex',
    classId: 'cls_ss2',
    className: 'SS 2',
    subject: 'Physics',
    teacherId: 'usr_t1',
    teacherName: 'Mr. David Okon',
    academicSession: '2025/2026',
    academicTerm: 'First Term',
    status: 'SUBMITTED_FOR_APPROVAL',
    createdAt: '2026-08-06T14:00:00.000Z',
    updatedAt: '2026-08-06T14:00:00.000Z',
    scores: [
      { studentId: 'std_ss2_1', studentName: 'Grace Ibrahim', assignmentScore: 9, classworkScore: 9, projectScore: 9, testScore: 18, examScore: 44, totalScore: 89, grade: 'A', positionInSubject: 1, teacherRemark: 'Superb dedication and score.' },
      { studentId: 'std_ss2_2', studentName: 'Hannah Kalu', assignmentScore: 8, classworkScore: 8, projectScore: 8, testScore: 16, examScore: 40, totalScore: 80, grade: 'A', positionInSubject: 2, teacherRemark: 'Solid grasp of mechanics.' },
      { studentId: 'std_ss2_3', studentName: 'Israel Danjuma', assignmentScore: 7, classworkScore: 7, projectScore: 7, testScore: 14, examScore: 34, totalScore: 69, grade: 'B', positionInSubject: 3, teacherRemark: 'Encouraging result, keep pushing.' }
    ]
  }
];

export const INITIAL_HOMEWORK: HomeworkItem[] = [
  {
    id: 'hw_001',
    schoolId: 'school_apex',
    classId: 'cls_ss3',
    className: 'SS 3',
    subject: 'Physics',
    teacherName: 'Mr. David Okon',
    title: 'Faraday’s Law Numerical Problem Set',
    description: 'Complete questions 1 through 8 in Chapter 7 on electromagnetic induction. Show all unit derivations clearly.',
    dueDate: '2026-08-12',
    createdAt: '2026-08-05T15:00:00.000Z'
  },
  {
    id: 'hw_002',
    schoolId: 'school_apex',
    classId: 'cls_ss3',
    className: 'SS 3',
    subject: 'Mathematics',
    teacherName: 'Mr. David Okon',
    title: 'Calculus - Limits & Differentiation Rules',
    description: 'Solve problem sheet 4B from page 112. Pay close attention to product and quotient rule problems.',
    dueDate: '2026-08-14',
    createdAt: '2026-08-06T10:00:00.000Z'
  },
  {
    id: 'hw_003',
    schoolId: 'school_apex',
    classId: 'cls_ss2',
    className: 'SS 2',
    subject: 'Physics',
    teacherName: 'Mr. David Okon',
    title: 'Heat Capacity & Latent Heat Calculations',
    description: 'Calculate specific heat capacities for brass and copper from lab trial readings.',
    dueDate: '2026-08-15',
    createdAt: '2026-08-06T12:00:00.000Z'
  }
];

export const INITIAL_TIMETABLES: Record<string, TimetableDay[]> = {
  cls_ss3: [
    {
      day: 'Monday',
      periods: [
        { id: 'p1', time: '08:00 AM - 08:45 AM', subject: 'Mathematics', teacherName: 'Mr. David Okon', venue: 'SS 3 Room 1' },
        { id: 'p2', time: '08:45 AM - 09:30 AM', subject: 'Physics', teacherName: 'Mr. David Okon', venue: 'SS 3 Room 1' },
        { id: 'p3', time: '09:30 AM - 10:15 AM', subject: 'Chemistry', teacherName: 'Dr. Vance', venue: 'Science Lab' },
        { id: 'p4', time: '10:15 AM - 10:45 AM', subject: 'Morning Break', isBreak: true },
        { id: 'p5', time: '10:45 AM - 11:30 AM', subject: 'English Language', teacherName: 'Mrs. Sarah Jenkins', venue: 'SS 3 Room 1' },
        { id: 'p6', time: '11:30 AM - 12:15 PM', subject: 'Biology', teacherName: 'Mrs. Sarah Jenkins', venue: 'SS 3 Room 1' }
      ]
    },
    {
      day: 'Tuesday',
      periods: [
        { id: 'p7', time: '08:00 AM - 08:45 AM', subject: 'Physics (Lab)', teacherName: 'Mr. David Okon', venue: 'Physics Lab' },
        { id: 'p8', time: '08:45 AM - 09:30 AM', subject: 'Physics (Lab)', teacherName: 'Mr. David Okon', venue: 'Physics Lab' },
        { id: 'p9', time: '09:30 AM - 10:15 AM', subject: 'Further Mathematics', teacherName: 'Mr. David Okon', venue: 'SS 3 Room 1' },
        { id: 'p10', time: '10:15 AM - 10:45 AM', subject: 'Morning Break', isBreak: true },
        { id: 'p11', time: '10:45 AM - 11:30 AM', subject: 'Computer Studies', teacherName: 'Mr. Chimedi Nwosu', venue: 'ICT Suite' },
        { id: 'p12', time: '11:30 AM - 12:15 PM', subject: 'Civic Education', teacherName: 'Mrs. Sarah Jenkins', venue: 'SS 3 Room 1' }
      ]
    },
    {
      day: 'Wednesday',
      periods: [
        { id: 'p13', time: '08:00 AM - 08:45 AM', subject: 'English Language', teacherName: 'Mrs. Sarah Jenkins', venue: 'SS 3 Room 1' },
        { id: 'p14', time: '08:45 AM - 09:30 AM', subject: 'Mathematics', teacherName: 'Mr. David Okon', venue: 'SS 3 Room 1' },
        { id: 'p15', time: '09:30 AM - 10:15 AM', subject: 'Chemistry (Lab)', teacherName: 'Dr. Vance', venue: 'Chemistry Lab' },
        { id: 'p16', time: '10:15 AM - 10:45 AM', subject: 'Morning Break', isBreak: true },
        { id: 'p17', time: '10:45 AM - 11:30 AM', subject: 'Agricultural Science', teacherName: 'Mr. Chimedi Nwosu', venue: 'SS 3 Room 1' },
        { id: 'p18', time: '11:30 AM - 12:15 PM', subject: 'Economics', teacherName: 'Mrs. Sarah Jenkins', venue: 'SS 3 Room 1' }
      ]
    },
    {
      day: 'Thursday',
      periods: [
        { id: 'p19', time: '08:00 AM - 08:45 AM', subject: 'Physics', teacherName: 'Mr. David Okon', venue: 'SS 3 Room 1' },
        { id: 'p20', time: '08:45 AM - 09:30 AM', subject: 'Mathematics', teacherName: 'Mr. David Okon', venue: 'SS 3 Room 1' },
        { id: 'p21', time: '09:30 AM - 10:15 AM', subject: 'Biology (Lab)', teacherName: 'Mrs. Sarah Jenkins', venue: 'Biology Lab' },
        { id: 'p22', time: '10:15 AM - 10:45 AM', subject: 'Morning Break', isBreak: true },
        { id: 'p23', time: '10:45 AM - 11:30 AM', subject: 'Further Mathematics', teacherName: 'Mr. David Okon', venue: 'SS 3 Room 1' },
        { id: 'p24', time: '11:30 AM - 12:15 PM', subject: 'Sports / Physical Ed', teacherName: 'Mr. Chimedi Nwosu', venue: 'Sports Ground' }
      ]
    },
    {
      day: 'Friday',
      periods: [
        { id: 'p25', time: '08:00 AM - 08:45 AM', subject: 'Civic Education', teacherName: 'Mrs. Sarah Jenkins', venue: 'SS 3 Room 1' },
        { id: 'p26', time: '08:45 AM - 09:30 AM', subject: 'Computer Studies (Practical)', teacherName: 'Mr. Chimedi Nwosu', venue: 'ICT Suite' },
        { id: 'p27', time: '09:30 AM - 10:15 AM', subject: 'Weekly Assessment Test', teacherName: 'All Subject Teachers', venue: 'SS 3 Room 1' },
        { id: 'p28', time: '10:15 AM - 10:45 AM', subject: 'Short Break', isBreak: true },
        { id: 'p29', time: '10:45 AM - 12:00 PM', subject: 'Clubs & Societies', teacherName: 'School Admin', venue: 'School Auditorium' }
      ]
    }
  ]
};

export const INITIAL_CLASS_TIMETABLES: ClassTimetable[] = [
  {
    id: 'ct_ss3',
    schoolId: 'school_apex',
    classId: 'cls_ss3',
    className: 'SS 3',
    academicSession: '2025/2026',
    academicTerm: 'First Term',
    days: INITIAL_TIMETABLES.cls_ss3,
    updatedAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'ct_ss2',
    schoolId: 'school_apex',
    classId: 'cls_ss2',
    className: 'SS 2',
    academicSession: '2025/2026',
    academicTerm: 'First Term',
    days: [
      {
        day: 'Monday',
        periods: [
          { id: 'p_s2_1', time: '08:00 AM - 08:45 AM', subject: 'Physics', teacherName: 'Mr. David Okon', venue: 'SS 2 Room 1' },
          { id: 'p_s2_2', time: '08:45 AM - 09:30 AM', subject: 'Mathematics', teacherName: 'Mr. David Okon', venue: 'SS 2 Room 1' },
          { id: 'p_s2_3', time: '09:30 AM - 10:15 AM', subject: 'English Language', teacherName: 'Mrs. Sarah Jenkins', venue: 'SS 2 Room 1' },
          { id: 'p_s2_4', time: '10:15 AM - 10:45 AM', subject: 'Break', isBreak: true },
          { id: 'p_s2_5', time: '10:45 AM - 11:30 AM', subject: 'Chemistry', teacherName: 'Dr. Vance', venue: 'Science Lab' }
        ]
      },
      {
        day: 'Tuesday',
        periods: [
          { id: 'p_s2_6', time: '08:00 AM - 08:45 AM', subject: 'Biology', teacherName: 'Mrs. Sarah Jenkins', venue: 'Biology Lab' },
          { id: 'p_s2_7', time: '08:45 AM - 09:30 AM', subject: 'Economics', teacherName: 'Mrs. Sarah Jenkins', venue: 'SS 2 Room 1' },
          { id: 'p_s2_8', time: '09:30 AM - 10:15 AM', subject: 'Further Mathematics', teacherName: 'Mr. David Okon', venue: 'SS 2 Room 1' }
        ]
      }
    ],
    updatedAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'ct_pri3',
    schoolId: 'school_apex',
    classId: 'cls_pri3',
    className: 'Primary 3',
    academicSession: '2025/2026',
    academicTerm: 'First Term',
    days: [
      {
        day: 'Monday',
        periods: [
          { id: 'p_p3_1', time: '08:00 AM - 08:30 AM', subject: 'Morning Assembly', isBreak: true },
          { id: 'p_p3_2', time: '08:30 AM - 09:15 AM', subject: 'Mathematics', teacherName: 'Mr. Chimedi Nwosu', venue: 'Primary 3 Room' },
          { id: 'p_p3_3', time: '09:15 AM - 10:00 AM', subject: 'English Language', teacherName: 'Mr. Chimedi Nwosu', venue: 'Primary 3 Room' },
          { id: 'p_p3_4', time: '10:00 AM - 10:30 AM', subject: 'Snack Break', isBreak: true },
          { id: 'p_p3_5', time: '10:30 AM - 11:15 AM', subject: 'Basic Science & Tech', teacherName: 'Mr. Chimedi Nwosu', venue: 'Primary 3 Room' }
        ]
      }
    ],
    updatedAt: '2026-08-01T08:00:00.000Z'
  }
];

export const INITIAL_EXAM_TIMETABLES: ExamTimetable[] = [
  {
    id: 'et_ss3',
    schoolId: 'school_apex',
    classId: 'cls_ss3',
    className: 'SS 3',
    examTitle: 'First Term Final Examinations 2025/2026',
    academicSession: '2025/2026',
    academicTerm: 'First Term',
    updatedAt: '2026-08-05T10:00:00.000Z',
    entries: [
      {
        id: 'ee_ss3_1',
        date: '2026-03-23',
        day: 'Monday',
        timeSlot: '09:00 AM - 11:30 AM',
        subject: 'Mathematics (Paper I & II)',
        hallOrVenue: 'Main Multipurpose Hall',
        invigilators: 'Mr. David Okon, Mrs. Sarah Jenkins',
        instructions: 'Non-programmable scientific calculators and geometric sets required.'
      },
      {
        id: 'ee_ss3_2',
        date: '2026-03-23',
        day: 'Monday',
        timeSlot: '01:00 PM - 02:30 PM',
        subject: 'Civic Education',
        hallOrVenue: 'Main Multipurpose Hall',
        invigilators: 'Mr. Chimedi Nwosu',
        instructions: 'Answer all 50 multiple-choice questions on OMR sheet.'
      },
      {
        id: 'ee_ss3_3',
        date: '2026-03-24',
        day: 'Tuesday',
        timeSlot: '09:00 AM - 11:30 AM',
        subject: 'English Language (Essay & Objective)',
        hallOrVenue: 'Main Multipurpose Hall',
        invigilators: 'Mrs. Sarah Jenkins, Dr. Eleanor Vance',
        instructions: 'Use blue or black fountain/ballpoint pen only.'
      },
      {
        id: 'ee_ss3_4',
        date: '2026-03-24',
        day: 'Tuesday',
        timeSlot: '01:00 PM - 03:00 PM',
        subject: 'Physics (Practical Test)',
        hallOrVenue: 'Physics Laboratory',
        invigilators: 'Mr. David Okon',
        instructions: 'Candidates must bring a clear ruler, pencil, and lab coat.'
      },
      {
        id: 'ee_ss3_5',
        date: '2026-03-25',
        day: 'Wednesday',
        timeSlot: '09:00 AM - 11:30 AM',
        subject: 'Chemistry (Alternative to Practical)',
        hallOrVenue: 'Chemistry Laboratory',
        invigilators: 'Dr. Eleanor Vance',
        instructions: 'Strict quiet required in the science laboratory block.'
      },
      {
        id: 'ee_ss3_6',
        date: '2026-03-26',
        day: 'Thursday',
        timeSlot: '09:00 AM - 11:00 AM',
        subject: 'Biology (Theory & Practical)',
        hallOrVenue: 'Main Multipurpose Hall',
        invigilators: 'Mrs. Sarah Jenkins',
        instructions: 'Dissection kit and sharp HB pencils needed for diagrams.'
      },
      {
        id: 'ee_ss3_7',
        date: '2026-03-27',
        day: 'Friday',
        timeSlot: '09:00 AM - 11:00 AM',
        subject: 'Computer Studies (Practical On-Screen Test)',
        hallOrVenue: 'ICT Suite 1',
        invigilators: 'Mr. Chimedi Nwosu',
        instructions: 'Individual workstation assignment will be posted at hall entrance.'
      }
    ]
  },
  {
    id: 'et_jss2',
    schoolId: 'school_apex',
    classId: 'cls_jss2',
    className: 'JSS 2',
    examTitle: 'First Term Final Examinations 2025/2026',
    academicSession: '2025/2026',
    academicTerm: 'First Term',
    updatedAt: '2026-08-05T10:00:00.000Z',
    entries: [
      {
        id: 'ee_jss2_1',
        date: '2026-03-23',
        day: 'Monday',
        timeSlot: '09:00 AM - 10:30 AM',
        subject: 'Mathematics',
        hallOrVenue: 'JSS Block Hall A',
        invigilators: 'Mrs. Sarah Jenkins',
        instructions: 'Mathematical set is compulsory.'
      },
      {
        id: 'ee_jss2_2',
        date: '2026-03-24',
        day: 'Tuesday',
        timeSlot: '09:00 AM - 10:30 AM',
        subject: 'English Language',
        hallOrVenue: 'JSS Block Hall A',
        invigilators: 'Mr. Chimedi Nwosu',
        instructions: 'Dictionary allowed for Section C comprehension check.'
      }
    ]
  }
];

export const INITIAL_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'cr_101',
    schoolId: 'school_apex',
    studentId: 'std_ss3_1',
    studentName: 'Adebayo Tobi',
    className: 'SS 3',
    parentUserId: 'usr_p1',
    parentName: 'Chief Adebayo Tobi Sr.',
    teacherUserId: 'usr_t1',
    teacherName: 'Mr. David Okon',
    subject: 'Physics & Mathematics Academic Progress',
    lastMessage: 'Thank you Mr. Okon. Tobi will work hard on his calculus problem set tonight.',
    lastMessageAt: '2026-08-08T15:45:00.000Z',
    unreadByParent: false,
    unreadByTeacher: false,
    createdAt: '2026-08-07T10:00:00.000Z'
  },
  {
    id: 'cr_102',
    schoolId: 'school_apex',
    studentId: 'std_ss2_1',
    studentName: 'Grace Ibrahim',
    className: 'SS 2',
    parentUserId: 'usr_p1',
    parentName: 'Chief Adebayo Tobi Sr.',
    teacherUserId: 'usr_t1',
    teacherName: 'Mr. David Okon',
    subject: 'Class Transfer & Physics Score Inquiry',
    lastMessage: 'Grace has adapted remarkably well to SS 2 Science. Her score was 89% in the recent test!',
    lastMessageAt: '2026-08-09T11:20:00.000Z',
    unreadByParent: true,
    unreadByTeacher: false,
    createdAt: '2026-08-08T09:30:00.000Z'
  },
  {
    id: 'cr_103',
    schoolId: 'school_apex',
    studentId: 'std_pri3_1',
    studentName: 'Joy Nnamdi',
    className: 'Primary 3',
    parentUserId: 'usr_p1',
    parentName: 'Chief Adebayo Tobi Sr.',
    teacherUserId: 'usr_t3',
    teacherName: 'Mr. Chimedi Nwosu',
    subject: 'Basic Science Nature Excursion Project',
    lastMessage: 'Good afternoon Mr. Nwosu, please let us know if Joy needs extra drawing materials for her plant project.',
    lastMessageAt: '2026-08-10T14:10:00.000Z',
    unreadByParent: false,
    unreadByTeacher: true,
    createdAt: '2026-08-09T14:00:00.000Z'
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  // Room cr_101
  {
    id: 'msg_001',
    chatRoomId: 'cr_101',
    senderId: 'usr_p1',
    senderName: 'Chief Adebayo Tobi Sr.',
    senderRole: 'PARENT',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    content: 'Good day Mr. Okon. I wanted to check on Tobi’s readiness for the upcoming West African Physics mock examinations.',
    createdAt: '2026-08-07T10:05:00.000Z'
  },
  {
    id: 'msg_002',
    chatRoomId: 'cr_101',
    senderId: 'usr_t1',
    senderName: 'Mr. David Okon',
    senderRole: 'TEACHER',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    content: 'Hello Chief Adebayo! Tobi is performing exceptionally well. He scored 89 in Physics and 93 in Mathematics on his last term sheets. He just needs to review calculus derivation proofs.',
    createdAt: '2026-08-07T11:15:00.000Z'
  },
  {
    id: 'msg_003',
    chatRoomId: 'cr_101',
    senderId: 'usr_proprietor1',
    senderName: 'Chief Dr. Arthur Pendelton',
    senderRole: 'PROPRIETOR',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    content: '[Proprietor Executive Note]: Great work Mr. Okon and Chief Adebayo. The school board is proud of Tobi’s academic trajectory.',
    createdAt: '2026-08-07T14:00:00.000Z'
  },
  {
    id: 'msg_004',
    chatRoomId: 'cr_101',
    senderId: 'usr_p1',
    senderName: 'Chief Adebayo Tobi Sr.',
    senderRole: 'PARENT',
    content: 'Thank you Mr. Okon. Tobi will work hard on his calculus problem set tonight.',
    createdAt: '2026-08-08T15:45:00.000Z'
  },

  // Room cr_102
  {
    id: 'msg_005',
    chatRoomId: 'cr_102',
    senderId: 'usr_p1',
    senderName: 'Chief Adebayo Tobi Sr.',
    senderRole: 'PARENT',
    content: 'Hello Mr. Okon, how is Grace adjusting after her recent transfer to the SS 2 Science Arm?',
    createdAt: '2026-08-08T09:35:00.000Z'
  },
  {
    id: 'msg_006',
    chatRoomId: 'cr_102',
    senderId: 'usr_t1',
    senderName: 'Mr. David Okon',
    senderRole: 'TEACHER',
    content: 'Grace has adapted remarkably well to SS 2 Science. Her score was 89% in the recent test!',
    createdAt: '2026-08-09T11:20:00.000Z'
  },

  // Room cr_103
  {
    id: 'msg_007',
    chatRoomId: 'cr_103',
    senderId: 'usr_p1',
    senderName: 'Chief Adebayo Tobi Sr.',
    senderRole: 'PARENT',
    content: 'Good afternoon Mr. Nwosu, please let us know if Joy needs extra drawing materials for her plant project.',
    createdAt: '2026-08-10T14:10:00.000Z'
  }
];

export const INITIAL_PUBLIC_CHAT_MESSAGES: PublicChatMessage[] = [
  {
    id: 'pmsg_001',
    schoolId: 'school_apex',
    channel: 'general-announcements',
    senderId: 'usr_proprietor1',
    senderName: 'Chief Dr. Arthur Pendelton',
    senderRole: 'PROPRIETOR',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    content: 'Welcome parents, teachers, vice principals, and administrators to the official TeXora Academic Communication Forum! We invite all stakeholders to share general feedback and school announcements here.',
    createdAt: '2026-08-01T09:00:00.000Z'
  },
  {
    id: 'pmsg_002',
    schoolId: 'school_apex',
    channel: 'general-announcements',
    senderId: 'usr_vp1',
    senderName: 'Dr. (Mrs.) Funke Adeyemi',
    senderRole: 'VICE_PRINCIPAL',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    content: 'Reminder to all parents: The First Term Mid-Term Break commences on Thursday next week. Continuous assessment scoreheets are currently open for review.',
    createdAt: '2026-08-05T10:30:00.000Z'
  },
  {
    id: 'pmsg_003',
    schoolId: 'school_apex',
    channel: 'pta-forum',
    senderId: 'usr_p1',
    senderName: 'Chief Adebayo Tobi Sr.',
    senderRole: 'PARENT',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    content: 'Good day executives and teachers. On behalf of the Parent-Teacher Association, we commend the school management on the newly upgraded Science and Robotics laboratory.',
    createdAt: '2026-08-08T11:15:00.000Z'
  },
  {
    id: 'pmsg_004',
    schoolId: 'school_apex',
    channel: 'pta-forum',
    senderId: 'usr_t1',
    senderName: 'Mr. David Okon',
    senderRole: 'TEACHER',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    content: 'Thank you Chief Adebayo! The SS 2 and SS 3 Physics students have already begun using the digital oscilloscopes and optics kits.',
    createdAt: '2026-08-08T12:00:00.000Z'
  },
  {
    id: 'pmsg_005',
    schoolId: 'school_apex',
    channel: 'academic-qa',
    senderId: 'usr_p1',
    senderName: 'Chief Adebayo Tobi Sr.',
    senderRole: 'PARENT',
    content: 'Please could someone clarify the deadline for submitting SS 3 West African Mock Examination registration slips?',
    createdAt: '2026-08-09T14:20:00.000Z'
  },
  {
    id: 'pmsg_006',
    schoolId: 'school_apex',
    channel: 'academic-qa',
    senderId: 'usr_admin1',
    senderName: 'Mrs. Folake Solanke',
    senderRole: 'SCHOOL_ADMIN',
    content: 'Hello Chief Adebayo, all WAEC mock examination slips should be submitted to the Administrative Block by Friday at 4:00 PM.',
    createdAt: '2026-08-09T15:00:00.000Z'
  }
];

export const INITIAL_EXAM_SETS: GeneratedExamSet[] = [
  {
    id: 'exam_set_001',
    schoolId: 'school_apex',
    teacherId: 'usr_t1',
    teacherName: 'Mr. David Okon',
    classId: 'cls_ss3',
    className: 'SS 3',
    subject: 'Physics',
    lessonNoteId: 'sub_001',
    lessonNoteTitle: 'Electromagnetic Induction & Faraday’s Laws',
    title: 'SS 3 Physics - Terminal Examination Questions (Electromagnetic Induction)',
    academicTerm: 'First Term',
    academicSession: '2025/2026',
    instructions: 'Answer ALL questions in Section A (Multiple Choice) and any TWO questions in Section B (Theory). Show all working clearly.',
    totalMarks: 50,
    createdAt: '2026-08-06T10:00:00.000Z',
    updatedAt: '2026-08-06T10:00:00.000Z',
    questions: [
      {
        id: 'q_001',
        type: 'MULTIPLE_CHOICE',
        questionText: 'According to Faraday’s Law of Electromagnetic Induction, the magnitude of induced e.m.f in a conductor is directly proportional to:',
        options: [
          'A. The electrical resistance of the coil',
          'B. The rate of change of magnetic flux linkage',
          'C. The temperature of the magnet',
          'D. The electrostatic charge accumulated'
        ],
        correctAnswer: 'B. The rate of change of magnetic flux linkage',
        explanation: 'Faraday’s Law states that induced e.m.f is directly proportional to the rate at which magnetic flux linkage changes.',
        marks: 5
      },
      {
        id: 'q_002',
        type: 'MULTIPLE_CHOICE',
        questionText: 'Which law accounts for the negative sign in Neumann’s equation E = -N (dΦ/dt)?',
        options: [
          'A. Joule’s Law',
          'B. Ohm’s Law',
          'C. Lenz’s Law',
          'D. Coulomb’s Law'
        ],
        correctAnswer: 'C. Lenz’s Law',
        explanation: 'Lenz’s law states that an induced current always flows in a direction that opposes the change producing it, maintaining conservation of energy.',
        marks: 5
      },
      {
        id: 'q_003',
        type: 'TRUE_FALSE',
        questionText: 'An induced electromotive force (e.m.f) is generated even when a magnet remains completely stationary inside a copper coil.',
        correctAnswer: 'False',
        explanation: 'Induction requires relative motion between the conductor and magnetic field line cuts (dΦ/dt > 0).',
        marks: 5
      },
      {
        id: 'q_004',
        type: 'SHORT_ANSWER',
        questionText: 'State two practical methods used in modern electrical generators to increase the magnitude of induced current.',
        correctAnswer: '1. Increasing the number of turns in the armature coil. 2. Rotating the coil faster in a stronger magnetic field.',
        explanation: 'Both increasing coil turns N and speed of rotation increase dΦ/dt.',
        marks: 10
      },
      {
        id: 'q_005',
        type: 'ESSAY',
        questionText: 'A coil of 200 turns is linked by a magnetic flux of 0.05 Weber. If the flux is uniformly reduced to 0.01 Weber in 0.02 seconds, calculate the average induced electromotive force (e.m.f).',
        correctAnswer: 'E = -N * (ΔΦ / Δt) = 200 * ((0.05 - 0.01) / 0.02) = 200 * (0.04 / 0.02) = 200 * 2 = 400 Volts.',
        explanation: 'Using Neumann equation E = N * ΔΦ/Δt.',
        marks: 25
      }
    ]
  },
  {
    id: 'exam_set_002',
    schoolId: 'school_apex',
    teacherId: 'usr_t1',
    teacherName: 'Mr. David Okon',
    classId: 'cls_ss2',
    className: 'SS 2',
    subject: 'Mathematics',
    lessonNoteId: 'sub_002',
    lessonNoteTitle: 'Quadratic Equations & Completing the Square',
    title: 'SS 2 Mathematics - Mid-Term Assessment Paper (Algebraic Equations)',
    academicTerm: 'First Term',
    academicSession: '2025/2026',
    instructions: 'All steps must be clearly shown. Use of non-programmable scientific calculator is allowed.',
    totalMarks: 40,
    createdAt: '2026-08-07T11:30:00.000Z',
    updatedAt: '2026-08-07T11:30:00.000Z',
    questions: [
      {
        id: 'q_101',
        type: 'MULTIPLE_CHOICE',
        questionText: 'What term must be added to x² + 10x to complete the square and make it a perfect square quadratic expression?',
        options: [
          'A. 10',
          'B. 20',
          'C. 25',
          'D. 100'
        ],
        correctAnswer: 'C. 25',
        explanation: 'The term to add is (b/2)² = (10/2)² = 5² = 25.',
        marks: 5
      },
      {
        id: 'q_102',
        type: 'SHORT_ANSWER',
        questionText: 'Solve 2x² + 5x - 3 = 0 using the completing the square method.',
        correctAnswer: 'x = 0.5 or x = -3',
        explanation: 'Divide by 2: x² + 2.5x = 1.5. Add (1.25)²: (x + 1.25)² = 3.0625. Square root gives x + 1.25 = ±1.75.',
        marks: 15
      },
      {
        id: 'q_103',
        type: 'ESSAY',
        questionText: 'Derive the general quadratic formula x = (-b ± √(b² - 4ac)) / (2a) by completing the square on ax² + bx + c = 0.',
        correctAnswer: 'Divide by a -> x² + (b/a)x = -c/a. Add (b/2a)² -> (x + b/2a)² = (b² - 4ac)/(4a²). Take square root -> x = (-b ± √(b² - 4ac)) / 2a.',
        explanation: 'Standard proof of the quadratic formula from general quadratic equation.',
        marks: 20
      }
    ]
  }
];


