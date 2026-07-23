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

    // Calculate score
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
    <div className="page" style={{ paddingBottom: '100px', background: 'var(--bg)' }}>
      {/* Header */}
      <div className="page-header flex-between">
        <button className="back-btn" onClick={() => navigate('/live-exams')}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800 }}>
          {isEn ? exam.titleEn : exam.title}
        </h1>

        {/* Ticking Timer Badge in Header */}
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

      <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        
        {/* Result Header Panel */}
        {currentResult && (
          <div style={{
            background: 'var(--white)',
            border: '1.5px solid var(--primary)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-lg)',
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
              background: 'var(--bg)',
              padding: '12px',
              borderRadius: '12px'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                  {isEn ? 'Total Questions' : 'মোট প্রশ্ন'}
                </span>
                <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>
                  {isEn ? currentResult.total : toBengaliNumber(currentResult.total)}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                  {isEn ? 'Your Score' : 'প্রাপ্ত নম্বর'}
                </span>
                <strong style={{ fontSize: '16px', color: 'var(--success)' }}>
                  {isEn ? currentResult.score : toBengaliNumber(currentResult.score)}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Questions list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
          {exam.questions.map((qn, qIndex) => {
            const userSelections = currentResult ? currentResult.answers : selectedAnswers;
            const hasChosen = userSelections[qIndex] !== undefined;
            const chosenIndex = userSelections[qIndex];

            return (
              <div
                key={qIndex}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '18px',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)'
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

                    let bg = 'var(--bg)';
                    let color = 'var(--text-primary)';
                    let border = '1px solid var(--border)';
                    let trailingIcon = '';

                    // Styling based on state (taking exam vs viewing solution)
                    if (currentResult) {
                      // Solution mode
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
                      // Live exam taking mode
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
                          background: 'rgba(0,0,0,0.05)',
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

                {/* Explanations shown only in Solution view */}
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
