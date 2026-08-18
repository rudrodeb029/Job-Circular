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
        if (
          SUPABASE_CONFIG.cloudflareProxyUrl &&
          typeof url === 'string' &&
          url.startsWith(SUPABASE_CONFIG.projectUrl + '/rest/v1/')
        ) {
          const proxiedUrl = url.replace(SUPABASE_CONFIG.projectUrl, SUPABASE_CONFIG.cloudflareProxyUrl);
          try {
            const response = await fetch(proxiedUrl, options);
            // If the worker returns a server error (5xx), fallback to direct Supabase
            if (response.status >= 500) {
              console.warn('Cloudflare Worker error, falling back to direct Supabase');
              return fetch(url, options);
            }
            return response;
          } catch (e) {
            console.error('Cloudflare Worker unreachable, falling back to direct Supabase:', e.message);
            return fetch(url, options);
          }
        }
        return fetch(url, options);
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
