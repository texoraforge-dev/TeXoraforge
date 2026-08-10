/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import { LessonNoteModal } from './components/modals/LessonNoteModal';
import { UploadPdfModal } from './components/modals/UploadPdfModal';
import { WeeklyDiaryModal } from './components/modals/WeeklyDiaryModal';
import { Submission } from './types';

export default function App() {
  const { currentUser, submissions } = useAppStore();

  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Modal controls
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
          />

          <div className="flex min-h-[calc(100vh-4rem)]">
            
            {/* Left Sidebar */}
            <Sidebar
              currentView={currentView}
              onNavigate={(v) => setCurrentView(v)}
              role={currentUser.role}
              pendingReviewCount={pendingCount}
            />

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
            
            {/* Admin Views */}
            {currentUser.role === 'SCHOOL_ADMIN' && (
              <>
                {currentView === 'dashboard' && (
                  <AdminDashboard
                    onNavigate={(v) => setCurrentView(v)}
                    onReviewSubmission={handleSelectSubmissionFromSearch}
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
                {currentView === 'attendance' && <AttendanceView />}
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

                {currentView === 'scores' && <ScoreEntryView />}

                {(currentView === 'teacher_submissions' || currentView === 'submissions') && (
                  <TeacherSubmissions
                    onOpenCreateLessonNote={() => { setSubmissionToEdit(null); setIsLessonNoteModalOpen(true); }}
                    onOpenUploadPdf={() => setIsUploadPdfModalOpen(true)}
                    onOpenCreateLessonPlan={() => { setSubmissionToEdit(null); setIsLessonNoteModalOpen(true); }}
                    onOpenCreateWeeklyDiary={() => { setSubmissionToEdit(null); setIsWeeklyDiaryModalOpen(true); }}
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
              </>
            )}

            {/* Parent Views */}
            {currentUser.role === 'PARENT' && (
              <ParentPortal />
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

    </div>
  );
}
