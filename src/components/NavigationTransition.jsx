import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import ModernLoader from './ModernLoader';
import { useAppContext } from '../context/AppContext';

/**
 * Route Hierarchy Depth Definition
 * Level 0: Primary bottom navigation tabs
 * Level 1: Sub-sections, lists, categories, search, settings, static pages
 * Level 2: Detailed entity views (JobDetails, ExamDetails, ResultDetails, QuestionDetails)
 * Level 3: Immersive full-screen exam room
 */
export const getRouteDepth = (path = '') => {
  if (path === '/' || path === '/home' || path === '/feed' || path === '/saved' || path === '/notifications' || path === '/profile') {
    return 0;
  }
  if (path.startsWith('/live-exam-room/')) {
    return 3;
  }
  if (
    path.startsWith('/job/') ||
    path.startsWith('/exam-details/') ||
    path.startsWith('/result-details/') ||
    path.startsWith('/question-details/') ||
    path.startsWith('/questions/')
  ) {
    return 2;
  }
  return 1;
};

/**
 * Primary Tab Navigation Order:
 * Home (0) -> Feed (1) -> Saved (2) -> Notifications (3) -> Profile (4)
 */
export const TAB_ORDER = {
  '/': 0,
  '/home': 0,
  '/feed': 1,
  '/saved': 2,
  '/notifications': 3,
  '/profile': 4
};

/**
 * Robust Two-Way Navigation Stack Tracker Hook
 * Tracks history stack entries synchronously during render.
 * Accurately determines if the user is pushing a new page (Forward) or popping a page (Back),
 * even during rapid multi-step back/forward button presses and bottom tab switches.
 */
export function useNavigationTracker(location, navigationType) {
  // Stack tracking ref: [{ key, pathname, search }]
  const stackRef = useRef([
    { key: location.key, pathname: location.pathname, search: location.search }
  ]);
  const pointerRef = useRef(0);
  const directionRef = useRef('forward'); // 'forward' | 'back'
  const lastKeyRef = useRef(location.key);
  const lastPathRef = useRef(location.pathname);

  // Synchronous, render-time direction evaluation (zero-frame latency)
  if (location.key !== lastKeyRef.current) {
    const prevPath = lastPathRef.current;
    const nextPath = location.pathname;

    // Special rule for Home: returning to Home is ALWAYS 'back' (smooth left-to-right slide)
    // unless navigating directly from Splash or Onboarding
    if (nextPath === '/' || nextPath === '/home') {
      if (prevPath !== '/splash' && prevPath !== '/onboarding') {
        directionRef.current = 'back';
      } else {
        directionRef.current = 'forward';
      }
      const homeIndex = stackRef.current.findIndex(e => e.pathname === '/' || e.pathname === '/home');
      if (homeIndex !== -1) {
        pointerRef.current = homeIndex;
      } else {
        stackRef.current = [{ key: location.key, pathname: location.pathname, search: location.search }];
        pointerRef.current = 0;
      }
    } else {
      const existingIndex = stackRef.current.findIndex(e => e.key === location.key);

      if (existingIndex !== -1) {
        // Key found in history stack
        if (existingIndex < pointerRef.current) {
          // Popping backwards in history stack
          directionRef.current = 'back';
          pointerRef.current = existingIndex;
        } else if (existingIndex > pointerRef.current) {
          // Navigating forward in history stack
          directionRef.current = 'forward';
          pointerRef.current = existingIndex;
        }
        // If equal, direction remains stable
      } else {
        // Key not in history stack (new route pushed or POP to unknown entry)
        if (navigationType === 'POP') {
          directionRef.current = 'back';
          if (pointerRef.current > 0) pointerRef.current -= 1;
          stackRef.current[pointerRef.current] = { key: location.key, pathname: location.pathname, search: location.search };
        } else {
          // PUSH or REPLACE
          const prevTabIndex = TAB_ORDER[prevPath] ?? -1;
          const nextTabIndex = TAB_ORDER[nextPath] ?? -1;

          if (prevTabIndex !== -1 && nextTabIndex !== -1) {
            // Switching between peer bottom tabs
            directionRef.current = nextTabIndex < prevTabIndex ? 'back' : 'forward';
          } else {
            const prevDepth = getRouteDepth(prevPath);
            const nextDepth = getRouteDepth(nextPath);
            directionRef.current = nextDepth < prevDepth ? 'back' : 'forward';
          }

          // Truncate any forward history beyond current pointer and push new entry
          stackRef.current = stackRef.current.slice(0, pointerRef.current + 1);
          stackRef.current.push({ key: location.key, pathname: location.pathname, search: location.search });
          pointerRef.current = stackRef.current.length - 1;
        }
      }
    }

    lastKeyRef.current = location.key;
    lastPathRef.current = location.pathname;
  }

  return {
    direction: directionRef.current,
    isBack: directionRef.current === 'back',
    historyDepth: pointerRef.current
  };
}

