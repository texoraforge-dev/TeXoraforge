/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { useAppStore } from './storage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { NotificationDrawer } from './components/NotificationDrawer';
import { AuthView } from './components/AuthView';
import { AdminDashboard } from './components/AdminDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { TeacherManagement } from './components/TeacherManagement';
import { ClassAndStudentManagement } from './components/ClassAndStudentManagement';
import { SubmissionsReview } from './components/SubmissionsReview';
import { TeacherSubmissions } from './components/TeacherSubmissions';
import { AttendanceView } from './components/AttendanceView';
import { SchoolSettings } from './components/SchoolSettings';
import { StudentManagement } from './components/StudentManagement';
import { SchoolStudentRoster } from './components/SchoolStudentRoster';
import { ScoreEntryView } from './components/ScoreEntryView';
import { ParentPortal } from './components/ParentPortal';
import { TimetableManagement } from './components/TimetableManagement';
import { PermissionManagement } from './components/PermissionManagement';
import { AuditLogView } from './components/AuditLogView';
import { TeacherParentChat } from './components/TeacherParentChat';
import { PublicParentTeacherChat } from './components/PublicParentTeacherChat';
import { ExamQuestionsManagement } from './components/ExamQuestionsManagement';
import { CurriculumEngine } from './components/CurriculumEngine';
import { CBTEngine } from './components/CBTEngine';
import { StudentEarlyWarningSystem } from './components/StudentEarlyWarningSystem';
import { DocumentVaultView } from './components/DocumentVaultView';
import { VoiceAssistantWidget } from './components/VoiceAssistantWidget';
import { StaffAttendance } from './components/StaffAttendance';
import { PayrollManagement } from './components/PayrollManagement';
import { StudentAccountsAndChat } from './components/StudentAccountsAndChat';
import { LessonNoteModal } from './components/modals/LessonNoteModal';
import { UploadPdfModal } from './components/modals/UploadPdfModal';
import { WeeklyDiaryModal } from './components/modals/WeeklyDiaryModal';
import { Submission } from './types';

