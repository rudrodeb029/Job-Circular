/**
 * Secure file downloader for notice images and PDFs.
 * Downloads files via in-memory Blob to prevent exposing the raw Cloudinary/storage URL in the browser.
 * 
 * @param {string} fileUrl - The source URL of the image or PDF
 * @param {string} baseFileName - Desired file name without extension
 * @returns {Promise<boolean>} - Success status
 */
export async function downloadSecurely(fileUrl, baseFileName = 'Job_Circular_Notice') {
  if (!fileUrl) return false;

  const sanitizedFileName = (baseFileName || 'Job_Notice')
    .replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_')
    .replace(/_+/g, '_');

  try {
    const response = await fetch(fileUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'force-cache'
    });

    if (!response.ok) {
      throw new Error(`Download fetch failed with status ${response.status}`);
    }

    const blob = await response.blob();

    // Determine correct file extension from MIME type or URL
    let extension = 'png';
    const mimeType = (blob.type || '').toLowerCase();
    const urlLower = fileUrl.toLowerCase();

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

    // Clean up memory after download starts
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 4000);

    return true;
  } catch (error) {
    console.warn('Blob download fallback triggered:', error);

    // Fallback: Use direct invisible link without opening a new browser tab
    const fallbackAnchor = document.createElement('a');
    fallbackAnchor.href = fileUrl;
    fallbackAnchor.download = `${sanitizedFileName}.png`;
    fallbackAnchor.target = '_self';
    fallbackAnchor.style.display = 'none';

    document.body.appendChild(fallbackAnchor);
    fallbackAnchor.click();
    document.body.removeChild(fallbackAnchor);

    return true;
  }
}
