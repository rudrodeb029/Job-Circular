/**
 * Cloudflare Worker: Ultimate Edge Shield — D1 + KV + Smart Batch Architecture
 *
 * Rules:
 * 7. Anti-Bot Security Shield
 * 8. Strict GET Cache Lock (no bypass for GET)
 * 9. /check-updates -> KV (0 Supabase)
 * 10. /sync-all -> KV (0 Supabase), Answer Key stripped from live_exams
 * 11. Smart Batch Cron (D1 -> Supabase, 500 per batch, 1s delay)
 * 12. Leaderboard -> D1/KV (0 Supabase)
 * 13. /exam-submit -> Server-side grading + D1 (0 Supabase)
 * 14. /webhook-sync -> KV instant update + Answer Key separation
 */

const SUPABASE_ORIGIN = 'https://baxdugexesrglfpxuess.supabase.co';

const BLOCKED_USER_AGENTS = [
  'python-requests', 'python-urllib', 'curl/', 'wget/', 'scrapy',
  'libwww-perl', 'go-http-client', 'java/', 'httpx', 'aiohttp',
  'axios', 'postmanruntime'
];

const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_6U3mjliIxh7zfUdlBYp0aA_joaBHdPd';

const CORE_COLLECTIONS = [
  'jobs', 'notifications', 'admits',
  'questions', 'live_exams', 'feed_posts', 'app_config',
  'offline_feed'
];

// Collections that track both createdAt and updatedAt columns in PostgreSQL
const DUAL_TS_COLLECTIONS = new Set(['questions', 'jobs', 'live_exams', 'feed_posts']);
const CREATED_ONLY_COLLECTIONS = new Set(['notifications', 'admits']);
const UPDATED_ONLY_COLLECTIONS = new Set(['app_config']);

// Cloudflare KV hard limit is 25 MiB per key; stay safely under it
const KV_MAX_SAFE_BYTES = 24 * 1024 * 1024;
const KV_CHUNK_TARGET_BYTES = 16 * 1024 * 1024;
const CRON_LOOKBACK_MS = 15 * 60 * 1000;

function getUtf8ByteLength(str) {
  return new TextEncoder().encode(str).length;
}

function getSupabaseServiceHeaders(env) {
  const apiKey = env?.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  return new Headers({
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store',
    'Pragma': 'no-cache'
  });
}

// Helper: সময় ফরম্যাট (সেকেন্ড → "Xm Ys")
function formatTime(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// Helper: live_exams questions থেকে correctIndex ও explanation বাদ দেওয়া
function stripAnswerKeys(exams) {
  if (!Array.isArray(exams)) return exams;
  return exams.map(exam => {
    if (!exam?.questions?.length) return exam;
    return {
      ...exam,
      questions: exam.questions.map(q => {
        const { correctIndex, explanation, ...safeQ } = q;
        return safeQ;
      })
    };
  });
}

// Helper: Safe KV Put wrapper (enforces 25 MiB limit and prevents quota errors from breaking requests)
async function safeKvPut(kv, key, val, options) {
  try {
    if (!kv) return { ok: false, reason: 'no_kv' };
    if (typeof val === 'string' && getUtf8ByteLength(val) > KV_MAX_SAFE_BYTES) {
      console.warn(`[KV-Safe] Value for ${key} exceeds safe byte limit (${getUtf8ByteLength(val)} bytes)`);
      return { ok: false, reason: 'size_limit' };
    }
    await kv.put(key, val, options);
    return { ok: true };
  } catch (err) {
    console.warn(`[KV-Safe] Put skipped for ${key}:`, err?.message || err);
    return { ok: false, reason: 'kv_error', error: err?.message || String(err) };
  }
}

async function safeKvDelete(kv, key) {
  try {
    if (!kv) return false;
    await kv.delete(key);
    return true;
  } catch (err) {
    console.warn(`[KV-Safe] Delete failed for ${key}:`, err?.message || err);
    return false;
  }
}

// Deterministic ordering per table so pagination never skips or duplicates rows
function getCollectionOrderParam(col) {
  if (col === 'app_config' || col === 'offline_feed') return 'id.asc';
  return 'createdAt.desc,id.asc';
}

// Fetch all rows for a collection from Supabase with pagination (handles >1000 rows cleanly)
async function fetchAllRowsFromSupabase(col, headers, filterQuery = '') {
  const PAGE_SIZE = 1000;
  const MAX_PAGES = 20;
  const orderParam = getCollectionOrderParam(col);
  const allRows = [];
  let useOrder = true;

  for (let page = 0; page < MAX_PAGES; page++) {
    const offset = page * PAGE_SIZE;
    const parts = ['select=*', `limit=${PAGE_SIZE}`, `offset=${offset}`];
    if (filterQuery) parts.push(filterQuery);
    if (useOrder && orderParam) parts.push(`order=${orderParam}`);
    const queryUrl = `${SUPABASE_ORIGIN}/rest/v1/${col}?${parts.join('&')}`;

    try {
      let res = await fetch(queryUrl, { headers });
      if (!res.ok && res.status === 400 && useOrder) {
        // Fallback if a table lacks createdAt/id ordering column
        useOrder = false;
        const fallbackParts = ['select=*', `limit=${PAGE_SIZE}`, `offset=${offset}`];
        if (filterQuery) fallbackParts.push(filterQuery);
        res = await fetch(`${SUPABASE_ORIGIN}/rest/v1/${col}?${fallbackParts.join('&')}`, { headers });
      }
      if (!res.ok) {
        console.warn(`[Supabase] Fetch failed for ${col} (page ${page}): HTTP ${res.status}`);
        return { ok: false, rows: [] };
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        return { ok: false, rows: [] };
      }
      allRows.push(...data);
      if (data.length < PAGE_SIZE) break;
    } catch (err) {
      console.warn(`[Supabase] Fetch error for ${col}:`, err?.message || err);
      return { ok: false, rows: [] };
    }
  }

  return { ok: true, rows: allRows };
}

// Merge/upsert rows into an existing collection array by String(id), preserving updatedAt
function upsertRows(existingList, newRows, col) {
  const existing = Array.isArray(existingList) ? existingList : [];
  const incoming = Array.isArray(newRows) ? newRows : [];
  if (incoming.length === 0) return existing;

  const incomingById = new Map();
  for (const row of incoming) {
    if (row && row.id !== undefined && row.id !== null) {
      incomingById.set(String(row.id), row);
    }
  }

  const matchedIds = new Set();
  const updatedExisting = existing.map(item => {
    const key = item && item.id !== undefined && item.id !== null ? String(item.id) : null;
    if (key && incomingById.has(key)) {
      matchedIds.add(key);
      return incomingById.get(key);
    }
    return item;
  });

  const brandNew = [];
  for (const row of incoming) {
    const key = row && row.id !== undefined && row.id !== null ? String(row.id) : null;
    if (!key || !matchedIds.has(key)) {
      brandNew.push(row);
    }
  }

  const merged = [...brandNew, ...updatedExisting];

  if (col === 'questions' || col === 'notifications' || col === 'admits' || col === 'jobs' || col === 'feed_posts' || col === 'live_exams') {
    merged.sort((a, b) => {
      const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (isNaN(ta) && isNaN(tb)) return 0;
      if (isNaN(tb)) return -1;
      if (isNaN(ta)) return 1;
      return tb - ta;
    });
  }

  return merged;
}

// Extract and save live_exams answer keys into consolidated KV map
async function syncLiveExamAnswerKeys(env, exams, { replaceAll = false } = {}) {
  if (!Array.isArray(exams) || exams.length === 0) return;
  const answerKeysMap = replaceAll
    ? {}
    : (await env.CACHE_KV?.get('all_exam_answer_keys', 'json').catch(() => null)) || {};

  let changed = replaceAll;
  for (const exam of exams) {
    if (exam && exam.id !== undefined && Array.isArray(exam.questions) && exam.questions.length > 0) {
      const hasKeys = exam.questions.some(q => q && q.correctIndex !== undefined);
      if (hasKeys) {
        answerKeysMap[String(exam.id)] = exam.questions.map((q, idx) => ({
          index: idx,
          correctIndex: q.correctIndex,
          explanation: q.explanation || ''
        }));
        changed = true;
      }
    }
  }

  if (changed && Object.keys(answerKeysMap).length > 0) {
    await safeKvPut(env.CACHE_KV, 'all_exam_answer_keys', JSON.stringify(answerKeysMap));
  }
}

// Read sync_all_data cleanly, transparently handling sharded/chunked KV storage
async function readSyncAllFromKv(env, sbHeaders, onlyCollections = null) {
  const kvData = await env.CACHE_KV?.get('sync_all_data', 'json').catch(() => null);
  if (!kvData || typeof kvData !== 'object') return null;

  if (!kvData.__sharded) {
    return kvData;
  }

  const targetCols = onlyCollections || CORE_COLLECTIONS;
  const result = {
    masterLastUpdated: kvData.masterLastUpdated,
    syncedAt: kvData.syncedAt || kvData.masterLastUpdated
  };

  for (const col of targetCols) {
    const meta = kvData.collections?.[col];
    if (!meta) return null;

    if (meta.mode === 'live') {
      const fetched = await fetchAllRowsFromSupabase(col, sbHeaders || getSupabaseServiceHeaders(env));
      if (!fetched.ok) return null;
      result[col] = col === 'live_exams' ? stripAnswerKeys(fetched.rows) : fetched.rows;
    } else if (meta.mode === 'single') {
      const colData = await env.CACHE_KV?.get(`sync_col_${col}`, 'json').catch(() => null);
      if (!Array.isArray(colData)) return null;
      result[col] = colData;
    } else if (meta.mode === 'chunked') {
      const partCount = Number(meta.parts) || 0;
      if (partCount <= 0) return null;
      const partPromises = [];
      for (let i = 0; i < partCount; i++) {
        partPromises.push(env.CACHE_KV?.get(`sync_col_${col}_p${i}`, 'json').catch(() => null));
      }
      const parts = await Promise.all(partPromises);
      if (parts.some(p => !Array.isArray(p))) return null;
      result[col] = parts.flat();
    } else {
      return null;
    }
  }

  return result;
}

// Write sync_all_data safely to KV; automatically shards/chunks if >24 MiB so stale/truncated data is never served
async function writeSyncAllToKv(env, payloadObj, changedCols = null) {
  if (!env?.CACHE_KV || !payloadObj || typeof payloadObj !== 'object') {
    return { ok: false, reason: 'invalid_input' };
  }

  const safePayload = { ...payloadObj };
  delete safePayload.__sharded;
  delete safePayload.collections;
  if (Array.isArray(safePayload.live_exams)) {
    safePayload.live_exams = stripAnswerKeys(safePayload.live_exams);
  }

  const fullJson = JSON.stringify(safePayload);
  if (getUtf8ByteLength(fullJson) <= KV_MAX_SAFE_BYTES) {
    const putRes = await safeKvPut(env.CACHE_KV, 'sync_all_data', fullJson);
    if (!putRes.ok) {
      await safeKvDelete(env.CACHE_KV, 'sync_all_data');
    }
    return putRes;
  }

  // Payload exceeds single-key KV limit -> shard per collection (and chunk oversized arrays)
  console.warn(`[KV-Safe] sync_all_data (${getUtf8ByteLength(fullJson)} bytes) exceeds safe limit; sharding across per-collection KV keys.`);
  const existingPointer = await env.CACHE_KV.get('sync_all_data', 'json').catch(() => null);
  const wasSharded = Boolean(existingPointer?.__sharded);
  const collectionsMeta = wasSharded && existingPointer.collections ? { ...existingPointer.collections } : {};
  const colsToWrite = (!wasSharded || !Array.isArray(changedCols)) ? CORE_COLLECTIONS : changedCols;

  for (const col of CORE_COLLECTIONS) {
    const rows = Array.isArray(safePayload[col]) ? safePayload[col] : [];
    if (!colsToWrite.includes(col) && collectionsMeta[col]) {
      continue;
    }

    const colJson = JSON.stringify(rows);
    if (getUtf8ByteLength(colJson) <= KV_MAX_SAFE_BYTES) {
      const colPut = await safeKvPut(env.CACHE_KV, `sync_col_${col}`, colJson);
      collectionsMeta[col] = colPut.ok ? { mode: 'single' } : { mode: 'live' };
    } else {
      // Split oversized array into <=16 MiB chunks
      const chunks = [];
      let currentChunk = [];
      let currentBytes = 2; // '[]'

      for (const row of rows) {
        const rowJson = JSON.stringify(row);
        const rowBytes = getUtf8ByteLength(rowJson) + 1;
        if (rowBytes > KV_MAX_SAFE_BYTES) {
          currentChunk = null;
          break;
        }
        if (currentChunk.length > 0 && currentBytes + rowBytes > KV_CHUNK_TARGET_BYTES) {
          chunks.push(currentChunk);
          currentChunk = [row];
          currentBytes = 2 + rowBytes;
        } else {
          currentChunk.push(row);
          currentBytes += rowBytes;
        }
      }
      if (currentChunk && currentChunk.length > 0) chunks.push(currentChunk);

      if (!currentChunk) {
        collectionsMeta[col] = { mode: 'live' };
      } else {
        let allPartsOk = true;
        for (let i = 0; i < chunks.length; i++) {
          const partPut = await safeKvPut(env.CACHE_KV, `sync_col_${col}_p${i}`, JSON.stringify(chunks[i]));
          if (!partPut.ok) {
            allPartsOk = false;
            break;
          }
        }
        collectionsMeta[col] = allPartsOk ? { mode: 'chunked', parts: chunks.length } : { mode: 'live' };
      }
    }
  }

  const pointer = {
    __sharded: true,
    masterLastUpdated: safePayload.masterLastUpdated || new Date().toISOString(),
    syncedAt: safePayload.syncedAt || safePayload.masterLastUpdated || new Date().toISOString(),
    collections: collectionsMeta
  };
  const ptrPut = await safeKvPut(env.CACHE_KV, 'sync_all_data', JSON.stringify(pointer));
  if (!ptrPut.ok) {
    await safeKvDelete(env.CACHE_KV, 'sync_all_data');
  }
  return ptrPut;
}

// Helper: Get answer key for an exam (supports consolidated map and legacy single key)
async function getExamAnswerKey(env, examId) {
  if (!examId) return null;
  const examIdStr = String(examId);

  // 1. Try consolidated map from KV (0 extra KV keys)
  try {
    const allKeys = await env.CACHE_KV?.get('all_exam_answer_keys', 'json').catch(() => null);
    if (allKeys && allKeys[examIdStr]) {
      return allKeys[examIdStr];
    }
  } catch (e) {}

  // 2. Fallback to legacy single key if exists
  try {
    const single = await env.CACHE_KV?.get(`answer_key_${examIdStr}`, 'json').catch(() => null);
    if (single) return single;
  } catch (e) {}

  return null;
}

// ══════════════════════════════════════
// HMAC-SHA256 VERIFICATION (Phase 2C)
// Verifies client request signatures with 5-minute replay window
// ══════════════════════════════════════
async function verifyHMAC(request, env) {
  const sig = request.headers.get('X-App-Signature');
  const ts = request.headers.get('X-App-Timestamp');
  if (!sig || !ts) return false;

  // 5-minute replay attack window
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(ts)) > 300) return false;

  const body = await request.clone().text();
  const message = `${ts}:${body}`;
  const secret = env.HMAC_SECRET;
  if (!secret) return true; // Skip HMAC if secret not configured yet (graceful migration)

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const sigBytes = new Uint8Array(sig.match(/.{2}/g).map(b => parseInt(b, 16)));
    return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(message));
  } catch (e) {
    console.error('HMAC verify error:', e);
    return false;
  }
}

