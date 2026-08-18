import React, { useState, useEffect } from 'react';
import { getCloudinaryPlaceholder, optimizeCloudinaryUrl } from '../utils/cloudinaryUtils';
import { getGoogleDriveFileId } from '../utils/mediaUtils';

/**
 * Progressive Image Loader Component
 * Supports Cloudinary, Google Drive, and standard URLs.
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
  const isCloudinary = src?.includes('cloudinary.com');
  const driveId = getGoogleDriveFileId(src);

  // Set initial source: Blurry Cloudinary thumbnail OR Google Drive small thumbnail
  const getInitialSrc = () => {
    if (isCloudinary) return getCloudinaryPlaceholder(src);
    if (driveId) return `https://drive.google.com/thumbnail?id=${driveId}&sz=w200`;
    return src;
  };

  const [currentSrc, setCurrentSrc] = useState(getInitialSrc());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    const initial = getInitialSrc();
    setCurrentSrc(initial);

    const img = new Image();
    let highResUrl = src;

    if (isCloudinary) {
      highResUrl = optimizeCloudinaryUrl(src);
    } else if (driveId) {
      // Use 1600px width for Google Drive - sharp but optimized
      highResUrl = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`;
    }

    img.src = highResUrl;
    img.onload = () => {
      setCurrentSrc(highResUrl);
      setIsLoaded(true);
      if (onLoad) onLoad();
    };
    img.onerror = (err) => {
      // Final fallback to raw URL if optimization fails
      if (currentSrc !== src) {
        setCurrentSrc(src);
      }
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
      <img
        src={currentSrc}
        alt={alt}
        onClick={onClick}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          filter: isLoaded ? 'none' : 'blur(8px)',
          transition: 'filter 0.4s ease-in-out',
          opacity: 1
        }}
      />

      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.4)',
          color: 'white',
          padding: '3px 10px',
          borderRadius: '20px',
          fontSize: '9px',
          fontWeight: 800,
          backdropFilter: 'blur(4px)',
          pointerEvents: 'none'
        }}>
          OPTIMIZING...
        </div>
      )}
    </div>
  );
}