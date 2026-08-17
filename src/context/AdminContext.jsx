import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { categories } from '../data/categories';
import { broadcastPush, sendExamCountdownPush } from '../utils/oneSignalWrapper';
import {
  getCollection,
  getCollectionCached,
  clearCollectionCache,
  onCollectionSnapshot,
  setDocument,
  deleteDocument,
  COLLECTIONS
} from '../services/supabaseService';

import { getItemTimestamp, sortByCreatedAt } from '../utils/timeUtils';
import { auth } from '../firebase';

const AdminContext = createContext();

const mapWithTimestamps = (items) => {
  return items.map(item => ({
    ...item,
    createdAt: item.createdAt
      ? (typeof item.createdAt === 'object' && item.createdAt.seconds
          ? new Date(item.createdAt.seconds * 1000).toISOString()
          : typeof item.createdAt.toDate === 'function'
            ? item.createdAt.toDate().toISOString()
            : item.createdAt)
      : new Date(getItemTimestamp(item) || Date.now()).toISOString()
  }));
};

// ─── Initial state: loaded instantly from local cache if present ───
const getLocalCache = (key) => {
  try {
    const data = localStorage.getItem(`cache_data_${key}`);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalCache = (key, data) => {
  try {
    localStorage.setItem(`cache_data_${key}`, JSON.stringify(data));
    localStorage.setItem(`cache_time_${key}`, Date.now().toString());
  } catch (e) {
    console.error('Error saving local cache:', e);
  }
};

const initialState = {
  jobs: getLocalCache(COLLECTIONS.JOBS),
  notifications: getLocalCache(COLLECTIONS.NOTIFICATIONS),
  admits: getLocalCache(COLLECTIONS.ADMITS),
  questions: getLocalCache(COLLECTIONS.QUESTIONS),
  liveExams: getLocalCache(COLLECTIONS.LIVE_EXAMS),
  categories: categories,
  adminUser: (() => {
    try {
      const saved = localStorage.getItem('admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })(),
  activities: getLocalCache(COLLECTIONS.ACTIVITIES) || [],
  firestoreReady: false
};

// Track recently deleted IDs to prevent them from reappearing via snapshot race conditions
const pendingDeletes = new Map(); // Map<id, timestamp>

const registerPendingDelete = (id) => {
  pendingDeletes.set(id, Date.now());
  // Auto-cleanup after 10 seconds (by then Firestore has confirmed the delete)
  setTimeout(() => pendingDeletes.delete(id), 10000);
};

const logActivity = (type, text) => {
  const actId = `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const act = {
    id: actId,
    type,
    text,
    time: 'Just now',
    createdAt: new Date().toISOString()
  };
  setDocument(COLLECTIONS.ACTIVITIES, actId, act).catch(console.error);
};

const filterPendingDeletes = (items) => {
  if (pendingDeletes.size === 0) return items;
  return items.filter(item => !pendingDeletes.has(item.id));
};

const adminReducer = (state, action) => {
  let newState = { ...state };

  switch (action.type) {
    // --- Bulk Setters ---
    case 'SET_JOBS':
      newState.jobs = filterPendingDeletes([...action.payload]).sort(sortByCreatedAt);
      break;
    case 'SET_NOTIFICATIONS':
      newState.notifications = filterPendingDeletes([...action.payload]).sort(sortByCreatedAt);
      break;
    case 'SET_ADMITS':
      newState.admits = filterPendingDeletes([...action.payload]).sort(sortByCreatedAt);
      break;
    case 'SET_QUESTIONS':
      newState.questions = filterPendingDeletes([...action.payload]).sort(sortByCreatedAt);
      break;
    case 'SET_LIVE_EXAMS':
      newState.liveExams = filterPendingDeletes([...action.payload]).sort(sortByCreatedAt);
      break;
    case 'SET_ACTIVITIES':
      newState.activities = [...action.payload];
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
          const title = job.organization || job.title;
          const msg = `${job.organization || ''} -এ নতুন নিয়োগ বিজ্ঞপ্তি প্রকাশিত হয়েছে: ${job.title}`;
          broadcastPush(title, msg, { jobId: job.id, type: 'new_job' })
              .then(res => {
                  if (res.success) {
                      console.log(`✅ Push sent for new circular: "${job.title}" → ${res.recipients} device(s)`);
                  } else {
                      console.error(`❌ Push failed for circular: "${job.title}" →`, res.error);
                  }
              })
              .catch(err => console.error('Push error for circular:', err));

          // Auto-generate and save in-app notification record
          const notifId = `notif-job-${job.id}`;
          const notifObj = {
            id: notifId,
            title: job.organization || job.title,
            organization: job.organization || '',
            message: msg,
            type: 'new_job',
            jobId: job.id,
            createdAt: job.createdAt || new Date().toISOString()
          };
          setDocument(COLLECTIONS.NOTIFICATIONS, notifId, notifObj).catch(console.error);
          newState.notifications = [notifObj, ...(newState.notifications || state.notifications).filter(n => n.id !== notifId)].sort(sortByCreatedAt);
          saveLocalCache(COLLECTIONS.NOTIFICATIONS, newState.notifications);
      }

      if (action.type === 'ADD_JOB') {
        logActivity('add', `Added new circular: ${job.title}`);
        newState.jobs = [job, ...state.jobs.filter(j => j.id !== job.id)].sort(sortByCreatedAt);
      } else {
        logActivity('update', `Updated circular: ${job.title}`);
        newState.jobs = state.jobs.map(j => j.id === job.id ? job : j).sort(sortByCreatedAt);
      }
      saveLocalCache(COLLECTIONS.JOBS, newState.jobs);
      return newState;

    case 'DELETE_JOB': {
      const jobId = action.payload;
      registerPendingDelete(jobId);
      const deletedJob = state.jobs.find(j => j.id === jobId);
      logActivity('delete', `Deleted circular: ${deletedJob?.title || 'Circular'}`);
      
      // Delete from Firestore
      deleteDocument(COLLECTIONS.JOBS, jobId).catch(console.error);
      
      // Delete related admits/results
      const admitId = `admit-${jobId}`;
      const resultId = `result-${jobId}`;
      registerPendingDelete(admitId);
      registerPendingDelete(resultId);
      deleteDocument(COLLECTIONS.ADMITS, admitId).catch(console.error);
      deleteDocument(COLLECTIONS.ADMITS, resultId).catch(console.error);
      
      // Delete related notifications
      const notifJobId = `notif-job-${jobId}`;
      const notifAdmitId = `notif-admit-${jobId}`;
      const notifResultId = `notif-result-${jobId}`;
      registerPendingDelete(notifJobId);
      registerPendingDelete(notifAdmitId);
      registerPendingDelete(notifResultId);
      deleteDocument(COLLECTIONS.NOTIFICATIONS, notifJobId).catch(console.error);
      deleteDocument(COLLECTIONS.NOTIFICATIONS, notifAdmitId).catch(console.error);
      deleteDocument(COLLECTIONS.NOTIFICATIONS, notifResultId).catch(console.error);
      
      // Update local state
      newState.jobs = state.jobs.filter(j => j.id !== jobId);
      newState.admits = (state.admits || []).filter(a => a.jobId !== jobId && a.id !== admitId && a.id !== resultId);
      newState.notifications = (state.notifications || []).filter(n => n.jobId !== jobId && n.id !== notifJobId && n.id !== notifAdmitId && n.id !== notifResultId);
      
      saveLocalCache(COLLECTIONS.JOBS, newState.jobs);
      saveLocalCache(COLLECTIONS.ADMITS, newState.admits);
      saveLocalCache(COLLECTIONS.NOTIFICATIONS, newState.notifications);
      
      return newState;
    }

    case 'ADD_NOTIFICATION':
    case 'UPDATE_NOTIFICATION': {
      const notifItem = action.payload;
      setDocument(COLLECTIONS.NOTIFICATIONS, notifItem.id, notifItem).catch(console.error);

      if (action.type === 'ADD_NOTIFICATION') {
        broadcastPush(notifItem.title || notifItem.organization, notifItem.message, { jobId: notifItem.jobId, type: notifItem.type })
          .then(res => {
            if (res.success) {
              console.log(`✅ Notification push sent: "${notifItem.title}" → ${res.recipients} device(s)`);
            } else {
              console.error(`❌ Notification push failed:`, res.error);
            }
          })
          .catch(err => console.error('Push error for notification:', err));

        newState.notifications = [notifItem, ...state.notifications.filter(n => n.id !== notifItem.id)].sort(sortByCreatedAt);
      } else {
        newState.notifications = state.notifications.map(n => n.id === notifItem.id ? notifItem : n).sort(sortByCreatedAt);
      }
      saveLocalCache(COLLECTIONS.NOTIFICATIONS, newState.notifications);
      return newState;
    }

    case 'DELETE_NOTIFICATION': {
      registerPendingDelete(action.payload);
      deleteDocument(COLLECTIONS.NOTIFICATIONS, action.payload).catch(console.error);
      newState.notifications = state.notifications.filter(n => n.id !== action.payload);
      saveLocalCache(COLLECTIONS.NOTIFICATIONS, newState.notifications);
      return newState;
    }

    case 'ADD_ADMIT':
    case 'UPDATE_ADMIT': {
      const admitItem = action.payload;
      setDocument(COLLECTIONS.ADMITS, admitItem.id, admitItem).catch(console.error);
      if (action.type === 'ADD_ADMIT') {
        newState.admits = [admitItem, ...state.admits.filter(a => a.id !== admitItem.id)].sort(sortByCreatedAt);
      } else {
        newState.admits = state.admits.map(a => a.id === admitItem.id ? admitItem : a).sort(sortByCreatedAt);
      }
      saveLocalCache(COLLECTIONS.ADMITS, newState.admits);

      if (admitItem && (admitItem.type === 'admit_card' || admitItem.type === 'result')) {
        const notifId = `notif-admit-${admitItem.id}`;
        const notifObj = {
          id: notifId,
          title: admitItem.organization || admitItem.examName,
          organization: admitItem.organization || '',
          message: admitItem.examName,
          type: admitItem.type === 'result' ? 'result' : 'admit_card',
          jobId: admitItem.jobId,
          createdAt: admitItem.createdAt || new Date().toISOString()
        };
        setDocument(COLLECTIONS.NOTIFICATIONS, notifId, notifObj).catch(console.error);
        newState.notifications = [notifObj, ...(newState.notifications || state.notifications).filter(n => n.id !== notifId)].sort(sortByCreatedAt);
        saveLocalCache(COLLECTIONS.NOTIFICATIONS, newState.notifications);
      }
      return newState;
    }

    case 'DELETE_ADMIT': {
      registerPendingDelete(action.payload);
      deleteDocument(COLLECTIONS.ADMITS, action.payload).catch(console.error);
      newState.admits = state.admits.filter(a => a.id !== action.payload);
      saveLocalCache(COLLECTIONS.ADMITS, newState.admits);
      return newState;
    }

    case 'ADD_QUESTION':
    case 'UPDATE_QUESTION': {
      const qItem = action.payload;
      setDocument(COLLECTIONS.QUESTIONS, qItem.id, qItem).catch(console.error);
      if (action.type === 'ADD_QUESTION') {
        newState.questions = [qItem, ...state.questions.filter(item => item.id !== qItem.id)].sort(sortByCreatedAt);
      } else {
        newState.questions = state.questions.map(item => item.id === qItem.id ? qItem : item).sort(sortByCreatedAt);
      }
      saveLocalCache(COLLECTIONS.QUESTIONS, newState.questions);
      return newState;
    }

    case 'DELETE_QUESTION': {
      registerPendingDelete(action.payload);
      deleteDocument(COLLECTIONS.QUESTIONS, action.payload).catch(console.error);
      newState.questions = state.questions.filter(item => item.id !== action.payload);
      saveLocalCache(COLLECTIONS.QUESTIONS, newState.questions);
      return newState;
    }

    case 'ADD_LIVE_EXAM':
    case 'ADD_EXAM':
    case 'UPDATE_LIVE_EXAM':
    case 'UPDATE_EXAM': {
      const examItem = action.payload;
      setDocument(COLLECTIONS.LIVE_EXAMS, examItem.id, examItem).catch(console.error);

      if (action.type === 'ADD_LIVE_EXAM' || action.type === 'ADD_EXAM') {
        logActivity('add', `Scheduled new live exam: ${examItem.title}`);
        sendExamCountdownPush(examItem)
          .then(res => {
            if (res.success) {
              console.log(`✅ Exam push sent: "${examItem.title}" → ${res.recipients} device(s)`);
            } else {
              console.error(`❌ Exam push failed: "${examItem.title}" →`, res.error);
            }
          })
          .catch(err => console.error('Push error for exam:', err));

        const notifId = `notif-exam-${examItem.id}`;
        const notifObj = {
          id: notifId,
          title: examItem.title || 'লাইভ এমসিকিউ পরীক্ষা',
          organization: 'MCQ Exam',
          message: `নতুন লাইভ পরীক্ষা তৈরি করা হয়েছে: ${examItem.title}`,
          type: 'live_exam',
          examId: examItem.id,
          createdAt: examItem.createdAt || new Date().toISOString()
        };
        setDocument(COLLECTIONS.NOTIFICATIONS, notifId, notifObj).catch(console.error);
        newState.notifications = [notifObj, ...(newState.notifications || state.notifications).filter(n => n.id !== notifId)].sort(sortByCreatedAt);
        saveLocalCache(COLLECTIONS.NOTIFICATIONS, newState.notifications);
        newState.liveExams = [examItem, ...state.liveExams.filter(e => e.id !== examItem.id)].sort(sortByCreatedAt);
      } else {
        logActivity('update', `Updated live exam: ${examItem.title}`);
        newState.liveExams = state.liveExams.map(e => e.id === examItem.id ? examItem : e).sort(sortByCreatedAt);
      }
      saveLocalCache(COLLECTIONS.LIVE_EXAMS, newState.liveExams);
      return newState;
    }

    case 'DELETE_EXAM': {
      registerPendingDelete(action.payload);
      deleteDocument(COLLECTIONS.LIVE_EXAMS, action.payload).catch(console.error);
      const deletedExam = state.liveExams.find(e => e.id === action.payload);
      logActivity('delete', `Deleted live exam: ${deletedExam?.title || 'Exam'}`);
      newState.liveExams = state.liveExams.filter(e => e.id !== action.payload);
      saveLocalCache(COLLECTIONS.LIVE_EXAMS, newState.liveExams);
      return newState;
    }

    case 'ADD_QUESTION_PAPER':
    case 'UPDATE_QUESTION_PAPER': {
      const paperItem = action.payload;
      setDocument(COLLECTIONS.QUESTIONS, paperItem.id, paperItem).catch(console.error);

      if (action.type === 'ADD_QUESTION_PAPER') {
        logActivity('add', `Created question paper: ${paperItem.title}`);
        broadcastPush("নতুন প্রশ্নপত্র", `${paperItem.title} - প্রস্তুতি নিন এখনই!`, { paperId: paperItem.id, type: 'new_paper' })
          .then(res => {
            if (res.success) {
              console.log(`✅ Question paper push sent: "${paperItem.title}" → ${res.recipients} device(s)`);
            } else {
              console.error(`❌ Question paper push failed:`, res.error);
            }
          })
          .catch(err => console.error('Push error for question paper:', err));

        const notifId = `notif-paper-${paperItem.id}`;
        const notifObj = {
          id: notifId,
          title: paperItem.title || 'নতুন প্রশ্নপত্র',
          organization: paperItem.organization || 'প্রশ্নব্যাংক',
          message: `${paperItem.title} - প্রস্তুতি নিন এখনই!`,
          type: 'new_paper',
          paperId: paperItem.id,
          createdAt: paperItem.createdAt || new Date().toISOString()
        };
        setDocument(COLLECTIONS.NOTIFICATIONS, notifId, notifObj).catch(console.error);
        newState.notifications = [notifObj, ...(newState.notifications || state.notifications).filter(n => n.id !== notifId)].sort(sortByCreatedAt);
        saveLocalCache(COLLECTIONS.NOTIFICATIONS, newState.notifications);
        newState.questions = [paperItem, ...state.questions.filter(p => p.id !== paperItem.id)].sort(sortByCreatedAt);
      } else {
        logActivity('update', `Updated question paper: ${paperItem.title}`);
        newState.questions = state.questions.map(p => p.id === paperItem.id ? paperItem : p).sort(sortByCreatedAt);
      }
      saveLocalCache(COLLECTIONS.QUESTIONS, newState.questions);
      return newState;
    }

    case 'DELETE_QUESTION_PAPER': {
      deleteDocument(COLLECTIONS.QUESTIONS, action.payload).catch(console.error);
      const deletedPaper = state.questions.find(p => p.id === action.payload);
      logActivity('delete', `Deleted question paper: ${deletedPaper?.title || 'Question Paper'}`);
      newState.questions = state.questions.filter(p => p.id !== action.payload);
      saveLocalCache(COLLECTIONS.QUESTIONS, newState.questions);
      return newState;
    }

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
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const loadAllData = async (forceServer = true) => {
    try {
      setLoading(true);

      const [jobsData, notifsData, admitsData, questionsData, liveExamsData] = await Promise.all([
        getCollectionCached(COLLECTIONS.JOBS, forceServer),
        getCollectionCached(COLLECTIONS.NOTIFICATIONS, forceServer),
        getCollectionCached(COLLECTIONS.ADMITS, forceServer),
        getCollectionCached(COLLECTIONS.QUESTIONS, forceServer),
        getCollectionCached(COLLECTIONS.LIVE_EXAMS, forceServer)
      ]);

      dispatch({ type: 'SET_JOBS', payload: mapWithTimestamps(jobsData) });
      dispatch({ type: 'SET_NOTIFICATIONS', payload: mapWithTimestamps(notifsData) });
      dispatch({ type: 'SET_ADMITS', payload: mapWithTimestamps(admitsData) });
      dispatch({ type: 'SET_QUESTIONS', payload: mapWithTimestamps(questionsData) });
      dispatch({ type: 'SET_LIVE_EXAMS', payload: mapWithTimestamps(liveExamsData) });
      dispatch({ type: 'SET_FIRESTORE_READY' });
    } catch (err) {
      console.error('Error fetching cached data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Real-time Firebase Auth state change listener (First Priority)
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!isMounted) return;
      if (user && user.email === 'rudrodeb029@gmail.com') {
        const adminPayload = {
          name: user.displayName || 'Super Admin',
          email: user.email,
          role: 'Super Admin',
          photoURL: user.photoURL || null
        };
        dispatch({ type: 'ADMIN_LOGIN', payload: adminPayload });
      } else if (!user) {
        dispatch({ type: 'ADMIN_LOGOUT' });
      }
      setAuthChecked(true);
    });

    // Fallback safety timeout so session verification never blocks rendering
    const authTimeout = setTimeout(() => {
      if (isMounted) setAuthChecked(true);
    }, 1200);

    // 2. Initial fetch from server
    loadAllData(true).catch(console.error);

    // 3. Real-time snapshot listeners (Exclusively activated for Admin Panel, 0 socket load on mobile candidates)
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    let unsubscribeJobs = () => {};
    let unsubscribeLiveExams = () => {};
    let unsubscribeAdmits = () => {};
    let unsubscribeQuestions = () => {};
    let unsubscribeNotifs = () => {};
    let unsubscribeActivities = () => {};

    if (isAdminRoute) {
      try {
        unsubscribeJobs = onCollectionSnapshot(COLLECTIONS.JOBS, (jobsData) => {
          if (Array.isArray(jobsData) && isMounted) {
            const sortedJobs = mapWithTimestamps(jobsData).sort(sortByCreatedAt);
            dispatch({ type: 'SET_JOBS', payload: sortedJobs });
            saveLocalCache(COLLECTIONS.JOBS, sortedJobs);
          }
        });
      } catch (e) {
        console.warn('Jobs realtime error:', e);
      }

      try {
        unsubscribeLiveExams = onCollectionSnapshot(COLLECTIONS.LIVE_EXAMS, (liveExamsData) => {
          if (Array.isArray(liveExamsData) && isMounted) {
            const sortedExams = mapWithTimestamps(liveExamsData).sort(sortByCreatedAt);
            dispatch({ type: 'SET_LIVE_EXAMS', payload: sortedExams });
            saveLocalCache(COLLECTIONS.LIVE_EXAMS, sortedExams);
          }
        });
      } catch (e) {
        console.warn('LiveExams realtime error:', e);
      }

      try {
        unsubscribeAdmits = onCollectionSnapshot(COLLECTIONS.ADMITS, (admitsData) => {
          if (Array.isArray(admitsData) && isMounted) {
            const sortedAdmits = mapWithTimestamps(admitsData).sort(sortByCreatedAt);
            dispatch({ type: 'SET_ADMITS', payload: sortedAdmits });
            saveLocalCache(COLLECTIONS.ADMITS, sortedAdmits);
          }
        });
      } catch (e) {
        console.warn('Admits realtime error:', e);
      }

      try {
        unsubscribeQuestions = onCollectionSnapshot(COLLECTIONS.QUESTIONS, (questionsData) => {
          if (Array.isArray(questionsData) && isMounted) {
            const sortedQuestions = mapWithTimestamps(questionsData).sort(sortByCreatedAt);
            dispatch({ type: 'SET_QUESTIONS', payload: sortedQuestions });
            saveLocalCache(COLLECTIONS.QUESTIONS, sortedQuestions);
          }
        });
      } catch (e) {
        console.warn('Questions realtime error:', e);
      }

      try {
        unsubscribeNotifs = onCollectionSnapshot(COLLECTIONS.NOTIFICATIONS, (notifsData) => {
          if (Array.isArray(notifsData) && isMounted) {
            const sortedNotifs = mapWithTimestamps(notifsData).sort(sortByCreatedAt);
            dispatch({ type: 'SET_NOTIFICATIONS', payload: sortedNotifs });
            saveLocalCache(COLLECTIONS.NOTIFICATIONS, sortedNotifs);
          }
        });
      } catch (e) {
        console.warn('Notifications realtime error:', e);
      }

      try {
        unsubscribeActivities = onCollectionSnapshot(COLLECTIONS.ACTIVITIES, (activitiesData) => {
          if (Array.isArray(activitiesData) && isMounted) {
            const sortedActivities = mapWithTimestamps(activitiesData).sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
            dispatch({ type: 'SET_ACTIVITIES', payload: sortedActivities });
            saveLocalCache(COLLECTIONS.ACTIVITIES, sortedActivities);
          }
        });
      } catch (e) {
        console.warn('Activities realtime error:', e);
      }
    }

    return () => {
      isMounted = false;
      clearTimeout(authTimeout);
      unsubscribeJobs();
      unsubscribeLiveExams();
      unsubscribeAdmits();
      unsubscribeQuestions();
      unsubscribeNotifs();
      unsubscribeActivities();
      unsubscribeAuth();
    };
  }, []);

  const refreshData = async (forceServer = true) => {
    await loadAllData(forceServer);
  };

  return (
    <div className="admin-context-provider">
        <AdminContext.Provider value={{ state, dispatch, loading, authChecked, refreshData }}>
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
