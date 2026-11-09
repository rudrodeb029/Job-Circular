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
const showSimulatedRewardedAdOverlay = (rewardPoints = 10, isEn = false) => {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve({ status: 'earned', source: 'simulated' });
      return;
    }

    const overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:999999',
      'background:rgba(15,23,42,0.88)',
      'backdrop-filter:blur(6px)',
      '-webkit-backdrop-filter:blur(6px)',
      'display:flex',
      'flex-direction:column',
      'align-items:center',
      'justify-content:center',
      'padding:20px',
      'font-family:"Hind Siliguri","Poppins",sans-serif',
      'color:#ffffff',
      'user-select:none'
    ].join(';');

    let remaining = 3;
    let finished = false;

    const card = document.createElement('div');
    card.style.cssText = [
      'width:100%',
      'max-width:340px',
      'background:linear-gradient(145deg,#1e293b,#0f172a)',
      'border:1px solid rgba(255,255,255,0.14)',
      'border-radius:18px',
      'padding:24px 20px',
      'text-align:center',
      'box-shadow:0 20px 50px rgba(0,0,0,0.5)',
      'position:relative'
    ].join(';');

    const badge = document.createElement('div');
    badge.style.cssText = 'display:inline-flex;align-items:center;gap:6px;background:rgba(245,158,11,0.18);border:1px solid rgba(245,158,11,0.4);color:#fbbf24;font-size:11px;font-weight:800;padding:4px 12px;border-radius:999px;margin-bottom:14px;';
    badge.textContent = isEn ? `🎬 REWARDED AD • +${rewardPoints} POINTS` : `🎬 রিওয়ার্ড বিজ্ঞাপন • +${rewardPoints} পয়েন্ট`;

    const icon = document.createElement('div');
    icon.style.cssText = 'width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#1d4ed8);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px auto;box-shadow:0 8px 24px rgba(37,99,235,0.45);';
    icon.textContent = '⭐';

    const title = document.createElement('h3');
    title.style.cssText = 'margin:0 0 6px 0;font-size:16px;font-weight:800;color:#f8fafc;';
    title.textContent = isEn ? 'Live Circular Exam Sponsor' : 'লাইভ পরীক্ষা পয়েন্ট বোনাস';

    const desc = document.createElement('p');
    desc.style.cssText = 'margin:0 0 18px 0;font-size:12px;color:#94a3b8;line-height:1.5;';
    desc.textContent = isEn
      ? `Watch for ${remaining} seconds to unlock +${rewardPoints} Live Exam points.`
      : `সম্পূর্ণ বিজ্ঞাপনটি দেখলে আপনার একাউন্টে +${rewardPoints} লাইভ এক্সাম পয়েন্ট যোগ হবে।`;

    const timerBox = document.createElement('div');
    timerBox.style.cssText = 'padding:10px 16px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);font-size:13px;font-weight:800;color:#fde68a;margin-bottom:14px;';
    timerBox.textContent = isEn ? `Reward in ${remaining}s...` : `পয়েন্ট যুক্ত হচ্ছে: ${remaining} সেকেন্ড...`;

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.style.cssText = 'width:100%;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.08);color:#cbd5e1;font-size:12px;font-weight:700;cursor:pointer;';
    closeBtn.textContent = isEn ? 'Cancel Ad' : 'বাতিল করুন';

    card.appendChild(badge);
    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(timerBox);
    card.appendChild(closeBtn);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const cleanup = () => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };

    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        timerBox.textContent = isEn ? `Reward in ${remaining}s...` : `পয়েন্ট যুক্ত হচ্ছে: ${remaining} সেকেন্ড...`;
      } else {
        clearInterval(interval);
        finished = true;
        timerBox.style.background = 'rgba(16,185,129,0.2)';
        timerBox.style.borderColor = 'rgba(16,185,129,0.45)';
        timerBox.style.color = '#34d399';
        timerBox.textContent = isEn ? `✓ +${rewardPoints} Points Earned!` : `✓ +${rewardPoints} পয়েন্ট অর্জিত হয়েছে!`;
        closeBtn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
        closeBtn.style.borderColor = 'transparent';
        closeBtn.style.color = '#ffffff';
        closeBtn.textContent = isEn ? 'Claim Points & Continue' : 'পয়েন্ট সংগ্রহ করুন';
        setTimeout(() => {
          cleanup();
          resolve({ status: 'earned', source: 'simulated' });
        }, 650);
      }
    }, 1000);

    closeBtn.onclick = () => {
      clearInterval(interval);
      cleanup();
      if (finished) {
        resolve({ status: 'earned', source: 'simulated' });
      } else {
        resolve({ status: 'dismissed', source: 'simulated' });
      }
    };
  });
};

/**
 * Triggers a Rewarded Ad and resolves with `{ status: 'earned' | 'dismissed' | 'failed', source }`.
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

    const finish = (result) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('native_rewarded_earned', onEarned);
      window.removeEventListener('native_rewarded_dismissed', onDismissed);
      window.removeEventListener('native_rewarded_failed', onFailed);
      resolve(result);
    };

    const onEarned = () => {
      earnedFlag = true;
    };

    const onDismissed = (e) => {
      const earned = earnedFlag || Boolean(e?.detail?.earned);
      finish({ status: earned ? 'earned' : 'dismissed', source: 'admob' });
    };

    const onFailed = () => {
      window.removeEventListener('native_rewarded_earned', onEarned);
      window.removeEventListener('native_rewarded_dismissed', onDismissed);
      window.removeEventListener('native_rewarded_failed', onFailed);
      if (!settled) {
        settled = true;
        // Fallback to simulated overlay so user is never stuck when AdMob inventory has no fill
        showSimulatedRewardedAdOverlay(rewardPoints, isEn).then(resolve);
      }
    };

    const triggerShow = () => {
      window.addEventListener('native_rewarded_earned', onEarned);
      window.addEventListener('native_rewarded_dismissed', onDismissed);
      window.addEventListener('native_rewarded_failed', onFailed);
      try {
        window.AndroidAds.showRewardedAd();
      } catch (e) {
        onFailed();
      }
    };

    if (isRewardedAdReady()) {
      triggerShow();
    } else {
      // Request preload and wait up to 2.5s for AdMob to load before falling back
      preloadRewardedAd();
      let loadWaitDone = false;
      const onLoaded = () => {
        if (loadWaitDone) return;
        loadWaitDone = true;
        window.removeEventListener('native_rewarded_loaded', onLoaded);
        window.removeEventListener('native_rewarded_load_failed', onLoadFailed);
        triggerShow();
      };
      const onLoadFailed = () => {
        if (loadWaitDone) return;
        loadWaitDone = true;
        window.removeEventListener('native_rewarded_loaded', onLoaded);
        window.removeEventListener('native_rewarded_load_failed', onLoadFailed);
        showSimulatedRewardedAdOverlay(rewardPoints, isEn).then(resolve);
      };
      window.addEventListener('native_rewarded_loaded', onLoaded);
      window.addEventListener('native_rewarded_load_failed', onLoadFailed);
      setTimeout(() => {
        if (!loadWaitDone) {
          loadWaitDone = true;
          window.removeEventListener('native_rewarded_loaded', onLoaded);
          window.removeEventListener('native_rewarded_load_failed', onLoadFailed);
          if (isRewardedAdReady()) {
            triggerShow();
          } else {
            showSimulatedRewardedAdOverlay(rewardPoints, isEn).then(resolve);
          }
        }
      }, 2500);
    }
  });
};

