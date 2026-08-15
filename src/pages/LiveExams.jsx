import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { getLiveExams } from '../data/liveExams';
import BottomNav from '../components/BottomNav';
import PullToRefresh from '../components/PullToRefresh';

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

    // If exam is explicitly marked as active/running by Admin
    if (exam.status === 'active' || exam.status === 'running') {
      if (userResult) return 'completed';
      const startMs = parseExamDate(exam.startTime) || parseExamDate(exam.scheduledAt) || parseExamDate(exam.createdAt);
      if (!startMs) return 'running';
      const durationMins = typeof exam.duration === 'number' ? exam.duration : (parseInt(exam.duration) || 60);
      const endMs = startMs + durationMins * 60 * 1000;
      if (now < startMs) return 'upcoming';
      return 'running';
    }

    if (userResult) return 'completed';

    const startMs = parseExamDate(exam.startTime) || parseExamDate(exam.scheduledAt) || parseExamDate(exam.createdAt);
    if (!startMs) return 'running';

    const durationMins = typeof exam.duration === 'number' ? exam.duration : (parseInt(exam.duration) || 60);
    const endMs = startMs + durationMins * 60 * 1000;

    if (now >= startMs && now < endMs) {
      return 'running';
    } else if (now < startMs) {
      return 'upcoming';
    } else {
      return 'completed';
    }
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
      return results[examId];
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

      {/* Tab Selector */}
      <div style={{
        display: 'flex',
        background: 'var(--white)',
        borderBottom: '1px solid var(--border-light)',
        padding: '0 8px'
      }}>
        <button
          onClick={() => setActiveTab('live')}
          style={{
            flex: 1,
            padding: '14px 0',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'live' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'live' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isEn ? 'Live & Upcoming' : 'লাইভ ও আসন্ন'}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            flex: 1,
            padding: '14px 0',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'history' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isEn ? 'Exam History & Results' : 'পরীক্ষার ইতিহাস ও ফলাফল'}
        </button>
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
        <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        
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

        {/* Exams List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredExams.map(exam => {
            const status = getExamStatus(exam);
            const startMs = new Date(exam.startTime).getTime();
            const result = getExamResult(exam.id);
            const isRegistered = !!registrations[exam.id];

            // Define colors dynamically based on status
            const theme = status === 'running'
              ? {
                  borderLeft: '4px solid #ef4444',
                  badgeColor: '#dc2626',
                  badgeBg: '#fee2e2',
                  accentColor: '#ef4444',
                  boxBg: 'rgba(239, 68, 68, 0.03)'
                }
              : status === 'upcoming'
                ? {
                    borderLeft: '4px solid #d97706',
                    badgeColor: '#b45309',
                    badgeBg: '#fef3c7',
                    accentColor: '#d97706',
                    boxBg: '#fffbeb'
                  }
                : {
                    borderLeft: '4px solid #64748b',
                    badgeColor: '#475569',
                    badgeBg: '#f1f5f9',
                    accentColor: '#64748b',
                    boxBg: '#f8fafc'
                  };

            return (
              <div
                key={exam.id}
                style={{
                  background: 'var(--white)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  borderLeft: theme.borderLeft,
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.02)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  alignItems: 'stretch',
                  transition: 'all 0.3s'
                }}
              >
                {/* LEFT COLUMN (50%) */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    {/* Status Badge */}
                    {status === 'running' && (
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        color: theme.badgeColor,
                        background: theme.badgeBg,
                        padding: '4px 10px',
                        borderRadius: '30px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: '#ef4444',
                          display: 'inline-block',
                          animation: 'pulse 1.5s infinite'
                        }}></span>
                        {isEn ? 'LIVE NOW' : 'লাইভ চলছে'}
                      </span>
                    )}

                    {status === 'upcoming' && (
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        color: theme.badgeColor,
                        background: theme.badgeBg,
                        padding: '4px 10px',
                        borderRadius: '30px'
                      }}>
                        {isEn ? 'UPCOMING' : 'আসন্ন পরীক্ষা'}
                      </span>
                    )}

                    {status === 'completed' && (
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        color: theme.badgeColor,
                        background: theme.badgeBg,
                        padding: '4px 10px',
                        borderRadius: '30px'
                      }}>
                        {isEn ? 'COMPLETED' : 'শেষ হয়েছে'}
                      </span>
                    )}

                    {/* Exam Title */}
                    <h4 style={{
                      fontSize: '13.5px',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      margin: '8px 0 6px 0',
                      lineHeight: '1.3'
                    }}>
                      {isEn ? exam.titleEn : exam.title}
                    </h4>

                    {/* Subjects & Topics Box */}
                    <div style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '10px',
                      padding: '8px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      border: '1px solid var(--border-light)'
                    }}>
                      {exam.subjectTopics && exam.subjectTopics.length > 0 ? (
                        exam.subjectTopics.map((st, idx) => {
                          const subjText = safeStringify(isEn ? st.subjectEn : st.subject, 'General');
                          const rawTopics = isEn ? st.topicsEn : st.topics;
                          const topicsList = Array.isArray(rawTopics) 
                            ? rawTopics.map(t => safeStringify(t)) 
                            : safeStringify(rawTopics).split(',').map(t => t.trim()).filter(Boolean);

                          return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span style={{ fontSize: '9.5px', color: theme.accentColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3px', borderLeft: `2px solid ${theme.accentColor}`, paddingLeft: '5px' }}>
                                {subjText}
                              </span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                                {topicsList.map((t, tIdx) => (
                                  <span key={tIdx} style={{
                                    fontSize: '9px',
                                    fontWeight: 600,
                                    background: 'var(--white)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-primary)',
                                    padding: '1.5px 6px',
                                    borderRadius: '4px'
                                  }}>
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontSize: '9.5px', color: theme.accentColor, fontWeight: 800, borderLeft: `2px solid ${theme.accentColor}`, paddingLeft: '5px' }}>
                            {safeStringify(isEn ? exam.subjectsEn || 'General' : exam.subjects || 'সাধারণ')}
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                            {(Array.isArray(isEn ? exam.topicsEn : exam.topics)
                              ? (isEn ? exam.topicsEn : exam.topics)
                              : safeStringify(isEn ? exam.topicsEn : exam.topics).split(',').map(t => t.trim()).filter(Boolean)
                            ).map((t, idx) => (
                              <span key={idx} style={{
                                fontSize: '9px',
                                fontWeight: 600,
                                background: 'var(--white)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-primary)',
                                padding: '1.5px 6px',
                                borderRadius: '4px'
                              }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Left Info / Score */}
                  <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
                    {status === 'completed' && (
                      result ? (
                        <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 800 }}>
                          🏆 {isEn 
                            ? `Score: ${result.score}/${result.total}`
                            : `স্কোর: ${toBengaliNumber(result.score)}/${toBengaliNumber(result.total)}`}
                        </div>
                      ) : (
                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>
                          {isEn ? 'Did not attend' : 'আপনি অংশ নেননি'}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN (50%) */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'right' }}>
                  {/* Top Right Duration Badge */}
                  <span style={{
                    fontSize: '9.5px',
                    fontWeight: 800,
                    color: '#2563eb',
                    background: 'rgba(37, 99, 235, 0.08)',
                    padding: '4px 10px',
                    borderRadius: '30px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    {isEn ? `${exam.duration} Mins` : `${toBengaliNumber(exam.duration)} মিনিট`}
                  </span>

                  {/* Countdown Timer for Upcoming Exams */}
                  {status === 'upcoming' && (
                    <div style={{ background: theme.boxBg, borderRadius: '8px', padding: '6px 8px', marginTop: '6px', textAlign: 'right' }}>
                      <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#d97706', display: 'block' }}>
                        {isEn ? 'Left: ' : 'বাকি: '}
                        <span style={{ fontFamily: 'monospace' }}>
                          {getCountdownString(startMs)}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Bottom Right Action Button */}
                  <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                    {status === 'completed' && (
                      <button
                        onClick={() => navigate(`/live-exam-room/${exam.id}`)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '10px',
                          border: '1px solid rgba(226, 232, 240, 0.9)',
                          background: 'var(--white)',
                          color: 'var(--primary)',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {isEn ? 'Solutions & Leaderboard' : 'ফলাফল ও লিডারবোর্ড'}
                      </button>
                    )}

                    {status === 'running' && (
                      <button
                        onClick={() => navigate(`/live-exam-room/${exam.id}`)}
                        style={{
                          padding: '8px 18px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          fontWeight: 800,
                          fontSize: '11px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(239, 68, 68, 0.15)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {isEn ? 'Enter Exam' : 'পরীক্ষায় অংশ নিন'} ➔
                      </button>
                    )}

                    {status === 'upcoming' && (
                      <button
                        onClick={() => handleRegister(exam.id)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '10px',
                          border: isRegistered ? '1px solid #10b981' : 'none',
                          background: isRegistered ? '#ecfdf5' : 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)',
                          color: isRegistered ? '#065f46' : 'white',
                          fontWeight: 800,
                          fontSize: '11px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {isRegistered ? (isEn ? 'Registered' : 'রেজিস্টার্ড') : (isEn ? 'Participate' : 'অংশগ্রহণ করুন')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredExams.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📅</span>
              <p style={{ fontSize: '14px', fontWeight: 600 }}>
                {activeTab === 'live'
                  ? (isEn ? 'No live or upcoming exams' : 'কোনো লাইভ বা আসন্ন পরীক্ষা নেই')
                  : (isEn ? 'No exam history found' : 'কোনো পরীক্ষার ইতিহাস পাওয়া যায়নি')}
              </p>
            </div>
          )}
        </div>
      </div>
      </PullToRefresh>

      <BottomNav />
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
