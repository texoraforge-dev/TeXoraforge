import { createClient } from '@supabase/supabase-js';

const rawUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://gnzexbomymjiccmdbury.supabase.co';

const supabaseUrl = rawUrl
  ? rawUrl.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '')
  : 'https://gnzexbomymjiccmdbury.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_8uLBqk0MeTFPRLVf1XW7vw_LG4w4ENa';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
