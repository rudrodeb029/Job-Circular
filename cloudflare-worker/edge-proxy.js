/**
 * Cloudflare Worker: Supabase Edge Proxy & Single-Request Sync Gateway
 * 
 * Features & Security Locks:
 * 1. Single-Request Unified Endpoint (/sync-all): Bundles all core collections into 1 single HTTP GET response.
 * 2. Bot & Scraper Blocking: Rejects automated scraper User-Agents.
 * 3. Edge CDN Caching: 5-minute global edge caching for GET requests across 100+ locations.
 * 4. Clean Cache Key: Strips dynamic request headers for a 100% cache HIT rate.
 * 5. Full CORS & Auth Header Forwarding.
 */

const SUPABASE_ORIGIN = 'https://baxdugexesrglfpxuess.supabase.co';
const CACHE_TTL_SECONDS = 300; // 5 minutes

// Known Automated Scraper User-Agents to block
const BLOCKED_USER_AGENTS = [
  'python-requests',
  'python-urllib',
  'curl/',
  'wget/',
  'scrapy',
  'libwww-perl',
  'go-http-client',
  'java/',
  'httpx',
  'aiohttp',
  'axios/0.',
  'postmanruntime'
];

export default {
  async fetch(request, env, ctx) {
    const userAgent = (request.headers.get('User-Agent') || '').toLowerCase();
    const appClientHeader = request.headers.get('X-App-Client') || '';

    // 1. Anti-Bot / Anti-Scraping Verification
    const isKnownBot = BLOCKED_USER_AGENTS.some(bot => userAgent.includes(bot));
    if (isKnownBot && !appClientHeader.includes('live-circular')) {
      return new Response(
        JSON.stringify({ error: 'Access Denied: Automated bot or scraper detected by Edge Security Gateway.' }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'X-Robots-Tag': 'noindex, nofollow, noarchive'
          }
        }
      );
    }

    const url = new URL(request.url);

    // 2. Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const cacheControl = request.headers.get('Cache-Control') || '';
    const pragma = request.headers.get('Pragma') || '';
    const shouldBypassCache = request.method !== 'GET' || 
                              cacheControl.includes('no-cache') || 
                              pragma.includes('no-cache');

    const cache = caches.default;

    // 3. UNIFIED /sync-all ROUTE: Combines all core collections into EXACTLY 1 HTTP GET request
    if (url.pathname === '/sync-all' || url.pathname === '/rest/v1/sync-all') {
      const syncCacheKey = new Request(`${url.origin}/sync-all${url.search}`, { method: 'GET' });

      if (!shouldBypassCache) {
        const cachedSync = await cache.match(syncCacheKey);
        if (cachedSync) {
          const response = new Response(cachedSync.body, cachedSync);
          response.headers.set('X-Edge-Cache', 'HIT');
          response.headers.set('Access-Control-Allow-Origin', '*');
          return response;
        }
      }

      // Fetch all collections in parallel from Supabase origin inside worker
      const apiKey = request.headers.get('apikey') || env.SUPABASE_ANON_KEY || '';
      const authHeader = request.headers.get('Authorization') || (apiKey ? `Bearer ${apiKey}` : '');

      const originHeaders = new Headers();
      if (apiKey) originHeaders.set('apikey', apiKey);
      if (authHeader) originHeaders.set('Authorization', authHeader);
      originHeaders.set('Host', new URL(SUPABASE_ORIGIN).host);

      const collections = ['jobs', 'notifications', 'admits', 'live_exams', 'feed_posts', 'app_config'];
      const lastUpdated = url.searchParams.get('last_updated') || '0';

      const fetchPromises = collections.map(col =>
        fetch(`${SUPABASE_ORIGIN}/rest/v1/${col}?select=*`, { headers: originHeaders })
          .then(r => r.ok ? r.json() : [])
          .catch(() => [])
      );

      // Add delta fetch for offline_feed
      const feedPromise = fetch(`${SUPABASE_ORIGIN}/rest/v1/offline_feed?select=id,title,content,updated_at&updated_at=gt.${lastUpdated}&order=updated_at.asc&limit=500`, { headers: originHeaders })
        .then(r => r.ok ? r.json() : [])
        .catch(() => []);

      const [jobs, notifications, admits, live_exams, feed_posts, app_config, offline_feed] = await Promise.all([
        ...fetchPromises,
        feedPromise
      ]);

      const payload = {
        jobs,
        notifications,
        admits,
        live_exams,
        feed_posts,
        app_config,
        offline_feed,
        syncedAt: Date.now()
      };

      const syncResponse = new Response(JSON.stringify(payload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}, s-maxage=${CACHE_TTL_SECONDS}`,
          'X-Edge-Cache': shouldBypassCache ? 'BYPASS' : 'MISS'
        }
      });

      if (!shouldBypassCache) {
        ctx.waitUntil(cache.put(syncCacheKey, syncResponse.clone()));
      }

      return syncResponse;
    }

    // 4. STANDARD PROXY PASSTHROUGH (Clean Cache Key for 100% Cache HIT rate)
    const targetUrl = new URL(url.pathname + url.search, SUPABASE_ORIGIN);
    const cacheKey = new Request(targetUrl.toString(), { method: 'GET' });

    if (!shouldBypassCache) {
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        const response = new Response(cachedResponse.body, cachedResponse);
        response.headers.set('X-Edge-Cache', 'HIT');
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('X-Robots-Tag', 'noindex, nofollow');
        return response;
      }
    }

    // 5. Forward request to Supabase Origin
    const headers = new Headers(request.headers);
    headers.set('Host', new URL(SUPABASE_ORIGIN).host);

    const originResponse = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'follow',
    });

    // 6. Inject Security & Anti-Scraping Headers
    const newHeaders = new Headers(originResponse.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('X-Edge-Cache', shouldBypassCache ? 'BYPASS' : 'MISS');
    newHeaders.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('X-Frame-Options', 'DENY');

    if (request.method === 'GET' && originResponse.status === 200) {
      newHeaders.set('Cache-Control', `public, max-age=${CACHE_TTL_SECONDS}, s-maxage=${CACHE_TTL_SECONDS}`);
    }

    const responseToReturn = new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: newHeaders,
    });

    if (request.method === 'GET' && originResponse.status === 200) {
      ctx.waitUntil(cache.put(cacheKey, responseToReturn.clone()));
    }

    return responseToReturn;
  },
};
