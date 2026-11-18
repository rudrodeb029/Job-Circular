import { supabase, SUPABASE_CONFIG } from './supabaseClient';
import {
  setPersistentCollection,
  getPersistentCollection,
  deletePersistentCollection
} from './sqliteService';

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

// In-memory full collection cache (always holds non-stripped documents for current session)
const _memoryCollectionCache = new Map();

// Safe character threshold (~3MB UTF-16) above which heavy MCQ arrays are stripped from localStorage
const MAX_LOCALSTORAGE_CHARS = 1500000;

/**
 * Safely write a string key to localStorage without throwing QuotaExceededError.
 * Automatically evicts legacy duplicate `questions_data` key on quota pressure and retries once.
 */
const safeSetLocalStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    try {
      if (localStorage.getItem('questions_data') !== null) {
        localStorage.removeItem('questions_data');
        localStorage.setItem(key, value);
        return true;
      }
    } catch (retryErr) {
      console.warn(`⚠️ localStorage write failed for "${key}":`, retryErr?.message || retryErr);
      return false;
    }
    console.warn(`⚠️ localStorage write failed for "${key}":`, err?.message || err);
    return false;
  }
};

/**
 * Strip heavy `questions` MCQ arrays into lightweight metadata-only entries for localStorage.
 * Full documents with all MCQs are always stored in IndexedDB / native SQLite.
 */
const stripHeavyFieldsForLocalStorage = (collectionName, items) => {
  if (!Array.isArray(items)) return items;
  if (collectionName !== COLLECTIONS.QUESTIONS && collectionName !== COLLECTIONS.LIVE_EXAMS) {
    return items;
  }
  return items.map((item) => {
    if (!item || typeof item !== 'object' || !Array.isArray(item.questions)) return item;
    const { questions, ...meta } = item;
    return {
      ...meta,
      totalQuestions: item.totalQuestions ?? questions.length,
      _questionsStripped: true
    };
  });
};

/**
 * Safely mirror a collection into localStorage, stripping heavy `questions` arrays into
 * metadata-only if the full JSON exceeds quota or threshold. Never writes duplicate `questions_data`.
 */
const safeWriteCollectionToLocalStorage = (collectionName, items) => {
  const cacheKey = `cache_data_${collectionName}`;
  const timeKey = `cache_time_${collectionName}`;

  if (collectionName === COLLECTIONS.QUESTIONS) {
    try {
      localStorage.removeItem('questions_data');
    } catch (e) {}
  }

  let jsonStr = '';
  try {
    jsonStr = JSON.stringify(items);
  } catch (e) {
    return { ok: false, stripped: false };
  }

  const isHeavyCollection = collectionName === COLLECTIONS.QUESTIONS || collectionName === COLLECTIONS.LIVE_EXAMS;
  if (!isHeavyCollection || jsonStr.length <= MAX_LOCALSTORAGE_CHARS) {
    if (safeSetLocalStorageItem(cacheKey, jsonStr)) {
      safeSetLocalStorageItem(timeKey, String(Date.now()));
      return { ok: true, stripped: false };
    }
  }

  if (isHeavyCollection) {
    try {
      const strippedItems = stripHeavyFieldsForLocalStorage(collectionName, items);
      const strippedJson = JSON.stringify(strippedItems);
      if (safeSetLocalStorageItem(cacheKey, strippedJson)) {
        safeSetLocalStorageItem(timeKey, String(Date.now()));
        return { ok: true, stripped: true };
      }
    } catch (e) {}
  }

  return { ok: false, stripped: false };
};

/**
 * Persist full collection items to in-memory map, IndexedDB / native SQLite, and safe localStorage.
 * Returns true only if full (non-stripped) data was durably persisted to IndexedDB/SQLite or localStorage.
 */
const persistCollectionCache = async (collectionName, items) => {
  if (!Array.isArray(items)) return false;
  _memoryCollectionCache.set(collectionName, items);

  const persistentOk = await setPersistentCollection(collectionName, items);
  const localRes = safeWriteCollectionToLocalStorage(collectionName, items);

  return Boolean(persistentOk || (localRes.ok && !localRes.stripped));
};

