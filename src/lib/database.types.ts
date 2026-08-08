export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string;
          name: string;
          motto: string | null;
          code: string;
          logo_url: string | null;
          address: string | null;
          academic_session: string;
          academic_term: string;
          subjects: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          motto?: string | null;
          code: string;
          logo_url?: string | null;
          address?: string | null;
          academic_session?: string;
          academic_term?: string;
          subjects?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          motto?: string | null;
          code?: string;
          logo_url?: string | null;
          address?: string | null;
          academic_session?: string;
          academic_term?: string;
          subjects?: string[] | null;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          email: string;
          role: 'SCHOOL_ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT';
          avatar_url: string | null;
          phone: string | null;
          employee_id: string | null;
          assigned_class_ids: string[] | null;
          assigned_subjects: string[] | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          school_id: string;
          name: string;
          email: string;
          role: 'SCHOOL_ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT';
          avatar_url?: string | null;
          phone?: string | null;
          employee_id?: string | null;
          assigned_class_ids?: string[] | null;
          assigned_subjects?: string[] | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          name?: string;
          email?: string;
          role?: 'SCHOOL_ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT';
          avatar_url?: string | null;
          phone?: string | null;
          employee_id?: string | null;
          assigned_class_ids?: string[] | null;
          assigned_subjects?: string[] | null;
          active?: boolean;
          created_at?: string;
        };
      };
      teachers: {
        Row: {
          id: string;
          user_id: string;
          school_id: string;
          employee_id: string;
          specialization: string | null;
          assigned_class_ids: string[];
          assigned_subjects: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          school_id: string;
          employee_id: string;
          specialization?: string | null;
          assigned_class_ids?: string[];
          assigned_subjects?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          school_id?: string;
          employee_id?: string;
          specialization?: string | null;
          assigned_class_ids?: string[];
          assigned_subjects?: string[];
          created_at?: string;
        };
      };
      parents: {
        Row: {
          id: string;
          user_id: string;
          school_id: string;
          full_name: string;
          phone: string;
          email: string;
          address: string | null;
          student_ids: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          school_id: string;
          full_name: string;
          phone: string;
          email: string;
          address?: string | null;
          student_ids?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          school_id?: string;
          full_name?: string;
          phone?: string;
          email?: string;
          address?: string | null;
          student_ids?: string[];
          created_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          category: string;
          arm: string | null;
          capacity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          category: string;
          arm?: string | null;
          capacity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          name?: string;
          category?: string;
          arm?: string | null;
          capacity?: number;
          created_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          code: string | null;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          code?: string | null;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          name?: string;
          code?: string | null;
          category?: string | null;
          created_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          school_id: string;
          class_id: string;
          admission_no: string;
          full_name: string;
          gender: 'Male' | 'Female';
          guardian_name: string;
          guardian_phone: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          class_id: string;
          admission_no: string;
          full_name: string;
          gender: 'Male' | 'Female';
          guardian_name: string;
          guardian_phone: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          class_id?: string;
          admission_no?: string;
          full_name?: string;
          gender?: 'Male' | 'Female';
          guardian_name?: string;
          guardian_phone?: string;
          active?: boolean;
          created_at?: string;
        };
      };
      academic_sessions: {
        Row: {
          id: string;
          school_id: string;
          name: string; // e.g. "2025/2026"
          start_date: string;
          end_date: string;
          is_current: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          is_current?: boolean;
          created_at?: string;
        };
      };
      terms: {
        Row: {
          id: string;
          school_id: string;
          session_id: string;
          name: string; // e.g. "First Term"
          start_date: string;
          end_date: string;
          is_current: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          session_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          session_id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          is_current?: boolean;
          created_at?: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          school_id: string;
          teacher_id: string;
          teacher_name: string;
          class_id: string;
          class_name: string;
          subject: string;
          type: 'LESSON_NOTE' | 'LESSON_PLAN' | 'WEEKLY_DIARY';
          title: string;
          status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
          quality_score: number | null;
          lesson_note_content: Json | null;
          lesson_plan_content: Json | null;
          weekly_diary_content: Json | null;
          pdf_attachment: Json | null;
          admin_feedback: string | null;
          reviewed_by_admin_id: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          teacher_id: string;
          teacher_name: string;
          class_id: string;
          class_name: string;
          subject: string;
          type: 'LESSON_NOTE' | 'LESSON_PLAN' | 'WEEKLY_DIARY';
          title: string;
          status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
          quality_score?: number | null;
          lesson_note_content?: Json | null;
          lesson_plan_content?: Json | null;
          weekly_diary_content?: Json | null;
          pdf_attachment?: Json | null;
          admin_feedback?: string | null;
          reviewed_by_admin_id?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          teacher_id?: string;
          teacher_name?: string;
          class_id?: string;
          class_name?: string;
          subject?: string;
          type?: 'LESSON_NOTE' | 'LESSON_PLAN' | 'WEEKLY_DIARY';
          title?: string;
          status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
          quality_score?: number | null;
          lesson_note_content?: Json | null;
          lesson_plan_content?: Json | null;
          weekly_diary_content?: Json | null;
          pdf_attachment?: Json | null;
          admin_feedback?: string | null;
          reviewed_by_admin_id?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          school_id: string;
          class_id: string;
          class_name: string;
          subject: string | null;
          date: string;
          teacher_id: string;
          teacher_name: string;
          records: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          class_id: string;
          class_name: string;
          subject?: string | null;
          date: string;
          teacher_id: string;
          teacher_name: string;
          records: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          class_id?: string;
          class_name?: string;
          subject?: string | null;
          date?: string;
          teacher_id?: string;
          teacher_name?: string;
          records?: Json;
          created_at?: string;
        };
      };
      assessments: {
        Row: {
          id: string;
          school_id: string;
          class_id: string;
          subject: string;
          title: string;
          type: 'QUIZ' | 'TEST' | 'EXAM' | 'ASSIGNMENT';
          max_score: number;
          term: string;
          academic_session: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          class_id: string;
          subject: string;
          title: string;
          type?: 'QUIZ' | 'TEST' | 'EXAM' | 'ASSIGNMENT';
          max_score?: number;
          term: string;
          academic_session: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          class_id?: string;
          subject?: string;
          title?: string;
          type?: 'QUIZ' | 'TEST' | 'EXAM' | 'ASSIGNMENT';
          max_score?: number;
          term?: string;
          academic_session?: string;
          created_at?: string;
        };
      };
      results: {
        Row: {
          id: string;
          school_id: string;
          assessment_id: string;
          student_id: string;
          score_obtained: number;
          remarks: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          assessment_id: string;
          student_id: string;
          score_obtained: number;
          remarks?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          assessment_id?: string;
          student_id?: string;
          score_obtained?: number;
          remarks?: string | null;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          school_id: string;
          student_id: string;
          title: string;
          amount: number;
          amount_paid: number;
          status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
          due_date: string;
          payment_method: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          student_id: string;
          title: string;
          amount: number;
          amount_paid?: number;
          status?: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
          due_date: string;
          payment_method?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          student_id?: string;
          title?: string;
          amount?: number;
          amount_paid?: number;
          status?: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
          due_date?: string;
          payment_method?: string | null;
          created_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          school_id: string;
          title: string;
          content: string;
          target_audience: 'ALL' | 'TEACHERS' | 'PARENTS' | 'STUDENTS';
          author_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          title: string;
          content: string;
          target_audience?: 'ALL' | 'TEACHERS' | 'PARENTS' | 'STUDENTS';
          author_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          title?: string;
          content?: string;
          target_audience?: 'ALL' | 'TEACHERS' | 'PARENTS' | 'STUDENTS';
          author_name?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          school_id: string;
          recipient_user_id: string;
          sender_name: string;
          title: string;
          message: string;
          type: 'APPROVAL' | 'REJECTION' | 'CORRECTION' | 'SUBMISSION' | 'SYSTEM';
          read: boolean;
          link_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          recipient_user_id: string;
          sender_name: string;
          title: string;
          message: string;
          type?: 'APPROVAL' | 'REJECTION' | 'CORRECTION' | 'SUBMISSION' | 'SYSTEM';
          read?: boolean;
          link_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          recipient_user_id?: string;
          sender_name?: string;
          title?: string;
          message?: string;
          type?: 'APPROVAL' | 'REJECTION' | 'CORRECTION' | 'SUBMISSION' | 'SYSTEM';
          read?: boolean;
          link_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
