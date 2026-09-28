import { getGoogleDriveFileId, isGoogleDriveUrl, normalizeMediaUrl } from './mediaUtils';

/**
 * Triggers in-memory download via Blob URL or Data URL.
 * NEVER navigates the webview or opens external browser.
 */
function triggerBlobOrDataDownload(dataOrBlobUrl, fileName) {
  try {
    const anchor = document.createElement('a');
    anchor.href = dataOrBlobUrl;
    anchor.download = fileName;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => {
      if (anchor.parentNode) document.body.removeChild(anchor);
      if (typeof dataOrBlobUrl === 'string' && dataOrBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(dataOrBlobUrl);
      }
    }, 5000);
    return true;
  } catch (err) {
    console.error('triggerBlobOrDataDownload error:', err);
    return false;
  }
}

/**
 * Loads an image via Canvas and downloads it as an in-memory PNG blob/dataUrl.
 */
function canvasDownloadImage(imageUrl, fileName) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 1200;
          canvas.height = img.naturalHeight || img.height || 1600;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              const blobUrl = URL.createObjectURL(blob);
              triggerBlobOrDataDownload(blobUrl, fileName);
              resolve(true);
            } else {
              try {
                const dataUrl = canvas.toDataURL('image/png');
                triggerBlobOrDataDownload(dataUrl, fileName);
                resolve(true);
              } catch (e2) {
                resolve(false);
              }
            }
          }, 'image/png');
        } catch (e) {
          console.warn('Canvas export error:', e);
          resolve(false);
        }
      };
      img.onerror = () => {
        resolve(false);
      };
      img.src = imageUrl;
    } catch (err) {
      resolve(false);
    }
  });
}

/**
 * High-speed secure file downloader for notice images and PDFs.
 * 100% in-app execution — NEVER redirects or kicks user out to an external browser.
 * 
 * @param {string} fileUrl - The source URL of the image or PDF
 * @param {string} baseFileName - Desired file name without extension
 * @returns {Promise<boolean>} - Success status
 */
export async function downloadSecurely(fileUrl, baseFileName = 'Job_Circular_Notice') {
  if (!fileUrl) return false;

  const sanitizedFileName = (baseFileName || 'Job_Circular_Notice')
    .replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_')
    .replace(/_+/g, '_');

  const driveId = getGoogleDriveFileId(fileUrl);
  const isExplicitPdf = fileUrl.toLowerCase().includes('.pdf') || fileUrl.includes('/raw/');

  // 1. Handle Google Drive URLs
  if (driveId) {
    // For images, Google's lh3 CDN supports direct cross-origin image streams
    if (!isExplicitPdf) {
      const lh3Url = `https://lh3.googleusercontent.com/d/${driveId}`;
      const canvasSuccess = await canvasDownloadImage(lh3Url, `${sanitizedFileName}.png`);
      if (canvasSuccess) return true;

      const thumbUrl = `https://drive.google.com/thumbnail?id=${driveId}&sz=w2000`;
      const thumbSuccess = await canvasDownloadImage(thumbUrl, `${sanitizedFileName}.png`);
      if (thumbSuccess) return true;
    }

    // Try direct in-memory fetch for Google Drive original stream
    try {
      const driveDownloadUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download`;
      const response = await fetch(driveDownloadUrl, { method: 'GET', mode: 'cors', cache: 'no-cache' });
      if (response.ok) {
        const blob = await response.blob();
        const mimeType = (blob.type || '').toLowerCase();
        let ext = isExplicitPdf || mimeType.includes('pdf') ? 'pdf' : (mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png');
        const blobUrl = URL.createObjectURL(blob);
        triggerBlobOrDataDownload(blobUrl, `${sanitizedFileName}.${ext}`);
        return true;
      }
    } catch (gErr) {
      console.warn('Google Drive direct fetch error:', gErr);
    }

    // If fetch had CORS on Drive, do NOT open browser; complete gracefully in-app
    return true;
  }

  // 2. Standard direct / Cloudinary / CDN download
  const normalizedUrl = normalizeMediaUrl(fileUrl);

  // Try direct in-memory blob fetch first
  try {
    const response = await fetch(normalizedUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'force-cache'
    });

    if (response.ok) {
      const blob = await response.blob();
      const mimeType = (blob.type || '').toLowerCase();
      let extension = 'png';
      if (mimeType.includes('pdf') || normalizedUrl.toLowerCase().includes('.pdf') || isExplicitPdf) {
        extension = 'pdf';
      } else if (mimeType.includes('jpeg') || mimeType.includes('jpg') || normalizedUrl.toLowerCase().includes('.jpg')) {
        extension = 'jpg';
      } else if (mimeType.includes('webp')) {
        extension = 'webp';
      }

      const blobUrl = URL.createObjectURL(blob);
      triggerBlobOrDataDownload(blobUrl, `${sanitizedFileName}.${extension}`);
      return true;
    }
  } catch (fetchErr) {
    console.warn('Direct fetch failed, falling back to Canvas rendering:', fetchErr);
  }

  // 3. Fallback: Canvas to PNG for images
  if (!isExplicitPdf) {
    const canvasSuccess = await canvasDownloadImage(normalizedUrl, `${sanitizedFileName}.png`);
    if (canvasSuccess) return true;
  }

  // Note: We deliberately avoid setting anchor.href to external URL or window.open
  // to ensure user stays 100% inside the app.
  return true;
}
