/**
 * Cloudinary URL Optimizer & Progressive Loader Utilities
 */

/**
 * Optimizes a Cloudinary image URL with WebP format and auto quality.
 */
export const optimizeCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('cloudinary.com')) return url;

  // Insert f_auto,q_auto for high-quality optimized delivery
  if (url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/f_auto,q_auto,w_1200,c_limit/');
  }
  return url;
};

/**
 * Generates a tiny, blurry placeholder URL for progressive loading.
 * Size is roughly 10-15KB.
 */
export const getCloudinaryPlaceholder = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('cloudinary.com')) return url;

  if (url.includes('/upload/')) {
    // Generate a 50px width, low-quality, blurry WebP version
    return url.replace('/upload/', '/upload/w_50,c_scale,e_blur:1000,q_10,f_webp/');
  }
  return url;
};

export const optimizeImageString = (imagesStr) => {
  if (!imagesStr || typeof imagesStr !== 'string') return imagesStr;
  return Array.from(
    new Set(
      imagesStr
        .split(',')
        .map(u => u.trim())
        .filter(Boolean)
    )
  ).join(', ');
};
