import React, { useState } from 'react';
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

  // Extract dynamic apply URL & Title from router state or query parameters
  const queryParams = new URLSearchParams(location.search);
  const rawUrl = location.state?.url || queryParams.get('url') || 'http://alljobs.teletalk.com.bd';
  const pageTitle = location.state?.title || queryParams.get('title') || 'অনলাইন আবেদন পোর্টাল';

  const targetUrl = sanitizePortalUrl(rawUrl);

  // Extract clean domain for the Chrome-style URL bar
  let displayDomain = 'alljobs.teletalk.com.bd';
  try {
    const parsed = new URL(targetUrl);
    displayDomain = parsed.hostname.replace(/^www\./, '');
  } catch (e) {
    displayDomain = targetUrl.replace(/^https?:\/\//, '').split('/')[0] || 'alljobs.teletalk.com.bd';
  }

  const [loading, setLoading] = useState(false);

  // Opens the circular application link in Chrome Tab / Native In-App Browser
  const openPortal = async () => {
    setLoading(true);
    if (Capacitor.isNativePlatform()) {
      try {
        await Browser.open({
          url: targetUrl,
          toolbarColor: '#1d4ed8',
          presentationStyle: 'popover'
        });
      } catch (err) {
        console.warn('Native Browser.open failed:', err);
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
    setTimeout(() => setLoading(false), 600);
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

        {/* Chrome-Style Rounded URL Address Bar (Clickable) */}
        <div
          onClick={openPortal}
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
          <button className="back-btn" onClick={openPortal} title="Reload Portal">
            <RefreshCw size={19} />
          </button>
          <button className="back-btn" onClick={openPortal} title="Open Portal">
            <ExternalLink size={19} />
          </button>
        </div>
      </div>

      {/* 2. In-App Application Portal Container */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 20px',
          textAlign: 'center',
          gap: '14px',
          backgroundColor: 'var(--bg-secondary, #f8fafc)'
        }}
      >
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            boxShadow: '0 4px 14px rgba(29, 78, 216, 0.1)'
          }}
        >
          🏛️
        </div>

        <div style={{ maxWidth: '320px' }}>
          <h2
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: 'var(--text-primary, #0f172a)',
              margin: '0 0 6px 0',
              lineHeight: 1.3
            }}
          >
            {pageTitle}
          </h2>
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-secondary, #64748b)',
              margin: 0,
              lineHeight: 1.5
            }}
          >
            অফিসিয়াল আবেদন ফরম পূরণ ও ছবি/স্বাক্ষর আপলোড করতে নিচের বাটনে চাপ দিন।
          </p>
        </div>

        <button
          onClick={openPortal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: 'auto',
            minWidth: '180px',
            maxWidth: '220px',
            padding: '10px 18px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(29, 78, 216, 0.25)',
            transition: 'all 0.2s ease'
          }}
        >
          <span>{loading ? 'লোড হচ্ছে...' : 'আবেদন পোর্টালে যান'}</span>
          <ExternalLink size={15} />
        </button>
      </div>
    </div>
  );
}
