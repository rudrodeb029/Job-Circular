import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { setDocument, COLLECTIONS } from '../services/firestoreService';

const AppContext = createContext();

const initialUser = {
  id: localStorage.getItem('user_id') || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: '',
  phone: '',
  qualification: 'স্নাতক (Bachelor)',
  category: 'gov',
  location: 'ঢাকা',
  avatar: null
};

if (!localStorage.getItem('user_id')) {
    localStorage.setItem('user_id', initialUser.id);
}

const savedUser = JSON.parse(localStorage.getItem('job_user')) || initialUser;

const initialState = {
  user: savedUser,
  savedJobs: JSON.parse(localStorage.getItem('savedJobs')) || [],
  appliedJobs: JSON.parse(localStorage.getItem('appliedJobs')) || [],
  readNotifications: JSON.parse(localStorage.getItem('readNotifications')) || [],
  theme: localStorage.getItem('theme_v2') || 'light',
  language: localStorage.getItem('language') || 'bn',
  installTime: localStorage.getItem('installTime') || new Date().toISOString(),
  hasSeenOnboarding: JSON.parse(localStorage.getItem('hasSeenOnboarding')) || false,
  searchQuery: '',
  activeFilters: {
    type: 'all',
    qualification: '',
    location: '',
    deadline: '',
    experience: '',
    jobType: ''
  }
};

function appReducer(state, action) {
  let newState;
  switch (action.type) {
    case 'UPDATE_USER_PROFILE':
      newState = { ...state, user: { ...state.user, ...action.payload } };
      localStorage.setItem('job_user', JSON.stringify(newState.user));
      break;
    case 'TOGGLE_SAVE_JOB':
      const isSaved = state.savedJobs.includes(action.payload);
      newState = {
        ...state,
        savedJobs: isSaved ? state.savedJobs.filter(id => id !== action.payload) : [...state.savedJobs, action.payload]
      };
      localStorage.setItem('savedJobs', JSON.stringify(newState.savedJobs));
      break;
    case 'TOGGLE_APPLY_JOB':
    case 'MARK_APPLIED':
      const isApplied = state.appliedJobs.includes(action.payload);
      newState = {
        ...state,
        appliedJobs: (isApplied && action.type === 'TOGGLE_APPLY_JOB') ? state.appliedJobs.filter(id => id !== action.payload) : [...state.appliedJobs, action.payload]
      };
      localStorage.setItem('appliedJobs', JSON.stringify(newState.appliedJobs));
      break;
    case 'SET_ONBOARDING_SEEN':
      newState = { ...state, hasSeenOnboarding: true };
      localStorage.setItem('hasSeenOnboarding', 'true');
      break;
    case 'TOGGLE_THEME':
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      newState = { ...state, theme: nextTheme };
      localStorage.setItem('theme_v2', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      break;
    case 'SET_LANGUAGE':
      newState = { ...state, language: action.payload };
      localStorage.setItem('language', action.payload);
      break;
    case 'MARK_NOTIFICATION_READ':
      if (state.readNotifications.includes(action.payload)) return state;
      newState = {
        ...state,
        readNotifications: [...state.readNotifications, action.payload]
      };
      localStorage.setItem('readNotifications', JSON.stringify(newState.readNotifications));
      break;
    case 'MARK_ALL_NOTIFICATIONS_READ':
      const newRead = Array.from(new Set([...state.readNotifications, ...action.payload]));
      newState = {
        ...state,
        readNotifications: newRead
      };
      localStorage.setItem('readNotifications', JSON.stringify(newState.readNotifications));
      break;
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_FILTERS':
      return { ...state, activeFilters: { ...state.activeFilters, ...action.payload } };
    case 'RESET_FILTERS':
      return {
        ...state,
        searchQuery: '',
        activeFilters: { type: 'all', qualification: '', location: '', deadline: '', experience: '', jobType: '' }
      };
    default:
      return state;
  }

  // Sync profile/saved data to Firestore
  if (['UPDATE_USER_PROFILE', 'TOGGLE_SAVE_JOB', 'TOGGLE_APPLY_JOB', 'MARK_APPLIED'].includes(action.type)) {
      const { id, ...userData } = newState.user;
      console.log('Syncing user profile to Firestore:', id);
      setDocument(COLLECTIONS.USERS, id, {
          ...userData,
          savedJobs: newState.savedJobs,
          appliedJobs: newState.appliedJobs,
          updatedAt: new Date().toISOString()
      }).catch(err => console.error('Firestore sync error details:', err.message || err));
  }

  return newState;
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    if (!localStorage.getItem('installTime')) {
      localStorage.setItem('installTime', state.installTime);
    }
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme, state.installTime]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
}
