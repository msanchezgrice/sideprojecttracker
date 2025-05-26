import { createClient } from '@supabase/supabase-js';

// Optional: Supabase client for additional features like real-time subscriptions, storage, etc.
// The main database operations still use the direct PostgreSQL connection in db.ts

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => Boolean(supabase); 