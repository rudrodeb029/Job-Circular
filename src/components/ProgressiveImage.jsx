import React, { useState, useEffect } from 'react';
import { getCloudinaryPlaceholder, optimizeCloudinaryUrl } from '../utils/cloudinaryUtils';
import { getGoogleDriveFileId } from '../utils/mediaUtils';
import { Eye, Download } from './Icons';
import ModernLoader from './ModernLoader';

/**
 * Robust & Polished Progressive Image Loader Component
 * Handles Google Drive, Cloudinary, PDFs, and standard URLs with graceful multi-tier fallbacks.
 * Replaces raw browser broken image alt text with an elegant, polished document card.
 */
export default function ProgressiveImage({
  src,
  alt,
  style = {},
  className = '',
  onClick,
  onLoad,
  onError,
  maxWidth = 'none',
  objectFit = 'contain',
  fallbackTitle = '',
  downloadUrl = ''
}) {
  const driveId = getGoogleDriveFileId(src);
  const isCloudinary = src?.includes('cloudinary.com');

  // Build candidate fallback URLs in priority order
  const getFallbackCandidates = (urlStr) => {
    if (!urlStr) return [];
    const list = [];
    const id = getGoogleDriveFileId(urlStr);

    if (id) {
      list.push(`https://drive.google.com/thumbnail?id=${id}&sz=w1600`);
      list.push(`https://lh3.googleusercontent.com/d/${id}`);
      list.push(`https://drive.google.com/uc?export=view&id=${id}`);
    } else if (urlStr.includes('cloudinary.com')) {
      list.push(optimizeCloudinaryUrl(urlStr));
      list.push(urlStr.replace(/\/upload\//, '/upload/f_jpg,pg_1/').replace(/\.pdf$/i, '.jpg'));
      list.push(urlStr);
    } else {
      list.push(urlStr);
    }
    return list;
  };

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const candidates = getFallbackCandidates(src);
  const currentUrl = candidates[candidateIndex] || src;

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setCandidateIndex(0);
  }, [src]);

  const handleImageError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex(prev => prev + 1);
    } else {
      setHasError(true);
      if (onError) onError();
    }
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    if (onLoad) onLoad();
  };

  if (hasError || !src) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        textAlign: 'center',
        gap: '12px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
        borderRadius: '16px',
        border: '1px dashed #bfdbfe',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
        width: '100%',
        margin: '8px 0',
        ...style
      }} className={className}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.22)'
        }}>
          📄
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '320px' }}>
          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.5 }}>
            অফিসিয়াল বিজ্ঞপ্তি নোটিশ ও শর্তাবলী দেখতে নিচের বাটনে চাপ দিন
          </span>
        </div>
        {downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: 'var(--primary)',
              color: 'white',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
            }}
          >
            <Eye size={14} /> সম্পূর্ণ নোটিশ ফাইল দেখুন
          </a>
        )}
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      maxWidth,
      background: '#f8fafc',
      borderRadius: '14px',
      minHeight: isLoaded ? 'none' : '300px',
      ...style
    }} className={className}>
      <img
        src={currentUrl}
        alt={alt}
        onClick={onClick}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: style.maxHeight || '480px',
          objectFit: objectFit,
          display: 'block',
          opacity: isLoaded ? 1 : 0.4,
          filter: isLoaded ? 'none' : 'blur(4px)',
          transition: 'opacity 0.3s ease, filter 0.3s ease',
          cursor: onClick ? 'pointer' : 'default'
        }}
      />

      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(248, 250, 252, 0.9)',
          backdropFilter: 'blur(6px)',
          zIndex: 10
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <ModernLoader size="md" icon="💼" />
            <div style={{
              fontSize: '11.5px',
              fontWeight: 800,
              color: 'var(--primary)',
              background: 'white',
              padding: '8px 18px',
              borderRadius: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              border: '1.5px solid rgba(37, 99, 235, 0.08)',
              animation: 'pulse 2s infinite'
            }}>
              বিজ্ঞপ্তি তথ্য লোড হচ্ছে...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}