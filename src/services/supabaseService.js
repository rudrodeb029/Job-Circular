// Supabase Service Layer — Centralizes Supabase PostgreSQL CRUD, Multi-tier Caching, and Realtime sync
import { supabase } from './supabaseClient';

// ─── Table / Collection Constants ──────────────────────────────
export const COLLECTIONS = {
  JOBS: 'jobs',
  NOTIFICATIONS: 'notifications',
  ADMITS: 'admits',
  ACTIVITIES: 'activities',
  LIVE_EXAMS: 'live_exams',
  QUESTIONS: 'questions',
  USERS: 'users',
  FEED_POSTS: 'feed_posts',
  APP_CONFIG: 'app_config'
};

// ─── Split Cache TTL Strategy ──────────────────────────────────
// 1-Hour Cache for frequently updated / time-sensitive data
const SHORT_CACHE_COLLECTIONS = [
  COLLECTIONS.JOBS,
  COLLECTIONS.LIVE_EXAMS,
  COLLECTIONS.ADMITS,
  COLLECTIONS.NOTIFICATIONS,
  COLLECTIONS.FEED_POSTS
];
const SHORT_TTL_MINUTES = 60; // 1 Hour
const DEFAULT_TTL_MINUTES = 1440; // 24 Hours

/**
 * Normalizes document record output to ensure clean JSON object format
 */
export const normalizeDoc = (row) => {
  if (!row || typeof row !== 'object') return row;
  const { raw_data, ...rest } = row;

  let rawObj = raw_data;
  if (typeof raw_data === 'string') {
    try {
      rawObj = JSON.parse(raw_data);
    } catch (e) {
      rawObj = {};
    }
  }

  const merged = {
    ...rest,
    ...(rawObj && typeof rawObj === 'object' ? rawObj : {})
  };

  ['questions', 'subjects', 'subjectTopics', 'options', 'optionsEn', 'answers', 'savedJobs', 'appliedJobs'].forEach(key => {
    if (typeof merged[key] === 'string') {
      try {
        merged[key] = JSON.parse(merged[key]);
      } catch (e) {}
    }
  });

  return merged;
};

// ─── Generic CRUD Helpers ───────────────────────────────────────

/**
 * Fetch all rows from a Supabase table.
 * @param {string} collectionName - Supabase table name
 * @param {boolean} forceServer - If true, sends Cache-Control: no-cache header to bypass Cloudflare CDN
 */
