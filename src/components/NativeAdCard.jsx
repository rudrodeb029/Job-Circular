import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  isNativeAdvancedAdsEnabled,
  showNativeAdvancedAd,
  hideNativeAdvancedAd,
  getNativeAdvancedAdUnitId
} from '../utils/admobUtils';

/**
 * NativeAdCard Component
 * Seamless, non-intrusive AdMob Native Advanced ad card.
 * Respects Firebase Remote Config switches (show_ads, show_native_ads),
 * frequency capping cooldown, and user dismissal with zero awkwardness.
 */
export default function NativeAdCard({
  style = {},
  variant = 'card', // 'card' | 'inline'
  onDismiss = null
}) {
  const { state } = useAppContext();
  const isEn = state.language === 'en';
  const isDark = state.theme === 'dark';

  const [dismissed, setDismissed] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(true);

  useEffect(() => {
    // Check if Native Ads are enabled via remote config
    if (typeof window !== 'undefined' && window.AndroidAds) {
      if (typeof window.AndroidAds.isNativeAdsEnabled === 'function') {
        setAdsEnabled(Boolean(window.AndroidAds.isNativeAdsEnabled()));
      }
    }

    const handleRemoteConfigUpdate = (e) => {
      if (e && e.detail && typeof e.detail.show_native_ads !== 'undefined') {
        setAdsEnabled(Boolean(e.detail.show_ads && e.detail.show_native_ads));
      }
    };

    window.addEventListener('remote_config_ads_updated', handleRemoteConfigUpdate);
    return () => {
      window.removeEventListener('remote_config_ads_updated', handleRemoteConfigUpdate);
    };
  }, []);

  if (dismissed || !adsEnabled) {
    return null;
  }

  const handleDismiss = (e) => {
    e.stopPropagation();
    setDismissed(true);
    if (typeof onDismiss === 'function') {
      onDismiss();
    }
  };

  return (
    <div
      className="native-ad-card animate-fade-in"
      style={{
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: 'var(--white, #ffffff)',
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: '16px',
        padding: '12px 14px',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
        position: 'relative',
        margin: '12px 0',
        transition: 'all 0.2s ease',
        ...style
      }}
    >
      {/* Top Header: Badge, Advertiser, Close Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '9.5px',
              fontWeight: 800,
              color: '#1d4ed8',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '1.5px 6px',
              borderRadius: '4px',
              letterSpacing: '0.2px',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            {isEn ? 'Sponsored • Ad' : 'বিজ্ঞাপন • Ad'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>
            Google Partner
          </span>
        </div>

        {/* User Dismissal Button (Zero Awkwardness) */}
        <button
          type="button"
          onClick={handleDismiss}
          title={isEn ? "Hide Ad" : "বিজ্ঞাপন বন্ধ করুন"}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            color: 'var(--text-muted, #94a3b8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            transition: 'background-color 0.15s ease'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Main Content: Icon + Headline + Body */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
          }}
        >
          💼
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: 'var(--text-primary, #0f172a)',
              margin: '0 0 3px 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {isEn ? 'Smart Career & Exam Preparation' : 'সরকারি ও বেসরকারি চাকরির সেরা প্রস্তুতি'}
          </h4>
          <p
            style={{
              fontSize: '11.5px',
              color: 'var(--text-secondary, #475569)',
              margin: 0,
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {isEn
              ? 'Get verified circulars, syllabus updates, exam dates, and real-time results.'
              : 'সকল চাকরির বিজ্ঞপ্তি, রুটিন এবং পরীক্ষার ফলাফল সবার আগে সরাসরি আপনার ফোনে।'}
          </p>
        </div>
      </div>

      {/* Call To Action Button */}
      <button
        type="button"
        onClick={() => {
          if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.showNativeAd === 'function') {
            window.AndroidAds.showNativeAd();
          }
        }}
        style={{
          width: '100%',
          padding: '8px 12px',
          background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '12px',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          boxShadow: '0 3px 10px rgba(26, 86, 219, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          transition: 'transform 0.15s ease'
        }}
      >
        <span>{isEn ? 'Learn More' : 'বিস্তারিত জানুন'}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
