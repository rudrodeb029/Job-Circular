/**
 * Media & Cloud URL normalization utility.
 * Handles Google Drive sharing links, Cloudinary assets, and standard image/PDF URLs.
 */

/**
 * Extracts Google Drive File ID from various link formats.
 * e.g., /file/d/ID/view, open?id=ID, uc?id=ID, /d/ID
 * 
 * @param {string} url - Input URL
 * @returns {string|null} - File ID or null
 */
export function getGoogleDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();

  const fileDMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  const dMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/i);
  if (dMatch && dMatch[1]) return dMatch[1];

  const idQueryMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (idQueryMatch && idQueryMatch[1]) return idQueryMatch[1];

  const ucMatch = cleanUrl.match(/\/uc\?export=[^&]+&id=([a-zA-Z0-9_-]+)/i);
  if (ucMatch && ucMatch[1]) return ucMatch[1];

  return null;
}

/**
 * Checks if a URL is a Google Drive URL.
 * 
 * @param {string} url - Input URL
 * @returns {boolean}
 */
export function isGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('drive.google.com') ||
         url.includes('docs.google.com') ||
         url.includes('googleusercontent.com');
}

/**
 * Normalizes any image/PDF URL for direct rendering in <img>, <iframe>, or preview containers.
 * Converts Google Drive sharing links to high-res direct image CDN stream (lh3.googleusercontent.com/d/ID).
 * 
 * @param {string} url - Raw URL entered by admin or stored in database
 * @returns {string} - Direct renderable URL
 */
export function normalizeMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  const driveId = getGoogleDriveFileId(trimmed);
  if (driveId) {
    // High-resolution direct streaming endpoint for Google Drive files
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }

  return trimmed;
}

/**
 * Normalizes an array or comma-separated string of media URLs.
 * 
 * @param {string|string[]} mediaInput - Comma-separated string or array of URLs
 * @returns {string[]} - Array of cleaned, normalized direct URLs
 */
export function normalizeMediaUrls(mediaInput) {
  if (!mediaInput) return [];

  let rawList = [];
  if (Array.isArray(mediaInput)) {
    rawList = mediaInput;
  } else if (typeof mediaInput === 'string') {
    rawList = mediaInput.split(',').map(u => u.trim());
  }

  return rawList
    .map(u => (typeof u === 'string' ? u.trim() : ''))
    .filter(u => u.length > 0)
    .map(u => normalizeMediaUrl(u));
}
