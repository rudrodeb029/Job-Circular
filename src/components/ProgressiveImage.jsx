import React, { useState, useEffect } from 'react';
import { getCloudinaryPlaceholder, optimizeCloudinaryUrl } from '../utils/cloudinaryUtils';

/**
 * Progressive Image Loader Component
 * Shows a tiny blurry thumbnail first, then fades in the high-res image.
 */
export default function ProgressiveImage({
  src,
  alt,
  style = {},
  className = '',
  onClick,
  onLoad,
  onError,
  maxWidth = 'none'
}) {
  const [currentSrc, setCurrentSrc] = useState(getCloudinaryPlaceholder(src));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Reset when src changes
    setIsLoaded(false);
    setCurrentSrc(getCloudinaryPlaceholder(src));

    // Preload high-res image
    const img = new Image();
    const highResUrl = optimizeCloudinaryUrl(src);

    img.src = highResUrl;
    img.onload = () => {
      setCurrentSrc(highResUrl);
      setIsLoaded(true);
      if (onLoad) onLoad();
    };
    img.onerror = (err) => {
      if (onError) onError(err);
    };
  }, [src]);

  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      maxWidth,
      background: 'var(--bg-secondary)',
      ...style
    }} className={className}>
      {/* High-Res or Thumbnail Image */}
      <img
        src={currentSrc}
        alt={alt}
        onClick={onClick}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          filter: isLoaded ? 'none' : 'blur(10px)',
          transition: 'filter 0.5s ease-in-out, transform 0.3s ease',
          opacity: 1
        }}
      />

      {/* Loading overlay indicator (Optional) */}
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.3)',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '20px',
          fontSize: '9px',
          fontWeight: 800,
          backdropFilter: 'blur(4px)',
          pointerEvents: 'none'
        }}>
          LOADING HD...
        </div>
      )}
    </div>
  );
}
