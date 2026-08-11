/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppStore, AppStorage } from '../storage';
import { UserRole, ChatRoom, ChatMessage, Student } from '../types';
import {
  MessageSquare,
  Send,
  Plus,
  Search,
  Crown,
  UserCheck,
  ShieldCheck,
  Clock,
  Sparkles,
  User,
  School as SchoolIcon,
  Filter,
  CheckCheck,
  BookOpen,
  Info,
  X,
  AlertCircle
} from 'lucide-react';

export const TeacherParentChat: React.FC = () => {
  const { currentUser, school, users, students, classes, chatRooms, chatMessages, actions } = useAppStore();

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [messageInput, setMessageInput] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // New Chat Form State
  const [newChatStudentId, setNewChatStudentId] = useState('');
  const [newChatTeacherId, setNewChatTeacherId] = useState('');
  const [newChatSubject, setNewChatSubject] = useState('');
  const [newChatInitialMsg, setNewChatInitialMsg] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isProprietor = currentUser?.role === 'PROPRIETOR';
  const isTeacher = currentUser?.role === 'TEACHER';
  const isParent = currentUser?.role === 'PARENT';
  const isAdmin = currentUser?.role === 'SCHOOL_ADMIN' || currentUser?.role === 'VICE_PRINCIPAL';

  // Available students for new chat depending on role
  const selectableStudents = useMemo(() => {
    if (!currentUser) return [];
    if (isParent) {
      const linkedCodes = currentUser.linkedStudentAccessCodes || [];
      const myStudents = students.filter(
        s => linkedCodes.includes(s.accessCode) || s.guardianEmail === currentUser.email || s.guardianName.toLowerCase().includes(currentUser.name.toLowerCase())
      );
      return myStudents.length > 0 ? myStudents : students;
    }
    return students;
  }, [currentUser, isParent, students]);

  // Filter accessible chat rooms based on Role
  const accessibleRooms = useMemo(() => {
    if (!currentUser) return [];

    let list: ChatRoom[] = [];

    if (isProprietor) {
      // PROPRIETOR ONLY has full executive oversight over all chat rooms in the school
      list = chatRooms;
    } else if (isTeacher) {
      // Teachers CAN ONLY see private chat rooms where THEY are the assigned teacher
      list = chatRooms.filter(r => r.teacherUserId === currentUser.id);
    } else if (isParent) {
      // Parents CAN ONLY see private chat rooms involving their own children or parent account
      const linkedCodes = currentUser.linkedStudentAccessCodes || [];
      const parentStudents = students.filter(s => linkedCodes.includes(s.accessCode) || s.guardianEmail === currentUser.email);
      const studentIds = parentStudents.map(s => s.id);

      list = chatRooms.filter(r => r.parentUserId === currentUser.id || studentIds.includes(r.studentId));
    } else if (isAdmin) {
      // VP / School Admin see chat rooms for their assigned classes or overall if permitted
      list = chatRooms;
    }

    // Apply class filter
    if (classFilter !== 'ALL') {
      list = list.filter(r => {
        const std = students.find(s => s.id === r.studentId);
        return std?.classId === classFilter || r.className === classFilter;
      });
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        r =>
          r.studentName.toLowerCase().includes(term) ||
          r.teacherName.toLowerCase().includes(term) ||
          r.parentName.toLowerCase().includes(term) ||
          r.subject.toLowerCase().includes(term) ||
          r.lastMessage.toLowerCase().includes(term)
      );
    }

    // Sort by most recent
    return [...list].sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }, [chatRooms, currentUser, isProprietor, isAdmin, isTeacher, isParent, classFilter, searchTerm, students]);

  // Set default selected room on load if none selected
  useEffect(() => {
    if (!selectedRoomId && accessibleRooms.length > 0) {
      setSelectedRoomId(accessibleRooms[0].id);
    }
  }, [accessibleRooms, selectedRoomId]);

  // Selected chat room object
  const activeRoom = useMemo(() => {
    return chatRooms.find(r => r.id === selectedRoomId) || null;
  }, [chatRooms, selectedRoomId]);

  // Active room messages
  const activeMessages = useMemo(() => {
    if (!selectedRoomId) return [];
    return [...chatMessages.filter(m => m.chatRoomId === selectedRoomId)].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [chatMessages, selectedRoomId]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  // Mark room as read when opened
  useEffect(() => {
    if (selectedRoomId && currentUser) {
      AppStorage.markChatRoomRead(selectedRoomId, currentUser.role);
    }
  }, [selectedRoomId, currentUser?.role]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !selectedRoomId || !currentUser) return;

    actions.sendChatMessage(selectedRoomId, currentUser, messageInput.trim());
    setMessageInput('');
  };

  const handleCreateNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newChatStudentId || !newChatSubject.trim() || !newChatInitialMsg.trim()) return;

    const studentObj = students.find(s => s.id === newChatStudentId);
    if (!studentObj) return;

    const clsObj = classes.find(c => c.id === studentObj.classId);
    const classNameStr = clsObj ? `${clsObj.name} (${clsObj.arm || 'General'})` : 'Class';

    let parentUser = users.find(u => u.role === 'PARENT' && (u.linkedStudentAccessCodes?.includes(studentObj.accessCode) || u.email === studentObj.guardianEmail));
    let parentName = parentUser ? parentUser.name : studentObj.guardianName;
    let parentUserId = parentUser ? parentUser.id : 'usr_p1';

    let teacherUser: any;
    if (isTeacher) {
      teacherUser = currentUser;
    } else if (newChatTeacherId) {
      teacherUser = users.find(u => u.id === newChatTeacherId);
    } else {
      teacherUser = users.find(u => u.role === 'TEACHER' && u.assignedClassIds.includes(studentObj.classId)) || users.find(u => u.role === 'TEACHER');
    }

    const teacherName = teacherUser ? teacherUser.name : 'Class Teacher';
    const teacherUserId = teacherUser ? teacherUser.id : 'usr_t1';

    // Create chat room
    const newRoom = actions.saveChatRoom({
      schoolId: school?.id || 'school_apex',
      studentId: studentObj.id,
      studentName: studentObj.fullName,
      className: classNameStr,
      parentUserId,
      parentName,
      teacherUserId,
      teacherName,
      subject: newChatSubject.trim(),
      lastMessage: newChatInitialMsg.trim(),
      lastMessageAt: new Date().toISOString()
    });

    // Send initial message
    actions.sendChatMessage(newRoom.id, currentUser, newChatInitialMsg.trim());

    // Reset modal & select room
    setShowNewChatModal(false);
    setSelectedRoomId(newRoom.id);
    setNewChatStudentId('');
    setNewChatTeacherId('');
    setNewChatSubject('');
    setNewChatInitialMsg('');
  };

  const handleApplyTemplate = (text: string) => {
    setMessageInput(text);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 shadow-xs">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  1 on 1 Parent-Teacher Room
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Private Direct Messaging
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Choose a teacher or parent to send direct 1-on-1 messages regarding student academic welfare. (Proprietor has full executive oversight).
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowNewChatModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" /> Start New Chat Thread
          </button>
        </div>

        {/* PROPRIETOR OVERSIGHT BANNER */}
        {isProprietor && (
          <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 dark:border-amber-800/80 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold shrink-0 mt-0.5 shadow-xs">
              <Crown className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-extrabold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                  Proprietor Executive Oversight Active
                </p>
                <span className="text-[10px] bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 px-2 py-0.2 rounded font-bold">
                  Full Visibility
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                As Proprietor & Owner of {school?.name}, you have complete oversight over all teacher-parent communications. You can monitor discussions, review academic queries, and inject official board guidance into any chat thread.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Interface Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
        {/* Left Panel: Chat List */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm">
          {/* List Search & Filter Header */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search student, teacher, or topic..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-[11px]">Filter Class:</span>
              <select
                value={classFilter}
                onChange={e => setClassFilter(e.target.value)}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Classes ({chatRooms.length})</option>
                {classes.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chat Threads Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {accessibleRooms.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Chat Threads Found</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Start a new chat room thread to begin communication with parents or teachers.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                >
                  Create New Thread
                </button>
              </div>
            ) : (
              accessibleRooms.map(room => {
                const isSelected = room.id === selectedRoomId;
                const studentObj = students.find(s => s.id === room.studentId);
                const hasUnread = (isParent && room.unreadByParent) || (isTeacher && room.unreadByTeacher);

                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`w-full p-3.5 text-left transition-all flex items-start gap-3 relative hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600 dark:border-indigo-500'
                        : ''
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={
                          studentObj?.photoUrl ||
                          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'
                        }
                        alt={room.studentName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      {hasUnread && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {room.studentName}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {new Date(room.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {room.className}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {isParent ? `Teacher: ${room.teacherName}` : `Parent: ${room.parentName}`}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate mt-1">
                        {room.subject}
                      </p>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {room.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Active Chat Room Conversation */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm">
          {activeRoom ? (
            <>
              {/* Active Room Top Bar */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={
                      students.find(s => s.id === activeRoom.studentId)?.photoUrl ||
                      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={activeRoom.studentName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        {activeRoom.studentName}
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                        {activeRoom.className}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shrink-0">
                        <ShieldCheck className="h-3 w-3" /> Private 1-on-1 Direct Chat
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Topic:</span> {activeRoom.subject}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-3 shrink-0 text-right">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    <p className="font-bold text-slate-800 dark:text-slate-200">Teacher: {activeRoom.teacherName}</p>
                    <p>Parent: {activeRoom.parentName}</p>
                  </div>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
                {activeMessages.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No messages in this chat thread yet. Send a message to start conversing!
                  </div>
                ) : (
                  activeMessages.map(msg => {
                    const isMe = currentUser?.id === msg.senderId;
                    const isProprietorMsg = msg.senderRole === 'PROPRIETOR';

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] ${
                          isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
                        }`}
                      >
                        <img
                          src={
                            msg.senderAvatarUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                          }
                          alt={msg.senderName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5"
                        />

                        <div className={`space-y-1 ${isMe ? 'text-right' : 'text-left'}`}>
                          <div className={`flex items-center gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                              {msg.senderName}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                                msg.senderRole === 'PROPRIETOR'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                                  : msg.senderRole === 'TEACHER'
                                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {msg.senderRole}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                              isProprietorMsg
                                ? 'bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/60 dark:to-slate-900 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100 font-medium'
                                : isMe
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none'
                            }`}
                          >
                            {isProprietorMsg && (
                              <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] uppercase tracking-wide mb-1.5 border-b border-amber-200 dark:border-amber-800/80 pb-1">
                                <Crown className="h-3 w-3" /> Proprietor Executive Note
                              </div>
                            )}
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Templates */}
              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap gap-2 text-[11px]">
                <span className="font-bold text-slate-400 self-center">Quick Replies:</span>
                {isTeacher && (
                  <>
                    <button
                      onClick={() => handleApplyTemplate("Hello! Just following up regarding your child's recent class performance.")}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                    >
                      📝 Performance Check-in
                    </button>
                    <button
                      onClick={() => handleApplyTemplate("Please remind pupil to complete the homework assignment due tomorrow.")}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                    >
                      📚 Homework Reminder
                    </button>
                  </>
                )}
                {isParent && (
                  <>
                    <button
                      onClick={() => handleApplyTemplate("Good day Teacher! I wanted to inquire about the upcoming examination timetable.")}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                    >
                      📅 Exam Timetable Query
                    </button>
                    <button
                      onClick={() => handleApplyTemplate("Thank you for the update! We will ensure extra practice at home.")}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                    >
                      👍 Thank You Update
                    </button>
                  </>
                )}
                {isProprietor && (
                  <button
                    onClick={() => handleApplyTemplate("[Proprietor Note]: Reviewed this progress report. Keep up the commendable standard.")}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 border border-amber-300 text-amber-900 dark:text-amber-200 font-bold cursor-pointer transition-colors"
                  >
                    👑 Official Board Commendation
                  </button>
                )}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
                <input
                  type="text"
                  placeholder={
                    isProprietor
                      ? "Write an executive note or comment on this thread..."
                      : "Type your message to parent or teacher..."
                  }
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
                >
                  <Send className="h-4 w-4" /> Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 rounded-full">
                <MessageSquare className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Select a Chat Thread</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  Choose a student thread from the left panel or click "Start New Chat Thread" to message a parent or teacher directly.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NEW CHAT MODAL */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowNewChatModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-xl">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Start New Communication Thread</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Connect directly with teacher or parent</p>
              </div>
            </div>

            <form onSubmit={handleCreateNewChat} className="space-y-4">
              {/* Select Student */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Student / Pupil <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={newChatStudentId}
                  onChange={e => {
                    const sId = e.target.value;
                    setNewChatStudentId(sId);
                    // Pre-select teacher if possible
                    const selectedStd = students.find(s => s.id === sId);
                    if (selectedStd) {
                      const matchedTeacher = users.find(u => u.role === 'TEACHER' && u.assignedClassIds.includes(selectedStd.classId));
                      if (matchedTeacher) {
                        setNewChatTeacherId(matchedTeacher.id);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Student --</option>
                  {selectableStudents.map(std => {
                    const cls = classes.find(c => c.id === std.classId);
                    return (
                      <option key={std.id} value={std.id}>
                        {std.fullName} ({cls?.name || 'Class'}) — Admission: {std.admissionNo}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Select Teacher if Parent or Admin */}
              {!isTeacher && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Assigned Teacher <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={newChatTeacherId}
                    onChange={e => setNewChatTeacherId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose Teacher --</option>
                    {users
                      .filter(u => u.role === 'TEACHER')
                      .map(t => {
                        const selectedStd = students.find(s => s.id === newChatStudentId);
                        const isClassTeacher = selectedStd && t.assignedClassIds.includes(selectedStd.classId);
                        return (
                          <option key={t.id} value={t.id}>
                            {t.name} {isClassTeacher ? '★ Class Teacher' : ''} ({t.assignedSubjects.slice(0, 2).join(', ')})
                          </option>
                        );
                      })}
                  </select>
                </div>
              )}

              {/* Privacy Notice Banner */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-900 dark:text-emerald-200 font-medium leading-tight">
                  <span className="font-extrabold">🔒 Private 1-on-1 Direct Message:</span> Other teachers will not see or have access to this conversation. Only you, the assigned teacher, and the Proprietor (School Owner) have visibility.
                </p>
              </div>

              {/* Subject / Topic */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject / Topic Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Progress & Classwork Review"
                  value={newChatSubject}
                  onChange={e => setNewChatSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Initial Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Type your introductory message..."
                  value={newChatInitialMsg}
                  onChange={e => setNewChatInitialMsg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-colors"
                >
                  Start Thread
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
