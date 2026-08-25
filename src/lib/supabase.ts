import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Read Vercel/Vite environment variables for Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('.supabase.co') &&
    supabaseAnonKey.length > 20
  );
};

// Fallback placeholder URL and Key to prevent runtime initialization crashes when keys are missing
const defaultUrl = isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co';
const defaultKey = isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key';

export const supabase = createClient<Database>(defaultUrl, defaultKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
