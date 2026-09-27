import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, BookmarkCheck, Calendar, Briefcase, Eye, Download } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { NotFoundPage } from '../components/ErrorState';
import ModernLoader, { ButtonSpinner, ModernPageSkeleton } from '../components/ModernLoader';
import { downloadSecurely } from '../utils/downloadUtils';
import { normalizeMediaUrls, getGoogleDriveFileId, extractJobMediaList } from '../utils/mediaUtils';
import { getJobIconAndStyle } from '../utils/jobIconUtils';
import ProgressiveImage from '../components/ProgressiveImage';
import PortalWarningModal from '../components/PortalWarningModal';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [showMore, setShowMore] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState('');
  const [modalType, setModalType] = useState('new_job');

  const { state: adminState } = useAdminContext();
  const localJobs = adminState.jobs || [];

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
          <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800 }}>Live Circular</h1>
        </div>
        <div style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '350px' }}>
          <ModernLoader size="lg" icon="📄" />
        </div>
      </div>
    );
  }

  if (!job) {
    if (adminState?.loading || localJobs.length === 0) {
      return (
        <div className="page" style={{ paddingBottom: '100px' }}>
          <div className="page-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={22} />
            </button>
            <h1 style={{ flex: 1 }}>Job Details</h1>
          </div>
          <ModernPageSkeleton type="details" icon="📄" />
        </div>
      );
    }
    return <NotFoundPage />;
  }

  const rawImagesList = extractJobMediaList(job);
  const circularImages = normalizeMediaUrls(rawImagesList);

  const isSaved = state.savedJobs.includes(job.id);
  const isApplied = state.appliedJobs.includes(job.id);
  const isEn = state.language === 'en';
  const orgName = isEn ? (job.organizationEn || job.organization) : (job.organization || job.title);
  const titleName = isEn ? (job.titleEn || job.title) : (job.title || job.organization);

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
                       job.applyLink;

    if (!rawFileUrl || rawFileUrl === '#' || rawFileUrl.trim() === '') {
      const link = job.applyLink || job.applicationLink || job.link || job.url || 'https://alljobs.teletalk.com.bd';
      setModalUrl(link);
      setModalType('new_job');
      setIsModalOpen(true);
      return;
    }

    setDownloading(true);
    try {
      const fileName = `${orgName || titleName || 'Job_Circular'}_Notice_Page_${activeImageIndex + 1}`;
      const success = await downloadSecurely(rawFileUrl, fileName);
      if (!success) {
        const link = normalizeMediaUrl(rawFileUrl) || job.applyLink || 'https://alljobs.teletalk.com.bd';
        setModalUrl(link);
        setModalType('new_job');
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Job notice download error:', err);
      const link = normalizeMediaUrl(rawFileUrl) || job.applyLink || 'https://alljobs.teletalk.com.bd';
      setModalUrl(link);
      setModalType('new_job');
      setIsModalOpen(true);
    } finally {
      setDownloading(false);
    }
  };

  const handleOfficialApply = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const link = job.applyLink || job.applicationLink || job.link || job.circularLink || job.url || 'http://alljobs.teletalk.com.bd';
    setModalUrl(link);
    setModalType('new_job');
    setIsModalOpen(true);
  };

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      {/* FULL SCREEN ZOOM VIEWER */}
      {showFullImage && (
        <div
          onClick={() => setShowFullImage(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          {/* Header for Zoom Viewer */}
          <div style={{ position: 'absolute', top: '20px', left: '0', right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 20px', alignItems: 'center' }}>
            <span style={{ color: 'white', fontSize: '14px', fontWeight: 800 }}>Page {activeImageIndex + 1} / {circularImages.length}</span>
            <button
              onClick={() => setShowFullImage(false)}
              style={{ color: 'white', background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}
            >
              CLOSE ✕
            </button>
          </div>

          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
            <img
              src={circularImages[activeImageIndex]}
              alt="Zoomed Notice"
              style={{ maxWidth: '300%', width: '100%', height: 'auto', display: 'block' }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div style={{ position: 'absolute', bottom: '30px', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 600 }}>
            Pinch to zoom or scroll to see details
          </div>
        </div>
      )}

      {/* Header with Applied & Saved Actions */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1 }}>Job Details</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Applied Icon Button in Header */}
          <button
            className="back-btn"
            title={isApplied ? "Applied" : "Apply Job"}
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

          {/* Bookmark Toggle Button */}
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
            {displayIcon || '🏦'}
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
            {titleName}
          </h2>

          {/* Deadline / Exam Status Pill */}
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
            <span>Deadline: {job.deadline || '2026-09-30'}</span>
          </div>
        </div>

        {/* Job Description Card (1:1 Reference Mockup Style) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
          border: '1px solid #f1f5f9',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>
            {state.language === 'en' ? 'Job Description' : 'চাকরির বিবরণ'}
          </h3>
          <p style={{
            fontSize: '13.5px',
            lineHeight: 1.65,
            color: '#475569',
            display: '-webkit-box',
            WebkitLineClamp: showMore ? 'unset' : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            margin: 0
          }}>
            {job.description}
          </p>
          <button
            onClick={() => setShowMore(!showMore)}
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
            {showMore ? 'View Less ▲' : 'View More ▼'}
          </button>
        </div>

        {/* Official Circular Notice Section (1:1 Reference Mockup Style) */}
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
                অফিসিয়াল নিয়োগ বিজ্ঞপ্তি
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0', fontWeight: 500 }}>
                Official Job Circular Notice ({circularImages.length || 1} Page{circularImages.length > 1 ? 's' : ''})
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
                <Eye size={12} /> {showFullImage ? 'Collapse' : 'Full'}
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9', background: '#f8fafc' }}>
            {circularImages.length > 0 ? (
              <ProgressiveImage
                src={circularImages[activeImageIndex]}
                alt={`Circular Notice Page ${activeImageIndex + 1}`}
                onClick={() => setShowFullImage(!showFullImage)}
                fallbackTitle={isEn ? 'Please click the button below to view official circular or apply! 👇' : 'সার্কুলার দেখতে বা আবেদন করতে নিচের বাটনে চাপ দিন! 👇'}
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
                    {isEn ? 'Please click the button below to view or apply! 👇' : 'সার্কুলার দেখতে বা আবেদন করতে নিচের বাটনে চাপ দিন! 👇'}
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
              <span>{downloading ? 'Downloading...' : (isEn ? 'Notice' : 'নোটিশ')}</span>
            </button>

            <button
              onClick={handleOfficialApply}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 14px',
                borderRadius: '14px',
                background: isApplied ? '#059669' : '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)'
              }}
            >
              {isApplied ? "✓ Applied" : (job.showInExamDate ? "Get Details" : "Apply Now")}
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
