# Cloudflare Worker Edge Proxy for Supabase

This Worker acts as an intelligent Global Edge CDN proxy in front of Supabase:

- **Edge Caching**: GET requests are cached worldwide for 5 minutes across Cloudflare's edge data centers (100+ cities).
- **Cache-Bypass Key**: When requests include `Cache-Control: no-cache` (e.g. from Pull-to-refresh or push notification clicks), Cloudflare bypasses the cache and fetches live data directly from Supabase, updating its edge cache automatically.
- **Writes & Auth**: All `POST`, `PATCH`, `DELETE` operations and headers pass directly to Supabase without caching.

---

### How to Deploy (Free Tier - 100k requests/day):

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create Application** > **Create Worker**.
2. Name your worker (e.g., `job-circular-edge-proxy`).
3. Click **Deploy**.
4. Click **Edit code**, paste the contents of `edge-proxy.js`, and click **Deploy**.
5. Copy your Worker URL (e.g., `https://job-circular-edge-proxy.<your-subdomain>.workers.dev`).
6. Paste this URL into `src/services/supabaseClient.js` under `cloudflareProxyUrl`:
   ```js
   export const SUPABASE_CONFIG = {
     projectUrl: 'https://baxdugexesrglfpxuess.supabase.co',
     anonKey: 'sb_publishable_6U3mjliIxh7zfUdlBYp0aA_joaBHdPd',
     cloudflareProxyUrl: 'https://job-circular-edge-proxy.<your-subdomain>.workers.dev'
   };
   ```
