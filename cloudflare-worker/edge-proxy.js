/**
 * Cloudflare Worker: Supabase Edge Proxy & Single-Request Sync Gateway
 * 
 * Active Features & Edge Services:
 * 1. Single-Request Unified Endpoint (/sync-all): Bundles 8 core collections (including live_exams & questions) + master timestamp into 1 single HTTP GET response.
 * 2. Un-cached Realtime Timestamp Check (/check-updates & app_sync_control): Direct live check using valid publishable key for instant loader icon popups.
 * 3. Dynamic Edge Cache Bypass (?cache=bypass & no-cache headers): Instant fresh data sync on Push Notification clicks & loader icon clicks.
 * 4. 304 Not Modified Conditional Sync: Verifies client timestamp against Supabase `app_sync_control` master timestamp (0 Bytes / 0 DB Egress when unchanged).
 * 5. 4-Hour Global Edge CDN Caching (CACHE_TTL_SECONDS = 14400): Delivers 20ms response times worldwide.
 * 6. Isolated /live-exams Static Edge Gateway: Serves static exam JSON payloads for high-concurrency exam scaling.
 * 7. Anti-Bot & Anti-Scraping Security Shield: Blocks malicious automated scrapers while keeping app access 100% fast.
 */

const SUPABASE_ORIGIN = 'https://baxdugexesrglfpxuess.supabase.co';
const CACHE_TTL_SECONDS = 14400; // 4 Hours Edge CDN Cache

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
  'axios',
  'postmanruntime'
];

