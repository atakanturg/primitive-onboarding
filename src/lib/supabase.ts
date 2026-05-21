import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL  as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = url && key
  ? createClient(url, key, {
      auth: { persistSession: true, detectSessionInUrl: true },
    })
  : null;