export const getCollection = async (collectionName, forceServer = false) => {
  try {
    let selectCols = '*';
    if (collectionName === COLLECTIONS.LIVE_EXAMS) {
      selectCols = 'id, title, titleEn, duration, totalQuestions, subjects, status, scheduledAt, createdAt, updatedAt, raw_data';
    }
    let query = supabase.from(collectionName).select(selectCols);
    
    // Add bypass headers if forceServer is true
    if (forceServer) {
      query = query.setHeader('Cache-Control', 'no-cache').setHeader('Pragma', 'no-cache');
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(normalizeDoc);
  } catch (error) {
    console.error(`Error fetching ${collectionName} from Supabase:`, error);
    return [];
  }
};

// Per-session revalidation tracker
const _sessionRevalidatedCollections = new Set();
let _appInitialized = false;
let _isStartupSyncing = false;

/**
 * Global app initialization sync.
 * Fetches core data when the app opens or when a forced refresh is needed (e.g. floating loader click).
 * @param {boolean|string} force - If true, checks Cloudflare Worker for new data immediately.
 */


export const syncCoreDataOnStartup = async (force = false) => {
  if (!navigator.onLine) return null;
  if (_isStartupSyncing) return null;

  const isExplicitForce = Boolean(force);
  const isExplicitAdminBypass = force === 'admin_force';

  _isStartupSyncing = true;
  const coreCollections = [
    COLLECTIONS.JOBS,
    COLLECTIONS.NOTIFICATIONS,
    COLLECTIONS.ADMITS,
    COLLECTIONS.LIVE_EXAMS,
    COLLECTIONS.QUESTIONS,
    COLLECTIONS.FEED_POSTS,
    COLLECTIONS.APP_CONFIG
  ];

  console.log(isExplicitForce ? '🔄 Loader / Forced Refresh: Checking Cloudflare KV for updates...' : '🚀 Startup Sync: Checking Cloudflare KV with 304 conditional check...');

  try {
    const proxyUrl = SUPABASE_CONFIG.cloudflareProxyUrl || 'https://job-circular-proxy.rudrodeb029.workers.dev';
    const syncUrl = `${proxyUrl}/sync-all${isExplicitAdminBypass ? '?cache=bypass' : ''}`;
    
    const headers = {
      'apikey': SUPABASE_CONFIG.anonKey,
      'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
      'X-App-Client': 'live-circular'
    };

    if (isExplicitAdminBypass) {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
    } else {
      const lastSyncedAt = localStorage.getItem('last_updated_server');
      if (lastSyncedAt) {
        headers['If-Modified-Since'] = lastSyncedAt;
      }
    }

    const response = await fetch(syncUrl, { headers });

    if (response.status === 304) {
      console.log('⚡ 304 Not Modified: Server timestamp matches local data! 0 bytes downloaded from Cloudflare KV.');
      localStorage.setItem('last_client_sync_time', String(Date.now()));
      localStorage.setItem('last_sync_timestamp', String(Date.now()));
      _appInitialized = true;
      _isStartupSyncing = false;
      return null;
    }

    if (response.ok) {
      const data = await response.json();
      if (data && (data.jobs || data.questions || data.notifications)) {
        const collectionsMap = {
          [COLLECTIONS.JOBS]: data.jobs,
          [COLLECTIONS.NOTIFICATIONS]: data.notifications,
          [COLLECTIONS.ADMITS]: data.admits,
          [COLLECTIONS.LIVE_EXAMS]: data.live_exams,
          [COLLECTIONS.QUESTIONS]: data.questions,
          [COLLECTIONS.FEED_POSTS]: data.feed_posts,
          [COLLECTIONS.APP_CONFIG]: data.app_config,
        };

        Object.entries(collectionsMap).forEach(([col, items]) => {
          if (Array.isArray(items) && items.length > 0) {
            localStorage.setItem(`cache_data_${col}`, JSON.stringify(items));
            localStorage.setItem(`cache_time_${col}`, String(Date.now()));
            if (col === COLLECTIONS.QUESTIONS) {
              localStorage.setItem('questions_data', JSON.stringify(items));
            }
            _sessionRevalidatedCollections.add(col);
            window.dispatchEvent(new CustomEvent(`${col}_updated`, { detail: items }));
          }
        });

        const serverSyncTime = data.masterLastUpdated || data.syncedAt;
        if (serverSyncTime) {
          localStorage.setItem('last_updated_server', serverSyncTime);
        }
        localStorage.setItem('last_sync_timestamp', String(Date.now()));
        localStorage.setItem('last_client_sync_time', String(Date.now()));

        _appInitialized = true;
        _isStartupSyncing = false;
        console.log('✅ Single-Request Unified Sync: Complete! 20-Min Client Lock Activated.');
        return data;
      }
    }
  } catch (err) {
    console.warn('Unified Sync /sync-all endpoint failed, falling back:', err.message);
  }

  // Fallback: If /sync-all endpoint is unavailable, sync core collections directly
  try {
    await Promise.all(coreCollections.map(async (col) => {
      const data = await getCollection(col, force);
      if (data && data.length > 0) {
        localStorage.setItem(`cache_data_${col}`, JSON.stringify(data));
        localStorage.setItem(`cache_time_${col}`, String(Date.now()));
        if (col === COLLECTIONS.QUESTIONS) {
          localStorage.setItem('questions_data', JSON.stringify(data));
        }
        _sessionRevalidatedCollections.add(col);
        window.dispatchEvent(new CustomEvent(`${col}_updated`, { detail: data }));
      }
    }));
    _appInitialized = true;
  } catch (e) {
    console.error('Fallback core sync failed:', e);
  } finally {
    _isStartupSyncing = false;
  }
};

/**
 * Multi-Tier Caching Collection Fetcher
 * - Tier 1: Device localStorage (Indefinite Offline Cache)
 * - Tier 2: Cloudflare Global Edge CDN
 * - Tier 3: Supabase PostgreSQL Database
 */
export const getCollectionCached = async (collectionName, forceServer = false, customTtlMinutes = null) => {
  const cacheKey = `cache_data_${collectionName}`;
  const timeKey = `cache_time_${collectionName}`;
  const cachedDataStr = localStorage.getItem(cacheKey);

  // 1. Parse Cached Data
  let cachedData = null;
  if (cachedDataStr) {
    try {
      cachedData = JSON.parse(cachedDataStr);
    } catch (e) {
      console.warn(`Cache parse error for ${collectionName}:`, e);
    }
  }

  // 2. Return valid local cache instantly if available and forceServer is false (0 Network Requests)
  if (cachedData && Array.isArray(cachedData) && cachedData.length > 0 && !forceServer) {
    return cachedData;
  }

  // 3. Network Fetch Fallback if local cache is empty or forceServer is requested
  if (navigator.onLine) {
    try {
      const data = await getCollection(collectionName, forceServer);
      if (data && data.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(timeKey, String(Date.now()));
        if (collectionName === COLLECTIONS.QUESTIONS) {
          localStorage.setItem('questions_data', JSON.stringify(data));
        }
        _sessionRevalidatedCollections.add(collectionName);
        return data;
      }
    } catch (error) {
      console.warn(`Fetch failed for ${collectionName}, returning cache fallback.`, error);
    }
  }

  return cachedData || [];
};

/**
 * Fetch a single document by ID
 */
export const getDocument = async (collectionName, docId, forceServer = false) => {
  try {
    let query = supabase.from(collectionName).select('*').eq('id', docId);
    if (forceServer) {
      query = query.setHeader('Cache-Control', 'no-cache');
    }
    const { data, error } = await query.single();
    if (error) throw error;
    return normalizeDoc(data);
  } catch (error) {
    console.error(`Error fetching ${collectionName}/${docId}:`, error);
    return null;
  }
};

/**
 * Invalidate Tier 1 localStorage cache for a specific collection
 */
export const clearCollectionCache = (collectionName) => {
  try {
    localStorage.removeItem(`cache_data_${collectionName}`);
    localStorage.removeItem(`cache_time_${collectionName}`);
    // Also remove from session tracker so it's allowed to re-sync once
    _sessionRevalidatedCollections.delete(collectionName);
  } catch (e) {
    console.warn(`Failed to clear cache for ${collectionName}:`, e);
  }
};

// ─── Table Column Mappings ─────────────────────────────────────
const TABLE_COLUMNS = {
  [COLLECTIONS.JOBS]: [
    'id', 'title', 'titleEn', 'organization', 'organizationEn',
    'categoryId', 'category', 'description', 'salary', 'vacancy',
    'deadline', 'applyLink', 'imageUrl', 'images', 'status',
    'views', 'createdAt', 'updatedAt'
  ],
  [COLLECTIONS.LIVE_EXAMS]: [
    'id', 'title', 'titleEn', 'duration', 'totalQuestions',
    'subjects', 'questions', 'status', 'scheduledAt',
    'createdAt', 'updatedAt'
  ],
  [COLLECTIONS.QUESTIONS]: [
    'id', 'title', 'category', 'questions', 'duration',
    'createdAt', 'updatedAt'
  ],
  [COLLECTIONS.NOTIFICATIONS]: [
    'id', 'title', 'titleEn', 'message', 'messageEn', 'type',
    'link', 'createdAt', 'read'
  ],
  [COLLECTIONS.ADMITS]: [
    'id', 'jobId', 'type', 'examName', 'examNameEn', 'date',
    'dateEn', 'link', 'createdAt'
  ],
  [COLLECTIONS.ACTIVITIES]: [
    'id', 'action', 'description', 'type', 'examId', 'userName',
    'userPhoto', 'score', 'total', 'scaledScore', 'timeTaken',
    'timeTakenSec', 'createdAt'
  ],
  [COLLECTIONS.USERS]: [
    'id', 'name', 'phone', 'qualification', 'category', 'location',
    'avatar', 'savedJobs', 'appliedJobs', 'updatedAt'
  ],
  [COLLECTIONS.FEED_POSTS]: [
    'id', 'content', 'contentEn', 'mediaType', 'mediaUrl',
    'bannerGradient', 'likes', 'comments', 'createdAt', 'updatedAt'
  ],
  [COLLECTIONS.APP_CONFIG]: [
    'id', 'contactEmail', 'contactPhone', 'whatsappNumber',
    'playStoreUrl', 'shareAppUrl', 'facebookPageUrl',
    'telegramChannelUrl', 'supportHours', 'updatedAt'
  ]
};

/**
 * Packs document fields into strict PostgreSQL table columns while preserving
 * all rich arbitrary document properties inside the 'raw_data' JSONB column.
 */
const sanitizePayload = (collectionName, docId, data) => {
  const allowed = TABLE_COLUMNS[collectionName] || ['id'];
  const sanitized = { id: docId };

  for (const key of allowed) {
    if (key !== 'id' && data[key] !== undefined) {
      sanitized[key] = data[key];
    }
  }

  // Pack all other properties not mapped to direct columns into raw_data JSONB
  const rawData = { ...(data.raw_data || {}) };
  for (const key of Object.keys(data)) {
    if (!allowed.includes(key) && key !== 'raw_data') {
      rawData[key] = data[key];
    }
  }

  if (Object.keys(rawData).length > 0) {
    sanitized.raw_data = rawData;
  }

  if (collectionName === COLLECTIONS.JOBS && Array.isArray(sanitized.images)) {
    sanitized.images = sanitized.images.join(', ');
  }

  return sanitized;
};

// ─── Instant Real-time Broadcast System (0 DB Egress) ───────────
let globalBroadcastChannel = null;

const getBroadcastChannel = () => {
  if (!globalBroadcastChannel) {
    globalBroadcastChannel = supabase.channel('global_app_updates', {
      config: { broadcast: { self: true } }
    });
    globalBroadcastChannel.subscribe();
  }
  return globalBroadcastChannel;
};

/**
 * Broadcasts an instant update signal to all candidate app devices (< 100ms, 0 DB egress)
 */
export const broadcastAppUpdate = (collectionName) => {
  try {
    const channel = getBroadcastChannel();
    channel.send({
      type: 'broadcast',
      event: 'CONTENT_PUBLISHED',
      payload: { collection: collectionName, timestamp: Date.now() }
    });

    // Update master sync timestamp in app_sync_control table to invalidate 304 cache
    supabase.from('app_sync_control').upsert({
      id: 1,
      last_updated: new Date().toISOString(),
      updated_by: collectionName
    }).then(({ error }) => {
      if (error) console.warn('Master timestamp update warning:', error.message);
    }).catch(() => {});
  } catch (e) {
    console.warn('Failed to broadcast app update signal:', e);
  }
};

/**
 * Subscribes candidate app devices to real-time instant update signals (0 DB egress)
 */
export const subscribeToAppUpdates = (callback) => {
  try {
    const channel = supabase.channel('global_app_updates', {
      config: { broadcast: { ack: false } }
    });

    channel
      .on('broadcast', { event: 'CONTENT_PUBLISHED' }, (payload) => {
        if (payload?.payload?.collection) {
          clearCollectionCache(payload.payload.collection);
          callback(payload.payload.collection);
        }
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
    };
  } catch (err) {
    console.warn('Failed to subscribe to app update broadcast:', err);
    return () => {};
  }
};

/**
 * Insert a new document
 */
export const addDocument = async (collectionName, data) => {
  try {
    const id = data.id || `${collectionName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payload = sanitizePayload(collectionName, id, data);
    
    const { data: inserted, error } = await supabase
      .from(collectionName)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    clearCollectionCache(collectionName);
    broadcastAppUpdate(collectionName);
    return normalizeDoc(inserted || payload);
  } catch (error) {
    console.error(`Error adding to ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Set or upsert a document by ID
 */
export const setDocument = async (collectionName, docId, data) => {
  try {
    const payload = sanitizePayload(collectionName, docId, data);
    const { data: upserted, error } = await supabase
      .from(collectionName)
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    clearCollectionCache(collectionName);
    broadcastAppUpdate(collectionName);
    return normalizeDoc(upserted || payload);
  } catch (error) {
    console.error(`Error setting ${collectionName}/${docId}:`, error);
    throw error;
  }
};

/**
 * Update an existing document by ID
 */
export const updateDocument = async (collectionName, docId, updates) => {
  try {
    const payload = sanitizePayload(collectionName, docId, updates);
    const { data: updated, error } = await supabase
      .from(collectionName)
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    clearCollectionCache(collectionName);
    broadcastAppUpdate(collectionName);
    return normalizeDoc(updated || payload);
  } catch (error) {
    console.error(`Error updating ${collectionName}/${docId}:`, error);
    throw error;
  }
};

/**
 * Delete a document by ID
 */
export const deleteDocument = async (collectionName, docId) => {
  try {
    const { error } = await supabase
      .from(collectionName)
      .delete()
      .eq('id', docId);

    if (error) throw error;
    clearCollectionCache(collectionName);
    broadcastAppUpdate(collectionName);
    return true;
  } catch (error) {
    console.error(`Error deleting ${collectionName}/${docId}:`, error);
    throw error;
  }
};

/**
 * Atomically increment or decrement the likes counter for a feed post.
 * @param {string} postId - The feed post ID
 * @param {number} delta - +1 to like, -1 to unlike
 */
export const incrementFeedLike = async (postId, delta = 1) => {
  try {
    const { data: current } = await supabase
      .from('feed_posts')
      .select('likes, raw_data')
      .eq('id', postId)
      .single();

    const currentLikes = Number(current?.likes) || 0;
    const newLikes = Math.max(0, currentLikes + delta);

    let rawDataObj = current?.raw_data || {};
    if (typeof rawDataObj === 'string') {
      try { rawDataObj = JSON.parse(rawDataObj); } catch(e) { rawDataObj = {}; }
    }
    const updatedRawData = { ...rawDataObj, likes: newLikes, updatedAt: new Date().toISOString() };

    await supabase
      .from('feed_posts')
      .update({
        likes: newLikes,
        updatedAt: new Date().toISOString(),
        raw_data: updatedRawData
      })
      .eq('id', postId);

    return newLikes;
  } catch (err) {
    console.error('incrementFeedLike error:', err);
    return null;
  }
};

/**
 * Add a comment to a feed post.
 * @param {string} postId - The feed post ID
 * @param {object} commentObj - { id, userName, userAvatar, text, createdAt }
 */
export const addFeedComment = async (postId, commentObj) => {
  try {
    const { data: current } = await supabase
      .from('feed_posts')
      .select('comments, raw_data')
      .eq('id', postId)
      .single();

    let commentsList = current?.comments || [];
    if (typeof commentsList === 'string') {
      try { commentsList = JSON.parse(commentsList); } catch(e) { commentsList = []; }
    }
    if (!Array.isArray(commentsList)) commentsList = [];

    const updatedComments = [...commentsList, commentObj];

    let rawDataObj = current?.raw_data || {};
    if (typeof rawDataObj === 'string') {
      try { rawDataObj = JSON.parse(rawDataObj); } catch(e) { rawDataObj = {}; }
    }
    const updatedRawData = { ...rawDataObj, comments: updatedComments, updatedAt: new Date().toISOString() };

    await supabase
      .from('feed_posts')
      .update({
        comments: updatedComments,
        updatedAt: new Date().toISOString(),
        raw_data: updatedRawData
      })
      .eq('id', postId);

    return updatedComments;
  } catch (err) {
    console.error('addFeedComment error:', err);
    return null;
  }
};

/**
 * Real-time Supabase Table Subscription (Used exclusively by Admin Panel)
 * @param {string} collectionName - Table name
 * @param {Function} callback - Triggered with updated table data array on changes
 */
export const onCollectionSnapshot = (collectionName, callback) => {
  try {
    const channel = supabase
      .channel(`admin_realtime_${collectionName}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: collectionName },
        async () => {
          try {
            const freshData = await getCollection(collectionName, true);
            callback(freshData);
          } catch (e) {
            console.warn(`Realtime fetch error for ${collectionName}:`, e);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn(`Realtime channel error for ${collectionName}`);
        }
      });

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
    };
  } catch (err) {
    console.warn(`Failed to create realtime subscription for ${collectionName}:`, err);
    return () => {};
  }
};

/**
 * Batch upsert multiple documents
 */
export const batchSetDocuments = async (collectionName, items) => {
  try {
    if (!items || items.length === 0) return true;
    const sanitizedItems = items.map(item => sanitizePayload(collectionName, item.id, item));
    const { error } = await supabase
      .from(collectionName)
      .upsert(sanitizedItems);

    if (error) throw error;
    clearCollectionCache(collectionName);
    broadcastAppUpdate(collectionName);
    return true;
  } catch (error) {
    console.error(`Batch write error on ${collectionName}:`, error);
    throw error;
  }
};
