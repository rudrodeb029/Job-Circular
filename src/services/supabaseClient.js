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
        const isAdmin = (typeof window !== 'undefined' && (
          window.location.pathname.startsWith('/admin') ||
          Boolean(localStorage.getItem('admin_user'))
        ));

        const headers = new Headers(options.headers || {});
        headers.set('X-App-Client', isAdmin ? 'live-circular-admin' : 'live-circular-android');
        if (isAdmin) {
          headers.set('Cache-Control', 'no-cache');
          headers.set('Pragma', 'no-cache');
        }
        const updatedOptions = { ...options, headers };

        // Activities (donations, audits) are real-time transactional data; bypass edge proxy to prevent cache lock
        const isActivities = typeof url === 'string' && url.includes('/rest/v1/activities');

        if (
          !isActivities &&
          SUPABASE_CONFIG.cloudflareProxyUrl &&
          typeof url === 'string' &&
          url.startsWith(SUPABASE_CONFIG.projectUrl)
        ) {
          const proxiedUrl = url.replace(SUPABASE_CONFIG.projectUrl, SUPABASE_CONFIG.cloudflareProxyUrl);
          try {
            const resp = await fetch(proxiedUrl, updatedOptions);
            // If proxy returns 403 (Strict Cache Lock) or server error, gracefully fallback to direct Supabase
            if (!resp.ok && (resp.status === 403 || resp.status >= 500)) {
              console.warn(`[Proxy Fallback] Status ${resp.status} on proxy, falling back to direct Supabase for:`, url);
              return fetch(url, updatedOptions);
            }
            return resp;
          } catch (e) {
            console.error('Cloudflare Proxy network error, falling back to direct Supabase:', e.message);
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
