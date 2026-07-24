import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, BookmarkCheck, Calendar, Briefcase, Download, Eye } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
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
  const [showFullImage, setShowFullImage] = useState(false);

  // Load jobs from AdminContext
  const { state: adminState } = useAdminContext();
  const localJobs = adminState.jobs;
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
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#334155', marginBottom: '12px' }}>
            {state.language === 'en' ? (job.organizationEn || job.organization) : job.organization}
          </h2>


        </div>

        {/* Instructions */}
        {job.examInstructions && (
          <div className="card" style={{ 
            marginBottom: 'var(--space-lg)', 
            borderLeft: '4px solid var(--chip-warning-border)', 
            background: 'var(--chip-warning-bg)' 
          }}>
            <h3 className="font-bold mb-xs" style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--chip-warning-color)' }}>
              ⚠️ Instructions / সাধারণ নির্দেশনাবলী
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '10px', margin: '10px 0 0 0' }}>
              {job.examInstructions}
            </p>
          </div>
        )}

        {/* Circular Notice Attachment Section */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-secondary)', margin: '0 0 2px 0' }}>
                {state.language === 'en' ? 'Official Notice' : 'অফিসিয়াল নোটিশ'}
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                {state.language === 'en' 
                  ? `Official Exam Notice (${circularImages.length} Page${circularImages.length > 1 ? 's' : ''})` 
                  : `অফিসিয়াল নোটিশ (${circularImages.length}টি পেজ)`}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                background: 'var(--primary-bg)',
                color: 'var(--primary)',
                padding: '3px 8px',
                borderRadius: '8px',
                whiteSpace: 'nowrap'
              }}>
                {state.language === 'en' ? 'Page' : 'পেজ'} {activeImageIndex + 1} / {circularImages.length}
              </span>
              <button
                onClick={() => setShowFullImage(!showFullImage)}
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-secondary)',
                  padding: '3px 8px',
                  borderRadius: '8px',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <Eye size={11} /> {showFullImage ? (state.language === 'en' ? 'Collapse' : 'ছোট করুন') : (state.language === 'en' ? 'Full' : 'বড় করুন')}
              </button>
            </div>
          </div>

          {/* Main Image Viewer Container with Prev/Next Overlay Buttons */}
          <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border-light)', marginTop: '12px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)' }}>
            <img
              src={circularImages[activeImageIndex]}
              alt={`Circular Notice Page ${activeImageIndex + 1}`}
              onClick={() => setShowFullImage(!showFullImage)}
              style={{
                width: '100%',
                maxHeight: showFullImage ? 'none' : '380px',
                objectFit: 'cover',
                objectPosition: 'top',
                display: 'block',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />

            {/* Prev & Next Floating Navigation Arrow Buttons */}
            {circularImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(prev => (prev > 0 ? prev - 1 : circularImages.length - 1));
                  }}
                  title="Previous Page"
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid var(--border-light)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '20px',
                    fontWeight: 800,
                    zIndex: 10
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(prev => (prev < circularImages.length - 1 ? prev + 1 : 0));
                  }}
                  title="Next Page"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid var(--border-light)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '20px',
                    fontWeight: 800,
                    zIndex: 10
                  }}
                >
                  ›
                </button>
              </>
            )}

            {!showFullImage && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '60px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.92) 100%)',
                pointerEvents: 'none'
              }}></div>
            )}
          </div>

          {/* Thumbnail Strip / Page Selector Tabs */}
          {circularImages.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
              {circularImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    flex: '0 0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: idx === activeImageIndex ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: idx === activeImageIndex ? 'var(--primary-bg)' : 'var(--white)',
                    color: idx === activeImageIndex ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: idx === activeImageIndex ? 800 : 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{state.language === 'en' ? 'Page' : 'পেজ'} {idx + 1}</span>
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <a
              href={circularImages[activeImageIndex]}
              download={`${job.title || 'Job'}_Circular_Notice_Page_${activeImageIndex + 1}.png`}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '10px 6px',
                borderRadius: '12px',
                background: 'var(--primary-bg)',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '12px',
                border: '1.5px solid #dbeafe',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(26, 86, 219, 0.08)',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}
            >
              <Download size={14} /> {state.language === 'en' ? 'Notice' : 'নোটিশ'} {circularImages.length > 1 ? `(${activeImageIndex + 1})` : ''}
            </a>

            <button
              onClick={handleDownloadAdmitCard}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '10px 6px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '12px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Download size={14} color="#ffffff" />
              {state.language === 'en' ? 'Admit Card' : 'প্রবেশপত্র'}
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
