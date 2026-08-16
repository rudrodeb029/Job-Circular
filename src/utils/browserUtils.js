import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { sanitizePortalUrl } from '../pages/CircularWebViewScreen';

/**
 * Opens a URL in the native Android In-App Browser (Chrome Custom Tabs).
 * Automatically sanitizes Teletalk and BD government domains to prevent NET::ERR_CERT_AUTHORITY_INVALID.
 * 
 * @param {string} url - Target URL
 * @param {Function} [onWebFallback] - Optional callback for web platform
 */
export async function openInAppBrowser(url, onWebFallback) {
  if (!url) return;
  const targetUrl = sanitizePortalUrl(url);

  if (Capacitor.isNativePlatform()) {
    try {
      await Browser.open({
        url: targetUrl,
        toolbarColor: '#ffffff',
        presentationStyle: 'popover'
      });
      return;
    } catch (err) {
      console.warn('Native browser open error:', err);
    }
  }

  if (typeof onWebFallback === 'function') {
    onWebFallback(targetUrl);
  } else {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }
}
