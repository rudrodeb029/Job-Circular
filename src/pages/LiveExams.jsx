import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, FileText } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { getLiveExams } from '../data/liveExams';
import BottomNav from '../components/BottomNav';

export default function LiveExams() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';
  
  const [exams, setExams] = useState([]);
  const [now, setNow] = useState(Date.now());

  // Tick the clock every second to update countdowns in real-time
  useEffect(() => {
    setExams(getLiveExams());
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getExamStatus = (exam) => {
    const startMs = new Date(exam.startTime).getTime();
    const endMs = startMs + exam.duration * 60 * 1000;

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
    if (diff <= 0) return '00:00';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (num) => String(num).padStart(2, '0');

    if (hours > 0) {
      return isEn 
        ? `${hours}h ${mins}m ${secs}s` 
        : `${toBengaliNumber(hours)} ঘণ্টা ${toBengaliNumber(mins)} মিনিট`;
    } else {
      return `${pad(mins)}:${pad(secs)}`;
    }
  };

  // Retrieve user results from localStorage
  const getExamResult = (examId) => {
    try {
      const results = JSON.parse(localStorage.getItem('live_exam_results')) || {};
      return results[examId];
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="page" style={{ paddingBottom: '100px', background: 'var(--bg)' }}>
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '18px', fontWeight: 800 }}>
          {isEn ? 'Live MCQ Exams' : 'লাইভ এমসিকিউ পরীক্ষা'}
        </h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        {/* Info Card */}
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '20px',
          boxShadow: '0 8px 20px rgba(239, 68, 68, 0.2)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '6px' }}>
            🔴 {isEn ? 'Live Exam Regulations' : 'লাইভ পরীক্ষার নিয়মাবলী'}
          </h3>
          <p style={{ fontSize: '12px', lineHeight: 1.5, opacity: 0.95, margin: 0 }}>
            {isEn 
              ? 'Participate in real-time competitive exams. The exam starts exactly at the scheduled time. Results will be calculated instantly upon submission.'
              : 'নির্ধারিত সময়ে সরাসরি লাইভ পরীক্ষায় অংশ নিন। পরীক্ষা শুরু হওয়ার পর সময়ের মধ্যে সাবমিট করতে হবে। সময় শেষ হলে স্বয়ংক্রিয়ভাবে সাবমিট হয়ে যাবে।'}
          </p>
        </div>

        {/* Exams List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {exams.map(exam => {
            const status = getExamStatus(exam);
            const startMs = new Date(exam.startTime).getTime();
            const result = getExamResult(exam.id);

            return (
              <div
                key={exam.id}
                style={{
                  background: 'var(--white)',
                  border: status === 'running' ? '1.5px solid #ef4444' : '1px solid var(--border-light)',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: 'var(--shadow-md)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Red Pulse Accent for Active Exam */}
                {status === 'running' && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: '#ef4444'
                  }}></div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  {/* Status Badge */}
                  {status === 'running' && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#ffffff',
                      background: '#ef4444',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      animation: 'pulse 1.5s infinite'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff', display: 'inline-block' }}></span>
                      {isEn ? 'LIVE NOW' : 'লাইভ চলছে'}
                    </span>
                  )}

                  {status === 'upcoming' && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--warning)',
                      background: 'rgba(245, 158, 11, 0.1)',
                      padding: '4px 10px',
                      borderRadius: '20px'
                    }}>
                      ⏳ {isEn ? 'UPCOMING' : 'আসন্ন পরীক্ষা'}
                    </span>
                  )}

                  {status === 'completed' && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      background: 'var(--bg-secondary)',
                      padding: '4px 10px',
                      borderRadius: '20px'
                    }}>
                      ✅ {isEn ? 'COMPLETED' : 'শেষ হয়েছে'}
                    </span>
                  )}

                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    ⏱️ {isEn ? `${exam.duration} Mins` : `${toBengaliNumber(exam.duration)} মিনিট`}
                  </span>
                </div>

                <h4 style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                  lineHeight: '1.4'
                }}>
                  {isEn ? exam.titleEn : exam.title}
                </h4>

                {/* Exam Timing Details */}
                <div style={{
                  background: 'var(--bg)',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px'
                }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    📅 {isEn ? 'Start Time:' : 'শুরুর সময়:'}{' '}
                    <strong>
                      {new Date(exam.startTime).toLocaleString(isEn ? 'en-US' : 'bn-BD', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </strong>
                  </span>
                </div>

                {/* Bottom Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {status === 'upcoming' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {isEn ? 'Starts in:' : 'শুরু হতে বাকি:'}
                      </span>
                      <strong style={{ fontSize: '13px', color: 'var(--warning)', fontFamily: 'monospace' }}>
                        {getCountdownString(startMs)}
                      </strong>
                    </div>
                  )}

                  {status === 'running' && (
                    <button
                      onClick={() => navigate(`/live-exam-room/${exam.id}`)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      {isEn ? 'Enter Exam Room' : 'পরীক্ষায় অংশ নিন'} ➔
                    </button>
                  )}

                  {status === 'completed' && (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {result ? (
                        <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 700 }}>
                          🏆 {isEn 
                            ? `Your Score: ${result.score}/${result.total}`
                            : `আপনার স্কোর: ${toBengaliNumber(result.score)}/${toBengaliNumber(result.total)}`}
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {isEn ? 'You did not attend' : 'আপনি অংশ নেননি'}
                        </span>
                      )}
                      
                      <button
                        onClick={() => navigate(`/live-exam-room/${exam.id}`)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          background: 'transparent',
                          color: 'var(--primary)',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {isEn ? 'View Solutions' : 'সমাধান দেখুন'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {exams.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📅</span>
              <p style={{ fontSize: '14px', fontWeight: 600 }}>
                {isEn ? 'No live exams scheduled' : 'কোনো লাইভ পরীক্ষা নির্ধারণ করা নেই'}
              </p>
            </div>
          )}
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
