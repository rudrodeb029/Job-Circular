import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { getGoogleDriveFileId } from './mediaUtils';
import { armInterstitialOnBrowserReturn, showNativeInterstitialAd } from './admobUtils';

let activeBrowserFinishedSub = null;

// Smart URL Formatter: BD Govt / Teletalk subdomains fail on HTTPS with ERR_CERT_AUTHORITY_INVALID, but work on HTTP
export function sanitizePortalUrl(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') return 'http://alljobs.teletalk.com.bd';
  let clean = inputUrl.trim();

  if (clean.includes('teletalk.com.bd')) {
    if (clean.startsWith('https://')) {
      return clean.replace('https://', 'http://');
    }
    if (!clean.startsWith('http://')) {
      return `http://${clean}`;
    }
    return clean;
  }

  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }

  return `https://${clean}`;
}

/**
 * Resolves a notice/circular file or portal URL for viewing/downloading inside the In-App Browser.
 * Converts Google Drive file/thumbnail links to full native viewer URLs (`https://drive.google.com/file/d/{id}/view`)
 * so users can view and download PDFs/images smoothly without CORS errors.
 *
 * @param {string} rawUrl - Raw notice or portal URL
 * @param {string} [fallbackUrl] - Fallback URL if rawUrl is empty
 * @returns {string} Sanitized target URL
 */
export function resolveNoticeBrowserUrl(rawUrl, fallbackUrl = 'http://alljobs.teletalk.com.bd') {
  const candidate = (!rawUrl || rawUrl === '#' || !String(rawUrl).trim()) ? fallbackUrl : String(rawUrl).trim();
  const driveId = getGoogleDriveFileId(candidate);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/view`;
  }
  return sanitizePortalUrl(candidate);
}

/**
 * Opens a URL in the native Android In-App Browser (Chrome Custom Tabs).
 * Automatically sanitizes Teletalk, BD government domains, and Google Drive notice URLs.
 * Preloads & arms the native Interstitial Ad so that when the user clicks the Cross (✕)
 * icon in the Custom In-App Browser to return to the app, the Interstitial Ad is shown.
 * 
 * @param {string} url - Target URL
 * @param {Function} [onWebFallback] - Optional callback for web platform
 */
export async function openInAppBrowser(url, onWebFallback) {
  const targetUrl = resolveNoticeBrowserUrl(url);
  if (!targetUrl) return;

  if (Capacitor.isNativePlatform()) {
    try {
      // 1. Preload interstitial & arm native MainActivity onResume return handler
      armInterstitialOnBrowserReturn();

      // 2. Register Capacitor browserFinished listener for when user clicks Cross (✕) icon
      if (activeBrowserFinishedSub) {
        try {
          await activeBrowserFinishedSub.remove();
        } catch (e) {}
        activeBrowserFinishedSub = null;
      }

      activeBrowserFinishedSub = await Browser.addListener('browserFinished', () => {
        if (activeBrowserFinishedSub) {
          activeBrowserFinishedSub.remove().catch(() => {});
          activeBrowserFinishedSub = null;
        }
        // Trigger interstitial ad upon returning to the app from Custom In-App Browser
        setTimeout(() => {
          showNativeInterstitialAd(true);
        }, 180);
      });

      await Browser.open({
        url: targetUrl,
        toolbarColor: '#1d4ed8',
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
