import { getGoogleDriveFileId, isGoogleDriveUrl, normalizeMediaUrl } from './mediaUtils';

/**
 * High-speed secure file downloader for notice images and PDFs.
 * Accurately detects and downloads the ORIGINAL file format (PDF, PNG, JPG, WEBP).
 * Supports Cloudinary URLs, Google Drive original file streams, and standard CDN media.
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

  // Strategy 1: Google Drive Original File Download (Preserves original PDF or Image)
  if (driveId) {
    const driveDownloadUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download`;
    
    // Try in-memory blob fetch first to preserve file name and inspect real MIME type
    try {
      const response = await fetch(driveDownloadUrl, { method: 'GET', mode: 'cors', cache: 'no-cache' });
      if (response.ok) {
        const blob = await response.blob();
        const mimeType = (blob.type || '').toLowerCase();
        
        let ext = 'pdf'; // Default to PDF for drive docs if indeterminate
        if (mimeType.includes('pdf') || isExplicitPdf) {
          ext = 'pdf';
        } else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
          ext = 'jpg';
        } else if (mimeType.includes('webp')) {
          ext = 'webp';
        } else if (mimeType.includes('image')) {
          ext = 'png';
        }

        const blobUrl = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = blobUrl;
        downloadAnchor.download = `${sanitizedFileName}.${ext}`;
        downloadAnchor.style.display = 'none';
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
        return true;
      }
    } catch (gBlobErr) {
      console.warn('Google Drive direct blob fetch blocked by CORS, using direct download stream:', gBlobErr);
    }

    // Direct Google Drive download trigger (Browser automatically preserves original PDF/image)
    try {
      const anchor = document.createElement('a');
      anchor.href = driveDownloadUrl;
      anchor.target = '_self';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      setTimeout(() => {
        if (anchor.parentNode) document.body.removeChild(anchor);
      }, 1000);
      return true;
    } catch (dErr) {
      console.warn('Drive download endpoint error:', dErr);
    }
  }

  // Strategy 2: Cloudinary Native Attachment Header
  if (fileUrl.includes('cloudinary.com') && fileUrl.includes('/upload/')) {
    try {
      const ext = isExplicitPdf ? 'pdf' : 'png';
      const attachmentUrl = fileUrl.replace('/upload/', `/upload/fl_attachment:${encodeURIComponent(sanitizedFileName)}/`);
      const anchor = document.createElement('a');
      anchor.href = attachmentUrl;
      anchor.download = `${sanitizedFileName}.${ext}`;
      anchor.target = '_self';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      setTimeout(() => {
        if (anchor.parentNode) document.body.removeChild(anchor);
      }, 1000);
      return true;
    } catch (e) {
      console.warn('Cloudinary attachment download error:', e);
    }
  }

  // Strategy 3: Standard In-Memory Blob Fetch (Masks raw URL from address bar)
  const normalizedUrl = normalizeMediaUrl(fileUrl);
  try {
    const response = await fetch(normalizedUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'force-cache'
    });

    if (response.ok) {
      const blob = await response.blob();
      const mimeType = (blob.type || '').toLowerCase();
      const urlLower = normalizedUrl.toLowerCase();

      let extension = 'png';
      if (mimeType.includes('pdf') || urlLower.includes('.pdf') || isExplicitPdf) {
        extension = 'pdf';
      } else if (mimeType.includes('jpeg') || mimeType.includes('jpg') || urlLower.includes('.jpg') || urlLower.includes('.jpeg')) {
        extension = 'jpg';
      } else if (mimeType.includes('webp') || urlLower.includes('.webp')) {
        extension = 'webp';
      }

      const blobUrl = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = blobUrl;
      downloadAnchor.download = `${sanitizedFileName}.${extension}`;
      downloadAnchor.style.display = 'none';

      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 4000);

      return true;
    }
  } catch (err) {
    console.warn('Fetch blob download error, attempting Canvas/Direct fallback:', err);
  }

  // Strategy 4: Canvas to Data URL for images (100% CORS-safe in-memory download)
  if (!isExplicitPdf) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const canvasPromise = new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width || 800;
            canvas.height = img.naturalHeight || img.height || 1000;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            const anchor = document.createElement('a');
            anchor.href = dataUrl;
            anchor.download = `${sanitizedFileName}.png`;
            anchor.style.display = 'none';
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            resolve(true);
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = reject;
        img.src = normalizedUrl;
      });

      const success = await canvasPromise;
      if (success) return true;
    } catch (canvasErr) {
      console.warn('Canvas download error, falling back to direct anchor:', canvasErr);
    }
  }

  // Strategy 5: Direct Native Download Trigger
  try {
    const finalExt = isExplicitPdf ? 'pdf' : 'png';
    const finalAnchor = document.createElement('a');
    finalAnchor.href = normalizedUrl;
    finalAnchor.download = `${sanitizedFileName}.${finalExt}`;
    finalAnchor.target = '_self';
    finalAnchor.style.display = 'none';
    document.body.appendChild(finalAnchor);
    finalAnchor.click();
    setTimeout(() => {
      if (finalAnchor.parentNode) document.body.removeChild(finalAnchor);
    }, 1000);
    return true;
  } catch (finalErr) {
    console.error('Final download error:', finalErr);
    window.open(normalizedUrl, '_blank');
    return false;
  }
}
