import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { state } = useAppContext();

  useEffect(() => {
    // Smooth auto-transition after 1.2 seconds
    const timer = setTimeout(() => {
      if (state.hasSeenOnboarding) {
        navigate('/home', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [navigate, state.hasSeenOnboarding]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      backgroundColor: '#0b1120',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Hind Siliguri", sans-serif',
      WebkitFontSmoothing: 'antialiased'
    }}>
      {/* Dynamic Keyframes for Spinner & Animations */}
      <style>{`
        @keyframes splashSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .splash-loader-ring {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #00d2ff, #0066ff, #0044cc, transparent 75%);
          mask: radial-gradient(farthest-side, transparent calc(100% - 4.5px), #000 calc(100% - 4px));
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4.5px), #000 calc(100% - 4px));
          animation: splashSpin 0.9s linear infinite;
        }
        .rainbow-logo-shadow {
          filter: drop-shadow(0 14px 24px rgba(0, 110, 255, 0.28)) drop-shadow(0 4px 8px rgba(255, 80, 0, 0.2));
        }
        .desk-surface-arc {
          background: linear-gradient(180deg, #f2c792 0%, #deb07c 18%, #cb9764 45%, #b7814e 80%, #9e6939 100%);
          box-shadow: inset 0 2px 5px rgba(255, 255, 255, 0.6), 0 -8px 24px rgba(0, 0, 0, 0.08);
        }
      `}</style>

      {/* Frame Container */}
      <div style={{
        width: '100%',
        maxWidth: '430px',
        height: '100vh',
        maxHeight: '920px',
        background: 'linear-gradient(180deg, #e8f3ff 0%, #f4f9ff 45%, #ffffff 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 25px 65px -12px rgba(0, 0, 0, 0.55)'
      }}>

        {/* ==================== BACKGROUND & SKY ATMOSPHERE ==================== */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          {/* Top Left Organic Waves */}
          <svg style={{ position: 'absolute', top: '-48px', left: '-56px', width: '340px', height: '260px', opacity: 0.9 }} viewBox="0 0 340 260" fill="none">
            <path d="M-20 -10 C90 10 180 80 190 160 C195 200 160 220 120 230 C40 250 -10 210 -20 210 Z" fill="url(#topWaveGrad)" />
            <defs>
              <linearGradient id="topWaveGrad" x1="0" y1="0" x2="220" y2="220" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0066ff" />
                <stop offset="0.6" stopColor="#00a6ff" />
                <stop offset="1" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </svg>
          <svg style={{ position: 'absolute', top: '-80px', left: '-24px', width: '280px', height: '210px', color: '#ffffff', opacity: 0.25 }} viewBox="0 0 280 210" fill="currentColor">
            <path d="M0 0 C120 20 220 90 230 190 C180 160 80 140 0 160 Z" />
          </svg>

          {/* National Parliament / University Silhouettes (Top Right Pastel Blue) */}
          <div style={{ position: 'absolute', top: '40px', right: 0, width: '240px', height: '190px', opacity: 0.35 }}>
            <svg style={{ width: '100%', height: '100%', color: '#5b8ec2' }} fill="currentColor" viewBox="0 0 260 200">
              <polygon opacity="0.6" points="120,40 140,40 150,55 110,55" />
              <rect x="112" y="55" width="36" height="50" opacity="0.75" />
              <polygon points="130,22 131,39 129,39" stroke="currentColor" strokeWidth="1.5" />
              <rect x="131" y="24" width="12" height="8" rx="0.5" fill="#3b82f6" opacity="0.8" />
              <polygon opacity="0.55" points="75,70 112,60 112,130 75,125" />
              <polygon opacity="0.55" points="148,60 185,70 185,125 148,130" />
              <polygon opacity="0.4" points="50,85 75,78 75,130 50,130" />
              <polygon opacity="0.4" points="185,78 210,85 210,130 185,130" />
              <circle cx="130" cy="85" r="9" fill="#f4f9ff" />
              <polygon points="94,80 84,102 104,102" fill="#f4f9ff" />
              <polygon points="166,80 156,102 176,102" fill="#f4f9ff" />
              <rect x="40" y="130" width="180" height="7" rx="1" opacity="0.45" />
              <rect x="25" y="137" width="210" height="9" rx="1.5" opacity="0.35" />
              <ellipse cx="230" cy="132" rx="26" ry="18" opacity="0.4" />
              <ellipse cx="210" cy="136" rx="20" ry="14" opacity="0.45" />
              <ellipse cx="40" cy="135" rx="24" ry="16" opacity="0.35" />
            </svg>
          </div>

          {/* Campus Clock Tower Silhouettes (Right Midground) */}
          <div style={{ position: 'absolute', top: '320px', right: '8px', width: '160px', height: '280px', opacity: 0.25 }}>
            <svg style={{ width: '100%', height: '100%', color: '#4b7cb0' }} fill="currentColor" viewBox="0 0 160 280">
              <rect x="110" y="40" width="22" height="180" opacity="0.7" />
              <polygon points="121,15 133,40 109,40" opacity="0.8" />
              <circle cx="121" cy="65" r="4" fill="#ffffff" opacity="0.8" />
              <rect x="60" y="90" width="16" height="130" opacity="0.5" />
              <polygon points="68,68 77,90 59,90" opacity="0.6" />
              <ellipse cx="90" cy="205" rx="35" ry="24" opacity="0.5" />
              <ellipse cx="135" cy="210" rx="30" ry="20" opacity="0.5" />
              <ellipse cx="30" cy="215" rx="35" ry="22" opacity="0.4" />
            </svg>
          </div>
        </div>

        {/* ==================== MAIN CONTENT ==================== */}
        <main style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '24px 16px 8px 16px' }}>
          
          {/* Top Left Bengali Tagline */}
          <div style={{ width: '100%', position: 'relative', height: '48px', userSelect: 'none', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', left: '8px', top: '-4px', transform: 'rotate(-10deg)' }}>
              <p style={{ fontFamily: '"Kalam", "Hind Siliguri", cursive, sans-serif', color: '#0055d4', fontWeight: 700, fontSize: '15px', lineHeight: '18px', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                স্বপ্ন দেখুন<br />
                <span style={{ marginLeft: '8px' }}>প্রস্তুত হন</span><br />
                <span style={{ marginLeft: '4px', color: '#003da8' }}>সফল হোন</span>
              </p>
              <svg style={{ width: '80px', height: '10px', color: '#005aff', marginTop: '2px', marginLeft: '-4px' }} viewBox="0 0 90 14" fill="none">
                <path d="M4 3 C30 2 65 1 86 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M12 9 C35 7 60 8 78 11" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* BRANDING SECTION: Glossy Rainbow LC Monogram & Brand Name */}
          <section style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', userSelect: 'none', transform: 'translateY(4px)' }}>
            
            {/* High-End Rainbow Vector 'LC' Logo matching Image */}
            <div className="rainbow-logo-shadow" style={{ position: 'relative', width: '144px', height: '128px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 900, fontSize: '34px', letterSpacing: '-0.5px', marginTop: '-4px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ color: '#005aff', filter: 'drop-shadow(0 2px 10px rgba(0,90,255,0.25))' }}>Live</span>
              <span style={{ color: '#0c1f4a' }}>Circular</span>
            </h1>

            {/* Bengali Subtitle */}
            <p style={{ fontFamily: '"Hind Siliguri", sans-serif', fontSize: '13px', fontWeight: 700, color: '#475569', marginTop: '6px', letterSpacing: '0.02em' }}>
              সকল চাকরির খবর, সর্বসময় আপনার সাথে
            </p>
          </section>

          {/* ==================== 3D CAREER, BOOKS & DESK COMPOSITION ==================== */}
          <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '70px', overflow: 'visible' }}>
            
            {/* Smooth Oak Wood Desk Surface Arc */}
            <div className="desk-surface-arc" style={{ position: 'absolute', bottom: 0, left: '-48px', right: '-48px', height: '140px', borderTopLeftRadius: '54%', borderTopRightRadius: '54%', borderTop: '3px solid #ffe8cc', zIndex: 0 }} />

            {/* DESK OBJECTS COMPOSITION */}
            <div style={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingLeft: '8px', marginBottom: '-8px' }}>
              
              {/* Stacked Hardbound Books + Graduation Mortarboard */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', filter: 'drop-shadow(0 18px 20px rgba(0,0,0,0.35))' }}>
                
                {/* Graduation Cap (Mortarboard) */}
                <div style={{ position: 'relative', marginBottom: '-12px', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Diamond Top Cap Surface with 3D Angle */}
                  <div style={{ position: 'relative', width: '144px', height: '44px', background: 'linear-gradient(90deg, #172033, #0f172a, #020617)', borderRadius: '2px', transform: 'rotate(-3deg) skewX(12deg)', boxShadow: '0 4px 10px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid rgba(51, 65, 85, 0.5)' }}>
                    {/* Golden Center Button */}
                    <div style={{ width: '12px', height: '12px', background: 'radial-gradient(circle, #fde047, #d97706)', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', zIndex: 20 }} />
                    {/* Silky Hanging Yellow-Gold Tassel */}
                    <svg style={{ position: 'absolute', top: '20px', right: '8px', width: '64px', height: '64px', pointerEvents: 'none', zIndex: 30 }} fill="none" viewBox="0 0 70 70">
                      <path d="M22 6 C38 7 52 16 54 28" stroke="#facc15" strokeLinecap="round" strokeWidth="2.5" />
                      <rect x="51" y="27" width="6" height="3" rx="1" fill="#ca8a04" />
                      <polygon points="50,30 58,30 60,48 48,48" fill="url(#tasselGrad)" />
                      <defs>
                        <linearGradient id="tasselGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop stopColor="#facc15" />
                          <stop offset="100%" stopColor="#eab308" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  {/* Skull Cap Dome Base */}
                  <div style={{ width: '80px', height: '28px', background: 'linear-gradient(180deg, #0f172a, #000000)', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', marginTop: '-10px', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)' }} />
                </div>

                {/* Book 1: DREAM (Royal Blue) */}
                <div style={{ position: 'relative', width: '208px', height: '36px', background: 'linear-gradient(90deg, #004ecc, #0062ff, #38bdf8)', borderTopRightRadius: '6px', borderBottomRightRadius: '6px', boxShadow: '0 4px 8px rgba(0,0,0,0.25)', borderLeft: '10px solid #002f80', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 20 }}>
                  <span style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.2em', color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>DREAM</span>
                  <div style={{ display: 'flex', gap: '6px', opacity: 0.6 }}>
                    <span style={{ width: '2px', height: '24px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '2px' }} />
                    <span style={{ width: '2px', height: '24px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '2px' }} />
                  </div>
                </div>
                {/* Book 1 Pages */}
                <div style={{ width: '200px', height: '5px', background: 'linear-gradient(90deg, #fff9ea, #ede3cf)', alignSelf: 'flex-end', marginRight: '4px', borderRadius: '2px', marginTop: '-2px' }} />

                {/* Book 2: PREPARE (Emerald Teal) */}
                <div style={{ position: 'relative', width: '224px', height: '36px', background: 'linear-gradient(90deg, #008f5a, #00b070, #2dd4bf)', borderTopRightRadius: '6px', borderBottomRightRadius: '6px', boxShadow: '0 4px 8px rgba(0,0,0,0.25)', borderLeft: '10px solid #005f3b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 10, marginTop: '-2px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.2em', color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>PREPARE</span>
                  <div style={{ display: 'flex', gap: '6px', opacity: 0.6 }}>
                    <span style={{ width: '2px', height: '24px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '2px' }} />
                    <span style={{ width: '2px', height: '24px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '2px' }} />
                  </div>
                </div>
                {/* Book 2 Pages */}
                <div style={{ width: '216px', height: '5px', background: 'linear-gradient(90deg, #fff9ea, #ede3cf)', alignSelf: 'flex-end', marginRight: '4px', borderRadius: '2px', marginTop: '-2px' }} />

                {/* Book 3: SUCCEED (Golden Amber) */}
                <div style={{ position: 'relative', width: '240px', height: '40px', background: 'linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)', borderTopRightRadius: '6px', borderBottomRightRadius: '6px', boxShadow: '0 6px 12px rgba(0,0,0,0.3)', borderLeft: '10px solid #92400e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 0, marginTop: '-2px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 900, letterSpacing: '0.2em', color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>SUCCEED</span>
                  <div style={{ display: 'flex', gap: '6px', opacity: 0.6 }}>
                    <span style={{ width: '2px', height: '28px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '2px' }} />
                    <span style={{ width: '2px', height: '28px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '2px' }} />
                  </div>
                </div>
                {/* Book 3 Pages */}
                <div style={{ width: '230px', height: '6px', background: 'linear-gradient(90deg, #fff7de, #e4d6b6)', alignSelf: 'flex-end', marginRight: '4px', borderRadius: '2px', marginTop: '-2px' }} />
              </div>

              {/* Ceramic Pot with Pens & Plant */}
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '-12px', marginBottom: '4px', zIndex: 30 }}>
                {/* 3D Leafy Plant */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', marginBottom: '-8px', gap: '-9px' }}>
                  <span style={{ width: '16px', height: '40px', background: 'linear-gradient(to top, #047857, #34d399)', borderRadius: '9999px', transform: 'rotate(-40deg)', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
                  <span style={{ width: '20px', height: '48px', background: 'linear-gradient(to top, #166534, #22c55e)', borderRadius: '9999px', transform: 'rotate(-10deg)', marginTop: '-12px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
                  <span style={{ width: '16px', height: '44px', background: 'linear-gradient(to top, #059669, #6ee7b7)', borderRadius: '9999px', transform: 'rotate(30deg)', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
                </div>
                {/* Ceramic Pot */}
                <div style={{ width: '52px', height: '56px', background: 'linear-gradient(180deg, #ffffff, #f8fafc, #e2e8f0)', borderRadius: '14px', boxShadow: '0 8px 16px rgba(0,0,0,0.2)', border: '1px solid #ffffff', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-16px', left: '8px', width: '6px', height: '32px', backgroundColor: '#2563eb', transform: 'rotate(12deg)', borderRadius: '2px' }} />
                  <div style={{ position: 'absolute', top: '-20px', left: '20px', width: '6px', height: '36px', backgroundColor: '#fbbf24', transform: 'rotate(-6deg)', borderRadius: '2px' }} />
                  <div style={{ position: 'absolute', top: '-12px', right: '8px', width: '6px', height: '28px', backgroundColor: '#0f172a', transform: 'rotate(15deg)', borderRadius: '2px' }} />
                  <div style={{ width: '100%', height: '8px', background: 'linear-gradient(180deg, rgba(226,232,240,0.6), transparent)', marginTop: 'auto' }} />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ==================== BOTTOM LAYERED WAVES & LOADING FOOTER ==================== */}
        <footer style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '16px', pointerEvents: 'none' }}>
          
          {/* Sweeping Multi-Layered Bottom Wave Accent SVGs */}
          <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}>
            {/* White Cloud Top Arch */}
            <svg style={{ position: 'absolute', bottom: '-8px', left: 0, width: '120%', height: '128px', color: '#ffffff', fill: 'currentColor', filter: 'drop-shadow(0 -8px 16px rgba(0,0,0,0.06))' }} viewBox="0 0 500 140" preserveAspectRatio="none">
              <path d="M0,50 C150,5 340,90 500,25 L500,140 L0,140 Z" />
            </svg>
            {/* Bottom Right Cyan/Sky Blue Wave */}
            <svg style={{ position: 'absolute', bottom: '-8px', right: '-16px', width: '60%', height: '96px', color: '#0091ff', fill: 'currentColor', opacity: 0.95 }} viewBox="0 0 240 100" preserveAspectRatio="none">
              <path d="M0,70 C70,30 160,15 240,45 L240,100 L0,100 Z" />
            </svg>
            {/* Bottom Right Emerald Wave */}
            <svg style={{ position: 'absolute', bottom: '-16px', right: '-40px', width: '55%', height: '80px', color: '#00d66f', fill: 'currentColor', opacity: 0.9 }} viewBox="0 0 220 100" preserveAspectRatio="none">
              <path d="M0,85 C90,55 160,30 220,60 L220,100 L0,100 Z" />
            </svg>
            {/* Bottom Left Royal Blue Wave Ripple */}
            <svg style={{ position: 'absolute', bottom: '-8px', left: '-32px', width: '45%', height: '72px', color: '#005aff', fill: 'currentColor', opacity: 0.95 }} viewBox="0 0 200 100" preserveAspectRatio="none">
              <path d="M0,15 C60,45 140,75 200,85 L200,100 L0,100 Z" />
            </svg>
          </div>

          {/* Spinner & Bengali Loading Status */}
          <div style={{ position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '8px', pointerEvents: 'auto' }}>
            <div className="splash-loader-ring" />
            <p style={{ fontFamily: '"Hind Siliguri", sans-serif', fontSize: '13px', fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
              অ্যাপটি লোড হচ্ছে...
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
