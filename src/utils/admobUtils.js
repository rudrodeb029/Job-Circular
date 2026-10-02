/**
 * Native AdMob & Meta Mediation Integration Bridge for Live Circular
 * Allows React web components to communicate with native MainActivity.java Ad engine
 * with dynamic Firebase Remote Config parameters and real-time updates.
 */

// ═══ Frequency Capping / Cooldown Protection (AdMob Safety) ═══
// Minimum interval between interstitials to prevent AdMob "Too Many Ads" and "Ad Serving Limits"
let lastInterstitialTime = 0;
let dynamicCooldownMs = 50000; // Default: 50 seconds cooldown

// Initialize cooldown from Native interface if available on startup
if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.getInterstitialCooldownSec === 'function') {
  try {
    const sec = window.AndroidAds.getInterstitialCooldownSec();
    if (sec > 0) {
      dynamicCooldownMs = sec * 1000;
    }
  } catch (e) {
    // Non-fatal fallback
  }
}

// Real-time listener for Firebase Remote Config updates pushed from MainActivity.java
if (typeof window !== 'undefined') {
  window.addEventListener('remote_config_ads_updated', (e) => {
    if (e && e.detail) {
      const { interstitial_cooldown_sec, show_ads, show_banner_ads, show_interstitial_ads } = e.detail;
      if (typeof interstitial_cooldown_sec === 'number' && interstitial_cooldown_sec > 0) {
        dynamicCooldownMs = interstitial_cooldown_sec * 1000;
        console.log(`[AdMob Remote Config] Updated cooldown to ${interstitial_cooldown_sec}s`);
      }
      console.log('[AdMob Remote Config] Live config updated:', e.detail);
    }
  });
}

/**
 * Triggers the native Interstitial Ad via Android JavascriptInterface.
 * @param {boolean} force - If true, bypasses the cooldown (used for key milestones like exam submit or portal leave)
 * Returns true if the native method was called, false otherwise.
 */
export const showNativeInterstitialAd = (force = false) => {
  // Check native cooldown value if updated
  if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.getInterstitialCooldownSec === 'function') {
    try {
      const nativeSec = window.AndroidAds.getInterstitialCooldownSec();
      if (nativeSec > 0) {
        dynamicCooldownMs = nativeSec * 1000;
      }
    } catch (e) {}
  }

  const now = Date.now();
  if (!force && (now - lastInterstitialTime < dynamicCooldownMs)) {
    // Cooldown is active: Silently skip ad to protect account from AdMob frequency limits
    return false;
  }

  try {
    if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.showInterstitial === 'function') {
      window.AndroidAds.showInterstitial();
      lastInterstitialTime = now;
      return true;
    }
  } catch (err) {
    console.error('Error invoking native interstitial ad:', err);
  }
  return false;
};

/**
 * Shows the native Banner Ad at the bottom of the screen (used on non-tab pages).
 * @param {boolean} isDark - Whether the active app theme is dark mode.
 */
export const showNativeBannerAd = (isDark = false) => {
  try {
    if (typeof window !== 'undefined' && window.AndroidAds) {
      if (typeof window.AndroidAds.showBannerWithTheme === 'function') {
        window.AndroidAds.showBannerWithTheme(Boolean(isDark));
        return true;
      } else if (typeof window.AndroidAds.showBanner === 'function') {
        window.AndroidAds.showBanner();
        return true;
      }
    }
  } catch (err) {
    console.error('Error showing native banner ad:', err);
  }
  return false;
};

/**
 * Hides the native Banner Ad (used on Home, Feed, Saved, Notifications, Profile, and Live Exam Room).
 */
export const hideNativeBannerAd = () => {
  try {
    if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.hideBanner === 'function') {
      window.AndroidAds.hideBanner();
      return true;
    }
  } catch (err) {
    console.error('Error hiding native banner ad:', err);
  }
  return false;
};

/**
 * Sets the visibility of the native Banner Ad.
 */
export const setNativeBannerVisibility = (visible, isDark = false) => {
  if (visible) {
    return showNativeBannerAd(isDark);
  } else {
    return hideNativeBannerAd();
  }
};

/**
 * Checks whether ads master switch is enabled via Firebase Remote Config.
 */
export const isNativeAdsEnabled = () => {
  try {
    if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.isAdsEnabled === 'function') {
      return Boolean(window.AndroidAds.isAdsEnabled());
    }
  } catch (err) {
    console.error('Error checking native ads status:', err);
  }
  return false;
};

/**
 * Checks whether Banner ads are enabled via Firebase Remote Config.
 */
export const isNativeBannerAdsEnabled = () => {
  try {
    if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.isBannerAdsEnabled === 'function') {
      return Boolean(window.AndroidAds.isBannerAdsEnabled());
    }
  } catch (err) {
    console.error('Error checking native banner ads status:', err);
  }
  return false;
};

/**
 * Checks whether Interstitial ads are enabled via Firebase Remote Config.
 */
export const isNativeInterstitialAdsEnabled = () => {
  try {
    if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.isInterstitialAdsEnabled === 'function') {
      return Boolean(window.AndroidAds.isInterstitialAdsEnabled());
    }
  } catch (err) {
    console.error('Error checking native interstitial ads status:', err);
  }
  return false;
};

/**
 * Gets the configured interstitial cooldown in seconds.
 */
export const getNativeInterstitialCooldownSec = () => {
  try {
    if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.getInterstitialCooldownSec === 'function') {
      return window.AndroidAds.getInterstitialCooldownSec();
    }
  } catch (err) {}
  return Math.round(dynamicCooldownMs / 1000);
};
