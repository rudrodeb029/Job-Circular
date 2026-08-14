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
  adminUser: null,
  activities: [],
  firestoreReady: false
};

const adminReducer = (state, action) => {
  let newState = { ...state };

  switch (action.type) {
    // --- Bulk Setters ---
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
        newState.jobs = [job, ...state.jobs.filter(j => j.id !== job.id)].sort(sortByCreatedAt);
      } else {
        newState.jobs = state.jobs.map(j => j.id === job.id ? job : j).sort(sortByCreatedAt);
      }
      saveLocalCache(COLLECTIONS.JOBS, newState.jobs);
      return newState;

    case 'DELETE_JOB': {
      deleteDocument(COLLECTIONS.JOBS, action.payload).catch(console.error);
      newState.jobs = state.jobs.filter(j => j.id !== action.payload);
      saveLocalCache(COLLECTIONS.JOBS, newState.jobs);
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
      deleteDocument(COLLECTIONS.QUESTIONS, action.payload).catch(console.error);
      newState.questions = state.questions.filter(item => item.id !== action.payload);
      saveLocalCache(COLLECTIONS.QUESTIONS, newState.questions);
      return newState;
    }

    case 'ADD_LIVE_EXAM':
    case 'UPDATE_LIVE_EXAM': {
      const examItem = action.payload;
      setDocument(COLLECTIONS.LIVE_EXAMS, examItem.id, examItem).catch(console.error);

      if (action.type === 'ADD_LIVE_EXAM') {
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
        newState.liveExams = state.liveExams.map(e => e.id === examItem.id ? examItem : e).sort(sortByCreatedAt);
      }
      saveLocalCache(COLLECTIONS.LIVE_EXAMS, newState.liveExams);
      return newState;
    }

    case 'DELETE_EXAM': {
      deleteDocument(COLLECTIONS.LIVE_EXAMS, action.payload).catch(console.error);
      newState.liveExams = state.liveExams.filter(e => e.id !== action.payload);
      saveLocalCache(COLLECTIONS.LIVE_EXAMS, newState.liveExams);
      return newState;
    }

    case 'ADD_QUESTION_PAPER':
    case 'UPDATE_QUESTION_PAPER': {
      const paperItem = action.payload;
      setDocument(COLLECTIONS.QUESTIONS, paperItem.id, paperItem).catch(console.error);

      if (action.type === 'ADD_QUESTION_PAPER') {
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
        newState.questions = state.questions.map(p => p.id === paperItem.id ? paperItem : p).sort(sortByCreatedAt);
      }
      saveLocalCache(COLLECTIONS.QUESTIONS, newState.questions);
      return newState;
    }

    case 'DELETE_QUESTION_PAPER': {
      deleteDocument(COLLECTIONS.QUESTIONS, action.payload).catch(console.error);
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

  const loadAllData = async (forceServer = true) => {
    try {
      setLoading(true);
      if (forceServer) {
        clearCollectionCache(COLLECTIONS.JOBS);
        clearCollectionCache(COLLECTIONS.NOTIFICATIONS);
        clearCollectionCache(COLLECTIONS.ADMITS);
        clearCollectionCache(COLLECTIONS.QUESTIONS);
        clearCollectionCache(COLLECTIONS.LIVE_EXAMS);
      }

      const [jobsData, notifsData, admitsData, questionsData, liveExamsData] = await Promise.all([
        getCollectionCached(COLLECTIONS.JOBS, forceServer),
        getCollectionCached(COLLECTIONS.NOTIFICATIONS, forceServer),
        getCollectionCached(COLLECTIONS.ADMITS, forceServer),
        getCollectionCached(COLLECTIONS.QUESTIONS, forceServer),
        getCollectionCached(COLLECTIONS.LIVE_EXAMS, forceServer, 2)
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
    // 1. Initial fetch from server to guarantee fresh data
    loadAllData(true);

    // 2. Real-time snapshot listener for JOBS collection
    const unsubscribeJobs = onCollectionSnapshot(COLLECTIONS.JOBS, (jobsData) => {
      if (Array.isArray(jobsData) && jobsData.length > 0) {
        const sortedJobs = mapWithTimestamps(jobsData).sort(sortByCreatedAt);
        dispatch({ type: 'SET_JOBS', payload: sortedJobs });
        saveLocalCache(COLLECTIONS.JOBS, sortedJobs);
      }
    });

    // 3. Real-time snapshot listener for LIVE_EXAMS collection
    const unsubscribeLiveExams = onCollectionSnapshot(COLLECTIONS.LIVE_EXAMS, (liveExamsData) => {
      if (Array.isArray(liveExamsData) && liveExamsData.length > 0) {
        const sortedExams = mapWithTimestamps(liveExamsData).sort(sortByCreatedAt);
        dispatch({ type: 'SET_LIVE_EXAMS', payload: sortedExams });
        saveLocalCache(COLLECTIONS.LIVE_EXAMS, sortedExams);
      }
    });

    // 4. Real-time snapshot listener for ADMITS collection
    const unsubscribeAdmits = onCollectionSnapshot(COLLECTIONS.ADMITS, (admitsData) => {
      if (Array.isArray(admitsData) && admitsData.length > 0) {
        const sortedAdmits = mapWithTimestamps(admitsData).sort(sortByCreatedAt);
        dispatch({ type: 'SET_ADMITS', payload: sortedAdmits });
        saveLocalCache(COLLECTIONS.ADMITS, sortedAdmits);
      }
    });

    // 5. Real-time snapshot listener for QUESTIONS collection
    const unsubscribeQuestions = onCollectionSnapshot(COLLECTIONS.QUESTIONS, (questionsData) => {
      if (Array.isArray(questionsData) && questionsData.length > 0) {
        const sortedQuestions = mapWithTimestamps(questionsData).sort(sortByCreatedAt);
        dispatch({ type: 'SET_QUESTIONS', payload: sortedQuestions });
        saveLocalCache(COLLECTIONS.QUESTIONS, sortedQuestions);
      }
    });

    // 6. Real-time snapshot listener for NOTIFICATIONS collection
    const unsubscribeNotifs = onCollectionSnapshot(COLLECTIONS.NOTIFICATIONS, (notifsData) => {
      if (Array.isArray(notifsData) && notifsData.length > 0) {
        const sortedNotifs = mapWithTimestamps(notifsData).sort(sortByCreatedAt);
        dispatch({ type: 'SET_NOTIFICATIONS', payload: sortedNotifs });
        saveLocalCache(COLLECTIONS.NOTIFICATIONS, sortedNotifs);
      }
    });

    return () => {
      unsubscribeJobs();
      unsubscribeLiveExams();
      unsubscribeAdmits();
      unsubscribeQuestions();
      unsubscribeNotifs();
    };
  }, []);

  const refreshData = async (forceServer = true) => {
    await loadAllData(forceServer);
  };

  return (
    <div className="admin-context-provider">
        <AdminContext.Provider value={{ state, dispatch, loading, refreshData }}>
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
