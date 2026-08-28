import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function Disclaimer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { state } = useAppContext();
  const isEn = state.language === 'en';

  return (
    <div style={{
      border: '1px solid var(--border-light)',
      borderRadius: '20px',
      padding: '16px',
      marginTop: '24px',
      background: 'var(--card-bg, #ffffff)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
    }}>
      {/* Clickable Header Toggle Row */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          padding: '4px 0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <span style={{ 
            fontSize: '12px', 
            fontWeight: 800, 
            color: 'var(--text-primary)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.8px'
          }}>
            {isEn ? 'Disclaimer & Legal Notice' : 'সতর্কবার্তা ও আইনি দাবিত্যাগ'}
          </span>
        </div>

        <svg 
          width="14" 
          height="14" 
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

      {/* Conditionally Rendered Detailed Disclaimer */}
      {isExpanded && (
        <div className="animate-fade-in" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
          {!isEn ? (
            /* 🇧🇩 Bangla Disclaimer Mode */
            <div style={{ fontSize: '11.5px', lineHeight: '1.65', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '12px', padding: '10px 12px', color: '#873800', fontWeight: 600 }}>
                📢 <strong>জরুরি সতর্কবার্তা:</strong> এই অ্যাপটি বাংলাদেশ সরকার বা কোনো সরকারি কর্তৃপক্ষের অফিশিয়াল অ্যাপ্লিকেশন নয়।
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>১. তথ্যের উৎস ও নির্ভরযোগ্যতা:</strong>
                লাইভ সার্কুলার (Live Circular) অ্যাপ্লিকেশনে প্রদর্শিত সকল চাকরির বিজ্ঞপ্তি, পরীক্ষার সময়সূচী, ফলাফল এবং বিগত সালের পরীক্ষার প্রশ্ন-সমাধান সম্পূর্ণ শিক্ষামূলক ও তথ্য প্রদানের উদ্দেশ্যে প্রকাশ করা হয়েছে। এসব তথ্য বিভিন্ন সরকারি ও বেসরকারি প্রতিষ্ঠানের অফিসিয়াল ওয়েবসাইট, জাতীয় দৈনিক পত্রিকা এবং ইন্টারনেট মাধ্যম থেকে সংগ্রহ করা হয়।
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>২. কোনো সরকারি বা প্রাতিষ্ঠানিক সম্পৃক্ততা নেই (No Government Affiliation):</strong>
                এই অ্যাপ্লিকেশনটি বাংলাদেশ সরকার, কোনো সরকারি অধিদপ্তর, মন্ত্রণালয়, স্বায়ত্তশাসিত সংস্থা কিংবা কোনো নির্দিষ্ট চাকরি নিয়োগকারী বোর্ডের (যেমন: BPSC, NTRCA, বা কোনো ব্যাংক) অফিসিয়াল অ্যাপ নয়। আমরা কোনো সরকারি সেবা প্রদান করি না এবং সরকারের কোনো প্রতিনিধিত্ব করি না। এটি চাকরিপ্রার্থীদের সুবিধার্থে তৈরি একটি স্বাধীন ও ব্যক্তিগত তথ্যসেবা প্ল্যাটফর্ম।
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>৩. কপিরাইট এবং মেধা সম্পত্তি (Copyright & Intellectual Property):</strong>
                বিগত সালের পরীক্ষার মূল প্রশ্নপত্রের অধিকার সম্পূর্ণভাবে সংশ্লিষ্ট পরীক্ষা নিয়ন্ত্রণ কর্তৃপক্ষের। আমরা কোনো বাণিজ্যিক প্রকাশনী বা গাইড বইয়ের কপিরাইটযুক্ত কন্টেন্ট প্রকাশ করি না। অ্যাপে থাকা সমাধানগুলো আমাদের নিজস্ব টিম দ্বারা পরীক্ষামূলকভাবে তৈরি বা উন্মুক্ত সোর্স থেকে সংগৃহীত। যেকোনো কন্টেন্ট অপসারণের জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন, অভিযোগ প্রমাণিত হওয়া মাত্র ২৪-৪৮ ঘণ্টার মধ্যে কন্টেন্ট সরাব।
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>৪. আবেদন ও তথ্যের সত্যতা যাচাই:</strong>
                বিজ্ঞপ্তিতে আবেদন করার পূর্বে চাকরিপ্রার্থীদের সংশ্লিষ্ট প্রতিষ্ঠানের অফিসিয়াল সার্কুলার, আবেদনের শেষ তারিখ এবং নিয়মাবলী নিজ দায়িত্বে যাচাই করে নেওয়ার অনুরোধ করা হলো।
              </div>

              <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
                📩 <strong>যোগাযোগ & কন্টেন্ট রিমুভাল:</strong> <a href="mailto:rudrodeb029@gmail.com" style={{ color: 'var(--primary)', fontWeight: 700 }}>rudrodeb029@gmail.com</a>
              </div>
            </div>
          ) : (
            /* 🇬🇧 English Disclaimer Mode */
            <div style={{ fontSize: '11.5px', lineHeight: '1.65', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '10px 12px', color: '#1e40af', fontWeight: 600 }}>
                📢 <strong>Important Notice:</strong> Live Circular is an independent platform and does NOT represent any government entity.
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>1. Source of Information:</strong>
                All job circulars, exam schedules, results, and previous year exam questions published in this application are collected from official organization websites, national newspapers, and publicly accessible online sources for educational purposes.
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>2. Non-Affiliation with Government (No Government Representation):</strong>
                This application is NOT affiliated with, authorized, endorsed, or sponsored by the Government of Bangladesh, any government ministry, directorate, autonomous body, or recruitment board (e.g., BPSC, NTRCA). We do not represent any government entity nor facilitate government services.
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>3. Copyright & Fair Use Notice:</strong>
                Copyright of original exam questions belongs entirely to the respective conducting authorities. We do not publish scanned copyrighted material from commercial guidebooks. Solutions are compiled independently by our team. Valid copyright takedown requests will be processed within 24-48 hours.
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>4. Verification & Liability Limitation:</strong>
                Users are strongly advised to verify details from official hiring portals before applying. The app developers shall not be liable for any inaccuracies or decisions made based on this app.
              </div>

              <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
                📩 <strong>Contact & Takedown Email:</strong> <a href="mailto:rudrodeb029@gmail.com" style={{ color: 'var(--primary)', fontWeight: 700 }}>rudrodeb029@gmail.com</a>
              </div>
            </div>
          )}

          {/* Official Verification Links */}
          <div style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px dashed var(--border)',
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '8px 16px',
            fontSize: '11px'
          }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{isEn ? 'Official Sources:' : 'অফিসিয়াল সোর্সসমূহ:'}</span>
            <a href="https://bangladesh.gov.bd" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>
              bangladesh.gov.bd
            </a>
            <a href="https://bpsc.gov.bd" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>
              bpsc.gov.bd
            </a>
            <a href="https://mopa.gov.bd" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>
              mopa.gov.bd
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
