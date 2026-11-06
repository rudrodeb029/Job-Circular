import { useEffect } from 'react';

// Stack of active back button interceptors (e.g., open drawers, modals, lightboxes)
const interceptors = [];

/**
 * Register a back button interceptor.
 * If the handler returns true, the back button event is considered consumed.
 * Handlers are invoked in reverse order of registration (LIFO - Last In First Out).
 * 
 * @param {() => boolean | void} fn
 * @returns {() => void} Unsubscribe function
 */
export function registerBackInterceptor(fn) {
  if (typeof fn !== 'function') return () => {};
  interceptors.push(fn);
  return () => {
    const idx = interceptors.lastIndexOf(fn);
    if (idx !== -1) {
      interceptors.splice(idx, 1);
    }
  };
}

/**
 * React hook to register an interceptor when condition is true.
 * Automatically unregisters when unmounted or disabled.
 */
export function useBackInterceptor(handler, isEnabled = true) {
  useEffect(() => {
    if (!isEnabled || typeof handler !== 'function') return;
    const unregister = registerBackInterceptor(handler);
    return unregister;
  }, [handler, isEnabled]);
}

/**
 * Runs active interceptors.
 * Returns true if an interceptor handled the back press.
 */
export function runBackInterceptors() {
  for (let i = interceptors.length - 1; i >= 0; i--) {
    const handler = interceptors[i];
    try {
      const handled = handler();
      if (handled) {
        return true;
      }
    } catch (e) {
      console.warn('Error running back interceptor:', e);
    }
  }
  return false;
}

let lastBackPressTime = 0;

/**
 * Global Android Hardware & Gesture Back Button Handler
 * Correctly navigates back on every page, handles double-tap to exit on root,
 * and falls back safely to parent sections when no history stack exists.
 */
export function handleAppBackButton({
  canGoBack = false,
  location,
  navigate,
  showUpdateModal = false,
  closeUpdateModal,
  language = 'bn',
  onShowExitToast,
  onExitApp,
  navigateWithAdOnReturn
}) {
  // 1. Run custom interceptors (Drawers, Modals, Lightboxes)
  if (runBackInterceptors()) {
    return;
  }

  // 2. Dismiss update modal if open
  if (showUpdateModal && typeof closeUpdateModal === 'function') {
    closeUpdateModal();
    return;
  }

  const currentPath = location?.pathname || '/home';

  // 3. Root pages: Double-tap back to exit
  const isRootPage = currentPath === '/' || currentPath === '/home' || currentPath === '/splash' || currentPath === '/onboarding';
  if (isRootPage) {
    const now = Date.now();
    if (now - lastBackPressTime < 2000) {
      if (typeof onExitApp === 'function') {
        onExitApp();
      }
    } else {
      lastBackPressTime = now;
      if (typeof onShowExitToast === 'function') {
        onShowExitToast();
      }
    }
    return;
  }

  // 4. Check if browser / router history stack is available
  const hasRouterHistory = window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0;
  const canPop = hasRouterHistory || canGoBack;

  // 5. Special route handling:
  // Question Paper Details
  if (currentPath.startsWith('/question-details/')) {
    if (typeof navigateWithAdOnReturn === 'function') {
      navigateWithAdOnReturn(navigate, canPop ? -1 : '/questions-hub');
    } else if (canPop) {
      navigate(-1);
    } else {
      navigate('/questions-hub');
    }
    return;
  }

  // Live Exam Room
  if (currentPath.startsWith('/live-exam-room/')) {
    if (typeof navigateWithAdOnReturn === 'function') {
      navigateWithAdOnReturn(navigate, canPop ? -1 : '/live-exams-list');
    } else if (canPop) {
      navigate(-1);
    } else {
      navigate('/live-exams-list');
    }
    return;
  }

  // Live Exams List
  if (currentPath === '/live-exams' || currentPath === '/live-exams-list') {
    if (canPop) {
      navigate(-1);
    } else {
      navigate('/questions-hub');
    }
    return;
  }

  // Question Categories / Hub
  if (currentPath.startsWith('/questions/')) {
    if (canPop) {
      navigate(-1);
    } else {
      navigate('/questions-hub');
    }
    return;
  }
  if (currentPath === '/questions-hub') {
    if (canPop) {
      navigate(-1);
    } else {
      navigate('/home');
    }
    return;
  }

  // Offline Feed
  if (currentPath === '/offline-feed') {
    if (canPop) {
      navigate(-1);
    } else {
      navigate('/feed');
    }
    return;
  }

  // Settings & Static / Profile Sub-pages
  if (['/settings', '/edit-profile', '/privacy', '/terms', '/about', '/contact', '/rate', '/share'].includes(currentPath)) {
    if (canPop) {
      navigate(-1);
    } else {
      navigate('/profile');
    }
    return;
  }

  // Circular Details, Exam Details, Result Details, Lists, Search, Admit Card
  if (
    currentPath.startsWith('/job/') ||
    currentPath.startsWith('/exam-details/') ||
    currentPath.startsWith('/result-details/') ||
    currentPath === '/all-circulars' ||
    currentPath === '/categories' ||
    currentPath === '/search' ||
    currentPath === '/admit-card'
  ) {
    if (canPop) {
      navigate(-1);
    } else {
      navigate('/home');
    }
    return;
  }

  // Admin Routes
  if (currentPath.startsWith('/admin')) {
    if (currentPath === '/admin' || currentPath === '/admin/dashboard') {
      navigate('/home');
    } else if (canPop) {
      navigate(-1);
    } else {
      navigate('/admin/dashboard');
    }
    return;
  }

  // Bottom Navigation Tabs (/feed, /saved, /notifications, /profile)
  if (['/feed', '/saved', '/notifications', '/profile'].includes(currentPath)) {
    if (canPop) {
      navigate(-1);
    } else {
      navigate('/home');
    }
    return;
  }

  // Universal Fallback
  if (canPop) {
    navigate(-1);
  } else {
    navigate('/home');
  }
}

