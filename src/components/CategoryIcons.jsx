import React from 'react';

/**
 * Real, High-Fidelity Vector SVG Category Icons for Live Circular
 * Designed specifically for clean mobile and web rendering with crisp 24x24 viewports.
 */

const baseSvgStyle = (size = 22, color = 'currentColor', extraStyle = {}) => ({
  width: size,
  height: size,
  minWidth: size,
  minHeight: size,
  display: 'inline-block',
  verticalAlign: 'middle',
  color: color,
  flexShrink: 0,
  ...extraStyle
});

// 🏛️ 1. Government Jobs (Gov / National Seal Capitol)
export const GovIcon = ({ size = 22, color = 'currentColor', className = '', style = {} }) => (
  <svg viewBox="0 0 24 24" style={baseSvgStyle(size, color, style)} className={className} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18" />
    <path d="M5 21V10" />
    <path d="M19 21V10" />
    <path d="M9 21v-8" />
    <path d="M15 21v-8" />
    <path d="M12 3 2 9h20L12 3z" />
    <circle cx="12" cy="6" r="1" fill={color} />
  </svg>
);

// 🏦 2. Bank & Financial Jobs (Bank Building with Vault/Coin)
export const BankIcon = ({ size = 22, color = 'currentColor', className = '', style = {} }) => (
  <svg viewBox="0 0 24 24" style={baseSvgStyle(size, color, style)} className={className} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 10h20" />
    <path d="M12 3 2 7h20L12 3z" />
    <path d="M4 10v9" />
    <path d="M8 10v9" />
    <path d="M12 10v9" />
    <path d="M16 10v9" />
    <path d="M20 10v9" />
    <path d="M2 19h20" />
    <path d="M1 22h22" />
  </svg>
);

// 🤝 3. NGO & Development (Humanitarian Handshake & Globe)
export const NgoIcon = ({ size = 22, color = 'currentColor', className = '', style = {} }) => (
  <svg viewBox="0 0 24 24" style={baseSvgStyle(size, color, style)} className={className} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17" />
    <path d="m7 15 3 3a2 2 0 0 0 2.8 0l5.7-5.7a2 2 0 0 0 0-2.8l-2.4-2.4a2 2 0 0 0-2.8 0L7 13.4" />
    <path d="M18 10h3a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1" />
    <path d="M12 2a10 10 0 1 0 10 10" />
  </svg>
);

// 🏢 4. Private & Corporate Jobs (Modern Office Skyscraper Tower)
export const PrivateIcon = ({ size = 22, color = 'currentColor', className = '', style = {} }) => (
  <svg viewBox="0 0 24 24" style={baseSvgStyle(size, color, style)} className={className} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
);

