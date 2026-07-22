import React, { useState } from 'react';

export default function Disclaimer() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{
      borderTop: '1px solid var(--border-light)',
      padding: '16px',
      marginTop: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      textAlign: 'center',
      background: 'transparent'
    }}>
      {/* Clickable Header Toggle Row */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '11px', 
          fontWeight: 800, 
          color: 'var(--text-secondary)', 
          textTransform: 'uppercase', 
          letterSpacing: '1.2px',
          opacity: 0.8,
          cursor: 'pointer',
          userSelect: 'none',
          padding: '4px 0'
        }}
      >
        <span>Disclaimer / সতর্কীকরণ</span>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ 
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', 
            transition: 'transform 0.2s ease',
            color: 'var(--text-secondary)'
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Conditionally Rendered Content Block */}
      {isExpanded && (
        <div 
          className="animate-fade-in"
          style={{ 
            fontSize: '11px', 
            lineHeight: '1.6', 
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            textAlign: 'center'
          }}
        >
          <p style={{ margin: 0 }}>
            <strong>English:</strong> Job Circular is an independent platform and has no affiliation with the government of Bangladesh or any government agency. All government job notices are aggregated from public official gazettes and portals.
          </p>
          <p style={{ margin: 0 }}>
            <strong>বাংলা:</strong> জব সার্কুলার একটি স্বাধীন ব্যক্তিগত প্ল্যাটফর্ম। এটি বাংলাদেশ সরকার বা এর কোনো মন্ত্রণালয়/সংস্থার সাথে যুক্ত নয়। এখানে প্রদর্শিত সকল সরকারি চাকরির বিজ্ঞপ্তি পাবলিক সোর্স ও সরকারি ওয়েবসাইট থেকে সংগ্রহ করা হয়েছে।
          </p>

          <div style={{
            marginTop: '6px',
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '8px 16px'
          }}>
            <a href="https://bangladesh.gov.bd" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              bangladesh.gov.bd
            </a>
            <a href="https://bpsc.gov.bd" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              bpsc.gov.bd
            </a>
            <a href="https://mopa.gov.bd" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              mopa.gov.bd
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
