import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Download } from './Icons';
import { useAppContext } from '../context/AppContext';

export default function InterstitialAdModal() {
  const { state } = useAppContext();
  const isEn = state?.language === 'en';

  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const callbackRef = useRef(null);

  useEffect(() => {
    const handleShowAd = (event) => {
      const { onComplete } = event.detail || {};
      callbackRef.current = onComplete;
      setCountdown(5);
      setCanSkip(false);
      setIsOpen(true);
    };

    window.addEventListener('show_in_app_interstitial', handleShowAd);
    return () => {
      window.removeEventListener('show_in_app_interstitial', handleShowAd);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    const cb = callbackRef.current;
    callbackRef.current = null;
    if (typeof cb === 'function') {
      setTimeout(() => {
        cb();
      }, 150);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.25s ease-out',
        fontFamily: '"Hind Siliguri", "Poppins", sans-serif'
      }}
    >
      {/* Container Box */}
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          background: '#ffffff',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Top Header: Ad Badge & Close / Countdown Timer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                color: '#64748b',
                background: '#e2e8f0',
                padding: '2px 7px',
                borderRadius: '4px'
              }}
            >
              বিজ্ঞাপন • Ad
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
              Google AdMob
            </span>
          </div>

          {/* Countdown / Close Button */}
          {canSkip ? (
            <button
              onClick={handleClose}
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                border: 'none',
                color: '#ffffff',
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                transition: 'transform 0.15s ease'
              }}
            >
              <span>{isEn ? 'Continue' : 'এগিয়ে যান'}</span>
              <span style={{ fontSize: '13px' }}>✕</span>
            </button>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#e0f2fe',
                color: '#0369a1',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              <span>{isEn ? `Skip in ${countdown}s` : `${countdown} সেকেন্ড বাকি`}</span>
            </div>
          )}
        </div>

        {/* Ad Media / Banner Visual */}
        <div
          style={{
            padding: '20px 18px',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          {/* App / Product Icon */}
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              color: '#ffffff',
              boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
              marginBottom: '14px'
            }}
          >
            🎯
          </div>

          <h3
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 6px 0',
              lineHeight: 1.3
            }}
          >
            বিসিএস ও সরকারি চাকরি স্পেশাল প্রস্তুতি
          </h3>

          <p
            style={{
              fontSize: '12.5px',
              color: '#475569',
              margin: '0 0 16px 0',
              lineHeight: 1.5,
              fontWeight: 500
            }}
          >
            প্রতিদিনের লাইভ মডেল টেস্ট, বিগত ২০ বছরের প্রশ্ন সমাধান এবং বিষয়ভিত্তিক সাধারণ জ্ঞান এখন এক জায়গায়!
          </p>

          {/* Feature Badges */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '18px'
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#059669',
                background: '#d1fae5',
                padding: '3px 8px',
                borderRadius: '6px'
              }}
            >
              ✓ ১০০% ফ্রি প্র্যাকটিস
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#2563eb',
                background: '#dbeafe',
                padding: '3px 8px',
                borderRadius: '6px'
              }}
            >
              ✓ ব্যাখ্যাসহ সমাধান
            </span>
          </div>

          {/* CTA Sponsor Button */}
          <a
            href="https://play.google.com/store/apps/details?id=com.livecircular.bdjobs"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxSizing: 'border-box'
            }}
          >
            <span>ফ্রি মডেল টেস্ট শুরু করুন</span>
            <ExternalLink size={16} color="#ffffff" />
          </a>
        </div>

        {/* Footer Note */}
        <div
          style={{
            padding: '10px 16px',
            background: '#f1f5f9',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center'
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '11px',
              color: '#64748b',
              fontWeight: 600
            }}
          >
            {canSkip
              ? (isEn ? 'Click "Continue" above to proceed to your destination.' : 'উপরে "এগিয়ে যান" বাটনে চাপ দিয়ে আপনার কাঙ্ক্ষিত পেজে যান।')
              : (isEn ? `Ad will complete in ${countdown} seconds...` : `বিজ্ঞাপন সমাপ্ত হচ্ছে: ${countdown} সেকেন্ড...`)}
          </p>
        </div>
      </div>
    </div>
  );
}

