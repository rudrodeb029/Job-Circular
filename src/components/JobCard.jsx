import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Calendar, Clock } from './Icons';
import { useAppContext } from '../context/AppContext';
import { formatTimeAgo } from '../utils/timeUtils';
import { normalizeMediaUrl, getGoogleDriveFileId } from '../utils/mediaUtils';
import { getJobIconAndStyle } from '../utils/jobIconUtils';
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
  const { icon: displayIcon, style: styleConfig } = getJobIconAndStyle(job);

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
          <span style={{ fontSize: '12px', flexShrink: 0 }}>{displayIcon}</span>
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
