/**
 * Cloudflare Worker: Ultimate Edge Shield — Cron + KV Architecture
 *
 * Rules:
 * 7. Anti-Bot Security Shield
 * 8. Strict GET Cache Lock (no bypass for GET)
 * 9. /check-updates -> KV (0 Supabase)
 * 10. /sync-all -> KV (0 Supabase)
 * 11. 1-Hour Cron Incremental Sync (scheduled)
 * 12. Leaderboard -> KV (0 Supabase)
 * 13. Live Exam -> Cloudflare Queue (burst-safe)
 */

const SUPABASE_ORIGIN = 'https://baxdugexesrglfpxuess.supabase.co';

const BLOCKED_USER_AGENTS = [
  'python-requests', 'python-urllib', 'curl/', 'wget/', 'scrapy',
  'libwww-perl', 'go-http-client', 'java/', 'httpx', 'aiohttp',
  'axios', 'postmanruntime'
];

const CORE_COLLECTIONS = [
  'jobs', 'notifications', 'admits', 
  'questions', 'live_exams', 'feed_posts', 'app_config'
];

export default {

  // ══════════════════════════════════════
  // FETCH HANDLER
  // ══════════════════════════════════════
  async fetch(request, env, ctx) {
    const userAgent = (request.headers.get('User-Agent') || '').toLowerCase();
    const appClientHeader = request.headers.get('X-App-Client') || '';

    // Rule 7: Anti-Bot
    const isKnownBot = BLOCKED_USER_AGENTS.some(bot => userAgent.includes(bot));
    if (isKnownBot && !appClientHeader.includes('live-circular')) {
      return new Response(
        JSON.stringify({ error: 'Access Denied: Automated bot detected.' }),
        { status: 403, headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'X-Frame-Options': 'DENY', 'X-Content-Type-Options': 'nosniff' } }
      );
    }

    const url = new URL(request.url);

    // CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS', 'Access-Control-Allow-Headers': '*', 'Access-Control-Max-Age': '86400' },
      });
    }

    // Rule 8: Strict GET Cache Lock — only writes bypass
    const shouldBypassCache = request.method !== 'GET';

    const apiKey = request.headers.get('apikey') || env.SUPABASE_ANON_KEY || 'sb_publishable_6U3mjliIxh7zfUdlBYp0aA_joaBHdPd';
    const authHeader = request.headers.get('Authorization') || (apiKey ? `Bearer ${apiKey}` : '');
    const ifModifiedSince = request.headers.get('If-Modified-Since') || '';

    const originHeaders = new Headers();
    if (apiKey) originHeaders.set('apikey', apiKey);
    if (authHeader) originHeaders.set('Authorization', authHeader);
    originHeaders.set('Host', new URL(SUPABASE_ORIGIN).host);

    // Rule 14: /webhook-sync -> Catch Supabase database webhooks and update CACHE_KV immediately
    if (url.pathname === '/webhook-sync' && request.method === 'POST') {
      const webhookAuth = request.headers.get('Authorization');
      const expectedSecret = env.WEBHOOK_SECRET || 'sync-all-data-secret-2026';
      if (webhookAuth !== `Bearer ${expectedSecret}`) {
        return new Response('Unauthorized', { status: 401 });
      }

      try {
        const payload = await request.json();
        const { type, table, record, old_record } = payload;
        if (!type || !table) {
          return new Response('Invalid Payload', { status: 400 });
        }

        const validCollections = ['jobs', 'notifications', 'admits', 'questions', 'feed_posts', 'app_config', 'live_exams'];
        if (!validCollections.includes(table)) {
          return new Response(`Skipping unsupported collection: ${table}`, { status: 200 });
        }

        const kvData = await env.CACHE_KV?.get('sync_all_data', 'json').catch(() => null) || {};
        let list = kvData[table] || [];

        if (type === 'DELETE') {
          const deleteId = old_record?.id || record?.id;
          list = list.filter(item => item.id !== deleteId);
        } else {
          // INSERT or UPDATE
          list = [
            record,
            ...list.filter(item => item.id !== record.id)
          ];
        }

        kvData[table] = list;
        const newTimestamp = new Date().toISOString();
        kvData.masterLastUpdated = newTimestamp;

        await Promise.all([
          env.CACHE_KV?.put('sync_all_data', JSON.stringify(kvData)),
          env.CACHE_KV?.put('last_sync_timestamp', newTimestamp),
          env.CACHE_KV?.put('last_updated_by', 'supabase-webhook')
        ]);

        console.log(`🔔 Webhook: Successfully synced ${type} on table "${table}" to Cloudflare KV.`);
        return new Response(JSON.stringify({ success: true, table, type, timestamp: newTimestamp }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err) {
        console.error('Webhook sync failed:', err);
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // Rule 9: /check-updates -> KV (0 Supabase!)
    if (url.pathname === '/check-updates' || url.pathname.includes('app_sync_control')) {
      const kvTs = await env.CACHE_KV?.get('last_sync_timestamp').catch(() => null);
      const kvBy = await env.CACHE_KV?.get('last_updated_by').catch(() => null);
      if (kvTs) {
        return new Response(
          JSON.stringify([{ last_updated: kvTs, updated_by: kvBy || 'system' }]),
          { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-cache, no-store, must-revalidate', 'X-Edge-Cache': 'KV-HIT', 'X-Supabase-Queries': '0' } }
        );
      }
      // KV empty — Supabase fallback (first boot only)
      try {
        const controlRes = await fetch(`${SUPABASE_ORIGIN}/rest/v1/app_sync_control?select=last_updated,updated_by&id=eq.1`, { headers: originHeaders });
        if (controlRes.ok) {
          const data = await controlRes.json();
          if (data?.[0]?.last_updated) {
            ctx.waitUntil(Promise.all([
              env.CACHE_KV?.put('last_sync_timestamp', data[0].last_updated),
              env.CACHE_KV?.put('last_updated_by', data[0].updated_by || 'system')
            ]));
          }
          return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-cache, no-store', 'X-Edge-Cache': 'KV-MISS-SUPABASE-FALLBACK' } });
        }
      } catch (e) { console.warn('check-updates fallback:', e); }
    }

    // Rule 10: /sync-all -> KV (0 Supabase!)
    if (url.pathname === '/sync-all' || url.pathname === '/rest/v1/sync-all') {
      // 304 check
      if (ifModifiedSince) {
        const kvTs = await env.CACHE_KV?.get('last_sync_timestamp').catch(() => null);
        if (kvTs) {
          const serverTime = new Date(kvTs).getTime();
          const clientTime = new Date(ifModifiedSince).getTime();
          if (serverTime > 0 && clientTime >= serverTime) {
            return new Response(null, { status: 304, headers: { 'Access-Control-Allow-Origin': '*', 'X-Edge-Cache': '304-NOT-MODIFIED' } });
          }
        }
      }
      const kvData = await env.CACHE_KV?.get('sync_all_data', 'json').catch(() => null);
      if (kvData) {
        return new Response(JSON.stringify(kvData), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Last-Modified': kvData.masterLastUpdated || new Date().toISOString(), 'X-Edge-Cache': 'KV-HIT', 'X-Supabase-Queries': '0' } });
      }
      // KV empty — bootstrap from Supabase (first boot only)
      const fetchAll = CORE_COLLECTIONS.map(col => {
        const q = col === 'questions'
          ? `${SUPABASE_ORIGIN}/rest/v1/questions?select=*&order=createdAt.desc&limit=1000`
          : `${SUPABASE_ORIGIN}/rest/v1/${col}?select=*`;
        return fetch(q, { headers: originHeaders }).then(r => r.ok ? r.json() : []).catch(() => []);
      });
      const controlFetch = fetch(`${SUPABASE_ORIGIN}/rest/v1/app_sync_control?select=last_updated&id=eq.1`, { headers: originHeaders })
        .then(r => r.ok ? r.json() : []).catch(() => []);
      const results = await Promise.all([...fetchAll, controlFetch]);
      const controlData = results[results.length - 1];
      const masterLastUpdated = controlData?.[0]?.last_updated || new Date().toISOString();
      const payload = {};
      CORE_COLLECTIONS.forEach((col, i) => { payload[col] = results[i]; });
      payload.masterLastUpdated = masterLastUpdated;
      payload.syncedAt = masterLastUpdated;
      ctx.waitUntil(Promise.all([
        env.CACHE_KV?.put('sync_all_data', JSON.stringify(payload)),
        env.CACHE_KV?.put('last_sync_timestamp', masterLastUpdated)
      ]));
      return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Last-Modified': masterLastUpdated, 'X-Edge-Cache': 'KV-MISS-SUPABASE-BOOTSTRAP' } });
    }

    // Rule 12: Leaderboard -> KV (0 Supabase!)
    if (url.pathname === '/leaderboard' || 
       (url.pathname.includes('user_exam_submissions') && request.method === 'GET') ||
       (url.pathname.includes('activities') && url.search.includes('type=eq.live_exam_submission') && request.method === 'GET')
    ) {
      let examId = url.searchParams.get('exam_id') || 'global';
      if (url.search.includes('examId=eq.')) {
        const match = url.search.match(/examId=eq\.([a-zA-Z0-9_-]+)/);
        examId = match ? match[1] : 'global';
      }
      
      const kvKey = `leaderboard_${examId}`;
      const cachedBoard = await env.CACHE_KV?.get(kvKey, 'json').catch(() => null);
      if (cachedBoard) {
        return new Response(JSON.stringify(cachedBoard), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=60', 'X-Edge-Cache': 'KV-HIT', 'X-Supabase-Queries': '0' } });
      }
      
      const lbTarget = examId !== 'global'
        ? `${SUPABASE_ORIGIN}/rest/v1/activities?select=*&type=eq.live_exam_submission&examId=eq.${examId}&order=score.desc,timeTakenSec.asc&limit=100`
        : `${SUPABASE_ORIGIN}/rest/v1/activities?select=*&type=eq.live_exam_submission&order=score.desc,timeTakenSec.asc&limit=100`;
        
      const lbData = await fetch(lbTarget, { headers: originHeaders }).then(r => r.ok ? r.json() : []).catch(() => []);
      ctx.waitUntil(env.CACHE_KV?.put(kvKey, JSON.stringify(lbData), { expirationTtl: 3600 }));
      return new Response(JSON.stringify(lbData), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'X-Edge-Cache': 'KV-MISS-SUPABASE-FALLBACK' } });
    }

    // Rule 13: Live Exam -> Cloudflare Queue (burst-safe!)
    if (url.pathname === '/live-exam-submit' ||
       ((url.pathname.includes('user_exam_submissions') || url.pathname.includes('activities')) &&
        (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH'))) {
      try {
        const body = await request.json().catch(() => null);
        if (!body) return new Response('Invalid payload', { status: 400 });
        if (env.EXAM_QUEUE) {
          await env.EXAM_QUEUE.send({ ...body, receivedAt: new Date().toISOString() });
          return new Response(JSON.stringify({ success: true, queued: true }), { status: 202, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }
        const submitRes = await fetch(`${SUPABASE_ORIGIN}/rest/v1/activities`, {
          method: request.method, headers: originHeaders, body: JSON.stringify(body)
        });
        const nh = new Headers(submitRes.headers);
        nh.set('Access-Control-Allow-Origin', '*');
        return new Response(submitRes.body, { status: submitRes.status, headers: nh });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Submission failed', details: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      }
    }

    // STRICT GET CACHE LOCK: Block any unhandled direct GET request to Supabase to prevent Supabase spam!
    if (request.method === 'GET') {
      return new Response(JSON.stringify({ 
        error: 'Strict GET Cache Lock: Direct GET queries to Supabase are blocked. Please use /sync-all endpoint.',
        url: url.pathname + url.search
      }), { status: 403, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    // Standard REST Proxy Passthrough (write methods and Admin GET bypass reach here)
    const targetUrl = new URL(url.pathname + url.search, SUPABASE_ORIGIN);
    const headers = new Headers(request.headers);
    headers.set('Host', new URL(SUPABASE_ORIGIN).host);
    const originResponse = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'follow',
    });
    const newHeaders = new Headers(originResponse.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('X-Edge-Cache', 'BYPASS');
    newHeaders.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('X-Frame-Options', 'DENY');
    return new Response(originResponse.body, { status: originResponse.status, statusText: originResponse.statusText, headers: newHeaders });
  },

  // ══════════════════════════════════════
  // QUEUE HANDLER — Live Exam batch writer (Rule 13)
  // ══════════════════════════════════════
  async queue(batch, env) {
    const apiKey = env.SUPABASE_ANON_KEY || 'sb_publishable_6U3mjliIxh7zfUdlBYp0aA_joaBHdPd';
    const headers = new Headers({
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    });
    for (const message of batch.messages) {
      try {
        await fetch(`${SUPABASE_ORIGIN}/rest/v1/activities`, {
          method: 'POST', headers, body: JSON.stringify(message.body)
        });
        message.ack();
      } catch (e) { message.retry(); }
    }
  },

  // ══════════════════════════════════════
  // SCHEDULED HANDLER — 1-Hour Incremental Cron (Rule 11)
  // ══════════════════════════════════════
  async scheduled(event, env, ctx) {
    const apiKey = env.SUPABASE_ANON_KEY || 'sb_publishable_6U3mjliIxh7zfUdlBYp0aA_joaBHdPd';
    const h = new Headers({ 'apikey': apiKey, 'Authorization': `Bearer ${apiKey}` });

    // Step 1: Supabase timestamp চেক
    const controlRes = await fetch(
      `${SUPABASE_ORIGIN}/rest/v1/app_sync_control?select=last_updated,updated_by&id=eq.1`,
      { headers: h }
    ).catch(() => null);
    if (!controlRes?.ok) return;
    const [row] = await controlRes.json().catch(() => []);
    if (!row?.last_updated) return;

    // Step 2: KV timestamp তুলনা
    const cachedTs = await env.CACHE_KV?.get('last_sync_timestamp').catch(() => null);
    if (cachedTs === row.last_updated) {
      console.log('Cron: No change. KV fresh. 0 extra queries.');
      return;
    }

    // Step 3: Incremental sync — only new/changed rows
    const sinceTs = cachedTs || '1970-01-01T00:00:00Z';
    const existingData = await env.CACHE_KV?.get('sync_all_data', 'json').catch(() => null) || {};
    console.log(`Cron: Incremental sync since ${sinceTs}`);

    for (const col of CORE_COLLECTIONS) {
      const queryUrl = (col === 'questions' || col === 'notifications' || col === 'admits')
        ? `${SUPABASE_ORIGIN}/rest/v1/${col}?select=*&createdAt=gt.${sinceTs}&order=createdAt.desc&limit=1000`
        : `${SUPABASE_ORIGIN}/rest/v1/${col}?select=*&updatedAt=gt.${sinceTs}&order=updatedAt.desc`;

      const newRows = await fetch(queryUrl, { headers: h })
        .then(r => r.ok ? r.json() : []).catch(() => []);

      if (newRows.length === 0) { console.log(`Skip ${col}: no changes`); continue; }

      const existing = existingData[col] || [];
      const newIds = new Set(newRows.map(r => r.id));
      existingData[col] = [...newRows, ...existing.filter(r => !newIds.has(r.id))];
      console.log(`${col}: ${newRows.length} rows merged`);
    }

    existingData.masterLastUpdated = row.last_updated;
    existingData.syncedAt = row.last_updated;

    // Step 4: KV-তে সেভ করো
    await Promise.all([
      env.CACHE_KV?.put('sync_all_data', JSON.stringify(existingData)),
      env.CACHE_KV?.put('last_sync_timestamp', row.last_updated),
      env.CACHE_KV?.put('last_updated_by', row.updated_by || 'system')
    ]).catch(e => console.error('KV put error:', e));

    // Step 5: Leaderboard KV আপডেট
    const lbData = await fetch(
      `${SUPABASE_ORIGIN}/rest/v1/activities?select=*&type=eq.live_exam_submission&order=score.desc,timeTakenSec.asc&limit=100`,
      { headers: h }
    ).then(r => r.ok ? r.json() : []).catch(() => []);
    await env.CACHE_KV?.put('leaderboard_global', JSON.stringify(lbData), { expirationTtl: 3600 }).catch(() => {});

    console.log('Cron: Incremental sync complete!');
  },
};
