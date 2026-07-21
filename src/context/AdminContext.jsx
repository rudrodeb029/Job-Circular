import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { jobs as initialJobs } from '../data/jobs';
import { notifications as initialNotifications, admitCardsAndResults as initialAdmits } from '../data/notifications';
import { categories } from '../data/categories';

const AdminContext = createContext();

// Load from localStorage or use initial data
const loadState = (key, defaultData) => {
  try {
    const saved = localStorage.getItem(`admin_${key}`);
    return saved ? JSON.parse(saved) : defaultData;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultData;
  }
};

const mapJobs = (jobs) => {
  return jobs.map(job => ({
    ...job,
    status: job.status || 'active',
    createdAt: job.createdAt || new Date().toISOString(),
    updatedAt: job.updatedAt || new Date().toISOString()
  }));
};

const initialState = {
  jobs: loadState('jobs', mapJobs(initialJobs)),
  notifications: loadState('notifications', initialNotifications),
  admits: loadState('admits', initialAdmits),
  categories: categories, // Read-only from existing file
  activities: loadState('activities', []),
  adminUser: loadState('user', null),
};

const adminReducer = (state, action) => {
  let newState;
  switch (action.type) {
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

    case 'ADD_ACTIVITY':
      newState = { ...state, activities: [action.payload, ...state.activities] };
      break;

    case 'ADMIN_LOGIN':
      newState = { ...state, adminUser: action.payload };
      break;
    case 'ADMIN_LOGOUT':
      newState = { ...state, adminUser: null };
      break;

    default:
      return state;
  }

  // Persist the specific state slice that changed
  if (['ADD_JOB', 'UPDATE_JOB', 'DELETE_JOB', 'TOGGLE_JOB_STATUS'].includes(action.type)) {
    localStorage.setItem('admin_jobs', JSON.stringify(newState.jobs));
  } else if (['ADD_NOTIFICATION', 'UPDATE_NOTIFICATION', 'DELETE_NOTIFICATION'].includes(action.type)) {
    localStorage.setItem('admin_notifications', JSON.stringify(newState.notifications));
  } else if (['ADD_ADMIT', 'UPDATE_ADMIT', 'DELETE_ADMIT'].includes(action.type)) {
    localStorage.setItem('admin_admits', JSON.stringify(newState.admits));
  } else if (action.type === 'ADD_ACTIVITY') {
    localStorage.setItem('admin_activities', JSON.stringify(newState.activities));
  } else if (['ADMIN_LOGIN', 'ADMIN_LOGOUT'].includes(action.type)) {
    localStorage.setItem('admin_user', JSON.stringify(newState.adminUser));
  }

  return newState;
};

export const AdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Sync state with local storage just in case multiple tabs are open (optional but good practice)
  
  return (
    <AdminContext.Provider value={{ state, dispatch }}>
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
    // Count status
    if (job.status === 'active') stats.active++;
    else if (job.status === 'draft') stats.draft++;
    else if (job.status === 'expired') stats.expired++;
    
    // Count by category
    if (job.category) {
      stats.byCategory[job.category] = (stats.byCategory[job.category] || 0) + 1;
    }
  });

  return stats;
};
