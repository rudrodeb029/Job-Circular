import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Progressive list rendering with non-blocking background pre-warming.
 * 1. Renders the first `initial` items on Frame 0 so page entry is instant (<16ms).
 * 2. Progressively mounts remaining items in small `step` batches across idle/animation
 *    frames AND via IntersectionObserver (1200px lookahead) so that when the user
 *    flings fast, all Claymorphism cards are already mounted and rasterized in standard
 *    tiled document flow — never showing blank/white placeholders.
 */
export default function useProgressiveList(total, { initial = 24, step = 24, rootMargin = '1200px 0px', resetKey } = {}) {
  const safeTotal = total || 0;
  const [count, setCount] = useState(() => Math.min(initial, safeTotal));
  const observerRef = useRef(null);

  // Reset when the list identity changes
  useEffect(() => {
    setCount(Math.min(initial, safeTotal));
  }, [resetKey, initial, safeTotal]);

  // Background frame-sliced pre-warming so all cards are ready before fast flings reach them
  useEffect(() => {
    if (count >= safeTotal) return;
    let rafId = 0;
    const timerId = setTimeout(() => {
      rafId = requestAnimationFrame(() => {
        setCount(prev => Math.min(prev + step, safeTotal));
      });
    }, 16);

    return () => {
      clearTimeout(timerId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [count, safeTotal, step]);

  const sentinelRef = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!node || typeof IntersectionObserver === 'undefined') return;
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        setCount(prev => Math.min(prev + step, safeTotal));
      }
    }, { rootMargin });
    observerRef.current.observe(node);
  }, [step, safeTotal, rootMargin, count]);

  useEffect(() => () => observerRef.current && observerRef.current.disconnect(), []);

  return { count: Math.min(count, safeTotal), hasMore: count < safeTotal, sentinelRef };
}
