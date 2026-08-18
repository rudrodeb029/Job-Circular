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
  APP_CONFIG: 'app_config'
};

// ─── Split Cache TTL Strategy ──────────────────────────────────
// 1-Hour Cache for frequently updated / time-sensitive data
const SHORT_CACHE_COLLECTIONS = [
  COLLECTIONS.JOBS,
  COLLECTIONS.LIVE_EXAMS,
  COLLECTIONS.ADMITS,
  COLLECTIONS.NOTIFICATIONS
];
const SHORT_TTL_MINUTES = 60; // 1 Hour
const DEFAULT_TTL_MINUTES = 1440; // 24 Hours

/**
 * Normalizes document record output to ensure clean JSON object format
 */
const normalizeDoc = (row) => {
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
    let query = supabase.from(collectionName).select('*');
    
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

/**
 * Global app initialization sync.
 * Strictly fetches core data once when the app opens.
 */
export const syncCoreDataOnStartup = async () => {
  if (_appInitialized || !navigator.onLine) return;

  const coreCollections = [
    COLLECTIONS.JOBS,
    COLLECTIONS.NOTIFICATIONS,
    COLLECTIONS.ADMITS,
    COLLECTIONS.LIVE_EXAMS,
    COLLECTIONS.APP_CONFIG
  ];

  console.log('Strict Startup Sync: Fetching core data...');

  try {
    await Promise.all(coreCollections.map(async (col) => {
      const data = await getCollection(col, false);
      if (data && data.length > 0) {
        localStorage.setItem(`cache_data_${col}`, JSON.stringify(data));
        localStorage.setItem(`cache_time_${col}`, String(Date.now()));
        _sessionRevalidatedCollections.add(col);
      }
    }));
    _appInitialized = true;
    console.log('Strict Startup Sync: Complete.');
  } catch (err) {
    console.warn('Strict Startup Sync: Some collections failed to sync.', err.message);
  }
};

/**
 * Multi-Tier Caching Collection Fetcher
 * - Tier 1: Device localStorage (Indefinite Cache)
 * - Tier 2: Cloudflare Global Edge CDN (bypassed on forceServer=true)
 * - Tier 3: Supabase PostgreSQL Database
 * 
 * Strategy: RETURNS CACHE ONLY after the initial startup sync is done.
 */
export const getCollectionCached = async (collectionName, forceServer = false, customTtlMinutes = null) => {
  const cacheKey = `cache_data_${collectionName}`;
  const timeKey = `cache_time_${collectionName}`;
  const now = Date.now();
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

  // 2. Strict Revalidation Logic
  // We ONLY fetch from network IF:
  // - A manual Pull-to-Refresh is triggered (forceServer)
  // - There is NO cached data at all (first time install)
  // - It's a non-core collection that hasn't been synced this session yet (e.g. specific Questions category)
  const isCore = [COLLECTIONS.JOBS, COLLECTIONS.NOTIFICATIONS, COLLECTIONS.ADMITS, COLLECTIONS.LIVE_EXAMS].includes(collectionName);
  const needsInitialSync = !cachedData || !_sessionRevalidatedCollections.has(collectionName);

  if ((forceServer || needsInitialSync) && navigator.onLine) {
    try {
      const data = await getCollection(collectionName, forceServer);
      if (data && data.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(timeKey, String(now));
        _sessionRevalidatedCollections.add(collectionName);
        return data;
      }
    } catch (error) {
      console.warn(`Fetch failed for ${collectionName}, using cache.`);
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
  const sanitized = { id: docId, raw_data: { id: docId, ...data } };

  for (const key of allowed) {
    if (key !== 'id' && data[key] !== undefined) {
      sanitized[key] = data[key];
    }
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
  } catch (e) {
    console.warn('Failed to broadcast app update signal:', e);
  }
};

/**
 * Subscribes candidate app devices to real-time instant update signals (0 DB egress)
 */
export const subscribeToAppUpdates = (callback) => {
  try {
    const channel = supabase.channel(`client_broadcast_${Math.random().toString(36).substr(2, 5)}`, {
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
