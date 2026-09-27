import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, BookmarkCheck, FileText, Download, Briefcase, Eye, Calendar } from '../components/Icons';
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

export default function ResultDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const isEn = state.language === 'en';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState('');
  const [modalType, setModalType] = useState('result');

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

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
          <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800 }}>{isEn ? 'Result Details' : 'ফলাফলের বিস্তারিত'}</h1>
        </div>
        <div style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '350px' }}>
          <ModernLoader size="lg" icon="📊" />
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
            <h1 style={{ flex: 1 }}>{isEn ? 'Result Details' : 'ফলাফলের বিস্তারিত'}</h1>
          </div>
          <ModernPageSkeleton type="details" icon="📊" />
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

  const handleViewResult = () => {
    const link = job.applyLink || job.applicationLink || job.link || job.url || job.downloadLink || job.examResult || 'https://alljobs.teletalk.com.bd';
    setModalUrl(link);
    setModalType('result');
    setIsModalOpen(true);
  };

  const handleDownloadNotice = async () => {
    if (circularImages.length === 0 && !job.examResult) return;
    setDownloading(true);
    const rawFileUrl = rawImagesList[activeImageIndex] || circularImages[activeImageIndex] || job.examResult;
    const fileName = `${job.organization || 'Result'}_Notice_Page_${activeImageIndex + 1}`;
    await downloadSecurely(rawFileUrl, fileName);
    setDownloading(false);
  };

  const handleApplyClick = () => {
    dispatch({ type: 'TOGGLE_APPLY_JOB', payload: job.id });
  };

  // Build bilingual strings
  const orgName = isEn ? (job.organizationEn || job.organization) : job.organization;
  const postName = isEn ? (job.titleEn || job.title) : job.title;

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1 }}>Result Details</h1>
        
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
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 6px 18px rgba(124, 58, 237, 0.25)',
            marginBottom: '14px',
            color: '#ffffff'
          }}>
            {displayIcon || '🏆'}
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
            {postName || orgName}
          </h2>

          {/* Result Date Status Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#f3e8ff',
            color: '#7c3aed',
            padding: '6px 16px',
            borderRadius: '20px',
            border: '1px solid #ddd6fe',
            fontSize: '13px',
            fontWeight: 700
          }}>
            <Calendar size={14} />
            <span>{isEn ? 'Result Date:' : 'ফলাফলের তারিখ:'} {job.resultDate || job.examDate || job.publishDate || job.date || 'প্রকাশিত'}</span>
          </div>
        </div>

        {/* Result Description Card (1:1 Reference Mockup Style) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
          border: '1px solid #f1f5f9',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>
            {isEn ? 'Result Description' : 'ফলাফলের বিবরণ'}
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
              color: '#7c3aed',
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
            {showFullDescription ? (isEn ? 'View Less ▲' : 'কম দেখুন ▲') : (isEn ? 'View More ▼' : 'আরও দেখুন ▼')}
          </button>
        </div>

        {/* Official Result Notice Section (1:1 Reference Mockup Style) */}
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
                {isEn ? 'Official Result Sheet' : 'ফলাফল বিজ্ঞপ্তি'}
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0', fontWeight: 500 }}>
                {isEn 
                  ? `Official Result Notice (${circularImages.length || 1} Page${circularImages.length > 1 ? 's' : ''})` 
                  : `ফলাফল বিজ্ঞপ্তি (${circularImages.length || 1}টি পেজ)`}
              </p>
            </div>

            {/* Action Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                background: '#f3e8ff',
                color: '#7c3aed',
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
                <Eye size={12} /> {showFullImage ? (isEn ? 'Collapse' : 'ছোট করুন') : (isEn ? 'Full' : 'বড় করুন')}
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9', background: '#f8fafc' }}>
            {circularImages.length > 0 ? (
              <ProgressiveImage
                src={circularImages[activeImageIndex]}
                alt={`Result Sheet Page ${activeImageIndex + 1}`}
                onClick={() => setShowFullImage(!showFullImage)}
                fallbackTitle={isEn ? 'Please click the button below to view official result sheet or download! 👇' : 'ফলাফল দেখতে বা ডাউনলোড করতে নিচের বাটনে চাপ দিন! 👇'}
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
                    {isEn ? 'Preview Not Available' : 'প্রিভিউ দেখা যাচ্ছে না?'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                    {isEn ? 'Please click the button below to view or download! 👇' : 'ফলাফল দেখতে বা ডাউনলোড করতে নিচের বাটনে চাপ দিন! 👇'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons Row */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              onClick={handleViewResult}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 14px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)'
              }}
            >
              <FileText size={15} color="#ffffff" />
              <span>{isEn ? 'View Result' : 'ফলাফল দেখুন'}</span>
            </button>

            <button
              onClick={handleDownloadNotice}
              disabled={downloading}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 14px',
                borderRadius: '14px',
                background: '#f3e8ff',
                color: '#7c3aed',
                fontWeight: 700,
                fontSize: '13px',
                border: '1px solid #ddd6fe',
                cursor: downloading ? 'wait' : 'pointer'
              }}
            >
              {downloading ? <ButtonSpinner size={14} color="#7c3aed" /> : <Download size={15} />}
              <span>{downloading ? (isEn ? 'Downloading...' : 'ডাউনলোড...') : (isEn ? 'Notice' : 'নোটিশ')}</span>
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
