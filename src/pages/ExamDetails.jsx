import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, BookmarkCheck, Calendar, Briefcase, Download } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { jobs } from '../data/jobs';
import { NotFoundPage } from '../components/ErrorState';
import BottomNav from '../components/BottomNav';

const categoryStyles = {
  gov: { bg: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)', shadow: 'rgba(29, 78, 216, 0.35)', defaultIcon: '🏛️' },
  bank: { bg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', shadow: 'rgba(5, 150, 105, 0.35)', defaultIcon: '🏦' },
  ngo: { bg: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)', shadow: 'rgba(234, 88, 12, 0.35)', defaultIcon: '🤝' },
  private: { bg: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', shadow: 'rgba(124, 58, 237, 0.35)', defaultIcon: '🏢' },
  teaching: { bg: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)', shadow: 'rgba(219, 39, 119, 0.35)', defaultIcon: '📚' },
  defense: { bg: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', shadow: 'rgba(220, 38, 38, 0.35)', defaultIcon: '🛡️' },
  health: { bg: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)', shadow: 'rgba(13, 148, 136, 0.35)', defaultIcon: '🏥' },
  it: { bg: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', shadow: 'rgba(79, 70, 229, 0.35)', defaultIcon: '💻' },
  engineering: { bg: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', shadow: 'rgba(217, 119, 6, 0.35)', defaultIcon: '⚙️' },
  parttime: { bg: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)', shadow: 'rgba(2, 132, 199, 0.35)', defaultIcon: '⏰' }
};

const orgIconsMap = {
  'শিক্ষা মন্ত্রণালয়': '🏛️',
  'সোনালী ব্যাংক লিমিটেড': '🏦',
  'বাংলাদেশ পুলিশ': '👮',
  'ব্র্যাক': '🤝',
  'গ্রামীণফোন': '📱',
  'বাংলাদেশ সেনাবাহিনী': '🛡️',
  'ইসলামী ব্যাংক': '🕌',
  'বাংলাদেশ রেলওয়ে': '🚂',
  'ডাক ও টেলিযোগাযোগ মন্ত্রণালয়': '📡',
  'স্বাস্থ্য অধিদপ্তর': '🏥',
  'বাংলাদেশ ব্যাংক': '🏛️',
  'ভিকারুননিসা নূন স্কুল এন্ড কলেজ': '🎓',
  'এলজিইডি': '🏗️',
  'বিকাশ লিমিটেড': '💸',
  'আশা': '🌱',
  'জনতা ব্যাংক': '🏦',
  'স্কয়ার হাসপাতাল': '🩺',
  'পাঠাও': '🚀',
  'রাজউক উত্তরা মডেল কলেজ': '🏫',
  'রূপালী ব্যাংক': '🏦'
};

export default function ExamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Load jobs from localStorage or static data
  const localJobs = JSON.parse(localStorage.getItem('admin_jobs')) || jobs;
  const job = localJobs.find(j => j.id === id);

  if (!job) return <NotFoundPage />;

  const circularImages = job.circularImages && job.circularImages.length > 0 
    ? job.circularImages 
    : [job.circularImage || '/job_circular_notice.png', '/job_circular_notice.png'];

  const isSaved = state.savedJobs.includes(job.id);
  const isApplied = state.appliedJobs.includes(job.id);

  const styleConfig = categoryStyles[job.category] || categoryStyles.gov;
  const displayIcon = job.icon || orgIconsMap[job.organization] || styleConfig.defaultIcon;

  const handleApplyClick = () => {
    dispatch({ type: 'TOGGLE_APPLY_JOB', payload: job.id });
  };

  const handleDownloadAdmitCard = () => {
    const link = job.examLink || job.applyLink;
    if (link) {
      window.open(link, '_blank');
    }
  };

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1 }}>Exam Details</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            className="back-btn"
            onClick={handleApplyClick}
            style={{
              background: isApplied ? '#ecfdf5' : 'transparent',
              color: isApplied ? '#059669' : 'inherit',
              border: isApplied ? '1px solid #a7f3d0' : 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px'
            }}
          >
            <Briefcase size={20} style={{ color: isApplied ? '#059669' : 'var(--primary)' }} />
          </button>

          <button
            className="back-btn"
            onClick={() => dispatch({ type: 'TOGGLE_SAVE_JOB', payload: job.id })}
          >
            {isSaved ?
              <BookmarkCheck size={22} style={{ color: 'var(--primary)' }} /> :
              <Bookmark size={22} />
            }
          </button>
        </div>
      </div>

      <div className="page-content animate-fade-in">
        {/* Title Card */}
        <div className="card" style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <div style={{
            background: styleConfig.bg,
            color: 'white',
            margin: '0 auto var(--space-md)',
            fontSize: '32px',
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 6px 18px ${styleConfig.shadow}`
          }}>
            {displayIcon}
          </div>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '4px' }}>{job.title}</h2>
          <p className="text-secondary" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-md)' }}>
            {job.organization}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="chip">{job.type}</span>
            <span className="chip chip-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              📅 Exam Date: {job.examDate}
            </span>
          </div>
        </div>

        {/* Exam Information Panel */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)', borderLeft: '4px solid #10b981' }}>
          <h3 className="font-bold mb-xs" style={{ fontSize: 'var(--text-base)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📢 Exam Schedule / পরীক্ষার বিবরণ
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            {job.examCenter && (
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>🏢 Center / কেন্দ্র:</strong> {job.examCenter}
              </div>
            )}
            {job.examTime && (
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>⏰ Time / সময়:</strong> {job.examTime}
              </div>
            )}
          </div>

          {/* Subjects Syllabus */}
          {job.examSubjects && (
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                📖 Exam Syllabus & Marks / বিষয়সমূহ ও নম্বর বণ্টন:
              </h4>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '12px', border: '1px solid var(--border-light)' }}>
                {job.examSubjects.map((sub, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '6px 0', 
                      borderBottom: idx < job.examSubjects.length - 1 ? '1px solid var(--border-light)' : 'none', 
                      fontSize: '12px' 
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sub.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{sub.marks} Marks</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {job.examInstructions && (
            <div style={{ marginTop: '16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '12px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#b45309', marginBottom: '4px' }}>
                ⚠️ Instructions / সাধারণ নির্দেশনাবলী:
              </h4>
              <p style={{ fontSize: '11px', color: '#92400e', lineHeight: 1.5, margin: 0 }}>
                {job.examInstructions}
              </p>
            </div>
          )}
        </div>

        {/* Circular Notice Attachment Section */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 className="font-bold mb-xs" style={{ fontSize: 'var(--text-base)' }}>নিয়োগ বিজ্ঞপ্তি / Official Notice</h3>
          
          <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border-light)', marginTop: '12px' }}>
            <img
              src={circularImages[activeImageIndex]}
              alt={`Circular Notice Page ${activeImageIndex + 1}`}
              style={{
                width: '100%',
                maxHeight: '380px',
                objectFit: 'cover',
                objectPosition: 'top',
                display: 'block'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <a
              href={circularImages[activeImageIndex]}
              download={`${job.title || 'Job'}_Circular_Notice_Page_${activeImageIndex + 1}.png`}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 10px',
                borderRadius: '12px',
                background: 'var(--primary-bg)',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '13px',
                border: '1.5px solid #dbeafe',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(26, 86, 219, 0.08)',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
            >
              <Download size={16} /> Notice {circularImages.length > 1 ? `(${activeImageIndex + 1})` : ''}
            </a>

            <button
              onClick={handleDownloadAdmitCard}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 10px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <Download size={16} color="#ffffff" />
              Download admit cards
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
