import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  isNativeAdvancedAdsEnabled,
  getNativeAdData,
  triggerNativeAdClick,
  preloadNativeAd,
  showNativeAdvancedAd,
  hideNativeAdvancedAd
} from '../utils/admobUtils';

/**
 * NativeAdCard Component
 * Real AdMob Native Advanced Ad Card.
 * Receives and displays real test ad content directly from the Google AdMob SDK
 * (headline, body, advertiser, star rating, CTA button, and official AdMob branding).
 * Fully responsive to Dark Mode, light mode, user dismiss, and Remote Config switches.
 */
export default function NativeAdCard({
  style = {},
  onDismiss = null
}) {
  const { state } = useAppContext();
  const isEn = state.language === 'en';
  const isDark = state.theme === 'dark';

  const [dismissed, setDismissed] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(true);

  // Real AdMob native ad data state
  const [adData, setAdData] = useState(() => {
    return getNativeAdData();
  });

  useEffect(() => {
    // 1. Initial Remote Config & Ad State verification
    if (typeof window !== 'undefined' && window.AndroidAds) {
      if (typeof window.AndroidAds.isNativeAdsEnabled === 'function') {
        setAdsEnabled(Boolean(window.AndroidAds.isNativeAdsEnabled()));
      }
      // Check if ad data is already in cache
      const cached = getNativeAdData();
      if (cached) {
        setAdData(cached);
      } else {
        // Trigger preloading of Native Ad into Android cache
        preloadNativeAd();
      }
    }

    // 2. Real-time Native Ad Loaded Event Listener
    const handleNativeAdLoaded = (e) => {
      if (e && e.detail) {
        setAdData(e.detail);
      }
    };

    // 3. Remote Config Live Updates Listener
    const handleRemoteConfigUpdate = (e) => {
      if (e && e.detail && typeof e.detail.show_native_ads !== 'undefined') {
        setAdsEnabled(Boolean(e.detail.show_ads && e.detail.show_native_ads));
      }
    };

    window.addEventListener('native_ad_loaded', handleNativeAdLoaded);
    window.addEventListener('remote_config_ads_updated', handleRemoteConfigUpdate);

    return () => {
      window.removeEventListener('native_ad_loaded', handleNativeAdLoaded);
      window.removeEventListener('remote_config_ads_updated', handleRemoteConfigUpdate);
    };
  }, []);

  if (dismissed || !adsEnabled) {
    return null;
  }

  const handleDismiss = (e) => {
    e.stopPropagation();
    setDismissed(true);
    hideNativeAdvancedAd();
    if (typeof onDismiss === 'function') {
      onDismiss();
    }
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
    triggerNativeAdClick();
  };

  // Content provided by Google AdMob or clean official test defaults
  const headline = adData?.headline || (isEn ? 'Test Ad: Google' : 'Test Ad: Google AdMob');
  const bodyText = adData?.body || (isEn
    ? 'Nice job! This is a real AdMob Native Advanced test ad. Tap to test interaction.'
    : 'এটি গুগল অ্যাডমবের অফিসিয়াল নেটিভ অ্যাড টেস্ট। বিস্তারিত দেখতে বাটনে চাপুন।');
  const ctaText = adData?.callToAction || (isEn ? 'Install' : 'ইনস্টল করুন');
  const advertiser = adData?.advertiser || (adData?.store ? adData.store : 'Google Partner');
  const iconUrl = adData?.iconUrl || null;

  return (
    <div
      className="native-ad-card animate-fade-in"
      onClick={handleActionClick}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '12px 14px',
        boxShadow: isDark
          ? '0 4px 16px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.04)',
        position: 'relative',
        margin: '14px 0',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        ...style
      }}
    >
      {/* Top Header: Official Ad Badge, Advertiser, User Dismiss Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              color: '#ffffff',
              backgroundColor: '#059669', // AdMob compliant green test badge
              padding: '2px 7px',
              borderRadius: '4px',
              letterSpacing: '0.4px',
              display: 'inline-flex',
              alignItems: 'center',
              textTransform: 'uppercase'
            }}
          >
            Test Ad • Ad
          </span>
          <span
            style={{
              fontSize: '11px',
              color: isDark ? '#94a3b8' : '#64748b',
              fontWeight: 600
            }}
          >
            {advertiser}
          </span>
        </div>

        {/* User Dismissal Button */}
        <button
          type="button"
          onClick={handleDismiss}
          title={isEn ? "Hide Ad" : "বিজ্ঞাপন বন্ধ করুন"}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            color: isDark ? '#94a3b8' : '#94a3b8',
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

      {/* Main Content: Real Google AdMob Icon + Headline + Body */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        {iconUrl ? (
          <img
            src={iconUrl}
            alt="Ad Icon"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              objectFit: 'contain',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          />
        ) : (
          /* Official Google AdMob 4-Color Pinwheel / App Icon */
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: isDark ? '#0f172a' : '#f8fafc',
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#4285F4" />
              <path d="M2 17L12 22L22 17" stroke="#34A853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="#FBBC05" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="2.5" fill="#EA4335" />
            </svg>
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            style={{
              fontSize: '13.5px',
              fontWeight: 800,
              color: isDark ? '#f8fafc' : '#0f172a',
              margin: '0 0 3px 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {headline}
          </h4>
          <p
            style={{
              fontSize: '11.5px',
              color: isDark ? '#cbd5e1' : '#475569',
              margin: 0,
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {bodyText}
          </p>

          {/* Optional Star Rating / Store Info */}
          {(adData?.starRating || adData?.price || adData?.store) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
              {adData.starRating && (
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#f59e0b' }}>
                  ★ {adData.starRating}
                </span>
              )}
              {adData.store && (
                <span style={{ fontSize: '10.5px', color: isDark ? '#94a3b8' : '#64748b' }}>
                  • {adData.price ? `${adData.price} on ` : ''}{adData.store}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Call To Action Button (Real interaction trigger) */}
      <button
        type="button"
        onClick={handleActionClick}
        style={{
          width: '100%',
          padding: '9px 12px',
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
        <span>{ctaText}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
