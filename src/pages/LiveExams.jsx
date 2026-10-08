import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { getLiveExams } from '../data/liveExams';
import PullToRefresh from '../components/PullToRefresh';
import ModernLoader from '../components/ModernLoader';
import LiveExamCard from '../components/LiveExamCard';
import TabBar, { TabContent } from '../components/TabBar';

export default function LiveExams() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { state: adminState, refreshData } = useAdminContext();
  const isEn = state.language === 'en';
  
  const [exams, setExams] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [registrations, setRegistrations] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'history'
  const [isTabLoading, setIsTabLoading] = useState(true);
  const tabTimerRef = React.useRef(null);

  const tabs = [
    { id: 'live', label: isEn ? 'Live Exams' : 'লাইভ পরীক্ষা' },
    { id: 'history', label: isEn ? 'Exam History' : 'পরীক্ষার ইতিহাস' }
  ];

  // Initial entry: show the modern loader briefly, then reveal the exam list
  useEffect(() => {
    tabTimerRef.current = setTimeout(() => setIsTabLoading(false), 150);
    return () => clearTimeout(tabTimerRef.current);
  }, []);

  const handleTabChange = (tab) => {
    if (activeTab === tab) return;
    // Switch section instantly (header, indicator, info card), list shows loader
    setIsTabLoading(true);
    setActiveTab(tab);
    clearTimeout(tabTimerRef.current);
    tabTimerRef.current = setTimeout(() => setIsTabLoading(false), 180);
  };

  // Update exams and registrations
  useEffect(() => {
    if (Array.isArray(adminState.liveExams)) {
      setExams(adminState.liveExams);
    } else {
      setExams(getLiveExams());
    }

    try {
      const saved = JSON.parse(localStorage.getItem('registered_exams')) || {};
      setRegistrations(saved);
    } catch (e) {
      console.error(e);
    }
  }, [adminState.liveExams]);

  // Ticks the clock every second ONLY when activeTab is 'live'
  useEffect(() => {
    if (activeTab !== 'live') return;

    setNow(Date.now());
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [activeTab]);

  const parseExamDate = (dateVal) => {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? null : d.getTime();
  };

  const getExamStatus = (exam) => {
    if (!exam) return 'completed';

    const userResult = getExamResult(exam.id);
    const startMs = parseExamDate(exam.scheduledAt) || parseExamDate(exam.startTime);
    const durationMins = typeof exam.duration === 'number' ? exam.duration : (parseInt(exam.duration) || 60);

    if (startMs) {
      const endMs = startMs + durationMins * 60 * 1000;
      if (now >= endMs) {
        return 'completed';
      }
      if (now < startMs) {
        return 'upcoming';
      }
      if (userResult) return 'completed';
      return 'running';
    }

    if (exam.status === 'completed' || exam.status === 'ended') {
      return 'completed';
    }
    if (exam.status === 'scheduled' || exam.status === 'upcoming') {
      return 'upcoming';
    }
    if (userResult) return 'completed';
    return 'running';
  };

  const getCountdownString = (startTimeMs) => {
    const diff = startTimeMs - now;
    if (diff <= 0) {
      return isEn ? '0m 00s' : '০মি: ০০সে:';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (num) => String(num).padStart(2, '0');

    if (hours > 0) {
      return isEn 
        ? `${hours}h ${pad(mins)}m ${pad(secs)}s` 
        : `${toBengaliNumber(hours)}ঘণ্টা ${toBengaliNumber(mins)}মি: ${toBengaliNumber(secs)}সে:`;
    } else {
      return isEn
        ? `${mins}m ${pad(secs)}s`
        : `${toBengaliNumber(mins)}মি: ${toBengaliNumber(secs)}সে:`;
    }
  };

  const handleRegister = React.useCallback((examId) => {
    setRegistrations(prev => {
      const next = { ...prev, [examId]: !prev[examId] };
      localStorage.setItem('registered_exams', JSON.stringify(next));

      const msg = next[examId]
        ? (isEn ? 'Registration successful for the live exam!' : 'লাইভ পরীক্ষার জন্য রেজিস্ট্রেশন সম্পন্ন হয়েছে!')
        : (isEn ? 'Registration cancelled.' : 'রেজিস্ট্রেশন বাতিল করা হয়েছে।');

      setToastMessage(msg);
      setTimeout(() => setToastMessage(''), 3000);
      return next;
    });
  }, [isEn]);

  const handleEnter = React.useCallback((id) => {
    navigate(`/live-exam-room/${id}`);
  }, [navigate]);

  const handleViewResult = React.useCallback((id) => {
    navigate(`/live-exam-room/${id}`);
  }, [navigate]);

  const getExamResult = (examId) => {
    try {
      const results = JSON.parse(localStorage.getItem('live_exam_results')) || {};
      const res = results[examId];
      if (!res || res.didNotAttend) return null;
      const answersObj = res.answers || {};
      if (Object.keys(answersObj).length === 0 && !res.submittedAt && !res.score) {
        return null;
      }
      return res;
    } catch (e) {
      return null;
    }
  };

  // Filter exams based on selected Tab
  const filteredExams = exams.filter(exam => {
    const status = getExamStatus(exam);
    if (activeTab === 'live') {
      return status === 'running' || status === 'upcoming';
    } else {
      return status === 'completed';
    }
  });

  return (
    <div className="page" style={{
      paddingBottom: '100px',
      background: 'var(--bg-secondary)',
      WebkitOverflowScrolling: 'touch',
      overscrollBehaviorY: 'contain'
    }}>
      {/* Header */}
      <div className="page-header" style={{ borderBottom: 'none' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span>{isEn ? 'Live MCQ Exam' : 'লাইভ এমসিকিউ পরীক্ষা'}</span>
        </h1>
      </div>

      {/* Native Full-Width Sliding Underline Tab Bar */}
      <div style={{
        display: 'flex',
        background: 'var(--white)',
        borderBottom: '1px solid var(--border-light)',
        position: 'sticky',
        top: 'calc(52px + var(--safe-area-top))',
        zIndex: 40,
        userSelect: 'none'
      }}>
        <button
          onClick={() => handleTabChange('live')}
          type="button"
          style={{
            flex: 1,
            padding: '13px 0',
            background: 'transparent',
            border: 'none',
            color: activeTab === 'live' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'color 0.22s ease'
          }}
        >
          {isEn ? 'Live' : 'লাইভ'}
        </button>
        <button
          onClick={() => handleTabChange('history')}
          type="button"
          style={{
            flex: 1,
            padding: '13px 0',
            background: 'transparent',
            border: 'none',
            color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'color 0.22s ease'
          }}
        >
          {isEn ? 'History' : 'ইতিহাস'}
        </button>

        {/* Smooth Sliding Underline Indicator */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '50%',
          height: '3px',
          background: 'var(--primary)',
          borderRadius: '3px 3px 0 0',
          transform: activeTab === 'live' ? 'translate3d(0%, 0, 0)' : 'translate3d(100%, 0, 0)',
          transition: 'transform 0.30s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform'
        }} />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--primary)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '30px',
          boxShadow: '0 8px 30px rgba(26, 86, 219, 0.3)',
          fontSize: '12px',
          fontWeight: 700,
          zIndex: 9999,
          animation: 'slideDown 0.3s ease'
        }}>
          {toastMessage}
        </div>
      )}

      <PullToRefresh onRefresh={refreshData}>
        <div className="page-content" style={{ padding: '16px' }}>
          <TabContent activeTab={activeTab} tabs={tabs}>
            {/* Sleek, Premium Regulations Card (Only shown in Live tab) */}
            {activeTab === 'live' && (
              <div style={{
                background: 'var(--primary-bg)',
                border: '1px solid var(--chip-primary-border)',
                borderRadius: '14px',
                padding: '12px 14px',
                marginBottom: '14px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span>{isEn ? 'Live Exam Regulations' : 'লাইভ পরীক্ষার নিয়াবলী'}</span>
                </h3>
                <p style={{ fontSize: '11px', lineHeight: 1.5, color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>
                  {isEn 
                    ? 'Participate in real-time competitive exams. The exam starts exactly at the scheduled time. Results will be calculated instantly upon submission.'
                    : 'নির্ধারিত সময়ে সরাসরি লাইভ পরীক্ষায় অংশ নিন। পরীক্ষা শুরু হওয়ার পর সময়ের মধ্যে সাবমিট করতে হবে। সময় শেষ হলে স্বয়ংক্রিয়ভাবে সাবমিট হয়ে যাবে।'}
                </p>
              </div>
            )}

            {/* Sleek, Matching History Overview Card (History tab) */}
            {activeTab === 'history' && (
              <div style={{
                background: 'var(--primary-bg)',
                border: '1px solid var(--chip-primary-border)',
                borderRadius: '14px',
                padding: '12px 14px',
                marginBottom: '14px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>{isEn ? 'Exam History & Past Results' : 'পরীক্ষার ইতিহাস ও পূর্ববর্তী ফলাফল'}</span>
                </h3>
                <p style={{ fontSize: '11px', lineHeight: 1.5, color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>
                  {isEn 
                    ? 'Review your attended live exams, scores, merit positions, and detailed answer explanations. Tap on any completed exam below.'
                    : 'আপনার সম্পন্ন করা সকল লাইভ পরীক্ষার ফলাফল, মেধা স্কোর ও বিস্তারিত সমাধান দেখুন। ফলাফল দেখতে নিচের যেকোনো কার্ডে ট্যাপ করুন।'}
                </p>
              </div>
            )}

            {/* Exams Content Area */}
            {isTabLoading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                minHeight: '280px',
                padding: '60px 0',
                boxSizing: 'border-box'
              }}>
                <ModernLoader size="md" icon={activeTab === 'live' ? '⏱️' : '📜'} />
              </div>
            ) : filteredExams.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                minHeight: '240px',
                textAlign: 'center',
                padding: '50px 20px',
                color: 'var(--text-muted)',
                boxSizing: 'border-box'
              }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📅</span>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>
                  {activeTab === 'live'
                    ? (isEn ? 'No live or upcoming exams' : 'কোনো লাইভ বা আসন্ন পরীক্ষা নেই')
                    : (isEn ? 'No exam history found' : 'কোনো পরীক্ষার ইতিহাস পাওয়া যায়নি')}
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                alignItems: 'start',
                contain: 'content',
                WebkitOverflowScrolling: 'touch'
              }}>
                {filteredExams.map(exam => {
                  const status = getExamStatus(exam);
                  const startMs = parseExamDate(exam.scheduledAt) || parseExamDate(exam.startTime) || parseExamDate(exam.createdAt) || Date.now();
                  const result = getExamResult(exam.id);
                  const isRegistered = !!registrations[exam.id];
                  const durationMins = typeof exam.duration === 'number' ? exam.duration : (parseInt(exam.duration) || 60);

                  return (
                    <LiveExamCard
                      key={exam.id}
                      exam={exam}
                      status={status}
                      startMs={startMs}
                      countdownStr={status === 'running' 
                        ? getCountdownString(startMs + durationMins * 60 * 1000)
                        : (status === 'upcoming' ? getCountdownString(startMs) : '')}
                      isRegistered={isRegistered}
                      result={result}
                      isEn={isEn}
                      onRegister={handleRegister}
                      onEnter={handleEnter}
                      onViewResult={handleViewResult}
                    />
                  );
                })}
              </div>
            )}
          </TabContent>
        </div>
      </PullToRefresh>

    </div>
  );
}

const safeStringify = (val, fallback = '') => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) return val.map(v => safeStringify(v)).join(', ');
  if (typeof val === 'object') {
    if (typeof val.name === 'string') return val.name;
    if (typeof val.title === 'string') return val.title;
    if (typeof val.text === 'string') return val.text;
  }
  return fallback;
};

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const engNum = safeStringify(num);
  const bengaliDigits = {'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'};
  return engNum.split('').map(digit => bengaliDigits[digit] || digit).join('');
};
