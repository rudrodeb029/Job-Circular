/**
 * Native AdMob & Meta Mediation Integration Bridge for Live Circular
 * Allows React web components to communicate with native MainActivity.java Ad engine
 * with dynamic Firebase Remote Config parameters and real-time updates.
 */

// ═══ Frequency Capping / Cooldown Protection (AdMob Safety) ═══
// Minimum interval between interstitials to prevent AdMob "Too Many Ads" and "Ad Serving Limits"
let lastInterstitialTime = 0;
try {
  lastInterstitialTime = Number(localStorage.getItem('admob_last_interstitial_time') || 0);
} catch (e) {}

let dynamicCooldownMs = 180000; // Default: 3 minutes (180 seconds) cooldown for Interstitials
let dynamicRewardedCooldownMs = 120000; // Default: 2 minutes (120 seconds) cooldown for Rewarded Ads
let dynamicNativeCooldownMs = 30000; // Default: 30 seconds cooldown for Native Advanced Ads

// Action counter for Interstitial Ads: user must read/complete at least 4 items before an ad is eligible
const ACTION_STORAGE_KEY = 'admob_interstitial_action_count';
const DAILY_INTERSTITIAL_KEY = 'admob_daily_interstitial_count';
const DAILY_INTERSTITIAL_DATE_KEY = 'admob_daily_interstitial_date';
export const INTERSTITIAL_ACTION_THRESHOLD = 4;
export const DAILY_INTERSTITIAL_LIMIT = 10;

// Official Google AdMob sample test unit IDs (safe for development & staging)
export const GOOGLE_ADMOB_TEST_AD_UNITS = {
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
  NATIVE: 'ca-app-pub-3940256099942544/2247696110'
};

export const getInterstitialActionCount = () => {
  try {
    return Number(localStorage.getItem(ACTION_STORAGE_KEY) || 0);
  } catch (e) {
    return 0;
  }
};

export const incrementInterstitialActionCount = () => {
  try {
    const current = getInterstitialActionCount();
    const next = current + 1;
    localStorage.setItem(ACTION_STORAGE_KEY, String(next));
    return next;
  } catch (e) {
    return 1;
  }
};

export const resetInterstitialActionCount = () => {
  try {
    localStorage.setItem(ACTION_STORAGE_KEY, '0');
  } catch (e) {}
};

export const getDailyInterstitialCount = () => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const savedDate = localStorage.getItem(DAILY_INTERSTITIAL_DATE_KEY);
    if (savedDate !== today) {
      localStorage.setItem(DAILY_INTERSTITIAL_DATE_KEY, today);
      localStorage.setItem(DAILY_INTERSTITIAL_KEY, '0');
      return 0;
    }
    return Number(localStorage.getItem(DAILY_INTERSTITIAL_KEY) || 0);
  } catch (e) {
    return 0;
  }
};

export const incrementDailyInterstitialCount = () => {
  try {
    const count = getDailyInterstitialCount() + 1;
    localStorage.setItem(DAILY_INTERSTITIAL_KEY, String(count));
    return count;
  } catch (e) {
    return 1;
  }
};

let lastRewardedTime = 0;
try {
  lastRewardedTime = Number(localStorage.getItem('admob_last_rewarded_time') || 0);
} catch (e) {}

export const getRewardedCooldownRemainingSec = () => {
  const now = Date.now();
  const diff = now - lastRewardedTime;
  if (diff >= dynamicRewardedCooldownMs) return 0;
  return Math.max(0, Math.ceil((dynamicRewardedCooldownMs - diff) / 1000));
};

export const recordRewardedAdShown = () => {
  lastRewardedTime = Date.now();
  try {
    localStorage.setItem('admob_last_rewarded_time', String(lastRewardedTime));
  } catch (e) {}
};

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
    if (typeof window.AndroidAds.getRewardedCooldownSec === 'function') {
      const rSec = window.AndroidAds.getRewardedCooldownSec();
      if (rSec > 0) dynamicRewardedCooldownMs = rSec * 1000;
    }
  } catch (e) {
    // Non-fatal fallback
  }
}

