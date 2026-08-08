-- =====================================================================
-- SUPABASE DATABASE SCHEMA MIGRATION FOR TEXORA SCHOOL MANAGEMENT APP
-- =====================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SCHOOLS
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  motto TEXT,
  code TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  address TEXT,
  academic_session TEXT NOT NULL DEFAULT '2025/2026',
  academic_term TEXT NOT NULL DEFAULT 'First Term',
  subjects TEXT[] DEFAULT ARRAY[
    'Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 
    'Basic Science & Tech', 'Basic Technology', 'Computer Studies', 'Further Mathematics', 
    'Economics', 'Financial Accounting', 'Literature in English', 'Government', 
    'Civic Education', 'Agricultural Science', 'Social Studies', 'Business Studies', 
    'Creative Arts', 'Physical & Health Ed', 'Geography', 'History'
  ],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS (Profiles connected to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT')),
  avatar_url TEXT,
  phone TEXT,
  employee_id TEXT,
  assigned_class_ids TEXT[] DEFAULT '{}',
  assigned_subjects TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TEACHERS
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE NOT NULL,
  specialization TEXT,
  assigned_class_ids TEXT[] DEFAULT '{}',
  assigned_subjects TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PARENTS
CREATE TABLE IF NOT EXISTS public.parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  student_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CLASSES
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  arm TEXT,
  capacity INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SUBJECTS
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. STUDENTS
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id TEXT REFERENCES public.classes(id) ON DELETE SET NULL,
  admission_no TEXT NOT NULL,
  full_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female')),
  guardian_name TEXT NOT NULL,
  guardian_phone TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ACADEMIC SESSIONS
CREATE TABLE IF NOT EXISTS public.academic_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TERMS
CREATE TABLE IF NOT EXISTS public.terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SUBMISSIONS (Lesson Notes, Plans, Weekly Diaries)
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  teacher_name TEXT NOT NULL,
  class_id TEXT REFERENCES public.classes(id) ON DELETE SET NULL,
  class_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('LESSON_NOTE', 'LESSON_PLAN', 'WEEKLY_DIARY')),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED')),
  quality_score INTEGER,
  lesson_note_content JSONB,
  lesson_plan_content JSONB,
  weekly_diary_content JSONB,
  pdf_attachment JSONB,
  admin_feedback TEXT,
  reviewed_by_admin_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ATTENDANCE
CREATE TABLE IF NOT EXISTS public.attendance (
  id TEXT PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  subject TEXT,
  date DATE NOT NULL,
  teacher_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  teacher_name TEXT NOT NULL,
  records JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ASSESSMENTS
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'TEST' CHECK (type IN ('QUIZ', 'TEST', 'EXAM', 'ASSIGNMENT')),
  max_score NUMERIC DEFAULT 100,
  term TEXT NOT NULL,
  academic_session TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. RESULTS
CREATE TABLE IF NOT EXISTS public.results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
  score_obtained NUMERIC NOT NULL,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  amount_paid NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE')),
  due_date DATE NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT DEFAULT 'ALL' CHECK (target_audience IN ('ALL', 'TEACHERS', 'PARENTS', 'STUDENTS')),
  author_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  recipient_user_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'SYSTEM' CHECK (type IN ('APPROVAL', 'REJECTION', 'CORRECTION', 'SUBMISSION', 'SYSTEM')),
  read BOOLEAN DEFAULT FALSE,
  link_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for authenticated / service role, and allow public access for active school context
CREATE POLICY "Public read policy for schools" ON public.schools FOR SELECT USING (true);
CREATE POLICY "Public write policy for schools" ON public.schools FOR ALL USING (true);

CREATE POLICY "Public read policy for users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public write policy for users" ON public.users FOR ALL USING (true);

CREATE POLICY "Public read policy for teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Public write policy for teachers" ON public.teachers FOR ALL USING (true);

CREATE POLICY "Public read policy for parents" ON public.parents FOR SELECT USING (true);
CREATE POLICY "Public write policy for parents" ON public.parents FOR ALL USING (true);

CREATE POLICY "Public read policy for classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Public write policy for classes" ON public.classes FOR ALL USING (true);

CREATE POLICY "Public read policy for subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Public write policy for subjects" ON public.subjects FOR ALL USING (true);

CREATE POLICY "Public read policy for students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public write policy for students" ON public.students FOR ALL USING (true);

CREATE POLICY "Public read policy for academic_sessions" ON public.academic_sessions FOR SELECT USING (true);
CREATE POLICY "Public write policy for academic_sessions" ON public.academic_sessions FOR ALL USING (true);

CREATE POLICY "Public read policy for terms" ON public.terms FOR SELECT USING (true);
CREATE POLICY "Public write policy for terms" ON public.terms FOR ALL USING (true);

CREATE POLICY "Public read policy for submissions" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Public write policy for submissions" ON public.submissions FOR ALL USING (true);

CREATE POLICY "Public read policy for attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Public write policy for attendance" ON public.attendance FOR ALL USING (true);

CREATE POLICY "Public read policy for assessments" ON public.assessments FOR SELECT USING (true);
CREATE POLICY "Public write policy for assessments" ON public.assessments FOR ALL USING (true);

CREATE POLICY "Public read policy for results" ON public.results FOR SELECT USING (true);
CREATE POLICY "Public write policy for results" ON public.results FOR ALL USING (true);

CREATE POLICY "Public read policy for payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Public write policy for payments" ON public.payments FOR ALL USING (true);

CREATE POLICY "Public read policy for announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public write policy for announcements" ON public.announcements FOR ALL USING (true);

CREATE POLICY "Public read policy for notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public write policy for notifications" ON public.notifications FOR ALL USING (true);

-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_school ON public.users(school_id);
CREATE INDEX IF NOT EXISTS idx_students_school_class ON public.students(school_id, class_id);
CREATE INDEX IF NOT EXISTS idx_submissions_school_teacher ON public.submissions(school_id, teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_school_class_date ON public.attendance(school_id, class_id, date);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_user_id);
