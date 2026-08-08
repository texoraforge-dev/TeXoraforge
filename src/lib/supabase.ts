import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Read Vercel/Vite environment variables or default to provided Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://arshudmtdmyobsmsumsm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_6RynYw5NbxYbuWJuQJB-YQ_eZ3kNmrO';

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
