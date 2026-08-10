/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { School, User, SchoolClass, Student, Submission, AttendanceRecord, NotificationItem, ScoreSheet, HomeworkItem, TimetableDay } from './types';
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
  // School Admin for Apex Horizon
  {
    id: 'usr_admin1',
    schoolId: 'school_apex',
    name: 'Dr. Eleanor Vance',
    email: 'admin@apexhorizon.edu',
    role: 'SCHOOL_ADMIN',
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
        { time: '08:00 AM - 08:45 AM', subject: 'Mathematics', teacherName: 'Mr. David Okon' },
        { time: '08:45 AM - 09:30 AM', subject: 'Physics', teacherName: 'Mr. David Okon' },
        { time: '09:30 AM - 10:15 AM', subject: 'Chemistry', teacherName: 'Dr. Vance' },
        { time: '10:45 AM - 11:30 AM', subject: 'English Language', teacherName: 'Mrs. Sarah Jenkins' },
        { time: '11:30 AM - 12:15 PM', subject: 'Biology', teacherName: 'Mrs. Sarah Jenkins' }
      ]
    },
    {
      day: 'Tuesday',
      periods: [
        { time: '08:00 AM - 08:45 AM', subject: 'Physics (Lab)', teacherName: 'Mr. David Okon' },
        { time: '08:45 AM - 09:30 AM', subject: 'Physics (Lab)', teacherName: 'Mr. David Okon' },
        { time: '09:30 AM - 10:15 AM', subject: 'Further Mathematics', teacherName: 'Mr. David Okon' },
        { time: '10:45 AM - 11:30 AM', subject: 'Computer Studies', teacherName: 'Mr. Chimedi Nwosu' },
        { time: '11:30 AM - 12:15 PM', subject: 'Civic Education', teacherName: 'Mrs. Sarah Jenkins' }
      ]
    },
    {
      day: 'Wednesday',
      periods: [
        { time: '08:00 AM - 08:45 AM', subject: 'English Language', teacherName: 'Mrs. Sarah Jenkins' },
        { time: '08:45 AM - 09:30 AM', subject: 'Mathematics', teacherName: 'Mr. David Okon' },
        { time: '09:30 AM - 10:15 AM', subject: 'Chemistry (Lab)', teacherName: 'Dr. Vance' },
        { time: '10:45 AM - 11:30 AM', subject: 'Agricultural Science', teacherName: 'Mr. Chimedi Nwosu' },
        { time: '11:30 AM - 12:15 PM', subject: 'Economics', teacherName: 'Mrs. Sarah Jenkins' }
      ]
    },
    {
      day: 'Thursday',
      periods: [
        { time: '08:00 AM - 08:45 AM', subject: 'Physics', teacherName: 'Mr. David Okon' },
        { time: '08:45 AM - 09:30 AM', subject: 'Mathematics', teacherName: 'Mr. David Okon' },
        { time: '09:30 AM - 10:15 AM', subject: 'Biology (Lab)', teacherName: 'Mrs. Sarah Jenkins' },
        { time: '10:45 AM - 11:30 AM', subject: 'Further Mathematics', teacherName: 'Mr. David Okon' },
        { time: '11:30 AM - 12:15 PM', subject: 'Sports / Physical Ed', teacherName: 'Mr. Chimedi Nwosu' }
      ]
    },
    {
      day: 'Friday',
      periods: [
        { time: '08:00 AM - 08:45 AM', subject: 'Civic Education', teacherName: 'Mrs. Sarah Jenkins' },
        { time: '08:45 AM - 09:30 AM', subject: 'Computer Studies (Practical)', teacherName: 'Mr. Chimedi Nwosu' },
        { time: '09:30 AM - 10:15 AM', subject: 'Weekly Assessment Test', teacherName: 'All Subject Teachers' },
        { time: '10:45 AM - 12:00 PM', subject: 'Clubs & Societies', teacherName: 'School Admin' }
      ]
    }
  ]
};
