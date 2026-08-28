/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
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
  MessagesSquare,
  BookOpen,
  Laptop,
  AlertTriangle,
  FolderLock,
  X,
  MapPin,
  DollarSign,
  Calculator,
  CreditCard,
  Library,
  Bus,
  Wand2,
  Search,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { UserRole } from '../types';
import { useAppStore } from '../storage';
import { getRoleBadgeInfo, canAccessView } from '../lib/permissions';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  role: UserRole;
  pendingReviewCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ForwardRefExoticComponent<any>;
  badge?: number | null;
  category?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  role,
  pendingReviewCount = 0,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { currentUser, school } = useAppStore();
  const [navSearch, setNavSearch] = useState('');
  const effectiveUser = currentUser || { id: '', schoolId: '', name: '', email: '', role };
  const roleBadge = getRoleBadgeInfo(effectiveUser.role);

  const isProprietor = effectiveUser.role === 'PROPRIETOR';
  const isPrincipal = effectiveUser.role === 'PRINCIPAL';
  const isVP = effectiveUser.role === 'VICE_PRINCIPAL';
  const isAdmin = effectiveUser.role === 'SCHOOL_ADMIN' || isProprietor || isVP || isPrincipal;
  const isParent = effectiveUser.role === 'PARENT';
  const isStudent = effectiveUser.role === 'STUDENT';

  const allNavItems: NavItem[] = useMemo(() => {
    if (isAdmin) {
      return [
        { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, category: 'Overview' },
        { id: 'accounts', label: 'Proprietor Accounts', icon: Users, category: 'Overview' },

        { id: 'classes', label: 'Classes & Management', icon: GraduationCap, category: 'Academic Operations' },
        { id: 'school_students', label: 'School Students Directory', icon: Users, category: 'Academic Operations' },
        { id: 'students', label: 'Student Admissions & IDs', icon: GraduationCap, category: 'Academic Operations' },
        { id: 'teachers', label: 'Teacher Faculty Roster', icon: Users, category: 'Academic Operations' },
        { id: 'timetable', label: 'Class & Exam Timetables', icon: CalendarCheck2, category: 'Academic Operations' },
        { id: 'scores', label: 'Score Approvals & Reports', icon: FileText, category: 'Academic Operations' },
        {
          id: 'submissions',
          label: 'Submissions & Approvals',
          icon: FileCheck2,
          badge: pendingReviewCount > 0 ? pendingReviewCount : null,
          category: 'Academic Operations'
        },
        { id: 'attendance', label: 'Student Attendance Logs', icon: CalendarCheck2, category: 'Academic Operations' },

        { id: 'ai_studio', label: 'AI Creative & Video Studio', icon: Wand2, category: 'Intelligence & Curriculum' },
        { id: 'curriculum', label: 'Curriculum & Scheme', icon: BookOpen, category: 'Intelligence & Curriculum' },
        { id: 'cbt_engine', label: 'AI CBT Examination Hub', icon: Laptop, category: 'Intelligence & Curriculum' },
        { id: 'exam_questions', label: 'Exam Questions Engine', icon: Sparkles, category: 'Intelligence & Curriculum' },
        { id: 'early_warning', label: 'Student Risk & Remedials', icon: AlertTriangle, category: 'Intelligence & Curriculum' },
        { id: 'textbook_library', label: 'Digital Textbook Library', icon: Library, category: 'Intelligence & Curriculum' },

        { id: 'bus_tracking', label: 'Live Bus Fleet & Routes', icon: Bus, category: 'Operations & Finance' },
        { id: 'staff_attendance', label: 'Staff Attendance & Geofence', icon: MapPin, category: 'Operations & Finance' },
        { id: 'payroll', label: 'Proprietor Payroll & Salaries', icon: DollarSign, category: 'Operations & Finance' },
        { id: 'parent_fees', label: 'Student Fees & Payments', icon: CreditCard, category: 'Operations & Finance' },
        { id: 'document_vault', label: 'Vault, Fees & Operations', icon: FolderLock, category: 'Operations & Finance' },

        { id: 'student_accounts', label: 'Student Accounts & Chat', icon: Key, category: 'School Community' },
        { id: 'public_chat', label: 'Parent-Teacher Room', icon: MessagesSquare, category: 'School Community' },
        { id: 'direct_chat', label: '1 on 1 Parent-Teacher Chat', icon: MessageSquare, category: 'School Community' },

        { id: 'user_permissions', label: 'User Roles & Permissions', icon: Key, category: 'System Administration' },
        { id: 'audit_logs', label: 'Security & Audit Logs', icon: Clock, category: 'System Administration' },
        { id: 'settings', label: 'School Settings & Identity', icon: Settings, category: 'System Administration' }
      ];
    }

    if (isStudent) {
      return [
        { id: 'student_class_chat', label: 'Class Discussion Chat', icon: MessageSquare, category: 'Learning Hub' },
        { id: 'ai_studio', label: 'AI Creative Studio', icon: Wand2, category: 'Learning Hub' },
        { id: 'textbook_library', label: 'Textbook Library', icon: Library, category: 'Learning Hub' },
        { id: 'cbt_engine', label: 'CBT Examination Hub', icon: Laptop, category: 'Assessments' },
        { id: 'timetable', label: 'Class Timetable', icon: CalendarCheck2, category: 'Assessments' },
        { id: 'early_warning', label: 'Remedials & Study Plans', icon: BookOpen, category: 'Assessments' }
      ];
    }

    if (isParent) {
      return [
        { id: 'parent', label: 'Parent Portal Home', icon: ShieldCheck, category: 'Parent Portal' },
        { id: 'parent_fees', label: 'Child Fees & Payments', icon: CreditCard, category: 'Parent Portal' },
        { id: 'scores', label: 'Terminal Report Cards', icon: FileText, category: 'Academic Progress' },
        { id: 'timetable', label: 'Class & Exam Timetables', icon: CalendarCheck2, category: 'Academic Progress' },
        { id: 'early_warning', label: 'Child Academic Growth Radar', icon: AlertTriangle, category: 'Academic Progress' },
        { id: 'bus_tracking', label: 'Live School Bus Tracking', icon: Bus, category: 'Safety & Tools' },
        { id: 'ai_studio', label: 'AI Visual & Audio Studio', icon: Wand2, category: 'Safety & Tools' },
        { id: 'parent_ai_assistant', label: 'AI Parent & Tutor Assistant', icon: Sparkles, category: 'Safety & Tools' },
        { id: 'public_chat', label: 'Parent-Teacher Lounge', icon: MessagesSquare, category: 'Communication' },
        { id: 'direct_chat', label: '1-on-1 Teacher Chat', icon: MessageSquare, category: 'Communication' }
      ];
    }

    // Teacher navigation
    return [
      { id: 'dashboard', label: 'Teacher Dashboard', icon: LayoutDashboard, category: 'Overview' },
      
      { id: 'teacher_attendance', label: 'Mark Student Attendance', icon: UserCheck, category: 'Classroom & Assessment' },
      { id: 'scores', label: 'Continuous Assessment & Scores', icon: FileText, category: 'Classroom & Assessment' },
      { id: 'teacher_submissions', label: 'My Lesson Submissions', icon: FileText, category: 'Classroom & Assessment' },
      { id: 'timetable', label: 'Class Timetables', icon: CalendarCheck2, category: 'Classroom & Assessment' },

      { id: 'curriculum', label: 'Curriculum & Scheme', icon: BookOpen, category: 'AI & Curriculum' },
      { id: 'ai_studio', label: 'AI Creative & Video Studio', icon: Wand2, category: 'AI & Curriculum' },
      { id: 'cbt_engine', label: 'AI CBT Examination Hub', icon: Laptop, category: 'AI & Curriculum' },
      { id: 'exam_questions', label: 'Exam Questions Authoring', icon: Sparkles, category: 'AI & Curriculum' },
      { id: 'early_warning', label: 'Student Risk Radar', icon: AlertTriangle, category: 'AI & Curriculum' },
      { id: 'textbook_library', label: 'Textbook Library', icon: Library, category: 'AI & Curriculum' },

      { id: 'staff_attendance', label: 'Staff Sign-In & Sign-Out', icon: MapPin, category: 'Faculty & Logistics' },
      { id: 'bus_tracking', label: 'Live School Bus Fleet', icon: Bus, category: 'Faculty & Logistics' },

      { id: 'student_accounts', label: 'Student Accounts & Class Chat', icon: Key, category: 'Community' },
      { id: 'public_chat', label: 'Parent-Teacher Room', icon: MessagesSquare, category: 'Community' },
      { id: 'direct_chat', label: '1 on 1 Parent-Teacher Room', icon: MessageSquare, category: 'Community' }
    ];
  }, [isAdmin, isStudent, isParent, pendingReviewCount]);

  // Filter items based on user access and optional search
  const filteredNavItems = useMemo(() => {
    const accessible = allNavItems.filter(item => canAccessView(effectiveUser, item.id));
    if (!navSearch.trim()) return accessible;
    const query = navSearch.toLowerCase().trim();
    return accessible.filter(item => item.label.toLowerCase().includes(query) || (item.category && item.category.toLowerCase().includes(query)));
  }, [allNavItems, effectiveUser, navSearch]);

  // Group items by category
  const groupedItems = useMemo<Record<string, NavItem[]>>(() => {
    const groups: Record<string, NavItem[]> = {};
    filteredNavItems.forEach(item => {
      const cat = item.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredNavItems]);

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navContent = (
    <div className="flex flex-col h-full bg-slate-900/95 dark:bg-slate-950 text-slate-300 select-none">
      {/* Role & School Badge Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 shadow-xs ${roleBadge.bgClass} ${roleBadge.borderClass}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-slate-900/70 border border-white/10 shrink-0 shadow-inner">
              <ShieldCheck className={`h-4 w-4 ${roleBadge.textClass}`} />
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Authenticated Portal</p>
              <p className={`text-xs font-black truncate tracking-tight ${roleBadge.textClass}`}>{roleBadge.label}</p>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Quick Menu Filter */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={navSearch}
            onChange={e => setNavSearch(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 placeholder-slate-500 text-[11px] font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {navSearch && (
            <button
              onClick={() => setNavSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto custom-scrollbar">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-xs">
            No matching menus found for "{navSearch}".
          </div>
        ) : (
          (Object.entries(groupedItems) as [string, NavItem[]][]).map(([category, items]) => (
            <div key={category} className="space-y-1">
              <div className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>{category}</span>
                <span className="text-[9px] font-bold text-slate-600 bg-slate-800/60 px-1.5 py-0.5 rounded-md">
                  {items.length}
                </span>
              </div>

              {items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold shadow-md shadow-indigo-600/25 ring-1 ring-white/10'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1 rounded-lg transition-colors ${
                        isActive ? 'bg-white/20 text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`}>
                        <Icon className="h-4 w-4 shrink-0" />
                      </div>
                      <span className="truncate text-left">{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 shadow-xs animate-pulse shrink-0">
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight className={`h-3 w-3 shrink-0 transition-transform ${
                        isActive ? 'opacity-100 translate-x-0.5 text-white' : 'opacity-0 group-hover:opacity-40 -translate-x-1'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
          ))
        )}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 text-[11px] text-slate-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-300 text-[11px] flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              TeXora Forge
            </p>
            <p className="text-[10px] text-slate-500">Academic Cloud OS v2.5</p>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/80 text-[10px] font-mono text-slate-400">
            TLS 1.3
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-68 bg-slate-900 text-slate-300 hidden md:flex flex-col border-r border-slate-800/80 min-h-[calc(100vh-4rem)] shrink-0 shadow-lg">
        {navContent}
      </aside>

      {/* Mobile Drawer Slide-out */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity duration-300"
            onClick={onCloseMobile}
          />
          <aside className="relative z-50 w-76 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 shadow-2xl animate-in slide-in-from-left duration-200">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};

