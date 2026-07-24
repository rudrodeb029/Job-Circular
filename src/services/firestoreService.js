// Firestore service layer — centralizes all Firestore CRUD operations
import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';

// ─── Generic CRUD Helpers ───────────────────────────────────────

/**
 * Get all documents from a collection.
 * Returns an array of { id, ...data } objects.
 */
export const getCollection = async (collectionName) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
};

/**
 * Get a single document by ID.
 */
export const getDocument = async (collectionName, docId) => {
  try {
    const docSnap = await getDoc(doc(db, collectionName, docId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching ${collectionName}/${docId}:`, error);
    return null;
  }
};

/**
 * Add a new document with auto-generated ID.
 */
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error(`Error adding to ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Set a document with a specific ID (creates or overwrites).
 */
export const setDocument = async (collectionName, docId, data) => {
  try {
    await setDoc(doc(db, collectionName, docId), data);
    return { id: docId, ...data };
  } catch (error) {
    console.error(`Error setting ${collectionName}/${docId}:`, error);
    throw error;
  }
};

/**
 * Partially update a document.
 */
export const updateDocument = async (collectionName, docId, updates) => {
  try {
    await updateDoc(doc(db, collectionName, docId), updates);
    return { id: docId, ...updates };
  } catch (error) {
    console.error(`Error updating ${collectionName}/${docId}:`, error);
    throw error;
  }
};

/**
 * Delete a document by ID.
 */
export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return true;
  } catch (error) {
    console.error(`Error deleting ${collectionName}/${docId}:`, error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates on a collection.
 * Returns an unsubscribe function.
 */
export const onCollectionSnapshot = (collectionName, callback) => {
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (error) => {
    console.error(`Snapshot error on ${collectionName}:`, error);
  });
};

/**
 * Batch write multiple documents to a collection.
 * items should be an array of { id, ...data } objects.
 */
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

// ─── Collection Names (centralized constants) ───────────────────
export const COLLECTIONS = {
  JOBS: 'jobs',
  NOTIFICATIONS: 'notifications',
  ADMITS: 'admits',
  ACTIVITIES: 'activities',
  LIVE_EXAMS: 'liveExams',
  QUESTIONS: 'questions'
};
