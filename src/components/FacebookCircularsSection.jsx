import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { normalizeMediaUrl } from '../utils/mediaUtils';
import { getJobIconAndStyle } from '../utils/jobIconUtils';
import { getItemTimestamp } from '../utils/timeUtils';
import { stripHtmlTags } from '../utils/textUtils';

// Soft, Modern Color Palettes matching the App's Design System
const SOFT_PALETTES = {
  blue: {
    bg: 'linear-gradient(165deg, #eff6ff 0%, #e0edff 50%, #dbeafe 100%)',
    borderColor: '#93c5fd',
    borderGlow: '0 4px 16px rgba(37, 99, 235, 0.1)',
    accent: '#1a56db',
    titleColor: '#0f172a',
    subText: '#334155',
    emblemBg: '#ffffff',
    emblemBorder: '#bfdbfe',
    emblemShadow: '0 4px 12px rgba(26, 86, 219, 0.12)',
    avatarRing: '#2563eb',
    tagBg: 'linear-gradient(135deg, #1a56db, #2563eb)',
    playColor: '#1a56db'
  },
  emerald: {
    bg: 'linear-gradient(165deg, #ecfdf5 0%, #e0fbf0 50%, #d1fae5 100%)',
    borderColor: '#6ee7b7',
    borderGlow: '0 4px 16px rgba(5, 150, 105, 0.1)',
    accent: '#059669',
    titleColor: '#064e3b',
    subText: '#334155',
    emblemBg: '#ffffff',
    emblemBorder: '#a7f3d0',
    emblemShadow: '0 4px 12px rgba(5, 150, 105, 0.12)',
    avatarRing: '#059669',
    tagBg: 'linear-gradient(135deg, #059669, #10b981)',
    playColor: '#059669'
  },
  amber: {
    bg: 'linear-gradient(165deg, #fffbeb 0%, #fef7db 50%, #fef3c7 100%)',
    borderColor: '#fcd34d',
    borderGlow: '0 4px 16px rgba(217, 119, 6, 0.1)',
    accent: '#d97706',
    titleColor: '#78350f',
    subText: '#334155',
    emblemBg: '#ffffff',
    emblemBorder: '#fde68a',
    emblemShadow: '0 4px 12px rgba(217, 119, 6, 0.12)',
    avatarRing: '#d97706',
    tagBg: 'linear-gradient(135deg, #d97706, #f59e0b)',
    playColor: '#d97706'
  },
  purple: {
    bg: 'linear-gradient(165deg, #f5f3ff 0%, #ede6ff 50%, #ede9fe 100%)',
    borderColor: '#c4b5fd',
    borderGlow: '0 4px 16px rgba(124, 58, 237, 0.1)',
    accent: '#7c3aed',
    titleColor: '#4c1d95',
    subText: '#334155',
    emblemBg: '#ffffff',
    emblemBorder: '#ddd6fe',
    emblemShadow: '0 4px 12px rgba(124, 58, 237, 0.12)',
    avatarRing: '#7c3aed',
    tagBg: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
    playColor: '#7c3aed'
  },
  rose: {
    bg: 'linear-gradient(165deg, #fff1f2 0%, #ffe7ea 50%, #ffe4e6 100%)',
    borderColor: '#fda4af',
    borderGlow: '0 4px 16px rgba(225, 29, 72, 0.1)',
    accent: '#e11d48',
    titleColor: '#881337',
    subText: '#334155',
    emblemBg: '#ffffff',
    emblemBorder: '#fecdd3',
    emblemShadow: '0 4px 12px rgba(225, 29, 72, 0.12)',
    avatarRing: '#e11d48',
    tagBg: 'linear-gradient(135deg, #e11d48, #f43f5e)',
    playColor: '#e11d48'
  },
  cyan: {
    bg: 'linear-gradient(165deg, #f0fdfa 0%, #e0faf5 50%, #ccfbf1 100%)',
    borderColor: '#5eead4',
    borderGlow: '0 4px 16px rgba(13, 148, 136, 0.1)',
    accent: '#0d9488',
    titleColor: '#134e4a',
    subText: '#334155',
    emblemBg: '#ffffff',
    emblemBorder: '#99f6e4',
    emblemShadow: '0 4px 12px rgba(13, 148, 136, 0.12)',
    avatarRing: '#0d9488',
    tagBg: 'linear-gradient(135deg, #0d9488, #14b8a6)',
    playColor: '#0d9488'
  }
};

