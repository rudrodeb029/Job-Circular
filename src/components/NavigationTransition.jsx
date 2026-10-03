import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import ModernLoader from './ModernLoader';

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
        const prevPath = lastPathRef.current;
        const nextPath = location.pathname;
        const prevTabIndex = TAB_ORDER[prevPath] ?? -1;
        const nextTabIndex = TAB_ORDER[nextPath] ?? -1;

        if (prevTabIndex !== -1 && nextTabIndex !== -1) {
          // Switching between peer bottom tabs
          directionRef.current = nextTabIndex < prevTabIndex ? 'back' : 'forward';
        } else if (nextTabIndex === 0 && prevTabIndex !== 0) {
          // Returning to Home from a sub-screen
          directionRef.current = 'back';
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
export function SmartPageLoader({ isNavigating }) {
  const [showProgressLine, setShowProgressLine] = useState(false);
  const [showSpinnerOrb, setShowSpinnerOrb] = useState(false);

  useEffect(() => {
    if (!isNavigating) {
      setShowProgressLine(false);
      setShowSpinnerOrb(false);
      return;
    }

    // Micro-delay threshold for slim top progress line (75ms)
    const lineTimer = setTimeout(() => {
      setShowProgressLine(true);
    }, 75);

    // Secondary threshold for centered glass orb spinner (180ms)
    const orbTimer = setTimeout(() => {
      setShowSpinnerOrb(true);
    }, 180);

    return () => {
      clearTimeout(lineTimer);
      clearTimeout(orbTimer);
    };
  }, [isNavigating]);

  if (!showProgressLine && !showSpinnerOrb) return null;

  return (
    <>
      {/* Top Slim Glowing Progress Bar */}
      {showProgressLine && (
        <div
          className="smart-nav-progress-bar"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '2.5px',
            zIndex: 99999,
            pointerEvents: 'none',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #2563eb 0%, #38bdf8 50%, #2563eb 100%)',
              backgroundSize: '200% 100%',
              animation: 'smartNavProgressPulse 1s linear infinite'
            }}
          />
        </div>
      )}

      {/* Floating Modern Glass Orb Spinner (for prolonged async delays) */}
      {showSpinnerOrb && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 99998,
            pointerEvents: 'none',
            animation: 'fadeIn 0.2s ease-out forwards'
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '24px',
              padding: '12px 18px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ModernLoader size="sm" variant="brand" />
          </div>
        </div>
      )}
    </>
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
  const [isAnimating, setIsAnimating] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const containerRef = useRef(null);

  // Synchronous and immediate scroll reset BEFORE browser paint
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    const container = document.querySelector('.container');
    if (container) container.scrollTop = 0;
  }, [locationKey]);

  // Handle route transition lifecycle and smart loader
  useEffect(() => {
    setIsAnimating(true);
    setIsNavigating(true);

    const navTimer = setTimeout(() => {
      setIsNavigating(false);
    }, 120);

    const animTimer = setTimeout(() => {
      setIsAnimating(false);
    }, 320);

    return () => {
      clearTimeout(navTimer);
      clearTimeout(animTimer);
    };
  }, [locationKey]);

  const handleAnimationEnd = (e) => {
    if (e.target === containerRef.current) {
      setIsAnimating(false);
      setIsNavigating(false);
    }
  };

  const animationClass = isAnimating
    ? (isBack ? 'slide-screen-back' : 'slide-screen-forward')
    : '';

  return (
    <>
      <SmartPageLoader isNavigating={isNavigating} />
      <div
        key={locationKey}
        ref={containerRef}
        className={`page-screen-container ${animationClass}`}
        onAnimationEnd={handleAnimationEnd}
      >
        {children}
      </div>
    </>
  );
}
