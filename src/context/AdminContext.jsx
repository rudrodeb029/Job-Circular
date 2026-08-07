import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { categories } from '../data/categories';
import { triggerLocalNotification, sendPushToAll } from '../utils/notifications';
import {
  getCollection,
  setDocument,
  deleteDocument,
  onCollectionSnapshot,
  COLLECTIONS
} from '../services/firestoreService';

const AdminContext = createContext();

const getItemTimestamp = (item) => {
  if (item.createdAt) {
    const ms = new Date(item.createdAt).getTime();
    if (!isNaN(ms)) return ms;
  }
  if (item.id) {
    const matches = String(item.id).match(/\d{10,13}/);
    if (matches) return parseInt(matches[0], 10);
  }
  return 0;
};

const sortByCreatedAt = (a, b) => {
  const tsA = getItemTimestamp(a);
  const tsB = getItemTimestamp(b);
  if (tsA !== tsB) return tsB - tsA;
  return String(b.id || '').localeCompare(String(a.id || ''));
};

const mapWithTimestamps = (items) => {
  return items.map(item => ({
    ...item,
    createdAt: item.createdAt || new Date(getItemTimestamp(item) || Date.now()).toISOString()
  }));
};

const initialState = {
  jobs: JSON.parse(localStorage.getItem('admin_jobs')) || [],
  notifications: JSON.parse(localStorage.getItem('admin_notifications')) || [],
  admits: JSON.parse(localStorage.getItem('admin_admits')) || [],
  questions: JSON.parse(localStorage.getItem('admin_questions')) || [],
  liveExams: JSON.parse(localStorage.getItem('admin_live_exams')) || [],
  categories: categories,
  activities: [],
  adminUser: JSON.parse(localStorage.getItem('admin_user')) || null,
  firestoreReady: false
};

const adminReducer = (state, action) => {
  let newState;
  switch (action.type) {
    case 'SET_JOBS':
      newState = { ...state, jobs: [...action.payload].sort(sortByCreatedAt) };
      break;
    case 'SET_NOTIFICATIONS':
      newState = { ...state, notifications: [...action.payload].sort(sortByCreatedAt) };
      break;
    case 'SET_ADMITS':
      newState = { ...state, admits: [...action.payload].sort(sortByCreatedAt) };
      break;
    case 'SET_QUESTIONS':
      newState = { ...state, questions: [...action.payload].sort(sortByCreatedAt) };
      break;
    case 'SET_LIVE_EXAMS':
      newState = { ...state, liveExams: [...action.payload].sort(sortByCreatedAt) };
      break;
    case 'SET_FIRESTORE_READY':
      return { ...state, firestoreReady: true };
    case 'ADMIN_LOGIN':
      localStorage.setItem('admin_user', JSON.stringify(action.payload));
      return { ...state, adminUser: action.payload };
    case 'ADMIN_LOGOUT':
      localStorage.removeItem('admin_user');
      return { ...state, adminUser: null };
    default:
      return state;
  }

  // Persist to localStorage as cache
  if (action.type.startsWith('SET_')) {
    const keyMap = {
      'SET_JOBS': 'admin_jobs',
      'SET_NOTIFICATIONS': 'admin_notifications',
      'SET_ADMITS': 'admin_admits',
      'SET_QUESTIONS': 'admin_questions',
      'SET_LIVE_EXAMS': 'admin_live_exams'
    };
    if (keyMap[action.type]) {
      localStorage.setItem(keyMap[action.type], JSON.stringify(action.payload));
    }
  }

  return newState;
};

export const AdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribers = [];

    const startListeners = () => {
      try {
        unsubscribers.push(onCollectionSnapshot(COLLECTIONS.JOBS, (data) => dispatch({ type: 'SET_JOBS', payload: mapWithTimestamps(data) })));
        unsubscribers.push(onCollectionSnapshot(COLLECTIONS.NOTIFICATIONS, (data) => dispatch({ type: 'SET_NOTIFICATIONS', payload: mapWithTimestamps(data) })));
        unsubscribers.push(onCollectionSnapshot(COLLECTIONS.ADMITS, (data) => dispatch({ type: 'SET_ADMITS', payload: mapWithTimestamps(data) })));
        unsubscribers.push(onCollectionSnapshot(COLLECTIONS.QUESTIONS, (data) => dispatch({ type: 'SET_QUESTIONS', payload: mapWithTimestamps(data) })));
        unsubscribers.push(onCollectionSnapshot(COLLECTIONS.LIVE_EXAMS, (data) => dispatch({ type: 'SET_LIVE_EXAMS', payload: mapWithTimestamps(data) })));

        dispatch({ type: 'SET_FIRESTORE_READY' });

        // Safety timeout to ensure app loads even if Firestore is slow
        const timer = setTimeout(() => setLoading(false), 3000);
        return () => clearTimeout(timer);
      } catch (err) {
        console.error('Firestore listener error:', err);
        setLoading(false);
      }
    };

    startListeners();

    return () => unsubscribers.forEach(unsub => unsub && unsub());
  }, []);

  return (
    <AdminContext.Provider value={{ state, dispatch, loading }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdminContext must be used within an AdminProvider');
  return context;
};
