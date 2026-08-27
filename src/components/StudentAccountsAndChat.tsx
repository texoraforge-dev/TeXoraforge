import React, { useState } from 'react';
import { 
  Users, Key, ShieldCheck, MessageSquare, Send, Pin, Trash2, EyeOff, 
  VolumeX, Volume2, Search, AlertTriangle, BookOpen, CheckCircle, Lock, 
  Sparkles, RefreshCw, UserCheck, Eye, Filter
} from 'lucide-react';
import { User, StudentAccountCredentials, ClassChatMessage, ChatModerationLog, Student, CBTExam, SchoolClass } from '../types';
import { AppStorage } from '../storage';
import { hasPermission } from '../lib/permissions';

interface StudentAccountsAndChatProps {
  currentUser: User | null;
  students: Student[];
  classes: SchoolClass[];
  studentCredentials: StudentAccountCredentials[];
  classChatMessages: ClassChatMessage[];
  chatModerationLogs: ChatModerationLog[];
  cbtExams: CBTExam[];
  onRefresh?: () => void;
  onNavigateToCBT?: (examId: string) => void;
}

export const StudentAccountsAndChat: React.FC<StudentAccountsAndChatProps> = ({
  currentUser,
  students,
  classes,
  studentCredentials,
  classChatMessages,
  chatModerationLogs,
  cbtExams,
  onRefresh,
  onNavigateToCBT
}) => {
  const isStudent = currentUser?.role === 'STUDENT';
  const isProprietor = currentUser?.role === 'PROPRIETOR';
  const isTeacherOrAdmin = currentUser?.role === 'TEACHER' || currentUser?.role === 'SCHOOL_ADMIN' || currentUser?.role === 'VICE_PRINCIPAL' || isProprietor;

  // Filter available classes for current user role
  const visibleClasses = isStudent
    ? classes.filter(c => currentUser?.assignedClassIds?.includes(c.id))
    : classes;
  const effectiveClasses = visibleClasses.length > 0 ? visibleClasses : (classes.length > 0 ? [classes[0]] : []);

  const [activeTab, setActiveTab] = useState<'CHAT' | 'CREDENTIALS' | 'MODERATION_LOGS'>(isStudent ? 'CHAT' : 'CREDENTIALS');
  
  // Chat State
  const [selectedClassId, setSelectedClassId] = useState<string>(
    currentUser?.assignedClassIds?.[0] || effectiveClasses[0]?.id || 'cls_pri5'
  );
  const [newMessageText, setNewMessageText] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);

  // Moderation Modal State
  const [selectedMessageForAction, setSelectedMessageForAction] = useState<ClassChatMessage | null>(null);
  const [moderationReason, setModerationReason] = useState('');

  // Search & Filter
  const [credentialSearch, setCredentialSearch] = useState('');

  // Selected class object
  const currentClassObj = classes.find(c => c.id === selectedClassId) || effectiveClasses[0];

  // Messages for active class
  const activeClassMessages = classChatMessages.filter(m => m.classId === selectedClassId);
  const pinnedAnnouncements = activeClassMessages.filter(m => m.isAnnouncement && !m.hidden);

  // Student credential status for current user if student
  const studentCredentialRecord = studentCredentials.find(
    c => c.studentId === currentUser?.id || (currentUser?.email && c.studentCode === currentUser.email.split('@')[0]?.toUpperCase())
  );

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !currentUser) return;

    if (studentCredentialRecord?.chatMuted) {
      alert(`Your chat privileges are currently suspended by your teacher/administrator. Reason: ${studentCredentialRecord.chatMutedReason || 'Classroom moderation guidelines'}`);
      return;
    }

    // Basic AI / Safety Filter Check
    const inappropriateKeywords = ['fool', 'idiot', 'cheat', 'hack', 'stupid'];
    const textLower = newMessageText.toLowerCase();
    const flagged = inappropriateKeywords.some(kw => textLower.includes(kw));

    const msg: ClassChatMessage = {
      id: 'msg_' + Date.now(),
      schoolId: currentUser.schoolId || 'school_apex',
      classId: selectedClassId,
      className: currentClassObj?.name || 'Class Chat',
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      content: newMessageText.trim(),
      isAnnouncement: isTeacherOrAdmin && isAnnouncement,
      flaggedByAi: flagged,
      aiFlagReason: flagged ? 'Contains flagged keywords under school conduct policy' : undefined,
      createdAt: new Date().toISOString()
    };

    AppStorage.addClassChatMessage(msg);
    setNewMessageText('');
    setIsAnnouncement(false);
    if (onRefresh) onRefresh();
  };

  // Handle Generate Student Credentials
  const handleGenerateCredentials = (student: Student) => {
    const studentClassName = classes.find(c => c.id === student.classId)?.name || 'Primary 5';
    AppStorage.createStudentAccount(
      student.id,
      student.fullName,
      student.classId,
      studentClassName,
      currentUser?.name || 'School Admin'
    );
    if (onRefresh) onRefresh();
  };

  // Moderation action
  const handleExecuteModeration = (action: 'HIDE' | 'DELETE') => {
    if (!selectedMessageForAction || !moderationReason.trim()) {
      alert('Please state a reason for this moderation action.');
      return;
    }

    if (action === 'DELETE') {
      AppStorage.deleteClassChatMessage(selectedMessageForAction.id, currentUser?.name || 'Moderator', moderationReason);
    } else {
      AppStorage.hideClassChatMessage(selectedMessageForAction.id, currentUser?.name || 'Moderator', moderationReason);
    }

    setSelectedMessageForAction(null);
    setModerationReason('');
    if (onRefresh) onRefresh();
  };

  // Mute / Unmute student
  const handleToggleMuteStudent = (studentId: string) => {
    const reason = prompt('Enter justification for muting/unmuting this student in class chat:');
    if (!reason) return;

    AppStorage.muteStudentInChat(studentId, currentUser?.name || 'Moderator', reason);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold tracking-wide uppercase">
              <MessageSquare className="w-4 h-4" /> Student Portal & Monitored Class Chat
            </div>
            <h1 className="text-2xl font-bold mt-1">Student Accounts, CBT & Moderated Class Chat</h1>
            <p className="text-slate-300 text-sm mt-1">
              Secure student login credentials, direct CBT exam hub, and teacher-moderated class discussion channels.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('CHAT')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'CHAT'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-1.5" /> Class Chat
            </button>

            {isTeacherOrAdmin && (
              <button
                onClick={() => setActiveTab('CREDENTIALS')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'CREDENTIALS'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Key className="w-4 h-4 inline mr-1.5" /> Student Credentials
              </button>
            )}

            {(isTeacherOrAdmin || isProprietor) && (
              <button
                onClick={() => setActiveTab('MODERATION_LOGS')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'MODERATION_LOGS'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 inline mr-1.5" /> Moderation Logs
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: MONITORED CLASS CHAT */}
      {activeTab === 'CHAT' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Class selector sidebar for teachers/admins */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-2">
                {isStudent ? 'My Enrolled Class Channel' : isProprietor ? 'Proprietor Class Oversight' : 'Class Chat Rooms'}
              </h3>
              
              <div className="space-y-1">
                {effectiveClasses.map(cls => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`w-full p-3 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all ${
                      selectedClassId === cls.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 border shadow-sm'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{cls.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {cls.studentCount || 0} students
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick CBT launch for students */}
            {isStudent && (
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                  <BookOpen className="w-4 h-4" /> Student CBT Hub
                </div>
                <h4 className="text-sm font-bold">Upcoming CBT Examinations</h4>
                <p className="text-xs text-slate-300">Launch your active computer-based test session directly from here.</p>
                
                <div className="space-y-2 pt-1">
                  {cbtExams.filter(exam => !exam.classId || currentUser?.assignedClassIds?.includes(exam.classId)).slice(0, 2).map(exam => (
                    <button
                      key={exam.id}
                      onClick={() => onNavigateToCBT && onNavigateToCBT(exam.id)}
                      className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-between"
                    >
                      <span>{exam.title}</span>
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chat Feed */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[500px]">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {currentClassObj?.name} - Class Discussion Channel
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Monitored environment. All posts are reviewed by class teachers and school leadership.
                    </p>
                  </div>
                </div>

                {studentCredentialRecord?.chatMuted && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-xs font-bold rounded-lg flex items-center gap-1">
                    <VolumeX className="w-3.5 h-3.5" /> Chat Muted
                  </span>
                )}
              </div>

              {/* Pinned Announcements */}
              {pinnedAnnouncements.length > 0 && (
                <div className="mb-4 space-y-2">
                  {pinnedAnnouncements.map(ann => (
                    <div key={ann.id} className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                      <Pin className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-bold">Official Teacher Announcement by {ann.senderName}</div>
                        <div>{ann.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Message List */}
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                {activeClassMessages.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    No messages in this class channel yet. Be the first to start a discussion!
                  </div>
                ) : (
                  activeClassMessages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`p-4 rounded-2xl text-xs space-y-1 transition-all ${
                        msg.hidden 
                          ? 'bg-slate-100 dark:bg-slate-800/40 opacity-60 border border-dashed border-slate-300'
                          : msg.senderRole === 'TEACHER' || msg.senderRole === 'PROPRIETOR'
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/50'
                          : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{msg.senderName}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            msg.senderRole === 'TEACHER' ? 'bg-emerald-100 text-emerald-800' :
                            msg.senderRole === 'STUDENT' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {msg.senderRole}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Teacher/Admin Moderation Action Buttons */}
                        {isTeacherOrAdmin && !msg.hidden && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedMessageForAction(msg)}
                              className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-[10px] text-slate-700 dark:text-slate-200 font-medium"
                            >
                              Moderate
                            </button>
                            {msg.senderRole === 'STUDENT' && (
                              <button
                                onClick={() => handleToggleMuteStudent(msg.senderId)}
                                className="p-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                title="Mute/Unmute Student"
                              >
                                <VolumeX className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {msg.hidden ? (
                        <p className="italic text-slate-500 text-[11px]">
                          [Message hidden by moderator {msg.hiddenBy || 'Teacher'}. Reason: {msg.hiddenReason || 'Policy Violation'}]
                        </p>
                      ) : (
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-normal">{msg.content}</p>
                      )}

                      {msg.flaggedByAi && !msg.hidden && (
                        <div className="mt-2 text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Flagged for conduct review
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {isTeacherOrAdmin && (
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-400 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnnouncement}
                      onChange={(e) => setIsAnnouncement(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Pin className="w-3.5 h-3.5" /> Post as Pinned Class Announcement
                  </label>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  disabled={studentCredentialRecord?.chatMuted}
                  placeholder={studentCredentialRecord?.chatMuted ? 'Chat suspended by teacher...' : 'Type your message to the class...'}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={studentCredentialRecord?.chatMuted || !newMessageText.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT CREDENTIALS (TEACHERS / ADMINS) */}
      {activeTab === 'CREDENTIALS' && isTeacherOrAdmin && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Student Account Credentials</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Generate and manage unique Student Codes and 4-digit PINs for student portal login.</p>
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search student or code..."
                value={credentialSearch}
                onChange={(e) => setCredentialSearch(e.target.value)}
                className="pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-full text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Student Name</th>
                  <th className="p-3.5">Class</th>
                  <th className="p-3.5">Student Code</th>
                  <th className="p-3.5">Access PIN</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Chat Privileges</th>
                  <th className="p-3.5 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map(std => {
                  const cred = studentCredentials.find(c => c.studentId === std.id);
                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{std.fullName}</td>
                      <td className="p-3.5">{classes.find(c => c.id === std.classId)?.name || 'Primary 5'}</td>
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {cred ? cred.studentCode : 'Not Generated'}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {cred ? cred.accessPin : '••••'}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          cred?.activationStatus === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {cred ? cred.activationStatus : 'UNPROVISIONED'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cred?.chatMuted ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {cred?.chatMuted ? 'Muted' : 'Active'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {!cred ? (
                          <button
                            onClick={() => handleGenerateCredentials(std)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg shadow-sm"
                          >
                            Provision Account
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleMuteStudent(std.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] rounded-lg"
                          >
                            {cred.chatMuted ? 'Unmute Chat' : 'Mute Chat'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MODERATION LOGS (PROPRIETOR / TEACHER) */}
      {activeTab === 'MODERATION_LOGS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Class Chat Moderation Logs</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Complete audit trail of all moderation actions executed by teachers and leadership.</p>
          </div>

          <div className="space-y-3">
            {chatModerationLogs.map(log => (
              <div key={log.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {log.action} in {log.className}
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Moderator: <strong>{log.moderatorName}</strong> ({log.moderatorRole}) • Reason: {log.reason}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODERATION REASON MODAL */}
      {selectedMessageForAction && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Class Chat Moderation</h3>
              <button onClick={() => setSelectedMessageForAction(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="text-xs p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 dark:text-white">Target Message by {selectedMessageForAction.senderName}:</span>
              <p className="italic text-slate-600 dark:text-slate-300">"{selectedMessageForAction.content}"</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mandatory Moderation Reason</label>
              <textarea
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                placeholder="State why this message is being hidden or removed..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleExecuteModeration('HIDE')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Hide Message
              </button>
              <button
                type="button"
                onClick={() => handleExecuteModeration('DELETE')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
