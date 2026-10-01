import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { normalizeMediaUrl } from '../utils/mediaUtils';
import { getJobIconAndStyle } from '../utils/jobIconUtils';
import { getItemTimestamp } from '../utils/timeUtils';

function StoryCard({ job, isEn, onClick }) {
  const [imgFailed, setImgFailed] = useState(false);
  const { icon: displayIcon, style: styleConfig } = getJobIconAndStyle(job);

  const rawOrg = isEn ? (job.organizationEn || job.organization) : job.organization;
  const orgName = typeof rawOrg === 'string' ? rawOrg : (rawOrg?.bn || rawOrg?.en || rawOrg?.name || '');

  const rawTitle = isEn ? (job.titleEn || job.title) : job.title;
  const titleName = typeof rawTitle === 'string' ? rawTitle : (rawTitle?.bn || rawTitle?.en || rawTitle?.title || '');

  // Check if job was posted in the last 3 days
  const jobTime = getItemTimestamp(job);
  const isNew = jobTime > 0 && (Date.now() - jobTime < 3 * 24 * 60 * 60 * 1000);

  const hasImage = Boolean(job.imageUrl && !imgFailed);
  const mediaUrl = hasImage ? normalizeMediaUrl(job.imageUrl) : '';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
      style={{
        width: '112px',
        minWidth: '112px',
        height: '172px',
        borderRadius: '14px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1.5px solid rgba(56, 189, 248, 0.45)',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.09)',
        flexShrink: 0,
        userSelect: 'none',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        background: styleConfig.bg
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.09)';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.97)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Background Image or Stylized Fallback */}
      {hasImage ? (
        <img
          src={mediaUrl}
          alt={orgName || titleName}
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: styleConfig.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span
            style={{
              fontSize: '38px',
              opacity: 0.85,
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.35))'
            }}
          >
            {displayIcon}
          </span>
        </div>
      )}

      {/* Facebook-style Top-Left White Translucent Play Badge */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          width: '24px',
          height: '24px',
          borderRadius: '7px',
          background: 'rgba(0, 0, 0, 0.42)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          border: '1px solid rgba(255, 255, 255, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3,
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="#ffffff">
          <polygon points="6 4 20 12 6 20 6 4" />
        </svg>
      </div>

      {/* Top-Right "NEW" Tag */}
      {isNew && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '2px 5px',
            borderRadius: '5px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#ffffff',
            fontSize: '8.5px',
            fontWeight: '700',
            letterSpacing: '0.3px',
            zIndex: 3,
            boxShadow: '0 2px 5px rgba(220, 38, 38, 0.4)'
          }}
        >
          {isEn ? 'NEW' : 'নতুন'}
        </div>
      )}

      {/* Dark Vignette Overlay for High-Contrast Text Legibility */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.45) 58%, rgba(0,0,0,0.92) 100%)',
          zIndex: 2
        }}
      />

      {/* Bottom Content Area */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '8px 8px 9px 8px',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        {/* Circular Title (Post Name) */}
        <div
          style={{
            color: '#ffffff',
            fontSize: '10.5px',
            fontWeight: '700',
            lineHeight: '1.25',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.95)',
            minHeight: '26px'
          }}
        >
          {titleName}
        </div>

        {/* Avatar + Org Name + Verified Badge Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          {/* Circular Avatar with Facebook Blue Story Ring */}
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '2px solid #1877f2',
              boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.9), 0 2px 5px rgba(0,0,0,0.35)',
              overflow: 'hidden',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: styleConfig.bg
            }}
          >
            {hasImage ? (
              <img
                src={mediaUrl}
                alt={orgName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: '11px' }}>{displayIcon}</span>
            )}
          </div>

          {/* Organization Name */}
          <span
            style={{
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '56px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.95)'
            }}
          >
            {orgName}
          </span>

          {/* Verified Blue Checkmark Badge */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            style={{ flexShrink: 0, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
          >
            <circle cx="12" cy="12" r="10" fill="#1877f2" />
            <path
              d="M8.5 12.5L10.5 14.5L15.5 9.5"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function FacebookCircularsSection({ jobs = [], isEn = false }) {
  const navigate = useNavigate();

  // If no jobs yet, don't show an empty bar
  if (!jobs || jobs.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: 'var(--card-bg, #ffffff)',
        borderBottom: '1px solid var(--border-light, #e2e8f0)',
        borderTop: '1px solid var(--border-light, #e2e8f0)',
        marginBottom: '8px',
        padding: '10px 0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}
    >
      {/* Horizontal Story Cards Carousel */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          padding: '0 14px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {jobs.map((job) => (
          <StoryCard
            key={job.id}
            job={job}
            isEn={isEn}
            onClick={() => navigate(`/job/${job.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