/**
 * Expose synchronous in-memory collection cache (used by legacy sync accessors like questionsData.js).
 */
export const getMemoryCollectionCache = (collectionName) => {
  const cached = _memoryCollectionCache.get(collectionName);
  return Array.isArray(cached) ? cached : null;
};

/**
 * Async persistent cache reader for startup hydration (AdminContext, etc.).
 * Reads full documents from IndexedDB / native SQLite first, falling back to memory and localStorage.
 * @param {string} collectionName
 * @returns {Promise<Array>}
 */
export const getPersistentCache = async (collectionName) => {
  if (!collectionName) return [];

  try {
    const persistent = await getPersistentCollection(collectionName);
    if (Array.isArray(persistent)) {
      _memoryCollectionCache.set(collectionName, persistent);
      return persistent;
    }
  } catch (e) {
    console.warn(`getPersistentCache(${collectionName}) failed:`, e);
  }

  const mem = _memoryCollectionCache.get(collectionName);
  if (Array.isArray(mem)) {
    return mem;
  }

  try {
    const raw = localStorage.getItem(`cache_data_${collectionName}`)
      || (collectionName === COLLECTIONS.QUESTIONS ? localStorage.getItem('questions_data') : null);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const hasStripped = parsed.some((item) => item && item._questionsStripped);
        if (!hasStripped) {
          _memoryCollectionCache.set(collectionName, parsed);
          // Lazily migrate legacy full localStorage cache into IndexedDB/SQLite
          setPersistentCollection(collectionName, parsed).catch(() => {});
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn(`LocalStorage fallback parse error for ${collectionName}:`, e);
  }

  return [];
};

/**
 * Persist a collection array directly to the persistent cache (IndexedDB/SQLite + safe localStorage).
 */
export const setPersistentCache = async (collectionName, items) => {
  return persistCollectionCache(collectionName, items);
};

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

  ['questions', 'subjects', 'subjectTopics', 'options', 'optionsEn', 'answers', 'savedJobs', 'appliedJobs', 'unlockedExams', 'pointsHistory'].forEach(key => {
    if (typeof merged[key] === 'string') {
      try {
        merged[key] = JSON.parse(merged[key]);
      } catch (e) {}
    }
  });

  return merged;
};

// ─── Generic CRUD Helpers ───────────────────────────────────────

