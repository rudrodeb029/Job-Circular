import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { state } = useAppContext();

  useEffect(() => {
    const isReturning = state.hasSeenOnboarding || JSON.parse(localStorage.getItem('hasSeenOnboarding') || 'false');
    
    // Returning users: ZERO splash wait, immediate redirect to Homepage (/home)
    if (isReturning) {
      navigate('/home', { replace: true });
      return;
    }

    // First time users: show clean minimal logo screen for 1 second, then transition to /onboarding
    const timer = setTimeout(() => {
      navigate('/onboarding', { replace: true });
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate, state.hasSeenOnboarding]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      backgroundColor: '#e8f3ff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Hind Siliguri", sans-serif',
      WebkitFontSmoothing: 'antialiased',
      userSelect: 'none'
    }}>
      <style>{`
        .rainbow-logo-shadow {
          filter: drop-shadow(0 14px 24px rgba(0, 110, 255, 0.28)) drop-shadow(0 4px 8px rgba(255, 80, 0, 0.2));
        }
      `}</style>

      {/* Centered Minimal App Logo & Brand Name ONLY */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '24px'
      }}>
        {/* High-End Rainbow Vector 'LC' Logo */}
        <div className="rainbow-logo-shadow" style={{ position: 'relative', width: '144px', height: '128px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
          <svg style={{ width: '128px', height: '128px' }} viewBox="0 0 140 130" fill="none">
            <defs>
              <linearGradient id="lGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e60000" />
                <stop offset="50%" stopColor="#ff3b00" />
                <stop offset="100%" stopColor="#ff8c00" />
              </linearGradient>
              <linearGradient id="curveGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff1a00" />
                <stop offset="25%" stopColor="#ff7a00" />
                <stop offset="48%" stopColor="#ffd000" />
                <stop offset="72%" stopColor="#00b83e" />
                <stop offset="100%" stopColor="#0072e6" />
              </linearGradient>
              <linearGradient id="cGrad" x1="0.2" y1="0" x2="0.8" y2="1">
                <stop offset="0%" stopColor="#ffd500" />
                <stop offset="35%" stopColor="#00c853" />
                <stop offset="70%" stopColor="#0099ff" />
                <stop offset="100%" stopColor="#0055dd" />
              </linearGradient>
              <linearGradient id="glassGloss" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M96 23 C116 23 124 35 125 36 L112 46 C108 41 102 36 94 36 C80 36 70 48 70 65 C70 82 81 94 95 94 C104 94 111 88 116 83 L126 94 C118 103 108 108 93 108 C68 108 54 90 54 65 C54 40 70 23 96 23 Z" fill="url(#cGrad)" />
            <path d="M96 23 C114 23 123 34 125 36 L113 46 C110 42 103 36 94 36 C87 36 81 40 77 46 C74 41 82 25 96 23 Z" fill="#00c0ff" opacity="0.35" />
            <path d="M42 22 L56 23 L56 86 C56 94 51 100 42 102 C35 103 28 99 28 92 L28 27 L42 22 Z" fill="url(#lGrad)" />
            <path d="M28 27 C34 25 46 22 56 23 L56 29 C48 29 42 30 42 34 L28 27 Z" fill="#ff4d00" />
            <path d="M28 92 C38 103 54 107 72 100 C92 92 110 99 126 102 C115 112 95 114 74 107 C52 100 37 100 28 92 Z" fill="url(#curveGrad)" />
            <path d="M33 28 L33 90 C34 93 37 96 41 97" stroke="url(#glassGloss)" strokeLinecap="round" strokeWidth="2.5" />
          </svg>
        </div>

        {/* Brand Name */}
        <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 900, fontSize: '36px', letterSpacing: '-0.5px', margin: 0, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ color: '#005aff', filter: 'drop-shadow(0 2px 10px rgba(0,90,255,0.25))' }}>Live</span>
          <span style={{ color: '#0c1f4a' }}>Circular</span>
        </h1>

        {/* Bengali Subtitle */}
        <p style={{ fontFamily: '"Hind Siliguri", sans-serif', fontSize: '14px', fontWeight: 600, color: '#475569', marginTop: '8px', letterSpacing: '0.02em', margin: '8px 0 0 0' }}>
          সকল চাকরির খবর, সর্বসময় আপনার সাথে
        </p>
      </div>
    </div>
  );
}
