import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from '../components/Icons';
import AdMobBanner from '../components/AdMobBanner';

export default function CircularWebViewScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  // Extract dynamic apply URL & Title from router state or query parameters
  const queryParams = new URLSearchParams(location.search);
  const rawUrl = location.state?.url || queryParams.get('url') || 'https://alljobs.teletalk.com.bd';
  const title = location.state?.title || queryParams.get('title') || 'সরকারি চাকরির আবেদন পোর্টাল';

  // Ensure URL has http/https protocol
  const targetUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
    ? rawUrl
    : `https://${rawUrl}`;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [domainName, setDomainName] = useState('');

  useEffect(() => {
    try {
      const parsed = new URL(targetUrl);
      setDomainName(parsed.hostname.replace(/^www\./, ''));
    } catch (e) {
      setDomainName('teletalk.com.bd');
    }

    // Set a safety timeout for loading spinner
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    // Memory Disposing: Cleanup references when component unmounts
    return () => {
      clearTimeout(timer);
      if (iframeRef.current) {
        iframeRef.current.src = 'about:blank';
      }
    };
  }, [targetUrl]);

  const handleRefresh = () => {
    setLoading(true);
    setLoadError(false);
    if (iframeRef.current) {
      iframeRef.current.src = targetUrl;
    }
  };

  const handleOpenExternal = () => {
    window.open(targetUrl, '_blank');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* 1. In-App Browser Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(var(--safe-area-top) + 6px) 12px 8px 12px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
          zIndex: 50,
          flexShrink: 0
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.12)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0
          }}
          title="Back"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Website Title & SSL Indicator */}
        <div style={{ flex: 1, minWidth: 0, padding: '0 10px', textAlign: 'center' }}>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 700,
              color: '#ffffff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              marginTop: '1px'
            }}
          >
            <span style={{ color: '#10b981', fontSize: '11px' }}>🔒</span>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
              {domainName}
            </span>
          </div>
        </div>

        {/* Action Buttons: Refresh & External Browser */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            onClick={handleRefresh}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer'
            }}
            title="Refresh"
          >
            <span style={{ fontSize: '15px' }}>🔄</span>
          </button>

          <button
            onClick={handleOpenExternal}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer'
            }}
            title="Open in Browser"
          >
            <span style={{ fontSize: '14px' }}>🌐</span>
          </button>
        </div>
      </div>

      {/* Progress Bar while loading */}
      {loading && (
        <div style={{ width: '100%', height: '3px', background: '#e2e8f0', overflow: 'hidden', zIndex: 60 }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #2563eb, #60a5fa, #3b82f6)',
              animation: 'shimmer 1.5s infinite linear'
            }}
          />
        </div>
      )}

      {/* 2. Main WebView Container */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: '#f8fafc'
        }}
      >
        {/* Loading Spinner Animation */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.95)',
              zIndex: 30,
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3.5px solid #e2e8f0',
                borderTopColor: 'var(--primary, #1a56db)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}
            />
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569' }}>
              আবেদন পেজটি লোড হচ্ছে...
            </span>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Embedded Application Portal WebView Frame */}
        <iframe
          ref={iframeRef}
          src={targetUrl}
          title="Application Portal"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setLoadError(true);
          }}
          allow="camera; microphone; geolocation; storage-access; fullscreen; clipboard-read; clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-top-navigation-by-user-activation"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
        />

        {/* Security / Header blocked overlay fallback button */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            zIndex: 35
          }}
        >
          <button
            onClick={handleOpenExternal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '20px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              cursor: 'pointer'
            }}
          >
            <span>ব্রাউজারে খুলুন</span>
            <span style={{ fontSize: '12px' }}>↗</span>
          </button>
        </div>
      </div>

      {/* 3. Bottom AdMob Banner Container (Safely Separated, 100% AdMob Compliant) */}
      <AdMobBanner />
    </div>
  );
}
