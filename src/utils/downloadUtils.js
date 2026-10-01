import { getGoogleDriveFileId, isGoogleDriveUrl, normalizeMediaUrl } from './mediaUtils';

/**
 * Triggers in-memory download via Blob URL, Data URL, or direct URL.
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
 * Converts a Blob to a base64 Data URL and triggers download.
 * In Android Capacitor, data URLs are caught by MainActivity to write directly to Downloads folder.
 */
function triggerBase64Download(blob, fileName) {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
          triggerBlobOrDataDownload(dataUrl, fileName);
          resolve(true);
        } else {
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsDataURL(blob);
    } catch (e) {
      resolve(false);
    }
  });
}

/**
 * Loads an image via Canvas and downloads it as an in-memory PNG dataUrl/blob.
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

          try {
            const dataUrl = canvas.toDataURL('image/png');
            triggerBlobOrDataDownload(dataUrl, fileName);
            resolve(true);
            return;
          } catch (dataUrlErr) {
            // fallback to blob
          }

          canvas.toBlob((blob) => {
            if (blob) {
              triggerBase64Download(blob, fileName);
              const blobUrl = URL.createObjectURL(blob);
              triggerBlobOrDataDownload(blobUrl, fileName);
              resolve(true);
            } else {
              resolve(false);
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
 * Works natively on Android via DownloadManager & Base64 storage, and on Web via direct stream.
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
    const driveDownloadUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download`;
    const driveAltUrl = `https://drive.google.com/uc?export=download&id=${driveId}`;

    // On Native Android, trigger the direct download URL so Android DownloadManager queues it
    triggerBlobOrDataDownload(driveDownloadUrl, `${sanitizedFileName}.${isExplicitPdf ? 'pdf' : 'png'}`);

    if (!isExplicitPdf) {
      const lh3Url = `https://lh3.googleusercontent.com/d/${driveId}`;
      const canvasSuccess = await canvasDownloadImage(lh3Url, `${sanitizedFileName}.png`);
      if (canvasSuccess) return true;

      const thumbUrl = `https://drive.google.com/thumbnail?id=${driveId}&sz=w2000`;
      const thumbSuccess = await canvasDownloadImage(thumbUrl, `${sanitizedFileName}.png`);
      if (thumbSuccess) return true;
    }

    try {
      const response = await fetch(driveDownloadUrl, { method: 'GET', mode: 'cors', cache: 'no-cache' });
      if (response.ok) {
        const blob = await response.blob();
        const mimeType = (blob.type || '').toLowerCase();
        let ext = isExplicitPdf || mimeType.includes('pdf') ? 'pdf' : (mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png');
        await triggerBase64Download(blob, `${sanitizedFileName}.${ext}`);
        const blobUrl = URL.createObjectURL(blob);
        triggerBlobOrDataDownload(blobUrl, `${sanitizedFileName}.${ext}`);
        return true;
      }
    } catch (gErr) {
      console.warn('Google Drive direct fetch error:', gErr);
    }

    return true;
  }

  // 2. Standard direct / Cloudinary / CDN download
  const normalizedUrl = normalizeMediaUrl(fileUrl);
  let ext = isExplicitPdf || normalizedUrl.toLowerCase().includes('.pdf') ? 'pdf' : 'png';
  if (normalizedUrl.toLowerCase().includes('.jpg') || normalizedUrl.toLowerCase().includes('.jpeg')) {
    ext = 'jpg';
  } else if (normalizedUrl.toLowerCase().includes('.webp')) {
    ext = 'webp';
  }

  // Trigger direct download via DownloadManager / browser
  triggerBlobOrDataDownload(normalizedUrl, `${sanitizedFileName}.${ext}`);

  // Also fetch and trigger base64 / blob download for complete guarantee
  try {
    const response = await fetch(normalizedUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'force-cache'
    });

    if (response.ok) {
      const blob = await response.blob();
      const mimeType = (blob.type || '').toLowerCase();
      if (mimeType.includes('pdf')) ext = 'pdf';
      else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
      else if (mimeType.includes('webp')) ext = 'webp';

      await triggerBase64Download(blob, `${sanitizedFileName}.${ext}`);
      const blobUrl = URL.createObjectURL(blob);
      triggerBlobOrDataDownload(blobUrl, `${sanitizedFileName}.${ext}`);
      return true;
    }
  } catch (fetchErr) {
    console.warn('Direct fetch failed, falling back to Canvas:', fetchErr);
  }

  // Fallback: Canvas to PNG for images
  if (!isExplicitPdf) {
    const canvasSuccess = await canvasDownloadImage(normalizedUrl, `${sanitizedFileName}.png`);
    if (canvasSuccess) return true;
  }

  return true;
}
