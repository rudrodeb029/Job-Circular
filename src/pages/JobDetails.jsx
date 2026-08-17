import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, BookmarkCheck, Calendar, Briefcase, Eye, Download } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { NotFoundPage } from '../components/ErrorState';
import BottomNav from '../components/BottomNav';
import ModernLoader, { ButtonSpinner, ModernPageSkeleton } from '../components/ModernLoader';
import { downloadSecurely } from '../utils/downloadUtils';
import { normalizeMediaUrls, getGoogleDriveFileId, extractJobMediaList } from '../utils/mediaUtils';

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

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [showMore, setShowMore] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 180);
    return () => clearTimeout(t);
  }, []);

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
      <div className="page" style={{ paddingBottom: '100px', background: 'var(--bg-secondary)' }}>
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>
          <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800 }}>Job Circulars BD</h1>
        </div>
        <div style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '350px' }}>
          <ModernLoader size="lg" icon="📄" />
        </div>
        <BottomNav />
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
          <BottomNav />
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

  const styleConfig = categoryStyles[job.category] || categoryStyles.gov;
  const displayIcon = job.icon || (typeof job.organization === 'string' ? orgIconsMap[job.organization] : null) || styleConfig.defaultIcon;

  const handleApplyClick = () => {
    dispatch({ type: 'TOGGLE_APPLY_JOB', payload: job.id });
  };

  const handleDownloadNotice = async (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const rawFileUrl = rawImagesList[activeImageIndex] || circularImages[activeImageIndex] || job.imageUrl || job.circularImage;
    if (!rawFileUrl) return;

    setDownloading(true);
    const fileName = `${orgName || titleName || 'Job_Circular'}_Notice_Page_${activeImageIndex + 1}`;
    await downloadSecurely(rawFileUrl, fileName);
    setDownloading(false);
  };

  const handleOfficialApply = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const link = job.applyLink || job.applicationLink || job.link || job.circularLink || job.url || 'http://alljobs.teletalk.com.bd';
    navigate('/apply-webview', {
      state: {
        url: link,
        title: orgName || titleName || (isEn ? 'Official Application' : 'সরকারি চাকরির আবেদন'),
        jobId: job.id
      }
    });
  };

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
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

      <div className="page-content animate-fade-in">
        {/* Title Card (Deadline badge shown in top chip row) */}
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
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
            {state.language === 'en' ? (job.organizationEn || job.organization) : job.organization}
          </h2>

          {/* Chips Row: Job Type + Deadline Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {job.showInResult ? (
              <span className="chip chip-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 800, fontSize: '11px', padding: '4px 10px', borderRadius: '8px', background: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff' }}>
                🏆 {state.language === 'en' ? 'Result Published' : 'ফলাফল প্রকাশিত'}
              </span>
            ) : job.showInExamDate ? (
              <span className="chip chip-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 800, fontSize: '11px', padding: '4px 10px', borderRadius: '8px', background: '#d1fae5', color: '#059669', border: '1px solid #a7f3d0' }}>
                <Calendar size={12} /> {state.language === 'en' ? 'Exam Date Published' : 'পরীক্ষার তারিখ প্রকাশিত'}
              </span>
            ) : (
              <span className="chip chip-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '11px', padding: '3px 8px', borderRadius: '6px' }}>
                <Calendar size={11} /> Deadline: {job.deadline}
              </span>
            )}
            <span className="chip" style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px' }}>{job.type}</span>
            {isApplied && <span className="chip chip-success" style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px' }}>✓ Applied</span>}
          </div>
        </div>



        {/* Job Description Section */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 className="font-bold mb-xs" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {state.language === 'en' ? 'Job Description' : 'চাকরির বিবরণ'}
          </h3>
          <p className="text-secondary" style={{
            fontSize: '13px',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: showMore ? 'unset' : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {job.description}
          </p>
          <button
            onClick={() => setShowMore(!showMore)}
            style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '11px', marginTop: '8px' }}
          >
            {showMore ? 'View Less ▲' : 'View More ▼'}
          </button>
        </div>

        {/* Multi-Image Official Circular Notice Gallery Section */}
        {circularImages.length > 0 ? (
          <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
            {/* Section Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  অফিসিয়াল নিয়োগ বিজ্ঞপ্তি
                </h3>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Official Job Circular Notice ({circularImages.length} Page{circularImages.length > 1 ? 's' : ''})
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                {/* Page Counter Badge */}
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  background: 'var(--primary-bg)',
                  color: 'var(--primary)',
                  padding: '3px 8px',
                  borderRadius: '8px',
                  whiteSpace: 'nowrap'
                }}>
                  Page {activeImageIndex + 1} / {circularImages.length}
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
                  <Eye size={11} /> {showFullImage ? 'Collapse' : 'Full'}
                </button>
              </div>
            </div>

            {/* Main Image Viewer Container with Prev/Next Overlay Buttons */}
            <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border-light)', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)' }}>
              <img
                src={circularImages[activeImageIndex]}
                alt={`Circular Notice Page ${activeImageIndex + 1}`}
                onClick={() => setShowFullImage(!showFullImage)}
                onError={(e) => {
                  const rawSrc = rawImagesList[activeImageIndex] || circularImages[activeImageIndex] || '';
                  const driveId = getGoogleDriveFileId(rawSrc);
                  const step = parseInt(e.target.dataset.fallbackStep || '0', 10);

                  if (driveId) {
                    if (step === 0) {
                      e.target.dataset.fallbackStep = '1';
                      e.target.src = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`;
                      return;
                    }
                    if (step === 1) {
                      e.target.dataset.fallbackStep = '2';
                      e.target.src = `https://drive.google.com/uc?export=view&id=${driveId}`;
                      return;
                    }
                  }

                  if (rawSrc.includes('cloudinary.com') && step === 0) {
                    e.target.dataset.fallbackStep = '1';
                    e.target.src = rawSrc.replace(/\/upload\//, '/upload/f_jpg,pg_1/').replace(/\.pdf$/i, '.jpg');
                    return;
                  }

                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  if (e.target.parentNode) {
                    e.target.parentNode.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 20px;text-align:center;gap:10px;background:var(--bg-secondary)"><div style="width:48px;height:48px;border-radius:50%;background:rgba(148,163,184,0.1);display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:20px">📷</div><span style="font-size:14px;font-weight:800;color:var(--text-secondary)">No Photo</span></div>';
                  }
                }}
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
                  pointerEvents: 'none',
                  zIndex: 6
                }}></div>
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
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                {circularImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      flexShrink: 0,
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
                    <span>Page {idx + 1}</span>
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
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
                  padding: '10px 10px',
                  borderRadius: '12px',
                  background: 'var(--primary-bg)',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '12px',
                  border: '1.5px solid #dbeafe',
                  boxShadow: '0 2px 8px rgba(26, 86, 219, 0.08)',
                  transition: 'all 0.15s ease',
                  cursor: downloading ? 'wait' : 'pointer',
                  textAlign: 'center',
                  opacity: downloading ? 0.75 : 1
                }}
              >
                {downloading ? <ButtonSpinner size={14} color="var(--primary)" /> : <Download size={14} />} <span>{downloading ? (isEn ? 'Downloading...' : 'ডাউনলোড হচ্ছে...') : `${isEn ? 'Notice' : 'নোটিশ'} ${circularImages.length > 1 ? `(${activeImageIndex + 1})` : ''}`}</span>
              </button>

              <button
                onClick={handleOfficialApply}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 10px',
                  borderRadius: '12px',
                  background: isApplied ? '#059669' : 'var(--primary)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: isApplied ? '0 4px 14px rgba(5,150,105,0.35)' : '0 4px 14px rgba(26,86,219,0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                {isApplied ? "✓ Applied" : "Apply Now"}
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
            {/* Section Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  অফিসিয়াল নিয়োগ বিজ্ঞপ্তি
                </h3>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Official Job Circular Notice (0 Pages)
                </p>
              </div>
            </div>

            {/* No Photo Available Placeholder */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 24px',
              background: 'var(--bg-secondary)',
              borderRadius: '14px',
              border: '1px dashed var(--border-light)',
              textAlign: 'center',
              gap: '12px',
              marginBottom: '14px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(148, 163, 184, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8'
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34"></path>
                  <path d="M8.17 11.17A4 4 0 0 0 12 15c.67 0 1.3-.17 1.83-.46"></path>
                </svg>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-secondary)' }}>
                no Photo available
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button
                onClick={handleOfficialApply}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 10px',
                  borderRadius: '12px',
                  background: isApplied ? '#059669' : 'var(--primary)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: isApplied ? '0 4px 14px rgba(5,150,105,0.35)' : '0 4px 14px rgba(26,86,219,0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                {isApplied ? "✓ Applied" : "Apply Now"}
              </button>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
