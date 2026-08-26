import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SignUpProps {
  onSuccess?: () => void;
  onNavigateToSignIn?: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onSuccess, onNavigateToSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setInfoMessage(null);
    setIsGoogleLoading(true);
    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setIsGoogleLoading(false);
        return;
      }
    } catch (err: any) {
      setError(err?.message || 'Google Sign-In failed.');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      setLoading(false);

      // If data.session is null, do not redirect. Show confirmation instruction.
      if (!data?.session) {
        setInfoMessage('Check your email and confirm your account before logging in.');
        return;
      }

      // Only redirect when a real session exists
      if (onSuccess) {
        onSuccess();
      }

      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during sign up.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Sign Up</h2>
        <p className="text-xs text-slate-400 mt-1">Create a new account to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || isGoogleLoading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* Continue with Google with Supabase OAuth */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500">Or continue with</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <button
          type="button"
          disabled={isGoogleLoading || loading}
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-indigo-500/80 hover:bg-slate-700/80 text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
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

        {/* Error message under the form */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success / Verification notice */}
        {infoMessage && (
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}
      </form>

      {onNavigateToSignIn && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onNavigateToSignIn}
            className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
          >
            Already have an account? Sign In
          </button>
        </div>
      )}
    </div>
  );
};
