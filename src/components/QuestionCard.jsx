import React from 'react';

/**
 * Pixel-Perfect Question Grid Card Component
 * Styled 1:1 like the provided design with soft sky blue header, cloud backdrop, 
 * vector school building illustration, centered bold title, and meta info (date & question count).
 */
export default function QuestionCard({ paper, onClick, isEn = false }) {
  if (!paper) return null;

  const title = isEn ? (paper.titleEn || paper.title) : paper.title;
  const dateStr = isEn ? (paper.dateEn || paper.date) : (paper.date || paper.dateEn || '');
  const questionsCount = paper.totalQuestions || paper.questions?.length || 0;
  const countText = isEn ? `${questionsCount} Questions` : `${toBengaliNumber(questionsCount)}টি প্রশ্ন`;

  return (
    <div
      onClick={onClick}
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid rgba(203, 213, 225, 0.6)',
        boxShadow: '0 6px 16px -4px rgba(37, 99, 235, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
      className="question-grid-card-hover"
    >
      {/* Top Header - Soft Sky Blue Gradient with Cloud & School Building Illustration */}
      <div
        style={{
          width: '100%',
          height: '115px',
          background: 'linear-gradient(180deg, #dbeafe 0%, #bfdbfe 55%, #93c5fd 100%)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Decorative Wave Overlays */}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.25, pointerEvents: 'none' }}
          viewBox="0 0 200 120"
          preserveAspectRatio="none"
          fill="none"
        >
          <path d="M0 20 C60 60 140 0 200 40 L200 0 L0 0 Z" fill="#ffffff" />
          <path d="M0 80 C80 110 120 50 200 90 L200 120 L0 120 Z" fill="#3b82f6" />
        </svg>

        {/* Vector School Building & Cloud Composition */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="105" height="82" viewBox="0 0 120 95" fill="none">
            {/* Soft Cloud Backdrop */}
            <path
              d="M22 56 C12 56 8 42 18 32 C20 20 36 16 48 22 C56 12 76 12 84 22 C96 16 110 20 112 32 C122 42 118 56 106 56 Z"
              fill="#ffffff"
              opacity="0.88"
            />

            {/* School Building Left Wing */}
            <rect x="25" y="42" width="28" height="34" rx="2" fill="#dbeafe" stroke="#2563eb" strokeWidth="2.5" />
            <polygon points="23,42 39,28 55,42" fill="#eff6ff" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" />

            {/* School Building Right Wing */}
            <rect x="67" y="42" width="28" height="34" rx="2" fill="#dbeafe" stroke="#2563eb" strokeWidth="2.5" />
            <polygon points="65,42 81,28 97,42" fill="#eff6ff" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" />

            {/* School Building Center Tower */}
            <rect x="44" y="28" width="32" height="48" rx="2" fill="#bfdbfe" stroke="#2563eb" strokeWidth="2.5" />
            <polygon points="42,28 60,12 78,28" fill="#dbeafe" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" />

            {/* Clock in center gable */}
            <circle cx="60" cy="22" r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
            <line x1="60" y1="22" x2="60" y2="19" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="60" y1="22" x2="62" y2="22" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" />

            {/* Left Wing Windows (3x3 grid) */}
            <rect x="30" y="47" width="5" height="6" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
            <rect x="37" y="47" width="5" height="6" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
            <rect x="44" y="47" width="4" height="6" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />

            <rect x="30" y="56" width="5" height="6" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
            <rect x="37" y="56" width="5" height="6" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
            <rect x="44" y="56" width="4" height="6" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />

            <rect x="30" y="65" width="5" height="6" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
            <rect x="37" y="65" width="5" height="6" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
            <rect x="44" y="65" width="4" height="6" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />

            {/* Right Wing Windows (3x3 grid) */}
            <rect x="72" y="47" width="4" height="6" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
            <rect x="78" y="47" width="5" height="6" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
            <rect x="85" y="47" width="5" height="6" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />

            <rect x="72" y="56" width="4" height="6" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
            <rect x="78" y="56" width="5" height="6" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
            <rect x="85" y="56" width="5" height="6" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />

            <rect x="72" y="65" width="4" height="6" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
            <rect x="78" y="65" width="5" height="6" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
            <rect x="85" y="65" width="5" height="6" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />

            {/* Central Doorway Arch */}
            <path d="M53 76 V60 A7 7 0 0 1 67 60 V76 Z" fill="#ffffff" stroke="#2563eb" strokeWidth="2.2" />
          </svg>
        </div>
      </div>

      {/* Bottom Content Body - Title & Meta Info */}
      <div style={{ padding: '12px 10px 14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, justifyContent: 'space-between' }}>
        {/* Title */}
        <h3
          style={{
            fontSize: '12.5px',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 8px 0',
            lineHeight: '1.35',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontFamily: '"Hind Siliguri", sans-serif'
          }}
        >
          {title}
        </h3>

        {/* Footer Meta Row (Date & Question Count) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', width: '100%', fontSize: '10.5px', color: '#475569', fontWeight: 600 }}>
          {dateStr && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
              <span role="img" aria-label="calendar">🗓️</span>
              <span>{dateStr}</span>
            </span>
          )}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
            <span role="img" aria-label="paper">📝</span>
            <span>{countText}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const engNum = String(num);
  const bengaliDigits = {'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'};
  return engNum.split('').map(digit => bengaliDigits[digit] || digit).join('');
};