const _fetchCollectionStrict = async (collectionName, forceServer = false) => {
  let selectCols = '*';
  if (collectionName === COLLECTIONS.LIVE_EXAMS) {
    selectCols = 'id, title, titleEn, duration, totalQuestions, subjects, status, scheduledAt, createdAt, updatedAt, raw_data';
  }
  let query = supabase.from(collectionName).select(selectCols);

  if (collectionName === COLLECTIONS.QUESTIONS) {
    query = query.order('createdAt', { ascending: false }).limit(1000);
  }

  if (forceServer) {
    query = query.setHeader('Cache-Control', 'no-cache').setHeader('Pragma', 'no-cache');
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(normalizeDoc);
};

/**
 * Fetch all rows from a Supabase table.
 * @param {string} collectionName - Supabase table name
 * @param {boolean} forceServer - If true, sends Cache-Control: no-cache header to bypass Cloudflare CDN
 */
export const getCollection = async (collectionName, forceServer = false) => {
  try {
    return await _fetchCollectionStrict(collectionName, forceServer);
  } catch (error) {
    console.error(`Error fetching ${collectionName} from Supabase:`, error);
    return [];
  }
};

// Per-session revalidation tracker
const _sessionRevalidatedCollections = new Set();
let _appInitialized = false;
let _isStartupSyncing = false;
let _activeStartupSyncPromise = null;

/**
 * Global app initialization sync.
 * Fetches core data when the app opens or when a forced refresh is needed (e.g. floating loader click, pull-to-refresh, or push notification).
 * @param {boolean|string} forceServer - If true/'admin_force'/'push_force', bypasses cooldown & HTTP/KV cache and fetches fresh data immediately.
 */
export const syncCoreDataOnStartup = async (forceServer = false) => {
  if (!navigator.onLine) return null;

  const isExplicitBypass = forceServer === true || forceServer === 'admin_force' || forceServer === 'push_force' || Boolean(forceServer);

  // 30-minute client sync cooldown: If local data exists and was synced recently, skip network sync!
  const SYNC_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes
  const lastSync = Number(localStorage.getItem('last_client_sync_time') || 0);
  const hasLocalData = Boolean(
    localStorage.getItem('cache_data_jobs') ||
    localStorage.getItem('last_updated_server') ||
    _memoryCollectionCache.size > 0
  );

  if (!isExplicitBypass && hasLocalData && Date.now() - lastSync < SYNC_COOLDOWN_MS) {
    console.log(`⚡ SQLite/Local-First: Synced ${Math.round((Date.now() - lastSync) / 60000)}m ago. Serving 100% from local database (0 Cloudflare requests).`);
    _appInitialized = true;
    return null;
  }

  if (_isStartupSyncing && _activeStartupSyncPromise) {
    if (!isExplicitBypass) {
      return _activeStartupSyncPromise;
    }
    // For forced syncs, wait for in-flight sync then execute a fresh cache-bypass sync
    try {
      await _activeStartupSyncPromise;
    } catch (e) {}
  }

  let syncSuccess = false;
  _isStartupSyncing = true;
  window.dispatchEvent(new CustomEvent('app_sync_started'));
  const coreCollections = [
    COLLECTIONS.JOBS,
    COLLECTIONS.NOTIFICATIONS,
    COLLECTIONS.ADMITS,
    COLLECTIONS.LIVE_EXAMS,
    COLLECTIONS.QUESTIONS,
    COLLECTIONS.FEED_POSTS,
    COLLECTIONS.APP_CONFIG
  ];

  console.log(isExplicitBypass ? '🔄 Forced Refresh: Fetching fresh data from Cloudflare Worker (?cache=bypass)...' : '🚀 Startup Sync: Checking Cloudflare KV with 304 conditional check...');

  const runSync = async () => {
    try {
      const proxyUrl = SUPABASE_CONFIG.cloudflareProxyUrl || 'https://job-circular-proxy.rudrodeb029.workers.dev';
      const syncUrl = `${proxyUrl}/sync-all${isExplicitBypass ? `?cache=bypass&t=${Date.now()}` : ''}`;

      const headers = {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'X-App-Client': 'live-circular'
      };

      if (isExplicitBypass) {
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        headers['Pragma'] = 'no-cache';
      } else {
        const lastSyncedAt = localStorage.getItem('last_updated_server');
        if (lastSyncedAt) {
          headers['If-Modified-Since'] = lastSyncedAt;
        }
      }

      const response = await fetch(syncUrl, { headers, cache: isExplicitBypass ? 'no-store' : 'default' });

      if (!isExplicitBypass && response.status === 304) {
        console.log('⚡ 304 Not Modified: Server timestamp matches local data! 0 bytes downloaded from Cloudflare KV.');
        safeSetLocalStorageItem('last_client_sync_time', String(Date.now()));
        safeSetLocalStorageItem('last_sync_timestamp', String(Date.now()));
        _appInitialized = true;
        _isStartupSyncing = false;
        window.dispatchEvent(new CustomEvent('app_sync_finished'));
        return null;
      }

      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object' && coreCollections.some(col => Array.isArray(data[col]))) {
          const rawCollectionsMap = {
            [COLLECTIONS.JOBS]: data.jobs,
            [COLLECTIONS.NOTIFICATIONS]: data.notifications,
            [COLLECTIONS.ADMITS]: data.admits,
            [COLLECTIONS.LIVE_EXAMS]: data.live_exams,
            [COLLECTIONS.QUESTIONS]: data.questions,
            [COLLECTIONS.FEED_POSTS]: data.feed_posts,
            [COLLECTIONS.APP_CONFIG]: data.app_config,
          };

          const normalizedCollectionsMap = {};
          let persistedCount = 0;
          let allPersisted = true;

          await Promise.all(
            Object.entries(rawCollectionsMap).map(async ([col, items]) => {
              if (!Array.isArray(items)) return;
              const normalizedItems = items.map(normalizeDoc);
              normalizedCollectionsMap[col] = normalizedItems;

              const persisted = await persistCollectionCache(col, normalizedItems);
              if (persisted) {
                persistedCount += 1;
              } else {
                allPersisted = false;
              }

              _sessionRevalidatedCollections.add(col);
              window.dispatchEvent(new CustomEvent(`${col}_updated`, { detail: normalizedItems }));
            })
          );

          // NEVER update sync timestamps unless fetched data was actually persisted
          if (persistedCount > 0 && allPersisted) {
            const serverSyncTime = data.masterLastUpdated || data.syncedAt || new Date().toISOString();
            safeSetLocalStorageItem('last_updated_server', serverSyncTime);
            safeSetLocalStorageItem('last_sync_timestamp', String(Date.now()));
            safeSetLocalStorageItem('last_client_sync_time', String(Date.now()));
          } else {
            console.warn('⚠️ Skipping sync timestamp update because persistent storage failed for one or more collections.');
          }

          window.dispatchEvent(new CustomEvent('force_app_data_reload', {
            detail: {
              collections: normalizedCollectionsMap,
              forceServer: isExplicitBypass
            }
          }));

          _appInitialized = true;
          _isStartupSyncing = false;
          console.log('✅ Single-Request Unified Sync: Complete!');
          syncSuccess = true;
          window.dispatchEvent(new CustomEvent('app_sync_finished'));
          return data;
        } else {
          console.warn('⚠️ Unified Sync JSON response did not contain expected collections structure.', data);
        }
      } else {
        console.warn(`⚠️ Unified Sync /sync-all endpoint returned non-OK status: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Unified Sync /sync-all endpoint failed, falling back:', err.message || err);
    }

    // Fallback: If /sync-all endpoint is unavailable, sync core collections directly
    if (!syncSuccess) {
      console.warn('⚠️ Running direct GET fallback to Supabase because sync-all was unsuccessful or incomplete.');
      const fallbackCollectionsMap = {};
      let persistedCount = 0;
      let allPersisted = true;

      try {
        await Promise.all(coreCollections.map(async (col) => {
          try {
            const data = await _fetchCollectionStrict(col, true);
            if (Array.isArray(data)) {
              fallbackCollectionsMap[col] = data;
              const persisted = await persistCollectionCache(col, data);
              if (persisted) {
                persistedCount += 1;
              } else {
                allPersisted = false;
              }
              _sessionRevalidatedCollections.add(col);
              window.dispatchEvent(new CustomEvent(`${col}_updated`, { detail: data }));
            }
          } catch (colErr) {
            allPersisted = false;
            console.warn(`Fallback fetch failed for ${col}:`, colErr?.message || colErr);
          }
        }));

        if (persistedCount > 0 && allPersisted) {
          safeSetLocalStorageItem('last_updated_server', new Date().toISOString());
          safeSetLocalStorageItem('last_sync_timestamp', String(Date.now()));
          safeSetLocalStorageItem('last_client_sync_time', String(Date.now()));
        }
        _appInitialized = true;
      } catch (e) {
        console.error('Fallback core sync failed:', e);
      } finally {
        _isStartupSyncing = false;
        window.dispatchEvent(new CustomEvent('force_app_data_reload', {
          detail: {
            collections: fallbackCollectionsMap,
            forceServer: isExplicitBypass
          }
        }));
        window.dispatchEvent(new CustomEvent('app_sync_finished'));
      }

      if (Object.keys(fallbackCollectionsMap).length > 0) {
        return { ...fallbackCollectionsMap, syncedAt: new Date().toISOString() };
      }
    }
    return null;
  };

  _activeStartupSyncPromise = runSync().finally(() => {
    _isStartupSyncing = false;
    _activeStartupSyncPromise = null;
  });

  return _activeStartupSyncPromise;
};

/**
 * Multi-Tier Caching Collection Fetcher
 * - Tier 1: IndexedDB / Native SQLite + Memory + safe localStorage
 * - Tier 2: Cloudflare Global Edge CDN
 * - Tier 3: Supabase PostgreSQL Database
 */
export const getCollectionCached = async (collectionName, forceServer = false, customTtlMinutes = null) => {
  const cachedData = await getPersistentCache(collectionName);

  // Check optional custom TTL if caller explicitly provided one
  let isCustomTtlExpired = false;
  if (customTtlMinutes !== null && Number.isFinite(Number(customTtlMinutes))) {
    const cachedAt = Number(localStorage.getItem(`cache_time_${collectionName}`) || 0);
    if (!cachedAt || (Date.now() - cachedAt) >= Number(customTtlMinutes) * 60 * 1000) {
      isCustomTtlExpired = true;
    }
  }

  // 1. Return persistent local cache instantly if available, forceServer is false, and not expired
  if (!forceServer && !isCustomTtlExpired && Array.isArray(cachedData) && cachedData.length > 0) {
    return cachedData;
  }

  // 2. Network Fetch: When forceServer is true OR local cache is empty/expired
  if (navigator.onLine) {
    try {
      const data = await _fetchCollectionStrict(collectionName, true);
      if (Array.isArray(data) && (data.length > 0 || forceServer)) {
        await persistCollectionCache(collectionName, data);
        _sessionRevalidatedCollections.add(collectionName);
        return data;
      }
    } catch (error) {
      console.warn(`Network fetch failed for ${collectionName}, returning persistent cache fallback:`, error);
    }
  }

  return Array.isArray(cachedData) ? cachedData : [];
};

/**
 * Fetch a single document by ID
 */
export const getDocument = async (collectionName, docId, forceServer = false) => {
  try {
    let query = supabase.from(collectionName).select('*').eq('id', docId);
    if (forceServer) {
      query = query.setHeader('Cache-Control', 'no-cache').setHeader('Pragma', 'no-cache');
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
 * Invalidate Tier 1 cache (Memory, localStorage, IndexedDB & SQLite) for a specific collection
 */
export const clearCollectionCache = (collectionName) => {
  _memoryCollectionCache.delete(collectionName);
  try {
    localStorage.removeItem(`cache_data_${collectionName}`);
    localStorage.removeItem(`cache_time_${collectionName}`);
    if (collectionName === COLLECTIONS.QUESTIONS) {
      localStorage.removeItem('questions_data');
    }
    _sessionRevalidatedCollections.delete(collectionName);
  } catch (e) {
    console.warn(`Failed to clear cache for ${collectionName}:`, e);
  }
  return deletePersistentCollection(collectionName).catch(() => false);
};

// ─── Table Column Mappings ─────────────────────────────────────
const TABLE_COLUMNS = {
  [COLLECTIONS.JOBS]: [
    'id', 'title', 'titleEn', 'organization', 'organizationEn',
    'categoryId', 'category', 'description', 'salary', 'vacancy',
    'deadline', 'deadlineTime', 'examTime', 'resultDate', 'resultTime',
    'applyLink', 'imageUrl', 'images', 'status',
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
    'bannerGradient', 'likes', 'likedBy', 'comments', 'authorId', 'createdAt', 'updatedAt'
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

const KV_DEBOUNCE_MS = 300;
let _kvDebounceTimer = null;
let _kvInFlightPromise = null;
let _kvNeedsTrailingRun = false;
let _kvWaiters = [];

const _executeKvRefresh = async () => {
  const proxyUrl = SUPABASE_CONFIG.cloudflareProxyUrl || 'https://job-circular-proxy.rudrodeb029.workers.dev';
  try {
    const res = await fetch(`${proxyUrl}/sync-all?cache=bypass&t=${Date.now()}`, {
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'X-App-Client': 'live-circular-admin',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      cache: 'no-store',
      keepalive: true
    });
    if (res.ok) {
      console.log('⚡ Cloudflare KV cache successfully updated in realtime!');
      return true;
    }
    console.warn(`Failed to invalidate Cloudflare KV cache: HTTP ${res.status}`);
    return false;
  } catch (err) {
    console.warn('Failed to invalidate Cloudflare KV cache:', err);
    return false;
  }
};

const _flushKvInvalidation = async () => {
  if (_kvDebounceTimer) {
    clearTimeout(_kvDebounceTimer);
    _kvDebounceTimer = null;
  }

  if (_kvInFlightPromise) {
    _kvNeedsTrailingRun = true;
    return _kvInFlightPromise;
  }

  const batchWaiters = _kvWaiters;
  _kvWaiters = [];

  _kvInFlightPromise = (async () => {
    let ok = false;
    try {
      ok = await _executeKvRefresh();
      while (_kvNeedsTrailingRun) {
        _kvNeedsTrailingRun = false;
        ok = await _executeKvRefresh();
      }
    } finally {
      _kvInFlightPromise = null;
      const remainingWaiters = _kvWaiters;
      _kvWaiters = [];
      [...batchWaiters, ...remainingWaiters].forEach(resolve => {
        try { resolve(ok); } catch (e) {}
      });
    }
    return ok;
  })();

  return _kvInFlightPromise;
};

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    if (_kvDebounceTimer || _kvWaiters.length > 0) {
      _flushKvInvalidation();
    }
  });
}

/**
 * Reliably invalidate & refresh Cloudflare KV cache after admin mutations.
 * Batches synchronous/rapid edits in a 300ms window without losing trailing mutations,
 * uses keepalive: true, and returns a Promise that resolves once the refresh completes.
 */
const triggerKvCacheInvalidation = (collectionName = '', options = {}) => {
  // Skip KV invalidation for user-specific non-core tables (users, activities)
  if (collectionName === COLLECTIONS.USERS || collectionName === COLLECTIONS.ACTIVITIES) {
    return Promise.resolve(true);
  }

  if (options?.immediate) {
    return _flushKvInvalidation();
  }

  return new Promise((resolve) => {
    _kvWaiters.push(resolve);

    if (_kvInFlightPromise) {
      _kvNeedsTrailingRun = true;
      return;
    }

    if (_kvDebounceTimer) {
      clearTimeout(_kvDebounceTimer);
    }

    _kvDebounceTimer = setTimeout(() => {
      _kvDebounceTimer = null;
      console.log('⚡ Admin change detected: Invalidating & refreshing Cloudflare KV cache...');
      _flushKvInvalidation();
    }, KV_DEBOUNCE_MS);
  });
};

/**
 * Insert a new document
 */
export const addDocument = async (collectionName, data) => {
  try {
    const id = data.id || `${collectionName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const nowIso = new Date().toISOString();
    const dataWithTimestamps = {
      ...data,
      createdAt: data.createdAt || nowIso,
      updatedAt: data.updatedAt || nowIso
    };
    const payload = sanitizePayload(collectionName, id, dataWithTimestamps);
    
    const { data: inserted, error } = await supabase
      .from(collectionName)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    
    const rawNormalized = normalizeDoc(inserted || payload);
    const normalized = {
      ...rawNormalized,
      createdAt: rawNormalized.createdAt || dataWithTimestamps.createdAt,
      updatedAt: rawNormalized.updatedAt || dataWithTimestamps.updatedAt
    };

    try {
      const existing = await getPersistentCache(collectionName);
      const updated = [normalized, ...(Array.isArray(existing) ? existing.filter(item => String(item.id) !== String(id)) : [])];
      await persistCollectionCache(collectionName, updated);
    } catch (e) {}

    _sessionRevalidatedCollections.delete(collectionName);
    await triggerKvCacheInvalidation(collectionName);

    return normalized;
  } catch (error) {
    console.error(`Error adding to ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Set or upsert a document by ID (always preserves/sets updatedAt)
 */
export const setDocument = async (collectionName, docId, data) => {
  try {
    const nowIso = new Date().toISOString();
    const dataWithTimestamps = {
      ...(data || {}),
      updatedAt: (data && data.updatedAt) ? data.updatedAt : nowIso
    };
    const payload = sanitizePayload(collectionName, docId, dataWithTimestamps);
    const { data: upserted, error } = await supabase
      .from(collectionName)
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    
    const rawNormalized = normalizeDoc(upserted || payload);
    const normalized = {
      ...rawNormalized,
      updatedAt: rawNormalized.updatedAt || dataWithTimestamps.updatedAt
    };

    // Surgically update or prepend document in persistent & local cache
    try {
      const existing = await getPersistentCache(collectionName);
      const updated = [normalized, ...(Array.isArray(existing) ? existing.filter(item => String(item.id) !== String(docId)) : [])];
      await persistCollectionCache(collectionName, updated);
    } catch (e) {}

    _sessionRevalidatedCollections.delete(collectionName);
    await triggerKvCacheInvalidation(collectionName);

    return normalized;
  } catch (error) {
    console.error(`Error setting ${collectionName}/${docId}:`, error);
    throw error;
  }
};

/**
 * Update an existing document by ID (always preserves/sets updatedAt)
 */
export const updateDocument = async (collectionName, docId, updates) => {
  try {
    const nowIso = new Date().toISOString();
    const updatesWithTimestamp = {
      ...(updates || {}),
      updatedAt: (updates && updates.updatedAt) ? updates.updatedAt : nowIso
    };
    const payload = sanitizePayload(collectionName, docId, updatesWithTimestamp);
    const { data: updated, error } = await supabase
      .from(collectionName)
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    
    const rawNormalized = normalizeDoc(updated || payload);
    const normalized = {
      ...rawNormalized,
      updatedAt: rawNormalized.updatedAt || updatesWithTimestamp.updatedAt
    };

    // Surgically update document in persistent & local cache
    try {
      const existing = await getPersistentCache(collectionName);
      if (Array.isArray(existing) && existing.length > 0) {
        const hasMatch = existing.some(item => String(item.id) === String(docId));
        const updatedList = hasMatch
          ? existing.map(item => String(item.id) === String(docId) ? { ...item, ...normalized } : item)
          : [normalized, ...existing];
        await persistCollectionCache(collectionName, updatedList);
      }
    } catch (e) {}

    _sessionRevalidatedCollections.delete(collectionName);
    await triggerKvCacheInvalidation(collectionName);

    return normalized;
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
    
    // Surgically remove deleted document from persistent & local cache so other items remain intact
    try {
      const existing = await getPersistentCache(collectionName);
      if (Array.isArray(existing)) {
        const updated = existing.filter(item => String(item.id) !== String(docId));
        await persistCollectionCache(collectionName, updated);
      }
    } catch (e) {
      console.warn(`Failed to remove ${docId} from cache ${collectionName}:`, e);
    }

    _sessionRevalidatedCollections.delete(collectionName);
    await triggerKvCacheInvalidation(collectionName);

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
export const incrementFeedLike = async (postId, delta = 1, userId = null) => {
  try {
    const WORKER_URL = 'https://job-circular-proxy.rudrodeb029.workers.dev';
    const res = await fetch(`${WORKER_URL}/feed/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, delta, userId })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.likes;
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
    const WORKER_URL = 'https://job-circular-proxy.rudrodeb029.workers.dev';
    const res = await fetch(`${WORKER_URL}/feed/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, commentObj })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.comments;
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
    const nowIso = new Date().toISOString();
    const sanitizedItems = items.map(item =>
      sanitizePayload(collectionName, item.id, {
        ...item,
        updatedAt: item.updatedAt || nowIso
      })
    );
    const { error } = await supabase
      .from(collectionName)
      .upsert(sanitizedItems);

    if (error) throw error;
    await clearCollectionCache(collectionName);
    await triggerKvCacheInvalidation(collectionName);

    return true;
  } catch (error) {
    console.error(`Batch write error on ${collectionName}:`, error);
    throw error;
  }
};
