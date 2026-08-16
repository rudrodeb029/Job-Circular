import React, { useState, useEffect } from 'react';

// AdMob Configuration
// Standard Google AdMob Test Banner Unit ID for safe development & testing
export const ADMOB_CONFIG = {
  testBannerId: 'ca-app-pub-3940256099942544/6300978111',
  productionBannerId: 'ca-app-pub-3940256099942544/6300978111', // Replace with production unit ID when releasing
  adSize: 'BANNER', // 320x50 or ANCHORED_ADAPTIVE_BANNER
  nonPersonalizedAdsOnly: true
};

export default function AdMobBanner({ adUnitId = null, style = {} }) {
  const [adLoaded, setAdLoaded] = useState(true);
  const [adError, setAdError] = useState(false);

  const activeAdUnitId = adUnitId || ADMOB_CONFIG.productionBannerId;

  return (
    <div
      className="admob-banner-container"
      style={{
        width: '100%',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        padding: '6px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60px',
        position: 'relative',
        zIndex: 40,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.03)',
        ...style
      }}
    >
      {/* Policy Compliant Ad Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '360px',
          padding: '0 12px 3px 12px',
          boxSizing: 'border-box'
        }}
      >
        <span
          style={{
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
            color: '#94a3b8',
            background: 'rgba(148, 163, 184, 0.12)',
            padding: '1px 5px',
            borderRadius: '4px'
          }}
        >
          বিজ্ঞাপন • Ad
        </span>
        <span style={{ fontSize: '9px', color: '#cbd5e1' }}>Google AdMob</span>
      </div>

      {/* Ad Banner Content Area */}
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '8px',
          color: '#ffffff',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          margin: '0 10px'
        }}
      >
        {/* Animated Background Shimmer for Ad Placeholder / Live Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0 12px',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '14px',
              fontWeight: 800
            }}>
              🎯
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                বিসিএস ও সরকারি চাকরি প্রস্তুতি
              </div>
              <div style={{ fontSize: '9px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                অনলাইন মডেল টেস্ট ও প্রশ্ন সমাধান
              </div>
            </div>
          </div>

          <a
            href="https://play.google.com/store/apps/details?id=com.jobcircular.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              background: '#2563eb',
              color: '#ffffff',
              padding: '5px 10px',
              borderRadius: '6px',
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.4)'
            }}
          >
            ইনস্টল করুন
          </a>
        </div>
      </div>
    </div>
  );
}
