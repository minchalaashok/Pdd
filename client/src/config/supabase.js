import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

export const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL') || 'https://rghyqbbtfdvndqvexlbz.supabase.co';
export const SUPABASE_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'sb_publishable_jM8HXXExYsFZ5IJBzYKzXw_Irui2JDR';

export const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_KEY);

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
