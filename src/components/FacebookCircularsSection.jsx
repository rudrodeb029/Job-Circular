import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { normalizeMediaUrl } from '../utils/mediaUtils';
import { getJobIconAndStyle } from '../utils/jobIconUtils';
import { getItemTimestamp } from '../utils/timeUtils';

// Curated Luxury Color Palettes for High-End Aesthetic
const LUXURY_PALETTES = {
  bank: {
    bg: 'linear-gradient(155deg, #021a14 0%, #064e3b 45%, #010d0a 100%)',
    spotlight: 'rgba(16, 185, 129, 0.32)',
    borderColor: 'rgba(52, 211, 153, 0.55)',
    borderGlow: '0 0 14px rgba(16, 185, 129, 0.25)',
    accent: '#34d399',
    accentText: '#a7f3d0',
    avatarRing: '#10b981',
    ringGlow: '0 0 8px rgba(16, 185, 129, 0.6)',
    tagBg: 'linear-gradient(135deg, #059669, #047857)',
    tagBorder: 'rgba(52, 211, 153, 0.7)'
  },
  gov: {
    bg: 'linear-gradient(155deg, #031427 0%, #0a3a60 45%, #010a14 100%)',
    spotlight: 'rgba(56, 189, 248, 0.32)',
    borderColor: 'rgba(56, 189, 248, 0.55)',
    borderGlow: '0 0 14px rgba(56, 189, 248, 0.25)',
    accent: '#38bdf8',
    accentText: '#bae6fd',
    avatarRing: '#0284c7',
    ringGlow: '0 0 8px rgba(56, 189, 248, 0.6)',
    tagBg: 'linear-gradient(135deg, #0284c7, #0369a1)',
    tagBorder: 'rgba(56, 189, 248, 0.7)'
  },
  defense: {
    bg: 'linear-gradient(155deg, #280407 0%, #560812 45%, #140103 100%)',
    spotlight: 'rgba(244, 63, 94, 0.32)',
    borderColor: 'rgba(251, 113, 133, 0.55)',
    borderGlow: '0 0 14px rgba(244, 63, 94, 0.25)',
    accent: '#fb7185',
    accentText: '#fecdd3',
    avatarRing: '#e11d48',
    ringGlow: '0 0 8px rgba(244, 63, 94, 0.6)',
    tagBg: 'linear-gradient(135deg, #e11d48, #9f1239)',
    tagBorder: 'rgba(251, 113, 133, 0.7)'
  },
  teaching: {
    bg: 'linear-gradient(155deg, #1d072e 0%, #48126b 45%, #0e0217 100%)',
    spotlight: 'rgba(192, 132, 252, 0.32)',
    borderColor: 'rgba(192, 132, 252, 0.55)',
    borderGlow: '0 0 14px rgba(192, 132, 252, 0.25)',
    accent: '#c084fc',
    accentText: '#e9d5ff',
    avatarRing: '#9333ea',
    ringGlow: '0 0 8px rgba(192, 132, 252, 0.6)',
    tagBg: 'linear-gradient(135deg, #9333ea, #6b21a8)',
    tagBorder: 'rgba(192, 132, 252, 0.7)'
  },
  gold: {
    bg: 'linear-gradient(155deg, #221502 0%, #462e05 45%, #110a01 100%)',
    spotlight: 'rgba(251, 191, 36, 0.35)',
    borderColor: 'rgba(251, 191, 36, 0.65)',
    borderGlow: '0 0 14px rgba(251, 191, 36, 0.3)',
    accent: '#fbbf24',
    accentText: '#fef08a',
    avatarRing: '#f59e0b',
    ringGlow: '0 0 8px rgba(245, 158, 11, 0.7)',
    tagBg: 'linear-gradient(135deg, #d97706, #b45309)',
    tagBorder: 'rgba(254, 240, 138, 0.75)'
  },
  sapphire: {
    bg: 'linear-gradient(155deg, #071e3d 0%, #10375c 45%, #030d1c 100%)',
    spotlight: 'rgba(96, 165, 250, 0.3)',
    borderColor: 'rgba(96, 165, 250, 0.55)',
    borderGlow: '0 0 14px rgba(96, 165, 250, 0.25)',
    accent: '#60a5fa',
    accentText: '#bfdbfe',
    avatarRing: '#3b82f6',
    ringGlow: '0 0 8px rgba(59, 130, 246, 0.6)',
    tagBg: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    tagBorder: 'rgba(96, 165, 250, 0.7)'
  }
};

