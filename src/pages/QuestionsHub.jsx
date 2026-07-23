import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, ChevronRight, LayoutGrid } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { defaultLiveExams, getLiveExams } from '../data/liveExams';
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

  // 1. Live Exams Data
  const liveExams = useMemo(() => getLiveExams(), []);
  
  // Format Countdown String
  const getCountdownString = (startTimeStr) => {
    const diff = new Date(startTimeStr) - new Date();
    if (diff <= 0) return '';
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    if (isEn) {
      return `${mins}m ${secs}s`;
    } else {
      return `${toBengaliNumber(mins)}মি: ${toBengaliNumber(secs)}সে:`;
    }
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const start = new Date(exam.startTime);
    const end = new Date(start.getTime() + exam.duration * 60 * 1000);

    const isRegistered = state.registeredExams && state.registeredExams[exam.id];
    const isCompleted = state.liveExamResults && state.liveExamResults[exam.id];

    if (now >= end) return { type: 'ended', label: isEn ? 'Ended' : 'পরীক্ষা শেষ' };
    if (now >= start && now < end) {
      if (isCompleted) return { type: 'submitted', label: isEn ? 'Submitted' : 'অংশগ্রহণ করেছেন' };
      return { type: 'live', label: isEn ? 'Live Now' : 'লাইভ চলছে' };
    }
    return { type: 'upcoming', label: isEn ? 'Upcoming' : 'আসন্ন পরীক্ষা' };
  };

  // 2. Filtered Question Papers Data
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {liveExams.slice(0, 2).map(exam => {
              const status = getExamStatus(exam);
              const isRegistered = state.registeredExams && state.registeredExams[exam.id];
              const isCompleted = state.liveExamResults && state.liveExamResults[exam.id];

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
                        {status.type === 'live' && <span className="pulse-dot" style={{ width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%', display: 'inline-block' }}></span>}
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
                        📅 {isEn ? 'Time: ' : 'পরীক্ষা: '}
                        {new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
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
                      ⚠ {isEn ? 'Negative Marks' : 'নেগেটিভ মার্কস আছে'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                        style={{
                          width: 'auto',
                          padding: '8px 20px',
                          borderRadius: '30px',
                          border: 'none',
                          background: isRegistered ? '#e2e8f0' : 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
                          color: isRegistered ? 'var(--text-muted)' : '#ffffff',
                          fontWeight: 800,
                          fontSize: '11.5px',
                          cursor: isRegistered ? 'default' : 'pointer',
                          boxShadow: isRegistered ? 'none' : '0 4px 12px rgba(26, 86, 219, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        disabled={isRegistered}
                      >
                        <span>{isRegistered ? (isEn ? 'Registered' : 'নিবন্ধিত') : (isEn ? 'Register Now' : 'রেজিস্ট্রেশন করুন')}</span>
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
