/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  CreditCard,
  Wifi,
  WifiOff,
  Menu,
  Camera,
  X,
  CheckCircle2
} from 'lucide-react';
import { useAppStore } from '../storage';
import { UserRole, Submission } from '../types';
import { Logo } from './Logo';
import { GlobalSearch } from './GlobalSearch';
import { SupabaseService } from '../lib/supabaseService';
import { getRoleBadgeInfo } from '../lib/permissions';
import { ImageUploadBox } from './ImageUploadBox';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenNotifications: () => void;
  onNavigate: (view: string) => void;
  onSelectSubmission?: (submission: Submission) => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  onOpenNotifications,
  onNavigate,
  onSelectSubmission,
  onToggleMobileMenu
}) => {
  const { school, currentUser, users, notifications, actions } = useAppStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [myPhotoUrl, setMyPhotoUrl] = useState('');

  const handleOpenMyPhoto = () => {
    setShowUserMenu(false);
    setMyPhotoUrl(currentUser?.avatarUrl || '');
    setShowPhotoModal(true);
  };

  const handleSaveMyPhoto = () => {
    if (!currentUser) return;
    actions.updateUserProfilePicture(currentUser.id, myPhotoUrl, currentUser);
    setShowPhotoModal(false);
  };

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

  const handleLogout = () => {
    SupabaseService.signOut().catch(console.error);
    actions.setCurrentUserId(null);
    setShowUserMenu(false);
    onNavigate('auth');
  };

  const userBadge = currentUser ? getRoleBadgeInfo(currentUser.role) : null;

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & School Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser && onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
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

          {/* Offline / Online Mode Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
              isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse'
            }`}
            title={isOnline ? 'Online - All changes synced' : 'Offline Mode Active - All data stored locally in browser'}
          >
            {isOnline ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden md:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>Offline Mode (Local)</span>
              </>
            )}
          </div>

          {/* Texora AI Voice Assistant Trigger */}
          <button
            onClick={() => {
              const fab = document.getElementById('texora-voice-assistant-fab');
              if (fab) fab.click();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/15 to-indigo-600/15 hover:from-purple-600/25 hover:to-indigo-600/25 text-purple-700 dark:text-purple-300 border border-purple-300/40 dark:border-purple-700/40 transition-all cursor-pointer shadow-xs"
            title="Texora AI Voice Assistant - Tap to listen immediately"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            <span className="hidden sm:inline text-xs font-black">Texora Voice</span>
          </button>

          {/* Theme Toggle */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.06 }}
            onClick={() => setDarkMode(!darkMode)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer overflow-hidden border border-slate-200/60 dark:border-slate-700/60 shadow-xs"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Light/Dark Theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              {darkMode ? (
                <motion.div
                  key="sun-icon"
                  initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex items-center justify-center"
                >
                  <Sun className="h-4.5 w-4.5 text-amber-400 fill-amber-400/20 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon-icon"
                  initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex items-center justify-center"
                >
                  <Moon className="h-4.5 w-4.5 text-slate-700 fill-slate-700/10 drop-shadow-[0_0_6px_rgba(51,65,85,0.3)]" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

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
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
              >
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/20"
                />
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                    {userBadge?.label}
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
                    onClick={handleOpenMyPhoto}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5 text-slate-400" /> Change Profile Picture
                  </button>
                  <button
                    onClick={() => { setShowUserMenu(false); onNavigate('settings'); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <SchoolIcon className="h-3.5 w-3.5 text-slate-400" /> School Details
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}

        </div>
      </div>

      {/* Quick Profile Picture Update Modal */}
      {showPhotoModal && currentUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Update Profile Picture
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {currentUser.name} • {currentUser.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ImageUploadBox
              value={myPhotoUrl}
              onChange={setMyPhotoUrl}
              rolePreset={currentUser.role}
              label="Account Avatar / Photograph"
              helperText="Upload a file from your device, take a camera snap, or choose a persona avatar."
            />

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMyPhoto}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
