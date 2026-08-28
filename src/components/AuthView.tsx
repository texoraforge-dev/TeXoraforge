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
  X,
  GraduationCap,
  KeyRound,
  Bus,
  Navigation
} from 'lucide-react';
import { useAppStore } from '../storage';
import { UserRole } from '../types';
import { Logo } from './Logo';
import { supabase } from '../supabaseClient';
import { SupabaseService } from '../lib/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import { FirebaseService } from '../lib/firebaseService';
import { uploadAppFile } from '../lib/supabaseStorage';

interface AuthViewProps {
  onSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const { users, actions, isSupabaseActive } = useAppStore();
  const [tab, setTab] = useState<'STUDENT_CODE' | 'LOGIN' | 'PARENT_CODE' | 'DRIVER_CODE' | 'REGISTER_SCHOOL'>('STUDENT_CODE');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<UserRole>('SCHOOL_ADMIN');
  const [parentAccessCodeInput, setParentAccessCodeInput] = useState('');
  
  // Student portal login state
  const [studentCodeInput, setStudentCodeInput] = useState('');
  const [studentPinInput, setStudentPinInput] = useState('');

  // Driver portal login state
  const [driverAccessCodeInput, setDriverAccessCodeInput] = useState('');
  const [driverPinInput, setDriverPinInput] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // School registration form state
  const [schoolName, setSchoolName] = useState('');
  const [schoolMotto, setSchoolMotto] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [schoolLogoUrl, setSchoolLogoUrl] = useState('');