// 📚 5. Teaching & Education (Graduation Cap & Open Knowledge Book)
export const TeachingIcon = ({ size = 22, color = 'currentColor', className = '', style = {} }) => (
  <svg viewBox="0 0 24 24" style={baseSvgStyle(size, color, style)} className={className} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

// 🛡️ 6. Defense & Police (Security Badge Shield with Star)
export const DefenseIcon = ({ size = 22, color = 'currentColor', className = '', style = {} }) => (
  <svg viewBox="0 0 24 24" style={baseSvgStyle(size, color, style)} className={className} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polygon points="12 7 13.5 10 17 10.5 14.5 13 15 16.5 12 15 9 16.5 9.5 13 7 10.5 10.5 10 12 7" fill={color} fillOpacity="0.2" />
  </svg>
);

// 🏥 7. Healthcare & Medical (Stethoscope & Medical Hospital Cross)
export const HealthcareIcon = ({ size = 22, color = 'currentColor', className = '', style = {} }) => (
  <svg viewBox="0 0 24 24" style={baseSvgStyle(size, color, style)} className={className} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14v1a4 4 0 0 1-8 0v-1" />
    <path d="M11 2v4a3 3 0 0 0 6 0V2" />
    <path d="M19 10h1.5a1.5 1.5 0 0 1 1.5 1.5V13a2 2 0 0 1-2 2h-1" />
    <circle cx="5" cy="8" r="3" />
    <path d="M5 5v6" />
    <path d="M2 8h6" />
  </svg>
);

// 💻 8. IT & Software (Laptop & Code Brackets)
export const ItIcon = ({ size = 22, color = 'currentColor', className = '', style = {} }) => (
  <svg viewBox="0 0 24 24" style={baseSvgStyle(size, color, style)} className={className} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="m9 8-2 2 2 2" />
    <path d="m15 8 2 2-2 2" />
    <path d="M2 18h20a1 1 0 0 1 1 1v1H1v-1a1 1 0 0 1 1-1z" />
  </svg>
);

// ⚙️ 9. Engineering & Technical (Precision Gear & Tool)
export const EngineeringIcon = ({ size = 22, color = 'currentColor', className = '', style = {} }) => (
  <svg viewBox="0 0 24 24" style={baseSvgStyle(size, color, style)} className={className} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// ⏰ 10. Part-Time Jobs (Flexible Clock & Calendar)
export const PartTimeIcon = ({ size = 22, color = 'currentColor', className = '', style = {} }) => (
  <svg viewBox="0 0 24 24" style={baseSvgStyle(size, color, style)} className={className} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
  </svg>
);

// 👩‍💼 11. Women Jobs (Professional Woman / Leadership)
export const WomenIcon = ({ size = 22, color = 'currentColor', className = '', style = {} }) => (
  <svg viewBox="0 0 24 24" style={baseSvgStyle(size, color, style)} className={className} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 14c3.314 0 6 2.686 6 6v1H6v-1c0-3.314 2.686-6 6-6z" />
    <circle cx="12" cy="7" r="4" />
    <path d="M9 13.5c1 .5 2 .5 3 0" />
  </svg>
);

// 🚂 12. Railway Jobs (Locomotive Engine)
export const RailwayIcon = ({ size = 22, color = 'currentColor', className = '', style = {} }) => (
  <svg viewBox="0 0 24 24" style={baseSvgStyle(size, color, style)} className={className} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="15" rx="3" />
    <path d="M4 11h16" />
    <path d="M12 3v8" />
    <circle cx="8" cy="15" r="1.5" fill={color} />
    <circle cx="16" cy="15" r="1.5" fill={color} />
    <path d="m6 18-3 3" />
    <path d="m18 18 3 3" />
  </svg>
);

// 🎓 13. BCS & Cadre Exam (Graduation Cap & Quill)
export const BcsIcon = ({ size = 22, color = 'currentColor', className = '', style = {} }) => (
  <svg viewBox="0 0 24 24" style={baseSvgStyle(size, color, style)} className={className} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
    <polygon points="12 4 13 7 16 7 13.5 9 14.5 12 12 10 9.5 12 10.5 9 8 7 11 7" fill={color} fillOpacity="0.3" stroke="none" />
  </svg>
);

// 📜 14. NTRCA & Teacher Registration (Official Certified Scroll)
export const NtrcaIcon = ({ size = 22, color = 'currentColor', className = '', style = {} }) => (
  <svg viewBox="0 0 24 24" style={baseSvgStyle(size, color, style)} className={className} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 21h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
    <path d="M16 3v5l-2.5-1.5L11 8V3" />
    <path d="M6 18H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
  </svg>
);

// 🏫 15. Primary School (Campus & Flag)
export const PrimaryIcon = ({ size = 22, color = 'currentColor', className = '', style = {} }) => (
  <svg viewBox="0 0 24 24" style={baseSvgStyle(size, color, style)} className={className} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m4 6 8-4 8 4" />
    <path d="M18 10v11" />
    <path d="M6 10v11" />
    <path d="M2 21h20" />
    <path d="M10 21v-5a2 2 0 0 1 4 0v5" />
    <circle cx="12" cy="9" r="2" />
  </svg>
);

// ⏱️ 16. Recent Questions (Fresh Clock & Document)
export const RecentQuestionsIcon = ({ size = 22, color = 'currentColor', className = '', style = {} }) => (
  <svg viewBox="0 0 24 24" style={baseSvgStyle(size, color, style)} className={className} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <circle cx="12" cy="14" r="4" />
    <polyline points="12 12 12 14 14 15" />
  </svg>
);

// 🗂️ 17. Subjectwise Questions (Knowledge Folder Layers)
export const SubjectwiseIcon = ({ size = 22, color = 'currentColor', className = '', style = {} }) => (
  <svg viewBox="0 0 24 24" style={baseSvgStyle(size, color, style)} className={className} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="15" x2="13" y2="15" />
  </svg>
);

// 🔲 18. Layout Grid / All Categories Icon
export const AllCategoriesIcon = ({ size = 22, color = 'currentColor', className = '', style = {} }) => (
  <svg viewBox="0 0 24 24" style={baseSvgStyle(size, color, style)} className={className} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

/**
 * Universal Category Icon Resolver
 * Returns the exact matching real SVG component for any given category ID or name.
 */
export const getCategoryIconComponent = (catId, props = {}) => {
  const normalized = String(catId || '').toLowerCase().trim();

  switch (normalized) {
    case 'gov':
    case 'government':
    case 'ministry':
    case 'ministries':
      return <GovIcon {...props} />;
    case 'bank':
    case 'banking':
      return <BankIcon {...props} />;
    case 'ngo':
    case 'development':
      return <NgoIcon {...props} />;
    case 'private':
    case 'corporate':
    case 'company':
      return <PrivateIcon {...props} />;
    case 'teaching':
    case 'teacher':
    case 'education':
      return <TeachingIcon {...props} />;
    case 'defense':
    case 'army':
    case 'police':
    case 'security':
      return <DefenseIcon {...props} />;
    case 'healthcare':
    case 'health':
    case 'medical':
    case 'hospital':
      return <HealthcareIcon {...props} />;
    case 'it':
    case 'software':
    case 'tech':
      return <ItIcon {...props} />;
    case 'engineering':
    case 'engineer':
    case 'technical':
      return <EngineeringIcon {...props} />;
    case 'parttime':
    case 'part-time':
      return <PartTimeIcon {...props} />;
    case 'women':
    case 'female':
      return <WomenIcon {...props} />;
    case 'railway':
    case 'rail':
      return <RailwayIcon {...props} />;
    case 'bcs':
      return <BcsIcon {...props} />;
    case 'ntrca':
      return <NtrcaIcon {...props} />;
    case 'primary':
      return <PrimaryIcon {...props} />;
    case 'recent':
      return <RecentQuestionsIcon {...props} />;
    case 'subjectwise':
      return <SubjectwiseIcon {...props} />;
    case 'all':
      return <AllCategoriesIcon {...props} />;
    default:
      return <GovIcon {...props} />;
  }
};

export default getCategoryIconComponent;

