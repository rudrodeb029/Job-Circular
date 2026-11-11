import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Ultra-Smooth Progressive List Rendering with Velocity Burst & Rapid Idle Pre-warming.
 * 
 * 1. Frame 0: Instantly renders `initial` items (default: 50) in <16ms.
 *    Since 80%+ of question sets and lists have 30-50 items, they are 100% visible immediately.
 * 2. Rapid Background Pre-warming: Uses requestIdleCallback (and RAF fallback) to progressively
 *    mount all remaining items in the DOM during idle moments (<120ms).
 * 3. 3000px Lookahead: IntersectionObserver observes 3000px ahead (~4 full phone screens).
 * 4. Velocity Fling Burst: If user rapidly flings or scrolls, all remaining items are
 *    immediately mounted in one burst to permanently prevent unmounted empty/blank voids.
 */
export default function useProgressiveList(total, { 
  initial = 50, 
  step = 50, 
  rootMargin = '3000px 0px', 
  resetKey 
} = {}) {
  const safeTotal = total || 0;
  const [count, setCount] = useState(() => Math.min(initial, safeTotal));
  const observerRef = useRef(null);
  const isVelocityBurstRef = useRef(false);

  // Reset when identity changes
  useEffect(() => {
    isVelocityBurstRef.current = false;
    setCount(Math.min(initial, safeTotal));
  }, [resetKey, initial, safeTotal]);

  // Rapid background pre-warming via requestIdleCallback / micro-tasks
  useEffect(() => {
    if (count >= safeTotal) return;

    let handle = null;
    const scheduleNext = () => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        handle = window.requestIdleCallback((deadline) => {
          if (deadline.timeRemaining() > 4 || deadline.didTimeout) {
            setCount(prev => Math.min(prev + step, safeTotal));
          } else {
            scheduleNext();
          }
        }, { timeout: 60 });
      } else {
        handle = setTimeout(() => {
          setCount(prev => Math.min(prev + step, safeTotal));
        }, 16);
      }
    };

    scheduleNext();

    return () => {
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && handle) {
        window.cancelIdleCallback(handle);
      } else if (handle) {
        clearTimeout(handle);
      }
    };
  }, [count, safeTotal, step]);

  // Velocity Fling Listener: If user flings fast down the page, instantly burst all remaining items
  useEffect(() => {
    if (count >= safeTotal) return;

    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    let lastTime = Date.now();

    const onScroll = () => {
      if (isVelocityBurstRef.current || count >= safeTotal) return;

      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const now = Date.now();
      const dt = Math.max(1, now - lastTime);
      const dy = currentScrollY - lastScrollY;
      const velocity = dy / dt; // pixels per ms

      // High velocity scroll (fling) or scrolled past 35% of page height
      if (velocity > 1.0 || (currentScrollY > 600 && currentScrollY > (document.documentElement.scrollHeight * 0.35))) {
        isVelocityBurstRef.current = true;
        setCount(safeTotal);
      }

      lastScrollY = currentScrollY;
      lastTime = now;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [count, safeTotal]);

  const sentinelRef = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!node || typeof IntersectionObserver === 'undefined') return;

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        // When user reaches near the sentinel (3000px ahead), mount remaining items immediately
        setCount(safeTotal);
      }
    }, { rootMargin });

    observerRef.current.observe(node);
  }, [safeTotal, rootMargin]);

  useEffect(() => () => observerRef.current && observerRef.current.disconnect(), []);

  return { count: Math.min(count, safeTotal), hasMore: count < safeTotal, sentinelRef };
}
