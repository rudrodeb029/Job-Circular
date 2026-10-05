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
      const adsEnabled = typeof window.AndroidAds.isInterstitialAdsEnabled === 'function'
        ? window.AndroidAds.isInterstitialAdsEnabled()
        : true;

      if (!adsEnabled) {
        destinationCallback();
        return;
      }

      // Safety timeout: Ensure destination callback is invoked even if native ad freezes or takes > 8s
      const safetyTimeout = setTimeout(() => {
        cleanup();
        destinationCallback();
      }, 8000);

      const onFinished = () => {
        clearTimeout(safetyTimeout);
        cleanup();
        destinationCallback();
      };

      const cleanup = () => {
        window.removeEventListener('native_interstitial_dismissed', onFinished);
        window.removeEventListener('native_interstitial_failed', onFinished);
        window.onNativeInterstitialDismissed = null;
        window.onNativeInterstitialFailed = null;
      };

      window.addEventListener('native_interstitial_dismissed', onFinished, { once: true });
      window.addEventListener('native_interstitial_failed', onFinished, { once: true });
      window.onNativeInterstitialDismissed = onFinished;
      window.onNativeInterstitialFailed = onFinished;

      // Trigger the official Google AdMob interstitial ad in Android MainActivity
      window.AndroidAds.showInterstitial();
      return;
    } catch (e) {
      console.warn('Native AndroidAds.showInterstitial error:', e);
      destinationCallback();
      return;
    }
  }

  // 2. In Web Browser / Non-Android: Proceed directly to destination
  destinationCallback();
}
