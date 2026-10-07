import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import LiveExamCard from '../components/LiveExamCard';

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
    if (now >= start && now <= end) return 'running';
    return 'completed';
  };

  return (
    <div className="page" style={{ background: 'var(--bg-secondary)' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800 }}>
          {isEn ? 'Live MCQ Exams' : 'লাইভ এমসিকিউ পরীক্ষা'}
        </h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          {exams.map(exam => {
            const status = getStatus(exam.startTime, exam.duration);
            const startMs = new Date(exam.startTime || exam.scheduledAt).getTime();
            return (
              <LiveExamCard
                key={exam.id}
                exam={exam}
                status={status}
                startMs={startMs}
                isEn={isEn}
                onEnter={(id) => navigate(`/live-exam-room/${id}`)}
                onViewResult={(id) => navigate(`/live-exam-room/${id}`)}
              />
            );
          })}

          {exams.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
              <Clock size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>{isEn ? 'No live exams scheduled' : 'কোনো লাইভ পরীক্ষা পাওয়া যায়নি'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