  // Supabase Google Sign In Handler
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsGoogleLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error('Supabase Google OAuth Error:', err);
      setErrorMessage(err?.message || 'Google Sign-In failed.');
      setIsGoogleLoading(false);
    }
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      if (isSupabaseConfigured()) {
        try {
          const uploadRes = await uploadAppFile({
            featureName: 'logos',
            itemId: 'register_logo',
            file,
            customFileName: `school_logo_${Date.now()}.${file.name.split('.').pop() || 'png'}`
          });
          if (!uploadRes.error && uploadRes.signedUrl) {
            setSchoolLogoUrl(uploadRes.signedUrl);
          }
        } catch (err) {
          console.warn('Storage upload error for school registration logo:', err);
        }
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured()) {
        const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
          email: loginEmail.trim(),
          password: loginPassword,
        });
        if (supabaseError) {
          setErrorMessage(supabaseError.message);
          setIsSubmitting(false);
          return;
        }
        if (!data?.session && !data?.user) {
          setErrorMessage('No active session found. Please check your credentials.');
          setIsSubmitting(false);
          return;
        }
      }

      let user = users.find(u => u.email.toLowerCase() === loginEmail.trim().toLowerCase());
      if (!user && isSupabaseConfigured()) {
        const dbUsers = await SupabaseService.getUsers();
        user = dbUsers.find(u => u.email.toLowerCase() === loginEmail.trim().toLowerCase());
        if (user) {
          actions.saveUser(user);
        }
      }

      if (!user) {
        setErrorMessage(`No profile found for email "${loginEmail}". Please check your credentials or register an account.`);
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
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred during authentication.');
      setIsSubmitting(false);
    }
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!studentCodeInput.trim()) {
      setErrorMessage('Please enter your unique Student Code (e.g. TXR-P5-00482).');
      return;
    }

    const studentUser = actions.loginAsStudentWithCode(studentCodeInput.trim(), studentPinInput.trim());
    if (studentUser) {
      onSuccess();
    } else {
      setErrorMessage('Invalid Student Code or Access PIN. Please check your credentials or ask your Class Teacher.');
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
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: adminEmail.trim(),
          password: 'password123',
        });
        if (signUpError) {
          console.warn('Supabase sign up response:', signUpError.message);
        } else if (!data?.session) {
          // Auto sign-in to create active session immediately without email confirmation
          await supabase.auth.signInWithPassword({
            email: adminEmail.trim(),
            password: 'password123',
          }).catch(console.warn);
        }
      }

      // Create school & proprietor account and open app directly
      actions.createSchoolAndAdmin(schoolName, schoolMotto, adminName, adminEmail, schoolLogoUrl);
      setIsSubmitting(false);
      onSuccess();
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
      }
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

  const handleDriverCodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!driverAccessCodeInput.trim()) {
      setErrorMessage('Please enter your unique Driver Access Code (e.g. DRV-8492-BUS).');
      return;
    }

    const res = actions.loginAsDriverWithCode(driverAccessCodeInput.trim(), driverPinInput.trim());
    if (res) {
      onSuccess();
    } else {
      setErrorMessage('Invalid Driver Access Code or PIN. Please check your credential card from the School Proprietor.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Dynamic Ambient Background Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden relative z-10 ring-1 ring-white/10">
        
        {/* Banner Header */}
        <div className="p-6 sm:p-8 text-center border-b border-slate-800/80 bg-slate-950/60 flex flex-col items-center">
          <div className="mb-3">
            <Logo size="xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            TeXora <span className="text-indigo-400">Forge</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            The World-Class Academic & School Management Platform
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 bg-slate-950/90 p-1.5 border-b border-slate-800/80 text-[11px] font-bold gap-1">
          <button
            type="button"
            onClick={() => { setTab('STUDENT_CODE'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`py-2.5 text-center transition-all rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'STUDENT_CODE'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" /> Student
          </button>
          <button
            type="button"
            onClick={() => { setTab('DRIVER_CODE'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`py-2.5 text-center transition-all rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'DRIVER_CODE'
                ? 'bg-amber-600 text-slate-950 font-black shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Bus className="h-3.5 w-3.5" /> Driver
          </button>
          <button
            type="button"
            onClick={() => { setTab('LOGIN'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`py-2.5 text-center transition-all rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'LOGIN'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Lock className="h-3.5 w-3.5" /> Staff
          </button>
          <button
            type="button"
            onClick={() => { setTab('PARENT_CODE'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`py-2.5 text-center transition-all rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'PARENT_CODE'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Parent
          </button>
          <button
            type="button"
            onClick={() => { setTab('REGISTER_SCHOOL'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`py-2.5 text-center transition-all rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'REGISTER_SCHOOL'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" /> School
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5 shadow-sm">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 text-xs flex items-start gap-2.5 shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {tab === 'STUDENT_CODE' ? (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-indigo-200 text-xs space-y-1">
                <span className="font-bold block text-sm flex items-center gap-1.5 text-indigo-300">
                  <GraduationCap className="h-4 w-4 text-indigo-400" /> Student Account Login
                </span>
                <p>Enter your unique Student Code (e.g. <span className="font-mono text-indigo-300 font-bold">TXR-P5-00482</span>) and Access PIN provided by your Class Teacher to take CBT exams, view your class timetable, and participate in class discussion chat.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Student Access Code
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                  <input
                    type="text"
                    required
                    value={studentCodeInput}
                    onChange={e => setStudentCodeInput(e.target.value)}
                    placeholder="e.g. TXR-P5-00482"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/50 text-indigo-300 font-mono font-bold text-sm uppercase placeholder-slate-600 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Access PIN / Security Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                  <input
                    type="password"
                    required
                    value={studentPinInput}
                    onChange={e => setStudentPinInput(e.target.value)}
                    placeholder="e.g. 1234"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>Sign In to Student Portal</span> <ArrowRight className="h-4 w-4" />
              </button>

              <div className="pt-2">
                <p className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-indigo-400" /> Quick Student Login Presets:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setStudentCodeInput('TXR-P5-00482'); setStudentPinInput('1234'); }}
                    className="p-2 rounded-lg bg-slate-900/80 border border-indigo-900/60 hover:border-indigo-500 text-left transition-all cursor-pointer"
                  >
                    <p className="text-xs font-bold text-indigo-300">Adebayo Tobi</p>
                    <p className="text-[10px] text-slate-400">Primary 5 • Code: TXR-P5-00482</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStudentCodeInput('TXR-P5-00483'); setStudentPinInput('5678'); }}
                    className="p-2 rounded-lg bg-slate-900/80 border border-indigo-900/60 hover:border-indigo-500 text-left transition-all cursor-pointer"
                  >
                    <p className="text-xs font-bold text-indigo-300">Chidiebere Okafor</p>
                    <p className="text-[10px] text-slate-400">Primary 5 • Code: TXR-P5-00483</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStudentCodeInput('TXR-J2-00109'); setStudentPinInput('4321'); }}
                    className="p-2 rounded-lg bg-slate-900/80 border border-indigo-900/60 hover:border-indigo-500 text-left transition-all cursor-pointer"
                  >
                    <p className="text-xs font-bold text-indigo-300">Amina Bello</p>
                    <p className="text-[10px] text-slate-400">JSS 2 • Code: TXR-J2-00109</p>
                  </button>
                </div>
              </div>
            </form>
          ) : tab === 'DRIVER_CODE' ? (
            <form onSubmit={handleDriverCodeLogin} className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-1">
                <span className="font-bold block text-sm flex items-center gap-1.5 text-amber-300">
                  <Bus className="h-4 w-4 text-amber-400" /> School Bus Driver Portal
                </span>
                <p>Enter the unique Driver Code issued by your School Proprietor (e.g. <span className="font-mono text-amber-300 font-bold">DRV-8492-BUS</span>) to access your vehicle tracking toggle and broadcast live transit GPS.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Driver Access Code
                </label>
                <div className="relative">
                  <Bus className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                  <input
                    type="text"
                    required
                    value={driverAccessCodeInput}
                    onChange={e => setDriverAccessCodeInput(e.target.value)}
                    placeholder="e.g. DRV-8492-BUS"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-amber-500/50 text-amber-300 font-mono font-bold text-sm uppercase placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Security PIN / Passcode
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                  <input
                    type="password"
                    required
                    value={driverPinInput}
                    onChange={e => setDriverPinInput(e.target.value)}
                    placeholder="e.g. 1234"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
              >
                <span>Launch Driver Tracking Console</span> <ArrowRight className="h-4 w-4" />
              </button>

              <div className="pt-2">
                <p className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-400" /> Quick Driver Presets:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setDriverAccessCodeInput('DRV-8492-BUS'); setDriverPinInput('1234'); }}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-amber-900/60 hover:border-amber-500 text-left transition-all cursor-pointer"
                  >
                    <p className="text-xs font-bold text-amber-300">Mr. Samuel Igwe (Bus 01)</p>
                    <p className="text-[10px] text-slate-400">Island Shuttle • Code: DRV-8492-BUS</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDriverAccessCodeInput('DRV-2026-5541'); setDriverPinInput('1234'); }}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-amber-900/60 hover:border-amber-500 text-left transition-all cursor-pointer"
                  >
                    <p className="text-xs font-bold text-amber-300">Mr. Babatunde Alabi (Bus 02)</p>
                    <p className="text-[10px] text-slate-400">Mainland Shuttle • Code: DRV-2026-5541</p>
                  </button>
                </div>
              </div>
            </form>
          ) : tab === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Role Selection Tabs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Select Sign-In Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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

                  <button
                    type="button"
                    onClick={() => { setTab('STUDENT_CODE'); }}
                    className="p-2.5 rounded-xl border text-left transition-all cursor-pointer bg-slate-900/60 border-slate-700 text-slate-400 hover:border-indigo-500 hover:text-indigo-300"
                  >
                    <GraduationCap className="h-4 w-4 text-indigo-400 shrink-0 mb-1" />
                    <div>
                      <p className="text-xs font-bold">Student</p>
                      <p className="text-[10px] text-slate-400 truncate">Code & PIN Portal</p>
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

              {/* Google Sign-in with Firebase Auth */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-700"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500">Or continue with</span>
                <div className="flex-grow border-t border-slate-700"></div>
              </div>

              <button
                type="button"
                disabled={isGoogleLoading}
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500/80 hover:bg-slate-800/80 text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isGoogleLoading ? 'Connecting Google Account...' : 'Continue with Google'}</span>
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

        </div>
      </div>
    </div>
  );
};
