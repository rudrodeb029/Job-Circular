import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { setDocument, syncCoreDataOnStartup, subscribeToAppUpdates, clearCollectionCache, COLLECTIONS } from '../services/supabaseService';
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
  const [hasNewUpdates, setHasNewUpdates] = React.useState(false);
  const isSqliteInitRef = useRef(false);

  const triggerPillRefresh = async () => {
    setHasNewUpdates(false);
    try {
      await Promise.all([
        syncCoreDataOnStartup(true),
        triggerDeltaSync()
      ]);
      console.log('⚡ Floating Loader Clicked: Fresh data synced from Cloudflare Worker!');
    } catch (err) {
      console.error('Floating loader sync error:', err);
    }
  };

  useEffect(() => {
    if (!isSqliteInitRef.current) {
      isSqliteInitRef.current = true;
      // Initialize SQLite Database
      initDb().then(success => {
        if (success) {
          triggerDeltaSync().catch(err => console.error('Background sync failed:', err));
        }
      });

      // ─── 4-Hour Sync Lock Policy (Preserves Cache for General Navigation) ───
      const lastSyncTimestamp = Number(localStorage.getItem('last_sync_timestamp') || 0);
      const now = Date.now();
      const FOUR_HOURS_MS = 4 * 60 * 60 * 1000; // 4 Hours

      if (!lastSyncTimestamp || lastSyncTimestamp === 0) {
        console.log('🆕 First Time Boot: Executing /sync-all download...');
        syncCoreDataOnStartup(true).catch(err => console.error('Initial sync error:', err));
      } else if (now - lastSyncTimestamp < FOUR_HOURS_MS) {
        const remainingMins = Math.round((FOUR_HOURS_MS - (now - lastSyncTimestamp)) / 60000);
        console.log(`🔒 4-Hour Cache Lock Active (${remainingMins} mins remaining): Preserving cache for internal app navigation.`);
      } else {
        console.log('⏳ 4-Hour Sync Lock Expired: Running background revalidation check...');
        syncCoreDataOnStartup(false).catch(err => console.error('Background revalidation error:', err));
      }
    }

    if (!localStorage.getItem('installTime')) {
      localStorage.setItem('installTime', state.installTime);
    }
    document.documentElement.setAttribute('data-theme', state.theme);
    document.documentElement.setAttribute('data-lang', state.language);

    const handleFeedPostsUpdated = (e) => {
      if (e.detail) dispatch({ type: 'SET_FEED_POSTS', payload: e.detail });
    };
    window.addEventListener('feed_posts_updated', handleFeedPostsUpdated);

    // Instant Realtime Broadcast Sync Signal: Set floating loader icon state to true ONLY
    const unsubscribe = subscribeToAppUpdates((collectionName) => {
      console.log('⚡ Realtime Update Signal Received for collection:', collectionName);
      setHasNewUpdates(true);
    });

    // Periodic Low-Frequency Check (Every 15 Seconds) against Cloudflare Worker /check-updates
    const checkInterval = setInterval(async () => {
      try {
        const proxyUrl = 'https://job-circular-proxy.rudrodeb029.workers.dev';
        const res = await fetch(`${proxyUrl}/check-updates?t=${Date.now()}`, {
          headers: { 
            'X-App-Client': 'live-circular',
            'Cache-Control': 'no-cache, no-store'
          },
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          const serverTime = data?.[0]?.last_updated ? new Date(data[0].last_updated).getTime() : 0;
          const lastSyncedAt = localStorage.getItem('last_updated_server');
          const clientTime = lastSyncedAt ? new Date(lastSyncedAt).getTime() : 0;

          if (serverTime > 0 && serverTime > clientTime) {
            console.log('⚡ Cloudflare Master Timestamp update detected! Showing floating loader icon...');
            setHasNewUpdates(true);
          }
        }
      } catch (e) {}
    }, 15000);

    return () => {
      window.removeEventListener('feed_posts_updated', handleFeedPostsUpdated);
      clearInterval(checkInterval);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [state.theme, state.installTime, state.language]);

  return (
    <AppContext.Provider value={{ state, dispatch, hasNewUpdates, setHasNewUpdates, triggerPillRefresh }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
}
