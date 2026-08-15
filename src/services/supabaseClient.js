import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
export const SUPABASE_CONFIG = {
  projectUrl: 'https://baxdugexesrglfpxuess.supabase.co',
  anonKey: 'sb_publishable_6U3mjliIxh7zfUdlBYp0aA_joaBHdPd',
  // Optional Cloudflare CDN Edge Proxy URL (set when deployed)
  cloudflareProxyUrl: null
};

// Initialize direct Supabase client for Admin Realtime, Writes, and standard reads
export const supabase = createClient(
  SUPABASE_CONFIG.cloudflareProxyUrl || SUPABASE_CONFIG.projectUrl,
  SUPABASE_CONFIG.anonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

export default supabase;
