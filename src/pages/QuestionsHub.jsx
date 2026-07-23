import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, ChevronRight, LayoutGrid } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { getLiveExams } from '../data/liveExams';
import { questionsData } from '../data/questionsData';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';

const categoryConfig = {
  bcs: { name: 'বিসিএস', nameEn: 'BCS', color: 'rgba(26, 86, 219, 0.05)', icon: '🎓' },
  bank: { name: 'ব্যাংক', nameEn: 'Bank', color: 'rgba(16, 185, 129, 0.05)', icon: '🏦' },
  ntrca: { name: 'NTRCA', nameEn: 'NTRCA', color: 'rgba(139, 92, 246, 0.05)', icon: '📜' },
  primary: { name: 'প্রাইমারি', nameEn: 'Primary', color: 'rgba(236, 72, 153, 0.05)', icon: '🏫' },
  ministry: { name: 'বিভিন্ন মন্ত্রনালয়', nameEn: 'Ministries', color: 'rgba(6, 182, 212, 0.05)', icon: '🏛️' }
};

export default function QuestionsHub() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state } = useAppContext();
  const isEn = state.language === 'en';

  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real-time states
  const [liveExams, setLiveExams] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [registrations, setRegistrations] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [liveTab, setLiveTab] = useState('live'); // 'live' | 'history'

  // Load state and setup clock ticker
  useEffect(() => {
    setLiveExams(getLiveExams());

    // Load registrations
    try {
      const saved = JSON.parse(localStorage.getItem('registered_exams')) || {};
      setRegistrations(saved);
    } catch (e) {
      console.error(e);
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getExamResult = (examId) => {
    try {
      const results = JSON.parse(localStorage.getItem('live_exam_results')) || {};
      return results[examId];
    } catch (e) {
      return null;
    }
  };

  const getExamStatus = (exam) => {
    const startMs = new Date(exam.startTime).getTime();
    const endMs = startMs + exam.duration * 60 * 1000;

    if (now >= startMs && now < endMs) {
      const isCompleted = getExamResult(exam.id);
      if (isCompleted) return { type: 'submitted', label: isEn ? 'Submitted' : 'অংশগ্রহণ করেছেন' };
      return { type: 'live', label: isEn ? 'Live Now' : 'লাইভ চলছে' };
    } else if (now < startMs) {
      return { type: 'upcoming', label: isEn ? 'Upcoming' : 'আসন্ন পরীক্ষা' };
    } else {
      return { type: 'ended', label: isEn ? 'Ended' : 'পরীক্ষা শেষ' };
    }
  };

  const getCountdownString = (startTimeStr) => {
    const startMs = new Date(startTimeStr).getTime();
    const diff = startMs - now;
    if (diff <= 0) return '';

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

  // 1.5. Everyday Score History Data
  const allResults = useMemo(() => {
    try {
      const results = JSON.parse(localStorage.getItem('live_exam_results')) || {};
      return Object.keys(results).map(examId => {
        const examMeta = liveExams.find(e => e.id === examId);
        return {
          id: examId,
          title: examMeta ? examMeta.title : 'লাইভ পরীক্ষা',
          titleEn: examMeta ? examMeta.titleEn : 'Live Exam',
          score: results[examId].score,
          total: results[examId].total,
          date: examMeta ? examMeta.startTime : new Date().toISOString()
        };
      }).sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (e) {
      return [];
    }
  }, [liveExams, now]);

  // Today's Live Leaderboard Data
  const todayLeaderboard = useMemo(() => {
    const baseList = [
      { name: 'সাদিয়া তাসনিম', nameEn: 'Sadia Tasnim', score: 94, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
      { name: 'মেহেদী হাসান', nameEn: 'Mehedi Hasan', score: 91, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
      { name: 'তন্ময় রায়', nameEn: 'Tonmoy Roy', score: 88, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' }
    ];

    try {
      const results = JSON.parse(localStorage.getItem('live_exam_results')) || {};
      const keys = Object.keys(results);
      if (keys.length > 0) {
        const latestKey = keys[keys.length - 1];
        const latestResult = results[latestKey];
        const scaledScore = Math.round((latestResult.score / latestResult.total) * 100);
        
        baseList.push({
          name: 'সুব্রত দাস (আপনি)',
          nameEn: 'Suvro (You)',
          score: scaledScore,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
          isCurrentUser: true
        });
      }
    } catch (e) {
      console.error(e);
    }

    return baseList.sort((a, b) => b.score - a.score);
  }, [now]);

  // Filtered Live Exams Data based on liveTab selector
  const filteredLiveExams = useMemo(() => {
    return liveExams.filter(exam => {
      const status = getExamStatus(exam);
      if (liveTab === 'live') {
        return status.type === 'live' || status.type === 'upcoming';
      } else {
        return status.type === 'ended' || status.type === 'submitted';
      }
    });
  }, [liveExams, liveTab, now]);

  // Filtered Question Papers Data
  const filteredPapers = useMemo(() => {
    let list = questionsData;
    if (activeCategory !== 'all') {
      list = list.filter(p => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        (p.title || '').toLowerCase().includes(q) || 
        (p.titleEn || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  return (
    <div className="page" style={{ paddingBottom: '100px', background: 'var(--bg)' }}>
      {/* Toast Alert popup */}
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
          fontSize: '12.5px',
          fontWeight: 700,
          zIndex: 9999,
          animation: 'slideDown 0.3s ease'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/home')}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800 }}>
          {isEn ? 'Live MCQ Exam & Questions' : 'Live MCQ Exam ও প্রশ্নব্যাংক'}
        </h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        
        {/* SECTION 1: Live MCQ Exam */}
        <div style={{ marginBottom: '24px' }}>
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <h3 className="section-title" style={{
              color: 'var(--text-secondary)',
              background: 'rgba(26, 86, 219, 0.04)',
              borderLeft: '4px solid var(--primary)',
              padding: '6px 14px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '13.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>{isEn ? 'Live MCQ Exam' : 'লাইভ এমসিকিউ পরীক্ষা'}</span>
            </h3>
          </div>

          {/* Tab Selector */}
          <div style={{
            display: 'flex',
            background: 'var(--white)',
            borderBottom: '1px solid var(--border-light)',
            padding: '0 8px',
            borderRadius: '12px',
            marginBottom: '16px'
          }}>
            <button
              onClick={() => setLiveTab('live')}
              style={{
                flex: 1,
                padding: '12px 0',
                background: 'transparent',
                border: 'none',
                borderBottom: liveTab === 'live' ? '3px solid var(--primary)' : '3px solid transparent',
                color: liveTab === 'live' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '12.5px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {isEn ? 'Live & Upcoming' : 'লাইভ ও আসন্ন'}
            </button>
            <button
              onClick={() => setLiveTab('history')}
              style={{
                flex: 1,
                padding: '12px 0',
                background: 'transparent',
                border: 'none',
                borderBottom: liveTab === 'history' ? '3px solid var(--primary)' : '3px solid transparent',
                color: liveTab === 'history' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '12.5px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {isEn ? 'Exam History & Results' : 'পরীক্ষার ইতিহাস ও ফলাফল'}
            </button>
          </div>

          {/* Sleek Regulations Card (Only shown in Live tab) */}
          {liveTab === 'live' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.09) 0%, rgba(220, 38, 38, 0.04) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: '20px',
              padding: '18px',
              marginBottom: '20px',
              boxShadow: '0 4px 20px rgba(239, 68, 68, 0.03)'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#991b1b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>{isEn ? 'Live Exam Regulations' : 'লাইভ পরীক্ষার নিয়াবলী'}</span>
              </h3>
              <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#b91c1c', fontWeight: 500, margin: 0 }}>
                {isEn 
                  ? 'Participate in real-time competitive exams. The exam starts exactly at the scheduled time. Results will be calculated instantly upon submission.'
                  : 'নির্ধারিত সময়ে সরাসরি লাইভ পরীক্ষায় অংশ নিন। পরীক্ষা শুরু হওয়ার পর সময়ের মধ্যে সাবমিট করতে হবে। সময় শেষ হলে স্বয়ংক্রিয়ভাবে সাবমিট হয়ে যাবে।'}
              </p>
            </div>
          )}

          {/* Exams List Container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
            {filteredLiveExams.map(exam => {
              const status = getExamStatus(exam);
              const isRegistered = !!registrations[exam.id];
              const result = getExamResult(exam.id);

              return (
                <div
                  key={exam.id}
                  className="animate-slide-up"
                  style={{
                    background: 'var(--white)',
                    border: status.type === 'live' 
                      ? '1.5px solid var(--primary)' 
                      : '1px solid var(--border-light)',
                    borderRadius: '20px',
                    padding: '20px',
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Visual Status Indicator Line */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: status.type === 'live' 
                      ? 'linear-gradient(90deg, #3b82f6, #2563eb)' 
                      : status.type === 'upcoming' 
                        ? 'linear-gradient(90deg, #f59e0b, #d97706)' 
                        : 'linear-gradient(90deg, #94a3b8, #cbd5e1)'
                  }}></div>

                  {/* Card Header row 1: Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    {/* Status Badge */}
                    {status.type === 'live' && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: 'var(--primary)',
                        background: 'rgba(26, 86, 219, 0.08)',
                        padding: '5px 12px',
                        borderRadius: '30px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--primary)',
                          display: 'inline-block',
                          animation: 'pulse 1.5s infinite'
                        }}></span>
                        {isEn ? 'LIVE NOW' : 'লাইভ চলছে'}
                      </span>
                    )}

                    {status.type === 'upcoming' && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: '#b45309',
                        background: 'rgba(245, 158, 11, 0.12)',
                        padding: '5px 12px',
                        borderRadius: '30px'
                      }}>
                        {isEn ? 'UPCOMING' : 'আসন্ন পরীক্ষা'}
                      </span>
                    )}

                    {(status.type === 'ended' || status.type === 'submitted') && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: 'var(--text-muted)',
                        background: 'var(--bg-secondary)',
                        padding: '5px 12px',
                        borderRadius: '30px'
                      }}>
                        {isEn ? 'COMPLETED' : 'শেষ হয়েছে'}
                      </span>
                    )}

                    {/* Duration Badge */}
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: 'var(--primary)',
                      background: 'rgba(26, 86, 219, 0.06)',
                      padding: '5px 12px',
                      borderRadius: '30px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {isEn ? `${exam.duration} Mins` : `${toBengaliNumber(exam.duration)} মিনিট`}
                    </span>
                  </div>

                  {/* Card Header row 2: Start Date & Countdown (Upcoming Only) */}
                  {status.type === 'upcoming' && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg-secondary)',
                      border: '1.5px solid var(--border-light)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      marginBottom: '14px'
                    }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {new Date(exam.startTime).toLocaleString(isEn ? 'en-US' : 'bn-BD', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                          {isEn ? 'Left:' : 'বাকি:'}
                        </span>
                        <span style={{ fontFamily: 'monospace' }}>
                          {getCountdownString(exam.startTime)}
                        </span>
                      </span>
                    </div>
                  )}

                  <h4 style={{
                    fontSize: '14.5px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '14px',
                    lineHeight: '1.4'
                  }}>
                    {isEn ? exam.titleEn : exam.title}
                  </h4>

                  {/* Subjects & Topics separately */}
                  <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '14px',
                    padding: '14px',
                    marginBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {exam.subjectTopics && exam.subjectTopics.length > 0 ? (
                      exam.subjectTopics.map((st, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', borderLeft: '3px solid var(--primary)', paddingLeft: '8px' }}>
                            {isEn ? st.subjectEn : st.subject}
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', paddingLeft: '4px' }}>
                            {(isEn ? st.topicsEn : st.topics)?.split(',').map((t, tIdx) => (
                              <span key={tIdx} style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                background: 'var(--white)',
                                border: '1px solid var(--border-light)',
                                color: 'var(--text-secondary)',
                                padding: '3px 8px',
                                borderRadius: '6px'
                              }}>
                                {t.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700, borderLeft: '3px solid var(--primary)', paddingLeft: '8px' }}>
                          {isEn ? exam.subjectsEn || 'General' : exam.subjects || 'সাধারণ'}
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {(isEn ? exam.topicsEn : exam.topics)?.split(',').map((t, idx) => (
                            <span key={idx} style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              background: 'var(--white)',
                              border: '1px solid var(--border-light)',
                              color: 'var(--text-secondary)',
                              padding: '3px 8px',
                              borderRadius: '6px'
                            }}>
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    
                    {status.type === 'upcoming' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                        <button
                          onClick={() => handleRegister(exam.id)}
                          style={{
                            width: 'auto',
                            padding: '10px 24px',
                            borderRadius: '12px',
                            border: isRegistered ? '1.5px solid #10b981' : 'none',
                            background: isRegistered ? 'rgba(16, 185, 129, 0.05)' : 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
                            color: isRegistered ? '#047857' : 'white',
                            fontWeight: 800,
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: isRegistered ? 'none' : '0 4px 14px rgba(26, 86, 219, 0.15)'
                          }}
                        >
                          {isRegistered ? (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '2px' }}>
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              <span>{isEn ? 'Registered & Participating' : 'অংশগ্রহণ নিশ্চিত করা হয়েছে'}</span>
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '2px' }}>
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                              </svg>
                              <span>{isEn ? 'Participate in Exam' : 'পরীক্ষায় অংশগ্রহণ করুন'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {status.type === 'live' && (
                      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <button
                          onClick={() => navigate(`/live-exam-room/${exam.id}`)}
                          style={{
                            width: 'auto',
                            padding: '10px 28px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: 'white',
                            fontWeight: 800,
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.2)'
                          }}
                        >
                          {isEn ? 'Enter Exam Room Now' : 'পরীক্ষায় অংশ নিন (লাইভ)'} ➔
                        </button>
                      </div>
                    )}

                    {(status.type === 'ended' || status.type === 'submitted') && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {result ? (
                          <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 800 }}>
                            🏆 {isEn 
                              ? `Score: ${result.score}/${result.total}`
                              : `স্কোর: ${toBengaliNumber(result.score)}/${toBengaliNumber(result.total)}`}
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                            {isEn ? 'You did not attend' : 'আপনি অংশ নেননি'}
                          </span>
                        )}

                        <button
                          onClick={() => navigate(`/live-exam-room/${exam.id}`)}
                          style={{
                            width: 'auto',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            border: '1px solid var(--border)',
                            background: 'var(--white)',
                            color: 'var(--text-secondary)',
                            fontWeight: 800,
                            fontSize: '11.5px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>📊 {isEn ? 'Results' : 'ফলাফল ও র‍্যাংক'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Q&A Categories (Same Grid Style as Job Categories) */}
        <div style={{ marginBottom: '24px' }}>
          <div className="section-header" style={{ marginBottom: '14px' }}>
            <h3 className="section-title" style={{
              color: 'var(--text-secondary)',
              background: 'rgba(26, 86, 219, 0.04)',
              borderLeft: '4px solid var(--primary)',
              padding: '6px 14px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '13.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>{isEn ? 'Question Bank Categories' : 'প্রশ্নব্যাংক ক্যাটাগরি'}</span>
            </h3>
          </div>

          <div className="category-grid">
            <div
              className="category-grid-item"
              style={{
                background: activeCategory === 'all' ? 'var(--primary-lightest)' : 'var(--white)',
                border: activeCategory === 'all' ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                borderRadius: '14px',
                padding: '12px 8px',
                boxShadow: activeCategory === 'all' ? '0 4px 12px rgba(26, 86, 219, 0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setActiveCategory('all')}
            >
              <div className="category-grid-icon" style={{ background: 'rgba(26, 86, 219, 0.06)', color: 'var(--primary)', width: '36px', height: '36px', borderRadius: '10px' }}>
                <LayoutGrid size={18} />
              </div>
              <span className="category-grid-label" style={{ fontWeight: activeCategory === 'all' ? 700 : 500, fontSize: '11px', color: 'var(--text-secondary)' }}>
                {isEn ? 'All' : 'সব প্রশ্ন'}
              </span>
            </div>

            {Object.keys(categoryConfig).map(key => {
              const cat = categoryConfig[key];
              const isActive = activeCategory === key;
              return (
                <div
                  key={key}
                  className="category-grid-item"
                  style={{
                    background: isActive ? 'var(--primary-lightest)' : 'var(--white)',
                    border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                    borderRadius: '14px',
                    padding: '12px 8px',
                    boxShadow: isActive ? '0 4px 12px rgba(26, 86, 219, 0.08)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setActiveCategory(key)}
                >
                  <div className="category-grid-icon" style={{ background: cat.color, color: 'var(--primary)', fontSize: '16px', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cat.icon}
                  </div>
                  <span className="category-grid-label" style={{ fontWeight: isActive ? 700 : 500, fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {isEn ? cat.nameEn : cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Question Papers List (Searchable) */}
        <div>
          <div style={{ marginBottom: '14px' }}>
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? "Search inside question bank..." : "প্রশ্নব্যাংকে খুঁজুন..."}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredPapers.length > 0 ? (
              filteredPapers.map(paper => (
                <div
                  key={paper.id}
                  style={{
                    background: 'var(--white)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '14px',
                    padding: '14px',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => navigate(`/question-details/${paper.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'var(--primary-lightest)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {categoryConfig[paper.category]?.icon || '📚'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        marginBottom: '4px',
                        lineHeight: '1.4'
                      }}>
                        {isEn ? paper.titleEn : paper.title}
                      </h3>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                        <span style={{
                          fontSize: '10px',
                          color: 'var(--primary)',
                          background: 'rgba(26, 86, 219, 0.05)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px' }}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          {isEn ? paper.dateEn : paper.date}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          color: '#059669',
                          background: 'rgba(16, 185, 129, 0.05)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px' }}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                          </svg>
                          {isEn ? `${paper.questions.length} Questions` : `${toBengaliNumber(paper.questions.length)}টি প্রশ্ন`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-light)',
                    marginTop: '4px'
                  }}>
                    <span style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {isEn ? `Time: ${paper.timeLimitEn}` : `সময়: ${paper.timeLimit}`}
                    </span>
                    
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>{isEn ? 'Practice Now' : 'অনুশীলন করুন'}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px', opacity: 0.5 }}>
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                <p style={{ fontSize: '13px', fontWeight: 600 }}>
                  {isEn ? 'No question papers found' : 'কোনো প্রশ্নপত্র পাওয়া যায়নি'}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const engNum = String(num);
  const bengaliDigits = {'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'};
  return engNum.split('').map(digit => bengaliDigits[digit] || digit).join('');
};
