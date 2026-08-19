import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { getLiveExams, generate100Questions } from '../data/liveExams';
import { getDocument, getCollectionCached, setDocument, onCollectionSnapshot, COLLECTIONS } from '../services/supabaseService';
import BottomNav from '../components/BottomNav';
import ModernLoader from '../components/ModernLoader';

export default function LiveExamRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { state: adminState } = useAdminContext();
  const isEn = state.language === 'en';
  const roomEntryTime = useRef(Date.now());

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

  // Load REAL participant submissions from Supabase Activities via Polling / Fetch
  useEffect(() => {
    let isMounted = true;
    const targetId = String(id).trim();

    const loadRealSubmissions = async (force = false) => {
      try {
        const allActivities = await getCollectionCached(COLLECTIONS.ACTIVITIES, force, 2);
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

    // 1. Initial immediate fetch
    loadRealSubmissions(false);

    // 2. Poll periodically every 20 seconds (0 Realtime socket usage, 100% scalable)
    const pollInterval = setInterval(() => {
      if (isMounted) {
        loadRealSubmissions(true);
      }
    }, 20000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
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
      const res = results[id];
      if (!res) return null;
      if (res.didNotAttend) return null;
      const answersObj = res.answers || {};
      if (Object.keys(answersObj).length === 0 && !res.submittedAt && !res.score) {
        return null;
      }
      return res;
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

    const startMs = parseExamDate(exam.startTime) || parseExamDate(exam.scheduledAt) || parseExamDate(exam.createdAt);
    const durationMins = typeof exam.duration === 'number' ? exam.duration : (parseInt(exam.duration) || 60);

    if (startMs) {
      const endMs = startMs + durationMins * 60 * 1000;
      const nowMs = Date.now();
      if (nowMs >= endMs) return false;
      if (nowMs < startMs) return false;
      return true;
    }

    if (exam.status === 'active' || exam.status === 'running') return true;
    return false;
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
    const qTotal = (exam && Array.isArray(exam.questions) && exam.questions.length > 0) ? exam.questions.length : 100;

    const list = (realSubmissions || []).map(sub => {
      const uName = toSafeString(sub?.userName || sub?.name, isEn ? 'Candidate' : 'পরীক্ষার্থী');
      const uPhoto = toSafeString(sub?.userPhoto || sub?.avatar, '');
      const uTime = toSafeString(sub?.timeTaken || sub?.time, '0m 00s');
      const isSelf = Boolean((state.user?.name && uName === state.user.name) || 
                             (state.user?.email && sub?.userEmail === state.user.email));

      const rawScore = typeof sub?.score === 'number' ? sub.score : (parseInt(sub?.score) || 0);
      const rawTotal = typeof sub?.total === 'number' ? sub.total : (parseInt(sub?.total) || qTotal);

      return {
        id: toSafeString(sub?.id, `sub-${Math.random()}`),
        name: uName,
        nameEn: uName,
        score: rawScore,
        total: rawTotal,
        time: uTime,
        timeSec: typeof sub?.timeTakenSec === 'number' ? sub.timeTakenSec : (parseInt(sub?.timeTakenSec) || 9999),
        avatar: uPhoto,
        isCurrentUser: isSelf
      };
    });

    // Only include current user in leaderboard IF they actually participated!
    const currentRes = savedResult || (submitted ? getExamResultLocal() : null);
    const userActuallyParticipated = currentRes && !currentRes.didNotAttend && (Object.keys(currentRes.answers || {}).length > 0 || currentRes.score > 0);

    if (userActuallyParticipated) {
      const currentUserName = toSafeString(state.user?.name, 'Suvo Roy');
      const existsInList = list.some(item => 
        item.isCurrentUser || 
        item.name === currentUserName || 
        (item.name && String(item.name).includes('(আপনি)')) ||
        (item.name && String(item.name).includes(currentUserName))
      );
      
      if (!existsInList) {
        const rawScore = typeof currentRes.score === 'number' ? currentRes.score : (parseInt(currentRes.score) || 0);
        const rawTotal = typeof currentRes.total === 'number' ? currentRes.total : (parseInt(currentRes.total) || qTotal);
        
        list.push({
          id: `local-sub-${id}`,
          name: `${currentUserName} (আপনি)`,
          nameEn: `${currentUserName} (You)`,
          score: rawScore,
          total: rawTotal,
          time: toSafeString(currentRes.timeTaken, '0m 00s'),
          timeSec: typeof currentRes.timeTakenSec === 'number' ? currentRes.timeTakenSec : 9999,
          avatar: toSafeString(state.user?.avatar || state.user?.photoURL, ''),
          isCurrentUser: true
        });
      }
    }

    // Sort by ratio (score / total) DESCENDING, then by completion time ASCENDING
    return list.sort((a, b) => {
      const ratioA = a.score / (a.total || 1);
      const ratioB = b.score / (b.total || 1);
      if (ratioB !== ratioA) return ratioB - ratioA;
      return (a.timeSec || 0) - (b.timeSec || 0);
    });
  }, [realSubmissions, savedResult, submitted, isEn, state.user, id, exam]);

  // Is exam completed/ended?
  const isCompleted = useMemo(() => {
    if (!exam) return false;
    if (savedResult || submitted) return true;
    if (exam.status === 'completed' || exam.status === 'ended') return true;

    const startMs = parseExamDate(exam.startTime) || parseExamDate(exam.scheduledAt) || parseExamDate(exam.createdAt);
    const durationMins = typeof exam.duration === 'number' ? exam.duration : (parseInt(exam.duration) || 60);

    if (startMs) {
      const endMs = startMs + durationMins * 60 * 1000;
      return Date.now() >= endMs;
    }

    return false;
  }, [exam, savedResult, submitted]);

  function getExamResultLocal() {
    try {
      const results = JSON.parse(localStorage.getItem('live_exam_results')) || {};
      const res = results[id];
      if (!res || res.didNotAttend) return null;
      return res;
    } catch (e) {
      return null;
    }
  }

  const currentResult = useMemo(() => {
    if (savedResult) return savedResult;
    if (submitted) return getExamResultLocal();
    if (isCompleted && exam) {
      const qTotal = Array.isArray(exam.questions) ? exam.questions.length : 100;
      return { score: 0, total: qTotal, answers: {}, didNotAttend: true };
    }
    return null;
  }, [savedResult, submitted, isCompleted, exam, id]);

  const isDidNotAttend = useMemo(() => {
    if (!currentResult) return false;
    if (currentResult.didNotAttend === true) return true;
    
    // Check if user answered at least 1 question
    const answersObj = currentResult.answers || {};
    const answeredCount = Object.keys(answersObj).length;
    if (answeredCount === 0 && !currentResult.submittedAt && !currentResult.score) {
      return true;
    }
    
    if (!savedResult && !submitted) return true;
    return false;
  }, [currentResult, savedResult, submitted]);

  if (loadingExam) {
    return (
      <div className="page" style={{ paddingBottom: '100px', background: 'var(--bg-secondary)' }}>
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>
          <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800 }}>
            {isEn ? 'Live Exam Room' : 'লাইভ পরীক্ষা রুম'}
          </h1>
        </div>
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <ModernLoader
            text={isEn ? "Preparing Live Exam..." : "লাইভ পরীক্ষা প্রস্তুত হচ্ছে..."}
            subtext={isEn ? "Loading questions & timer settings" : "প্রশ্নপত্র ও টাইমার লোড করা হচ্ছে..."}
            icon="🏆"
            size="lg"
            isEn={isEn}
          />
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
    const durationMins = typeof exam?.duration === 'number' ? exam.duration : (parseInt(exam?.duration) || 10);
    const totalDurationSec = durationMins * 60;
    
    let elapsedSec = 0;
    if (typeof remainingSeconds === 'number' && remainingSeconds > 0 && remainingSeconds <= totalDurationSec) {
      elapsedSec = Math.max(1, totalDurationSec - remainingSeconds);
    } else {
      elapsedSec = Math.max(1, Math.floor((Date.now() - (roomEntryTime.current || Date.now())) / 1000));
    }
    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;
    const timeStr = `${mins}m ${String(secs).padStart(2, '0')}s`;

    const userName = state.user?.name || 'Suvo Roy';
    const userPhoto = state.user?.avatar || state.user?.photoURL || '';

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
            border: isDidNotAttend ? '1.5px solid #cbd5e1' : '1.5px solid var(--primary)',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>
              {isDidNotAttend ? '📝' : '🏆'}
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {isDidNotAttend 
                ? (isEn ? 'Did Not Participate' : 'অংশগ্রহণ করেননি')
                : (isEn ? 'Exam Results' : 'পরীক্ষার ফলাফল')}
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              {isDidNotAttend
                ? (isEn 
                    ? 'You did not participate in this live exam. However, you can review all correct answers and detailed solutions below.' 
                    : 'আপনি এই লাইভ পরীক্ষায় অংশগ্রহণ করেননি। তবে নিচে প্রশ্নের সঠিক উত্তর ও ব্যাখ্যা দেখে অনুশীলন করতে পারেন।')
                : (isEn 
                    ? 'Congratulations! You have completed the live test.' 
                    : 'অভিনন্দন! আপনি লাইভ পরীক্ষা সম্পন্ন করেছেন।')}
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
                  {isEn ? toSafeString(currentResult.total, '100') : toBengaliNumber(currentResult.total)}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                  {isDidNotAttend ? (isEn ? 'Status' : 'অবস্থা') : (isEn ? 'Your Score' : 'প্রাপ্ত নম্বর')}
                </span>
                <strong style={{ fontSize: isDidNotAttend ? '13px' : '18px', color: isDidNotAttend ? '#ef4444' : 'var(--success)', fontWeight: 800 }}>
                  {isDidNotAttend 
                    ? (isEn ? 'Did Not Participate' : 'অংশগ্রহণ করেননি')
                    : (isEn ? toSafeString(currentResult.score, '0') : toBengaliNumber(currentResult.score))}
                </strong>
              </div>
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
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '14px',
                    lineHeight: '1.45',
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <span>{isEn ? `${qIndex + 1}.` : `${toBengaliNumber(qIndex + 1)}.`}</span>
                    <span>{toSafeString(isEn ? (qn.questionEn || qn.question) : qn.question)}</span>
                  </h4>

                  {/* Option Choices */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {qOptions.map((option, oIndex) => {
                      const optText = toSafeString(isEn ? (qOptionsEn[oIndex] || option) : option);
                      const optionPrefixes = isEn ? ['A', 'B', 'C', 'D'] : ['ক', 'খ', 'গ', 'ঘ'];
                      const prefix = optionPrefixes[oIndex];

                      let bg = 'var(--bg-secondary)';
                      let color = 'var(--text-primary)';
                      let border = '1px solid var(--border-light)';
                      let trailingIcon = null;

                      // Styling based on state
                      if (currentResult) {
                        if (oIndex === qn.correctIndex) {
                          bg = '#d1fae5';
                          color = '#065f46';
                          border = '1px solid #34d399';
                          trailingIcon = (
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          );
                        } else if (oIndex === chosenIndex) {
                          bg = '#fee2e2';
                          color = '#991b1b';
                          border = '1px solid #f87171';
                          trailingIcon = (
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
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
                            padding: '9px 12px',
                            borderRadius: '10px',
                            background: bg,
                            color: color === 'var(--text-primary)' ? 'var(--text-secondary)' : color,
                            border: border,
                            cursor: !currentResult ? 'pointer' : 'default',
                            fontSize: '12px',
                            fontWeight: 500,
                            transition: 'all 0.2s ease',
                            gap: '8px'
                          }}
                        >
                          <span style={{
                            width: '21px',
                            height: '21px',
                            borderRadius: '50%',
                            background: 'rgba(0,0,0,0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {prefix}
                          </span>
                          <span style={{ flex: 1, lineHeight: '1.45' }}>{optText}</span>
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
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* NEW PREMIUM PODIUM DESIGN */}
            {leaderboardData.length > 0 && (
              <div style={{
                background: 'linear-gradient(180deg, #1e3a8a 0%, #111827 100%)',
                borderRadius: '28px',
                padding: '24px 10px 20px 10px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.7)',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '4px 14px',
                  borderRadius: '20px',
                  marginBottom: '24px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 1
                }}>
                  {isEn ? 'Daily Top Performers' : 'আজকের সেরা অংশগ্রহণকারী'}
                </div>

                {/* Podium Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.2fr 1fr',
                  width: '100%',
                  alignItems: 'flex-end',
                  gap: '5px',
                  position: 'relative',
                  zIndex: 2,
                  marginBottom: '10px'
                }}>
                  {/* RANK 2 */}
                  {leaderboardData[1] && (
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>2</div>
                      <div style={{ position: 'relative', width: '56px', height: '56px', marginBottom: '8px' }}>
                        {(leaderboardData[1].avatar && !leaderboardData[1].avatar.includes('dummy') && !leaderboardData[1].avatar.includes('placeholder')) ? (
                          <img
                            src={leaderboardData[1].avatar}
                            alt="Rank 2"
                            style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.4)', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, border: '2.5px solid rgba(255,255,255,0.4)' }}>
                            {leaderboardData[1].name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                          </div>
                        )}
                      </div>
                      <div style={{ color: 'white', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>
                        {leaderboardData[1].name.split(' ')[0]}
                      </div>
                      <div style={{ color: 'white', fontSize: '14px', fontWeight: 900, marginTop: '2px' }}>
                        {leaderboardData[1].score}
                      </div>
                    </div>
                  )}

                  {/* RANK 1 */}
                  {leaderboardData[0] && (
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(-15px)' }}>
                      <div style={{ fontSize: '24px', marginBottom: '4px', filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))' }}>👑</div>
                      <div style={{ position: 'relative', width: '74px', height: '74px', marginBottom: '8px' }}>
                        <div style={{
                          position: 'absolute', top: '-4px', left: '-4px', right: '-4px', bottom: '-4px',
                          borderRadius: '50%', border: '3px solid #fbbf24', animation: 'pulse 2s infinite'
                        }} />
                        {(leaderboardData[0].avatar && !leaderboardData[0].avatar.includes('dummy') && !leaderboardData[0].avatar.includes('placeholder')) ? (
                          <img
                            src={leaderboardData[0].avatar}
                            alt="Rank 1"
                            style={{ width: '100%', height: '100%', borderRadius: '50%', border: '3px solid #fbbf24', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fbbf24', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 900 }}>
                            {leaderboardData[0].name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                          </div>
                        )}
                      </div>
                      <div style={{ color: 'white', fontSize: '13px', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
                        {leaderboardData[0].name.split(' ')[0]}
                      </div>
                      <div style={{ color: '#fbbf24', fontSize: '18px', fontWeight: 900, marginTop: '2px' }}>
                        {leaderboardData[0].score}
                      </div>
                    </div>
                  )}

                  {/* RANK 3 */}
                  {leaderboardData[2] && (
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>3</div>
                      <div style={{ position: 'relative', width: '56px', height: '56px', marginBottom: '8px' }}>
                        {(leaderboardData[2].avatar && !leaderboardData[2].avatar.includes('dummy') && !leaderboardData[2].avatar.includes('placeholder')) ? (
                          <img
                            src={leaderboardData[2].avatar}
                            alt="Rank 3"
                            style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, border: '2.5px solid rgba(255,255,255,0.3)' }}>
                            {leaderboardData[2].name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                          </div>
                        )}
                      </div>
                      <div style={{ color: 'white', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>
                        {leaderboardData[2].name.split(' ')[0]}
                      </div>
                      <div style={{ color: 'white', fontSize: '14px', fontWeight: 900, marginTop: '2px' }}>
                        {leaderboardData[2].score}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FULL RANK LIST */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {leaderboardData.map((user, idx) => {
                const rank = idx + 1;
                const displayName = toSafeString(isEn ? user.nameEn : user.name, isEn ? 'Candidate' : 'পরীক্ষার্থী');
                const displayScore = toSafeString(user.score, '0');
                const displayTotal = toSafeString(user.total, (exam && Array.isArray(exam.questions) ? exam.questions.length : 100));

                return (
                  <div
                    key={user.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 16px',
                      borderRadius: '20px',
                      background: '#f0fdf4',
                      border: user.isCurrentUser ? '1.5px solid #22c55e' : '1px solid #dcfce7',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {/* Rank Circle */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: '1.5px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 800,
                      color: 'var(--text-secondary)',
                      flexShrink: 0,
                      background: 'var(--bg-secondary)'
                    }}>
                      {rank}
                    </div>

                    {/* Avatar */}
                    <div style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
                      {(user.avatar && !user.avatar.includes('dummy') && !user.avatar.includes('placeholder')) ? (
                        <img
                          src={user.avatar}
                          alt={displayName}
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--white)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, border: '2px solid var(--white)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          {displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {displayName}
                      </h4>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '3px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '3px' }}>
                           <span style={{ fontSize: '12px' }}>✓</span> {user.score} Correct
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '3px' }}>
                           <span style={{ fontSize: '12px' }}>✗</span> {user.total - user.score} Wrong
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{displayScore}</div>
                      <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', marginTop: '2px' }}>{isEn ? 'SCORE' : 'নম্বর'}</div>
                    </div>
                  </div>
                );
              })}

              {leaderboardData.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>🏆</span>
                  <p style={{ fontSize: '13px', fontWeight: 600 }}>
                    {isEn ? 'No real participants yet.' : 'এখনও কোনো অংশগ্রহণকারী নেই।'}
                  </p>
                </div>
              )}
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

const formatTimeTaken = (timeVal, isEn) => {
  if (!timeVal || timeVal === '0m 00s') return isEn ? '0m 00s' : '০মি: ০০সে:';
  const str = String(timeVal).trim();
  const match = str.match(/(\d+)\s*m\s*(\d+)\s*s/i);
  if (match) {
    const m = parseInt(match[1]);
    const s = parseInt(match[2]);
    if (isEn) {
      return `${m}m ${String(s).padStart(2, '0')}s`;
    } else {
      return `${toBengaliNumber(m)}মি: ${toBengaliNumber(s)}সে:`;
    }
  }
  return isEn ? str : toBengaliNumber(str);
};