/**
 * Conditional Smart Page Loader
 * Activates seamlessly if a page takes more than a few milliseconds (75ms) to mount/render,
 * preventing any visual frame freezes or blank screens in Android WebView.
 * Instantly resets on rapid forward/back navigation.
 */
/**
 * Conditional Smart Page Loader
 * - 200ms Delay Trigger (No Flickering): The loader will NOT show up if page loads under 200ms
 * - Centered Modern Spinner: If page rendering takes >200ms, displays a centered modern glass orb overlay
 * - Proper Cleanup: Clears all timers on route navigation or unmount to avoid memory leaks
 * - WebView Performance: Hardware-accelerated with translate3d and will-change
 */
export function SmartPageLoader({ isNavigating }) {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (!isNavigating) {
      setShowSpinner(false);
      return;
    }

    // Strict 200ms delay trigger (prevents flickering on fast cached loads)
    const timer = setTimeout(() => {
      setShowSpinner(true);
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [isNavigating]);

  if (!showSpinner) return null;

  return (
    <div
      className="smart-loader-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}
    >
      <div className="smart-loader-card">
        <ModernLoader size="md" variant="brand" icon="⚡" />
      </div>
    </div>
  );
}

/**
 * Production-Ready GPU-Accelerated Page Transition Wrapper
 * - Instant frame-0 animation class assignment (Zero 1-frame pop/flash)
 * - Strict horizontal directional easing (Right->Left on Forward, Left->Right on Back)
 * - Y-axis locked strictly at 0
 * - Synchronous scroll reset via useLayoutEffect before paint
 * - Auto-cleans animation class on finish for native position:sticky stability
 */
export default function PageTransition({ children, isBack, locationKey, pathname }) {
  const containerRef = useRef(null);
  const isFirstMountRef = useRef(true);

  // Synchronous and immediate scroll reset BEFORE browser paint
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    const container = document.querySelector('.container');
    if (container) container.scrollTop = 0;
  }, [locationKey]);

  // Mark first mount as completed synchronously
  useLayoutEffect(() => {
    isFirstMountRef.current = false;
  }, []);

  const handleAnimationEnd = (e) => {
    if (e.target === containerRef.current) {
      // Remove animation class directly from DOM to avoid triggering any React re-render
      containerRef.current.classList.remove('slide-screen-forward', 'slide-screen-back');
    }
  };

  // Synchronously compute animation class on frame 0 (zero flash, zero mid-flight re-renders)
  const animationClass = isFirstMountRef.current
    ? ''
    : (isBack ? 'slide-screen-back' : 'slide-screen-forward');

  return (
    <div
      key={locationKey}
      ref={containerRef}
      className={`page-screen-container ${animationClass}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <DeferredContent skip={isFirstMountRef.current} pathname={pathname}>{children}</DeferredContent>
    </div>
  );
}

/**
 * Instant Entry + Deferred Heavy Render
 * Frame 0: the page container + a centered loader are painted immediately (click feels instant).
 * After the first paint (double rAF), the real page content mounts.
 * The loader fades in via a compositor-driven CSS delay, so light pages never show it,
 * while heavy pages (Question Bank, MCQ hub, lists) show it until content appears.
 */
function DeferredContent({ children, skip, pathname }) {
  const isTab = TAB_PATHS.includes(pathname);
  const shouldSkip = skip || isTab;
  const [ready, setReady] = useState(shouldSkip);

  useEffect(() => {
    if (shouldSkip) {
      setReady(true);
      return;
    }
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [shouldSkip, pathname]);

  if (ready) return children;

  return <PageShell pathname={pathname} />;
}

/* Route → title map for the instant page shell header */
const SHELL_TITLES = [
  ['/questions-hub', 'MCQ Exam ও প্রশ্নব্যাংক', 'MCQ Exam & Questions'],
  ['/live-exams', 'লাইভ এমসিকিউ পরীক্ষা', 'Live MCQ Exam'],
  ['/live-exam-room', 'লাইভ পরীক্ষা', 'Live Exam'],
  ['/question-details', 'প্রশ্নপত্র', 'Question Paper'],
  ['/questions/', 'প্রশ্নব্যাংক', 'Question Bank'],
  ['/job/', 'চাকরির বিস্তারিত', 'Job Details'],
  ['/exam-details', 'পরীক্ষার বিস্তারিত', 'Exam Details'],
  ['/result-details', 'ফলাফল', 'Result Details'],
  ['/all-circulars', 'সকল সার্কুলার', 'All Circulars'],
  ['/categories', 'ক্যাটাগরি', 'Categories'],
  ['/search', 'খুঁজুন', 'Search'],
  ['/admit-card', 'প্রবেশপত্র ও ফলাফল', 'Admit Card & Result'],
  ['/edit-profile', 'প্রোফাইল সম্পাদনা', 'Edit Profile'],
  ['/settings', 'সেটিংস', 'Settings'],
  ['/privacy', 'গোপনীয়তা নীতি', 'Privacy Policy'],
  ['/terms', 'শর্তাবলী', 'Terms & Conditions'],
  ['/share', 'শেয়ার করুন', 'Share App'],
  ['/rate', 'রেটিং দিন', 'Rate Us'],
  ['/contact', 'যোগাযোগ', 'Contact Us'],
  ['/about', 'অ্যাপ সম্পর্কে', 'About App'],
  ['/offline-feed', 'অফলাইন ফিড', 'Offline Feed']
];

const TAB_PATHS = ['/', '/home', '/feed', '/saved', '/notifications', '/profile'];

/**
 * Instant Page Structure Shell
 * Painted on frame 0 while the real page mounts: shows the page's header and a
 * skeleton of its layout, with the modern loader centered on top — never a blank screen.
 */
function PageShell({ pathname = '' }) {
  const { state } = useAppContext();
  const isEn = state?.language === 'en';
  const isTab = TAB_PATHS.includes(pathname);
  const match = SHELL_TITLES.find(([p]) => pathname.startsWith(p));
  const title = match ? (isEn ? match[2] : match[1]) : '';
  const isDetail = getRouteDepth(pathname) >= 2;

  return (
    <div className="page page-shell" style={{ paddingBottom: isTab ? '80px' : '24px' }}>
      {isTab ? (
        <div className="page-shell-appbar">
          <div className="skeleton skeleton-circle" style={{ width: 34, height: 34 }} />
          <div className="skeleton" style={{ width: 120, height: 16, borderRadius: 8 }} />
          <div className="skeleton skeleton-circle" style={{ width: 34, height: 34 }} />
        </div>
      ) : (
        <div className="page-header">
          <button className="back-btn" aria-label="Back" onClick={() => window.history.back()}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
          </button>
          {title ? (
            <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800 }}>{title}</h1>
          ) : (
            <div className="skeleton" style={{ flex: 1, height: 16, borderRadius: 8, maxWidth: 160 }} />
          )}
        </div>
      )}

      <div className="page-shell-body">
        {isDetail ? (
          <>
            <div className="skeleton" style={{ height: 150, borderRadius: 18, marginBottom: 14 }} />
            <div className="skeleton skeleton-text" style={{ width: '80%' }} />
            <div className="skeleton skeleton-text" style={{ width: '95%' }} />
            <div className="skeleton skeleton-text" style={{ width: '70%', marginBottom: 16 }} />
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
          </>
        ) : (
          <>
            <div className="skeleton" style={{ height: 44, borderRadius: 14, marginBottom: 14 }} />
            <div className="skeleton" style={{ height: 96, borderRadius: 16, marginBottom: 16 }} />
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
          </>
        )}
      </div>

      <div className="deferred-page-loader-inner page-shell-loader">
        <ModernLoader size="md" icon="📚" />
      </div>
    </div>
  );
}
