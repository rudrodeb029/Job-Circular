import React from 'react';

/**
 * Modern High-Performance Animated Loader Component
 * Clean, modern, text-free visual animated orb with glowing dual rotating gradient rings.
 */
export default function ModernLoader({
  size = 'md', // 'sm' | 'md' | 'lg' | 'fullscreen'
  variant = 'brand', // 'brand' | 'glass' | 'minimal' | 'fullscreen'
  icon = '📄',
  text = null,
  showText = false
}) {
  // Size mapping
  const sizeMap = {
    sm: { containerSize: 42, orbSize: 26, iconSize: 13, gap: 0 },
    md: { containerSize: 58, orbSize: 36, iconSize: 18, gap: 0 },
    lg: { containerSize: 76, orbSize: 48, iconSize: 24, gap: 0 },
    fullscreen: { containerSize: 72, orbSize: 46, iconSize: 22, gap: 0 }
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isFullscreen = variant === 'fullscreen' || size === 'fullscreen';

  const loaderCore = (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: isFullscreen ? '24px' : '12px',
        animation: 'modernFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
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
            inset: '3px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0) 70%)',
            animation: 'modernPulseGlow 1.8s ease-in-out infinite'
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
            animation: 'modernSpin 0.85s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite',
            boxShadow: '0 0 14px rgba(37, 99, 235, 0.18)'
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
            animation: 'modernSpinReverse 1.3s linear infinite',
            opacity: 0.85
          }}
        />

        {/* Inner Floating Emblem Card */}
        <div
          style={{
            width: `${currentSize.orbSize}px`,
            height: `${currentSize.orbSize}px`,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${currentSize.iconSize}px`,
            zIndex: 2,
            animation: 'modernFloat 2.2s ease-in-out infinite'
          }}
        >
          {icon}
        </div>
      </div>

      {showText && text && (
        <div style={{ marginTop: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
          {text}
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
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
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
 * Modern Card & Details Skeleton with Clean Animated Center Loader
 */
export function ModernPageSkeleton({ type = 'details', icon = '📄' }) {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header bar placeholder */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="modern-skeleton-shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
        <div className="modern-skeleton-shimmer" style={{ height: '20px', width: '55%', borderRadius: '6px' }} />
      </div>

      {/* Main notice/content hero card with embedded ModernLoader */}
      <div
        className="modern-skeleton-shimmer"
        style={{
          width: '100%',
          height: type === 'details' ? '260px' : '160px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ModernLoader size="md" icon={icon} />
      </div>

      {/* List item placeholders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="modern-skeleton-shimmer" style={{ height: '52px', width: '100%', borderRadius: '14px' }} />
        <div className="modern-skeleton-shimmer" style={{ height: '52px', width: '100%', borderRadius: '14px' }} />
      </div>
    </div>
  );
}
