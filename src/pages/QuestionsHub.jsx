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
              <span>🔴</span>
              <span>{isEn ? 'Live MCQ Exam' : 'লাইভ এমসিকিউ পরীক্ষা'}</span>
            </h3>
            <button onClick={() => navigate('/live-exams')} className="section-link" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
              <span>{isEn ? 'See All' : 'সব দেখুন'}</span>
              <span style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center' }}>➔</span>
            </button>
          </div>

          {/* Live MCQ Exam Activity & Performance Dashboard */}
          <div style={{
            background: 'var(--white)',
            border: '1px solid var(--border-light)',
            borderRadius: '18px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 8px 20px -6px rgba(0, 0, 0, 0.02)'
          }}>
            {/* Top row: Joined Candidates stats */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="pulse-dot" style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)' }}>
                  {isEn ? '12,450 Candidates Joined Today' : 'আজকে অংশগ্রহণ করছেন: ১২,৪৫০ জন'}
                </span>
              </div>
              
              {/* Stacked avatars */}
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative', height: '24px', width: '70px' }}>
                {[
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
                  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80',
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80'
                ].map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="User joined"
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      border: '1.5px solid var(--white)',
                      position: 'absolute',
                      left: `${i * 14}px`,
                      zIndex: 10 - i,
                      objectFit: 'cover'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Middle part: Recent performance or encouragement */}
            {allResults.length > 0 ? (
              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                    {isEn ? 'Recent Exam Performance' : 'পরীক্ষার ইতিহাস ও অগ্রগতি'}
                  </h4>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary)', background: 'rgba(26, 86, 219, 0.05)', padding: '2px 8px', borderRadius: '12px' }}>
                    {isEn ? 'History' : 'ইতিহাস'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {allResults.slice(0, 3).map(res => (
                    <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '10px', fontSize: '11.5px', transition: 'transform 0.2s' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                        🎯 {isEn ? res.titleEn : res.title}
                      </span>
                      <span style={{ fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.06)', padding: '2px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                        {isEn ? `${res.score}/${res.total}` : `${toBengaliNumber(res.score)}/${toBengaliNumber(res.total)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(26, 86, 219, 0.02)', padding: '10px 12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '16px' }}>🏆</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {isEn 
                    ? "Participate in today's live exam to test your skills and check your daily rank list!" 
                    : 'আজকের লাইভ পরীক্ষায় অংশ নিয়ে আপনার মেধা যাচাই করুন এবং লিডারবোর্ডে র‍্যাংক দেখুন!'}
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {liveExams.slice(0, 2).map(exam => {
              const status = getExamStatus(exam);
              const isRegistered = !!registrations[exam.id];
              const result = getExamResult(exam.id);

              let statusBg = 'rgba(26, 86, 219, 0.05)';
              let statusColor = 'var(--primary)';
              let cardAccentBorder = '4px solid var(--primary)';
              
              if (status.type === 'live') {
                statusBg = 'rgba(239, 68, 68, 0.06)';
                statusColor = '#ef4444';
                cardAccentBorder = '4px solid #ef4444';
              } else if (status.type === 'ended') {
                statusBg = 'rgba(100, 116, 139, 0.06)';
                statusColor = 'var(--text-secondary)';
                cardAccentBorder = '4px solid var(--text-muted)';
              } else if (status.type === 'submitted') {
                statusBg = 'rgba(16, 185, 129, 0.06)';
                statusColor = '#10b981';
                cardAccentBorder = '4px solid #10b981';
              }

              return (
                <div
                  key={exam.id}
                  className="animate-slide-up"
                  style={{
                    background: 'var(--white)',
                    border: '1px solid var(--border-light)',
                    borderLeft: cardAccentBorder,
                    borderRadius: '16px',
                    padding: '18px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.02), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        background: statusBg,
                        color: statusColor,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {status.type === 'live' && <span className="pulse-dot" style={{ width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>}
                        {status.label}
                      </span>
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 700,
                        background: 'rgba(79, 70, 229, 0.05)',
                        color: '#4f46e5',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        whiteSpace: 'nowrap'
                      }}>
                        🕒 {isEn ? `${exam.duration} Mins` : `${toBengaliNumber(exam.duration)} মিনিট`}
                      </span>
                    </div>

                    {status.type === 'upcoming' && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#d97706',
                          background: 'rgba(245, 158, 11, 0.06)',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          📅 {isEn ? 'Time: ' : 'সময়: '}
                          {new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#b45309',
                          background: 'rgba(245, 158, 11, 0.12)',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontFamily: 'monospace',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          ⏱️ {getCountdownString(exam.startTime)}
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.4' }}>
                    {isEn ? exam.titleEn : exam.title}
                  </h3>

                  {/* Badges for counts */}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', fontSize: '11px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      📝 {isEn ? '100 Questions' : '১০০টি প্রশ্ন'}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      🎯 {isEn ? '100 Marks' : '১০০ পূর্ণমান'}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      ⚠️ {isEn ? 'Negative Marks' : 'নেগেটিভ মার্কস আছে'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
                    {status.type === 'completed' && result && (
                      <div style={{ fontSize: '11.5px', color: 'var(--success)', fontWeight: 800, marginRight: 'auto' }}>
                        🏆 {isEn 
                          ? `Score: ${result.score}/${result.total}`
                          : `স্কোর: ${toBengaliNumber(result.score)}/${toBengaliNumber(result.total)}`}
                      </div>
                    )}

                    {status.type === 'live' ? (
                      <button
                        onClick={() => navigate(`/live-exam-room/${exam.id}`)}
                        style={{
                          width: 'auto',
                          padding: '8px 20px',
                          borderRadius: '30px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '11.5px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        🚀 <span>{isEn ? 'Enter Exam Room' : 'অংশগ্রহণ করুন'}</span>
                      </button>
                    ) : status.type === 'submitted' || status.type === 'ended' ? (
                      <button
                        onClick={() => navigate(`/live-exam-room/${exam.id}`)}
                        style={{
                          width: 'auto',
                          padding: '8px 20px',
                          borderRadius: '30px',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-secondary)',
                          fontWeight: 800,
                          fontSize: '11.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        📊 <span>{isEn ? 'Results' : 'ফলাফল ও র্যাংক'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(exam.id)}
                        style={{
                          width: 'auto',
                          padding: '8px 20px',
                          borderRadius: '30px',
                          border: isRegistered ? '1.5px solid #10b981' : 'none',
                          background: isRegistered ? 'rgba(16, 185, 129, 0.05)' : 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
                          color: isRegistered ? '#047857' : '#ffffff',
                          fontWeight: 800,
                          fontSize: '11.5px',
                          cursor: 'pointer',
                          boxShadow: isRegistered ? 'none' : '0 4px 12px rgba(26, 86, 219, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>
                          {isRegistered 
                            ? (isEn ? 'Registered & Participating' : 'অংশগ্রহণ নিশ্চিত করা হয়েছে') 
                            : (isEn ? 'Register Now' : 'রেজিস্ট্রেশন করুন')}
                        </span>
                      </button>
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
              <span>📂</span>
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
