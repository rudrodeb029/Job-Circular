import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from '../components/Icons';
import { useAppContext } from '../context/AppContext';

const slides = [
  {
    id: 1,
    title: 'সব চাকরির খবর এক জায়গায়',
    titleEn: 'All Job Circulars in One Place',
    subtitle: 'শিক্ষা মন্ত্রণালয়, পুলিশ, ব্যাংক, এনজিও ও প্রাইভেট চাকরির নিয়োগ বিজ্ঞপ্তি পান সবার আগে।',
    subtitleEn: 'Get verified notifications of Government, Bank, NGO, and private job circulars first.',
    headerTitle: 'চাকরির নিয়োগ পোর্টাল',
    headerTitleEn: 'Job Circular Portal',
    headerBadge: 'অফিসিয়াল সোর্স',
    headerBadgeEn: 'Verified Source',
    accentColor: '#1a56db',
    accentBg: '#eff6ff',
    accentBorder: '#bfdbfe',
    items: [
      {
        code: 'GOV',
        codeBg: '#dbeafe',
        codeColor: '#1d4ed8',
        title: 'সরকারি ও মন্ত্রণালয় নিয়োগ',
        titleEn: 'Government & Ministry Jobs',
        meta: 'বিসিএস, প্রাথমিক শিক্ষক, নিবন্ধন (NTRCA) ও অধিদপ্তর',
        metaEn: 'BCS, Primary, NTRCA & Directorate Circulars',
        tag: 'সরকারি',
        tagEn: 'Govt'
      },
      {
        code: 'BNK',
        codeBg: '#e0e7ff',
        codeColor: '#4338ca',
        title: 'ব্যাংক ও আর্থিক প্রতিষ্ঠান',
        titleEn: 'Bank & Financial Institutions',
        meta: 'বাংলাদেশ ব্যাংক, সমন্বিত ব্যাংক ও বেসরকারি ব্যাংক',
        metaEn: 'Bangladesh Bank, Combined & Private Banks',
        tag: 'ব্যাংক',
        tagEn: 'Bank'
      },
      {
        code: 'NGO',
        codeBg: '#dcfce7',
        codeColor: '#15803d',
        title: 'এনজিও ও প্রাইভেট ক্যারিয়ার',
        titleEn: 'NGO & Corporate Sector',
        meta: 'জাতীয় ও আন্তর্জাতিক উন্নয়ন সংস্থা এবং কর্পোরেট জব',
        metaEn: 'National & International NGOs and Private Jobs',
        tag: 'প্রাইভেট',
        tagEn: 'Private'
      }
    ],
    footerLeft: 'প্রতিদিন নতুন সার্কুলার আপডেট',
    footerLeftEn: 'Daily Verified Circulars',
    footerRight: 'মূল পিডিএফ সহ',
    footerRightEn: 'With Official PDF'
  },
  {
    id: 2,
    title: 'পরীক্ষার নোটিশ ও প্রস্তুতি',
    titleEn: 'Exam Notices, Live MCQ & Results',
    subtitle: 'অ্যাডমিট কার্ড ডাউনলোড, পরীক্ষার সময়সূচি, লাইভ এমসিকিউ পরীক্ষা ও ফলাফলের আপডেট পান সাথে সাথে।',
    subtitleEn: 'Download admit cards, join live MCQ exams, and receive instant result updates.',
    headerTitle: 'একাডেমিক ও পরীক্ষা আর্কিটেকচার',
    headerTitleEn: 'Exam & Preparation Hub',
    headerBadge: 'লাইভ প্রস্তুতি',
    headerBadgeEn: 'Live Prep',
    accentColor: '#4f46e5',
    accentBg: '#eef2ff',
    accentBorder: '#c7d2fe',
    items: [
      {
        code: 'MCQ',
        codeBg: '#fef3c7',
        codeColor: '#b45309',
        title: 'লাইভ এমসিকিউ ও মডেল টেস্ট',
        titleEn: 'Live MCQ & Model Tests',
        meta: 'সিলেবাস ভিত্তিক লাইভ পরীক্ষা, ব্যাখ্যা ও মেধা তালিকা',
        metaEn: 'Syllabus-based Live Exams, Explanations & Ranks',
        tag: 'লাইভ',
        tagEn: 'Live'
      },
      {
        code: 'ADM',
        codeBg: '#e0e7ff',
        codeColor: '#4338ca',
        title: 'প্রবেশপত্র ও পরীক্ষার সময়সূচি',
        titleEn: 'Admit Card & Exam Schedule',
        meta: 'পরীক্ষার তারিখ, আসন বিন্যাস ও প্রবেশপত্র ডাউনলোড',
        metaEn: 'Exam Dates, Seat Plans & Admit Card Notices',
        tag: 'নোটিশ',
        tagEn: 'Notice'
      },
      {
        code: 'RES',
        codeBg: '#dcfce7',
        codeColor: '#15803d',
        title: 'ফলাফল ও বিগত প্রশ্নব্যাংক',
        titleEn: 'Results & Question Bank',
        meta: 'প্রিলিমিনারি ও লিখিত রেজাল্ট এবং বিগত সালের প্রশ্ন সমাধান',
        metaEn: 'Exam Results & Previous Year Question Solutions',
        tag: 'রেজাল্ট',
        tagEn: 'Result'
      }
    ],
    footerLeft: 'বিষয়ভিত্তিক প্রস্তুতি ও সমাধান',
    footerLeftEn: 'Subject-wise Prep & Solutions',
    footerRight: 'তাৎক্ষণিক অ্যালার্ট',
    footerRightEn: 'Instant Alerts'
  },
  {
    id: 3,
    title: 'স্মার্ট ফিল্টার ও বুকমার্ক',
    titleEn: 'Smart Filter & Bookmarks',
    subtitle: 'আপনার যোগ্যতা ও জেলা অনুযায়ী চাকরি খুঁজুন এবং প্রয়োজনীয় সার্কুলার বুকমার্ক করে রাখুন।',
    subtitleEn: 'Filter jobs by your educational qualification and district, and bookmark circulars.',
    headerTitle: 'স্মার্ট ক্যারিয়ার অর্গানাইজার',
    headerTitleEn: 'Smart Career Organizer',
    headerBadge: 'পার্সোনালাইজড',
    headerBadgeEn: 'Personalized',
    accentColor: '#059669',
    accentBg: '#ecfdf5',
    accentBorder: '#a7f3d0',
    filterPills: [
      { bn: 'স্নাতক / মাস্টার্স', en: 'Graduate / Masters' },
      { bn: 'এইচএসসি / ডিপ্লোমা', en: 'HSC / Diploma' },
      { bn: 'সকল ৬৪ জেলা', en: 'All 64 Districts' }
    ],
    items: [
      {
        code: 'EDU',
        codeBg: '#d1fae5',
        codeColor: '#047857',
        title: 'যোগ্যতা ও জেলা ভিত্তিক ফিল্টার',
        titleEn: 'Qualification & District Filter',
        meta: 'শিক্ষাগত যোগ্যতা, অভিজ্ঞতা ও নিজ জেলা অনুযায়ী বাছাই',
        metaEn: 'Filter by Education, Experience & Home District',
        tag: 'ফিল্টার',
        tagEn: 'Filter'
      },
      {
        code: 'SAV',
        codeBg: '#dbeafe',
        codeColor: '#1d4ed8',
        title: 'প্রয়োজনীয় সার্কুলার বুকমার্ক',
        titleEn: 'Saved Circulars & Offline Access',
        meta: 'পছন্দের বিজ্ঞপ্তি ও প্রশ্নপত্র সংরক্ষণ করে যেকোনো সময় দেখুন',
        metaEn: 'Bookmark important circulars for quick access anytime',
        tag: 'সেভড',
        tagEn: 'Saved'
      },
      {
        code: 'DLINE',
        codeBg: '#fee2e2',
        codeColor: '#b91c1c',
        title: 'আবেদনের সময়সীমা ট্র্যাকার',
        titleEn: 'Application Deadline Tracker',
        meta: 'আবেদনের শেষ তারিখ শেষ হওয়ার আগেই সতর্কবার্তা',
        metaEn: 'Track remaining days before application closes',
        tag: 'ডেডলাইন',
        tagEn: 'Deadline'
      }
    ],
    footerLeft: 'সহজ ও দ্রুত ক্যাটাগরি সার্চ',
    footerLeftEn: 'Fast Category Search',
    footerRight: 'অফলাইন বুকমার্ক',
    footerRightEn: 'Offline Bookmarks'
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasAgreedDisclaimer, setHasAgreedDisclaimer] = useState(false);
  const isEn = state.language === 'en';
  const isDark = state.theme === 'dark';

  const finishOnboarding = () => {
    dispatch({ type: 'SET_ONBOARDING_SEEN' });

    try {
      const OneSignal = window.OneSignal || (window.plugins && window.plugins.OneSignal);
      if (OneSignal && OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === 'function') {
        OneSignal.Notifications.requestPermission(true).catch(err => console.error('Onboarding: Permission error:', err));
      }
    } catch (e) {
      console.error('Onboarding: Push prompt failed:', e);
    }

    navigate('/home', { replace: true });
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const slide = slides[currentSlide];

  if (!hasAgreedDisclaimer) {
    return (
      <div
        className="onboarding-screen disclaimer-screen"
        style={{
          justifyContent: 'space-between',
          background: isDark
            ? 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)'
            : 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)'
        }}
      >
        <div style={{ height: '36px', paddingTop: 'var(--safe-area-top)' }} />

        <div className="onboarding-hero" style={{ padding: '0 10px', width: '100%', boxSizing: 'border-box' }}>
          <div
            style={{
              background: 'transparent',
              border: 'none',
              width: '100%',
              maxWidth: '360px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              boxSizing: 'border-box'
            }}
          >
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: isDark ? '#f8fafc' : '#0f172a',
                marginBottom: '16px',
                letterSpacing: '-0.5px',
                textAlign: 'center',
                marginTop: 0
              }}
            >
              Disclaimer
            </h2>

            <p
              style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: isDark ? '#cbd5e1' : '#334155',
                textAlign: 'center',
                margin: 0,
                fontWeight: '500'
              }}
            >
              <span style={{ fontWeight: '800', color: isDark ? '#f8fafc' : '#1e293b' }}>Live Circular</span> is an{' '}
              <span style={{ fontWeight: '700', color: '#dc2626' }}>independent platform</span> and has{' '}
              <span style={{ fontWeight: '700', color: '#dc2626' }}>no affiliation</span> with the government of Bangladesh or any government agency. All government job notices are{' '}
              <span style={{ fontWeight: '700', color: isDark ? '#f8fafc' : '#1e293b' }}>aggregated</span> from public official gazettes and portals.
            </p>
          </div>
        </div>

        <div>
          <button
            className="btn btn-block"
            onClick={() => setHasAgreedDisclaimer(true)}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              boxShadow: '0 6px 18px rgba(16, 185, 129, 0.25)',
              height: '46px',
              fontSize: '14px',
              fontWeight: 800,
              borderRadius: '12px'
            }}
          >
            <span>I Understand</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-screen">
      {/* Top Header Controls */}
      <div className="onboarding-top-bar" style={{ paddingTop: 'var(--safe-area-top)' }}>
        <span className="onboarding-step-chip">
          {currentSlide + 1} / {slides.length}
        </span>
        <button
          className="onboarding-skip-btn"
          onClick={finishOnboarding}
        >
          {isEn ? 'Skip' : 'এড়িয়ে যান'}
        </button>
      </div>

      {/* Educational & Career Architecture Panel (Static, Polished, Content-Driven) */}
      <div className="onboarding-hero">
        <div
          className="onboarding-arch-card"
          style={{
            background: isDark
              ? 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1.2px solid rgba(226, 232, 240, 0.95)',
            boxShadow: isDark
              ? '0 10px 28px -4px rgba(0, 0, 0, 0.55), inset 0 1px 1.5px rgba(255, 255, 255, 0.08)'
              : '0 10px 28px -6px rgba(15, 23, 42, 0.08), 0 3px 8px -2px rgba(15, 23, 42, 0.04), inset 0 2px 3px #ffffff'
          }}
        >
          {/* Card Top Architecture Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              background: isDark ? 'rgba(15, 23, 42, 0.6)' : slide.accentBg,
              borderBottom: isDark
                ? '1px solid rgba(255, 255, 255, 0.08)'
                : `1px solid ${slide.accentBorder}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: slide.accentColor,
                  display: 'inline-block'
                }}
              />
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 800,
                  color: isDark ? '#f8fafc' : '#0f172a',
                  letterSpacing: '-0.1px'
                }}
              >
                {isEn ? slide.headerTitleEn : slide.headerTitle}
              </span>
            </div>
            <span
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: isDark ? '#93c5fd' : slide.accentColor,
                background: isDark ? 'rgba(30, 41, 59, 0.9)' : '#ffffff',
                border: isDark
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : `1px solid ${slide.accentBorder}`,
                padding: '2px 8px',
                borderRadius: '999px'
              }}
            >
              {isEn ? slide.headerBadgeEn : slide.headerBadge}
            </span>
          </div>

          {/* Optional Filter Chips Row (for Slide 3) */}
          {slide.filterPills && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 12px 2px 12px',
                flexWrap: 'nowrap',
                overflow: 'hidden'
              }}
            >
              {slide.filterPills.map((pill, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: isDark ? '#e2e8f0' : '#334155',
                    background: isDark ? 'rgba(30, 41, 59, 0.85)' : '#f1f5f9',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                    padding: '3px 7px',
                    borderRadius: '5px',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {isEn ? pill.en : pill.bn}
                </span>
              ))}
            </div>
          )}

          {/* Structured Content Modules */}
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {slide.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 10px',
                  borderRadius: '8px',
                  background: isDark
                    ? 'rgba(30, 41, 59, 0.7)'
                    : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                  border: isDark
                    ? '1px solid rgba(255, 255, 255, 0.07)'
                    : '1px solid rgba(226, 232, 240, 0.9)',
                  boxShadow: isDark
                    ? 'none'
                    : '0 2px 5px -1px rgba(15, 23, 42, 0.03), inset 0 1px 1.5px #ffffff'
                }}
              >
                {/* Module Code Pill */}
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '7px',
                    background: isDark ? 'rgba(59, 130, 246, 0.18)' : item.codeBg,
                    color: isDark ? '#93c5fd' : item.codeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9.5px',
                    fontWeight: 800,
                    letterSpacing: '0.2px',
                    flexShrink: 0,
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.8)'
                  }}
                >
                  {item.code}
                </div>

                {/* Module Text Info */}
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: isDark ? '#f8fafc' : '#0f172a',
                      lineHeight: 1.25,
                      marginBottom: '2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {isEn ? item.titleEn : item.title}
                  </div>
                  <div
                    style={{
                      fontSize: '9.8px',
                      fontWeight: 500,
                      color: isDark ? '#94a3b8' : '#64748b',
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {isEn ? item.metaEn : item.meta}
                  </div>
                </div>

                {/* Right Status Tag */}
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: isDark ? '#cbd5e1' : '#475569',
                    background: isDark ? 'rgba(15, 23, 42, 0.7)' : '#f1f5f9',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                    padding: '2.5px 6.5px',
                    borderRadius: '5px',
                    flexShrink: 0
                  }}
                >
                  {isEn ? item.tagEn : item.tag}
                </span>
              </div>
            ))}
          </div>

          {/* Card Footer Architecture Summary Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc',
              borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0',
              fontSize: '9.5px',
              fontWeight: 600,
              color: isDark ? '#94a3b8' : '#475569'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={slide.accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{isEn ? slide.footerLeftEn : slide.footerLeft}</span>
            </span>
            <span style={{ fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155' }}>
              {isEn ? slide.footerRightEn : slide.footerRight}
            </span>
          </div>
        </div>
      </div>

      {/* Slide Content Box */}
      <div className="onboarding-content-box">
        <h1 className="onboarding-slide-title">{isEn ? slide.titleEn : slide.title}</h1>
        <p className="onboarding-slide-desc">{isEn ? slide.subtitleEn : slide.subtitle}</p>
      </div>

      {/* Bottom Controls Area */}
      <div>
        {/* Pagination Dots */}
        <div className="onboarding-dots">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`onboarding-dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              title={`Slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          className="btn btn-block"
          onClick={handleNext}
          style={{
            background: currentSlide === slides.length - 1
              ? 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)'
              : 'var(--primary)',
            color: 'white',
            boxShadow: '0 6px 18px rgba(26, 86, 219, 0.25)',
            height: '46px',
            fontSize: '14px',
            fontWeight: 800,
            borderRadius: '12px'
          }}
        >
          <span>
            {currentSlide === slides.length - 1
              ? (isEn ? 'Get Started' : 'শুরু করুন')
              : (isEn ? 'Next' : 'পরবর্তী')}
          </span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
