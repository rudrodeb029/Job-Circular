import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { setDocument, syncCoreDataOnStartup, clearCollectionCache, COLLECTIONS } from '../services/supabaseService';
import { initDb, triggerDeltaSync } from '../services/sqliteService';

const AppContext = createContext();

const initialUser = {
  id: localStorage.getItem('user_id') || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: '',
  phone: '',
  qualification: '',
  category: 'gov',
  location: '',
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
  feedPosts: [],
  likedPosts: JSON.parse(localStorage.getItem('liked_posts') || '[]'),
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
    case 'SET_FEED_POSTS':
      return { ...state, feedPosts: action.payload || [] };
    case 'TOGGLE_LIKE_POST': {
      const postId = action.payload;
      const isLiked = state.likedPosts.includes(postId);
      const newLikedPosts = isLiked
        ? state.likedPosts.filter(id => id !== postId)
        : [...state.likedPosts, postId];
      localStorage.setItem('liked_posts', JSON.stringify(newLikedPosts));
      return { ...state, likedPosts: newLikedPosts };
    }
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

  // Sync profile/saved data to D1 Queue (0 direct Supabase calls!)
  if (['UPDATE_USER_PROFILE', 'TOGGLE_SAVE_JOB', 'TOGGLE_APPLY_JOB', 'MARK_APPLIED'].includes(action.type)) {
      const { id, ...userData } = newState.user;
      const WORKER_URL = 'https://job-circular-proxy.rudrodeb029.workers.dev';
      fetch(`${WORKER_URL}/user/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              userId: id,
              userData: {
                  ...userData,
                  savedJobs: newState.savedJobs,
                  appliedJobs: newState.appliedJobs
              }
          })
      }).catch(err => console.error('Cloudflare profile sync error:', err));
  }

  return newState;
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [hasNewUpdates, setHasNewUpdates] = React.useState(false);
  const [isStartupSyncing, setIsStartupSyncing] = React.useState(false);
  const isSqliteInitRef = useRef(false);

  // ✅ Loader ক্লিক: Cloudflare Worker থেকে সর্বদা তাজা/নতুন ডাটা সিঙ্ক করে UI আপডেট করে
  const triggerPillRefresh = useCallback(async () => {
    try {
      console.log('⚡ Floating Loader Clicked: Fetching fresh data from Cloudflare Worker...');
      const data = await syncCoreDataOnStartup(true);
      await triggerDeltaSync();
      if (data && (data.masterLastUpdated || data.syncedAt)) {
        localStorage.setItem('last_updated_server', data.masterLastUpdated || data.syncedAt);
      }
      window.dispatchEvent(new CustomEvent('force_app_data_reload'));
      console.log('⚡ Floating Loader Clicked: Fresh data synced & UI re-rendered instantly!');
      return data;
    } catch (err) {
      console.error('Floating loader sync error:', err);
      return null;
    }
  }, []);

  // ✅ App খোলার সময় একবার: syncCoreDataOnStartup চালায়
  useEffect(() => {
    syncCoreDataOnStartup().catch(err => console.error('Initial startup sync error:', err));

    if (!isSqliteInitRef.current) {
      isSqliteInitRef.current = true;
      // Initialize SQLite Database
      initDb().then(success => {
        if (success) {
          triggerDeltaSync().catch(err => console.error('Background sync failed:', err));
        }
      });
    }

    if (!localStorage.getItem('installTime')) {
      localStorage.setItem('installTime', state.installTime);
    }
    document.documentElement.setAttribute('data-theme', state.theme);
    document.documentElement.setAttribute('data-lang', state.language);

    const handleFeedPostsUpdated = (e) => {
      if (e.detail) dispatch({ type: 'SET_FEED_POSTS', payload: e.detail });
    };
    const handleSyncStarted = () => setIsStartupSyncing(true);
    const handleSyncFinished = () => setIsStartupSyncing(false);

    window.addEventListener('feed_posts_updated', handleFeedPostsUpdated);
    window.addEventListener('app_sync_started', handleSyncStarted);
    window.addEventListener('app_sync_finished', handleSyncFinished);

    return () => {
      window.removeEventListener('feed_posts_updated', handleFeedPostsUpdated);
      window.removeEventListener('app_sync_started', handleSyncStarted);
      window.removeEventListener('app_sync_finished', handleSyncFinished);
    };
  }, [state.theme, state.installTime, state.language]);

  return (
    <AppContext.Provider value={{ state, dispatch, hasNewUpdates, setHasNewUpdates, triggerPillRefresh, isStartupSyncing }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
}
