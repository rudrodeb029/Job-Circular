import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { openInAppBrowser } from '../utils/browserUtils';

/**
 * ClayDisclaimerCard
 * 
 * Tactile Claymorphism styled disclaimer card ensuring 100% compliance
 * with Google Play Store Developer Policies (Government Apps, Non-affiliation & Impersonation policies).
 * 
 * Features:
 * - 3D Claymorphic soft-curved surface with dual outer elevation & tactile inner bevel highlights
 * - Prominent non-government affiliation declaration
 * - Direct official verification links (bangladesh.gov.bd, bpsc.gov.bd, alljobs.teletalk.com.bd, mopa.gov.bd)
 * - Expandable full legal & copyright takedown terms
 * - Full light & dark mode compatibility
 */
export default function ClayDisclaimerCard({ style = {} }) {
  const { state } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isDark = state.theme === 'dark';
  const isEn = state.language === 'en';

  const handleLinkClick = (e, url) => {
    e.preventDefault();
    openInAppBrowser(url);
  };

  return (
    <div
      className="clay-disclaimer-card"
      style={{
        position: 'relative',
        borderRadius: '20px',
        background: isDark
          ? 'linear-gradient(145deg, #1e293b 0%, #131d2e 100%)'
          : 'linear-gradient(145deg, #ffffff 0%, #f4f7fb 100%)',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.08)'
          : '1.5px solid rgba(255, 255, 255, 0.95)',
        boxShadow: isDark
          ? '0 10px 24px -4px rgba(0, 0, 0, 0.5), 0 4px 8px -2px rgba(0, 0, 0, 0.3), inset 0 1.5px 2px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.5)'
          : '0 10px 24px -4px rgba(30, 64, 175, 0.08), 0 4px 8px -2px rgba(15, 23, 42, 0.04), inset 0 2px 4px rgba(255, 255, 255, 0.95), inset 0 -2px 4px rgba(30, 64, 175, 0.04)',
        padding: '14px 16px',
        marginBottom: 'var(--space-lg, 16px)',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        ...style
      }}
    >
      {/* Top Header Row with Clay 3D Icon Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          {/* Clay 3D Badge */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: isDark
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(180, 83, 9, 0.35) 100%)'
                : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: isDark
                ? '1px solid rgba(245, 158, 11, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: isDark
                ? '0 3px 8px rgba(0, 0, 0, 0.4), inset 0 1px 1.5px rgba(255, 255, 255, 0.15), inset 0 -1.5px 2px rgba(0, 0, 0, 0.4)'
                : '0 4px 10px rgba(217, 119, 6, 0.18), inset 0 1.5px 2px #ffffff, inset 0 -1.5px 2px rgba(180, 83, 9, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              flexShrink: 0
            }}
          >
            🛡️
          </div>

          <div style={{ minWidth: 0 }}>
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: isDark ? '#f1f5f9' : '#1e293b',
                margin: 0,
                lineHeight: 1.25,
                letterSpacing: '-0.1px'
              }}
            >
              {isEn ? 'Government Non-Affiliation Notice' : 'সরকারি সম্পৃক্ততাহীন সতর্কবার্তা'}
            </h4>
            <span
              style={{
                fontSize: '9.5px',
                color: isDark ? '#94a3b8' : '#64748b',
                fontWeight: 600,
                display: 'block'
              }}
            >
              {isEn ? 'Google Play Policy Disclosures & Sources' : 'তথ্যের উৎস ও আইনি দাবিত্যাগ'}
            </span>
          </div>
        </div>

        {/* Small Verified Badge */}
        <span
          style={{
            fontSize: '9px',
            fontWeight: 700,
            color: isDark ? '#38bdf8' : '#0284c7',
            background: isDark ? 'rgba(56, 189, 248, 0.12)' : '#e0f2fe',
            border: isDark ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid #bae6fd',
            padding: '2px 7px',
            borderRadius: '12px',
            flexShrink: 0,
            whiteSpace: 'nowrap'
          }}
        >
          {isEn ? 'Official Sources' : 'সোর্স তথ্য'}
        </span>
      </div>

      {/* Prominent Core Disclaimer Box (Tactile Clay Inset) */}
      <div
        style={{
          borderRadius: '12px',
          background: isDark
            ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)'
            : 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%)',
          border: isDark
            ? '1px solid rgba(245, 158, 11, 0.2)'
            : '1px solid rgba(251, 191, 36, 0.45)',
          boxShadow: isDark
            ? 'inset 0 1px 2px rgba(255, 255, 255, 0.05), inset 0 -1.5px 2px rgba(0, 0, 0, 0.3)'
            : '0 2px 6px rgba(245, 158, 11, 0.06), inset 0 1.5px 2px #ffffff, inset 0 -1px 2px rgba(217, 119, 6, 0.1)',
          padding: '10px 12px',
          marginBottom: '10px'
        }}
      >
        <p
          style={{
            fontSize: '11px',
            lineHeight: '1.5',
            color: isDark ? '#fde68a' : '#92400e',
            margin: 0,
            fontWeight: 500
          }}
        >
          {isEn ? (
            <>
              <strong>Disclaimer:</strong> Live Circular is a private educational and career information platform. It is <strong>NOT an official app of the Government of Bangladesh</strong> and does NOT represent any government entity or ministry.
            </>
          ) : (
            <>
              <strong>সতর্কবার্তা:</strong> 'লাইভ সার্কুলার' একটি সম্পূর্ণ স্বাধীন ও বেসরকারি তথ্যসেবা প্ল্যাটফর্ম। এটি <strong>বাংলাদেশ সরকার বা কোনো সরকারি নিয়োগকারী প্রতিষ্ঠানের অফিসিয়াল অ্যাপ নয়</strong> এবং কোনো সরকারি প্রতিনিধিত্ব করে না।
            </>
          )}
        </p>
      </div>

      {/* Sources Verification Section with Clay Pills */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px' }}>🌐</span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: isDark ? '#cbd5e1' : '#475569'
            }}
          >
            {isEn ? 'Information verified from official government portals:' : 'সকল তথ্য সরকারি অফিশিয়াল পোর্টাল থেকে সংগৃহীত:'}
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {[
            { label: 'bangladesh.gov.bd', url: 'https://bangladesh.gov.bd' },
            { label: 'bpsc.gov.bd', url: 'https://bpsc.gov.bd' },
            { label: 'alljobs.teletalk.com.bd', url: 'http://alljobs.teletalk.com.bd' },
            { label: 'mopa.gov.bd', url: 'https://mopa.gov.bd' }
          ].map((portal) => (
            <button
              key={portal.label}
              type="button"
              onClick={(e) => handleLinkClick(e, portal.url)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '14px',
                fontSize: '9.5px',
                fontWeight: 600,
                color: isDark ? '#93c5fd' : '#1d4ed8',
                background: isDark
                  ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
                border: isDark
                  ? '1px solid rgba(59, 130, 246, 0.25)'
                  : '1px solid rgba(191, 219, 254, 0.8)',
                boxShadow: isDark
                  ? '0 2px 5px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.08), inset 0 -1px 2px rgba(0, 0, 0, 0.4)'
                  : '0 2px 4px rgba(37, 99, 235, 0.06), inset 0 1px 1px #ffffff, inset 0 -1px 1px rgba(37, 99, 235, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textDecoration: 'none'
              }}
            >
              <span>🔗</span>
              <span>{portal.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Verification Advisory Note */}
      <p
        style={{
          fontSize: '10px',
          color: isDark ? '#94a3b8' : '#64748b',
          lineHeight: '1.45',
          margin: '0 0 10px 0',
          fontStyle: 'italic'
        }}
      >
        {isEn
          ? 'Notice: Candidates are advised to verify all terms from official circulars before applying. Never send money to unofficial personal accounts.'
          : 'পরামর্শ: যেকোনো চাকরিতে আবেদনের পূর্বে সংশ্লিষ্ট কর্তৃপক্ষের মূল অফিসিয়াল বিজ্ঞপ্তি নিজ দায়িত্বে যাচাই করুন। কোনো অননুমোদিত অ্যাকাউন্টে আর্থিক লেনদেন করবেন না।'}
      </p>

      {/* Accordion Toggle for Detailed Policy / Legal Info */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '6px 10px',
          borderRadius: '12px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.06)'
            : '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: isDark
            ? '0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.05)'
            : '0 2px 4px rgba(0, 0, 0, 0.02), inset 0 1px 1px #ffffff',
          color: isDark ? '#cbd5e1' : '#475569',
          fontSize: '10px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <span>{isExpanded ? (isEn ? 'Hide Legal Details' : 'আইনি বিবরণ লুকান') : (isEn ? 'View Detailed Legal Terms & Policy' : 'বিস্তারিত আইনি ঘোষণা ও নীতি')}</span>
        <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', display: 'inline-block' }}>▾</span>
      </button>

      {/* Expanded Legal Terms Section */}
      {isExpanded && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: isDark ? '1px dashed rgba(255, 255, 255, 0.1)' : '1px dashed rgba(203, 213, 225, 0.8)',
            fontSize: '10px',
            color: isDark ? '#94a3b8' : '#64748b',
            lineHeight: '1.55',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div>
            <strong style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}>
              {isEn ? '1. Information Accuracy & Sources:' : '১. তথ্যের উৎস ও সঠিকতা:'}
            </strong>{' '}
            {isEn
              ? 'Information published in this app is collected from public organization portals, official press releases, and national newspapers. While we strive for accuracy, circular conditions may change at the authority’s discretion.'
              : 'অ্যাপে প্রদর্শিত বিজ্ঞপ্তিসমূহ বিভিন্ন প্রতিষ্ঠান ও মন্ত্রণালয়ের অফিসিয়াল ওয়েবসাইট, জাতীয় দৈনিক ও প্রকাশ্য গেজেট থেকে সংগৃহীত। কর্তৃপক্ষ যেকোনো সময় শর্তাবলী পরিবর্তন বা বাতিল করতে পারে।'}
          </div>

          <div>
            <strong style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}>
              {isEn ? '2. Non-Affiliation Declaration:' : '২. সরকারি অংশীদারিত্বহীন ঘোষণা:'}
            </strong>{' '}
            {isEn
              ? 'This application has no formal partnership, authorization, or affiliation with the Government of Bangladesh, BPSC, or any military/defense commission. We do not charge fees on behalf of any government agency.'
              : 'এই অ্যাপটি বাংলাদেশ সরকার, বিপিএসসি কিংবা কোনো সরকারি বা স্বায়ত্তশাসিত সংস্থার অফিশিয়াল অ্যাপ নয়। আমরা সরকারের পক্ষে কোনো ফি গ্রহণ বা নিয়োগ কার্যক্রম পরিচালনা করি না।'}
          </div>

          <div>
            <strong style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}>
              {isEn ? '3. Copyright & Takedown Policy:' : '৩. কপিরাইট ও কন্টেন্ট অপসারণ নীতি:'}
            </strong>{' '}
            {isEn
              ? 'All logos and brand assets belong to their respective authorities and are used strictly under fair-use informational grounds. For any copyright inquiries or immediate content removal:'
              : 'সকল লোগো ও ট্রেডমার্ক সংশ্লিষ্ট কর্তৃপক্ষের নিজস্ব সম্পত্তি এবং তথ্য প্রদানের উদ্দেশ্যে ব্যবহৃত। কন্টেন্ট অপসারণ বা যেকোনো আইনি প্রয়োজনে যোগাযোগ করুন:'}{' '}
            <a
              href="mailto:rudrodeb029@gmail.com"
              style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
            >
              rudrodeb029@gmail.com
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
