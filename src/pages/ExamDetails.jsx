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
import FormattedText from '../components/FormattedText';
import FileDownloadModal from '../components/FileDownloadModal';
import { stripHtmlTags } from '../utils/textUtils';
import { showNativeInterstitialAd } from '../utils/admobUtils';
import { openInAppBrowser } from '../utils/browserUtils';

import DetailsHeaderCard from '../components/DetailsHeaderCard';

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
  const [downloading, setDownloading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadFileName, setDownloadFileName] = useState('');
  const [downloadDetails, setDownloadDetails] = useState('');

  // Load jobs from AdminContext
  const { state: adminState } = useAdminContext();
  const localJobs = adminState.jobs || [];
  const localAdmits = adminState.admits || [];
  const cleanId = String(id || '').replace(/^(admit-|result-|exam_|result_|dynamic-exam-|dynamic-result-)/, '');
  const matchedAdmit = localAdmits.find(
    a => String(a.id) === String(id) || String(a.jobId) === String(id) || String(a.jobId) === cleanId || String(a.id) === `admit-${cleanId}` || String(a.id) === `result-${cleanId}`
  );
  const matchedJob = localJobs.find(
    j => String(j.id) === String(id) || String(j.id) === cleanId || (matchedAdmit?.jobId && String(j.id) === String(matchedAdmit.jobId))
  );
  const job = matchedJob
    ? {
        ...matchedJob,
        examDate: matchedJob.examDate || matchedAdmit?.date || '',
        examLink: matchedJob.examLink || matchedAdmit?.downloadLink || matchedJob.applyLink || '',
        examResult: matchedJob.examResult || matchedAdmit?.downloadLink || ''
      }
    : matchedAdmit
      ? {
          id: matchedAdmit.jobId || cleanId || matchedAdmit.id,
          organization: matchedAdmit.organization || matchedAdmit.examName || '',
          organizationEn: matchedAdmit.organizationEn || matchedAdmit.organization || '',
          title: matchedAdmit.examName || matchedAdmit.organization || '',
          titleEn: matchedAdmit.examNameEn || matchedAdmit.examName || '',
          description: matchedAdmit.description || matchedAdmit.examName || '',
          category: matchedAdmit.category || '',
          type: matchedAdmit.jobType || '',
          examDate: matchedAdmit.date || '',
          examDateEn: matchedAdmit.dateEn || matchedAdmit.date || '',
          examLink: matchedAdmit.downloadLink || '',
          applyLink: matchedAdmit.downloadLink || '',
          downloadLink: matchedAdmit.downloadLink || '',
          examResult: matchedAdmit.downloadLink || '',
          imageUrl: matchedAdmit.imageUrl || matchedAdmit.noticeUrl || '',
          images: matchedAdmit.images || [],
          createdAt: matchedAdmit.createdAt,
          showInExamDate: matchedAdmit.type === 'admit_card',
          showInResult: matchedAdmit.type === 'result'
        }
      : undefined;

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
    if (downloading) return;

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
                       job.applyLink ||
                       job.applicationLink ||
                       job.link ||
                       job.url ||
                       'http://alljobs.teletalk.com.bd';

    setDownloading(true);
    try {
      await openInAppBrowser(rawFileUrl);
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

      <div className="page-content animate-fade-in">
        {/* Modern Gradient Fluid Header Card */}
        <DetailsHeaderCard
          title={stripHtmlTags(state.language === 'en' ? (job.titleEn || job.organizationEn || job.title || job.organization) : (job.title || job.organization))}
          categoryId={job.categoryId || job.category}
          type="exam"
          date={job.examDate || job.date || job.deadline}
          time={job.examTime || '10:00 AM'}
          isEn={state.language === 'en'}
        />

        {/* Job Description Section */}
        <div
          className="card"
          style={{
            marginBottom: 'var(--space-lg)',
            background: state.theme === 'dark' ? 'var(--card-bg, #1e293b)' : '#ffffff',
            borderRadius: '20px',
            border: state.theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(219, 234, 254, 0.8)',
            boxShadow: state.theme === 'dark' ? '0 8px 24px -4px rgba(0, 0, 0, 0.4)' : '0 8px 24px -4px rgba(37, 99, 235, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
            padding: '16px'
          }}
        >
          <h3 className="font-bold mb-xs" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {state.language === 'en' ? 'Description' : 'পরীক্ষার বিবরণ'}
          </h3>
          <FormattedText text={job.description} />
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
            <p style={{ fontSize: '11px', color: 'var(--text-primary)', lineHeight: 1.65, marginTop: '10px', margin: '10px 0 0 0' }}>
              {job.examInstructions}
            </p>
          </div>
        )}

        {/* AdMob Native Advanced Ad Card (Non-intrusive, dismissible) */}


        {/* Circular Notice Attachment Section */}
        <div
          className="card"
          style={{
            marginBottom: 'var(--space-lg)',
            background: state.theme === 'dark' ? 'var(--card-bg, #1e293b)' : '#ffffff',
            borderRadius: '20px',
            border: state.theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(219, 234, 254, 0.8)',
            boxShadow: state.theme === 'dark' ? '0 8px 24px -4px rgba(0, 0, 0, 0.4)' : '0 8px 24px -4px rgba(37, 99, 235, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
            padding: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
                {state.language === 'en' ? 'Exam Notice' : 'পরীক্ষার নোটিশ'}
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                {state.language === 'en' 
                  ? `Exam Notice (${circularImages.length} Page${circularImages.length > 1 ? 's' : ''})` 
                  : `পরীক্ষার নোটিশ (${circularImages.length}টি পেজ)`}
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
            {circularImages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', gap: '12px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--border-light)' }}>
                <div style={{ fontSize: '32px' }}>📄</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-secondary)' }}>
                    {state.language === 'en' ? 'Preview Not Available' : 'প্রিভিউ দেখা যাচ্ছে না?'}
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {state.language === 'en' ? 'Please click the button below to view or download! 👇' : 'প্রবেশপত্র বা নোটিশ ডাউনলোড করতে নিচের বাটনে চাপ দিন! 👇'}
                  </span>
                </div>
              </div>
            ) : (
              <ProgressiveImage
                src={circularImages[activeImageIndex]}
                alt={`Exam Notice Page ${activeImageIndex + 1}`}
                onClick={() => setShowFullImage(!showFullImage)}
                fallbackTitle={state.language === 'en' ? 'Please click the button below to view or download! 👇' : 'প্রবেশপত্র বা নোটিশ ডাউনলোড করতে নিচের বাটনে চাপ দিন! 👇'}
                downloadUrl={rawImagesList[activeImageIndex] || circularImages[activeImageIndex]}
                objectFit="contain"
                style={{
                  maxHeight: showFullImage ? 'none' : '420px'
                }}
              />
            )}

            {/* Prev & Next Floating Navigation Arrow Buttons */}
            {circularImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(prev => (prev > 0 ? prev - 1 : circularImages.length - 1));
                  }}
                  title="Previous Page"
                  className="image-viewer-arrow-btn"
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)'
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
                  className="image-viewer-arrow-btn"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                >
                  ›
                </button>
              </>
            )}

            {!showFullImage && (
              <div className="image-viewer-bottom-fade"></div>
            )}

            {/* Indicator Dots (Mark Options) */}
            {circularImages.length > 1 && (
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '6px',
                background: 'rgba(15, 23, 42, 0.45)',
                padding: '6px 10px',
                borderRadius: '20px',
                backdropFilter: 'blur(4px)',
                zIndex: 12
              }}>
                {circularImages.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: activeImageIndex === idx ? 'var(--white)' : 'rgba(255, 255, 255, 0.5)',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail Strip / Page Selector Tabs */}
          {circularImages.length > 1 && (
            <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', marginTop: '12px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
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
            <button
              type="button"
              disabled={downloading}
              onClick={handleDownloadNotice}
              className="notice-btn-outline"
              style={{
                cursor: downloading ? 'wait' : 'pointer',
                opacity: downloading ? 0.75 : 1
              }}
            >
              {downloading ? <ButtonSpinner size={14} color="var(--primary)" /> : <Download size={14} />} <span>{downloading ? (state.language === 'en' ? 'Downloading...' : 'ডাউনলোড হচ্ছে...') : `${state.language === 'en' ? 'Notice' : 'নোটিশ'} ${circularImages.length > 1 ? `(${activeImageIndex + 1})` : ''}`}</span>
            </button>

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

      <PortalWarningModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        url={modalUrl}
        pageType={modalType}
      />
      <FileDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        fileUrl={downloadUrl}
        fileName={downloadFileName}
        fileDetails={downloadDetails}
      />
    </div>
  );
}
