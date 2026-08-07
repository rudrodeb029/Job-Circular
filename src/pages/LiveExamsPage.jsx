import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Users, ChevronRight } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import BottomNav from '../components/BottomNav';
import { formatTimeAgo } from '../utils/timeUtils';

export default function LiveExamsPage() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { state: adminState } = useAdminContext();
  const isEn = state.language === 'en';

  const exams = adminState.liveExams || [];

  const getStatus = (startTime, duration) => {
    const start = new Date(startTime).getTime();
    const end = start + (duration * 60 * 1000);
    const now = Date.now();

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'live';
    return 'ended';
  };

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800 }}>
          {isEn ? 'Live MCQ Exams' : 'লাইভ এমসিকিউ পরীক্ষা'}
        </h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {exams.map(exam => {
            const status = getStatus(exam.startTime, exam.duration);
            return (
              <div
                key={exam.id}
                className="job-card"
                onClick={() => navigate(`/live-exam-room/${exam.id}`)}
                style={{
                  padding: '16px',
                  border: status === 'live' ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                  position: 'relative'
                }}
              >
                {status === 'live' && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800 }}>
                    <div className="pulse" style={{ width: '6px', height: '6px', background: '#dc2626', borderRadius: '50%' }}></div>
                    LIVE
                  </div>
                )}

                <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  {isEn ? exam.titleEn : exam.title}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px' }}>
                    <Calendar size={14} />
                    <span>{new Date(exam.startTime).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px' }}>
                    <Clock size={14} />
                    <span>{new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <span style={{ fontSize: '10px', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px' }}>
                            {exam.duration} {isEn ? 'Mins' : 'মিনিট'}
                        </span>
                        <span style={{ fontSize: '10px', background: 'var(--primary-lightest)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            {exam.questions?.length || 100} Qs
                        </span>
                    </div>
                    <button style={{
                        background: status === 'ended' ? '#64748b' : 'var(--primary)',
                        color: 'white', border: 'none', padding: '6px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: 700
                    }}>
                        {status === 'upcoming' ? (isEn ? 'Join' : 'অংশ নিন') : status === 'live' ? (isEn ? 'Start Now' : 'এখনই শুরু করুন') : (isEn ? 'Results' : 'ফলাফল')}
                    </button>
                </div>
              </div>
            );
          })}

          {exams.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <Clock size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>{isEn ? 'No live exams scheduled' : 'কোনো লাইভ পরীক্ষা পাওয়া যায়নি'}</p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
