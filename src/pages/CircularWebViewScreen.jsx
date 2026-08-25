import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, RefreshCw } from '../components/Icons';
import { ButtonSpinner } from '../components/ModernLoader';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { useAppContext } from '../context/AppContext';

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
  const { state: appState } = useAppContext();
  const isEn = appState?.language === 'en';

  // Extract dynamic apply URL & Title from router state or query parameters
  const queryParams = new URLSearchParams(location.search);
  const rawUrl = location.state?.url || queryParams.get('url') || 'http://alljobs.teletalk.com.bd';
  const pageTitle = location.state?.title || queryParams.get('title') || (isEn ? 'Online Application Portal' : 'অনলাইন আবেদন পোর্টাল');
  const pageType = location.state?.type || queryParams.get('type') || 'new_job';

  let descriptionText = isEn 
    ? 'Click the button below to fill out the official application form and upload your photo/signature.'
    : 'অফিসিয়াল আবেদন ফরম পূরণ ও ছবি/স্বাক্ষর আপলোড করতে নিচের বাটনে চাপ দিন।';
  let buttonLabel = isEn ? 'Go to Application Portal' : 'আবেদন পোর্টালে যান';

  if (pageType === 'result') {
    descriptionText = isEn 
      ? 'Click the button below to view or download the exam results.'
      : 'পরীক্ষার ফলাফল দেখতে বা ডাউনলোড করতে নিচের বাটনে চাপ দিন।';
    buttonLabel = isEn ? 'View Result' : 'ফলাফল দেখুন';
  } else if (pageType === 'admit_card' || pageType === 'exam_date') {
    descriptionText = isEn 
      ? 'Click the button below to download the admit card or view the exam notice.'
      : 'প্রবেশপত্র ডাউনলোড বা পরীক্ষার নোটিশ দেখতে নিচের বাটনে চাপ দিন।';
    buttonLabel = isEn ? 'View Admit Card / Notice' : 'প্রবেশপত্র / নোটিশ দেখুন';
  }

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
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(targetUrl);
      } else {
        const el = document.createElement('textarea');
        el.value = targetUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
    }
  };

  const proceedToPortal = () => {
    setShowWarningModal(false);
    openPortal();
  };

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
          onClick={() => setShowWarningModal(true)}
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
          <button className="back-btn" onClick={() => setShowWarningModal(true)} title="Reload Portal">
            <RefreshCw size={19} />
          </button>
          <button className="back-btn" onClick={() => setShowWarningModal(true)} title="Open Portal">
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
            {descriptionText}
          </p>
        </div>

        <button
          onClick={() => setShowWarningModal(true)}
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
          {loading && <ButtonSpinner size={14} color="#ffffff" />}
          <span>{loading ? (isEn ? 'Loading...' : 'লোড হচ্ছে...') : buttonLabel}</span>
          {!loading && <ExternalLink size={15} />}
        </button>
      </div>

      {/* Modern Polish Warning Modal Overlay */}
      {showWarningModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleIn {
              from { transform: scale(0.93); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
          <div style={{
            background: 'var(--bg-primary, #ffffff)',
            borderRadius: '24px',
            padding: '24px',
            width: '100%',
            maxWidth: '340px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            textAlign: 'center',
            animation: 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            border: '1px solid var(--border-light, #e2e8f0)',
            boxSizing: 'border-box',
            position: 'relative'
          }}>
            {/* Top-Right Close Button */}
            <button
              onClick={() => setShowWarningModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary, #64748b)',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                lineHeight: 1
              }}
            >
              ✕
            </button>

            <h3 style={{
              fontSize: '16px',
              fontWeight: 800,
              color: 'var(--text-primary, #0f172a)',
              margin: '0 0 12px 0',
              lineHeight: 1.4
            }}>
              {isEn ? 'Security Warning' : 'সতর্কবার্তা'}
            </h3>

            <p style={{
              fontSize: '11px',
              color: 'var(--text-secondary, #64748b)',
              margin: '0 0 24px 0',
              lineHeight: 1.55,
              textAlign: 'left'
            }}>
              {isEn ? (
                <>
                  You are leaving the app to visit an external website.<br/><br/>
                  <strong style={{ color: '#dc2626' }}>Disclaimer:</strong> This app is not affiliated with, endorsed by, or representing any government entity. We are not responsible for the content, privacy policies, security, or transactions on the linked portals.
                </>
              ) : (
                <>
                  আপনি অ্যাপ থেকে বের হয়ে একটি বাইরের ওয়েবসাইটে যাচ্ছেন।<br/><br/>
                  <strong style={{ color: '#dc2626' }}>ডিসক্লেমার:</strong> এই অ্যাপটি কোনো সরকারি প্রতিষ্ঠানের সাথে জড়িত বা অনুমোদিত নয়। লিঙ্কযুক্ত ওয়েবসাইটের কোনো কনটেন্ট, গোপনীয়তা নীতি, নিরাপত্তা বা লেনদেনের জন্য এই অ্যাপ কর্তৃপক্ষ কোনো দায়ভার গ্রহণ করবে না।
                </>
              )}
            </p>

            {/* Actions Grid (Side-by-Side) */}
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button
                onClick={copyLink}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1.5px solid #2563eb',
                  background: copied ? '#ecfdf5' : 'var(--bg-primary, #ffffff)',
                  color: copied ? '#065f46' : '#2563eb',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {copied ? (isEn ? 'Copied' : 'কপি হয়েছে') : (isEn ? 'Copy Link' : 'লিংক কপি')}
              </button>

              <button
                onClick={proceedToPortal}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(29, 78, 216, 0.2)'
                }}
              >
                {buttonLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
