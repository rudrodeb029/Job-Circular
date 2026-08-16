import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Calendar, Clock } from './Icons';
import { useAppContext } from '../context/AppContext';
import { formatTimeAgo } from '../utils/timeUtils';
import { normalizeMediaUrl, getGoogleDriveFileId } from '../utils/mediaUtils';

const categoryStyles = {
  gov: {
    bg: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
    shadow: 'rgba(29, 78, 216, 0.3)',
    defaultIcon: '🏛️'
  },
  bank: {
    bg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    shadow: 'rgba(5, 150, 105, 0.3)',
    defaultIcon: '🏦'
  },
  ngo: {
    bg: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
    shadow: 'rgba(234, 88, 12, 0.3)',
    defaultIcon: '🤝'
  },
  private: {
    bg: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    shadow: 'rgba(124, 58, 237, 0.3)',
    defaultIcon: '🏢'
  },
  teaching: {
    bg: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
    shadow: 'rgba(219, 39, 119, 0.3)',
    defaultIcon: '📚'
  },
  defense: {
    bg: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    shadow: 'rgba(220, 38, 38, 0.3)',
    defaultIcon: '🛡️'
  },
  healthcare: {
    bg: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
    shadow: 'rgba(13, 148, 136, 0.3)',
    defaultIcon: '🏥'
  },
  health: {
    bg: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
    shadow: 'rgba(13, 148, 136, 0.3)',
    defaultIcon: '🏥'
  },
  it: {
    bg: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
    shadow: 'rgba(79, 70, 229, 0.3)',
    defaultIcon: '💻'
  },
  engineering: {
    bg: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    shadow: 'rgba(217, 119, 6, 0.3)',
    defaultIcon: '⚙️'
  },
  parttime: {
    bg: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
    shadow: 'rgba(2, 132, 199, 0.3)',
    defaultIcon: '⏰'
  }
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
  'রূপালী ব্যাংক': '🏦',
  'আকিক গ্রুপ': '🏭',
  'ওয়াটারএইড বাংলাদেশ': '💧',
  'টেন মিনিট স্কুল': '✍️',
  'প্রাণ-আরএফএল গ্রুপ': '📦',
  'পপুলার ডায়াগনস্টিক সেন্টার': '🔬',
  'বেক্সিমকো ফার্মা': '💊',
  'ফাইবার অ্যাট হোম': '🌐',
  'দুর্নীতি দমন কমিশন (দুদক)': '⚖️',
  'স্বপ্ন সুপার শপ': '🛒'
};

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const engNum = String(num);
  const bengaliDigits = {'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'};
  return engNum.split('').map(digit => bengaliDigits[digit] || digit).join('');
};

const isExpired = (deadline) => {
  if (!deadline) return false;
  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate.getTime())) return false;
  const endOfDay = new Date(deadlineDate);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay < new Date();
};

