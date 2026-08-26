import React, { useState } from 'react';
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

export default function PortalWarningModal({ isOpen, onClose, url, pageType = 'new_job' }) {
  const { state: appState } = useAppContext();
  const isEn = appState?.language === 'en';
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const targetUrl = sanitizePortalUrl(url);

  let buttonLabel = isEn ? 'Apply Now' : 'আবেদন করুন';
  if (pageType === 'result') {
    buttonLabel = isEn ? 'View Result' : 'ফলাফল দেখুন';
  } else if (pageType === 'admit_card' || pageType === 'exam_date') {
    buttonLabel = isEn ? 'Admit Card' : 'প্রবেশপত্র';
  }

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

  const proceedToPortal = async () => {
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
    setLoading(false);
    onClose();
  };

  return (
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
      animation: 'fadeIn 0.2s ease-out',
      boxSizing: 'border-box'
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
          onClick={onClose}
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
            disabled={loading}
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
              boxShadow: '0 4px 12px rgba(29, 78, 216, 0.2)',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (isEn ? 'Loading...' : 'লোড হচ্ছে...') : buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
