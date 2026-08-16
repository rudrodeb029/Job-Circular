import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, ExternalLink, RefreshCw } from '../components/Icons';
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
  const [activeTab, setActiveTab] = useState('browser'); // 'browser' | 'guideline'
  const [domainName, setDomainName] = useState('');

  useEffect(() => {
    try {
      const parsed = new URL(targetUrl);
      setDomainName(parsed.hostname.replace(/^www\./, ''));
    } catch (e) {
      setDomainName('alljobs.teletalk.com.bd');
    }

    // Fast initial load timer
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

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
    setTimeout(() => setLoading(false), 2000);
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
        backgroundColor: '#f8fafc',
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

      {/* Quick Switch Bar: Web Portal / Application Guidelines */}
      <div
        style={{
          display: 'flex',
          background: '#0f172a',
          padding: '4px 12px 6px 12px',
          gap: '8px',
          zIndex: 45
        }}
      >
        <button
          onClick={() => setActiveTab('browser')}
          style={{
            flex: 1,
            padding: '6px 10px',
            borderRadius: '8px',
            fontSize: '11.5px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'browser' ? '#2563eb' : 'rgba(255, 255, 255, 0.08)',
            color: activeTab === 'browser' ? '#ffffff' : '#94a3b8',
            transition: 'all 0.15s ease'
          }}
        >
          🌐 আবেদন পোর্টাল (Portal)
        </button>
        <button
          onClick={() => setActiveTab('guideline')}
          style={{
            flex: 1,
            padding: '6px 10px',
            borderRadius: '8px',
            fontSize: '11.5px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'guideline' ? '#2563eb' : 'rgba(255, 255, 255, 0.08)',
            color: activeTab === 'guideline' ? '#ffffff' : '#94a3b8',
            transition: 'all 0.15s ease'
          }}
        >
          📋 নির্দেশিকা ও ফি জমা
        </button>
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

      {/* 2. Main Body Area */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          width: '100%',
          height: '100%',
          overflowY: activeTab === 'guideline' ? 'auto' : 'hidden',
          backgroundColor: '#f8fafc',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {activeTab === 'browser' ? (
          <>
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
                  আবেদন পোর্টাল লোড হচ্ছে...
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

            {/* Floating Direct Launch Pill at Bottom-Right */}
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
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
                  padding: '8px 14px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                  color: '#ffffff',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                  cursor: 'pointer'
                }}
              >
                <span>সরাসরি পোর্টালে যান</span>
                <span style={{ fontSize: '13px' }}>↗</span>
              </button>
            </div>
          </>
        ) : (
          /* Application Guideline & Fee Submission Guide */
          <div style={{ padding: '16px 14px 40px 14px' }}>
            {/* Top Quick Apply Card */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '14px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📝</div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                অনলাইনে আবেদনের নিয়ম ও নির্দেশিকা
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                টেলিটক বা অফিশিয়াল পোর্টালে আবেদনের ক্ষেত্রে নিচের নির্দেশিকা অনুসরণ করুন:
              </p>
              <button
                onClick={handleOpenExternal}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '10px',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>অনলাইন আবেদন ফরম পূরণ করুন</span>
                <span>↗</span>
              </button>
            </div>

            {/* Teletalk SMS Application Guideline */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '14px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}
            >
              <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#1e293b', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📱</span>
                <span>টেলিটক এসএমএস এর মাধ্যমে আবেদন ফি জমাদান</span>
              </h4>

              <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '10px 12px', marginBottom: '10px', fontSize: '12px', color: '#334155' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>১ম SMS ফরম্যাট:</div>
                <code>[SHORTCODE] &lt;space&gt; User_ID</code> লিখে পাঠাতে হবে <strong>16222</strong> নম্বরে।
              </div>

              <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#334155' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>২য় SMS ফরম্যাট:</div>
                <code>[SHORTCODE] &lt;space&gt; YES &lt;space&gt; PIN</code> লিখে পাঠাতে হবে <strong>16222</strong> নম্বরে।
              </div>
            </div>

            {/* Photo and Signature Guidelines */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}
            >
              <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#1e293b', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🖼️</span>
                <span>ছবি ও স্বাক্ষর আপলোড সাইজ</span>
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#475569', lineHeight: 1.7 }}>
                <li><strong>ছবি (Photo):</strong> ৩০০ × ৩০০ পিক্সেল (সর্বোচ্চ ১০০ KB, JPG)</li>
                <li><strong>স্বাক্ষর (Signature):</strong> ৩০০ × ৮০ পিক্সেল (সর্বোচ্চ ৬০ KB, JPG)</li>
              </ul>
            </div>
          </div>
        )}
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