function resolveLuxuryTheme(job, index) {
  const cat = (job?.category || job?.categoryId || '').toLowerCase();
  if (cat.includes('bank')) return LUXURY_PALETTES.bank;
  if (cat.includes('defense') || cat.includes('police')) return LUXURY_PALETTES.defense;
  if (cat.includes('teach') || cat.includes('education') || cat.includes('school')) return LUXURY_PALETTES.teaching;
  if (cat.includes('gov')) return (index % 2 === 0) ? LUXURY_PALETTES.gov : LUXURY_PALETTES.gold;
  
  // Cycle through palettes for aesthetic diversity
  const fallbackKeys = ['gold', 'sapphire', 'bank', 'gov', 'teaching', 'defense'];
  return LUXURY_PALETTES[fallbackKeys[index % fallbackKeys.length]];
}

function StoryCard({ job, index, isEn, onClick }) {
  const [imgFailed, setImgFailed] = useState(false);
  const { icon: displayIcon } = getJobIconAndStyle(job);
  const theme = resolveLuxuryTheme(job, index);

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
        border: `1.5px solid ${theme.borderColor}`,
        boxShadow: `0 8px 24px rgba(0, 0, 0, 0.3), ${theme.borderGlow}, inset 0 1px 1px rgba(255, 255, 255, 0.25)`,
        flexShrink: 0,
        userSelect: 'none',
        transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease',
        background: theme.bg
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 12px 28px rgba(0, 0, 0, 0.45), ${theme.borderGlow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0, 0, 0, 0.3), ${theme.borderGlow}, inset 0 1px 1px rgba(255, 255, 255, 0.25)`;
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.96)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* ── Luxury Diagonal Glass Reflection / Gloss ── */}
      <div
        style={{
          position: 'absolute',
          top: '-45%',
          left: '-45%',
          width: '190%',
          height: '110%',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.03) 35%, transparent 65%)',
          transform: 'rotate(-20deg)',
          pointerEvents: 'none',
          zIndex: 4
        }}
      />

      {/* ── Background: Media Image OR Luxury 3D Glass Emblem ── */}
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
          {/* Ambient Spotlight Hotspot */}
          <div
            style={{
              position: 'absolute',
              top: '38%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${theme.spotlight} 0%, transparent 70%)`,
              pointerEvents: 'none'
            }}
          />

          {/* Luxury 3D Glass Emblem with Outer Halo */}
          <div
            style={{
              position: 'absolute',
              top: '38%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: `1px solid ${theme.borderColor}`,
              background: 'rgba(255, 255, 255, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 16px ${theme.spotlight}`
            }}
          >
            {/* Inner Frosted Glass Medallion */}
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.06) 100%)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1.5px solid rgba(255, 255, 255, 0.45)',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.5), inset 0 1.5px 2px rgba(255, 255, 255, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span
                style={{
                  fontSize: '25px',
                  filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.65))',
                  transform: 'translateY(-1px)'
                }}
              >
                {displayIcon}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Luxury Top-Left Play Badge ── */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          width: '24px',
          height: '24px',
          borderRadius: '7px',
          background: 'rgba(10, 15, 29, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: `1px solid ${theme.borderColor}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill={theme.accent}>
          <polygon points="6 4 20 12 6 20 6 4" />
        </svg>
      </div>

      {/* ── Luxury Top-Right "NEW" Gemstone Tag ── */}
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
            border: `1px solid ${theme.tagBorder}`,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            zIndex: 5
          }}
        >
          {isEn ? 'NEW' : 'নতুন'}
        </div>
      )}

      {/* ── Dark Vignette Gradient Overlay for High-Contrast Text Legibility ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.05) 30%, rgba(0, 0, 0, 0.5) 60%, rgba(0, 0, 0, 0.96) 100%)',
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
          {/* Circular Avatar with Glowing Luxury Ring */}
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: `2px solid ${theme.avatarRing}`,
              boxShadow: `${theme.ringGlow}, 0 0 0 1px rgba(255, 255, 255, 0.85)`,
              overflow: 'hidden',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: theme.bg
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
            style={{ flexShrink: 0, filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))' }}
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
