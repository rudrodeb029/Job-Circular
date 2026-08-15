/**
 * Cloudflare Worker: Supabase Edge Proxy with Cache-Bypass Key
 * 
 * Features:
 * 1. Global CDN caching for GET requests (5-minute TTL) across 100+ edge locations.
 * 2. Cache-Bypass Key: When 'Cache-Control: no-cache' or 'Pragma: no-cache' header is present
 *    (e.g., Pull-to-refresh or push notification click), skips edge cache and fetches 
 *    fresh live data directly from Supabase, updating edge cache with fresh response.
 * 3. Write requests (POST, PUT, PATCH, DELETE) bypass cache and forward directly to Supabase.
 * 4. Full CORS and auth header forwarding.
 */

const SUPABASE_ORIGIN = 'https://baxdugexesrglfpxuess.supabase.co';
const CACHE_TTL_SECONDS = 300; // 5 minutes

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = new URL(url.pathname + url.search, SUPABASE_ORIGIN);

    // Handle CORS Preflight
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

    // Check Edge Cache for standard GET requests
    if (!shouldBypassCache) {
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        const response = new Response(cachedResponse.body, cachedResponse);
        response.headers.set('X-Edge-Cache', 'HIT');
        response.headers.set('Access-Control-Allow-Origin', '*');
        return response;
      }
    }

    // Forward request to Supabase
    const headers = new Headers(request.headers);
    headers.set('Host', new URL(SUPABASE_ORIGIN).host);

    const originResponse = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'follow',
    });

    // Create modified response with CORS & Cache-Control headers
    const newHeaders = new Headers(originResponse.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('X-Edge-Cache', shouldBypassCache ? 'BYPASS' : 'MISS');

    if (request.method === 'GET' && originResponse.status === 200) {
      newHeaders.set('Cache-Control', `public, max-age=${CACHE_TTL_SECONDS}, s-maxage=${CACHE_TTL_SECONDS}`);
    }

    const responseToReturn = new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: newHeaders,
    });

    // Store in Edge Cache if it was a successful GET request
    if (request.method === 'GET' && originResponse.status === 200) {
      ctx.waitUntil(cache.put(cacheKey, responseToReturn.clone()));
    }

    return responseToReturn;
  },
};
