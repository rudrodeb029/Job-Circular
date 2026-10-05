let activeAdSession = null;

/**
 * Triggers the default native Google AdMob Interstitial Ad.
 * Guarantees onComplete() executes ONLY AFTER the AdMob interstitial ad completes/is dismissed by user.
 * If running in a web browser or if ads are disabled/unavailable, proceeds directly to destination.
 *
 * @param {Function} onComplete - Destination callback (e.g. open portal or open file download modal)
 * @param {object} [options] - Optional metadata
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

  // 1. Check Native Android Bridge (window.AndroidAds) for Google AdMob
  if (typeof window !== 'undefined' && window.AndroidAds && typeof window.AndroidAds.showInterstitial === 'function') {
    try {
      // Check if interstitial ads are enabled
      const adsEnabled = typeof window.AndroidAds.isInterstitialAdsEnabled === 'function'
        ? window.AndroidAds.isInterstitialAdsEnabled()
        : true;

      if (!adsEnabled) {
        destinationCallback();
        return;
      }

      // Safety timeout: Ensure destination callback is invoked even if native ad freezes or takes > 6s
      const safetyTimeout = setTimeout(() => {
        cleanupNativeListeners();
        destinationCallback();
      }, 6000);

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

      // Trigger the official Google AdMob interstitial ad in Android MainActivity
      window.AndroidAds.showInterstitial();
      return;
    } catch (e) {
      console.warn('Native AndroidAds.showInterstitial error:', e);
      destinationCallback();
      return;
    }
  }

  // 2. In Web Browser / Non-Android: Proceed directly to destination (no fake/custom ad UI)
  destinationCallback();
}
