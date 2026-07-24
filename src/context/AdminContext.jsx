import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { jobs as initialJobs } from '../data/jobs';
import { notifications as initialNotifications, admitCardsAndResults as initialAdmits } from '../data/notifications';
import { categories } from '../data/categories';
import { defaultLiveExams } from '../data/liveExams';
import { questionsData } from '../data/questionsData';
import {
  getCollection,
  setDocument,
  deleteDocument,
  onCollectionSnapshot,
  COLLECTIONS
} from '../services/firestoreService';

const AdminContext = createContext();

// Map jobs to ensure they have status/timestamps
const mapJobs = (jobs) => {
  return jobs.map(job => ({
    ...job,
    status: job.status || 'active',
    createdAt: job.createdAt || new Date().toISOString(),
    updatedAt: job.updatedAt || new Date().toISOString()
  }));
};

// Fallback: load from localStorage if Firestore unavailable
const loadLocalState = (key, defaultData) => {
  try {
    const saved = localStorage.getItem(`admin_${key}`);
    return saved ? JSON.parse(saved) : defaultData;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultData;
  }
};

const initialState = {
  jobs: loadLocalState('jobs', mapJobs(initialJobs)),
  notifications: loadLocalState('notifications', initialNotifications),
  admits: loadLocalState('admits', initialAdmits),
  categories: categories,
  activities: loadLocalState('activities', []),
  adminUser: loadLocalState('user', null),
  firestoreReady: false // tracks if Firestore data has loaded
};

