import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { categories } from '../data/categories';
import { broadcastPush, sendExamCountdownPush } from '../utils/oneSignalWrapper';
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

// ─── Initial state: empty arrays, Firestore snapshots will populate ───
const initialState = {
  jobs: [],
  notifications: [],
  admits: [],
  questions: [],
  liveExams: [],
  categories: categories,
  adminUser: JSON.parse(localStorage.getItem('admin_user')) || null,
  firestoreReady: false
};

const adminReducer = (state, action) => {
  let newState = { ...state };

  switch (action.type) {
    case 'SET_JOBS':
      newState.jobs = [...action.payload].sort(sortByCreatedAt);
      break;
    case 'SET_NOTIFICATIONS':
      newState.notifications = [...action.payload].sort(sortByCreatedAt);
      break;
    case 'SET_ADMITS':
      newState.admits = [...action.payload].sort(sortByCreatedAt);
      break;
    case 'SET_QUESTIONS':
      newState.questions = [...action.payload].sort(sortByCreatedAt);
      break;
    case 'SET_LIVE_EXAMS':
      newState.liveExams = [...action.payload].sort(sortByCreatedAt);
      break;
    case 'SET_FIRESTORE_READY':
      newState.firestoreReady = true;
      return newState;

    // --- CRUD Actions (triggered by Admin Panel) ---
    case 'ADD_JOB':
    case 'UPDATE_JOB':
      const job = action.payload;
      setDocument(COLLECTIONS.JOBS, job.id, job).catch(console.error);

      if (action.type === 'ADD_JOB' || job.shouldNotify) {
          const title = job.organization;
          const msg = `নতুন সার্কুলার: ${job.title}`;
          broadcastPush(title, msg, { jobId: job.id, type: 'new_job' })
              .then(res => {
                  if (res.success) {
                      console.log(`✅ Push sent for new circular: "${job.title}" → ${res.recipients} device(s)`);
                  } else {
                      console.error(`❌ Push failed for circular: "${job.title}" →`, res.error);
                  }
              })
              .catch(err => console.error('Push error for circular:', err));
      }
      return state;

    case 'DELETE_JOB':
      deleteDocument(COLLECTIONS.JOBS, action.payload).catch(console.error);
      return state;

    case 'ADD_EXAM':
    case 'UPDATE_EXAM':
      const exam = action.payload;
      setDocument(COLLECTIONS.LIVE_EXAMS, exam.id, exam).catch(console.error);

      if (action.type === 'ADD_EXAM') {
          // Send countdown push + schedule 5-min reminder
          sendExamCountdownPush(exam)
              .then(res => {
                  if (res.success) {
                      console.log(`✅ Exam push sent: "${exam.title}" → ${res.recipients} device(s)`);
                  } else {
                      console.error(`❌ Exam push failed: "${exam.title}" →`, res.error);
                  }
              })
              .catch(err => console.error('Push error for exam:', err));
      }
      return state;

    case 'DELETE_EXAM':
      deleteDocument(COLLECTIONS.LIVE_EXAMS, action.payload).catch(console.error);
      return state;

    case 'ADD_NOTIFICATION':
    case 'UPDATE_NOTIFICATION':
        const notif = action.payload;
        setDocument(COLLECTIONS.NOTIFICATIONS, notif.id, notif).catch(console.error);

        if (action.type === 'ADD_NOTIFICATION') {
            broadcastPush(notif.title || notif.organization, notif.message, { jobId: notif.jobId, type: notif.type })
                .then(res => {
                    if (res.success) {
                        console.log(`✅ Notification push sent: "${notif.title}" → ${res.recipients} device(s)`);
                    } else {
                        console.error(`❌ Notification push failed:`, res.error);
                    }
                })
                .catch(err => console.error('Push error for notification:', err));
        }
        return state;

    case 'DELETE_NOTIFICATION':
        deleteDocument(COLLECTIONS.NOTIFICATIONS, action.payload).catch(console.error);
        return state;

    case 'ADD_QUESTION_PAPER':
    case 'UPDATE_QUESTION_PAPER':
      const paper = action.payload;
      setDocument(COLLECTIONS.QUESTIONS, paper.id, paper).catch(console.error);

      if (action.type === 'ADD_QUESTION_PAPER') {
          broadcastPush("নতুন প্রশ্নপত্র", `${paper.title} - প্রস্তুতি নিন এখনই!`, { paperId: paper.id, type: 'new_paper' })
              .then(res => {
                  if (res.success) {
                      console.log(`✅ Question paper push sent: "${paper.title}" → ${res.recipients} device(s)`);
                  } else {
                      console.error(`❌ Question paper push failed:`, res.error);
                  }
              })
              .catch(err => console.error('Push error for question paper:', err));
      }
      return state;

    case 'DELETE_QUESTION_PAPER':
      deleteDocument(COLLECTIONS.QUESTIONS, action.payload).catch(console.error);
      return state;

    case 'UPDATE_ADMIT':
        setDocument(COLLECTIONS.ADMITS, action.payload.id, action.payload).catch(console.error);
        return state;

    case 'DELETE_ADMIT':
        deleteDocument(COLLECTIONS.ADMITS, action.payload).catch(console.error);
        return state;

    case 'ADMIN_LOGIN':
      localStorage.setItem('admin_user', JSON.stringify(action.payload));
      return { ...state, adminUser: action.payload };
    case 'ADMIN_LOGOUT':
      localStorage.removeItem('admin_user');
      return { ...state, adminUser: null };
    default:
      return state;
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

        const timer = setTimeout(() => setLoading(false), 5000);
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
    <div className="admin-context-provider">
        <AdminContext.Provider value={{ state, dispatch, loading }}>
        {children}
        </AdminContext.Provider>
    </div>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdminContext must be used within an AdminProvider');
  return context;
};
