import { supabase, isSupabaseConfigured } from './supabase';
import type {
  School,
  User,
  SchoolClass,
  Student,
  Submission,
  AttendanceRecord,
  NotificationItem
} from '../types';

export class SupabaseService {
  // ------------------------------------------------------------------
  // AUTHENTICATION
  // ------------------------------------------------------------------
  static async signUp(email: string, password: string, userData?: Partial<User>) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase credentials not configured yet.') };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (data.user && userData) {
      await this.upsertUser({
        id: data.user.id,
        schoolId: userData.schoolId || '',
        name: userData.name || email.split('@')[0],
        email: email,
        role: userData.role || 'TEACHER',
        avatarUrl: userData.avatarUrl,
        phone: userData.phone,
        employeeId: userData.employeeId,
        assignedClassIds: userData.assignedClassIds || [],
        assignedSubjects: userData.assignedSubjects || [],
        active: true,
        createdAt: new Date().toISOString()
      });
    }

    return { data, error };
  }

  static async signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase credentials not configured yet.') };
    }
    return await supabase.auth.signInWithPassword({ email, password });
  }

  static async signOut() {
    if (!isSupabaseConfigured()) return { error: null };
    return await supabase.auth.signOut();
  }

  static async getSession() {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  // ------------------------------------------------------------------
  // SCHOOLS
  // ------------------------------------------------------------------
  static async getSchools(): Promise<School[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await (supabase.from('schools') as any).select('*').order('created_at', { ascending: true });
    if (error || !data) return [];
    return (data as any[]).map(s => ({
      id: s.id,
      name: s.name,
      motto: s.motto || '',
      code: s.code,
      logoUrl: s.logo_url || undefined,
      address: s.address || '',
      academicSession: s.academic_session,
      academicTerm: s.academic_term as any,
      subjects: s.subjects || [],
      createdAt: s.created_at
    }));
  }

  static async upsertSchool(school: School): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { error } = await (supabase.from('schools') as any).upsert({
      id: school.id,
      name: school.name,
      motto: school.motto,
      code: school.code,
      logo_url: school.logoUrl,
      address: school.address,
      academic_session: school.academicSession,
      academic_term: school.academicTerm,
      subjects: school.subjects || [],
      created_at: school.createdAt
    });
    return !error;
  }

  // ------------------------------------------------------------------
  // USERS
  // ------------------------------------------------------------------
  static async getUsers(schoolId?: string): Promise<User[]> {
    if (!isSupabaseConfigured()) return [];
    let query = (supabase.from('users') as any).select('*');
    if (schoolId) query = query.eq('school_id', schoolId);
    const { data, error } = await query;
    if (error || !data) return [];
    return (data as any[]).map(u => ({
      id: u.id,
      schoolId: u.school_id,
      name: u.name,
      email: u.email,
      role: u.role as any,
      avatarUrl: u.avatar_url || undefined,
      phone: u.phone || undefined,
      employeeId: u.employee_id || undefined,
      assignedClassIds: u.assigned_class_ids || [],
      assignedSubjects: u.assigned_subjects || [],
      active: u.active ?? true,
      createdAt: u.created_at
    }));
  }

  static async upsertUser(user: User): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { error } = await (supabase.from('users') as any).upsert({
      id: user.id,
      school_id: user.schoolId,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatarUrl,
      phone: user.phone,
      employee_id: user.employeeId,
      assigned_class_ids: user.assignedClassIds || [],
      assigned_subjects: user.assignedSubjects || [],
      active: user.active,
      created_at: user.createdAt
    });
    return !error;
  }

  static async deleteUser(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { error } = await (supabase.from('users') as any).delete().eq('id', id);
    return !error;
  }

  // ------------------------------------------------------------------
  // CLASSES
  // ------------------------------------------------------------------
  static async getClasses(schoolId?: string): Promise<SchoolClass[]> {
    if (!isSupabaseConfigured()) return [];
    let query = (supabase.from('classes') as any).select('*');
    if (schoolId) query = query.eq('school_id', schoolId);
    const { data, error } = await query;
    if (error || !data) return [];
    return (data as any[]).map(c => ({
      id: c.id,
      schoolId: c.school_id,
      name: c.name,
      category: c.category as any,
      arm: c.arm || undefined,
      capacity: c.capacity ?? 30
    }));
  }

  static async upsertClass(cls: SchoolClass): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { error } = await (supabase.from('classes') as any).upsert({
      id: cls.id,
      school_id: cls.schoolId,
      name: cls.name,
      category: cls.category,
      arm: cls.arm,
      capacity: cls.capacity
    });
    return !error;
  }

  // ------------------------------------------------------------------
  // STUDENTS
  // ------------------------------------------------------------------
  static async getStudents(schoolId?: string): Promise<Student[]> {
    if (!isSupabaseConfigured()) return [];
    let query = (supabase.from('students') as any).select('*');
    if (schoolId) query = query.eq('school_id', schoolId);
    const { data, error } = await query;
    if (error || !data) return [];
    return (data as any[]).map(s => ({
      id: s.id,
      schoolId: s.school_id,
      classId: s.class_id,
      admissionNo: s.admission_no,
      fullName: s.full_name,
      gender: s.gender as any,
      guardianName: s.guardian_name,
      guardianPhone: s.guardian_phone,
      accessCode: s.access_code || `PAR-2026-${s.id.slice(-4)}`,
      active: s.active ?? true
    }));
  }

  static async upsertStudent(student: Student): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { error } = await (supabase.from('students') as any).upsert({
      id: student.id,
      school_id: student.schoolId,
      class_id: student.classId,
      admission_no: student.admissionNo,
      full_name: student.fullName,
      gender: student.gender,
      guardian_name: student.guardianName,
      guardian_phone: student.guardianPhone,
      active: student.active
    });
    return !error;
  }

  static async deleteStudent(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { error } = await (supabase.from('students') as any).delete().eq('id', id);
    return !error;
  }

  // ------------------------------------------------------------------
  // SUBMISSIONS
  // ------------------------------------------------------------------
  static async getSubmissions(schoolId?: string): Promise<Submission[]> {
    if (!isSupabaseConfigured()) return [];
    let query = (supabase.from('submissions') as any).select('*').order('created_at', { ascending: false });
    if (schoolId) query = query.eq('school_id', schoolId);
    const { data, error } = await query;
    if (error || !data) return [];
    return (data as any[]).map(s => ({
      id: s.id,
      schoolId: s.school_id,
      teacherId: s.teacher_id,
      teacherName: s.teacher_name,
      classId: s.class_id,
      className: s.class_name,
      subject: s.subject,
      type: s.type as any,
      title: s.title,
      status: s.status as any,
      qualityScore: s.quality_score || undefined,
      lessonNoteContent: s.lesson_note_content as any,
      lessonPlanContent: s.lesson_plan_content as any,
      weeklyDiaryContent: s.weekly_diary_content as any,
      pdfAttachment: s.pdf_attachment as any,
      adminFeedback: s.admin_feedback || undefined,
      reviewedByAdminId: s.reviewed_by_admin_id || undefined,
      reviewedAt: s.reviewed_at || undefined,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }));
  }

  static async upsertSubmission(sub: Submission): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { error } = await (supabase.from('submissions') as any).upsert({
      id: sub.id,
      school_id: sub.schoolId,
      teacher_id: sub.teacherId,
      teacher_name: sub.teacherName,
      class_id: sub.classId,
      class_name: sub.className,
      subject: sub.subject,
      type: sub.type,
      title: sub.title,
      status: sub.status,
      quality_score: sub.qualityScore,
      lesson_note_content: sub.lessonNoteContent as any,
      lesson_plan_content: sub.lessonPlanContent as any,
      weekly_diary_content: sub.weeklyDiaryContent as any,
      pdf_attachment: sub.pdfAttachment as any,
      admin_feedback: sub.adminFeedback,
      reviewed_by_admin_id: sub.reviewedByAdminId,
      reviewed_at: sub.reviewedAt,
      created_at: sub.createdAt,
      updated_at: sub.updatedAt
    });
    return !error;
  }

  static async deleteSubmission(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { error } = await (supabase.from('submissions') as any).delete().eq('id', id);
    return !error;
  }

  // ------------------------------------------------------------------
  // ATTENDANCE RECORDS
  // ------------------------------------------------------------------
  static async getAttendanceRecords(schoolId?: string): Promise<AttendanceRecord[]> {
    if (!isSupabaseConfigured()) return [];
    let query = (supabase.from('attendance') as any).select('*').order('date', { ascending: false });
    if (schoolId) query = query.eq('school_id', schoolId);
    const { data, error } = await query;
    if (error || !data) return [];
    return (data as any[]).map(a => ({
      id: a.id,
      schoolId: a.school_id,
      classId: a.class_id,
      className: a.class_name,
      subject: a.subject || undefined,
      date: a.date,
      teacherId: a.teacher_id,
      teacherName: a.teacher_name,
      records: a.records as any,
      createdAt: a.created_at
    }));
  }

  static async upsertAttendanceRecord(rec: AttendanceRecord): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { error } = await (supabase.from('attendance') as any).upsert({
      id: rec.id,
      school_id: rec.schoolId,
      class_id: rec.classId,
      class_name: rec.className,
      subject: rec.subject,
      date: rec.date,
      teacher_id: rec.teacherId,
      teacher_name: rec.teacherName,
      records: rec.records as any,
      created_at: rec.createdAt
    });
    return !error;
  }

  // ------------------------------------------------------------------
  // NOTIFICATIONS
  // ------------------------------------------------------------------
  static async getNotifications(schoolId?: string): Promise<NotificationItem[]> {
    if (!isSupabaseConfigured()) return [];
    let query = (supabase.from('notifications') as any).select('*').order('created_at', { ascending: false });
    if (schoolId) query = query.eq('school_id', schoolId);
    const { data, error } = await query;
    if (error || !data) return [];
    return (data as any[]).map(n => ({
      id: n.id,
      schoolId: n.school_id,
      recipientUserId: n.recipient_user_id,
      senderName: n.sender_name,
      title: n.title,
      message: n.message,
      type: n.type as any,
      read: n.read,
      linkId: n.link_id || undefined,
      createdAt: n.created_at
    }));
  }

  static async upsertNotification(notif: NotificationItem): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { error } = await (supabase.from('notifications') as any).upsert({
      id: notif.id,
      school_id: notif.schoolId,
      recipient_user_id: notif.recipientUserId,
      sender_name: notif.senderName,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      read: notif.read,
      link_id: notif.linkId,
      created_at: notif.createdAt
    });
    return !error;
  }

  // ------------------------------------------------------------------
  // SEED INITIAL DATA TO SUPABASE (IF TABLES ARE EMPTY)
  // ------------------------------------------------------------------
  static async seedInitialData(
    schools: School[],
    users: User[],
    classes: SchoolClass[],
    students: Student[],
    submissions: Submission[],
    attendance: AttendanceRecord[],
    notifications: NotificationItem[]
  ) {
    if (!isSupabaseConfigured()) return;
    try {
      const existingSchools = await this.getSchools();
      if (existingSchools.length === 0 && schools.length > 0) {
        for (const s of schools) await this.upsertSchool(s);
      }

      const existingUsers = await this.getUsers();
      if (existingUsers.length === 0 && users.length > 0) {
        for (const u of users) await this.upsertUser(u);
      }

      const existingClasses = await this.getClasses();
      if (existingClasses.length === 0 && classes.length > 0) {
        for (const c of classes) await this.upsertClass(c);
      }

      const existingStudents = await this.getStudents();
      if (existingStudents.length === 0 && students.length > 0) {
        for (const st of students) await this.upsertStudent(st);
      }

      const existingSubmissions = await this.getSubmissions();
      if (existingSubmissions.length === 0 && submissions.length > 0) {
        for (const sub of submissions) await this.upsertSubmission(sub);
      }

      const existingAttendance = await this.getAttendanceRecords();
      if (existingAttendance.length === 0 && attendance.length > 0) {
        for (const att of attendance) await this.upsertAttendanceRecord(att);
      }

      const existingNotifications = await this.getNotifications();
      if (existingNotifications.length === 0 && notifications.length > 0) {
        for (const notif of notifications) await this.upsertNotification(notif);
      }
    } catch (err) {
      console.warn('Supabase initial seed error:', err);
    }
  }
}
