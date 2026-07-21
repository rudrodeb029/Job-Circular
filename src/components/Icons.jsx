import React from 'react';

const iconStyle = (size = 22, color = 'currentColor') => ({
  width: size,
  height: size,
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none'
});

export const Menu = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <line x1="3.5" x2="20.5" y1="6.5" y2="6.5" strokeWidth="2.4" className="hamburger-line-1" />
    <line x1="3.5" x2="15.5" y1="12" y2="12" strokeWidth="2.4" className="hamburger-line-2" />
    <line x1="3.5" x2="20.5" y1="17.5" y2="17.5" strokeWidth="2.4" className="hamburger-line-3" />
  </svg>
);

export const Home = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const LayoutGrid = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </svg>
);

export const Search = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const Bookmark = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

export const BookmarkCheck = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" fill="currentColor" opacity="0.2" />
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    <path d="m9 10 2 2 4-4" />
  </svg>
);

export const Bell = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export const User = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const Briefcase = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

export const ArrowLeft = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

export const MapPin = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const Calendar = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

export const Clock = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const Users = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const DollarSign = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export const ChevronRight = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const Edit = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

export const FileText = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <line x1="10" x2="8" y1="9" y2="9" />
  </svg>
);

export const Globe = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" x2="22" y1="12" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const Moon = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

export const Sun = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

export const Settings = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const Shield = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const Share2 = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
  </svg>
);

export const Star = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const Mail = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export const Info = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="16" y2="12" />
    <line x1="12" x2="12.01" y1="8" y2="8" />
  </svg>
);

export const SlidersHorizontal = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <line x1="21" x2="14" y1="4" y2="4" />
    <line x1="10" x2="3" y1="4" y2="4" />
    <line x1="21" x2="12" y1="12" y2="12" />
    <line x1="8" x2="3" y1="12" y2="12" />
    <line x1="21" x2="16" y1="20" y2="20" />
    <line x1="12" x2="3" y1="20" y2="20" />
    <line x1="14" x2="14" y1="2" y2="6" />
    <line x1="8" x2="8" y1="10" y2="14" />
    <line x1="16" x2="16" y1="18" y2="22" />
  </svg>
);

export const Filter = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const X = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const Download = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

export const Eye = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const WifiOff = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <line x1="2" x2="22" y1="2" y2="22" />
    <path d="M8.5 16.5a5 5 0 0 1 7 0" />
  </svg>
);

export const AlertCircle = ({ size = 22, color = 'currentColor', className = '' }) => (
  <svg style={iconStyle(size, color)} className={className} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);
