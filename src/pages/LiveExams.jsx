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

  const tabs = [
    { id: 'live', label: isEn ? 'Live Exams' : 'লাইভ পরীক্ষা' },
    { id: 'history', label: isEn ? 'Exam History' : 'পরীক্ষার ইতিহাস' }
  ];

  const handleTabChange = (tab) => {
    if (activeTab === tab) return;
    setActiveTab(tab);
  };

  // Ticks the clock every second and reads databases reactively
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

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [adminState.liveExams]);

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

  const handleRegister = (examId) => {
    const next = { ...registrations, [examId]: !registrations[examId] };
    setRegistrations(next);
    localStorage.setItem('registered_exams', JSON.stringify(next));

    const msg = next[examId]
      ? (isEn ? 'Registration successful for the live exam!' : 'লাইভ পরীক্ষার জন্য রেজিস্ট্রেশন সম্পন্ন হয়েছে!')
      : (isEn ? 'Registration cancelled.' : 'রেজিস্ট্রেশন বাতিল করা হয়েছে।');

    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

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
    <div className="page" style={{ paddingBottom: '100px', background: 'var(--bg-secondary)' }}>
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

      {/* Modern GPU-Accelerated Tab Selector */}
      <div style={{ padding: '8px 14px', background: 'var(--white)', borderBottom: '1px solid var(--border-light)' }}>
        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
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
                borderRadius: '20px',
                padding: '18px',
                marginBottom: '20px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span>{isEn ? 'Live Exam Regulations' : 'লাইভ পরীক্ষার নিয়াবলী'}</span>
                </h3>
                <p style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>
                  {isEn 
                    ? 'Participate in real-time competitive exams. The exam starts exactly at the scheduled time. Results will be calculated instantly upon submission.'
                    : 'নির্ধারিত সময়ে সরাসরি লাইভ পরীক্ষায় অংশ নিন। পরীক্ষা শুরু হওয়ার পর সময়ের মধ্যে সাবমিট করতে হবে। সময় শেষ হলে স্বয়ংক্রিয়ভাবে সাবমিট হয়ে যাবে।'}
                </p>
              </div>
            )}

            {/* Exams List: 2-Column Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
              minHeight: '220px'
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
                      : getCountdownString(startMs)}
                    isRegistered={isRegistered}
                    result={result}
                    isEn={isEn}
                    onRegister={handleRegister}
                    onEnter={(id) => navigate(`/live-exam-room/${id}`)}
                    onViewResult={(id) => navigate(`/live-exam-room/${id}`)}
                  />
                );
              })}

              {filteredExams.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📅</span>
                  <p style={{ fontSize: '14px', fontWeight: 600 }}>
                    {activeTab === 'live'
                      ? (isEn ? 'No live or upcoming exams' : 'কোনো লাইভ বা আসন্ন পরীক্ষা নেই')
                      : (isEn ? 'No exam history found' : 'কোনো পরীক্ষার ইতিহাস পাওয়া যায়নি')}
                  </p>
                </div>
              )}
            </div>
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
