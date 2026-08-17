import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Bell, Search, ChevronRight, Shield } from '../components/Icons';
import { useAppContext } from '../context/AppContext';

const slides = [
  {
    id: 1,
    title: 'সব চাকরির খবর এক জায়গায়',
    titleEn: 'All Job Circulars in One Place',
    subtitle: 'শিক্ষা মন্ত্রণালয়, পুলিশ, ব্যাংক, এনজিও ও প্রাইভেট চাকরির নিয়োগ বিজ্ঞপ্তি পান সবার আগে।',
    subtitleEn: 'Get notification of Government, Bank, NGO, and private job circulars first.',
    bgGradient: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)',
    iconColor: '#ffffff',
    icon: <Briefcase size={64} color="white" />,
    floatingBadges: [
      { text: '🏛️ সরকারি চাকরি', textEn: '🏛️ Govt Jobs', top: '10px', left: '-15px' },
      { text: '🏦 ব্যাংক জব', textEn: '🏦 Bank Jobs', top: '75px', right: '-20px' },
      { text: '🤝 এনজিও নিয়োগ', textEn: '🤝 NGO Jobs', bottom: '15px', left: '10px' }
    ]
  },
  {
    id: 2,
    title: 'পরীক্ষার নোটিশ ও রেজাল্ট',
    titleEn: 'Exam Dates & Results',
    subtitle: 'অ্যাডমিট কার্ড ডাউনলোড, পরীক্ষার সময়সূচি এবং ফলাফলের নোটিফিকেশন পান সাথে সাথে।',
    subtitleEn: 'Download admit cards, get exam schedules, and receive instant result alerts.',
    bgGradient: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
    iconColor: '#ffffff',
    icon: <Bell size={64} color="white" />,
    floatingBadges: [
      { text: '🎟️ অ্যাডমিট কার্ড', textEn: '🎟️ Admit Card', top: '15px', right: '-15px' },
      { text: '📜 রেজাল্ট', textEn: '📜 Exam Result', top: '80px', left: '-20px' },
      { text: '⏰ পরীক্ষার তারিখ', textEn: '⏰ Exam Date', bottom: '10px', right: '10px' }
    ]
  },
  {
    id: 3,
    title: 'স্মার্ট ফিল্টার ও বুকমার্ক',
    titleEn: 'Smart Filter & Bookmarks',
    subtitle: 'আপনার যোগ্যতা ও জেলা অনুযায়ী চাকরি খুঁজুন এবং প্রয়োজনীয় সার্কুলার বুকমার্ক করে রাখুন।',
    subtitleEn: 'Filter jobs by your educational qualification and district, and bookmark circulars.',
    bgGradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    iconColor: '#ffffff',
    icon: <Search size={64} color="white" />,
    floatingBadges: [
      { text: '🔍 জেলা ফিল্টার', textEn: '🔍 District Filter', top: '12px', left: '-10px' },
      { text: '🎓 যোগ্যতা ভিত্তিক', textEn: '🎓 Qualification', top: '75px', right: '-25px' },
      { text: '📌 সেভড সার্কুলার', textEn: '📌 Saved Circulars', bottom: '15px', left: '15px' }
    ]
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasAgreedDisclaimer, setHasAgreedDisclaimer] = useState(false);
  const isEn = state.language === 'en';

  const finishOnboarding = () => {
    dispatch({ type: 'SET_ONBOARDING_SEEN' });

    // Request OneSignal push permission on onboarding completion
    try {
      const OneSignal = window.OneSignal || (window.plugins && window.plugins.OneSignal);
      if (OneSignal && OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === 'function') {
        console.log('Onboarding: Requesting notification permission...');
        OneSignal.Notifications.requestPermission(true).then((accepted) => {
          console.log('Onboarding: Push permission accepted:', accepted);
        }).catch(err => console.error('Onboarding: Permission error:', err));
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
      <div className="onboarding-screen disclaimer-screen animate-fade-in" style={{ justifyContent: 'space-between', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
        {/* Top Header Placeholder to keep spacing */}
        <div style={{ height: '36px', paddingTop: 'var(--safe-area-top)' }} />

        {/* Hero Card Container */}
        <div className="onboarding-hero animate-scale-in" style={{ padding: '0 10px', width: '100%', boxSizing: 'border-box' }}>
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
            {/* Header */}
            <h2 
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#0f172a',
                marginBottom: '16px',
                letterSpacing: '-0.5px',
                textAlign: 'center',
                marginTop: 0
              }}
            >
              Disclaimer
            </h2>

            {/* Content Text */}
            <p 
              style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#334155',
                textAlign: 'center',
                margin: 0,
                fontWeight: '500'
              }}
            >
              <span style={{ fontWeight: '800', color: '#1e293b' }}>Job Circulars BD</span> is an <span style={{ fontWeight: '700', color: '#dc2626' }}>independent platform</span> and has <span style={{ fontWeight: '700', color: '#dc2626' }}>no affiliation</span> with the government of Bangladesh or any government agency. All government job notices are <span style={{ fontWeight: '700', color: '#1e293b' }}>aggregated</span> from public official gazettes and portals.
            </p>
          </div>
        </div>

        {/* Bottom Button Action */}
        <div>
          <button
            className="btn btn-block btn-lg animate-slide-up"
            onClick={() => setHasAgreedDisclaimer(true)}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
            }}
          >
            <span>I Understand</span>
            <ChevronRight size={20} />
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

      {/* Slide Hero Illustration */}
      <div className="onboarding-hero animate-scale-in" key={currentSlide}>
        <div className="onboarding-illustration-box">
          <div
            className="onboarding-circle-bg"
            style={{ background: slide.bgGradient }}
          >
            {slide.icon}
          </div>

          {/* Floating Badges */}
          {slide.floatingBadges.map((badge, idx) => (
            <div
              key={idx}
              className="onboarding-floating-badge"
              style={{
                top: badge.top,
                left: badge.left,
                right: badge.right,
                bottom: badge.bottom,
                animationDelay: `${idx * 0.4}s`
              }}
            >
              {isEn ? badge.textEn : badge.text}
            </div>
          ))}
        </div>
      </div>

      {/* Slide Content Box */}
      <div className="onboarding-content-box animate-slide-up" key={`content-${currentSlide}`}>
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
          className="btn btn-block btn-lg"
          onClick={handleNext}
          style={{
            background: currentSlide === slides.length - 1
              ? 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)'
              : 'var(--primary)',
            color: 'white',
            boxShadow: '0 8px 24px rgba(26, 86, 219, 0.3)'
          }}
        >
          <span>
            {currentSlide === slides.length - 1 
              ? (isEn ? 'Get Started' : 'শুরু করুন') 
              : (isEn ? 'Next' : 'পরবর্তী')}
          </span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