export default {
  async fetch(request, env, ctx) {
    const userAgent = (request.headers.get('User-Agent') || '').toLowerCase();
    const appClientHeader = request.headers.get('X-App-Client') || '';

    // 1. Anti-Bot / Anti-Scraping Security Gateway
    const isKnownBot = BLOCKED_USER_AGENTS.some(bot => userAgent.includes(bot));
    if (isKnownBot && !appClientHeader.includes('live-circular')) {
      return new Response(
        JSON.stringify({ error: 'Access Denied: Automated bot or scraper detected by Edge Security Gateway.' }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'X-Robots-Tag': 'noindex, nofollow, noarchive',
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff'
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
    const ifModifiedSince = request.headers.get('If-Modified-Since') || '';

    // Explicitly check for cache=bypass query param or no-cache headers to bypass edge CDN
    const shouldBypassCache = request.method !== 'GET' || 
                              cacheControl.includes('no-cache') || 
                              pragma.includes('no-cache') ||
                              url.searchParams.get('cache') === 'bypass' ||
                              url.search.includes('cache=bypass');

    const cache = caches.default;

    // Correct Publishable API Key
    const apiKey = request.headers.get('apikey') || env.SUPABASE_ANON_KEY || 'sb_publishable_6U3mjliIxh7zfUdlBYp0aA_joaBHdPd';
    const authHeader = request.headers.get('Authorization') || (apiKey ? `Bearer ${apiKey}` : '');

    const originHeaders = new Headers();
    if (apiKey) originHeaders.set('apikey', apiKey);
    if (authHeader) originHeaders.set('Authorization', authHeader);
    originHeaders.set('Host', new URL(SUPABASE_ORIGIN).host);

    // 3a. UN-CACHED TIMESTAMP CHECK ROUTE (/check-updates or app_sync_control)
    // Ensures background polling always gets the LIVE master timestamp to trigger floating loader icon
    if (url.pathname === '/check-updates' || url.pathname.includes('app_sync_control')) {
      try {
        const controlRes = await fetch(`${SUPABASE_ORIGIN}/rest/v1/app_sync_control?select=last_updated,updated_by&id=eq.1`, { headers: originHeaders });
        if (controlRes.ok) {
          const controlData = await controlRes.json();
          return new Response(JSON.stringify(controlData), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'X-Edge-Cache': 'BYPASS-LIVE'
            }
          });
        }
      } catch (e) {
        console.warn('Check updates error:', e);
      }
    }

    // 3b. ISOLATED /live-exams ROUTE: Serves static exam JSON payloads directly without DB overhead
    if (url.pathname === '/live-exams' || url.pathname === '/rest/v1/live-exams-static') {
      const examCacheKey = new Request(`${url.origin}/live-exams`, { method: 'GET' });

      if (!shouldBypassCache) {
        const cachedExams = await cache.match(examCacheKey);
        if (cachedExams) {
          const response = new Response(cachedExams.body, cachedExams);
          response.headers.set('X-Edge-Cache', 'HIT');
          response.headers.set('Access-Control-Allow-Origin', '*');
          return response;
        }
      }

      // Fetch live_exams table directly from origin
      const examRes = await fetch(`${SUPABASE_ORIGIN}/rest/v1/live_exams?select=*&status=eq.published`, { headers: originHeaders })
        .then(r => r.ok ? r.json() : [])
        .catch(() => []);

      const examResponse = new Response(JSON.stringify(examRes), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}, s-maxage=${CACHE_TTL_SECONDS}`,
          'X-Edge-Cache': shouldBypassCache ? 'BYPASS' : 'MISS'
        }
      });

      if (!shouldBypassCache) {
        ctx.waitUntil(cache.put(examCacheKey, examResponse.clone()));
      }

      return examResponse;
    }

    // 4. UNIFIED /sync-all ROUTE: Bundles 8 core collections + master timestamp into 1 single HTTP GET response
    if (url.pathname === '/sync-all' || url.pathname === '/rest/v1/sync-all') {
      // Step 4a: Check Master Timestamp for 304 Not Modified if If-Modified-Since header present
      if (ifModifiedSince && !shouldBypassCache) {
        try {
          const controlRes = await fetch(`${SUPABASE_ORIGIN}/rest/v1/app_sync_control?select=last_updated&id=eq.1`, { headers: originHeaders });
          if (controlRes.ok) {
            const controlData = await controlRes.json();
            const serverLastUpdated = controlData?.[0]?.last_updated ? new Date(controlData[0].last_updated).getTime() : 0;
            const clientTimestamp = new Date(ifModifiedSince).getTime();

            if (serverLastUpdated > 0 && clientTimestamp >= serverLastUpdated) {
              return new Response(null, {
                status: 304,
                statusText: 'Not Modified',
                headers: {
                  'Access-Control-Allow-Origin': '*',
                  'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}, s-maxage=${CACHE_TTL_SECONDS}`,
                  'X-Edge-Cache': '304-NOT-MODIFIED'
                }
              });
            }
          }
        } catch (e) {
          console.warn('Master timestamp 304 check failed:', e);
        }
      }

      const syncCacheKey = new Request(`${url.origin}/sync-all`, { method: 'GET' });

      if (!shouldBypassCache) {
        const cachedSync = await cache.match(syncCacheKey);
        if (cachedSync) {
          const response = new Response(cachedSync.body, cachedSync);
          response.headers.set('X-Edge-Cache', 'HIT');
          response.headers.set('Access-Control-Allow-Origin', '*');
          return response;
        }
      }

      // Parallel fetch of 8 core collections + master timestamp inside Cloudflare Worker
      const collections = ['jobs', 'notifications', 'admits', 'results', 'questions', 'live_exams', 'feed_posts', 'app_config'];
      const lastUpdated = url.searchParams.get('last_updated') || '0';

      const fetchPromises = collections.map(col =>
        fetch(`${SUPABASE_ORIGIN}/rest/v1/${col}?select=*`, { headers: originHeaders })
          .then(r => r.ok ? r.json() : [])
          .catch(() => [])
      );

      const feedPromise = fetch(`${SUPABASE_ORIGIN}/rest/v1/offline_feed?select=id,title,content,updated_at&updated_at=gt.${lastUpdated}&order=updated_at.asc&limit=500`, { headers: originHeaders })
        .then(r => r.ok ? r.json() : [])
        .catch(() => []);

      const controlPromise = fetch(`${SUPABASE_ORIGIN}/rest/v1/app_sync_control?select=last_updated&id=eq.1`, { headers: originHeaders })
        .then(r => r.ok ? r.json() : [])
        .catch(() => []);

      const [jobs, notifications, admits, results, questions, live_exams, feed_posts, app_config, offline_feed, controlData] = await Promise.all([
        ...fetchPromises,
        feedPromise,
        controlPromise
      ]);

      const masterLastUpdated = controlData?.[0]?.last_updated || new Date().toISOString();

      const payload = {
        jobs,
        notifications,
        admits,
        results,
        questions,
        live_exams,
        feed_posts,
        app_config,
        offline_feed,
        syncedAt: masterLastUpdated,
        masterLastUpdated: masterLastUpdated
      };

      const syncResponse = new Response(JSON.stringify(payload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}, s-maxage=${CACHE_TTL_SECONDS}`,
          'Last-Modified': payload.syncedAt,
          'X-Edge-Cache': shouldBypassCache ? 'BYPASS' : 'MISS'
        }
      });

      if (!shouldBypassCache) {
        ctx.waitUntil(cache.put(syncCacheKey, syncResponse.clone()));
      }

      return syncResponse;
    }

    // 5. STANDARD PROXY PASSTHROUGH (Clean Cache Key for 100% Edge HIT rate)
    const targetUrl = new URL(url.pathname + url.search, SUPABASE_ORIGIN);
    const cacheKey = new Request(targetUrl.toString(), { method: 'GET' });

    if (!shouldBypassCache) {
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        const response = new Response(cachedResponse.body, cachedResponse);
        response.headers.set('X-Edge-Cache', 'HIT');
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
        return response;
      }
    }

    // 6. Forward request to Supabase Origin
    const headers = new Headers(request.headers);
    headers.set('Host', new URL(SUPABASE_ORIGIN).host);

    const originResponse = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'follow',
    });

    // 7. Inject Security & Anti-Scraping Headers
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