export default function App() {
  const { 
    currentUser, 
    submissions,
    users, 
    students, 
    classes, 
    attendanceSettings, 
    staffAttendance, 
    salaryProfiles, 
    deductionRules, 
    payrollRecords, 
    studentCredentials, 
    classChatMessages, 
    chatModerationLogs, 
    cbtExams, 
    refreshState 
  } = useAppStore();

  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Modal controls
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLessonNoteModalOpen, setIsLessonNoteModalOpen] = useState(false);
  const [isWeeklyDiaryModalOpen, setIsWeeklyDiaryModalOpen] = useState(false);
  const [isUploadPdfModalOpen, setIsUploadPdfModalOpen] = useState(false);
  const [submissionToEdit, setSubmissionToEdit] = useState<Submission | null>(null);
  const [selectedSubmissionToReview, setSelectedSubmissionToReview] = useState<Submission | null>(null);

  // Sync dark mode class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle review click from dashboard or global search
  const handleSelectSubmissionFromSearch = (submission: Submission) => {
    setSelectedSubmissionToReview(submission);
    if (currentUser?.role === 'SCHOOL_ADMIN') {
      setCurrentView('submissions');
    } else {
      setCurrentView('teacher_submissions');
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans antialiased">
      
      {!currentUser ? (
        <AuthView onSuccess={() => setCurrentView('dashboard')} />
      ) : (
        <>
          <Navbar
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onNavigate={(v) => setCurrentView(v)}
            onSelectSubmission={handleSelectSubmissionFromSearch}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />

          <div className="flex min-h-[calc(100vh-4rem)]">
            
            {/* Left Sidebar */}
            <Sidebar
              currentView={currentView}
              onNavigate={(v) => setCurrentView(v)}
              role={currentUser.role}
              pendingReviewCount={pendingCount}
              isMobileOpen={isMobileMenuOpen}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden space-y-4">
            
            {/* Offline Mode Banner when disconnected */}
            {!isOnline && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 rounded-2xl shadow-sm flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-200 dark:bg-amber-900/60 rounded-xl">
                    <WifiOff className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                  </div>
                  <div>
                    <span className="font-extrabold text-amber-950 dark:text-amber-100">You are currently offline:</span>{' '}
                    <span>TeXora Forge is running in 100% Offline Mode. All lesson plans, score entries, attendance, timetables, and chat messages are saved locally in browser storage.</span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 font-bold text-[11px] bg-amber-200/60 dark:bg-amber-900/40 px-2.5 py-1 rounded-lg shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300" />
                  Local Cache Active
                </div>
              </div>
            )}
            
            {/* Admin / Executive / VP Views */}
            {(currentUser.role === 'PROPRIETOR' || currentUser.role === 'VICE_PRINCIPAL' || currentUser.role === 'SCHOOL_ADMIN') && (
              <>
                {currentView === 'dashboard' && (
                  <AdminDashboard
                    onNavigate={(v) => setCurrentView(v)}
                    onReviewSubmission={handleSelectSubmissionFromSearch}
                  />
                )}
                {currentView === 'staff_attendance' && (
                  <StaffAttendance
                    currentUser={currentUser}
                    attendanceSettings={attendanceSettings}
                    staffAttendance={staffAttendance}
                    users={users}
                    onRefresh={refreshState}
                  />
                )}
                {currentView === 'payroll' && (
                  <PayrollManagement
                    currentUser={currentUser}
                    users={users}
                    salaryProfiles={salaryProfiles}
                    deductionRules={deductionRules}
                    payrollRecords={payrollRecords}
                    staffAttendance={staffAttendance}
                    onRefresh={refreshState}
                  />
                )}
                {(currentView === 'student_accounts' || currentView === 'chat_oversight') && (
                  <StudentAccountsAndChat
                    currentUser={currentUser}
                    students={students}
                    classes={classes}
                    studentCredentials={studentCredentials}
                    classChatMessages={classChatMessages}
                    chatModerationLogs={chatModerationLogs}
                    cbtExams={cbtExams}
                    onRefresh={refreshState}
                    onNavigateToCBT={(id) => setCurrentView('cbt_engine')}
                  />
                )}
                {currentView === 'students' && <StudentManagement />}
                {currentView === 'school_students' && <SchoolStudentRoster />}
                {currentView === 'teachers' && <TeacherManagement />}
                {currentView === 'classes' && <ClassAndStudentManagement />}
                {currentView === 'scores' && <ScoreEntryView />}
                {currentView === 'submissions' && (
                  <SubmissionsReview
                    selectedSubmissionForReview={selectedSubmissionToReview}
                    onClearSelectedSubmission={() => setSelectedSubmissionToReview(null)}
                  />
                )}
                {currentView === 'exam_questions' && <ExamQuestionsManagement />}
                {currentView === 'curriculum' && <CurriculumEngine />}
                {currentView === 'cbt_engine' && <CBTEngine />}
                {currentView === 'early_warning' && <StudentEarlyWarningSystem />}
                {currentView === 'document_vault' && <DocumentVaultView />}
                {currentView === 'attendance' && <AttendanceView />}
                {currentView === 'public_chat' && (
                  <PublicParentTeacherChat onStartDirectChat={() => setCurrentView('direct_chat')} />
                )}
                {(currentView === 'direct_chat' || currentView === 'chat') && <TeacherParentChat />}
                {currentView === 'timetable' && <TimetableManagement onNavigate={(v) => setCurrentView(v)} />}
                {currentView === 'user_permissions' && <PermissionManagement onNavigate={(v) => setCurrentView(v)} />}
                {currentView === 'audit_logs' && <AuditLogView />}
                {currentView === 'settings' && <SchoolSettings />}
                {currentView === 'parent' && <ParentPortal />}
              </>
            )}

            {/* Teacher Views */}
            {currentUser.role === 'TEACHER' && (
              <>
                {currentView === 'dashboard' && (
                  <TeacherDashboard
                    onNavigate={(v) => setCurrentView(v)}
                    onOpenCreateLessonNote={() => { setSubmissionToEdit(null); setIsLessonNoteModalOpen(true); }}
                    onOpenUploadPdf={() => setIsUploadPdfModalOpen(true)}
                    onOpenCreateLessonPlan={() => { setSubmissionToEdit(null); setIsLessonNoteModalOpen(true); }}
                    onOpenCreateWeeklyDiary={() => { setSubmissionToEdit(null); setIsWeeklyDiaryModalOpen(true); }}
                  />
                )}

                {currentView === 'staff_attendance' && (
                  <StaffAttendance
                    currentUser={currentUser}
                    attendanceSettings={attendanceSettings}
                    staffAttendance={staffAttendance}
                    users={users}
                    onRefresh={refreshState}
                  />
                )}

                {currentView === 'student_accounts' && (
                  <StudentAccountsAndChat
                    currentUser={currentUser}
                    students={students}
                    classes={classes}
                    studentCredentials={studentCredentials}
                    classChatMessages={classChatMessages}
                    chatModerationLogs={chatModerationLogs}
                    cbtExams={cbtExams}
                    onRefresh={refreshState}
                    onNavigateToCBT={(id) => setCurrentView('cbt_engine')}
                  />
                )}

                {currentView === 'scores' && <ScoreEntryView />}

                {(currentView === 'teacher_submissions' || currentView === 'submissions') && (
                  <TeacherSubmissions
                    onOpenCreateLessonNote={() => { setSubmissionToEdit(null); setIsLessonNoteModalOpen(true); }}
                    onOpenUploadPdf={() => setIsUploadPdfModalOpen(true)}
                    onOpenCreateLessonPlan={() => { setSubmissionToEdit(null); setIsLessonNoteModalOpen(true); }}
                    onOpenCreateWeeklyDiary={() => { setSubmissionToEdit(null); setIsWeeklyDiaryModalOpen(true); }}
                    onNavigate={(v) => setCurrentView(v)}
                    onEditSubmission={(sub) => {
                      setSubmissionToEdit(sub);
                      if (sub.type === 'WEEKLY_DIARY') {
                        setIsWeeklyDiaryModalOpen(true);
                      } else {
                        setIsLessonNoteModalOpen(true);
                      }
                    }}
                  />
                )}

                {(currentView === 'teacher_attendance' || currentView === 'attendance') && (
                  <AttendanceView />
                )}

                {currentView === 'exam_questions' && <ExamQuestionsManagement />}
                {currentView === 'curriculum' && <CurriculumEngine />}
                {currentView === 'cbt_engine' && <CBTEngine />}
                {currentView === 'early_warning' && <StudentEarlyWarningSystem />}
                {currentView === 'document_vault' && <DocumentVaultView />}

                {currentView === 'timetable' && (
                  <TimetableManagement onNavigate={(v) => setCurrentView(v)} />
                )}

                {currentView === 'public_chat' && (
                  <PublicParentTeacherChat onStartDirectChat={() => setCurrentView('direct_chat')} />
                )}
                {(currentView === 'direct_chat' || currentView === 'chat') && <TeacherParentChat />}
              </>
            )}

            {/* Parent Views */}
            {currentUser.role === 'PARENT' && (
              <>
                {currentView === 'public_chat' ? (
                  <PublicParentTeacherChat onStartDirectChat={() => setCurrentView('direct_chat')} />
                ) : (currentView === 'direct_chat' || currentView === 'chat') ? (
                  <TeacherParentChat />
                ) : currentView === 'timetable' ? (
                  <TimetableManagement onNavigate={(v) => setCurrentView(v)} />
                ) : currentView === 'cbt_engine' ? (
                  <CBTEngine />
                ) : currentView === 'early_warning' ? (
                  <StudentEarlyWarningSystem />
                ) : currentView === 'document_vault' ? (
                  <DocumentVaultView />
                ) : currentView === 'curriculum' ? (
                  <CurriculumEngine />
                ) : currentView === 'parent_ai_assistant' ? (
                  <ParentPortal initialTab="AI_ASSISTANT" onNavigate={(v) => setCurrentView(v)} />
                ) : (
                  <ParentPortal onNavigate={(v) => setCurrentView(v)} />
                )}
              </>
            )}

            {/* Student Views */}
            {currentUser.role === 'STUDENT' && (
              <>
                {currentView === 'cbt_engine' ? (
                  <CBTEngine />
                ) : currentView === 'timetable' ? (
                  <TimetableManagement onNavigate={(v) => setCurrentView(v)} />
                ) : currentView === 'early_warning' ? (
                  <StudentEarlyWarningSystem />
                ) : (
                  <StudentAccountsAndChat
                    currentUser={currentUser}
                    students={students}
                    classes={classes}
                    studentCredentials={studentCredentials}
                    classChatMessages={classChatMessages}
                    chatModerationLogs={chatModerationLogs}
                    cbtExams={cbtExams}
                    onRefresh={refreshState}
                    onNavigateToCBT={(id) => setCurrentView('cbt_engine')}
                  />
                )}
              </>
            )}

          </main>
        </div>
        </>
      )}

      {/* Slide-over Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectNotification={(linkId) => {
          if (currentUser?.role === 'SCHOOL_ADMIN') {
            setCurrentView('submissions');
          } else {
            setCurrentView('teacher_submissions');
          }
        }}
      />

      {/* Modals */}
      <LessonNoteModal
        isOpen={isLessonNoteModalOpen}
        onClose={() => { setIsLessonNoteModalOpen(false); setSubmissionToEdit(null); }}
        existingSubmission={submissionToEdit}
      />

      <WeeklyDiaryModal
        isOpen={isWeeklyDiaryModalOpen}
        onClose={() => { setIsWeeklyDiaryModalOpen(false); setSubmissionToEdit(null); }}
        existingSubmission={submissionToEdit}
      />

      <UploadPdfModal
        isOpen={isUploadPdfModalOpen}
        onClose={() => setIsUploadPdfModalOpen(false)}
      />

      {/* Floating TeXora Voice & Speech Assistant */}
      <VoiceAssistantWidget />

    </div>
  );
}
