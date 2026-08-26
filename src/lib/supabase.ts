import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Read Vercel/Vite environment variables or default to new Supabase project credentials
const rawUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://gnzexbomymjiccmdbury.supabase.co';

// Normalize URL in case /rest/v1 or trailing slashes are appended
const supabaseUrl = rawUrl
  ? rawUrl.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '')
  : 'https://gnzexbomymjiccmdbury.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_8uLBqk0MeTFPRLVf1XW7vw_LG4w4ENa';

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