const adminReducer = (state, action) => {
  let newState;
  switch (action.type) {
    // ─── Firestore sync actions (bulk replace from snapshot) ────
    case 'SET_JOBS':
      newState = { ...state, jobs: action.payload };
      break;
    case 'SET_NOTIFICATIONS':
      newState = { ...state, notifications: action.payload };
      break;
    case 'SET_ADMITS':
      newState = { ...state, admits: action.payload };
      break;
    case 'SET_ACTIVITIES':
      newState = { ...state, activities: action.payload };
      break;
    case 'SET_FIRESTORE_READY':
      return { ...state, firestoreReady: true };

    // ─── Job CRUD (optimistic local update) ────────────────────
    case 'ADD_JOB':
      newState = { ...state, jobs: [action.payload, ...state.jobs] };
      break;
    case 'UPDATE_JOB':
      newState = {
        ...state,
        jobs: state.jobs.map(job => (job.id === action.payload.id ? { ...job, ...action.payload, updatedAt: new Date().toISOString() } : job))
      };
      break;
    case 'DELETE_JOB':
      newState = { ...state, jobs: state.jobs.filter(job => job.id !== action.payload) };
      break;
    case 'TOGGLE_JOB_STATUS':
      newState = {
        ...state,
        jobs: state.jobs.map(job => {
          if (job.id === action.payload) {
            const nextStatus = job.status === 'active' ? 'draft' : job.status === 'draft' ? 'expired' : 'active';
            return { ...job, status: nextStatus, updatedAt: new Date().toISOString() };
          }
          return job;
        })
      };
      break;

    // ─── Notification CRUD ─────────────────────────────────────
    case 'ADD_NOTIFICATION':
      newState = { ...state, notifications: [action.payload, ...state.notifications] };
      break;
    case 'UPDATE_NOTIFICATION':
      newState = {
        ...state,
        notifications: state.notifications.map(n => (n.id === action.payload.id ? { ...n, ...action.payload } : n))
      };
      break;
    case 'DELETE_NOTIFICATION':
      newState = { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
      break;

    // ─── Admit CRUD ────────────────────────────────────────────
    case 'ADD_ADMIT':
      newState = { ...state, admits: [action.payload, ...state.admits] };
      break;
    case 'UPDATE_ADMIT':
      newState = {
        ...state,
        admits: state.admits.map(a => (a.id === action.payload.id ? { ...a, ...action.payload } : a))
      };
      break;
    case 'DELETE_ADMIT':
      newState = { ...state, admits: state.admits.filter(a => a.id !== action.payload) };
      break;

    // ─── Activity log ──────────────────────────────────────────
    case 'ADD_ACTIVITY':
      newState = { ...state, activities: [action.payload, ...state.activities] };
      break;

    // ─── Admin session (stays in localStorage) ─────────────────
    case 'ADMIN_LOGIN':
      newState = { ...state, adminUser: action.payload };
      localStorage.setItem('admin_user', JSON.stringify(action.payload));
      return newState;
    case 'ADMIN_LOGOUT':
      newState = { ...state, adminUser: null };
      localStorage.setItem('admin_user', JSON.stringify(null));
      return newState;

    default:
      return state;
  }

  // ─── Persist to Firestore (async, fire-and-forget) ──────────
  try {
    if (['ADD_JOB', 'UPDATE_JOB', 'TOGGLE_JOB_STATUS'].includes(action.type)) {
      const job = newState.jobs.find(j => j.id === action.payload?.id || j.id === action.payload);
      if (job) {
        const { id, ...data } = job;
        setDocument(COLLECTIONS.JOBS, id, data).catch(console.error);
      }
    } else if (action.type === 'DELETE_JOB') {
      deleteDocument(COLLECTIONS.JOBS, action.payload).catch(console.error);
    } else if (['ADD_NOTIFICATION', 'UPDATE_NOTIFICATION'].includes(action.type)) {
      const notif = newState.notifications.find(n => n.id === action.payload?.id);
      if (notif) {
        const { id, ...data } = notif;
        setDocument(COLLECTIONS.NOTIFICATIONS, id, data).catch(console.error);
      }
    } else if (action.type === 'DELETE_NOTIFICATION') {
      deleteDocument(COLLECTIONS.NOTIFICATIONS, action.payload).catch(console.error);
    } else if (['ADD_ADMIT', 'UPDATE_ADMIT'].includes(action.type)) {
      const admit = newState.admits.find(a => a.id === action.payload?.id);
      if (admit) {
        const { id, ...data } = admit;
        setDocument(COLLECTIONS.ADMITS, id, data).catch(console.error);
      }
    } else if (action.type === 'DELETE_ADMIT') {
      deleteDocument(COLLECTIONS.ADMITS, action.payload).catch(console.error);
    } else if (action.type === 'ADD_ACTIVITY') {
      const activity = action.payload;
      if (activity && activity.id) {
        const { id, ...data } = activity;
        setDocument(COLLECTIONS.ACTIVITIES, id, data).catch(console.error);
      }
    }
  } catch (err) {
    console.error('Firestore persist error:', err);
  }

  // Also keep localStorage as fallback cache
  if (['ADD_JOB', 'UPDATE_JOB', 'DELETE_JOB', 'TOGGLE_JOB_STATUS', 'SET_JOBS'].includes(action.type)) {
    localStorage.setItem('admin_jobs', JSON.stringify(newState.jobs));
  } else if (['ADD_NOTIFICATION', 'UPDATE_NOTIFICATION', 'DELETE_NOTIFICATION', 'SET_NOTIFICATIONS'].includes(action.type)) {
    localStorage.setItem('admin_notifications', JSON.stringify(newState.notifications));
  } else if (['ADD_ADMIT', 'UPDATE_ADMIT', 'DELETE_ADMIT', 'SET_ADMITS'].includes(action.type)) {
    localStorage.setItem('admin_admits', JSON.stringify(newState.admits));
  } else if (['ADD_ACTIVITY', 'SET_ACTIVITIES'].includes(action.type)) {
    localStorage.setItem('admin_activities', JSON.stringify(newState.activities));
  }

  return newState;
};

export const AdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const [loading, setLoading] = useState(true);

  // Subscribe to Firestore real-time snapshots on mount
  useEffect(() => {
    const unsubscribers = [];

    const seedInitialData = async () => {
      try {
        const jobsData = await getCollection(COLLECTIONS.JOBS);
        if (jobsData.length === 0) {
          console.log('Seeding initial jobs data to Firestore...');
          for (const job of mapJobs(initialJobs)) {
            const { id, ...data } = job;
            await setDocument(COLLECTIONS.JOBS, id, data);
          }
        }

        const admitsData = await getCollection(COLLECTIONS.ADMITS);
        if (admitsData.length === 0) {
          console.log('Seeding initial admits data to Firestore...');
          for (const admit of initialAdmits) {
            const { id, ...data } = admit;
            await setDocument(COLLECTIONS.ADMITS, id, data);
          }
        }

        const questionsList = await getCollection(COLLECTIONS.QUESTIONS);
        if (questionsList.length === 0) {
          console.log('Seeding initial questions data to Firestore...');
          for (const paper of questionsData) {
            const { id, ...data } = paper;
            await setDocument(COLLECTIONS.QUESTIONS, id, data);
          }
        }

        const examsList = await getCollection(COLLECTIONS.LIVE_EXAMS);
        if (examsList.length === 0) {
          console.log('Seeding initial live exams data to Firestore...');
          for (const exam of defaultLiveExams) {
            const { id, ...data } = exam;
            await setDocument(COLLECTIONS.LIVE_EXAMS, id, data);
          }
        }
      } catch (err) {
        console.error('Auto-seeding error:', err);
      }
    };

    const setupListeners = () => {
      seedInitialData();
      try {
        // Jobs collection
        unsubscribers.push(
          onCollectionSnapshot(COLLECTIONS.JOBS, (data) => {
            if (data.length > 0) {
              dispatch({ type: 'SET_JOBS', payload: mapJobs(data) });
            }
          })
        );

        // Notifications collection
        unsubscribers.push(
          onCollectionSnapshot(COLLECTIONS.NOTIFICATIONS, (data) => {
            if (data.length > 0) {
              dispatch({ type: 'SET_NOTIFICATIONS', payload: data });
            }
          })
        );

        // Admits collection
        unsubscribers.push(
          onCollectionSnapshot(COLLECTIONS.ADMITS, (data) => {
            if (data.length > 0) {
              dispatch({ type: 'SET_ADMITS', payload: data });
            }
          })
        );

        // Activities collection
        unsubscribers.push(
          onCollectionSnapshot(COLLECTIONS.ACTIVITIES, (data) => {
            if (data.length > 0) {
              dispatch({ type: 'SET_ACTIVITIES', payload: data });
            }
          })
        );

        dispatch({ type: 'SET_FIRESTORE_READY' });
        setLoading(false);
      } catch (error) {
        console.error('Firestore listener setup failed, using localStorage fallback:', error);
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      unsubscribers.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, []);

  return (
    <AdminContext.Provider value={{ state, dispatch, loading }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within an AdminProvider');
  }
  return context;
};

export const getJobStats = (jobs) => {
  const stats = {
    total: jobs.length,
    active: 0,
    draft: 0,
    expired: 0,
    byCategory: {}
  };

  jobs.forEach(job => {
    if (job.status === 'active') stats.active++;
    else if (job.status === 'draft') stats.draft++;
    else if (job.status === 'expired') stats.expired++;
    if (job.category) {
      stats.byCategory[job.category] = (stats.byCategory[job.category] || 0) + 1;
    }
  });

  return stats;
};
