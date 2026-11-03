/**
 * Native AdMob & Meta Mediation Integration Bridge for Live Circular
 * Allows React web components to communicate with native MainActivity.java Ad engine
 * with dynamic Firebase Remote Config parameters and real-time updates.
 */

// ═══ Frequency Capping / Cooldown Protection (AdMob Safety) ═══
// Minimum interval between interstitials to prevent AdMob "Too Many Ads" and "Ad Serving Limits"
let lastInterstitialTime = 0;
let dynamicCooldownMs = 50000; // Default: 50 seconds cooldown
let dynamicNativeCooldownMs = 30000; // Default: 30 seconds cooldown for Native Advanced Ads

// Initialize cooldown from Native interface if available on startup
if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.getInterstitialCooldownSec === 'function') {
  try {
    const sec = window.AndroidAds.getInterstitialCooldownSec();
    if (sec > 0) {
      dynamicCooldownMs = sec * 1000;
    }
    if (typeof window.AndroidAds.getNativeAdCooldownSec === 'function') {
      const nSec = window.AndroidAds.getNativeAdCooldownSec();
      if (nSec > 0) dynamicNativeCooldownMs = nSec * 1000;
    }
  } catch (e) {
    // Non-fatal fallback
  }
}

// Real-time listener for Firebase Remote Config updates pushed from MainActivity.java
if (typeof window !== 'undefined') {
  window.addEventListener('remote_config_ads_updated', (e) => {
    if (e && e.detail) {
      const { interstitial_cooldown_sec, native_ad_cooldown_sec, show_ads, show_banner_ads, show_interstitial_ads, show_native_ads } = e.detail;
      if (typeof interstitial_cooldown_sec === 'number' && interstitial_cooldown_sec > 0) {
        dynamicCooldownMs = interstitial_cooldown_sec * 1000;
        console.log(`[AdMob Remote Config] Updated cooldown to ${interstitial_cooldown_sec}s`);
      }
      if (typeof native_ad_cooldown_sec === 'number' && native_ad_cooldown_sec > 0) {
        dynamicNativeCooldownMs = native_ad_cooldown_sec * 1000;
        console.log(`[AdMob Remote Config] Updated native ad cooldown to ${native_ad_cooldown_sec}s`);
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
export { showInterstitialAd } from './adService';

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

/**
 * ═══ Native Advanced Ads Engine ═══
 * Shows the native AdMob Advanced Ad card at the bottom of the screen.
 * Seamless, non-intrusive card layout with Ad attribution and dismiss option.
 *
 * @param {boolean} isDark - Whether the active app theme is dark mode.
 * @returns {boolean} Whether the native call was successfully dispatched.
 */
export const showNativeAdvancedAd = (isDark = false) => {
  try {
    if (typeof window !== 'undefined' && window.AndroidAds) {
      if (typeof window.AndroidAds.showNativeAdWithTheme === 'function') {
        window.AndroidAds.showNativeAdWithTheme(Boolean(isDark));
        return true;
      } else if (typeof window.AndroidAds.showNativeAd === 'function') {
        window.AndroidAds.showNativeAd();
        return true;
      }
    }
  } catch (err) {
    console.error('Error showing native advanced ad:', err);
  }
  return false;
};

/**
 * Hides the native Advanced Ad card immediately (with smooth slide-down animation).
 */
export const hideNativeAdvancedAd = () => {
  try {
    if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.hideNativeAd === 'function') {
      window.AndroidAds.hideNativeAd();
      return true;
    }
  } catch (err) {
    console.error('Error hiding native advanced ad:', err);
  }
  return false;
};

/**
 * Controls the visibility of the native Advanced Ad card.
 */
export const setNativeAdvancedAdVisibility = (visible, isDark = false) => {
  if (visible) {
    return showNativeAdvancedAd(isDark);
  } else {
    return hideNativeAdvancedAd();
  }
};

/**
 * Checks whether Native Advanced ads are enabled via Firebase Remote Config.
 */
export const isNativeAdvancedAdsEnabled = () => {
  try {
    if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.isNativeAdsEnabled === 'function') {
      return Boolean(window.AndroidAds.isNativeAdsEnabled());
    }
  } catch (err) {
    console.error('Error checking native advanced ads status:', err);
  }
  return false;
};

/**
 * Checks whether a Native Advanced ad is preloaded in memory and ready to show.
 */
export const isNativeAdvancedAdReady = () => {
  try {
    if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.isNativeAdReady === 'function') {
      return Boolean(window.AndroidAds.isNativeAdReady());
    }
  } catch (err) {}
  return false;
};

/**
 * Gets the configured Native Advanced ad unit ID.
 */
export const getNativeAdvancedAdUnitId = () => {
  try {
    if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.getNativeAdUnitId === 'function') {
      return window.AndroidAds.getNativeAdUnitId();
    }
  } catch (err) {}
  return 'ca-app-pub-3940256099942544/2247696110';
};

/**
 * Gets the configured Native Advanced ad cooldown in seconds.
 */
export const getNativeAdvancedAdCooldownSec = () => {
  try {
    if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.getNativeAdCooldownSec === 'function') {
      return window.AndroidAds.getNativeAdCooldownSec();
    }
  } catch (err) {}
  return Math.round(dynamicNativeCooldownMs / 1000);
};