// Real-time listener for Firebase Remote Config updates pushed from MainActivity.java
if (typeof window !== 'undefined') {
  window.addEventListener('remote_config_ads_updated', (e) => {
    if (e && e.detail) {
      const { interstitial_cooldown_sec, rewarded_cooldown_sec, native_ad_cooldown_sec, show_ads, show_banner_ads, show_interstitial_ads, show_native_ads } = e.detail;
      if (typeof interstitial_cooldown_sec === 'number' && interstitial_cooldown_sec > 0) {
        dynamicCooldownMs = interstitial_cooldown_sec * 1000;
        console.log(`[AdMob Remote Config] Updated cooldown to ${interstitial_cooldown_sec}s`);
      }
      if (typeof rewarded_cooldown_sec === 'number' && rewarded_cooldown_sec > 0) {
        dynamicRewardedCooldownMs = rewarded_cooldown_sec * 1000;
        console.log(`[AdMob Remote Config] Updated rewarded cooldown to ${rewarded_cooldown_sec}s`);
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
 * @param {boolean} force - If true, bypasses the cooldown (still subject to 60s hard throttle)
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
  const minInterval = force ? 60000 : dynamicCooldownMs;
  if (now - lastInterstitialTime < minInterval) {
    // Cooldown is active: Silently skip ad to protect account from AdMob frequency limits
    return false;
  }

  // Check daily limit
  if (getDailyInterstitialCount() >= DAILY_INTERSTITIAL_LIMIT) {
    return false;
  }

  try {
    if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.showInterstitial === 'function') {
      window.AndroidAds.showInterstitial();
      lastInterstitialTime = now;
      try {
        localStorage.setItem('admob_last_interstitial_time', String(now));
      } catch (e) {}
      incrementDailyInterstitialCount();
      resetInterstitialActionCount();
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
  // Deprecated for policy compliance: programmatic performClick is prohibited by AdMob
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
/**
 * Shows a temporary, non-clickable 1-second "Loading Ad..." safety dialog
 * to alert the user that an Interstitial Ad is about to appear, preventing accidental clicks.
 */
export const showLoadingAdDialog = (isEn = false) => {
  if (typeof document === 'undefined') return () => {};
  try {
    const existing = document.getElementById('admob_loading_ad_dialog');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    const overlay = document.createElement('div');
    overlay.id = 'admob_loading_ad_dialog';
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:9999999',
      'background:rgba(15, 23, 42, 0.72)',
      'backdrop-filter:blur(4px)',
      'WebkitBackdropFilter:blur(4px)',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'pointer-events:all',
      'user-select:none'
    ].join(';');

    const box = document.createElement('div');
    box.style.cssText = [
      'background:#ffffff',
      'border-radius:12px',
      'padding:14px 22px',
      'display:flex',
      'align-items:center',
      'gap:12px',
      'box-shadow:0 12px 32px rgba(0,0,0,0.3)',
      'border:1px solid #e2e8f0',
      'animation:fadeIn 0.15s ease-out'
    ].join(';');

    box.innerHTML = `
      <div style="width:20px;height:20px;border:2.5px solid #e2e8f0;border-top-color:#2563eb;border-radius:50%;animation:admobSpin 0.75s linear infinite;flex-shrink:0;"></div>
      <span style="font-size:13px;font-weight:700;color:#0f172a;font-family:'Noto Sans Bengali',sans-serif;white-space:nowrap;">
        ${isEn ? 'Loading Ad...' : 'বিজ্ঞাপন লোড হচ্ছে...'}
      </span>
      <style>
        @keyframes admobSpin { to { transform: rotate(360deg); } }
      </style>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    return () => {
      try {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      } catch (e) {}
    };
  } catch (e) {
    return () => {};
  }
};

/**
 * Safe Back Navigation with Interstitial Ad Display.
 * Used when a user returns to the main menu/list after finishing a set of questions
 * (e.g. from QuestionDetails or LiveExamRoom).
 * 
 * Rules:
 * 1. Action Counter: User must have completed/backed from at least 4 items (INTERSTITIAL_ACTION_THRESHOLD = 4).
 * 2. Cooldown Timer: At least 3 minutes (180 seconds) must have passed since last interstitial.
 * 3. Daily Cap: Max 10 interstitials per day.
 * 4. Ad Ready Check: Ad must be preloaded and ready (isNativeInterstitialReady).
 * 5. Safety Dialog: Shows a 1-second "Loading Ad..." modal before displaying the ad to prevent accidental clicks.
 * 6. Zero Interruption: If any rule fails, navigates immediately with 0ms delay.
 * 
 * @param {Function} navigate - React Router navigate function
 * @param {string|number} fallbackPath - Navigation target (default: -1)
 * @param {boolean} force - Whether to bypass action counter (still throttled by 60s hard cooldown)
 * @param {boolean} isEn - English language toggle for dialog
 */
export const navigateWithAdOnReturn = (navigate, fallbackPath = -1, force = false, isEn = false) => {
  const isReady = isNativeInterstitialReady();
  const now = Date.now();

  // Increment action count every time user reads/backs from a content page
  const actionCount = incrementInterstitialActionCount();

  // Refresh cooldown if available from Native
  if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.getInterstitialCooldownSec === 'function') {
    try {
      const nativeSec = window.AndroidAds.getInterstitialCooldownSec();
      if (nativeSec > 0) dynamicCooldownMs = nativeSec * 1000;
    } catch (e) {}
  }

  const minCooldown = force ? 60000 : dynamicCooldownMs;
  const cooldownPassed = (now - lastInterstitialTime >= minCooldown);
  const thresholdReached = force || (actionCount >= INTERSTITIAL_ACTION_THRESHOLD);
  const underDailyLimit = getDailyInterstitialCount() < DAILY_INTERSTITIAL_LIMIT;

  const executeNavigation = () => {
    if (typeof fallbackPath === 'number' || typeof fallbackPath === 'string') {
      navigate(fallbackPath);
    } else {
      navigate(-1);
    }
  };

  // Check all safety conditions before showing Interstitial Ad
  if (isReady && cooldownPassed && thresholdReached && underDailyLimit) {
    // Show 1-second "Loading Ad..." alert dialog to prevent accidental clicks
    const removeDialog = showLoadingAdDialog(isEn);

    setTimeout(() => {
      removeDialog();

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

      // Safety fallback: if dismissed event doesn't fire within 800ms, proceed
      setTimeout(doNavigateOnce, 800);

      const shown = showNativeInterstitialAd(force);
      if (!shown) {
        doNavigateOnce();
      }
    }, 1000);
  } else {
    // Not ready, in cooldown, or action counter not reached: Proceed directly without interrupting the user
    executeNavigation();
  }
};

// Sync lastInterstitialTime when native Android triggers an interstitial directly
if (typeof window !== 'undefined') {
  window.addEventListener('native_interstitial_shown', () => {
    lastInterstitialTime = Date.now();
    try {
      localStorage.setItem('admob_last_interstitial_time', String(lastInterstitialTime));
    } catch (e) {}
  });
}

/**
 * Preloads an Interstitial Ad in background so it is ready for safe display.
 */
export const armInterstitialOnBrowserReturn = () => {
  try {
    preloadInterstitialAd();
  } catch (err) {}
  return false;
};

/**
 * ═══ Rewarded Ad Engine (Live Exam Points System) ═══
 * Policy Compliant: Directly calls native Google Mobile Ads SDK for official AdMob Rewarded Test Ad.
 * Never uses simulated fake HTML overlays.
 */

export const isRewardedAdReady = () => {
  try {
    if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.isRewardedAdReady === 'function') {
      return Boolean(window.AndroidAds.isRewardedAdReady());
    }
  } catch (e) {}
  return false;
};

export const preloadRewardedAd = () => {
  try {
    if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.loadRewardedAd === 'function') {
      window.AndroidAds.loadRewardedAd();
      return true;
    }
  } catch (e) {}
  return false;
};

/**
 * Triggers the official Google AdMob Rewarded Test Ad via native Android Bridge
 * and resolves with `{ status: 'earned' | 'dismissed' | 'failed' | 'not_ready' }`.
 */
export const showRewardedAd = ({ rewardPoints = 10, isEn = false } = {}) => {
  return new Promise((resolve) => {
    const hasNativeBridge =
      typeof window !== 'undefined' &&
      window.AndroidAds &&
      typeof window.AndroidAds.showRewardedAd === 'function';

    if (!hasNativeBridge) {
      resolve({
        status: 'not_ready',
        message: isEn ? 'Ads are only available in the Android application.' : 'বিজ্ঞাপন শুধুমাত্র অ্যান্ড্রয়েড অ্যাপে উপলব্ধ।'
      });
      return;
    }

    let settled = false;
    let earnedFlag = false;
    let safetyTimer = null;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      if (safetyTimer) clearTimeout(safetyTimer);
      window.removeEventListener('native_rewarded_earned', onEarned);
      window.removeEventListener('native_rewarded_dismissed', onDismissed);
      window.removeEventListener('native_rewarded_failed', onFailed);
      window.removeEventListener('native_rewarded_shown', onShown);
      resolve(result);
    };

    const onEarned = () => {
      earnedFlag = true;
    };

    const onShown = () => {
      // Ad is actively playing on screen; clear load timeout so user can watch full video
      if (safetyTimer) {
        clearTimeout(safetyTimer);
        safetyTimer = null;
      }
    };

    const onDismissed = (e) => {
      const earned = earnedFlag || Boolean(e?.detail?.earned);
      if (earned) {
        recordRewardedAdShown();
      }
      preloadRewardedAd();
      finish({ status: earned ? 'earned' : 'dismissed', source: 'admob' });
    };

    const onFailed = () => {
      preloadRewardedAd();
      finish({
        status: 'failed',
        message: isEn ? 'Ad could not be loaded. Please try again shortly.' : 'বিজ্ঞাপন লোড হতে পারেনি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।'
      });
    };

    window.addEventListener('native_rewarded_earned', onEarned);
    window.addEventListener('native_rewarded_dismissed', onDismissed);
    window.addEventListener('native_rewarded_failed', onFailed);
    window.addEventListener('native_rewarded_shown', onShown);

    // Wait up to 8 seconds for native Google AdMob Rewarded Test Ad to display
    safetyTimer = setTimeout(() => {
      if (!settled) {
        onFailed();
      }
    }, 8000);

    try {
      window.AndroidAds.showRewardedAd();
    } catch (e) {
      onFailed();
    }
  });
};

