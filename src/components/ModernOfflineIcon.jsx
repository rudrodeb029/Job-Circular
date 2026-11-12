import React from 'react';

/**
 * ModernOfflineIcon
 * A modern, layer-by-layer animated Wi-Fi Off icon.
 * Features:
 * - Clean SVG geometry without box/circle backgrounds
 * - Layer-by-layer cascading wave animation (dot -> inner arc -> middle arc -> outer arc)
 * - Animated diagonal strike-through slash with crisp background halo
 * - Adaptive light/dark theme contrast
 */
export default function ModernOfflineIcon({ isDark = false, size = 84 }) {
  const waveColor = isDark ? '#60a5fa' : '#2563eb';
  const dotColor = isDark ? '#93c5fd' : '#1d4ed8';
  const slashColor = isDark ? '#f87171' : '#ef4444';
  const haloColor = isDark ? '#0b0f19' : '#ffffff';

  return (
    <div 
      className="modern-offline-icon-wrap" 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none'
      }}
    >
      <style>{`
        @keyframes wifiDotPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.65;
          }
          25% {
            transform: scale(1.3);
            opacity: 1;
          }
          50% {
            transform: scale(1);
            opacity: 0.65;
          }
        }
        @keyframes wifiWaveLayer {
          0%, 100% {
            opacity: 0.3;
            stroke-width: 2.8px;
          }
          25% {
            opacity: 1;
            stroke-width: 3.6px;
          }
          50% {
            opacity: 0.3;
            stroke-width: 2.8px;
          }
        }
        @keyframes wifiSlashDraw {
          0% {
            stroke-dashoffset: 75;
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        @keyframes wifiSlashBreathe {
          0%, 100% {
            opacity: 0.9;
          }
          50% {
            opacity: 1;
          }
        }
        .wifi-layer-dot {
          transform-origin: 32px 48px;
          animation: wifiDotPulse 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .wifi-layer-arc1 {
          animation: wifiWaveLayer 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.22s;
        }
        .wifi-layer-arc2 {
          animation: wifiWaveLayer 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.44s;
        }
        .wifi-layer-arc3 {
          animation: wifiWaveLayer 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.66s;
        }
        .wifi-layer-halo {
          stroke-dasharray: 75;
          stroke-dashoffset: 0;
          animation: wifiSlashDraw 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .wifi-layer-slash {
          stroke-dasharray: 75;
          stroke-dashoffset: 0;
          animation: wifiSlashDraw 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards, wifiSlashBreathe 2.4s ease-in-out infinite 0.5s;
        }
        @media (prefers-reduced-motion: reduce) {
          .wifi-layer-dot, .wifi-layer-arc1, .wifi-layer-arc2, .wifi-layer-arc3, .wifi-layer-halo, .wifi-layer-slash {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>

      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 64 64" 
        fill="none" 
        style={{ overflow: 'visible', display: 'block' }}
        aria-hidden="true"
      >
        {/* Layer 0: Center Dot */}
        <circle 
          cx="32" 
          cy="48" 
          r="3.5" 
          fill={dotColor} 
          className="wifi-layer-dot" 
        />

        {/* Layer 1: Inner Wave Arc */}
        <path 
          d="M 24.2 40.2 A 11 11 0 0 1 39.8 40.2" 
          stroke={waveColor} 
          strokeWidth="3" 
          strokeLinecap="round" 
          className="wifi-layer-arc1" 
        />

        {/* Layer 2: Middle Wave Arc */}
        <path 
          d="M 17.2 33.2 A 21 21 0 0 1 46.8 33.2" 
          stroke={waveColor} 
          strokeWidth="3" 
          strokeLinecap="round" 
          className="wifi-layer-arc2" 
        />

        {/* Layer 3: Outer Wave Arc */}
        <path 
          d="M 10.1 26.1 A 31 31 0 0 1 53.9 26.1" 
          stroke={waveColor} 
          strokeWidth="3" 
          strokeLinecap="round" 
          className="wifi-layer-arc3" 
        />

        {/* Layer 4: Slash Gap Halo (cuts clean background gap in the arcs) */}
        <line 
          x1="11" 
          y1="11" 
          x2="53" 
          y2="53" 
          stroke={haloColor} 
          strokeWidth="6.5" 
          strokeLinecap="round" 
          className="wifi-layer-halo" 
        />

        {/* Layer 5: Strike-through Slash Line */}
        <line 
          x1="11" 
          y1="11" 
          x2="53" 
          y2="53" 
          stroke={slashColor} 
          strokeWidth="3.2" 
          strokeLinecap="round" 
          className="wifi-layer-slash" 
        />
      </svg>
    </div>
  );
}
