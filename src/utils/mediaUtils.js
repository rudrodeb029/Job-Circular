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
 * Normalizes any image/PDF URL for direct snapshot rendering in <img> tags.
 * - Google Drive: Returns direct CDN image stream (lh3.googleusercontent.com/d/ID)
 * - Cloudinary PDF: Automatically transforms .pdf to .jpg snapshot of page 1
 * 
 * @param {string} url - Raw URL entered by admin or stored in database
 * @returns {string} - Direct image snapshot URL
 */
export function normalizeMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // 1. Google Drive: Detect ID
  const driveId = getGoogleDriveFileId(trimmed);
  if (driveId) {
    // If it's a PDF or we don't know, the thumbnail service is safest for previews
    if (trimmed.toLowerCase().includes('.pdf') || trimmed.includes('/view')) {
      return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`;
    }
    // For direct image formats, lh3 is very fast
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }

  // 2. Cloudinary PDF: Convert to high-quality JPG snapshot of page 1
  if (trimmed.includes('cloudinary.com') && (trimmed.toLowerCase().endsWith('.pdf') || trimmed.toLowerCase().includes('.pdf?'))) {
    return trimmed.replace(/\.pdf(\?.*)?$/i, '.jpg$1');
  }

  return trimmed;
}

/**
 * Normalizes an array or comma-separated string of media URLs into snapshot URLs.
 * 
 * @param {string|string[]} mediaInput - Comma-separated string or array of URLs
 * @returns {string[]} - Array of direct image snapshot URLs
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

/**
 * Extracts and cleans all raw circular media URLs from a job/exam/result object.
 * Checks all possible properties (images, circularImages, circularImage, imageUrl, noticeUrl, noticeImage, pdfUrl, pdf).
 * 
 * @param {object} item - Job, Exam, or Result item
 * @returns {string[]} - Array of raw URLs
 */
export function extractJobMediaList(item) {
  if (!item || typeof item !== 'object') return [];
  let rawList = [];

  if (item.images && item.images.length > 0) {
    if (Array.isArray(item.images)) {
      rawList = item.images.filter(img => img && typeof img === 'string' && img.trim());
    } else if (typeof item.images === 'string') {
      rawList = item.images.split(',').map(img => img.trim()).filter(Boolean);
    }
  }

  if (rawList.length === 0 && item.circularImages && item.circularImages.length > 0) {
    rawList = Array.isArray(item.circularImages) ? item.circularImages : [item.circularImages];
  }

  if (rawList.length === 0 && item.circularImage && typeof item.circularImage === 'string' && item.circularImage.trim()) {
    rawList = [item.circularImage];
  }

  if (rawList.length === 0 && item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.trim()) {
    rawList = [item.imageUrl];
  }

  if (rawList.length === 0 && item.noticeUrl && typeof item.noticeUrl === 'string' && item.noticeUrl.trim()) {
    rawList = [item.noticeUrl];
  }

  if (rawList.length === 0 && item.noticeImage && typeof item.noticeImage === 'string' && item.noticeImage.trim()) {
    rawList = [item.noticeImage];
  }

  if (rawList.length === 0 && item.pdfUrl && typeof item.pdfUrl === 'string' && item.pdfUrl.trim()) {
    rawList = [item.pdfUrl];
  }

  if (rawList.length === 0 && item.pdf && typeof item.pdf === 'string' && item.pdf.trim()) {
    rawList = [item.pdf];
  }

  if (rawList.length === 0 && item.examResult && typeof item.examResult === 'string' && item.examResult.trim() && item.examResult !== '#') {
    rawList = [item.examResult];
  }

  if (rawList.length === 0 && item.downloadLink && typeof item.downloadLink === 'string' && item.downloadLink.trim() && item.downloadLink !== '#') {
    rawList = [item.downloadLink];
  }

  return rawList.map(u => (typeof u === 'string' ? u.trim() : '')).filter(Boolean);
}