/**
 * Gets loaded real AdMob Native Ad data (headline, body, cta, advertiser, iconUrl).
 */
export const getNativeAdData = () => {
  try {
    if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.getNativeAdData === 'function') {
      const raw = window.AndroidAds.getNativeAdData();
      if (raw) return JSON.parse(raw);
    }
  } catch (err) {}
  return null;
};

/**
 * Triggers native click interaction on the loaded AdMob Native Ad.
 */
export const triggerNativeAdClick = () => {
  try {
    if (typeof window !== 'undefined' && window.AndroidAds) {
      if (typeof window.AndroidAds.triggerNativeAdClick === 'function') {
        window.AndroidAds.triggerNativeAdClick();
        return true;
      } else if (typeof window.AndroidAds.showNativeAd === 'function') {
        window.AndroidAds.showNativeAd();
        return true;
      }
    }
  } catch (err) {}
  return false;
};

/**
 * Requests AdMob to preload a fresh native ad into memory.
 */
export const preloadNativeAd = () => {
  try {
    if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.loadNativeAd === 'function') {
      window.AndroidAds.loadNativeAd();
      return true;
    }
  } catch (err) {}
  return false;
};

/**
 * Checks whether an Interstitial Ad is preloaded in memory and ready to show.
 */
export const isNativeInterstitialReady = () => {
  try {
    if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.isInterstitialReady === 'function') {
      return Boolean(window.AndroidAds.isInterstitialReady());
    }
  } catch (err) {}
  return false;
};

/**
 * Preloads an Interstitial Ad in the background (using loadAd) with zero delay.
 */
export const preloadInterstitialAd = () => {
  try {
    if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.loadInterstitial === 'function') {
      window.AndroidAds.loadInterstitial();
      return true;
    }
  } catch (err) {}
  return false;
};

/**
 * Safe Back Navigation with Interstitial Ad Display.
 * Used when a user returns to the main menu/list after finishing a set of questions
 * (e.g. from a specific year or question bank) or submitting an exam.
 * 
 * Rules:
 * - Checks readiness before display (isNativeInterstitialReady).
 * - If ready and cooldown passed: Displays the preloaded ad, then continues navigation immediately upon dismissal.
 * - If NOT ready: Proceeds directly to the target page with 0ms delay without interrupting the user.
 * 
 * @param {Function} navigate - React Router navigate function
 * @param {string|number} fallbackPath - Navigation target (default: -1)
 * @param {boolean} force - Whether to bypass cooldown (default: false)
 */
export const navigateWithAdOnReturn = (navigate, fallbackPath = -1, force = false) => {
  const isReady = isNativeInterstitialReady();
  const now = Date.now();

  // Refresh cooldown if available from Native
  if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.getInterstitialCooldownSec === 'function') {
    try {
      const nativeSec = window.AndroidAds.getInterstitialCooldownSec();
      if (nativeSec > 0) dynamicCooldownMs = nativeSec * 1000;
    } catch (e) {}
  }

  const cooldownPassed = force || (now - lastInterstitialTime >= dynamicCooldownMs);

  const executeNavigation = () => {
    if (typeof fallbackPath === 'number' || typeof fallbackPath === 'string') {
      navigate(fallbackPath);
    } else {
      navigate(-1);
    }
  };

  // Check readiness before display
  if (isReady && cooldownPassed) {
    let navigated = false;
    const doNavigateOnce = () => {
      if (!navigated) {
        navigated = true;
        window.removeEventListener('native_interstitial_dismissed', doNavigateOnce);
        window.removeEventListener('native_interstitial_failed', doNavigateOnce);
        executeNavigation();
      }
    };

    window.addEventListener('native_interstitial_dismissed', doNavigateOnce, { once: true });
    window.addEventListener('native_interstitial_failed', doNavigateOnce, { once: true });

    // Safety fallback: if dismissed event doesn't fire within 600ms, proceed
    setTimeout(doNavigateOnce, 600);

    const shown = showNativeInterstitialAd(force);
    if (!shown) {
      doNavigateOnce();
    }
  } else {
    // Not ready or in cooldown: Proceed directly without interrupting the user
    executeNavigation();
  }
};
