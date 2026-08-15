import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { getLiveExams, generate100Questions } from '../data/liveExams';
import { getDocument, getCollectionCached, setDocument, onCollectionSnapshot, COLLECTIONS } from '../services/supabaseService';
import BottomNav from '../components/BottomNav';

export default function LiveExamRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { state: adminState } = useAdminContext();
  const isEn = state.language === 'en';

  const [exam, setExam] = useState(null);
  const [loadingExam, setLoadingExam] = useState(true);
  const [realSubmissions, setRealSubmissions] = useState([]);

  // Multi-tier resolution for exam details (Handles high concurrency, direct links, and notifications)
  useEffect(() => {
    let isMounted = true;

    const findExam = async () => {
      if (!id) {
        if (isMounted) setLoadingExam(false);
        return;
      }

      const targetId = String(id).trim();

      // Tier 1: Check adminState.liveExams from AdminContext
      const adminExams = adminState.liveExams || [];
      let match = adminExams.find(e => e && String(e.id).trim() === targetId);

      // Tier 2: Check getLiveExams() module cache
      if (!match) {
        const cachedExams = getLiveExams();
        match = cachedExams.find(e => e && String(e.id).trim() === targetId);
      }

      // Tier 3: Check LocalStorage cache directly
      if (!match) {
        try {
          const raw = localStorage.getItem('cache_data_live_exams') || localStorage.getItem('admin_live_exams');
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              match = list.find(e => e && String(e.id).trim() === targetId);
            }
          }
        } catch (e) {}
      }

      // Tier 4: Direct Supabase database query by ID
      if (!match) {
        try {
          const doc = await getDocument(COLLECTIONS.LIVE_EXAMS, targetId, true);
          if (doc) match = doc;
        } catch (e) {
          console.error('Error fetching live exam document directly:', e);
        }
      }

      if (isMounted) {
        if (match) {
          const finalQuestions = (Array.isArray(match.questions) && match.questions.length > 0)
            ? match.questions
            : generate100Questions(1);

          setExam({
            ...match,
            questions: finalQuestions
          });
        } else {
          setExam(null);
        }
        setLoadingExam(false);
      }
    };

    findExam();

    return () => {
      isMounted = false;
    };
  }, [id, adminState.liveExams]);

  // Load REAL participant submissions from Supabase Activities
  useEffect(() => {
    let isMounted = true;
    const targetId = String(id).trim();

    const loadRealSubmissions = async () => {
      try {
        const allActivities = await getCollectionCached(COLLECTIONS.ACTIVITIES, false, 5);
        if (Array.isArray(allActivities) && isMounted) {
          const examSubs = allActivities.filter(act => 
            act.type === 'live_exam_submission' && String(act.examId).trim() === targetId
          );
          setRealSubmissions(examSubs);
        }
      } catch (err) {
        console.warn('Error fetching leaderboard submissions:', err);
      }
    };

    loadRealSubmissions();

    let unsubscribe = () => {};
    try {
      unsubscribe = onCollectionSnapshot(COLLECTIONS.ACTIVITIES, (activitiesData) => {
        if (Array.isArray(activitiesData) && isMounted) {
          const examSubs = activitiesData.filter(act => 
            act.type === 'live_exam_submission' && String(act.examId).trim() === targetId
          );
          setRealSubmissions(examSubs);
        }
      });
    } catch (e) {}

    return () => {
      isMounted = false;
      unsubscribe();
    };
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

  const parseExamDate = (dateVal) => {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? null : d.getTime();
  };

  // Is exam currently running?
  const isRunning = useMemo(() => {
    if (!exam) return false;
    if (savedResult || submitted) return false;
    if (exam.status === 'active' || exam.status === 'running') return true;
    const startMs = parseExamDate(exam.startTime) || parseExamDate(exam.scheduledAt) || parseExamDate(exam.createdAt);
    if (!startMs) return true;
    const durationMins = typeof exam.duration === 'number' ? exam.duration : (parseInt(exam.duration) || 60);
    const endMs = startMs + durationMins * 60 * 1000;
    const nowMs = Date.now();
    return nowMs >= startMs && nowMs < endMs;
  }, [exam, savedResult, submitted]);

  // Timer Tick
  useEffect(() => {
    if (!exam || !isRunning || savedResult || submitted) return;

    const startMs = new Date(exam.startTime || exam.scheduledAt || exam.createdAt).getTime();
    const endMs = startMs + (exam.duration || 10) * 60 * 1000;

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

  // Generate 100% REAL dynamic Leaderboard list (ZERO dummy users)
  const leaderboardData = useMemo(() => {
    const list = (realSubmissions || []).map(sub => {
      const uName = toSafeString(sub?.userName || sub?.name, isEn ? 'Candidate' : 'পরীক্ষার্থী');
      const uPhoto = toSafeString(sub?.userPhoto || sub?.avatar, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');
      const uTime = toSafeString(sub?.timeTaken || sub?.time, '0m 00s');
      const isSelf = Boolean((state.user?.name && uName === state.user.name) || 
                             (state.user?.email && sub?.userEmail === state.user.email));

      const rawScore = typeof sub?.score === 'number' ? sub.score : (parseInt(sub?.score) || 0);
      const rawTotal = typeof sub?.total === 'number' ? sub.total : (parseInt(sub?.total) || 1);
      const calcScore = typeof sub?.scaledScore === 'number' ? sub.scaledScore : Math.round((rawScore / rawTotal) * 100);

      return {
        id: toSafeString(sub?.id, `sub-${Math.random()}`),
        name: uName,
        nameEn: uName,
        score: isNaN(calcScore) ? 0 : calcScore,
        time: uTime,
        timeSec: typeof sub?.timeTakenSec === 'number' ? sub.timeTakenSec : (parseInt(sub?.timeTakenSec) || 9999),
        avatar: uPhoto,
        isCurrentUser: isSelf
      };
    });

    // Also include current user's score if present in localStorage but not yet synced
    const currentResult = savedResult || (submitted ? getExamResultLocal() : null);
    if (currentResult) {
      const currentUserName = toSafeString(state.user?.name, 'Suvo Roy');
      const existsInList = list.some(item => 
        item.isCurrentUser || 
        item.name === currentUserName || 
        (item.name && String(item.name).includes('(আপনি)')) ||
        (item.name && String(item.name).includes(currentUserName))
      );
      
      if (!existsInList) {
        const rawScore = typeof currentResult.score === 'number' ? currentResult.score : (parseInt(currentResult.score) || 0);
        const rawTotal = typeof currentResult.total === 'number' ? currentResult.total : (parseInt(currentResult.total) || 1);
        const scaledScore = typeof currentResult.scaledScore === 'number' ? currentResult.scaledScore : Math.round((rawScore / rawTotal) * 100);
        
        list.push({
          id: `local-sub-${id}`,
          name: `${currentUserName} (আপনি)`,
          nameEn: `${currentUserName} (You)`,
          score: isNaN(scaledScore) ? 0 : scaledScore,
          time: toSafeString(currentResult.timeTaken, '0m 00s'),
          timeSec: typeof currentResult.timeTakenSec === 'number' ? currentResult.timeTakenSec : 9999,
          avatar: toSafeString(state.user?.photoURL, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'),
          isCurrentUser: true
        });
      }
    }

    // Sort by score DESCENDING, then by completion time ASCENDING
    return list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.timeSec || 0) - (b.timeSec || 0);
    });
  }, [realSubmissions, savedResult, submitted, isEn, state.user, id]);

  if (loadingExam) {
    return (
      <div className="page" style={{ paddingBottom: '100px', background: 'var(--bg-secondary)' }}>
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>
          <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800 }}>
            {isEn ? 'Live Exam' : 'লাইভ পরীক্ষা'}
          </h1>
        </div>
        <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(26, 86, 219, 0.2)',
            borderTop: '3px solid var(--primary)',
            borderRadius: '50%',
            margin: '0 auto 16px auto',
            animation: 'spin 0.8s linear infinite'
          }}></div>
          <p style={{ fontSize: '14px', fontWeight: 700 }}>
            {isEn ? 'Loading live exam room...' : 'লাইভ পরীক্ষা রুম লোড হচ্ছে...'}
          </p>
        </div>
        <BottomNav />
      </div>
    );
  }

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

  const handleSubmit = async () => {
    if (savedResult || submitted) return;

    let correct = 0;
    (exam.questions || []).forEach((q, index) => {
      if (selectedAnswers[index] === q.correctIndex) {
        correct += 1;
      }
    });

    const totalQuestions = exam.questions?.length || 100;
    const scaledScore = Math.round((correct / totalQuestions) * 100);
    const startMs = new Date(exam.startTime || exam.scheduledAt || exam.createdAt).getTime();
    const elapsedSec = Math.max(1, Math.floor((Date.now() - startMs) / 1000));
    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;
    const timeStr = `${mins}m ${String(secs).padStart(2, '0')}s`;

    const userName = state.user?.name || 'Suvo Roy';
    const userPhoto = state.user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

    const resultData = {
      score: correct,
      total: totalQuestions,
      scaledScore: scaledScore,
      answers: selectedAnswers,
      timeTaken: timeStr,
      timeTakenSec: elapsedSec,
      userName: userName,
      userPhoto: userPhoto,
      submittedAt: new Date().toISOString()
    };

    try {
      const results = JSON.parse(localStorage.getItem('live_exam_results')) || {};
      results[id] = resultData;
      localStorage.setItem('live_exam_results', JSON.stringify(results));
    } catch (e) {
      console.error(e);
    }

    // Persist real participant submission to Supabase
    const submissionId = `exam-sub-${id}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const submissionDoc = {
      id: submissionId,
      type: 'live_exam_submission',
      examId: String(id).trim(),
      userName: userName,
      userPhoto: userPhoto,
      score: correct,
      total: totalQuestions,
      scaledScore: scaledScore,
      timeTaken: timeStr,
      timeTakenSec: elapsedSec,
      createdAt: new Date().toISOString()
    };

    try {
      await setDocument(COLLECTIONS.ACTIVITIES, submissionId, submissionDoc);
    } catch (err) {
      console.warn('Failed to sync live exam submission to Supabase:', err);
    }

    setSubmitted(true);
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(mins)}:${pad(secs)}`;
  };

  const isCompleted = useMemo(() => {
    if (!exam) return false;
    if (savedResult || submitted) return true;
    if (exam.status === 'active' || exam.status === 'running') return false;
    const startMs = parseExamDate(exam.startTime) || parseExamDate(exam.scheduledAt) || parseExamDate(exam.createdAt);
    if (!startMs) return false;
    const durationMins = typeof exam.duration === 'number' ? exam.duration : (parseInt(exam.duration) || 60);
    const endMs = startMs + durationMins * 60 * 1000;
    return Date.now() >= endMs;
  }, [exam, savedResult, submitted]);

  const currentResult = useMemo(() => {
    if (savedResult) return savedResult;
    if (submitted) return getExamResultLocal();
    if (isCompleted && exam) {
      const qTotal = Array.isArray(exam.questions) ? exam.questions.length : 100;
      return { score: 0, total: qTotal, answers: {}, didNotAttend: true };
    }
    return null;
  }, [savedResult, submitted, isCompleted, exam, id]);

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
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800 }}>
          {isEn ? 'Live Exam' : 'লাইভ পরীক্ষা'}
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
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>{currentResult.didNotAttend ? '⏳' : '🏆'}</span>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {currentResult.didNotAttend 
                ? (isEn ? 'Exam Closed' : 'পরীক্ষা শেষ হয়েছে')
                : (isEn ? 'Exam Results' : 'পরীক্ষার ফলাফল')}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {currentResult.didNotAttend
                ? (isEn ? 'This exam has ended. You can view the correct answers and leaderboard.' : 'এই পরীক্ষাটি শেষ হয়ে গেছে। আপনি এখন সঠিক উত্তর ও লিডারবোর্ড দেখতে পারেন।')
                : (isEn ? 'Congratulations! You have completed the live test.' : 'অভিনন্দন! আপনি লাইভ পরীক্ষা সম্পন্ন করেছেন।')}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: currentResult.didNotAttend ? '1fr' : '1fr 1fr',
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
                  {isEn ? toSafeString(currentResult.total, '100') : toBengaliNumber(currentResult.total)}
                </strong>
              </div>
              {!currentResult.didNotAttend && (
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                    {isEn ? 'Your Score' : 'প্রাপ্ত নম্বর'}
                  </span>
                  <strong style={{ fontSize: '18px', color: 'var(--success)', fontWeight: 800 }}>
                    {isEn ? toSafeString(currentResult.score, '0') : toBengaliNumber(currentResult.score)}
                  </strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 1. Questions View Tab (Solutions or Live Taking) */}
        {(!currentResult || activeRoomTab === 'solutions') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
            {(exam.questions || []).map((qn, qIndex) => {
              if (!qn) return null;
              const userSelections = (currentResult && currentResult.answers) ? currentResult.answers : (selectedAnswers || {});
              const chosenIndex = userSelections[qIndex];
              const qOptions = Array.isArray(qn.options) ? qn.options : ['', '', '', ''];
              const qOptionsEn = Array.isArray(qn.optionsEn) ? qn.optionsEn : ['', '', '', ''];

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
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '16px',
                    lineHeight: '1.5',
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <span>{isEn ? `${qIndex + 1}.` : `${toBengaliNumber(qIndex + 1)}.`}</span>
                    <span>{toSafeString(isEn ? (qn.questionEn || qn.question) : qn.question)}</span>
                  </h4>

                  {/* Option Choices */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {qOptions.map((option, oIndex) => {
                      const optText = toSafeString(isEn ? (qOptionsEn[oIndex] || option) : option);
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
                          trailingIcon = (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          );
                        } else if (oIndex === chosenIndex) {
                          bg = '#fee2e2';
                          color = '#991b1b';
                          border = '1px solid #f87171';
                          trailingIcon = (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          );
                        }
                      } else {
                        if (oIndex === chosenIndex) {
                          bg = 'var(--primary-lightest)';
                          color = 'var(--primary)';
                          border = '1.5px solid var(--primary)';
                          trailingIcon = (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          );
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
                            color: color === 'var(--text-primary)' ? 'var(--text-secondary)' : color,
                            border: border,
                            cursor: !currentResult ? 'pointer' : 'default',
                            fontSize: '13px',
                            fontWeight: 500,
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
                          {trailingIcon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{trailingIcon}</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanations */}
                  {currentResult && (qn.explanation || qn.explanationEn) && (
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
                        {toSafeString(isEn ? (qn.explanationEn || qn.explanation) : qn.explanation)}
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(26, 86, 219, 0.05)',
                borderLeft: '4px solid var(--primary)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '18px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                  <path d="M4 22h16"></path>
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path>
                  <path d="M12 2a6 6 0 0 0-6 6v3.5a6 6 0 0 0 12 0V8a6 6 0 0 0-6-6z"></path>
                </svg>
                <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {isEn ? 'Rank List' : 'র‍্যাংক তালিকা'}
                </h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {leaderboardData.map((user, idx) => {
                  const rank = idx + 1;
                  const isGold = rank === 1;
                  const isSilver = rank === 2;
                  const isBronze = rank === 3;
                  const displayName = isEn ? user.nameEn : user.name;

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
                    for (let i = 0; i < (name || '').length; i++) {
                      hash = name.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    const index = Math.abs(hash) % colors.length;
                    return { bg: colors[index], text: textColors[index] };
                  };
                  const avatarStyle = getAvatarBg(displayName);

                  return (
                    <div
                      key={user.id || idx}
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

                        {/* Profile Picture */}
                        <img 
                          src={user.avatar} 
                          alt={displayName}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: `1.5px solid ${avatarStyle.text}`
                          }} 
                        />
                        
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

                {leaderboardData.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>🏆</span>
                    <p style={{ fontSize: '13px', fontWeight: 600 }}>
                      {isEn ? 'No real participants yet. Be the first to take this exam!' : 'এখনও কোনো প্রকৃত অংশগ্রহণকারী নেই। প্রথম হয়ে পরীক্ষায় অংশ নিন!'}
                    </p>
                  </div>
                )}
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

const toSafeString = (val, fallback = '') => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    if (typeof val.text === 'string') return val.text;
    if (typeof val.title === 'string') return val.title;
    if (typeof val.name === 'string') return val.name;
    if (typeof val.value === 'string') return val.value;
    if (typeof val.bn === 'string') return val.bn;
    if (typeof val.en === 'string') return val.en;
  }
  return fallback;
};

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const engNum = toSafeString(num);
  const bengaliDigits = {'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'};
  return engNum.split('').map(digit => bengaliDigits[digit] || digit).join('');
};