function JobCard({ job, showBookmark = true, showIcon = false, isAppliedView = false }) {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();

  if (!job) return null;

  const isSaved = state.savedJobs.includes(job.id);
  const isApplied = state.appliedJobs.includes(job.id);
  const styleConfig = categoryStyles[job.category] || categoryStyles[job.categoryId] || categoryStyles.gov;
  const rawIcon = job.icon || (typeof job.organization === 'string' ? orgIconsMap[job.organization] : null) || styleConfig.defaultIcon;
  const displayIcon = (typeof rawIcon === 'string' || typeof rawIcon === 'number') ? String(rawIcon) : (styleConfig.defaultIcon || '🏛️');

  const isEn = state.language === 'en';
  const rawOrg = isEn ? (job.organizationEn || job.organization) : job.organization;
  const orgName = typeof rawOrg === 'string' ? rawOrg : (rawOrg && typeof rawOrg === 'object' ? (rawOrg.bn || rawOrg.en || rawOrg.name || '') : String(rawOrg || ''));

  const rawTitle = isEn ? (job.titleEn || job.title) : job.title;
  const titleName = typeof rawTitle === 'string' ? rawTitle : (rawTitle && typeof rawTitle === 'object' ? (rawTitle.bn || rawTitle.en || rawTitle.title || '') : String(rawTitle || ''));
  
  const descriptionSentence = isEn
    ? `Recruitment notice published for the post of ${titleName}${job.vacancy ? ` (${job.vacancy} vacancies)` : ''}. Apply today!`
    : `${titleName} পদে ${job.vacancy ? `${toBengaliNumber(job.vacancy)} জনের ` : ''}নিয়োগ বিজ্ঞপ্তি প্রকাশিত হয়েছে। আজই আবেদন করুন।`;

  const rawDesc = job.description || descriptionSentence;
  const displayDesc = typeof rawDesc === 'string' ? rawDesc : (rawDesc && typeof rawDesc === 'object' ? (rawDesc.bn || rawDesc.en || '') : String(rawDesc || ''));

  const handleBookmark = (e) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_SAVE_JOB', payload: job.id });
  };

  return (
    <div
      className="job-card"
      onClick={() => navigate(`/job/${job.id}`)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(37, 99, 235, 0.12)',
        boxShadow: '0 4px 18px rgba(37, 99, 235, 0.04)'
      }}
    >
      {/* Professional Accent Border */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '4px',
        background: 'linear-gradient(to bottom, var(--primary), #60a5fa)',
        borderRadius: '4px 0 0 4px'
      }}></div>

      {/* Modern Glossy 3D Gradient Icon Tile */}
      {showIcon && (
        <div
          className="job-card-icon"
          style={{
            background: styleConfig.bg,
            color: 'white',
            fontSize: '15px',
            boxShadow: `0 4px 12px ${styleConfig.shadow}`,
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {job.imageUrl ? (
            <img
              src={normalizeMediaUrl(job.imageUrl)}
              alt={orgName}
              loading="lazy"
              decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                const driveId = getGoogleDriveFileId(job.imageUrl);
                if (driveId && !e.target.dataset.triedFallback) {
                  e.target.dataset.triedFallback = 'true';
                  e.target.src = `https://drive.google.com/thumbnail?id=${driveId}&sz=w400`;
                } else {
                  e.target.style.display = 'none';
                }
              }}
            />
          ) : (
            displayIcon
          )}
        </div>
      )}

      <div className="job-card-content">
        <h4 className="job-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '15px', flexShrink: 0 }}>{displayIcon}</span>
          <span>{orgName}</span>
        </h4>

        <p className="job-card-org" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'normal',
          lineHeight: '1.4',
          marginBottom: '4px',
          fontWeight: 400
        }}>
          {displayDesc}
        </p>
        
        {/* Metadata Badges */}
        <div style={{ marginTop: '3px', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {job.showInResult ? (
            <span style={{
              fontSize: '8.5px',
              color: '#7e22ce',
              background: '#f3e8ff',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              whiteSpace: 'nowrap'
            }}>
              🏆 <span>{isEn ? 'Result Published' : 'ফলাফল প্রকাশিত'}</span>
            </span>
          ) : job.showInExamDate ? (
            <span style={{
              fontSize: '8.5px',
              color: '#059669',
              background: '#d1fae5',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              whiteSpace: 'nowrap'
            }}>
              <Calendar size={10} />
              <span>{isEn ? 'Exam Date Published' : 'পরীক্ষার তারিখ প্রকাশিত'}</span>
            </span>
          ) : (
            <span style={{
              fontSize: '8.5px',
              color: 'var(--primary)',
              background: 'var(--primary-lightest)',
              padding: '1.5px 5px',
              borderRadius: '4px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              whiteSpace: 'nowrap'
            }}>
              <Calendar size={9} />
              <span>Deadline: {job.deadline}</span>
            </span>
          )}

          {job.vacancy && (
            <span className="job-card-tag font-bold" style={{ color: '#1a56db', background: '#eff6ff', fontSize: '9px' }}>
              {isEn ? `${job.vacancy} Positions` : `${toBengaliNumber(job.vacancy)} টি পদ`}
            </span>
          )}

          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ opacity: 0.4 }}>•</span>
            <Clock size={9} style={{ color: '#475569' }} /> 
            <span style={{ color: '#475569', fontWeight: 500 }}>
              {formatTimeAgo(job.createdAt, isEn)}
            </span>
          </span>
        </div>
      </div>

      {showBookmark && (
        isAppliedView ? (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#d1fae5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.15)',
              marginRight: '6px'
            }}
            title="Applied"
          >
            <span style={{ fontSize: '15px', fontWeight: 800 }}>✓</span>
          </div>
        ) : (
          <button
            className={`job-card-bookmark ${isSaved ? 'saved' : ''}`}
            onClick={handleBookmark}
            aria-label="Bookmark job"
          >
            {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
        )
      )}
    </div>
  );
}

export default React.memo(JobCard);
