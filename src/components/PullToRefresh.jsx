import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';

export default function PullToRefresh({ children, onRefresh, disabled = false }) {
  const { state } = useAppContext();
  const isEn = state.language === 'en';

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const containerRef = useRef(null);

  const THRESHOLD = 65;
  const MAX_PULL = 110;

  const handleTouchStart = (e) => {
    if (disabled || isRefreshing) return;
    const container = containerRef.current || document.documentElement;
    const scrollTop = window.pageYOffset || container.scrollTop || 0;

    if (scrollTop <= 2) {
      startYRef.current = e.touches ? e.touches[0].clientY : e.clientY;
      isPullingRef.current = true;
    }
  };

  const handleTouchMove = (e) => {
    if (!isPullingRef.current || isRefreshing) return;
    const currentY = e.touches ? e.touches[0].clientY : e.clientY;
    const dy = currentY - startYRef.current;

    const container = containerRef.current || document.documentElement;
    const scrollTop = window.pageYOffset || container.scrollTop || 0;

    if (dy > 0 && scrollTop <= 2) {
      // Dampen pull distance for realistic spring feel
      const distance = Math.min(MAX_PULL, dy * 0.45);
      setPullDistance(distance);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;

    if (pullDistance >= THRESHOLD && onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(THRESHOLD);

      try {
        await onRefresh();
      } catch (err) {
        console.error('Pull to refresh failed:', err);
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 400);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      style={{ position: 'relative', minHeight: '100%' }}
    >
      {/* Top Refresh Header Indicator */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${pullDistance}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: isPullingRef.current ? 'none' : 'height 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
          zIndex: 10,
          background: 'transparent'
        }}
      >
        {pullDistance > 10 && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'var(--white)',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.1)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--primary)',
              opacity: Math.min(1, pullDistance / THRESHOLD),
              transform: `scale(${Math.min(1, pullDistance / THRESHOLD)})`,
              transition: 'transform 0.15s ease'
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none',
                transform: `rotate(${pullDistance * 3}deg)`,
                transition: isRefreshing ? 'none' : 'transform 0.1s ease'
              }}
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            <span>
              {isRefreshing
                ? (isEn ? 'Refreshing...' : 'রিফ্রেশ হচ্ছে...')
                : pullDistance >= THRESHOLD
                ? (isEn ? 'Release to refresh' : 'ছেড়ে দিন রিফ্রেশ করতে')
                : (isEn ? 'Pull down to refresh' : 'নিচে নামিয়ে রিফ্রেশ করুন')}
            </span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPullingRef.current ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      >
        {children}
      </div>
    </div>
  );
}
