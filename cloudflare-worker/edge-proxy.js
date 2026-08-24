/**
 * Cloudflare Worker: Supabase Edge Proxy & Anti-Scraping Gateway
 * 
 * Features & Security Locks:
 * 1. Bot & Scraper Blocking: Rejects automated scraper User-Agents (python-requests, cURL, Scrapy, Wget, etc.).
 * 2. Edge CDN Caching: 5-minute global edge caching for GET requests across 100+ locations.
 * 3. Cache-Bypass Key: Supports 'Cache-Control: no-cache' header for instant pull-to-refresh updates.
 * 4. Anti-Scraping Security Headers: Injects X-Robots-Tag, X-Content-Type-Options, and Frame restrictions.
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
    const targetUrl = new URL(url.pathname + url.search, SUPABASE_ORIGIN);

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
    const cacheKey = new Request(targetUrl.toString(), {
      method: 'GET',
      headers: request.headers,
    });

    // 3. Check Edge Cache for standard GET requests
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

    // 4. Forward request to Supabase Origin
    const headers = new Headers(request.headers);
    headers.set('Host', new URL(SUPABASE_ORIGIN).host);

    const originResponse = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'follow',
    });

    // 5. Inject Security & Anti-Scraping Headers
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

    // 6. Store in Edge Cache if successful GET
    if (request.method === 'GET' && originResponse.status === 200) {
      ctx.waitUntil(cache.put(cacheKey, responseToReturn.clone()));
    }

    return responseToReturn;
  },
};
