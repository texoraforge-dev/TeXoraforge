/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileCheck2,
  CalendarCheck2,
  Settings,
  FileText,
  UserCheck,
  ShieldCheck,
  ChevronRight,
  BookOpenCheck,
  Key,
  Clock,
  Sparkles,
  MessageSquare,
  MessagesSquare
} from 'lucide-react';
import { UserRole } from '../types';
import { useAppStore } from '../storage';
import { getRoleBadgeInfo, canAccessView } from '../lib/permissions';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  role: UserRole;
  pendingReviewCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ForwardRefExoticComponent<any>;
  badge?: number | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  role,
  pendingReviewCount = 0
}) => {
  const { currentUser } = useAppStore();
  const effectiveUser = currentUser || { id: '', schoolId: '', name: '', email: '', role };
  const roleBadge = getRoleBadgeInfo(effectiveUser.role);

  const isProprietor = effectiveUser.role === 'PROPRIETOR';
  const isVP = effectiveUser.role === 'VICE_PRINCIPAL';
  const isAdmin = effectiveUser.role === 'SCHOOL_ADMIN' || isProprietor || isVP;
  const isParent = effectiveUser.role === 'PARENT';

  const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'school_students', label: 'School Students List', icon: Users },
    { id: 'students', label: 'Student Admissions & IDs', icon: GraduationCap },
    { id: 'teachers', label: 'Teacher Roster', icon: Users },
    { id: 'classes', label: 'Classes & Management', icon: GraduationCap },
    { id: 'timetable', label: 'Class & Exam Timetables', icon: CalendarCheck2 },
    { id: 'scores', label: 'Score Approvals & Reports', icon: FileText },
    {
      id: 'submissions',
      label: 'Submissions & Approvals',
      icon: FileCheck2,
      badge: pendingReviewCount > 0 ? pendingReviewCount : null
    },
    { id: 'exam_questions', label: 'Exam Questions', icon: Sparkles },
    { id: 'attendance', label: 'Attendance Reports', icon: CalendarCheck2 },
    { id: 'public_chat', label: 'Parent-Teacher Room', icon: MessagesSquare },
    { id: 'direct_chat', label: '1 on 1 Parent-Teacher Room', icon: MessageSquare },
    { id: 'user_permissions', label: 'User Roles & Permissions', icon: Key },
    { id: 'audit_logs', label: 'Activity & Audit Log', icon: Clock },
    { id: 'settings', label: 'School Settings', icon: Settings }
  ];

  const teacherNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Teacher Dashboard', icon: LayoutDashboard },
    { id: 'timetable', label: 'Class & Exam Timetables', icon: CalendarCheck2 },
    { id: 'scores', label: 'Continuous Assessment & Scores', icon: FileText },
    { id: 'teacher_submissions', label: 'My Lesson Submissions', icon: FileText },
    { id: 'exam_questions', label: 'Exam Questions', icon: Sparkles },
    { id: 'teacher_attendance', label: 'Mark Attendance', icon: UserCheck },
    { id: 'public_chat', label: 'Parent-Teacher Room', icon: MessagesSquare },
    { id: 'direct_chat', label: '1 on 1 Parent-Teacher Room', icon: MessageSquare }
  ];

  const parentNavItems: NavItem[] = [
    { id: 'parent', label: 'Parent Portal Home', icon: ShieldCheck },
    { id: 'public_chat', label: 'Parent-Teacher Room', icon: MessagesSquare },
    { id: 'direct_chat', label: '1 on 1 Parent-Teacher Room', icon: MessageSquare },
    { id: 'timetable', label: 'Class & Exam Timetables', icon: CalendarCheck2 },
    { id: 'scores', label: 'Terminal Report Cards', icon: FileText }
  ];

  const rawNavItems = isAdmin ? adminNavItems : isParent ? parentNavItems : teacherNavItems;

  // Filter items based on access rights
  const navItems = rawNavItems.filter(item => canAccessView(effectiveUser, item.id));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col border-r border-slate-800 min-h-[calc(100vh-4rem)] shrink-0">
      
      {/* Role Badge Indicator */}
      <div className="p-4 border-b border-slate-800/80">
        <div className={`p-3 rounded-xl border flex items-center gap-3 ${roleBadge.bgClass} ${roleBadge.borderClass}`}>
          <div className="p-2 rounded-lg bg-slate-900/60 shrink-0">
            <ShieldCheck className={`h-5 w-5 ${roleBadge.textClass}`} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Role</p>
            <p className={`text-xs font-extrabold truncate ${roleBadge.textClass}`}>{roleBadge.label}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Navigation Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 animate-pulse">
                  {item.badge}
                </span>
              ) : (
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isActive ? 'opacity-100' : 'opacity-0'}`} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
        <p className="font-semibold text-slate-400">TeXora Forge v2.5</p>
        <p>Encrypted Academic Workflows</p>
      </div>
    </aside>
  );
};