function resolveSoftPalette(job, index) {
  const cat = (job?.category || job?.categoryId || '').toLowerCase();
  if (cat.includes('bank')) return SOFT_PALETTES.emerald;
  if (cat.includes('defense') || cat.includes('police')) return SOFT_PALETTES.rose;
  if (cat.includes('teach') || cat.includes('education') || cat.includes('school')) return SOFT_PALETTES.purple;
  if (cat.includes('ngo') || cat.includes('private')) return SOFT_PALETTES.amber;
  if (cat.includes('it') || cat.includes('tech') || cat.includes('engineer')) return SOFT_PALETTES.cyan;
  if (cat.includes('gov')) return (index % 2 === 0) ? SOFT_PALETTES.blue : SOFT_PALETTES.cyan;

  const keys = ['blue', 'emerald', 'amber', 'purple', 'rose', 'cyan'];
  return SOFT_PALETTES[keys[index % keys.length]];
}

function StoryCard({ job, index, isEn, onClick }) {
  const [imgFailed, setImgFailed] = useState(false);
  const { icon: displayIcon } = getJobIconAndStyle(job);
  const theme = resolveSoftPalette(job, index);

  const rawOrg = isEn ? (job.organizationEn || job.organization) : job.organization;
  const orgName = stripHtmlTags(rawOrg);

  const rawTitle = isEn ? (job.titleEn || job.title) : job.title;
  const titleName = stripHtmlTags(rawTitle);

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
        border: `1.5px solid ${theme.borderColor}`,
        boxShadow: `0 4px 16px rgba(0, 0, 0, 0.05), ${theme.borderGlow}`,
        flexShrink: 0,
        userSelect: 'none',
        transition: 'transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.18s ease',
        background: theme.bg
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0, 0, 0, 0.1), ${theme.borderGlow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `0 4px 16px rgba(0, 0, 0, 0.05), ${theme.borderGlow}`;
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.96)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* ── Background Content ── */}
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
            background: theme.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* App Transparent Icon in the Card's Middle (Seamless Multiply Blend) */}
          <div
            style={{
              position: 'absolute',
              top: '38%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            <img
              src="/app-logo.png"
              alt="Live Circular Logo"
              style={{
                width: '52px',
                height: '52px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 3px 8px rgba(0, 0, 0, 0.08))'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      {/* ── Top-Left Frosted Play Badge ── */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          width: '24px',
          height: '24px',
          borderRadius: '7px',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill={theme.playColor}>
          <polygon points="6 4 20 12 6 20 6 4" />
        </svg>
      </div>

      {/* ── Top-Right "NEW" Pill Tag ── */}
      {isNew && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '2.5px 6px',
            borderRadius: '6px',
            background: theme.tagBg,
            color: '#ffffff',
            fontSize: '8px',
            fontWeight: '800',
            letterSpacing: '0.4px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
            zIndex: 5
          }}
        >
          {isEn ? 'NEW' : 'নতুন'}
        </div>
      )}

      {/* ── Bottom Gradient Overlay ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: hasImage
            ? 'linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.05) 30%, rgba(0, 0, 0, 0.5) 60%, rgba(0, 0, 0, 0.96) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 35%, rgba(255, 255, 255, 0.85) 65%, rgba(255, 255, 255, 0.98) 100%)',
          zIndex: 2
        }}
      />

      {/* ── Bottom Content Area ── */}
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
            color: hasImage ? '#ffffff' : theme.titleColor,
            fontSize: '10.5px',
            fontWeight: '700',
            lineHeight: '1.25',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textShadow: hasImage ? '0 1px 3px rgba(0, 0, 0, 0.95)' : 'none',
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
          {/* Circular Avatar with Accent Ring */}
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: `2px solid ${theme.avatarRing}`,
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff'
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
              color: hasImage ? '#ffffff' : theme.subText,
              fontSize: '10px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '56px',
              textShadow: hasImage ? '0 1px 2px rgba(0, 0, 0, 0.95)' : 'none'
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
            style={{ flexShrink: 0 }}
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
      <style>{`
        .story-scroll-container::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          background: transparent !important;
        }
      `}</style>
      <div
        className="no-scrollbar story-scroll-container"
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
        {jobs.map((job, index) => (
          <StoryCard
            key={job.id}
            job={job}
            index={index}
            isEn={isEn}
            onClick={() => navigate(`/job/${job.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
