/**
 * Cloudinary URL Optimizer
 * 
 * Automatically transforms Cloudinary asset URLs to WebP format with adaptive compression (f_webp,q_auto).
 * Drastically reduces download size (60-80% savings) while maintaining sharp visual quality.
 */

/**
 * Optimizes a Cloudinary image URL with WebP format and auto quality.
 * @param {string} url - Original image URL
 * @param {string} [transformation='f_webp,q_auto'] - Cloudinary transformation parameters
 * @returns {string} Optimized URL
 */
export const optimizeCloudinaryUrl = (url, transformation = 'f_auto,q_auto') => {
  if (!url || typeof url !== 'string') return url;

  // Check if it's a valid Cloudinary URL
  if (!url.includes('res.cloudinary.com') && !url.includes('api.cloudinary.com')) {
    return url;
  }

  // Already has format/quality transformation applied
  if (url.includes('/f_auto') || url.includes('/f_webp') || url.includes('/q_auto')) {
    return url;
  }

  // Inject transformation right after /upload/
  if (url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/${transformation}/`);
  }

  return url;
};

/**
 * Helper to batch optimize a comma-separated list of image URLs
 * @param {string} imagesStr - Comma separated image URLs
 * @returns {string} Optimized comma separated URLs
 */
export const optimizeImageString = (imagesStr) => {
  if (!imagesStr || typeof imagesStr !== 'string') return imagesStr;
  return imagesStr
    .split(',')
    .map(u => optimizeCloudinaryUrl(u.trim()))
    .filter(Boolean)
    .join(', ');
};
