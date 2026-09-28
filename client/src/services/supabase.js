import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL
    ? import.meta.env.VITE_SUPABASE_URL
    : 'https://bwiytslmkiyzdaijjtka.supabase.co';

const supabaseAnonKey =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY
    ? import.meta.env.VITE_SUPABASE_ANON_KEY
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3aXl0c2xta2l5emRhaWpqdGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNDcxOTYsImV4cCI6MjEwNDYyMzE5Nn0.Rke5rXqI5bS9lRbwsW5lXLyCWe2qhWkY6-pCMZqbM6o';

export let supabase = null;
export let isSupabaseConfigured = false;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    isSupabaseConfigured = true;
  }
} catch (err) {
  console.warn('[Supabase] Client fallback to local demo mode:', err.message);
}

export async function checkSupabaseConnection() {
  if (!supabase) return { connected: false, error: 'Supabase client not initialized' };
  try {
    const { data, error } = await supabase.from('inventory').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return { connected: true, authenticated: false, message: error.message };
    }
    return { connected: true, authenticated: true };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

export function subscribeToTable(tableName, callback) {
  if (!supabase) return () => {};
  try {
    const channel = supabase
      .channel(`public:${tableName}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch {
    return () => {};
  }
}
