// Firestore service layer — centralizes all Firestore CRUD operations (Local Dependency Version)
import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  getDocsFromCache,
  getDocsFromServer,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';

// ─── Timestamp Conversion Helper ────────────────────────────────

/**
 * Convert Firestore Timestamp objects to ISO strings for safe serialization.
 */
const convertTimestamps = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    const val = result[key];
    if (val && typeof val === 'object') {
      if (typeof val.toDate === 'function') {
        result[key] = val.toDate().toISOString();
      } else if (typeof val.seconds === 'number' && typeof val.nanoseconds === 'number') {
        result[key] = new Date(val.seconds * 1000).toISOString();
      }
    }
  }
  return result;
};

// ─── Generic CRUD Helpers ───────────────────────────────────────

export const getCollection = async (collectionName) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
};

/**
 * Intelligent Caching Collection Fetcher
 * @param {string} collectionName - Firestore collection name
 * @param {boolean} forceServer - Force network fetch from Firestore server (e.g. Pull to Refresh)
 * @param {number} ttlMinutes - Cache validity time in minutes (default 15 mins)
 */
export const getCollectionCached = async (collectionName, forceServer = false, ttlMinutes = 15) => {
  const cacheKey = `cache_data_${collectionName}`;
  const timeKey = `cache_time_${collectionName}`;
  const now = Date.now();
  const cachedTime = localStorage.getItem(timeKey);
  const cachedDataStr = localStorage.getItem(cacheKey);

  const isCacheValid = cachedTime && cachedDataStr && (now - parseInt(cachedTime, 10) < ttlMinutes * 60 * 1000);

  // 1. If cache is valid and user didn't force server refresh, return cached data instantly (0 Firestore reads)
  if (isCacheValid && !forceServer) {
    try {
      return JSON.parse(cachedDataStr);
    } catch (e) {
      console.warn(`Cache parse error for ${collectionName}:`, e);
    }
  }

  // 2. Try fetching fresh data from Firestore Server
  try {
    const colRef = collection(db, collectionName);
    let snapshot;
    if (forceServer) {
      snapshot = await getDocsFromServer(colRef);
    } else {
      snapshot = await getDocs(colRef);
    }

    const data = snapshot.docs.map(docSnap => convertTimestamps({ id: docSnap.id, ...docSnap.data() }));
    
    // Save to localStorage cache if non-empty
    if (data && data.length > 0) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(timeKey, String(now));
      } catch (e) {
        console.warn(`Failed to write ${collectionName} to localStorage cache:`, e);
      }
    }
    return data;
  } catch (error) {
    console.warn(`Server fetch for ${collectionName} failed/offline, attempting fallback cache:`, error.message);
    
    // 3. Offline fallback to local cache
    if (cachedDataStr) {
      try {
        return JSON.parse(cachedDataStr);
      } catch (e) {
        console.error(e);
      }
    }

    // 4. Try Firestore IndexedDB SDK Cache fallback
    try {
      const cacheSnapshot = await getDocsFromCache(collection(db, collectionName));
      return cacheSnapshot.docs.map(docSnap => convertTimestamps({ id: docSnap.id, ...docSnap.data() }));
    } catch (cacheErr) {
      console.error(`Cache fallback for ${collectionName} failed:`, cacheErr);
      return [];
    }
  }
};

export const getDocument = async (collectionName, docId) => {
  try {
    const docSnap = await getDoc(doc(db, collectionName, docId));
    if (docSnap.exists()) {
      return convertTimestamps({ id: docSnap.id, ...docSnap.data() });
    }
    return null;
  } catch (error) {
    console.error(`Error fetching ${collectionName}/${docId}:`, error);
    return null;
  }
};

export const clearCollectionCache = (collectionName) => {
  try {
    localStorage.removeItem(`cache_data_${collectionName}`);
    localStorage.removeItem(`cache_time_${collectionName}`);
  } catch (e) {
    console.warn(`Failed to clear cache for ${collectionName}:`, e);
  }
};

export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    clearCollectionCache(collectionName);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error(`Error adding to ${collectionName}:`, error);
    throw error;
  }
};

export const setDocument = async (collectionName, docId, data) => {
  try {
    await setDoc(doc(db, collectionName, docId), data);
    clearCollectionCache(collectionName);
    return { id: docId, ...data };
  } catch (error) {
    console.error(`Error setting ${collectionName}/${docId}:`, error);
    throw error;
  }
};

export const updateDocument = async (collectionName, docId, updates) => {
  try {
    await updateDoc(doc(db, collectionName, docId), updates);
    clearCollectionCache(collectionName);
    return { id: docId, ...updates };
  } catch (error) {
    console.error(`Error updating ${collectionName}/${docId}:`, error);
    throw error;
  }
};

export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    clearCollectionCache(collectionName);
    return true;
  } catch (error) {
    console.error(`Error deleting ${collectionName}/${docId}:`, error);
    throw error;
  }
};


export const onCollectionSnapshot = (collectionName, callback) => {
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    const data = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (error) => {
    console.error(`Snapshot error on ${collectionName}:`, error);
  });
};

export const batchSetDocuments = async (collectionName, items) => {
  try {
    const batch = writeBatch(db);
    items.forEach(item => {
      const { id: docId, ...data } = item;
      const ref = doc(db, collectionName, docId);
      batch.set(ref, data);
    });
    await batch.commit();
    return true;
  } catch (error) {
    console.error(`Batch write error on ${collectionName}:`, error);
    throw error;
  }
};

// ─── Collection Names ──────────────────────────────────────────
export const COLLECTIONS = {
  JOBS: 'jobs',
  NOTIFICATIONS: 'notifications',
  ADMITS: 'admits',
  ACTIVITIES: 'activities',
  LIVE_EXAMS: 'liveExams',
  QUESTIONS: 'questions',
  USERS: 'users',
  APP_CONFIG: 'appConfig'
};
