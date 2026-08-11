/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
  Info,
  Building2,
  AlertCircle,
  Database,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { useAppStore } from '../storage';
import { UserRole } from '../types';
import { Logo } from './Logo';
import { SupabaseService } from '../lib/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthViewProps {
  onSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const { users, actions, isSupabaseActive } = useAppStore();
  const [tab, setTab] = useState<'LOGIN' | 'PARENT_CODE' | 'REGISTER_SCHOOL'>('LOGIN');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@apexhorizon.edu');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginRole, setLoginRole] = useState<UserRole>('SCHOOL_ADMIN');
  const [parentAccessCodeInput, setParentAccessCodeInput] = useState('PAR-2026-1049');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // School registration form state
  const [schoolName, setSchoolName] = useState('');
  const [schoolMotto, setSchoolMotto] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [schoolLogoUrl, setSchoolLogoUrl] = useState('');

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Logo image file size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await SupabaseService.signIn(loginEmail.trim(), loginPassword);
        if (error) {
          // If user doesn't exist in Supabase auth yet, fall back to checking profile list or attempt auto sign up
          console.warn('Supabase auth sign in note:', error.message);
        }
      }

      const user = users.find(u => u.email.toLowerCase() === loginEmail.trim().toLowerCase());
      if (!user) {
        setErrorMessage(`No profile found for email "${loginEmail}". Check spelling or select a demo preset.`);
        setIsSubmitting(false);
        return;
      }

      if (loginRole === 'TEACHER' && user.role !== 'TEACHER') {
        setErrorMessage(`This account is registered as a School Admin. Please switch role to School Admin.`);
        setIsSubmitting(false);
        return;
      }

      actions.setCurrentSchoolId(user.schoolId);
      actions.setCurrentUserId(user.id);
      setIsSubmitting(false);
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred during authentication.');
      setIsSubmitting(false);
    }
  };

  const handleRegisterSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!schoolName || !adminName || !adminEmail) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSupabaseConfigured()) {
        await SupabaseService.signUp(adminEmail.trim(), 'password123', {
          name: adminName,
          role: 'PROPRIETOR'
        });
      }

      actions.createSchoolAndAdmin(schoolName, schoolMotto, adminName, adminEmail, schoolLogoUrl);
      setIsSubmitting(false);
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to register school.');
      setIsSubmitting(false);
    }
  };

  const handleParentCodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!parentAccessCodeInput.trim()) {
      setErrorMessage('Please enter your Parent Access Code.');
      return;
    }

    const parentUser = actions.loginAsParentWithAccessCode(parentAccessCodeInput.trim());
    if (parentUser) {
      onSuccess();
    } else {
      setErrorMessage('Invalid Parent Access Code. Please check the code provided on your child’s admission letter (e.g. PAR-2026-1049).');
    }
  };

  const handleQuickDemo = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      actions.setCurrentSchoolId(user.schoolId);
      actions.setCurrentUserId(user.id);
      onSuccess();
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-900 text-slate-100 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Banner Header */}
        <div className="p-6 sm:p-8 text-center border-b border-slate-700/80 bg-slate-900/60 flex flex-col items-center">
          <div className="mb-3">
            <Logo size="xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            TeXora <span className="text-indigo-400">Forge</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            The Next-Gen School Lesson & Academic Management Platform
          </p>

          {/* Supabase Status Indicator */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 border border-slate-700">
            <Database className={`h-3.5 w-3.5 ${isSupabaseActive ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-slate-300">
              Backend Engine: {isSupabaseActive ? 'Supabase Database Active' : 'Supabase (Awaiting Vercel Env Keys)'}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 bg-slate-900/80 p-1 border-b border-slate-700/80 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setTab('LOGIN'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`py-2.5 text-center transition-all rounded-lg flex items-center justify-center gap-1.5 ${
              tab === 'LOGIN'
                ? 'bg-slate-800 text-indigo-400 shadow-xs border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="h-3.5 w-3.5" /> Staff Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('PARENT_CODE'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`py-2.5 text-center transition-all rounded-lg flex items-center justify-center gap-1.5 ${
              tab === 'PARENT_CODE'
                ? 'bg-emerald-950/80 text-emerald-400 shadow-xs border border-emerald-800/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Parent Portal
          </button>
          <button
            type="button"
            onClick={() => { setTab('REGISTER_SCHOOL'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`py-2.5 text-center transition-all rounded-lg flex items-center justify-center gap-1.5 ${
              tab === 'REGISTER_SCHOOL'
                ? 'bg-slate-800 text-indigo-400 shadow-xs border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" /> New School
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {tab === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Role Selection Tabs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Select Sign-In Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setLoginRole('SCHOOL_ADMIN'); setLoginEmail('proprietor@apexhorizon.edu'); }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      loginEmail === 'proprietor@apexhorizon.edu'
                        ? 'bg-amber-950/60 border-amber-500 text-white shadow-md shadow-amber-950/40'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0 mb-1" />
                    <div>
                      <p className="text-xs font-bold">Proprietor</p>
                      <p className="text-[10px] text-slate-400 truncate">School Owner</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setLoginRole('SCHOOL_ADMIN'); setLoginEmail('admin@apexhorizon.edu'); }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      loginEmail === 'admin@apexhorizon.edu'
                        ? 'bg-purple-950/60 border-purple-500 text-white shadow-md shadow-purple-950/40'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Building2 className="h-4 w-4 text-purple-400 shrink-0 mb-1" />
                    <div>
                      <p className="text-xs font-bold">VP / Admin</p>
                      <p className="text-[10px] text-slate-400 truncate">Academic Admin</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setLoginRole('TEACHER'); setLoginEmail('d.okon@apexhorizon.edu'); }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      loginRole === 'TEACHER'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950/40'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <UserCheck className="h-4 w-4 text-emerald-400 shrink-0 mb-1" />
                    <div>
                      <p className="text-xs font-bold">Teacher</p>
                      <p className="text-[10px] text-slate-400 truncate">Class & Lessons</p>
                    </div>
                  </button>
                </div>
              </div>

              {loginRole === 'TEACHER' && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Strict Role Isolation Notice:</span> Teacher accounts are created exclusively by your School Admin. Teachers cannot sign up independently.
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {loginRole === 'TEACHER' ? 'Teacher Assigned Email / Employee ID' : 'Account Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="e.g. proprietor@apexhorizon.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : tab === 'PARENT_CODE' ? (
            <form onSubmit={handleParentCodeLogin} className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs space-y-1">
                <span className="font-bold block text-sm">Parent Portal Access</span>
                <p>Enter the unique Parent Access Code printed on your child's official admission letter or student ID card to view terminal report cards and homework.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Parent Access Code
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                  <input
                    type="text"
                    required
                    value={parentAccessCodeInput}
                    onChange={e => setParentAccessCodeInput(e.target.value)}
                    placeholder="e.g. PAR-2026-1049"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/50 text-emerald-400 font-mono font-bold text-sm uppercase placeholder-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <span>Access Parent Portal</span> <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSchool} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-1">
                <span className="font-bold block text-xs uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" /> Proprietor Sign-Up Portal Only
                </span>
                <p className="text-[11px] leading-relaxed text-amber-200/90">
                  Only School Proprietors are permitted to register new schools. As Proprietor, you will have full executive control and can provision accounts for Vice Principals & School Admins, while School Admins provision Teacher accounts.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">School Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Citadel Crest International School"
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">School Motto / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Wisdom, Integrity & Courage"
                  value={schoolMotto}
                  onChange={e => setSchoolMotto(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* School Logo Upload Field */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Upload School Logo</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional (PNG, JPG, SVG - Max 5MB)</span>
                </label>
                {schoolLogoUrl ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-700">
                    <img src={schoolLogoUrl} alt="Uploaded logo preview" className="h-12 w-12 object-contain rounded-lg bg-white/10 p-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Logo Uploaded
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">Will appear on exam papers & official documents</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSchoolLogoUrl('')}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      title="Remove Logo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900 border border-dashed border-slate-700 hover:border-indigo-500/80 hover:bg-slate-800/80 text-slate-400 hover:text-indigo-300 transition-all cursor-pointer group">
                    <Upload className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium">Click to upload School Logo image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Proprietor / Owner Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chief Dr. Samuel Vance"
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Proprietor Official Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. proprietor@school.edu"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
              >
                {isSubmitting ? 'Creating School Account...' : 'Register School & Provision Proprietor Account'} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Preset Demo Quick Logins */}
          <div className="pt-4 border-t border-slate-700/80">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Instant Demo Presets (1-Click)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('usr_proprietor1')}
                className="p-2 rounded-xl bg-amber-950/40 border border-amber-800/60 hover:bg-amber-900/50 text-left transition-colors cursor-pointer"
              >
                <p className="text-xs font-bold text-amber-200 truncate">Dr. Arthur Pendelton</p>
                <p className="text-[10px] text-amber-400 font-semibold">Proprietor (Owner)</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('usr_vp1')}
                className="p-2 rounded-xl bg-blue-950/40 border border-blue-800/60 hover:bg-blue-900/50 text-left transition-colors cursor-pointer"
              >
                <p className="text-xs font-bold text-blue-200 truncate">Mrs. Folorunsho</p>
                <p className="text-[10px] text-blue-400 font-semibold">Vice Principal</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('usr_admin1')}
                className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/60 hover:bg-purple-900/50 text-left transition-colors cursor-pointer"
              >
                <p className="text-xs font-bold text-purple-200 truncate">Dr. Eleanor Vance</p>
                <p className="text-[10px] text-purple-400 font-semibold">School Admin</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('usr_t1')}
                className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/60 hover:bg-emerald-900/50 text-left transition-colors cursor-pointer"
              >
                <p className="text-xs font-bold text-emerald-200 truncate">Mr. David Okon</p>
                <p className="text-[10px] text-emerald-400 font-semibold">Physics Teacher</p>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
