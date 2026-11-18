import {
  setDocument,
  deleteDocument,
  getCollection,
  getPersistentCache,
  setPersistentCache,
  getMemoryCollectionCache,
  COLLECTIONS
} from '../services/supabaseService';

export const questionsData = [];

let cachedQuestionsData = [];
let _warmedUpFromPersistent = false;

// Keep synchronous in-memory cache synced with persistent IndexedDB/SQLite updates
if (typeof window !== 'undefined') {
  window.addEventListener('questions_updated', (e) => {
    if (Array.isArray(e?.detail)) {
      cachedQuestionsData = e.detail;
      _warmedUpFromPersistent = true;
    }
  });
  window.addEventListener('force_app_data_reload', (e) => {
    const cols = e?.detail?.collections;
    if (cols && Array.isArray(cols[COLLECTIONS.QUESTIONS])) {
      cachedQuestionsData = cols[COLLECTIONS.QUESTIONS];
      _warmedUpFromPersistent = true;
    }
  });
}

const warmUpQuestionsCache = () => {
  if (_warmedUpFromPersistent) return;
  _warmedUpFromPersistent = true;
  getPersistentCache(COLLECTIONS.QUESTIONS)
    .then((items) => {
      if (Array.isArray(items) && items.length > 0) {
        cachedQuestionsData = items;
      }
    })
    .catch(() => {});
};

// Multi-tier cache accessor for Questions Data

export const getQuestionsByCategory = (category) => {
  const all = getQuestionsData();
  return all.filter(q => q.category === category || (category === 'recent' && q.category === 'admission') || (category === 'admission' && q.category === 'recent'));
};

export const getQuestionById = (id) => {
  const all = getQuestionsData();
  return all.find(q => String(q.id) === String(id));
};

export const getQuestionsData = () => {
  // 1. Prefer full in-memory cache (populated from IndexedDB/SQLite or network sync)
  const mem = getMemoryCollectionCache(COLLECTIONS.QUESTIONS);
  if (Array.isArray(mem) && mem.length > 0) {
    cachedQuestionsData = mem;
    return cachedQuestionsData;
  }

  // Trigger non-blocking persistent hydration in background if not yet warmed up
  warmUpQuestionsCache();

  // 2. Fallback to safe localStorage cache (may contain metadata-only if >5MB)
  try {
    const saved = localStorage.getItem('cache_data_questions') || localStorage.getItem('questions_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        cachedQuestionsData = parsed;
        return cachedQuestionsData;
      }
    }
  } catch (e) {
    console.error('Error reading questions cache:', e);
  }
  return cachedQuestionsData || [];
};

export const getQuestionsDataAsync = async () => {
  const items = await getPersistentCache(COLLECTIONS.QUESTIONS);
  if (Array.isArray(items)) {
    cachedQuestionsData = items;
  }
  return cachedQuestionsData || [];
};

export const saveQuestionsData = async (data) => {
  cachedQuestionsData = Array.isArray(data) ? data : [];
  // Persist to IndexedDB/SQLite + safe stripped localStorage (never duplicate `questions_data`)
  await setPersistentCache(COLLECTIONS.QUESTIONS, cachedQuestionsData);

  // Sync to Supabase
  try {
    for (const paper of cachedQuestionsData) {
      const { id, ...payload } = paper;
      await setDocument(COLLECTIONS.QUESTIONS, id, payload);
    }
    const currentIds = cachedQuestionsData.map(p => p.id);
    const serverData = await getCollection(COLLECTIONS.QUESTIONS, true);
    for (const doc of serverData) {
      if (!currentIds.includes(doc.id)) {
        await deleteDocument(COLLECTIONS.QUESTIONS, doc.id);
      }
    }
  } catch (err) {
    console.error('Failed to save questions to Supabase:', err);
  }
};
