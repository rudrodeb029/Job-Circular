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

const CORE_COLLECTIONS = [
  'jobs', 'notifications', 'admits',
  'questions', 'live_exams', 'feed_posts', 'app_config',
  'offline_feed', 'activities'
];

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

    const apiKey = request.headers.get('apikey') || env.SUPABASE_ANON_KEY || 'sb_publishable_6U3mjliIxh7zfUdlBYp0aA_joaBHdPd';
    const authHeader = request.headers.get('Authorization') || (apiKey ? `Bearer ${apiKey}` : '');
    const ifModifiedSince = request.headers.get('If-Modified-Since') || '';

    const originHeaders = new Headers();
    if (apiKey) originHeaders.set('apikey', apiKey);
    if (authHeader) originHeaders.set('Authorization', authHeader);
    originHeaders.set('Host', new URL(SUPABASE_ORIGIN).host);

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

        // ১. KV থেকে Answer Key পড়ো
        const answerKey = await env.CACHE_KV?.get(`answer_key_${examId}`, 'json').catch(() => null);
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

        // ৫. লিডারবোর্ড KV ইনভ্যালিডেট (ব্যাকগ্রাউন্ডে)
        ctx.waitUntil(env.CACHE_KV?.delete(`leaderboard_${examId}`).catch(() => {}));

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

        const answerKey = await env.CACHE_KV?.get(`answer_key_${examId}`, 'json').catch(() => null);
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
          const kvData = await env.CACHE_KV?.get('sync_all_data', 'json').catch(() => null);
          const exam = (kvData?.live_exams || []).find(e => String(e.id) === String(examId));
          if (exam) {
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
    // POST /feed/like -> Store in D1 + Realtime KV Update
    // ══════════════════════════════════════
    if (url.pathname === '/feed/like' && request.method === 'POST') {
      try {
        const body = await request.json().catch(() => null);
        if (!body) return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        const { postId, delta } = body;
        if (!postId || delta === undefined) {
          return new Response(JSON.stringify({ error: 'Missing postId or delta' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        // 1. Insert into D1 queue
        const likeId = `like-${postId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        await env.EXAM_DB.prepare(
          `INSERT INTO feed_likes_queue (id, post_id, delta, synced, created_at) VALUES (?, ?, ?, 0, ?)`
        ).bind(likeId, String(postId), Number(delta), new Date().toISOString()).run();

        // 2. Realtime KV Update
        const kvData = await env.CACHE_KV?.get('sync_all_data', 'json').catch(() => null);
        let finalLikes = 0;
        if (kvData) {
          if (!kvData.feed_posts) kvData.feed_posts = [];
          const postIdx = kvData.feed_posts.findIndex(p => String(p.id) === String(postId));
          if (postIdx !== -1) {
            kvData.feed_posts[postIdx].likes = Math.max(0, (Number(kvData.feed_posts[postIdx].likes) || 0) + delta);
            finalLikes = kvData.feed_posts[postIdx].likes;
            const newTimestamp = new Date().toISOString();
            kvData.masterLastUpdated = newTimestamp;
            await Promise.all([
              env.CACHE_KV?.put('sync_all_data', JSON.stringify(kvData)),
              env.CACHE_KV?.put('last_sync_timestamp', newTimestamp),
              env.CACHE_KV?.put('last_updated_by', 'feed-like-action')
            ]);
          }
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
    // POST /feed/comment -> Store in D1 + Realtime KV Update
    // ══════════════════════════════════════
    if (url.pathname === '/feed/comment' && request.method === 'POST') {
      try {
        const body = await request.json().catch(() => null);
        if (!body) return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        const { postId, commentObj } = body;
        if (!postId || !commentObj) {
          return new Response(JSON.stringify({ error: 'Missing postId or commentObj' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        // 1. Insert into D1 queue
        const cmtId = `cmt-${postId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        await env.EXAM_DB.prepare(
          `INSERT INTO feed_comments_queue (id, post_id, comment_data, synced, created_at) VALUES (?, ?, ?, 0, ?)`
        ).bind(cmtId, String(postId), JSON.stringify(commentObj), new Date().toISOString()).run();

        // 2. Realtime KV Update
        const kvData = await env.CACHE_KV?.get('sync_all_data', 'json').catch(() => null);
        let finalComments = [];
        if (kvData) {
          if (!kvData.feed_posts) kvData.feed_posts = [];
          const postIdx = kvData.feed_posts.findIndex(p => String(p.id) === String(postId));
          if (postIdx !== -1) {
            let comments = kvData.feed_posts[postIdx].comments;
            if (typeof comments === 'string') {
              try { comments = JSON.parse(comments); } catch(e) { comments = []; }
            }
            if (!Array.isArray(comments)) comments = [];
            comments.push(commentObj);
            kvData.feed_posts[postIdx].comments = comments;
            finalComments = comments;

            const newTimestamp = new Date().toISOString();
            kvData.masterLastUpdated = newTimestamp;
            await Promise.all([
              env.CACHE_KV?.put('sync_all_data', JSON.stringify(kvData)),
              env.CACHE_KV?.put('last_sync_timestamp', newTimestamp),
              env.CACHE_KV?.put('last_updated_by', 'feed-comment-action')
            ]);
          }
        }

        return new Response(JSON.stringify({ success: true, comments: finalComments }), {
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

        const kvData = await env.CACHE_KV?.get('sync_all_data', 'json').catch(() => null) || {};
        let list = kvData[table] || [];

        // ★ Answer Key Separation: live_exams INSERT/UPDATE হলে answer key আলাদা করে KV-তে সেভ
        let processedRecord = record;
        if (table === 'live_exams' && record && (type === 'INSERT' || type === 'UPDATE')) {
          if (record.questions && Array.isArray(record.questions) && record.questions.length > 0) {
            // Answer Key আলাদা করে KV-তে সেভ (শুধু Worker পড়তে পারবে)
            const answerKey = record.questions.map((q, i) => ({
              index: i,
              correctIndex: q.correctIndex,
              explanation: q.explanation || ''
            }));
            await env.CACHE_KV?.put(`answer_key_${record.id}`, JSON.stringify(answerKey));
            console.log(`🔐 Answer key saved for exam ${record.id} (${answerKey.length} questions)`);

            // Questions থেকে correctIndex মুছে দাও (শিক্ষার্থী দেখতে পারবে না!)
            processedRecord = {
              ...record,
              questions: record.questions.map(q => {
                const { correctIndex, explanation, ...safeQ } = q;
                return safeQ;
              })
            };
          }
        }

        if (type === 'DELETE') {
          const deleteId = old_record?.id || record?.id;
          list = list.filter(item => item.id !== deleteId);
          // live_exams ডিলিট হলে answer key ও মুছো
          if (table === 'live_exams' && deleteId) {
            ctx.waitUntil(env.CACHE_KV?.delete(`answer_key_${deleteId}`).catch(() => {}));
          }
        } else {
          // INSERT or UPDATE — processedRecord ব্যবহার করো (correctIndex বাদ)
          list = [
            processedRecord,
            ...list.filter(item => item.id !== processedRecord.id)
          ];
        }

        kvData[table] = list;
        const newTimestamp = new Date().toISOString();
        kvData.masterLastUpdated = newTimestamp;

        const updatePromises = [
          env.CACHE_KV?.put('sync_all_data', JSON.stringify(kvData)),
          env.CACHE_KV?.put('last_sync_timestamp', newTimestamp),
          env.CACHE_KV?.put('last_updated_by', 'supabase-webhook')
        ];

        await Promise.all(updatePromises);

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

    // Rule 10: /sync-all -> KV (0 Supabase!) + Answer Keys stripped
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
        // ★ live_exams থেকে correctIndex বাদ দিয়ে পাঠাও (নিরাপত্তা)
        const safeData = { ...kvData };
        if (safeData.live_exams) {
          safeData.live_exams = stripAnswerKeys(safeData.live_exams);
        }
        return new Response(JSON.stringify(safeData), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Last-Modified': kvData.masterLastUpdated || new Date().toISOString(), 'X-Edge-Cache': 'KV-HIT', 'X-Supabase-Queries': '0' } });
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
      const bootstrapPayload = {};
      CORE_COLLECTIONS.forEach((col, i) => { bootstrapPayload[col] = results[i]; });

      // ★ Bootstrap-এ live_exams এর answer key আলাদা করে সেভ
      if (bootstrapPayload.live_exams?.length) {
        for (const exam of bootstrapPayload.live_exams) {
          if (exam.questions?.length) {
            const answerKey = exam.questions.map((q, idx) => ({
              index: idx,
              correctIndex: q.correctIndex,
              explanation: q.explanation || ''
            }));
            await env.CACHE_KV?.put(`answer_key_${exam.id}`, JSON.stringify(answerKey));
          }
        }
        // KV-তে সেভ করার আগে correctIndex বাদ দাও
        bootstrapPayload.live_exams = stripAnswerKeys(bootstrapPayload.live_exams);
      }

      bootstrapPayload.masterLastUpdated = masterLastUpdated;
      bootstrapPayload.syncedAt = masterLastUpdated;
      ctx.waitUntil(Promise.all([
        env.CACHE_KV?.put('sync_all_data', JSON.stringify(bootstrapPayload)),
        env.CACHE_KV?.put('last_sync_timestamp', masterLastUpdated)
      ]));

      // ★ Response-এও correctIndex বাদ দিয়ে পাঠাও
      return new Response(JSON.stringify(bootstrapPayload), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Last-Modified': masterLastUpdated, 'X-Edge-Cache': 'KV-MISS-SUPABASE-BOOTSTRAP' } });
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

      const kvKey = `leaderboard_${examId}`;
      const cachedBoard = await env.CACHE_KV?.get(kvKey, 'json').catch(() => null);
      if (cachedBoard) {
        return new Response(JSON.stringify(cachedBoard), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=60', 'X-Edge-Cache': 'KV-HIT', 'X-Supabase-Queries': '0' } });
      }

      // ★ KV miss → D1 থেকে লিডারবোর্ড তৈরি করো (সুপাবেসে ০ রিকোয়েস্ট!)
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

        ctx.waitUntil(env.CACHE_KV?.put(kvKey, JSON.stringify(leaderboard), { expirationTtl: 3600 }));
        return new Response(JSON.stringify(leaderboard), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'X-Edge-Cache': 'D1-CALCULATED', 'X-Supabase-Queries': '0' } });
      } catch (d1Err) {
        console.error('D1 leaderboard error, falling back to Supabase:', d1Err);
        // D1 ফেইল হলে সুপাবেস ফলব্যাক
        const lbTarget = examId !== 'global'
          ? `${SUPABASE_ORIGIN}/rest/v1/activities?select=*&type=eq.live_exam_submission&examId=eq.${examId}&order=score.desc,timeTakenSec.asc&limit=100`
          : `${SUPABASE_ORIGIN}/rest/v1/activities?select=*&type=eq.live_exam_submission&order=score.desc,timeTakenSec.asc&limit=100`;
        const lbData = await fetch(lbTarget, { headers: originHeaders }).then(r => r.ok ? r.json() : []).catch(() => []);
        ctx.waitUntil(env.CACHE_KV?.put(kvKey, JSON.stringify(lbData), { expirationTtl: 3600 }));
        return new Response(JSON.stringify(lbData), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'X-Edge-Cache': 'SUPABASE-FALLBACK' } });
      }
    }

    // Legacy: /live-exam-submit -> redirect to /exam-submit
    if (url.pathname === '/live-exam-submit' ||
       ((url.pathname.includes('user_exam_submissions') || url.pathname.includes('activities')) &&
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

    // STRICT GET CACHE LOCK
    if (request.method === 'GET' && CORE_COLLECTIONS.includes(targetTable)) {
      return new Response(JSON.stringify({
        error: `Strict GET Cache Lock: Direct GET queries to core table "${targetTable}" are blocked. Please use /sync-all endpoint.`,
        url: url.pathname + url.search
      }), { status: 403, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    // Standard REST Proxy Passthrough
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

    // ══════════ Incremental KV Sync (unchanged) ══════════
    const controlRes = await fetch(
      `${SUPABASE_ORIGIN}/rest/v1/app_sync_control?select=last_updated,updated_by&id=eq.1`,
      { headers: h }
    ).catch(() => null);
    if (!controlRes?.ok) return;
    const [row] = await controlRes.json().catch(() => []);
    if (!row?.last_updated) return;

    const cachedTs = await env.CACHE_KV?.get('last_sync_timestamp').catch(() => null);
    if (cachedTs === row.last_updated) {
      console.log('Cron: No KV change. Fresh. 0 extra queries.');
      return;
    }

    const sinceTs = cachedTs || '1970-01-01T00:00:00Z';
    const existingData = await env.CACHE_KV?.get('sync_all_data', 'json').catch(() => null) || {};
    console.log(`Cron: Incremental sync since ${sinceTs}`);

    for (const col of CORE_COLLECTIONS) {
      const queryUrl = (col === 'questions' || col === 'notifications' || col === 'admits')
        ? `${SUPABASE_ORIGIN}/rest/v1/${col}?select=*&createdAt=gt.${sinceTs}&order=createdAt.desc&limit=1000`
        : `${SUPABASE_ORIGIN}/rest/v1/${col}?select=*&updatedAt=gt.${sinceTs}&order=updatedAt.desc`;

      const newRows = await fetch(queryUrl, { headers: h })
        .then(r => r.ok ? r.json() : []).catch(() => []);

      if (newRows.length === 0) continue;

      const existing = existingData[col] || [];
      const newIds = new Set(newRows.map(r => r.id));
      existingData[col] = [...newRows, ...existing.filter(r => !newIds.has(r.id))];

      // ★ live_exams sync-এও answer key strip করো
      if (col === 'live_exams') {
        for (const exam of newRows) {
          if (exam.questions?.length) {
            const answerKey = exam.questions.map((q, idx) => ({
              index: idx, correctIndex: q.correctIndex, explanation: q.explanation || ''
            }));
            await env.CACHE_KV?.put(`answer_key_${exam.id}`, JSON.stringify(answerKey));
          }
        }
        existingData[col] = stripAnswerKeys(existingData[col]);
      }
    }

    existingData.masterLastUpdated = row.last_updated;
    existingData.syncedAt = row.last_updated;

    await Promise.all([
      env.CACHE_KV?.put('sync_all_data', JSON.stringify(existingData)),
      env.CACHE_KV?.put('last_sync_timestamp', row.last_updated),
      env.CACHE_KV?.put('last_updated_by', row.updated_by || 'system')
    ]).catch(e => console.error('KV put error:', e));

    console.log('Cron: Incremental sync complete!');
  },
};
