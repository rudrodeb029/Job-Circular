import React from 'react';

/**
 * Modern High-Performance Animated Loader Component
 * Provides premium micro-animations for page transitions, data fetching, questions, exams & button states.
 */
export default function ModernLoader({
  text = 'লোড হচ্ছে...',
  textEn = 'Loading...',
  subtext,
  size = 'md', // 'sm' | 'md' | 'lg' | 'fullscreen'
  variant = 'brand', // 'brand' | 'glass' | 'minimal' | 'fullscreen'
  icon = '📄',
  isEn = false
}) {
  const displayText = isEn ? textEn : text;

  // Size mapping
  const sizeMap = {
    sm: { containerSize: 44, orbSize: 26, fontSize: 12, iconSize: 13, gap: 8 },
    md: { containerSize: 64, orbSize: 40, fontSize: 13.5, iconSize: 18, gap: 12 },
    lg: { containerSize: 84, orbSize: 52, fontSize: 15, iconSize: 24, gap: 16 },
    fullscreen: { containerSize: 76, orbSize: 48, fontSize: 14.5, iconSize: 22, gap: 14 }
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isFullscreen = variant === 'fullscreen' || size === 'fullscreen';

  const loaderCore = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: `${currentSize.gap}px`,
        textAlign: 'center',
        padding: isFullscreen ? '30px' : '20px',
        animation: 'modernFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      {/* Dynamic Animated Orb with Dual Gradient Spinners */}
      <div
        style={{
          position: 'relative',
          width: `${currentSize.containerSize}px`,
          height: `${currentSize.containerSize}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Glowing Background Pulse */}
        <div
          style={{
            position: 'absolute',
            inset: '4px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(37, 99, 235, 0) 70%)',
            animation: 'modernPulseGlow 2s ease-in-out infinite'
          }}
        />

        {/* Outer Continuous Rotating Arc */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2.5px solid rgba(37, 99, 235, 0.12)',
            borderTopColor: '#2563eb',
            borderRightColor: '#60a5fa',
            animation: 'modernSpin 0.9s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite',
            boxShadow: '0 0 14px rgba(37, 99, 235, 0.15)'
          }}
        />

        {/* Reverse Rotating Accent Arc */}
        <div
          style={{
            position: 'absolute',
            inset: '4px',
            borderRadius: '50%',
            border: '2px solid transparent',
            borderBottomColor: '#059669',
            borderLeftColor: '#34d399',
            animation: 'modernSpinReverse 1.4s linear infinite',
            opacity: 0.85
          }}
        />

        {/* Inner Floating Emblem Card */}
        <div
          style={{
            width: `${currentSize.orbSize}px`,
            height: `${currentSize.orbSize}px`,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${currentSize.iconSize}px`,
            zIndex: 2,
            animation: 'modernFloat 2.4s ease-in-out infinite'
          }}
        >
          {icon}
        </div>
      </div>

      {/* Modern Shimmer Text & Bouncing Wave Dots */}
      {displayText && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
          <div
            style={{
              fontSize: `${currentSize.fontSize}px`,
              fontWeight: 700,
              color: 'var(--text-primary, #0f172a)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              letterSpacing: '0.2px'
            }}
          >
            <span>{displayText}</span>
            {/* Wave Dots */}
            <span style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
              <span className="modern-dot modern-dot-1" />
              <span className="modern-dot modern-dot-2" />
              <span className="modern-dot modern-dot-3" />
            </span>
          </div>

          {subtext && (
            <span
              style={{
                fontSize: '11.5px',
                color: 'var(--text-secondary, #64748b)',
                fontWeight: 500
              }}
            >
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        <div
          style={{
            background: 'var(--bg-primary, #ffffff)',
            borderRadius: '24px',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            padding: '10px 18px',
            maxWidth: '280px',
            width: '90%'
          }}
        >
          {loaderCore}
        </div>
      </div>
    );
  }

  return loaderCore;
}

/**
 * Compact Button Spinner for instantaneous async button feedback
 */
export function ButtonSpinner({ size = 16, color = '#ffffff' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        animation: 'modernSpin 0.75s linear infinite',
        flexShrink: 0
      }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        style={{ opacity: 0.25, color }}
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        style={{ color }}
      />
    </svg>
  );
}

/**
 * Modern Card & Details Skeleton for ultra-fast layout stability
 */
export function ModernPageSkeleton({ type = 'details', title = 'লোড হচ্ছে...' }) {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header bar placeholder */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="modern-skeleton-shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
        <div className="modern-skeleton-shimmer" style={{ height: '20px', width: '60%', borderRadius: '6px' }} />
      </div>

      {/* Main notice/content hero card placeholder */}
      <div
        className="modern-skeleton-shimmer"
        style={{
          width: '100%',
          height: type === 'details' ? '280px' : '180px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ModernLoader text={title} size="sm" />
      </div>

      {/* List item placeholders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="modern-skeleton-shimmer" style={{ height: '54px', width: '100%', borderRadius: '14px' }} />
        <div className="modern-skeleton-shimmer" style={{ height: '54px', width: '100%', borderRadius: '14px' }} />
      </div>
    </div>
  );
}
