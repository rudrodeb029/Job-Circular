import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

/**
 * Opens a URL in the native Android In-App Browser (Chrome Custom Tabs).
 * This completely bypasses X-Frame-Options/CORS blocks on government portals (Teletalk etc.)
 * and gives full file upload capabilities.
 * 
 * @param {string} url - Target URL
 * @param {Function} [onWebFallback] - Optional callback for web platform
 */
export async function openInAppBrowser(url, onWebFallback) {
  if (!url) return;
  const targetUrl = url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `https://${url}`;

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
