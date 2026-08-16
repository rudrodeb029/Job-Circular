import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, RefreshCw } from '../components/Icons';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

// Smart URL Formatter: BD Govt / Teletalk subdomains fail on HTTPS with ERR_CERT_AUTHORITY_INVALID, but work on HTTP
export function sanitizePortalUrl(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') return 'http://alljobs.teletalk.com.bd';
  let clean = inputUrl.trim();

  if (clean.includes('teletalk.com.bd')) {
    if (clean.startsWith('https://')) {
      return clean.replace('https://', 'http://');
    }
    if (!clean.startsWith('http://')) {
      return `http://${clean}`;
    }
    return clean;
  }

  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }

  return `https://${clean}`;
}

export default function CircularWebViewScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  // Extract dynamic apply URL & Title from router state or query parameters
  const queryParams = new URLSearchParams(location.search);
  const rawUrl = location.state?.url || queryParams.get('url') || 'http://alljobs.teletalk.com.bd';

  const targetUrl = sanitizePortalUrl(rawUrl);

  // Extract clean domain for the Chrome-style URL bar
  let displayDomain = 'alljobs.teletalk.com.bd';
  try {
    const parsed = new URL(targetUrl);
    displayDomain = parsed.hostname.replace(/^www\./, '');
  } catch (e) {
    displayDomain = targetUrl.replace(/^https?:\/\//, '').split('/')[0] || 'alljobs.teletalk.com.bd';
  }

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety loading timeout for in-app frame
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

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

  const handleOpenExternal = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Browser.open({
          url: targetUrl,
          toolbarColor: '#ffffff',
          presentationStyle: 'popover'
        });
      } catch (e) {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary, #ffffff)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* 1. Chrome-Style URL Header */}
      <div
        className="page-header"
        style={{
          position: 'relative',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: 'calc(var(--safe-area-top) + 4px) 10px 6px 10px'
        }}
      >
        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate(-1)} title="Back" style={{ flexShrink: 0 }}>
          <ArrowLeft size={22} />
        </button>

        {/* Chrome-Style Rounded URL Address Bar */}
        <div
          onClick={handleOpenExternal}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-secondary, #f1f5f9)',
            border: '1px solid var(--border-light, #e2e8f0)',
            borderRadius: '24px',
            padding: '6px 14px',
            minWidth: 0,
            height: '36px',
            boxSizing: 'border-box',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '12px', lineHeight: 1, color: '#10b981', flexShrink: 0 }}>
            🔒
          </span>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-primary, #0f172a)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {displayDomain}
          </span>
        </div>

        {/* Action Buttons: Refresh & External Browser */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          <button className="back-btn" onClick={handleRefresh} title="Refresh">
            <RefreshCw size={19} />
          </button>
          <button className="back-btn" onClick={handleOpenExternal} title="Open in Browser">
            <ExternalLink size={19} />
          </button>
        </div>
      </div>

      {/* Progress Bar while loading */}
      {loading && (
        <div style={{ width: '100%', height: '2.5px', background: 'var(--border-light, #e2e8f0)', overflow: 'hidden', zIndex: 60 }}>
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

      {/* 2. In-App Direct WebView Screen Container */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-primary, #ffffff)'
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
              background: 'rgba(255, 255, 255, 0.95)',
              zIndex: 30,
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                border: '3px solid #e2e8f0',
                borderTopColor: 'var(--primary, #2563eb)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}
            />
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary, #64748b)' }}>
              আবেদন পেজটি লোড হচ্ছে...
            </span>
          </div>
        )}

        {/* Embedded Portal WebView Frame */}
        <iframe
          ref={iframeRef}
          src={targetUrl}
          title="Application Portal"
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
