import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, RefreshCw } from '../components/Icons';
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
  const [domainName, setDomainName] = useState('');

  useEffect(() => {
    try {
      const parsed = new URL(targetUrl);
      setDomainName(parsed.hostname.replace(/^www\./, ''));
    } catch (e) {
      setDomainName('teletalk.com.bd');
    }

    // Safety loading timeout
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Memory Disposing: Cleanup iframe references when component unmounts
    return () => {
      clearTimeout(timer);
      if (iframeRef.current) {
        try {
          iframeRef.current.src = 'about:blank';
        } catch (err) {}
      }
    };
  }, [targetUrl]);

  const handleRefresh = () => {
    setLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = targetUrl;
    }
    setTimeout(() => setLoading(false), 1500);
  };

  const handleOpenExternal = () => {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
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
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
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
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
              {domainName}
            </span>
          </div>
        </div>

        {/* Action Buttons: Refresh & External Direct Open */}
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
            <RefreshCw size={15} />
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
              background: 'rgba(37, 99, 235, 0.3)',
              color: '#60a5fa',
              border: '1px solid rgba(96, 165, 250, 0.4)',
              cursor: 'pointer'
            }}
            title="Open in External Browser"
          >
            <ExternalLink size={15} />
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
              animation: 'shimmer 1.2s infinite linear'
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
          backgroundColor: '#ffffff'
        }}
      >
        {/* Loading Spinner */}
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
              background: 'rgba(255, 255, 255, 0.96)',
              zIndex: 30,
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                border: '3.5px solid #e2e8f0',
                borderTopColor: '#2563eb',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
              আবেদন পেজটি লোড হচ্ছে...
            </span>
          </div>
        )}

        {/* Embedded Portal WebView Frame */}
        <iframe
          ref={iframeRef}
          src={targetUrl}
          title="Official Application Portal"
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
          allow="camera; microphone; geolocation; storage-access; fullscreen; clipboard-read; clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-top-navigation-by-user-activation"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
        />
      </div>

      {/* 3. Bottom AdMob Banner Container (Safely Separated, 100% AdMob Compliant) */}
      <AdMobBanner />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
