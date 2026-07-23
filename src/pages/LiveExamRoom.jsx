import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { getLiveExams } from '../data/liveExams';
import BottomNav from '../components/BottomNav';

export default function LiveExamRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';

  const exam = useMemo(() => {
    const all = getLiveExams();
    return all.find(e => e.id === id);
  }, [id]);

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [activeRoomTab, setActiveRoomTab] = useState('solutions'); // 'solutions' | 'leaderboard'

  // Retrieve user results from localStorage if they have already taken it
  const savedResult = useMemo(() => {
    try {
      const results = JSON.parse(localStorage.getItem('live_exam_results')) || {};
      return results[id];
    } catch (e) {
      return null;
    }
  }, [id, submitted]);

  // Is exam currently running?
  const isRunning = useMemo(() => {
    if (!exam) return false;
    const startMs = new Date(exam.startTime).getTime();
    const endMs = startMs + exam.duration * 60 * 1000;
    const now = Date.now();
    return now >= startMs && now < endMs;
  }, [exam]);

  // Timer Tick
  useEffect(() => {
    if (!exam || !isRunning || savedResult || submitted) return;

    const startMs = new Date(exam.startTime).getTime();
    const endMs = startMs + exam.duration * 60 * 1000;

    const updateTimer = () => {
      const secondsLeft = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
      setRemainingSeconds(secondsLeft);

      if (secondsLeft <= 0) {
        handleSubmit();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [exam, isRunning, savedResult, submitted]);

  // Generate dynamic Daily Leaderboard list ranking mock and user scores out of 100
  const leaderboardData = useMemo(() => {
    const mockUsers = [
      { name: 'সাদিয়া তাসনিম', nameEn: 'Sadia Tasnim', score: 94, time: '38m 12s', avatar: '👩' },
      { name: 'মেহেদী হাসান', nameEn: 'Mehedi Hasan', score: 91, time: '41m 05s', avatar: '👨' },
      { name: 'তন্ময় রায়', nameEn: 'Tonmoy Roy', score: 88, time: '44m 30s', avatar: '👨' },
      { name: 'নুসরাত জাহান', nameEn: 'Nusrat Jahan', score: 85, time: '36m 50s', avatar: '👩' },
      { name: 'আরিফুর রহমান', nameEn: 'Arifur Rahman', score: 81, time: '49m 12s', avatar: '👨' },
      { name: 'ফারজানা আক্তার', nameEn: 'Farjana Akter', score: 79, time: '42m 18s', avatar: '👩' },
      { name: 'জাকির হোসেন', nameEn: 'Zakir Hossain', score: 75, time: '51m 40s', avatar: '👨' },
      { name: 'শামীমা ইয়াসমিন', nameEn: 'Shamima Yasmin', score: 72, time: '46m 10s', avatar: '👩' }
    ];

    const currentResult = savedResult || (submitted ? getExamResultLocal() : null);

    const list = [...mockUsers];
    if (currentResult) {
      // Calculate scaled score out of 100 if questions are different than 100
      const scaledScore = Math.round((currentResult.score / currentResult.total) * 100);
      list.push({
        name: 'সুব্রত দাস (আপনি)',
        nameEn: 'Suvro (You)',
        score: scaledScore,
        time: isEn ? '45m 00s' : '৪৫মি: ০০সে:',
        avatar: '🎓',
        isCurrentUser: true
      });
    }

    // Sort by score desc, then by time asc
    return list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.time.localeCompare(b.time);
    });
  }, [savedResult, submitted, isEn]);

  if (!exam) {
    return (
      <div className="page" style={{ paddingBottom: '100px' }}>
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>
          <h1 style={{ flex: 1 }}>{isEn ? 'Not Found' : 'পাওয়া যায়নি'}</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <p>{isEn ? 'Exam not found' : 'পরীক্ষা খুঁজে পাওয়া যায়নি'}</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  const handleOptionSelect = (qIndex, oIndex) => {
    if (savedResult || submitted || !isRunning) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qIndex]: oIndex
    }));
  };

  const handleSubmit = () => {
    if (savedResult || submitted) return;

    let correct = 0;
    exam.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctIndex) {
        correct += 1;
      }
    });

    const resultData = {
      score: correct,
      total: exam.questions.length,
      answers: selectedAnswers
    };

    try {
      const results = JSON.parse(localStorage.getItem('live_exam_results')) || {};
      results[id] = resultData;
      localStorage.setItem('live_exam_results', JSON.stringify(results));
    } catch (e) {
      console.error(e);
    }

    setSubmitted(true);
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(mins)}:${pad(secs)}`;
  };

  const currentResult = savedResult || (submitted ? getExamResultLocal() : null);

  function getExamResultLocal() {
    try {
      const results = JSON.parse(localStorage.getItem('live_exam_results')) || {};
      return results[id];
    } catch (e) {
      return null;
    }
  }

  const showQuestionsSheet = isRunning && !currentResult;

  return (
    <div className="page" style={{ paddingBottom: '100px', background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="page-header flex-between" style={{ borderBottom: 'none' }}>
        <button className="back-btn" onClick={() => navigate('/live-exams')}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800 }}>
          {isEn ? exam.titleEn : exam.title}
        </h1>

        {/* Ticking Timer Badge */}
        {showQuestionsSheet && (
          <div style={{
            background: remainingSeconds < 60 ? '#fee2e2' : 'var(--primary-bg)',
            color: remainingSeconds < 60 ? 'var(--danger)' : 'var(--primary)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            border: remainingSeconds < 60 ? '1px solid #f87171' : 'none'
          }}>
            🔴 {formatTimer(remainingSeconds)}
          </div>
        )}
      </div>

      {/* Solutions / Leaderboard Tab Selector (Only shown after submission or completion) */}
      {currentResult && (
        <div style={{
          display: 'flex',
          background: 'var(--white)',
          borderBottom: '1px solid var(--border-light)',
          padding: '0 8px'
        }}>
          <button
            onClick={() => setActiveRoomTab('solutions')}
            style={{
              flex: 1,
              padding: '14px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: activeRoomTab === 'solutions' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeRoomTab === 'solutions' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📋 {isEn ? 'Solutions' : 'সমাধান দেখুন'}
          </button>
          <button
            onClick={() => setActiveRoomTab('leaderboard')}
            style={{
              flex: 1,
              padding: '14px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: activeRoomTab === 'leaderboard' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeRoomTab === 'leaderboard' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🏆 {isEn ? 'Daily Leaderboard' : 'আজকের লিডারবোর্ড'}
          </button>
        </div>
      )}

      <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        
        {/* Result Header Panel */}
        {currentResult && activeRoomTab === 'solutions' && (
          <div style={{
            background: 'var(--white)',
            border: '1.5px solid var(--primary)',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>🏆</span>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {isEn ? 'Exam Results' : 'পরীক্ষার ফলাফল'}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {isEn ? 'Congratulations! You have completed the live test.' : 'অভিনন্দন! আপনি লাইভ পরীক্ষা সম্পন্ন করেছেন।'}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              background: 'var(--bg-secondary)',
              padding: '14px',
              borderRadius: '16px'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                  {isEn ? 'Total Questions' : 'মোট প্রশ্ন'}
                </span>
                <strong style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 800 }}>
                  {isEn ? currentResult.total : toBengaliNumber(currentResult.total)}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                  {isEn ? 'Your Score' : 'প্রাপ্ত নম্বর'}
                </span>
                <strong style={{ fontSize: '18px', color: 'var(--success)', fontWeight: 800 }}>
                  {isEn ? currentResult.score : toBengaliNumber(currentResult.score)}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* 1. Questions View Tab (Solutions or Live Taking) */}
        {(!currentResult || activeRoomTab === 'solutions') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
            {exam.questions.map((qn, qIndex) => {
              const userSelections = currentResult ? currentResult.answers : selectedAnswers;
              const chosenIndex = userSelections[qIndex];

              return (
                <div
                  key={qIndex}
                  style={{
                    background: 'var(--white)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '20px',
                    padding: '20px',
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.02)'
                  }}
                >
                  {/* Question Text */}
                  <h4 style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    marginBottom: '16px',
                    lineHeight: '1.5',
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <span>{isEn ? `${qIndex + 1}.` : `${toBengaliNumber(qIndex + 1)}.`}</span>
                    <span>{isEn ? qn.questionEn : qn.question}</span>
                  </h4>

                  {/* Option Choices */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {qn.options.map((option, oIndex) => {
                      const optText = isEn ? qn.optionsEn[oIndex] : option;
                      const optionPrefixes = isEn ? ['A', 'B', 'C', 'D'] : ['ক', 'খ', 'গ', 'ঘ'];
                      const prefix = optionPrefixes[oIndex];

                      let bg = 'var(--bg-secondary)';
                      let color = 'var(--text-primary)';
                      let border = '1px solid var(--border-light)';
                      let trailingIcon = '';

                      // Styling based on state
                      if (currentResult) {
                        if (oIndex === qn.correctIndex) {
                          bg = '#d1fae5';
                          color = '#065f46';
                          border = '1px solid #34d399';
                          trailingIcon = '✅';
                        } else if (oIndex === chosenIndex) {
                          bg = '#fee2e2';
                          color = '#991b1b';
                          border = '1px solid #f87171';
                          trailingIcon = '❌';
                        }
                      } else {
                        if (oIndex === chosenIndex) {
                          bg = 'var(--primary-lightest)';
                          color = 'var(--primary)';
                          border = '1.5px solid var(--primary)';
                        }
                      }

                      return (
                        <div
                          key={oIndex}
                          onClick={() => handleOptionSelect(qIndex, oIndex)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 14px',
                            borderRadius: '12px',
                            background: bg,
                            color: color,
                            border: border,
                            cursor: !currentResult ? 'pointer' : 'default',
                            fontSize: '13px',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                            gap: '10px'
                          }}
                        >
                          <span style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'rgba(0,0,0,0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {prefix}
                          </span>
                          <span style={{ flex: 1 }}>{optText}</span>
                          {trailingIcon && <span style={{ fontSize: '14px' }}>{trailingIcon}</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanations */}
                  {currentResult && (
                    <div style={{
                      marginTop: '16px',
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'var(--primary-lightest)',
                      borderLeft: '4px solid var(--primary)'
                    }}>
                      <h5 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                        💡 {isEn ? 'Explanation' : 'ব্যাখ্যা ও বিশ্লেষণ'}
                      </h5>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                        {isEn ? qn.explanationEn : qn.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 2. Leaderboard Tab view */}
        {currentResult && activeRoomTab === 'leaderboard' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div style={{
              background: 'var(--white)',
              borderRadius: '20px',
              padding: '24px 20px',
              border: '1px solid var(--border-light)',
              boxShadow: '0 4px 18px rgba(0,0,0,0.02)'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                  <path d="M4 22h16"></path>
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path>
                  <path d="M12 2a6 6 0 0 0-6 6v3.5a6 6 0 0 0 12 0V8a6 6 0 0 0-6-6z"></path>
                </svg>
                <span>{isEn ? 'Daily Competitive Ranks' : 'দৈনিক প্রতিযোগিতামূলক র‍্যাংক তালিকা'}</span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {leaderboardData.map((user, idx) => {
                  const rank = idx + 1;
                  const isGold = rank === 1;
                  const isSilver = rank === 2;
                  const isBronze = rank === 3;
                  const displayName = isEn ? user.nameEn : user.name;
                  const initial = displayName[0];

                  const getAvatarBg = (name) => {
                    const colors = [
                      'rgba(26, 86, 219, 0.06)',
                      'rgba(16, 185, 129, 0.06)',
                      'rgba(245, 158, 11, 0.06)',
                      'rgba(139, 92, 246, 0.06)',
                      'rgba(236, 72, 153, 0.06)',
                      'rgba(6, 182, 212, 0.06)'
                    ];
                    const textColors = [
                      'var(--primary)',
                      '#059669',
                      '#d97706',
                      '#7c3aed',
                      '#db2777',
                      '#0891b2'
                    ];
                    let hash = 0;
                    for (let i = 0; i < name.length; i++) {
                      hash = name.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    const index = Math.abs(hash) % colors.length;
                    return { bg: colors[index], text: textColors[index] };
                  };
                  const avatarStyle = getAvatarBg(displayName);

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '14px',
                        background: user.isCurrentUser ? 'rgba(26, 86, 219, 0.04)' : 'var(--bg-secondary)',
                        border: user.isCurrentUser ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                        borderLeft: user.isCurrentUser ? '4px solid var(--primary)' : undefined,
                        boxShadow: user.isCurrentUser ? '0 4px 12px rgba(26, 86, 219, 0.05)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Rank Badge */}
                        <span style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: isGold 
                            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                            : isSilver 
                              ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' 
                              : isBronze 
                                ? 'linear-gradient(135deg, #ca8a04 0%, #a16207 100%)' 
                                : 'var(--white)',
                          color: (isGold || isSilver || isBronze) ? 'white' : 'var(--text-secondary)',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isGold 
                            ? '0 2px 6px rgba(217, 119, 6, 0.25)' 
                            : isSilver 
                              ? '0 2px 6px rgba(100, 116, 139, 0.2)' 
                              : isBronze 
                                ? '0 2px 6px rgba(161, 98, 7, 0.2)' 
                                : 'none',
                          border: (isGold || isSilver || isBronze) ? 'none' : '1px solid var(--border-light)'
                        }}>
                          {isEn ? rank : toBengaliNumber(rank)}
                        </span>

                        {/* Styled Initials Avatar */}
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: avatarStyle.bg,
                          color: avatarStyle.text,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '13px',
                          textTransform: 'uppercase',
                          border: `1.5px solid ${avatarStyle.text}`
                        }}>
                          {initial}
                        </div>
                        
                        <div>
                          <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block' }}>
                            {displayName}
                          </strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            {isEn ? user.time : toBengaliNumber(user.time)}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: 800, 
                          color: user.isCurrentUser ? 'white' : 'var(--primary)', 
                          display: 'inline-block',
                          background: user.isCurrentUser ? 'var(--primary)' : 'rgba(26, 86, 219, 0.06)',
                          padding: '4px 10px',
                          borderRadius: '8px'
                        }}>
                          {isEn ? `${user.score}/100` : `${toBengaliNumber(user.score)}/১০০`}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px', paddingRight: '4px' }}>
                          {isEn ? 'Points' : 'পয়েন্ট'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {showQuestionsSheet && (
          <button
            onClick={handleSubmit}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
              color: 'white',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-lg)',
              transition: 'transform 0.2s'
            }}
          >
            🚀 {isEn ? 'Submit Live Exam' : 'পরীক্ষা সম্পন্ন করুন'}
          </button>
        )}
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
