import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
export const SUPABASE_CONFIG = {
  projectUrl: 'https://baxdugexesrglfpxuess.supabase.co',
  anonKey: 'sb_publishable_6U3mjliIxh7zfUdlBYp0aA_joaBHdPd',
  // Cloudflare CDN Edge Proxy URL
  cloudflareProxyUrl: 'https://job-circular-proxy.rudrodeb029.workers.dev'
};

// Initialize Supabase client
// - 100% of ALL REST & Storage database queries route through Cloudflare Global Edge CDN proxy
// - Neither Candidate App nor Admin Panel EVER queries Supabase directly
export const supabase = createClient(
  SUPABASE_CONFIG.projectUrl,
  SUPABASE_CONFIG.anonKey,
  {
    global: {
      fetch: async (url, options = {}) => {
        const headers = new Headers(options.headers || {});
        headers.set('X-App-Client', 'live-circular-android');
        const updatedOptions = { ...options, headers };

        if (
          SUPABASE_CONFIG.cloudflareProxyUrl &&
          typeof url === 'string' &&
          url.startsWith(SUPABASE_CONFIG.projectUrl)
        ) {
          const proxiedUrl = url.replace(SUPABASE_CONFIG.projectUrl, SUPABASE_CONFIG.cloudflareProxyUrl);
          try {
            return await fetch(proxiedUrl, updatedOptions);
          } catch (e) {
            console.error('Cloudflare Proxy network error:', e.message);
            return fetch(proxiedUrl, updatedOptions);
          }
        }
        return fetch(url, updatedOptions);
      }
    },
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
