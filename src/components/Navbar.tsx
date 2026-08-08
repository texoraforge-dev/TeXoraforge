/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  School as SchoolIcon,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  BookOpen,
  LogOut,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '../storage';
import { UserRole, Submission } from '../types';
import { Logo } from './Logo';
import { GlobalSearch } from './GlobalSearch';
import { SupabaseService } from '../lib/supabaseService';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenNotifications: () => void;
  onNavigate: (view: string) => void;
  onSelectSubmission?: (submission: Submission) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  onOpenNotifications,
  onNavigate,
  onSelectSubmission
}) => {
  const { school, currentUser, users, notifications, actions } = useAppStore();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);
  const unreadCount = unreadNotifications.length;

  const unreadApprovals = unreadNotifications.filter(n => n.type === 'APPROVAL').length;
  const unreadRejections = unreadNotifications.filter(n => n.type === 'REJECTION' || n.type === 'CORRECTION').length;
  const unreadSubmissions = unreadNotifications.filter(n => n.type === 'SUBMISSION').length;

  const notificationTitle = unreadCount > 0
    ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` +
      (unreadApprovals > 0 ? ` • ${unreadApprovals} Approval${unreadApprovals > 1 ? 's' : ''}` : '') +
      (unreadRejections > 0 ? ` • ${unreadRejections} Rejection/Correction${unreadRejections > 1 ? 's' : ''}` : '') +
      (unreadSubmissions > 0 ? ` • ${unreadSubmissions} Submission${unreadSubmissions > 1 ? 's' : ''}` : '')
    : 'Notifications';

  const handleSwitchUser = (userId: string) => {
    actions.setCurrentUserId(userId);
    setShowDemoMenu(false);
    setShowUserMenu(false);
    onNavigate('dashboard');
  };

  const handleLogout = () => {
    SupabaseService.signOut().catch(console.error);
    actions.setCurrentUserId(null);
    setShowUserMenu(false);
    onNavigate('auth');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & School Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center cursor-pointer shrink-0" onClick={() => onNavigate('dashboard')}>
            <Logo size="md" showText subtext={school ? school.name : 'Academic Management Platform'} />
          </div>
        </div>

        {/* Global Search Bar */}
        {currentUser && (
          <GlobalSearch
            onNavigate={onNavigate}
            onSelectSubmission={onSelectSubmission}
          />
        )}

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Quick Demo Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 transition-all shadow-xs"
              title="Quickly switch roles for evaluation"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline font-semibold">Demo Role Switcher</span>
              <span className="sm:hidden font-semibold">Switch Role</span>
              <ChevronDown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Switch Role Demo Preset</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Test Admin vs Teacher perspective instantly</p>
                </div>
                <div className="py-1">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleSwitchUser(u.id)}
                      className={`w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                        currentUser?.id === u.id ? 'bg-indigo-50/70 dark:bg-indigo-950/40' : ''
                      }`}
                    >
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{u.name}</p>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            u.role === 'SCHOOL_ADMIN' 
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300' 
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                          }`}>
                            {u.role === 'SCHOOL_ADMIN' ? 'Admin' : 'Teacher'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {u.role === 'SCHOOL_ADMIN' ? 'School Administrator' : `${u.assignedSubjects.slice(0,2).join(', ')}`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-3 pt-2 pb-1 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <button
                    onClick={() => actions.resetToDemo()}
                    className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Reset Demo Data
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>

          {/* Notifications Trigger */}
          {currentUser && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={notificationTitle}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className={`absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs transition-transform ${
                  unreadRejections > 0
                    ? 'bg-rose-500 animate-pulse'
                    : unreadApprovals > 0
                    ? 'bg-emerald-600'
                    : 'bg-indigo-600'
                }`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User Account / Profile */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/20"
                />
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {currentUser.role === 'SCHOOL_ADMIN' ? 'School Admin' : 'Teacher'}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => { setShowUserMenu(false); onNavigate('settings'); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <SchoolIcon className="h-3.5 w-3.5 text-slate-400" /> School Details
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Sign In
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
