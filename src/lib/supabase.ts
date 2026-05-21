import { createClient } from '@supabase/supabase-js';
import { cookieStorage } from './cookieStorage';

const url = import.meta.env.VITE_SUPABASE_URL  as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = url && key
  ? createClient(url, key, {
      auth: { storage: cookieStorage, storageKey: 'primitive-os-auth', persistSession: true, detectSessionInUrl: true },
    })
  : null;
