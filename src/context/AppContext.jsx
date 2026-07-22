import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

const savedUser = JSON.parse(localStorage.getItem('job_user')) || {
  name: 'Suvro Rahman',
  email: 'suvro100@gmail.com',
  phone: '01712345678',
  qualification: 'স্নাতক (Bachelor)',
  category: 'gov',
  location: 'ঢাকা',
  avatar: null
};

const initialState = {
  user: savedUser,
  savedJobs: JSON.parse(localStorage.getItem('savedJobs')) || [],
  appliedJobs: JSON.parse(localStorage.getItem('appliedJobs')) || [],
  readNotifications: JSON.parse(localStorage.getItem('readNotifications')) || [],
  theme: localStorage.getItem('theme_v2') || 'light',
  language: localStorage.getItem('language') || 'bn', // Default app language is Bengali (bn)
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
  switch (action.type) {
    case 'UPDATE_USER_PROFILE': {
      const updatedUser = { ...state.user, ...action.payload };
      localStorage.setItem('job_user', JSON.stringify(updatedUser));
      return { ...state, user: updatedUser };
    }

    case 'TOGGLE_SAVE_JOB': {
      const isSaved = state.savedJobs.includes(action.payload);
      const newSavedJobs = isSaved 
        ? state.savedJobs.filter(id => id !== action.payload)
        : [...state.savedJobs, action.payload];
      
      localStorage.setItem('savedJobs', JSON.stringify(newSavedJobs));
      return { ...state, savedJobs: newSavedJobs };
    }
    
    case 'TOGGLE_APPLY_JOB':
    case 'MARK_APPLIED': {
      const isApplied = state.appliedJobs.includes(action.payload);
      const newAppliedJobs = isApplied && action.type === 'TOGGLE_APPLY_JOB'
        ? state.appliedJobs.filter(id => id !== action.payload)
        : isApplied ? state.appliedJobs : [...state.appliedJobs, action.payload];
      
      localStorage.setItem('appliedJobs', JSON.stringify(newAppliedJobs));
      return { ...state, appliedJobs: newAppliedJobs };
    }
    
    case 'MARK_NOTIFICATION_READ': {
      if (state.readNotifications.includes(action.payload)) return state;
      const newReadNotifications = [...state.readNotifications, action.payload];
      localStorage.setItem('readNotifications', JSON.stringify(newReadNotifications));
      return { ...state, readNotifications: newReadNotifications };
    }

    case 'MARK_ALL_NOTIFICATIONS_READ': {
      const newReadNotifications = action.payload; // array of all notification IDs
      localStorage.setItem('readNotifications', JSON.stringify(newReadNotifications));
      return { ...state, readNotifications: newReadNotifications };
    }
    
    case 'TOGGLE_THEME': {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme_v2', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      return { ...state, theme: newTheme };
    }

    case 'SET_LANGUAGE': {
      localStorage.setItem('language', action.payload);
      return { ...state, language: action.payload };
    }

    case 'SET_ONBOARDING_SEEN': {
      localStorage.setItem('hasSeenOnboarding', JSON.stringify(true));
      return { ...state, hasSeenOnboarding: true };
    }

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_FILTERS':
      return { ...state, activeFilters: { ...state.activeFilters, ...action.payload } };

    case 'RESET_FILTERS':
      return {
        ...state,
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

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
