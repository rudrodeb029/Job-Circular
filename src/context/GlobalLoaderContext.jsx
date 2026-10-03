import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ModernLoader from '../components/ModernLoader';

const GlobalLoaderContext = createContext({
  startLoading: () => {},
  stopLoading: () => {},
  isLoading: false,
  isSpinnerVisible: false
});

/**
 * Global Smart Conditional Loader Provider
 * - 200ms Delay Trigger: Does NOT show loader for fast operations (<200ms) to eliminate flicker
 * - Centered Modern Spinner: Shows hardware-accelerated glass spinner when operations exceed 200ms
 * - Proper Cleanup: Automatically resets timers and states on route navigation or completion
 */
export function GlobalLoaderProvider({ children }) {
  const location = useLocation();
  const [isSpinnerVisible, setIsSpinnerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Set of active loading keys
  const pendingKeysRef = useRef(new Set());
  // 200ms debounce timer ref
  const timerRef = useRef(null);

  // Clear timer helper
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Reset all loading state
  const resetLoader = useCallback(() => {
    clearTimer();
    pendingKeysRef.current.clear();
    setIsSpinnerVisible(false);
    setIsLoading(false);
  }, [clearTimer]);

  // Automatically reset on route navigation (prevents memory leaks and hung spinners)
  useEffect(() => {
    resetLoader();
  }, [location.key, resetLoader]);

  // Clean up on component unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const startLoading = useCallback((key = 'default') => {
    pendingKeysRef.current.add(key);
    setIsLoading(true);

    // If timer is not already ticking and spinner not yet visible, start 200ms delay timer
    if (!timerRef.current && !isSpinnerVisible) {
      timerRef.current = setTimeout(() => {
        if (pendingKeysRef.current.size > 0) {
          setIsSpinnerVisible(true);
        }
        timerRef.current = null;
      }, 200); // Strict 200ms delay constraint
    }
  }, [isSpinnerVisible]);

  const stopLoading = useCallback((key = 'default') => {
    pendingKeysRef.current.delete(key);

    if (pendingKeysRef.current.size === 0) {
      clearTimer();
      setIsSpinnerVisible(false);
      setIsLoading(false);
    }
  }, [clearTimer]);

  return (
    <GlobalLoaderContext.Provider value={{ startLoading, stopLoading, isLoading, isSpinnerVisible, resetLoader }}>
      {children}
      {isSpinnerVisible && <CenteredModernSpinnerOverlay />}
    </GlobalLoaderContext.Provider>
  );
}

/**
 * Centered Modern Spinner Overlay Component
 * - Hardware accelerated (translate3d, backface-visibility, will-change)
 * - Glassmorphic backdrop with blur
 * - Centered glowing dual-ring orb loader
 */
export function CenteredModernSpinnerOverlay() {
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
 * Custom Hook to consume the Global Loader
 */
export function useGlobalLoader() {
  return useContext(GlobalLoaderContext);
}

export default GlobalLoaderContext;
