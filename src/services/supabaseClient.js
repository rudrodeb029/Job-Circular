import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
export const SUPABASE_CONFIG = {
  projectUrl: 'https://baxdugexesrglfpxuess.supabase.co',
  anonKey: 'sb_publishable_6U3mjliIxh7zfUdlBYp0aA_joaBHdPd',
  // Cloudflare CDN Edge Proxy URL
  cloudflareProxyUrl: 'https://job-circular-proxy.rudrodeb029.workers.dev'
};

// Initialize Supabase client
// - REST database queries route through Cloudflare Global Edge CDN proxy
// - Realtime WebSockets and Auth connect directly to Supabase
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
          url.startsWith(SUPABASE_CONFIG.projectUrl + '/rest/v1/')
        ) {
          const proxiedUrl = url.replace(SUPABASE_CONFIG.projectUrl, SUPABASE_CONFIG.cloudflareProxyUrl);
          try {
            const response = await fetch(proxiedUrl, updatedOptions);
            if (response.status >= 400) {
              console.warn('Cloudflare Proxy status:', response.status, 'falling back to direct Supabase URL');
              return fetch(url, updatedOptions);
            }
            return response;
          } catch (e) {
            console.error('Cloudflare Proxy unreachable, falling back to direct Supabase:', e.message);
            return fetch(url, updatedOptions);
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
