import { supabase, isSupabaseConfigured } from '../config/supabase';

/**
 * Supabase Authentication & Database Service for LifeLink
 */

export const supabaseAuthService = {
  async register(userData) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase credentials not configured.');
    }

    const { email, password, full_name, role, phone, city, blood_group, organ_needed, organs_registered, hospital_name, license_number } = userData;

    // 1. Register with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          full_name,
          role
        }
      }
    });

    if (error) {
      console.warn('Supabase Auth error:', error.message);
      throw error;
    }

    const user = data.user;
    const session = data.session;

    const userProfile = {
      id: user?.id || Date.now().toString(),
      email: email.toLowerCase().trim(),
      full_name: full_name || '',
      role: role || 'donor',
      phone: phone || '',
      city: city || 'Mumbai',
      blood_group: blood_group || 'O+',
      organ_needed: organ_needed || '',
      organs_registered: organs_registered || '',
      hospital_name: role === 'hospital' ? hospital_name || 'General Hospital' : '',
      license_number: license_number || '',
      is_verified: true,
      created_at: new Date().toISOString()
    };

    // 2. Insert into Supabase DB table 'users'
    try {
      await supabase.from('users').upsert([userProfile]);
    } catch (e) {
      console.warn('Supabase DB table insertion info:', e);
    }

    return {
      success: true,
      user: userProfile,
      token: session?.access_token || 'supabase_session_active'
    };
  },

  async login(email, password) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    });

    if (error) {
      throw error;
    }

    const user = data.user;
    const session = data.session;

    // Fetch user profile from Supabase DB
    let userProfile;
    try {
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (dbUser) {
        userProfile = dbUser;
      }
    } catch (e) {
      console.warn('Could not fetch user profile from Supabase DB:', e);
    }

    if (!userProfile) {
      userProfile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        role: user.user_metadata?.role || 'donor',
        is_verified: true
      };
    }

    return {
      success: true,
      user: userProfile,
      token: session?.access_token || 'supabase_token'
    };
  },

  async logout() {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
  }
};

export const supabaseDatabaseService = {
  async fetchTable(tableName) {
    if (!isSupabaseConfigured()) return [];
    try {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn(`Supabase fetchTable error on ${tableName}:`, e);
      return [];
    }
  },

  subscribeToRealtime(tableName, callback) {
    if (!isSupabaseConfigured()) return () => {};

    const channel = supabase
      .channel(`public:${tableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (payload) => {
        console.log(`⚡ Supabase Realtime Change in ${tableName}:`, payload);
        callback(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
