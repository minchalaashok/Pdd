const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rghyqbbtfdvndqvexlbz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_jM8HXXExYsFZ5IJBzYKzXw_Irui2JDR';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = {
  supabase,
  SUPABASE_URL,
  SUPABASE_KEY
};
