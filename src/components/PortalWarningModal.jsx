import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { sanitizePortalUrl, openInAppBrowser } from '../utils/browserUtils';
import { useBackInterceptor } from '../utils/backButtonManager';

export { sanitizePortalUrl };

export default function PortalWarningModal({ isOpen, onClose, url, pageType = 'new_job' }) {
  const { state: appState } = useAppContext();
  const isEn = appState?.language === 'en';
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Close modal on Android hardware & gesture back button press
  useBackInterceptor(() => {
    if (typeof onClose === 'function') onClose();
    return true;
  }, isOpen);

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
    onClose();

    try {
      await openInAppBrowser(targetUrl);
    } catch (e) {
      console.error('Error proceeding to portal:', e);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      className="portal-warning-backdrop"
      data-theme={appState?.theme || 'light'}
      onClick={onClose}
    >
      <div
        className="portal-warning-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
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
          color: 'var(--text-primary)',
          margin: '0 0 12px 0',
          lineHeight: 1.4
        }}>
          {isEn ? 'Security Warning' : 'সতর্কবার্তা'}
        </h3>

        <p style={{
          fontSize: '11px',
          color: 'var(--text-secondary)',
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
            type="button"
            onClick={copyLink}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: '1.5px solid var(--primary)',
              background: copied ? 'var(--chip-success-bg, #ecfdf5)' : 'var(--white, #ffffff)',
              color: copied ? 'var(--chip-success-color, #065f46)' : 'var(--primary)',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, color 0.15s ease'
            }}
          >
            {copied ? (isEn ? 'Copied' : 'কপি হয়েছে') : (isEn ? 'Copy Link' : 'লিংক কপি')}
          </button>

          <button
            type="button"
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

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
