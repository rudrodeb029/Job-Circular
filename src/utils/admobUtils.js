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


// Sync lastInterstitialTime when native Android triggers an interstitial directly (e.g. onResume from Custom In-App Browser)
if (typeof window !== 'undefined') {
  window.addEventListener('native_interstitial_shown', () => {
    lastInterstitialTime = Date.now();
  });
}

/**
 * Arms the Native Android engine and preloads an Interstitial Ad before opening
 * the Custom In-App Browser (Chrome Custom Tabs). When the user clicks the Cross (✕)
 * icon or Back button to return to the app, the Interstitial Ad displays automatically.
 */
export const armInterstitialOnBrowserReturn = () => {
  try {
    preloadInterstitialAd();
    if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.notifyInAppBrowserOpened === 'function') {
      window.AndroidAds.notifyInAppBrowserOpened();
      return true;
    }
  } catch (err) {
    console.error('Error arming interstitial on browser return:', err);
  }
  return false;
};

/**
 * ═══ Rewarded Ad Engine (Live Exam Points System) ═══
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
 * Displays a 3-second simulated Rewarded Ad overlay when running in a web browser
 * or when AdMob test/network inventory temporarily has no fill.
 */
export const GOOGLE_ADMOB_TEST_AD_UNITS = {
  APP_ID: 'ca-app-pub-3940256099942544~3347511713',
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  NATIVE: 'ca-app-pub-3940256099942544/2247696110',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917'
};

const showSimulatedRewardedAdOverlay = (rewardPoints = 10, isEn = false) => {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve({ status: 'earned', source: 'admob_test' });
      return;
    }

    const totalSec = 5;
    let remaining = totalSec;
    let finished = false;

    const overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:999999',
      'background:#0b0f19',
      'display:flex',
      'flex-direction:column',
      'justify-content:space-between',
      'font-family:"Roboto","Hind Siliguri",sans-serif',
      'color:#ffffff',
      'user-select:none'
    ].join(';');

    // Top AdMob Official Test Ad Status Bar
    const topBar = document.createElement('div');
    topBar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:rgba(0,0,0,0.65);border-bottom:1px solid rgba(255,255,255,0.08);';

    const leftBadges = document.createElement('div');
    leftBadges.style.cssText = 'display:flex;align-items:center;gap:8px;';

    const testAdBadge = document.createElement('span');
    testAdBadge.style.cssText = 'background:#fbbc04;color:#111827;font-size:11px;font-weight:900;padding:3px 8px;border-radius:4px;letter-spacing:0.4px;text-transform:uppercase;';
    testAdBadge.textContent = 'Test Ad';

    const timerPill = document.createElement('span');
    timerPill.style.cssText = 'background:rgba(255,255,255,0.14);color:#f8fafc;font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px;';
    timerPill.textContent = isEn ? `Reward in ${remaining} seconds` : `${remaining} সেকেন্ড পর রিওয়ার্ড`;

    leftBadges.appendChild(testAdBadge);
    leftBadges.appendChild(timerPill);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.style.cssText = 'width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,0.25);background:rgba(255,255,255,0.12);color:#ffffff;font-size:15px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;';
    closeBtn.textContent = '✕';

    topBar.appendChild(leftBadges);
    topBar.appendChild(closeBtn);

    // Center Google AdMob Test Video Canvas
    const centerStage = document.createElement('div');
    centerStage.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;background:radial-gradient(circle at center,#1e293b 0%,#0b0f19 75%);';

    const admobCard = document.createElement('div');
    admobCard.style.cssText = 'width:100%;max-width:340px;background:#111827;border:1.5px solid rgba(251,188,4,0.45);border-radius:12px;padding:22px 18px;box-shadow:0 20px 50px rgba(0,0,0,0.65);';

    const googleLogo = document.createElement('div');
    googleLogo.style.cssText = 'width:54px;height:54px;border-radius:12px;background:linear-gradient(135deg,#4285f4 0%,#34a853 50%,#fbbc04 100%);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#fff;margin:0 auto 12px auto;box-shadow:0 6px 18px rgba(66,133,244,0.35);';
    googleLogo.textContent = 'G';

    const headline = document.createElement('div');
    headline.style.cssText = 'font-size:15px;font-weight:800;color:#ffffff;margin-bottom:4px;';
    headline.textContent = 'Google AdMob Rewarded Test Ad';

    const unitText = document.createElement('div');
    unitText.style.cssText = 'font-size:10.5px;font-family:monospace;color:#93c5fd;background:rgba(37,99,235,0.16);border:1px solid rgba(59,130,246,0.3);padding:4px 8px;border-radius:5px;display:inline-block;margin-bottom:10px;';
    unitText.textContent = GOOGLE_ADMOB_TEST_AD_UNITS.REWARDED;

    const subText = document.createElement('p');
    subText.style.cssText = 'margin:0 0 14px 0;font-size:11.5px;color:#cbd5e1;line-height:1.45;';
    subText.textContent = isEn
      ? `Nice job! You are displaying a Google AdMob Rewarded Test Ad (+${rewardPoints} Exam Points).`
      : `Google AdMob অফিসিয়াল টেস্ট রিওয়ার্ড ভিডিও বিজ্ঞাপন চলছে (+${rewardPoints} পয়েন্ট)।`;

    const progressTrack = document.createElement('div');
    progressTrack.style.cssText = 'width:100%;height:6px;background:rgba(255,255,255,0.12);border-radius:999px;overflow:hidden;';
    const progressFill = document.createElement('div');
    progressFill.style.cssText = 'width:0%;height:100%;background:linear-gradient(90deg,#4285f4,#34a853,#fbbc04);transition:width 0.95s linear;';
    progressTrack.appendChild(progressFill);

    admobCard.appendChild(googleLogo);
    admobCard.appendChild(headline);
    admobCard.appendChild(unitText);
    admobCard.appendChild(subText);
    admobCard.appendChild(progressTrack);
    centerStage.appendChild(admobCard);

    // Bottom AdMob Footer Banner
    const bottomBar = document.createElement('div');
    bottomBar.style.cssText = 'padding:12px 16px;background:#111827;border-top:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;gap:10px;';

    const footerInfo = document.createElement('div');
    footerInfo.innerHTML = `<div style="font-size:12px;font-weight:800;color:#f8fafc;">Google Mobile Ads SDK</div><div style="font-size:10px;color:#94a3b8;">Official Test Ad • Rewarded Video</div>`;

    const actionBtn = document.createElement('button');
    actionBtn.type = 'button';
    actionBtn.style.cssText = 'padding:8px 14px;border-radius:6px;border:none;background:#4285f4;color:#ffffff;font-size:11.5px;font-weight:800;cursor:pointer;';
    actionBtn.textContent = isEn ? 'Watch to Earn' : 'দেখুন';

    bottomBar.appendChild(footerInfo);
    bottomBar.appendChild(actionBtn);

    overlay.appendChild(topBar);
    overlay.appendChild(centerStage);
    overlay.appendChild(bottomBar);
    document.body.appendChild(overlay);

    setTimeout(() => {
      progressFill.style.width = `${Math.round((1 / totalSec) * 100)}%`;
    }, 50);

    const cleanup = () => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };

    const interval = setInterval(() => {
      remaining -= 1;
      const elapsed = totalSec - remaining;
      progressFill.style.width = `${Math.min(100, Math.round((elapsed / totalSec) * 100))}%`;

      if (remaining > 0) {
        timerPill.textContent = isEn ? `Reward in ${remaining} seconds` : `${remaining} সেকেন্ড পর রিওয়ার্ড`;
      } else {
        clearInterval(interval);
        finished = true;
        timerPill.style.background = '#10b981';
        timerPill.style.color = '#ffffff';
        timerPill.textContent = isEn ? `✓ Reward Granted (+${rewardPoints} Pts)` : `✓ রিওয়ার্ড অর্জিত (+${rewardPoints} পয়েন্ট)`;
        actionBtn.style.background = '#10b981';
        actionBtn.textContent = isEn ? 'Claim & Close' : 'পয়েন্ট নিন ✕';
        setTimeout(() => {
          cleanup();
          resolve({ status: 'earned', source: 'admob_test' });
        }, 700);
      }
    }, 1000);

    const handleClose = () => {
      clearInterval(interval);
      cleanup();
      if (finished) {
        resolve({ status: 'earned', source: 'admob_test' });
      } else {
        resolve({ status: 'dismissed', source: 'admob_test' });
      }
    };

    closeBtn.onclick = handleClose;
    actionBtn.onclick = () => {
      if (finished) handleClose();
    };
  });
};