// ══════════════════════════════════════
// OneSignal Push from Worker (Phase 4)
// ══════════════════════════════════════
async function sendWorkerPush(env, { title, message, data }) {
  const appId = '54decc7c-7653-48d2-bf9d-dc1bc0ff0307';
  const apiKey = env.ONESIGNAL_REST_KEY;
  if (!apiKey) { console.warn('⚠️ ONESIGNAL_REST_KEY not set, skipping push'); return; }

  try {
    await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${apiKey}`
      },
      body: JSON.stringify({
        app_id: appId,
        included_segments: ['Total Subscriptions'],
        headings: { en: title, bn: title },
        contents: { en: message, bn: message },
        data: data || {},
        small_icon: 'ic_stat_onesignal_default',
        large_icon: 'https://job-circular-75dbb.web.app/app-icon.png',
        android_accent_color: 'FF1A56DB',
        priority: 10
      })
    });
  } catch (e) {
    console.error('OneSignal push failed:', e);
  }
}

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
};

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

    // Threat Score check (Cloudflare Free Tier Intelligence)
    const threatScore = request.cf?.threatScore || 0;
    if (threatScore > 50 && !url.pathname.startsWith('/webhook')) {
      return new Response(
        JSON.stringify({ error: 'Security verification failed: High threat score detected.' }),
        { status: 403, headers: { ...corsHeaders, 'X-Robots-Tag': 'noindex, nofollow' } }
      );
    }

    // Cloud Datacenter Bot Protection (POST/PUT/PATCH/DELETE)
    // Expatriate Bangladeshis on normal residential/mobile ISPs (STC, Zain, Celcom, EE, Vodafone, etc.) are 100% permitted.
    // Only automated scripts on AWS/DigitalOcean/Hetzner/Linode/OVH/Alibaba cloud hosting are restricted.
    const asOrg = (request.cf?.asOrganization || '').toLowerCase();
    const isCloudDatacenter = /amazon|aws|digitalocean|hetzner|linode|ovh|alibaba|tencent|vultr|oracle\s*(cloud|data)/i.test(asOrg);
    if (isCloudDatacenter && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) && !url.pathname.startsWith('/webhook')) {
      return new Response(
        JSON.stringify({ error: 'Access denied: Automated requests from cloud hosting datacenters are not allowed.' }),
        { status: 403, headers: { ...corsHeaders, 'X-Robots-Tag': 'noindex, nofollow' } }
      );
    }

    // CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS', 'Access-Control-Allow-Headers': '*', 'Access-Control-Max-Age': '86400' },
      });
    }

    // ══════════════════════════════════════
    // DUAL RATE LIMITER (D1-based: IP-level & Device-level) — Phase 2B
    // Uses D1 (5M writes/day free) instead of KV (1K writes/day)
    // ══════════════════════════════════════
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const deviceIdHeader = request.headers.get('X-Device-Id') || '';
    const isAdmin = appClientHeader.includes('admin');
    const maxIpLimit = isAdmin ? 120 : 60; // Admin header capped at 120/min to prevent spoofed header floods

    try {
      const minuteKey = Math.floor(Date.now() / 60000);
      const rateResult = await env.EXAM_DB.prepare(
        'SELECT cnt FROM rate_limits WHERE ip = ? AND minute_key = ?'
      ).bind(clientIP, minuteKey).first().catch(() => null);

      if (rateResult?.cnt > maxIpLimit) {
        return new Response(JSON.stringify({
          error: 'Rate limit exceeded. Please try again in 1 minute.'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Retry-After': '60' }
        });
      }

      // Device-level rate limit for write requests (max 30 write actions/min per device)
      if (deviceIdHeader && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        const devKey = `dev:${deviceIdHeader.slice(0, 40)}`;
        const devResult = await env.EXAM_DB.prepare(
          'SELECT cnt FROM rate_limits WHERE ip = ? AND minute_key = ?'
        ).bind(devKey, minuteKey).first().catch(() => null);

        if (devResult?.cnt > 30) {
          return new Response(JSON.stringify({
            error: 'Device request limit exceeded. Please slow down.'
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Retry-After': '60' }
          });
        }

        ctx.waitUntil(
          env.EXAM_DB.prepare(
            'INSERT INTO rate_limits (ip, minute_key, cnt) VALUES (?, ?, 1) ON CONFLICT(ip, minute_key) DO UPDATE SET cnt = cnt + 1'
          ).bind(devKey, minuteKey).run().catch(() => {})
        );
      }

      // Async IP increment (non-blocking)
      ctx.waitUntil(
        env.EXAM_DB.prepare(
          'INSERT INTO rate_limits (ip, minute_key, cnt) VALUES (?, ?, 1) ON CONFLICT(ip, minute_key) DO UPDATE SET cnt = cnt + 1'
        ).bind(clientIP, minuteKey).run().catch(() => {})
      );
    } catch (e) {
      // Rate limiter failure should NEVER block requests
    }

    const apiKey = request.headers.get('apikey') || env.SUPABASE_ANON_KEY || 'sb_publishable_6U3mjliIxh7zfUdlBYp0aA_joaBHdPd';
    const authHeader = request.headers.get('Authorization') || (apiKey ? `Bearer ${apiKey}` : '');
    const ifModifiedSince = request.headers.get('If-Modified-Since') || '';

    const originHeaders = new Headers();
    if (apiKey) originHeaders.set('apikey', apiKey);
    if (authHeader) originHeaders.set('Authorization', authHeader);
    originHeaders.set('Host', new URL(SUPABASE_ORIGIN).host);

    // ══════════════════════════════════════
    // POST /points/verify-ad -> Server-side Ad Cooldown & Daily Limit (100% AdMob Safe)
    // ══════════════════════════════════════
    if (url.pathname === '/points/verify-ad' && request.method === 'POST') {
      try {
        const body = await request.json().catch(() => null);
        const deviceId = body?.deviceId || request.headers.get('X-Device-Id');
        if (!deviceId) {
          return new Response(JSON.stringify({ success: false, error: 'Device ID required' }), { status: 400, headers: corsHeaders });
        }

        const today = new Date().toISOString().slice(0, 10);
        const record = await env.EXAM_DB.prepare(
          'SELECT * FROM device_points_security WHERE device_id = ?'
        ).bind(deviceId).first().catch(() => null);

        const now = Date.now();
        const lastAdTime = Number(record?.last_ad_time) || 0;
        const diffMs = now - lastAdTime;
        const COOLDOWN_MS = 120 * 1000; // 2 minutes server-enforced cooldown

        if (lastAdTime > 0 && diffMs < COOLDOWN_MS) {
          const waitSec = Math.ceil((COOLDOWN_MS - diffMs) / 1000);
          return new Response(JSON.stringify({
            success: false,
            error: 'Ad cooldown active',
            waitSec
          }), { status: 429, headers: corsHeaders });
        }

        const isSameDay = record?.daily_ad_date === today;
        const currentCount = isSameDay ? (Number(record?.daily_ad_count) || 0) : 0;

        if (currentCount >= 8) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Daily ad limit reached (8/8)',
            dailyAdCount: 8
          }), { status: 400, headers: corsHeaders });
        }

        const nextCount = currentCount + 1;
        await env.EXAM_DB.prepare(`
          INSERT INTO device_points_security (device_id, welcome_bonus_claimed, last_ad_time, daily_ad_date, daily_ad_count, updated_at)
          VALUES (?, 0, ?, ?, ?, ?)
          ON CONFLICT(device_id) DO UPDATE SET
            last_ad_time = excluded.last_ad_time,
            daily_ad_date = excluded.daily_ad_date,
            daily_ad_count = excluded.daily_ad_count,
            updated_at = excluded.updated_at
        `).bind(deviceId, now, today, nextCount, new Date().toISOString()).run();

        return new Response(JSON.stringify({
          success: true,
          dailyAdCount: nextCount,
          pointsGranted: 10,
          serverTimestamp: now
        }), { status: 200, headers: corsHeaders });
      } catch (err) {
        console.error('Verify ad error:', err);
        return new Response(JSON.stringify({ success: false, error: 'Server error' }), { status: 500, headers: corsHeaders });
      }
    }

    // ══════════════════════════════════════
    // POST /points/claim-welcome -> 1 Welcome Bonus per Device (Anti-Fraud)
    // ══════════════════════════════════════
    if (url.pathname === '/points/claim-welcome' && request.method === 'POST') {
      try {
        const body = await request.json().catch(() => null);
        const deviceId = body?.deviceId || request.headers.get('X-Device-Id');
        if (!deviceId) {
          return new Response(JSON.stringify({ success: false, error: 'Device ID required' }), { status: 400, headers: corsHeaders });
        }

        const record = await env.EXAM_DB.prepare(
          'SELECT welcome_bonus_claimed FROM device_points_security WHERE device_id = ?'
        ).bind(deviceId).first().catch(() => null);

        if (record && Number(record.welcome_bonus_claimed) === 1) {
          return new Response(JSON.stringify({
            success: false,
            alreadyClaimed: true,
            error: 'Welcome bonus already claimed on this device'
          }), { status: 200, headers: corsHeaders });
        }

        await env.EXAM_DB.prepare(`
          INSERT INTO device_points_security (device_id, welcome_bonus_claimed, last_ad_time, daily_ad_date, daily_ad_count, updated_at)
          VALUES (?, 1, 0, '', 0, ?)
          ON CONFLICT(device_id) DO UPDATE SET
            welcome_bonus_claimed = 1,
            updated_at = excluded.updated_at
        `).bind(deviceId, new Date().toISOString()).run();

        return new Response(JSON.stringify({
          success: true,
          pointsGranted: 10,
          welcomeBonusClaimed: true
        }), { status: 200, headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: 'Server error' }), { status: 500, headers: corsHeaders });
      }
    }

    // ══════════════════════════════════════
    // Rule 13: /exam-submit -> Server-Side Grading + D1 (0 Supabase!)
    // ══════════════════════════════════════
    if (url.pathname === '/exam-submit' && request.method === 'POST') {
      try {
        const body = await request.json().catch(() => null);
        if (!body) return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });

        const { examId, userName, userPhoto, answers, timeTakenSec } = body;
        if (!examId || !answers || timeTakenSec === undefined) {
          return new Response(JSON.stringify({ error: 'Missing required fields: examId, answers, timeTakenSec' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        // ১. KV থেকে Answer Key পড়ো (Consolidated map + fallback)
        const answerKey = await getExamAnswerKey(env, examId);
        if (!answerKey) {
          return new Response(JSON.stringify({ error: 'Exam answer key not found. Please try again.' }), { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        // ২. সার্ভার-সাইড গ্রেডিং (চিটিং অসম্ভব!)
        let correct = 0;
        const total = answerKey.length;
        for (const key of answerKey) {
          if (answers[String(key.index)] === key.correctIndex) correct++;
        }
        const scaledScore = Math.round((correct / total) * 100);
        const timeTaken = formatTime(timeTakenSec);

        // ৩. D1-তে সেভ (সুপাবেসে ০ রিকোয়েস্ট!)
        const subId = `exam-sub-${examId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        await env.EXAM_DB.prepare(`
          INSERT OR REPLACE INTO exam_submissions
          (id, exam_id, user_name, user_photo, score, total, scaled_score,
           time_taken, time_taken_sec, answers, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          subId, String(examId), userName || 'Anonymous', userPhoto || '',
          correct, total, scaledScore, timeTaken, timeTakenSec,
          JSON.stringify(answers), new Date().toISOString()
        ).run();

        // ৪. D1 থেকে তাৎক্ষণিক র্যাংক বের করো
        const rankResult = await env.EXAM_DB.prepare(`
          SELECT COUNT(*) + 1 as rank FROM exam_submissions
          WHERE exam_id = ? AND (scaled_score > ? OR (scaled_score = ? AND time_taken_sec < ?))
        `).bind(String(examId), scaledScore, scaledScore, timeTakenSec).first();

        const rank = rankResult?.rank || 1;

        // ৫. লিডারবোর্ড ক্যাশ ইনভ্যালিডেট (Cache API - ০ KV কোটা খরচ!)
        ctx.waitUntil((async () => {
          try {
            const cache = caches.default;
            await cache.delete(new Request(`${url.origin}/leaderboard?exam_id=${examId}`));
            await cache.delete(new Request(`${url.origin}/leaderboard/${examId}`));
            await cache.delete(new Request(`${url.origin}/leaderboard?exam_id=global`));
            await cache.delete(new Request(`${url.origin}/leaderboard`));
          } catch (e) {}
        })());

        console.log(`✅ Exam submit: ${userName} scored ${correct}/${total} (${scaledScore}%) rank #${rank} for exam ${examId}`);

        // ১০০ms এর মধ্যে Response!
        return new Response(JSON.stringify({
          success: true,
          score: correct, total, scaledScore, rank,
          timeTaken, timeTakenSec,
          submissionId: subId,
          answerKey: answerKey
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'X-Graded-By': 'server', 'X-Supabase-Queries': '0' }
        });
      } catch (e) {
        console.error('Exam submit error:', e);
        return new Response(JSON.stringify({ error: 'Submission failed', details: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      }
    }

    // ══════════════════════════════════════
    // GET /exam-solutions -> Secure Answer Key retrieval
    // ══════════════════════════════════════
    if (url.pathname === '/exam-solutions' && request.method === 'GET') {
      try {
        const examId = url.searchParams.get('exam_id');
        const submissionId = url.searchParams.get('submission_id');
        if (!examId) {
          return new Response(JSON.stringify({ error: 'Missing exam_id' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        const answerKey = await getExamAnswerKey(env, examId);
        if (!answerKey) {
          return new Response(JSON.stringify({ error: 'Solutions not found' }), { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        let authorized = false;

        // 1. Check if submissionId exists in D1
        if (submissionId) {
          const subCheck = await env.EXAM_DB.prepare(
            `SELECT id FROM exam_submissions WHERE exam_id = ? AND id = ? LIMIT 1`
          ).bind(String(examId), String(submissionId)).first();
          if (subCheck?.id) {
            authorized = true;
          }
        }

        // 2. Check if the exam has ended
        if (!authorized) {
          const kvData = await readSyncAllFromKv(env, getSupabaseServiceHeaders(env), ['live_exams']);
          let exam = (kvData?.live_exams || []).find(e => String(e.id) === String(examId));
          
          if (!exam) {
            console.log('⚠️ Exam not found in KV cache, querying Supabase fallback...');
            try {
              const sbTarget = `${SUPABASE_ORIGIN}/rest/v1/live_exams?select=*&id=eq.${examId}&limit=1`;
              const sbRes = await fetch(sbTarget, { headers: originHeaders });
              if (sbRes.ok) {
                const sbData = await sbRes.json();
                exam = sbData?.[0];
              }
            } catch (err) {
              console.error('Supabase fallback query error:', err);
            }
          }

          if (exam) {
            if (exam.status === 'completed' || exam.status === 'ended') {
              authorized = true;
            } else {
              const startStr = exam.startTime || exam.scheduledAt || exam.createdAt;
              const duration = Number(exam.duration) || 60;
              if (startStr) {
                const startMs = new Date(startStr).getTime();
                if (!isNaN(startMs) && Date.now() > (startMs + duration * 60 * 1000)) {
                  authorized = true;
                }
              }
            }
          }
        }

        if (!authorized) {
          return new Response(JSON.stringify({ error: 'Solutions are locked until you submit or the exam ends.' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        return new Response(JSON.stringify({ success: true, answerKey }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (e) {
        console.error('Exam solutions fetch error:', e);
        return new Response(JSON.stringify({ error: 'Failed to fetch solutions', details: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      }
    }

    // ══════════════════════════════════════
    // POST /feed/like -> Store in D1 (0 KV PUTs!)
    // ══════════════════════════════════════
    if (url.pathname === '/feed/like' && request.method === 'POST') {
      try {
        const body = await request.json().catch(() => null);
        if (!body) return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        const { postId, delta } = body;
        if (!postId || delta === undefined) {
          return new Response(JSON.stringify({ error: 'Missing postId or delta' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        // 1. Insert into D1 queue (D1 has 100k free writes/day, 0 KV put operations!)
        const likeId = `like-${postId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        await env.EXAM_DB.prepare(
          `INSERT INTO feed_likes_queue (id, post_id, delta, synced, created_at) VALUES (?, ?, ?, 0, ?)`
        ).bind(likeId, String(postId), Number(delta), new Date().toISOString()).run();

        // 2. Query total delta from D1 queue + base likes from KV (Read-Only)
        let finalLikes = 0;
        try {
          const d1Likes = await env.EXAM_DB.prepare(
            `SELECT SUM(delta) as total_delta FROM feed_likes_queue WHERE post_id = ?`
          ).bind(String(postId)).first();
          const queueDelta = Number(d1Likes?.total_delta) || 0;
          const kvData = await readSyncAllFromKv(env, getSupabaseServiceHeaders(env), ['feed_posts']);
          const post = kvData?.feed_posts?.find(p => String(p.id) === String(postId));
          const baseLikes = Number(post?.likes) || 0;
          finalLikes = Math.max(0, baseLikes + queueDelta);
        } catch (e) {
          finalLikes = 0;
        }

        return new Response(JSON.stringify({ success: true, likes: finalLikes }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (e) {
        console.error('Feed like error:', e);
        return new Response(JSON.stringify({ error: 'Failed to record like', details: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      }
    }

    // ══════════════════════════════════════
    // POST /feed/comment -> Store in D1 (0 KV PUTs!)
    // ══════════════════════════════════════
    if (url.pathname === '/feed/comment' && request.method === 'POST') {
      try {
        const body = await request.json().catch(() => null);
        if (!body) return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        const { postId, commentObj } = body;
        if (!postId || !commentObj) {
          return new Response(JSON.stringify({ error: 'Missing postId or commentObj' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        // 1. Insert into D1 queue (D1 has 100k free writes/day, 0 KV put operations!)
        const cmtId = `cmt-${postId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        await env.EXAM_DB.prepare(
          `INSERT INTO feed_comments_queue (id, post_id, comment_data, synced, created_at) VALUES (?, ?, ?, 0, ?)`
        ).bind(cmtId, String(postId), JSON.stringify(commentObj), new Date().toISOString()).run();

        return new Response(JSON.stringify({ success: true, comment: commentObj }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (e) {
        console.error('Feed comment error:', e);
        return new Response(JSON.stringify({ error: 'Failed to record comment', details: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      }
    }

    // ══════════════════════════════════════
    // POST /user/update -> Store in D1 (0 Supabase!)
    // ══════════════════════════════════════
    if (url.pathname === '/user/update' && request.method === 'POST') {
      try {
        const body = await request.json().catch(() => null);
        if (!body) return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        const { userId, userData } = body;
        if (!userId || !userData) {
          return new Response(JSON.stringify({ error: 'Missing userId or userData' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        // Insert or replace in D1 user profiles queue
        await env.EXAM_DB.prepare(
          `INSERT OR REPLACE INTO user_profiles_queue (id, profile_data, synced, created_at) VALUES (?, ?, 0, ?)`
        ).bind(String(userId), JSON.stringify(userData), new Date().toISOString()).run();

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (e) {
        console.error('User profile update error:', e);
        return new Response(JSON.stringify({ error: 'Failed to update user profile', details: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      }
    }

    // ══════════════════════════════════════
    // Rule 14: /webhook-sync -> KV + Answer Key Separation
    // ══════════════════════════════════════
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

        const validCollections = ['jobs', 'notifications', 'admits', 'questions', 'feed_posts', 'app_config', 'live_exams', 'offline_feed', 'activities'];
        if (!validCollections.includes(table)) {
          return new Response(`Skipping unsupported collection: ${table}`, { status: 200 });
        }

        const sbHeaders = getSupabaseServiceHeaders(env);
        const kvData = await readSyncAllFromKv(env, sbHeaders);

        // ★ Answer Key Separation: live_exams INSERT/UPDATE হলে answer key consolidated map-এ সেভ
        let processedRecord = record;
        if (table === 'live_exams' && record && (type === 'INSERT' || type === 'UPDATE')) {
          await syncLiveExamAnswerKeys(env, [record]);
          if (record.questions && Array.isArray(record.questions) && record.questions.length > 0) {
            processedRecord = {
              ...record,
              questions: record.questions.map(q => {
                const { correctIndex, explanation, ...safeQ } = q;
                return safeQ;
              })
            };
          }
        }

        const newTimestamp = new Date().toISOString();

        if (kvData && typeof kvData === 'object' && Array.isArray(kvData[table])) {
          let list = kvData[table];
          if (type === 'DELETE') {
            const deleteId = old_record?.id || record?.id;
            list = list.filter(item => String(item.id) !== String(deleteId));
            // live_exams ডিলিট হলে consolidated map থেকেও মুছো
            if (table === 'live_exams' && deleteId) {
              const allKeys = await env.CACHE_KV?.get('all_exam_answer_keys', 'json').catch(() => null) || {};
              if (allKeys[String(deleteId)]) {
                delete allKeys[String(deleteId)];
                ctx.waitUntil(safeKvPut(env.CACHE_KV, 'all_exam_answer_keys', JSON.stringify(allKeys)));
              }
            }
          } else if (processedRecord) {
            list = upsertRows(list, [processedRecord], table);
          }

          kvData[table] = list;
          kvData.masterLastUpdated = newTimestamp;
          kvData.syncedAt = newTimestamp;

          const writeRes = await writeSyncAllToKv(env, kvData, [table]);
          if (writeRes.ok) {
            await Promise.all([
              safeKvPut(env.CACHE_KV, 'last_sync_timestamp', newTimestamp),
              safeKvPut(env.CACHE_KV, 'last_updated_by', 'supabase-webhook')
            ]);
          }
        } else {
          // Cache empty or missing table — avoid writing a partial 1-item sync_all_data
          await Promise.all([
            safeKvDelete(env.CACHE_KV, 'sync_all_data'),
            safeKvPut(env.CACHE_KV, 'last_sync_timestamp', newTimestamp),
            safeKvPut(env.CACHE_KV, 'last_updated_by', 'supabase-webhook')
          ]);
        }

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
    if ((url.pathname === '/check-updates' || url.pathname.includes('app_sync_control')) && request.method === 'GET') {
      const kvTs = await env.CACHE_KV?.get('last_sync_timestamp').catch(() => null);
      const kvBy = await env.CACHE_KV?.get('last_updated_by').catch(() => null);
      if (kvTs) {
        return new Response(
          JSON.stringify([{ last_updated: kvTs, updated_by: kvBy || 'system' }]),
          { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-cache, no-store, must-revalidate', 'X-Edge-Cache': 'KV-HIT', 'X-Supabase-Queries': '0' } }
        );
      }
      try {
        const controlRes = await fetch(`${SUPABASE_ORIGIN}/rest/v1/app_sync_control?select=last_updated,updated_by&id=eq.1`, { headers: originHeaders });
        if (controlRes.ok) {
          const data = await controlRes.json();
          if (data?.[0]?.last_updated) {
            ctx.waitUntil(Promise.all([
              safeKvPut(env.CACHE_KV, 'last_sync_timestamp', data[0].last_updated),
              safeKvPut(env.CACHE_KV, 'last_updated_by', data[0].updated_by || 'system')
            ]));
          }
          return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-cache, no-store', 'X-Edge-Cache': 'KV-MISS-SUPABASE-FALLBACK' } });
        }
      } catch (e) { console.warn('check-updates fallback:', e); }
    }

    // Rule 10: /sync-all -> KV (0 Supabase!) + Answer Keys stripped
    if (url.pathname === '/sync-all' || url.pathname === '/rest/v1/sync-all') {
      const isBypass = url.searchParams.get('cache') === 'bypass' || url.searchParams.get('force') === 'true';
      const sbHeaders = getSupabaseServiceHeaders(env);

      // 304 check (only if not bypassing cache)
      if (!isBypass && ifModifiedSince) {
        const kvTs = await env.CACHE_KV?.get('last_sync_timestamp').catch(() => null);
        if (kvTs) {
          const serverTime = new Date(kvTs).getTime();
          const clientTime = new Date(ifModifiedSince).getTime();
          if (!isNaN(serverTime) && !isNaN(clientTime) && serverTime > 0 && clientTime >= serverTime) {
            return new Response(null, { status: 304, headers: { 'Access-Control-Allow-Origin': '*', 'X-Edge-Cache': '304-NOT-MODIFIED' } });
          }
        }
      }

      const kvData = isBypass ? null : await readSyncAllFromKv(env, sbHeaders);
      if (kvData && typeof kvData === 'object') {
        const safeData = { ...kvData };
        if (Array.isArray(safeData.live_exams)) {
          safeData.live_exams = stripAnswerKeys(safeData.live_exams);
        }
        return new Response(JSON.stringify(safeData), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=30, s-maxage=30, must-revalidate',
            'Last-Modified': kvData.masterLastUpdated || new Date().toISOString(),
            'X-Edge-Cache': 'KV-HIT-CDN-30s',
            'X-Supabase-Queries': '0'
          }
        });
      }

      // KV empty or bypass — fetch all active rows cleanly from Supabase with pagination
      const fetchAll = CORE_COLLECTIONS.map(col => fetchAllRowsFromSupabase(col, sbHeaders));
      const controlFetch = fetch(`${SUPABASE_ORIGIN}/rest/v1/app_sync_control?select=last_updated&id=eq.1`, { headers: sbHeaders })
        .then(r => r.ok ? r.json() : [])
        .then(res => Array.isArray(res) ? res : [])
        .catch(() => []);

      const results = await Promise.all([...fetchAll, controlFetch]);
      const colResults = results.slice(0, CORE_COLLECTIONS.length);
      const controlData = results[results.length - 1];
      const allColsOk = colResults.every(r => r && r.ok);

      const fallbackKv = allColsOk ? null : await readSyncAllFromKv(env, sbHeaders).catch(() => null);
      const masterLastUpdated = isBypass
        ? new Date().toISOString()
        : (controlData?.[0]?.last_updated || new Date().toISOString());

      const bootstrapPayload = {};
      CORE_COLLECTIONS.forEach((col, i) => {
        const res = colResults[i];
        if (res && res.ok) {
          bootstrapPayload[col] = res.rows;
        } else if (fallbackKv && Array.isArray(fallbackKv[col])) {
          bootstrapPayload[col] = fallbackKv[col];
        } else {
          bootstrapPayload[col] = [];
        }
      });

      // Bootstrap live_exams answer key separation (Consolidated into EXACTLY 1 KV PUT!)
      if (Array.isArray(bootstrapPayload.live_exams) && bootstrapPayload.live_exams.length) {
        await syncLiveExamAnswerKeys(env, bootstrapPayload.live_exams, { replaceAll: allColsOk });
        bootstrapPayload.live_exams = stripAnswerKeys(bootstrapPayload.live_exams);
      }

      bootstrapPayload.masterLastUpdated = masterLastUpdated;
      bootstrapPayload.syncedAt = masterLastUpdated;

      if (allColsOk) {
        const persistKv = async () => {
          const writeRes = await writeSyncAllToKv(env, bootstrapPayload);
          if (writeRes.ok) {
            const puts = [
              safeKvPut(env.CACHE_KV, 'last_sync_timestamp', masterLastUpdated),
              safeKvPut(env.CACHE_KV, 'last_updated_by', isBypass ? 'sync-bypass' : 'sync-bootstrap')
            ];
            if (controlData?.[0]?.last_updated) {
              puts.push(safeKvPut(env.CACHE_KV, 'last_control_sync_ts', controlData[0].last_updated));
            }
            await Promise.all(puts);
          }
        };
        if (isBypass) {
          await persistKv();
        } else {
          ctx.waitUntil(persistKv());
        }
      }

      return new Response(JSON.stringify(bootstrapPayload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': isBypass ? 'no-cache, no-store, must-revalidate' : 'public, max-age=30, s-maxage=30, must-revalidate',
          'Last-Modified': masterLastUpdated,
          'X-Edge-Cache': isBypass ? 'KV-BYPASS-SUPABASE-REVALIDATED' : (allColsOk ? 'KV-MISS-SUPABASE-BOOTSTRAP' : 'KV-PARTIAL-SUPABASE-FALLBACK')
        }
      });
    }

    // Rule 12: Leaderboard -> D1/KV (0 Supabase!)
    if (url.pathname.startsWith('/leaderboard') ||
       (url.pathname.includes('user_exam_submissions') && request.method === 'GET') ||
       (url.pathname.includes('activities') && url.search.includes('type=eq.live_exam_submission') && request.method === 'GET')
    ) {
      let examId = url.searchParams.get('exam_id') || 'global';
      if (url.search.includes('examId=eq.')) {
        const match = url.search.match(/examId=eq\.([a-zA-Z0-9_-]+)/);
        examId = match ? match[1] : 'global';
      }
      // URL path থেকেও examId নেওয়া যাবে: /leaderboard/exam123
      if (url.pathname.startsWith('/leaderboard/')) {
        const pathExamId = url.pathname.split('/leaderboard/')[1];
        if (pathExamId) examId = pathExamId;
      }

      // Check Cloudflare Cache API (FREE & UNLIMITED — ০ KV কোটা খরচ!)
      const cache = caches.default;
      const cacheKey = new Request(url.toString(), { method: 'GET' });
      const cachedResp = await cache.match(cacheKey);
      if (cachedResp) {
        return cachedResp;
      }

      // ★ D1 থেকে লিডারবোর্ড তৈরি করো (সুপাবেসে ০ রিকোয়েস্ট!)
      try {
        const query = examId !== 'global'
          ? `SELECT id, exam_id, user_name, user_photo, score, total, scaled_score, time_taken, time_taken_sec, created_at FROM exam_submissions WHERE exam_id = ? ORDER BY scaled_score DESC, time_taken_sec ASC LIMIT 100`
          : `SELECT id, exam_id, user_name, user_photo, score, total, scaled_score, time_taken, time_taken_sec, created_at FROM exam_submissions ORDER BY scaled_score DESC, time_taken_sec ASC LIMIT 100`;

        const d1Result = examId !== 'global'
          ? await env.EXAM_DB.prepare(query).bind(examId).all()
          : await env.EXAM_DB.prepare(query).all();

        const leaderboard = (d1Result?.results || []).map((r, i) => ({
          ...r,
          rank: i + 1,
          type: 'live_exam_submission',
          examId: r.exam_id,
          userName: r.user_name,
          userPhoto: r.user_photo,
          scaledScore: r.scaled_score,
          timeTaken: r.time_taken,
          timeTakenSec: r.time_taken_sec,
          createdAt: r.created_at
        }));

        const response = new Response(JSON.stringify(leaderboard), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120',
            'X-Edge-Cache': 'D1-CALCULATED',
            'X-Supabase-Queries': '0'
          }
        });

        ctx.waitUntil(cache.put(cacheKey, response.clone()));
        return response;
      } catch (d1Err) {
        console.error('D1 leaderboard error, falling back to Supabase:', d1Err);
        // D1 ফেইল হলে সুপাবেস ফলব্যাক
        const lbTarget = examId !== 'global'
          ? `${SUPABASE_ORIGIN}/rest/v1/activities?select=*&type=eq.live_exam_submission&examId=eq.${examId}&order=score.desc,timeTakenSec.asc&limit=100`
          : `${SUPABASE_ORIGIN}/rest/v1/activities?select=*&type=eq.live_exam_submission&order=score.desc,timeTakenSec.asc&limit=100`;
        const lbData = await fetch(lbTarget, { headers: originHeaders }).then(r => r.ok ? r.json() : []).catch(() => []);
        const fallbackResp = new Response(JSON.stringify(lbData), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=30, s-maxage=60',
            'X-Edge-Cache': 'SUPABASE-FALLBACK'
          }
        });
        ctx.waitUntil(cache.put(cacheKey, fallbackResp.clone()));
        return fallbackResp;
      }
    }

    // Legacy: /live-exam-submit -> redirect to /exam-submit
    if (url.pathname === '/live-exam-submit' ||
       (url.pathname.includes('user_exam_submissions') &&
        (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH'))) {
      try {
        const body = await request.json().catch(() => null);
        if (!body) return new Response('Invalid payload', { status: 400 });
        // Queue তে পাঠাও (legacy compatibility)
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

    // Extract table name from /rest/v1/tablename
    let targetTable = '';
    const restMatch = url.pathname.match(/\/rest\/v1\/([a-zA-Z0-9_-]+)/);
    if (restMatch) {
      targetTable = restMatch[1];
    }

    // STRICT GET CACHE LOCK (Candidate App only; Admin requests with no-cache or admin client header can bypass)
    const cacheControlHeader = (request.headers.get('Cache-Control') || '').toLowerCase();
    const pragmaHeader = (request.headers.get('Pragma') || '').toLowerCase();
    const isNoCache = cacheControlHeader.includes('no-cache') || cacheControlHeader.includes('no-store') || pragmaHeader.includes('no-cache');
    const isAdminClient = appClientHeader.includes('admin') || request.headers.get('referer')?.includes('/admin') || isNoCache;

    if (request.method === 'GET' && CORE_COLLECTIONS.includes(targetTable) && !isAdminClient) {
      return new Response(JSON.stringify({
        error: `Strict GET Cache Lock: Direct GET queries to core table "${targetTable}" are blocked. Please use /sync-all endpoint.`,
        url: url.pathname + url.search
      }), { status: 403, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    // Standard REST Proxy Passthrough
    const targetUrl = new URL(url.pathname + url.search, SUPABASE_ORIGIN);
    const headers = new Headers(request.headers);
    headers.set('Host', new URL(SUPABASE_ORIGIN).host);
    if (!headers.has('apikey') && apiKey) headers.set('apikey', apiKey);
    if (!headers.has('Authorization') && authHeader) headers.set('Authorization', authHeader);
    if (request.method === 'GET' && CORE_COLLECTIONS.includes(targetTable)) {
      headers.set('Cache-Control', 'no-cache, no-store');
      headers.set('Pragma', 'no-cache');
    }

    const originResponse = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'follow',
    });

    const isCoreMutation = originResponse.ok &&
      ['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method) &&
      CORE_COLLECTIONS.includes(targetTable);

    // Real-time KV Cache Sync on DELETE / POST / PATCH / PUT for synced tables
    if (isCoreMutation && env.CACHE_KV) {
      const responseClone = originResponse.clone();
      ctx.waitUntil((async () => {
        try {
          const sbHeaders = getSupabaseServiceHeaders(env);
          const newTimestamp = new Date().toISOString();
          const kvData = await readSyncAllFromKv(env, sbHeaders);

          const resText = await responseClone.text().catch(() => '');
          let returnedRows = [];
          if (resText) {
            try {
              const parsed = JSON.parse(resText);
              returnedRows = Array.isArray(parsed)
                ? parsed
                : (parsed && typeof parsed === 'object' ? [parsed] : []);
            } catch (e) {}
          }

          if (request.method === 'DELETE') {
            const deleteIds = new Set();
            const eqMatch = url.search.match(/[?&]id=eq\.([^&]+)/);
            if (eqMatch) {
              deleteIds.add(decodeURIComponent(eqMatch[1]));
            }
            const inMatch = url.search.match(/[?&]id=in\.\(([^)]+)\)/);
            if (inMatch) {
              decodeURIComponent(inMatch[1])
                .split(',')
                .map(s => s.trim().replace(/^"|"$/g, ''))
                .filter(Boolean)
                .forEach(id => deleteIds.add(id));
            }
            for (const row of returnedRows) {
              if (row && row.id !== undefined && row.id !== null) {
                deleteIds.add(String(row.id));
              }
            }

            if (kvData && Array.isArray(kvData[targetTable])) {
              if (deleteIds.size > 0) {
                kvData[targetTable] = kvData[targetTable].filter(item => !deleteIds.has(String(item.id)));
                if (targetTable === 'live_exams') {
                  const allKeys = await env.CACHE_KV.get('all_exam_answer_keys', 'json').catch(() => null);
                  if (allKeys && typeof allKeys === 'object') {
                    let keysChanged = false;
                    for (const id of deleteIds) {
                      if (allKeys[id]) {
                        delete allKeys[id];
                        keysChanged = true;
                      }
                    }
                    if (keysChanged) {
                      await safeKvPut(env.CACHE_KV, 'all_exam_answer_keys', JSON.stringify(allKeys));
                    }
                  }
                }
                kvData.masterLastUpdated = newTimestamp;
                kvData.syncedAt = newTimestamp;
                const writeRes = await writeSyncAllToKv(env, kvData, [targetTable]);
                if (writeRes.ok) {
                  await Promise.all([
                    safeKvPut(env.CACHE_KV, 'last_sync_timestamp', newTimestamp),
                    safeKvPut(env.CACHE_KV, 'last_updated_by', 'admin-rest-delete')
                  ]);
                }
                console.log(`🗑️ KV Sync: Removed ${deleteIds.size} deleted record(s) from table "${targetTable}".`);
              } else {
                // Non-ID DELETE filter without returned rows -> re-fetch table or invalidate KV
                const fresh = await fetchAllRowsFromSupabase(targetTable, sbHeaders);
                if (fresh.ok) {
                  kvData[targetTable] = targetTable === 'live_exams' ? stripAnswerKeys(fresh.rows) : fresh.rows;
                  kvData.masterLastUpdated = newTimestamp;
                  kvData.syncedAt = newTimestamp;
                  const writeRes = await writeSyncAllToKv(env, kvData, [targetTable]);
                  if (writeRes.ok) {
                    await Promise.all([
                      safeKvPut(env.CACHE_KV, 'last_sync_timestamp', newTimestamp),
                      safeKvPut(env.CACHE_KV, 'last_updated_by', 'admin-rest-delete')
                    ]);
                  }
                } else {
                  await safeKvDelete(env.CACHE_KV, 'sync_all_data');
                  await safeKvPut(env.CACHE_KV, 'last_sync_timestamp', newTimestamp);
                }
              }
            } else {
              await Promise.all([
                safeKvPut(env.CACHE_KV, 'last_sync_timestamp', newTimestamp),
                safeKvPut(env.CACHE_KV, 'last_updated_by', 'admin-rest-delete')
              ]);
            }
          } else {
            // POST / PATCH / PUT on a core table
            if (returnedRows.length > 0) {
              if (targetTable === 'live_exams') {
                await syncLiveExamAnswerKeys(env, returnedRows);
              }
              const safeMutatedRows = targetTable === 'live_exams'
                ? stripAnswerKeys(returnedRows)
                : returnedRows;

              if (kvData && Array.isArray(kvData[targetTable])) {
                kvData[targetTable] = upsertRows(kvData[targetTable], safeMutatedRows, targetTable);
                kvData.masterLastUpdated = newTimestamp;
                kvData.syncedAt = newTimestamp;
                const writeRes = await writeSyncAllToKv(env, kvData, [targetTable]);
                if (writeRes.ok) {
                  await Promise.all([
                    safeKvPut(env.CACHE_KV, 'last_sync_timestamp', newTimestamp),
                    safeKvPut(env.CACHE_KV, 'last_updated_by', 'admin-rest-sync')
                  ]);
                }
                console.log(`⚡ KV Sync: Upserted ${safeMutatedRows.length} record(s) into "${targetTable}".`);
              } else {
                // Avoid writing partial sync_all_data; clear any incomplete cache & bump timestamp
                await Promise.all([
                  safeKvDelete(env.CACHE_KV, 'sync_all_data'),
                  safeKvPut(env.CACHE_KV, 'last_sync_timestamp', newTimestamp),
                  safeKvPut(env.CACHE_KV, 'last_updated_by', 'admin-rest-sync')
                ]);
              }
            } else if (kvData && Array.isArray(kvData[targetTable])) {
              // Prefer: return=minimal (e.g. batch upsert without .select()) -> re-fetch table cleanly or invalidate
              const fresh = await fetchAllRowsFromSupabase(targetTable, sbHeaders);
              if (fresh.ok) {
                if (targetTable === 'live_exams') {
                  await syncLiveExamAnswerKeys(env, fresh.rows, { replaceAll: true });
                }
                kvData[targetTable] = targetTable === 'live_exams' ? stripAnswerKeys(fresh.rows) : fresh.rows;
                kvData.masterLastUpdated = newTimestamp;
                kvData.syncedAt = newTimestamp;
                const writeRes = await writeSyncAllToKv(env, kvData, [targetTable]);
                if (writeRes.ok) {
                  await Promise.all([
                    safeKvPut(env.CACHE_KV, 'last_sync_timestamp', newTimestamp),
                    safeKvPut(env.CACHE_KV, 'last_updated_by', 'admin-rest-sync')
                  ]);
                }
                console.log(`⚡ KV Sync: Refreshed table "${targetTable}" (${fresh.rows.length} rows) after minimal write.`);
              } else {
                await Promise.all([
                  safeKvDelete(env.CACHE_KV, 'sync_all_data'),
                  safeKvPut(env.CACHE_KV, 'last_sync_timestamp', newTimestamp),
                  safeKvPut(env.CACHE_KV, 'last_updated_by', 'admin-rest-sync')
                ]);
              }
            } else {
              await Promise.all([
                safeKvPut(env.CACHE_KV, 'last_sync_timestamp', newTimestamp),
                safeKvPut(env.CACHE_KV, 'last_updated_by', 'admin-rest-sync')
              ]);
            }
          }
        } catch (e) {
          console.error('Failed to sync KV on REST write/delete:', e);
        }
      })());
    }

    const newHeaders = new Headers(originResponse.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    newHeaders.set('Pragma', 'no-cache');
    newHeaders.set('X-Edge-Cache', 'BYPASS');
    newHeaders.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('X-Frame-Options', 'DENY');
    return new Response(originResponse.body, { status: originResponse.status, statusText: originResponse.statusText, headers: newHeaders });
  },

  // ══════════════════════════════════════
  // QUEUE HANDLER — Legacy compatibility (still forwards to Supabase)
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
  // SCHEDULED HANDLER — Smart Batch Cron (D1 -> Supabase, 500/batch, 1s delay)
  // ══════════════════════════════════════
  async scheduled(event, env, ctx) {
    const apiKey = env.SUPABASE_ANON_KEY || 'sb_publishable_6U3mjliIxh7zfUdlBYp0aA_joaBHdPd';
    const h = new Headers({
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=minimal'
    });

    // ══════════ Smart Batch: D1 → Supabase ══════════
    const BATCH_SIZE = 500;
    
    // 1. Live Exam Submissions Sync
    try {
      const countResult = await env.EXAM_DB.prepare(
        'SELECT COUNT(*) as cnt FROM exam_submissions WHERE synced_to_supabase = 0'
      ).first();

      if (countResult?.cnt && countResult.cnt > 0) {
        console.log(`Cron: ${countResult.cnt} unsynced exam submissions found.`);
        let synced = 0;
        while (synced < countResult.cnt) {
          const batch = await env.EXAM_DB.prepare(
            'SELECT * FROM exam_submissions WHERE synced_to_supabase = 0 ORDER BY created_at ASC LIMIT ?'
          ).bind(BATCH_SIZE).all();

          if (!batch.results?.length) break;

          const payload = batch.results.map(r => ({
            id: r.id,
            type: 'live_exam_submission',
            examId: r.exam_id,
            userName: r.user_name,
            userPhoto: r.user_photo,
            score: r.score,
            total: r.total,
            scaledScore: r.scaled_score,
            timeTaken: r.time_taken,
            timeTakenSec: r.time_taken_sec,
            createdAt: r.created_at
          }));

          const res = await fetch(`${SUPABASE_ORIGIN}/rest/v1/activities`, {
            method: 'POST', headers: h, body: JSON.stringify(payload)
          });

          if (res.ok) {
            const ids = batch.results.map(r => `'${r.id}'`).join(',');
            await env.EXAM_DB.prepare(`UPDATE exam_submissions SET synced_to_supabase = 1 WHERE id IN (${ids})`).run();
            synced += batch.results.length;
          } else {
            console.error(`Cron: Exam sync failed: ${res.status}`);
            break;
          }
          if (synced < countResult.cnt) await new Promise(r => setTimeout(r, 1000));
        }
      }
    } catch (e) { console.error('Cron Exam sync failed:', e); }

    // 2. Feed Likes Sync
    try {
      const likesBatch = await env.EXAM_DB.prepare(
        'SELECT * FROM feed_likes_queue WHERE synced = 0 ORDER BY created_at ASC LIMIT 100'
      ).all();

      if (likesBatch.results?.length) {
        console.log(`Cron: Syncing ${likesBatch.results.length} feed likes...`);
        // Group by post_id
        const postDeltas = {};
        likesBatch.results.forEach(r => {
          postDeltas[r.post_id] = (postDeltas[r.post_id] || 0) + r.delta;
        });

        const postIds = Object.keys(postDeltas);
        const idFilter = postIds.map(id => `"${id}"`).join(',');

        // Fetch current posts from Supabase to prevent overwrite
        const getRes = await fetch(`${SUPABASE_ORIGIN}/rest/v1/feed_posts?select=id,likes,raw_data&id=in.(${idFilter})`, {
          headers: h
        });

        if (getRes.ok) {
          const posts = await getRes.json();
          const upsertPayload = posts.map(p => {
            const delta = postDeltas[p.id] || 0;
            const newLikes = Math.max(0, (Number(p.likes) || 0) + delta);
            
            let rawData = p.raw_data || {};
            if (typeof rawData === 'string') {
              try { rawData = JSON.parse(rawData); } catch(e) { rawData = {}; }
            }
            const updatedRawData = { ...rawData, likes: newLikes, updatedAt: new Date().toISOString() };

            return {
              id: p.id,
              likes: newLikes,
              raw_data: updatedRawData,
              updatedAt: new Date().toISOString()
            };
          });

          if (upsertPayload.length > 0) {
            const upsertRes = await fetch(`${SUPABASE_ORIGIN}/rest/v1/feed_posts`, {
              method: 'POST', headers: h, body: JSON.stringify(upsertPayload)
            });

            if (upsertRes.ok) {
              const ids = likesBatch.results.map(r => `'${r.id}'`).join(',');
              await env.EXAM_DB.prepare(`UPDATE feed_likes_queue SET synced = 1 WHERE id IN (${ids})`).run();
              console.log(`Cron: Synced ${likesBatch.results.length} feed likes successfully.`);
            }
          }
        }
      }
    } catch (e) { console.error('Cron Feed Likes sync failed:', e); }

    // 3. Feed Comments Sync
    try {
      const commentsBatch = await env.EXAM_DB.prepare(
        'SELECT * FROM feed_comments_queue WHERE synced = 0 ORDER BY created_at ASC LIMIT 50'
      ).all();

      if (commentsBatch.results?.length) {
        console.log(`Cron: Syncing ${commentsBatch.results.length} feed comments...`);
        // Group new comments by post_id
        const postCommentsMap = {};
        commentsBatch.results.forEach(r => {
          if (!postCommentsMap[r.post_id]) postCommentsMap[r.post_id] = [];
          try {
            postCommentsMap[r.post_id].push(JSON.parse(r.comment_data));
          } catch(e) { console.error('Comment parse error:', e); }
        });

        const postIds = Object.keys(postCommentsMap);
        const idFilter = postIds.map(id => `"${id}"`).join(',');

        // Fetch current posts from Supabase
        const getRes = await fetch(`${SUPABASE_ORIGIN}/rest/v1/feed_posts?select=id,comments,raw_data&id=in.(${idFilter})`, {
          headers: h
        });

        if (getRes.ok) {
          const posts = await getRes.json();
          const upsertPayload = posts.map(p => {
            let existingComments = p.comments || [];
            if (typeof existingComments === 'string') {
              try { existingComments = JSON.parse(existingComments); } catch(e) { existingComments = []; }
            }
            if (!Array.isArray(existingComments)) existingComments = [];

            const newComments = postCommentsMap[p.id] || [];
            const updatedComments = [...existingComments, ...newComments];

            let rawData = p.raw_data || {};
            if (typeof rawData === 'string') {
              try { rawData = JSON.parse(rawData); } catch(e) { rawData = {}; }
            }
            const updatedRawData = { ...rawData, comments: updatedComments, updatedAt: new Date().toISOString() };

            return {
              id: p.id,
              comments: updatedComments,
              raw_data: updatedRawData,
              updatedAt: new Date().toISOString()
            };
          });

          if (upsertPayload.length > 0) {
            const upsertRes = await fetch(`${SUPABASE_ORIGIN}/rest/v1/feed_posts`, {
              method: 'POST', headers: h, body: JSON.stringify(upsertPayload)
            });

            if (upsertRes.ok) {
              const ids = commentsBatch.results.map(r => `'${r.id}'`).join(',');
              await env.EXAM_DB.prepare(`UPDATE feed_comments_queue SET synced = 1 WHERE id IN (${ids})`).run();
              console.log(`Cron: Synced ${commentsBatch.results.length} feed comments successfully.`);
            }
          }
        }
      }
    } catch (e) { console.error('Cron Feed Comments sync failed:', e); }

    // 4. User Profiles Sync
    try {
      const profilesBatch = await env.EXAM_DB.prepare(
        'SELECT * FROM user_profiles_queue WHERE synced = 0 ORDER BY created_at ASC LIMIT 100'
      ).all();

      if (profilesBatch.results?.length) {
        console.log(`Cron: Syncing ${profilesBatch.results.length} user profiles...`);
        const payload = [];
        profilesBatch.results.forEach(r => {
          try {
            const data = JSON.parse(r.profile_data);
            payload.push({
              id: r.id,
              name: data.name || '',
              phone: data.phone || '',
              qualification: data.qualification || '',
              location: data.location || '',
              avatar: data.avatar || null,
              savedJobs: data.savedJobs || [],
              appliedJobs: data.appliedJobs || [],
              raw_data: data,
              updatedAt: r.created_at
            });
          } catch(e) { console.error('Profile data parse error:', e); }
        });

        if (payload.length > 0) {
          const upsertRes = await fetch(`${SUPABASE_ORIGIN}/rest/v1/users`, {
            method: 'POST', headers: h, body: JSON.stringify(payload)
          });

          if (upsertRes.ok) {
            const ids = profilesBatch.results.map(r => `'${r.id}'`).join(',');
            await env.EXAM_DB.prepare(`UPDATE user_profiles_queue SET synced = 1 WHERE id IN (${ids})`).run();
            console.log(`Cron: Synced ${profilesBatch.results.length} user profiles successfully.`);
          } else {
            console.error(`Cron: Supabase user profile sync failed: ${upsertRes.status} ${await upsertRes.text()}`);
          }
        }
      }
    } catch (e) { console.error('Cron User Profiles sync failed:', e); }

    // ══════════ Incremental KV Sync (with updatedAt + lookback window) ══════════
    try {
      const controlRes = await fetch(
        `${SUPABASE_ORIGIN}/rest/v1/app_sync_control?select=last_updated,updated_by&id=eq.1`,
        { headers: h }
      ).catch(() => null);
      const [row] = controlRes?.ok ? await controlRes.json().catch(() => []) : [];

      if (row?.last_updated) {
        const [cachedTs, lastControlTs, existingData] = await Promise.all([
          env.CACHE_KV?.get('last_sync_timestamp').catch(() => null),
          env.CACHE_KV?.get('last_control_sync_ts').catch(() => null),
          readSyncAllFromKv(env, h)
        ]);
        const cachedMs = cachedTs ? new Date(cachedTs).getTime() : 0;
        const controlMs = new Date(row.last_updated).getTime();
        const isKvUpToDate = Boolean(
          existingData &&
          lastControlTs &&
          lastControlTs === row.last_updated
        );

        if (isKvUpToDate) {
          console.log('Cron: No KV change. Fresh. 0 extra queries.');
        } else {
          // Safe lookback window prevents skipping client-timestamped or out-of-order rows
          const baseTs = lastControlTs || cachedTs;
          const baseMs = baseTs ? new Date(baseTs).getTime() : 0;
          let sinceTs = '1970-01-01T00:00:00.000Z';
          if (baseTs && !isNaN(baseMs) && baseMs > CRON_LOOKBACK_MS) {
            sinceTs = new Date(baseMs - CRON_LOOKBACK_MS).toISOString();
          }
          const encodedSince = encodeURIComponent(sinceTs);
          const nextData = (existingData && typeof existingData === 'object') ? { ...existingData } : {};
          const changedCols = [];
          let allSyncOk = true;

          console.log(`Cron: Incremental sync since ${sinceTs} (control: ${row.last_updated})`);

          for (const col of CORE_COLLECTIONS) {
            const hasExisting = Array.isArray(nextData[col]);
            let fetched;

            if (!hasExisting) {
              // Missing collection in KV -> full fetch instead of partial incremental slice
              fetched = await fetchAllRowsFromSupabase(col, h);
            } else if (DUAL_TS_COLLECTIONS.has(col)) {
              const orFilter = `or=(createdAt.gt.${encodedSince},updatedAt.gt.${encodedSince})`;
              fetched = await fetchAllRowsFromSupabase(col, h, orFilter);
              if (!fetched.ok) {
                // Fallback if a table lacks updatedAt in schema
                fetched = await fetchAllRowsFromSupabase(col, h, `createdAt=gt.${encodedSince}`);
              }
            } else if (CREATED_ONLY_COLLECTIONS.has(col)) {
              fetched = await fetchAllRowsFromSupabase(col, h, `createdAt=gt.${encodedSince}`);
            } else if (UPDATED_ONLY_COLLECTIONS.has(col)) {
              fetched = await fetchAllRowsFromSupabase(col, h, `updatedAt=gt.${encodedSince}`);
            } else if (col === 'offline_feed') {
              fetched = await fetchAllRowsFromSupabase(col, h, `updated_at=gt.${encodedSince}`);
              if (!fetched.ok) {
                fetched = await fetchAllRowsFromSupabase(col, h);
              }
            } else {
              fetched = await fetchAllRowsFromSupabase(col, h);
            }

            if (!fetched.ok) {
              allSyncOk = false;
              continue;
            }

            if (!hasExisting) {
              nextData[col] = col === 'live_exams' ? stripAnswerKeys(fetched.rows) : fetched.rows;
              if (col === 'live_exams') {
                await syncLiveExamAnswerKeys(env, fetched.rows, { replaceAll: true });
              }
              changedCols.push(col);
            } else if (fetched.rows.length > 0) {
              if (col === 'live_exams') {
                await syncLiveExamAnswerKeys(env, fetched.rows);
                nextData[col] = upsertRows(nextData[col], stripAnswerKeys(fetched.rows), col);
              } else {
                nextData[col] = upsertRows(nextData[col], fetched.rows, col);
              }
              changedCols.push(col);
            }
          }

          if (allSyncOk) {
            const finalTs = (!isNaN(cachedMs) && !isNaN(controlMs) && cachedMs > controlMs)
              ? cachedTs
              : row.last_updated;
            nextData.masterLastUpdated = finalTs;
            nextData.syncedAt = finalTs;

            const writeRes = await writeSyncAllToKv(env, nextData, changedCols.length > 0 ? changedCols : null);
            if (writeRes.ok) {
              await Promise.all([
                safeKvPut(env.CACHE_KV, 'last_sync_timestamp', finalTs),
                safeKvPut(env.CACHE_KV, 'last_control_sync_ts', row.last_updated),
                safeKvPut(env.CACHE_KV, 'last_updated_by', row.updated_by || 'cron-sync')
              ]);
              console.log(`Cron: Incremental sync complete! Updated collections: ${changedCols.join(', ') || 'none'}`);
            }
          } else {
            console.warn('Cron: One or more collection fetches failed; skipping KV timestamp advance to retry next run.');
          }
        }
      }
    } catch (e) {
      console.error('Cron Incremental KV Sync failed:', e);
    }

    // ══════════════════════════════════════
    // Phase 2B: Clean old rate limit entries (older than 5 minutes)
    // ══════════════════════════════════════
    try {
      const oldMinute = Math.floor(Date.now() / 60000) - 5;
      await env.EXAM_DB.prepare('DELETE FROM rate_limits WHERE minute_key < ?').bind(oldMinute).run();
    } catch (e) { /* rate_limits table may not exist yet */ }

    // ══════════════════════════════════════
    // Phase 4: DEADLINE REMINDER — 2 days before job deadline
    // Uses D1 for sent notification tracking (০ KV কোটা খরচ!)
    // ══════════════════════════════════════
    try {
      await env.EXAM_DB.prepare(
        'CREATE TABLE IF NOT EXISTS sent_notifications (id TEXT PRIMARY KEY, type TEXT, sent_at TEXT)'
      ).run().catch(() => {});

      const cached = await readSyncAllFromKv(env, h, ['jobs']);
      if (cached?.jobs?.length) {
        const now = new Date();

        for (const job of cached.jobs) {
          const deadlineStr = job.deadline;
          if (!deadlineStr) continue;

          // Check if already sent in D1
          const sentRow = await env.EXAM_DB.prepare(
            'SELECT id FROM sent_notifications WHERE id = ?'
          ).bind(`deadline_${job.id}`).first().catch(() => null);
          if (sentRow) continue;

          // Parse deadline (format: YYYY-MM-DD or DD/MM/YYYY)
          let deadline = new Date(`${deadlineStr}T23:59:59`);
          if (isNaN(deadline.getTime())) {
            const dmy = deadlineStr.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
            if (dmy) deadline = new Date(parseInt(dmy[3]), parseInt(dmy[2]) - 1, parseInt(dmy[1]), 23, 59, 59);
          }
          if (isNaN(deadline.getTime())) continue;

          const hoursLeft = (deadline - now) / (1000 * 60 * 60);

          // Send if deadline is 44-52 hours away (≈2 days)
          if (hoursLeft >= 44 && hoursLeft <= 52) {
            await sendWorkerPush(env, {
              title: '⏰ আবেদনের সময়সীমা শেষ হচ্ছে!',
              message: `"${job.title || job.titleEn || 'Job Circular'}" এর আবেদনের শেষ তারিখ আর মাত্র ২ দিন বাকি। এখনই আবেদন করুন!`,
              data: { jobId: job.id, type: 'deadline' }
            });
            await env.EXAM_DB.prepare(
              'INSERT OR REPLACE INTO sent_notifications (id, type, sent_at) VALUES (?, ?, ?)'
            ).bind(`deadline_${job.id}`, 'deadline', now.toISOString()).run().catch(() => {});
            console.log(`📬 Deadline reminder sent for job: ${job.id}`);
          }
        }
      }
    } catch (e) { console.error('Deadline reminder check failed:', e); }
  },
};
