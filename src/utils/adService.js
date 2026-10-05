import { Capacitor } from '@capacitor/core';

let activeAdSession = null;

/**
 * Shows an Interstitial Ad and guarantees onComplete() runs ONLY AFTER the ad completes/closes.
 * Supports:
 * 1. Native Android JavascriptInterface (window.AndroidAds)
 * 2. In-App Interactive Countdown Modal Fallback (for web & when native ad is loading)
 *
 * @param {Function} onComplete - Destination callback (e.g. open portal or open file download modal)
 * @param {object} [options] - Metadata (title, url, pageType)
 */
export function showInterstitialAd(onComplete, options = {}) {
  let executed = false;

  const destinationCallback = () => {
    if (executed) return;
    executed = true;
    activeAdSession = null;

    if (typeof onComplete === 'function') {
      try {
        onComplete();
      } catch (err) {
        console.error('Destination callback error:', err);
      }
    }
  };

  // Prevent multiple overlapping ad sessions
  if (activeAdSession) {
    destinationCallback();
    return;
  }

  activeAdSession = { onComplete: destinationCallback };

  // 1. Check Native Android Bridge (window.AndroidAds)
  if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.showInterstitial === 'function') {
    try {
      // Check if interstitial ads are enabled and ready
      const adsEnabled = typeof window.AndroidAds.isInterstitialAdsEnabled === 'function'
        ? window.AndroidAds.isInterstitialAdsEnabled()
        : true;

      if (!adsEnabled) {
        destinationCallback();
        return;
      }

      // Safety timeout: Ensure destination callback is invoked even if native ad freezes or takes > 7s
      const safetyTimeout = setTimeout(() => {
        cleanupNativeListeners();
        destinationCallback();
      }, 7000);

      const onDismissed = () => {
        clearTimeout(safetyTimeout);
        cleanupNativeListeners();
        destinationCallback();
      };

      const onFailed = () => {
        clearTimeout(safetyTimeout);
        cleanupNativeListeners();
        destinationCallback();
      };

      const cleanupNativeListeners = () => {
        window.removeEventListener('native_interstitial_dismissed', onDismissed);
        window.removeEventListener('native_interstitial_failed', onFailed);
      };

      window.addEventListener('native_interstitial_dismissed', onDismissed, { once: true });
      window.addEventListener('native_interstitial_failed', onFailed, { once: true });

      // Trigger the native interstitial ad in Android MainActivity
      window.AndroidAds.showInterstitial();
      return;
    } catch (e) {
      console.warn('Native AndroidAds.showInterstitial error:', e);
      // Fall through to in-app fallback
    }
  }

  // 2. In-App Interstitial Ad Fallback (Full screen ad with 5s countdown & skip button)
  const fallbackTimeout = setTimeout(() => {
    destinationCallback();
  }, 10000);

  window.dispatchEvent(new CustomEvent('show_in_app_interstitial', {
    detail: {
      onComplete: () => {
        clearTimeout(fallbackTimeout);
        destinationCallback();
      },
      options
    }
  }));
}
