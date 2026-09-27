import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, BookmarkCheck, Calendar, Briefcase, Download, Eye } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { jobs } from '../data/jobs';
import { NotFoundPage } from '../components/ErrorState';
import ModernLoader, { ButtonSpinner, ModernPageSkeleton } from '../components/ModernLoader';
import { downloadSecurely } from '../utils/downloadUtils';
import { normalizeMediaUrls, getGoogleDriveFileId, extractJobMediaList } from '../utils/mediaUtils';
import { getJobIconAndStyle } from '../utils/jobIconUtils';
import ProgressiveImage from '../components/ProgressiveImage';
import PortalWarningModal from '../components/PortalWarningModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState('');
  const [modalType, setModalType] = useState('admit_card');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  // Load jobs from AdminContext
  const { state: adminState } = useAdminContext();
  const localJobs = adminState.jobs;
  const job = localJobs.find(j => j.id === id);

  // Auto-mark notifications as read when viewing details
  React.useEffect(() => {
    if (job) {
      const relatedNotifs = (adminState.notifications || []).filter(n => n.jobId === job.id);
      relatedNotifs.forEach(n => {
        if (!state.readNotifications.includes(n.id)) {
          dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id });
        }
      });
    }
  }, [job, adminState.notifications, state.readNotifications, dispatch]);

  if (pageLoading) {
    return (
      <div className="page" style={{ paddingBottom: '100px', background: 'var(--bg)' }}>
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>
          <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800 }}>{state.language === 'en' ? 'Exam Details' : 'পরীক্ষার বিস্তারিত'}</h1>
        </div>
        <div style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '350px' }}>
          <ModernLoader size="lg" icon="📅" />
        </div>
      </div>
    );
  }

  if (!job) {
    if (adminState?.loading || (localJobs && localJobs.length === 0)) {
      return (
        <div className="page" style={{ paddingBottom: '100px' }}>
          <div className="page-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={22} />
            </button>
            <h1 style={{ flex: 1 }}>{state.language === 'en' ? 'Exam Details' : 'পরীক্ষার বিস্তারিত'}</h1>
          </div>
          <ModernPageSkeleton type="details" icon="📅" />
        </div>
      );
    }
    return <NotFoundPage />;
  }

  const rawImagesList = extractJobMediaList(job);
  const circularImages = normalizeMediaUrls(rawImagesList);

  const isSaved = state.savedJobs.includes(job.id);
  const isApplied = state.appliedJobs.includes(job.id);

  const { icon: displayIcon, style: styleConfig } = getJobIconAndStyle(job);

  const handleApplyClick = () => {
    dispatch({ type: 'TOGGLE_APPLY_JOB', payload: job.id });
  };

  const handleDownloadNotice = async (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    
    const rawFileUrl = rawImagesList[activeImageIndex] ||
                       circularImages[activeImageIndex] ||
                       job.imageUrl ||
                       job.circularImage ||
                       job.noticeUrl ||
                       job.noticeImage ||
                       job.pdfUrl ||
                       (job.images && job.images[0]) ||
                       job.downloadLink ||
                       job.examLink ||
                       job.applyLink;

    if (!rawFileUrl || rawFileUrl === '#' || rawFileUrl.trim() === '') {
      const link = job.examLink || job.downloadLink || job.applyLink || 'https://alljobs.teletalk.com.bd';
      setModalUrl(link);
      setModalType('admit_card');
      setIsModalOpen(true);
      return;
    }

    setDownloading(true);
    try {
      const fileName = `${job.organization || orgName || 'Exam'}_Notice_Page_${activeImageIndex + 1}`;
      const success = await downloadSecurely(rawFileUrl, fileName);
      if (!success) {
        const link = normalizeMediaUrl(rawFileUrl) || job.examLink || job.applyLink || 'https://alljobs.teletalk.com.bd';
        setModalUrl(link);
        setModalType('admit_card');
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Notice download error:', err);
      const link = normalizeMediaUrl(rawFileUrl) || job.examLink || job.applyLink || 'https://alljobs.teletalk.com.bd';
      setModalUrl(link);
      setModalType('admit_card');
      setIsModalOpen(true);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadAdmitCard = () => {
    const link = job.examLink || job.applyLink || 'https://alljobs.teletalk.com.bd';
    setModalUrl(link);
    setModalType('admit_card');
    setIsModalOpen(true);
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

      <div className="page-content animate-fade-in" style={{ padding: '16px 14px', maxWidth: '540px', margin: '0 auto' }}>
        {/* Main Header Card (1:1 Pixel-Perfect Matching Reference Mockup) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px 20px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
          border: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          {/* Category Icon Badge Container */}
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 6px 18px rgba(37, 99, 235, 0.25)',
            marginBottom: '14px',
            color: '#ffffff'
          }}>
            {displayIcon || '📅'}
          </div>

          {/* Main Title Name */}
          <h2 style={{
            fontSize: '17px',
            fontWeight: 800,
            color: '#1e293b',
            lineHeight: 1.4,
            marginBottom: '14px',
            fontFamily: '"Hind Siliguri", sans-serif'
          }}>
            {state.language === 'en' ? (job.titleEn || job.organizationEn || job.title) : (job.title || job.organization)}
          </h2>

          {/* Exam Date Status Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#eff6ff',
            color: '#2563eb',
            padding: '6px 16px',
            borderRadius: '20px',
            border: '1px solid #dbeafe',
            fontSize: '13px',
            fontWeight: 700
          }}>
            <Calendar size={14} />
            <span>{state.language === 'en' ? 'Exam Date:' : 'পরীক্ষার তারিখ:'} {job.examDate || job.date || job.deadline || 'সন্নিকটে'}</span>
          </div>
        </div>

        {/* Exam Description Card (1:1 Reference Mockup Style) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
          border: '1px solid #f1f5f9',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>
            {state.language === 'en' ? 'Exam Details' : 'পরীক্ষার বিবরণ'}
          </h3>
          <p style={{
            fontSize: '13.5px',
            lineHeight: 1.65,
            color: '#475569',
            display: '-webkit-box',
            WebkitLineClamp: showFullDescription ? 'unset' : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            margin: 0
          }}>
            {job.description}
          </p>
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            style={{
              color: '#2563eb',
              fontWeight: 700,
              fontSize: '13px',
              marginTop: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: 0
            }}
          >
            {showFullDescription ? (state.language === 'en' ? 'View Less ▲' : 'কম দেখুন ▲') : (state.language === 'en' ? 'View More ▼' : 'আরও দেখুন ▼')}
          </button>
        </div>

        {/* Instructions Warning Card */}
        {job.examInstructions && (
          <div style={{
            background: '#fffbebf0',
            borderRadius: '20px',
            padding: '18px 20px',
            border: '1px solid #fef3c7',
            marginBottom: '16px',
            boxShadow: '0 4px 20px rgba(217, 119, 6, 0.05)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#b45309', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⚠️ {state.language === 'en' ? 'Exam Instructions' : 'সাধারণ নির্দেশনাবলী'}
            </h3>
            <p style={{ fontSize: '13px', color: '#78350f', lineHeight: 1.6, margin: 0 }}>
              {job.examInstructions}
            </p>
          </div>
        )}

        {/* Official Exam Notice Section (1:1 Reference Mockup Style) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
          border: '1px solid #f1f5f9',
          marginBottom: '16px'
        }}>
          {/* Section Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                {state.language === 'en' ? 'Official Exam Notice' : 'পরীক্ষার নোটিশ'}
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0', fontWeight: 500 }}>
                {state.language === 'en' 
                  ? `Official Exam Notice (${circularImages.length || 1} Page${circularImages.length > 1 ? 's' : ''})` 
                  : `পরীক্ষার নোটিশ (${circularImages.length || 1}টি পেজ)`}
              </p>
            </div>

            {/* Action Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                background: '#eff6ff',
                color: '#2563eb',
                padding: '4px 12px',
                borderRadius: '12px'
              }}>
                Page {activeImageIndex + 1} / {circularImages.length || 1}
              </span>
              <button
                onClick={() => setShowFullImage(!showFullImage)}
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#475569',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Eye size={12} /> {showFullImage ? (state.language === 'en' ? 'Collapse' : 'ছোট করুন') : (state.language === 'en' ? 'Full' : 'বড় করুন')}
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9', background: '#f8fafc' }}>
            {circularImages.length > 0 ? (
              <ProgressiveImage
                src={circularImages[activeImageIndex]}
                alt={`Exam Notice Page ${activeImageIndex + 1}`}
                onClick={() => setShowFullImage(!showFullImage)}
                fallbackTitle={state.language === 'en' ? 'Please click the button below to view or download! 👇' : 'প্রবেশপত্র বা নোটিশ ডাউনলোড করতে নিচের বাটনে চাপ দিন! 👇'}
                downloadUrl={rawImagesList[activeImageIndex] || circularImages[activeImageIndex]}
                objectFit="contain"
                style={{
                  maxHeight: showFullImage ? 'none' : '400px'
                }}
              />
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                textAlign: 'center',
                gap: '12px'
              }}>
                <div style={{ fontSize: '36px' }}>📄</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>
                    {state.language === 'en' ? 'Preview Not Available' : 'প্রিভিউ দেখা যাচ্ছে না?'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                    {state.language === 'en' ? 'Please click the button below to download! 👇' : 'প্রবেশপত্র বা নোটিশ ডাউনলোড করতে নিচের বাটনে চাপ দিন! 👇'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons Row */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              disabled={downloading}
              onClick={handleDownloadNotice}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 14px',
                borderRadius: '14px',
                background: '#eff6ff',
                color: '#2563eb',
                fontWeight: 700,
                fontSize: '13px',
                border: '1px solid #dbeafe',
                cursor: downloading ? 'wait' : 'pointer'
              }}
            >
              {downloading ? <ButtonSpinner size={14} color="#2563eb" /> : <Download size={15} />}
              <span>{downloading ? (state.language === 'en' ? 'Downloading...' : 'ডাউনলোড...') : (state.language === 'en' ? 'Notice' : 'নোটিশ')}</span>
            </button>

            <button
              onClick={handleDownloadAdmitCard}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 14px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
              }}
            >
              <Download size={15} color="#ffffff" />
              <span>{state.language === 'en' ? 'Admit Card' : 'প্রবেশপত্র'}</span>
            </button>
          </div>
        </div>
      </div>

      <PortalWarningModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        url={modalUrl}
        pageType={modalType}
      />
    </div>
  );
}
