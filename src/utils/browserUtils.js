import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { sanitizePortalUrl } from '../components/PortalWarningModal';
import { getGoogleDriveFileId } from './mediaUtils';

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
 * 
 * @param {string} url - Target URL
 * @param {Function} [onWebFallback] - Optional callback for web platform
 */
export async function openInAppBrowser(url, onWebFallback) {
  const targetUrl = resolveNoticeBrowserUrl(url);
  if (!targetUrl) return;

  if (Capacitor.isNativePlatform()) {
    try {
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
