import { getGoogleDriveFileId, isGoogleDriveUrl, normalizeMediaUrl } from './mediaUtils';

/**
 * High-speed secure file downloader for notice images and PDFs.
 * Supports Cloudinary URLs, Google Drive links, and standard CDN media.
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

  const normalizedUrl = normalizeMediaUrl(fileUrl);
  const driveId = getGoogleDriveFileId(fileUrl);

  // Strategy 1: If Cloudinary URL, use Cloudinary fl_attachment header for 100% native instant download
  if (fileUrl.includes('cloudinary.com') && fileUrl.includes('/upload/')) {
    try {
      const attachmentUrl = fileUrl.replace('/upload/', `/upload/fl_attachment:${encodeURIComponent(sanitizedFileName)}/`);
      const anchor = document.createElement('a');
      anchor.href = attachmentUrl;
      anchor.download = `${sanitizedFileName}.png`;
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

  // Strategy 2: If Google Drive link, fetch image from high-speed CDN or use download endpoint
  if (driveId) {
    try {
      const gDriveFetchUrl = `https://lh3.googleusercontent.com/d/${driveId}`;
      const response = await fetch(gDriveFetchUrl, { method: 'GET', mode: 'cors', cache: 'force-cache' });
      if (response.ok) {
        const blob = await response.blob();
        let extension = 'png';
        const mimeType = (blob.type || '').toLowerCase();
        if (mimeType.includes('pdf')) extension = 'pdf';
        else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
        else if (mimeType.includes('webp')) extension = 'webp';

        const blobUrl = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = blobUrl;
        downloadAnchor.download = `${sanitizedFileName}.${extension}`;
        downloadAnchor.style.display = 'none';
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
        return true;
      }
    } catch (gErr) {
      console.warn('Google Drive direct blob fetch error, falling back to direct download link:', gErr);
    }

    // Direct Google Drive download endpoint fallback
    try {
      const driveDownloadUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download`;
      const anchor = document.createElement('a');
      anchor.href = driveDownloadUrl;
      anchor.download = `${sanitizedFileName}.png`;
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

  // Strategy 3: In-Memory Blob Fetch for Standard URLs
  try {
    const response = await fetch(normalizedUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'force-cache'
    });

    if (response.ok) {
      const blob = await response.blob();
      let extension = 'png';
      const mimeType = (blob.type || '').toLowerCase();
      const urlLower = normalizedUrl.toLowerCase();

      if (mimeType.includes('pdf') || urlLower.includes('.pdf')) {
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

  // Strategy 5: Direct Download Trigger
  try {
    const finalAnchor = document.createElement('a');
    finalAnchor.href = normalizedUrl;
    finalAnchor.download = `${sanitizedFileName}.png`;
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
