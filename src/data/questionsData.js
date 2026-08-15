import { onCollectionSnapshot, setDocument, deleteDocument, getCollection, COLLECTIONS } from '../services/supabaseService';

export const questionsData = [];

let cachedQuestionsData = [];

// Real-time Firestore sync
try {
  onCollectionSnapshot(COLLECTIONS.QUESTIONS, (data) => {
    if (data) {
      cachedQuestionsData = [...data].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      localStorage.setItem('questions_data', JSON.stringify(cachedQuestionsData));
      window.dispatchEvent(new CustomEvent('questions_updated'));
    }
  });
} catch (err) {
  console.error('Failed to subscribe to questions Firestore:', err);
}

export const getQuestionsByCategory = (category) => {
  const all = getQuestionsData();
  return all.filter(q => q.category === category);
};

export const getQuestionById = (id) => {
  const all = getQuestionsData();
  return all.find(q => String(q.id) === String(id));
};

export const getQuestionsData = () => {
  if (cachedQuestionsData && cachedQuestionsData.length > 0) {
    return cachedQuestionsData;
  }
  try {
    const saved = localStorage.getItem('cache_data_questions') || localStorage.getItem('questions_data');
    if (saved) {
      cachedQuestionsData = JSON.parse(saved);
      return cachedQuestionsData;
    }
  } catch (e) {
    console.error('Error reading questions cache:', e);
  }
  return [];
};

export const saveQuestionsData = async (data) => {
  cachedQuestionsData = data;
  try {
    localStorage.setItem('questions_data', JSON.stringify(data));
  } catch (e) {}

  // Sync to Firestore
  try {
    for (const paper of data) {
      const { id, ...payload } = paper;
      await setDocument(COLLECTIONS.QUESTIONS, id, payload);
    }
    const currentIds = data.map(p => p.id);
    const firestoreData = await getCollection(COLLECTIONS.QUESTIONS);
    for (const doc of firestoreData) {
      if (!currentIds.includes(doc.id)) {
        await deleteDocument(COLLECTIONS.QUESTIONS, doc.id);
      }
    }
  } catch (err) {
    console.error('Failed to save questions to Firestore:', err);
  }
};
