import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

/**
 * ClayDisclaimerCard
 * 
 * Tactile Claymorphism styled disclaimer card ensuring 100% compliance
 * with Google Play Store Developer Policies (Government Apps, Non-affiliation & Impersonation policies).
 * 
 * Features:
 * - 3D Claymorphic soft-curved surface with dual outer elevation & tactile inner bevel highlights
 * - Clear non-government affiliation declaration
 * - Stated official government sources in text (without external link buttons)
 * - Candidate advisory note
 * - Expandable full legal & copyright takedown terms
 * - Full light & dark mode compatibility
 */
export default function ClayDisclaimerCard({ style = {} }) {
  const { state } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isDark = state.theme === 'dark';
  const isEn = state.language === 'en';

  return (
    <div
      className="clay-disclaimer-card"
      style={{
        position: 'relative',
        borderRadius: '18px',
        background: isDark
          ? 'linear-gradient(145deg, #1e293b 0%, #131d2e 100%)'
          : 'linear-gradient(145deg, #ffffff 0%, #f4f7fb 100%)',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.08)'
          : '1.5px solid rgba(255, 255, 255, 0.95)',
        boxShadow: isDark
          ? '0 8px 20px -4px rgba(0, 0, 0, 0.5), 0 3px 6px -2px rgba(0, 0, 0, 0.3), inset 0 1.5px 2px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.5)'
          : '0 8px 20px -4px rgba(30, 64, 175, 0.07), 0 3px 6px -2px rgba(15, 23, 42, 0.03), inset 0 2px 4px rgba(255, 255, 255, 0.95), inset 0 -2px 4px rgba(30, 64, 175, 0.04)',
        padding: '13px 15px',
        marginBottom: 'var(--space-lg, 16px)',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        ...style
      }}
    >
      {/* Disclaimer Notice Text (Tactile Clay Inset Box) */}
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
          marginBottom: '9px'
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
              <strong>Disclaimer:</strong> Live Circular is an independent educational and job information platform. It is <strong>NOT an official app of the Government of Bangladesh</strong> and does NOT represent any government entity or ministry.
            </>
          ) : (
            <>
              <strong>সতর্কবার্তা:</strong> 'লাইভ সার্কুলার' একটি সম্পূর্ণ স্বাধীন ও বেসরকারি তথ্যসেবা প্ল্যাটফর্ম। এটি <strong>বাংলাদেশ সরকার বা কোনো সরকারি নিয়োগকারী প্রতিষ্ঠানের অফিসিয়াল অ্যাপ নয়</strong> এবং কোনো সরকারি প্রতিনিধিত্ব করে না।
            </>
          )}
        </p>
      </div>

      {/* Sources Stated in Text (No link buttons) */}
      <p
        style={{
          fontSize: '10.5px',
          lineHeight: '1.5',
          color: isDark ? '#cbd5e1' : '#475569',
          margin: '0 0 7px 0',
          fontWeight: 500
        }}
      >
        {isEn ? (
          <>
            <strong>Information Sources:</strong> All circulars and notices are compiled from official government portals (such as bangladesh.gov.bd, bpsc.gov.bd, alljobs.teletalk.com.bd, mopa.gov.bd) and national dailies for educational purposes.
          </>
        ) : (
          <>
            <strong>তথ্যের উৎস:</strong> প্রদর্শিত সকল সার্কুলার ও পরীক্ষার তথ্য বিভিন্ন সরকারি অফিশিয়াল পোর্টাল (যেমন: bangladesh.gov.bd, bpsc.gov.bd, alljobs.teletalk.com.bd, mopa.gov.bd) এবং জাতীয় দৈনিক থেকে সংগৃহীত।
          </>
        )}
      </p>

      {/* Verification Advisory Note */}
      <p
        style={{
          fontSize: '10px',
          color: isDark ? '#94a3b8' : '#64748b',
          lineHeight: '1.45',
          margin: '0 0 9px 0',
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
            marginTop: '9px',
            paddingTop: '9px',
            borderTop: isDark ? '1px dashed rgba(255, 255, 255, 0.1)' : '1px dashed rgba(203, 213, 225, 0.8)',
            fontSize: '10px',
            color: isDark ? '#94a3b8' : '#64748b',
            lineHeight: '1.55',
            display: 'flex',
            flexDirection: 'column',
            gap: '7px'
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
              href="mailto:livecirculars@gmail.com"
              style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
            >
              livecirculars@gmail.com
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