/**
 * Triggers the official Google AdMob Rewarded Test Ad (`ca-app-pub-3940256099942544/5224354917`)
 * and resolves with `{ status: 'earned' | 'dismissed' | 'failed', source }`.
 */
export const showRewardedAd = ({ rewardPoints = 10, isEn = false } = {}) => {
  return new Promise((resolve) => {
    const hasNativeBridge =
      typeof window !== 'undefined' &&
      window.AndroidAds &&
      typeof window.AndroidAds.showRewardedAd === 'function';

    if (!hasNativeBridge) {
      showSimulatedRewardedAdOverlay(rewardPoints, isEn).then(resolve);
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
      finish({ status: earned ? 'earned' : 'dismissed', source: 'admob' });
    };

    const onFailed = () => {
      if (settled) return;
      settled = true;
      if (safetyTimer) clearTimeout(safetyTimer);
      window.removeEventListener('native_rewarded_earned', onEarned);
      window.removeEventListener('native_rewarded_dismissed', onDismissed);
      window.removeEventListener('native_rewarded_failed', onFailed);
      window.removeEventListener('native_rewarded_shown', onShown);
      // Fallback to Google AdMob Test Ad overlay if device has no network/play services fill
      showSimulatedRewardedAdOverlay(rewardPoints, isEn).then(resolve);
    };

    window.addEventListener('native_rewarded_earned', onEarned);
    window.addEventListener('native_rewarded_dismissed', onDismissed);
    window.addEventListener('native_rewarded_failed', onFailed);
    window.addEventListener('native_rewarded_shown', onShown);

    // Wait up to 8 seconds for native Google AdMob Rewarded Test Ad to load and display
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

