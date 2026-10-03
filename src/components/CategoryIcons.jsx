import React from 'react';

/**
 * Authentic Official Logo Icons for Live Circular Categories
 * Faithfully designed based on the official emblems, seals, and insignias of:
 * 1. Government of the People's Republic of Bangladesh (Gov / Ministries) - bangladesh.gov.bd
 * 2. Bangladesh Bank (Central Bank / Banking Sector) - bb.org.bd
 * 3. Bangladesh Public Service Commission (BPSC / BCS) - bpsc.gov.bd
 * 4. Non-Government Teachers' Registration & Certification Authority (NTRCA) - ntrca.gov.bd
 * 5. Directorate of Primary Education (DPE / Primary School) - dpe.gov.bd
 * 6. Bangladesh Railway (Locomotive & Track Insignia) - railway.gov.bd
 * 7. Bangladesh Armed Forces & Police (Tri-Service & Police Crest) - mod.gov.bd / police.gov.bd
 * 8. Directorate General of Health Services (DGHS / Healthcare) - dghs.gov.bd
 * 9. ICT Division, Government of Bangladesh (IT & Software) - ictd.gov.bd
 * 10. The Institution of Engineers, Bangladesh (IEB / Engineering) - iebbd.org
 * 11. NGO Affairs Bureau, Prime Minister's Office (NGO & Development) - ngoab.gov.bd
 * 12. Ministry of Education (Teaching & Education) - moedu.gov.bd
 * 13. Federation of Bangladesh Chambers of Commerce & Industry / Corporate (Private) - fbcci.org
 * 14. Ministry of Labour & Employment (Part-Time & Flexible) - mole.gov.bd
 * 15. Department of Women Affairs (Women / Female Empowerment) - dwa.gov.bd
 * 16. Recent Questions & Model Tests (Verified Question Paper & Timer)
 * 17. Subjectwise Questions (Categorized Book Stack & Ribbons)
 * 18. All Categories (Modular 4-Quadrant App Grid)
 */

const baseSvgStyle = (size = 24, extraStyle = {}) => ({
  width: size,
  height: size,
  minWidth: size,
  minHeight: size,
  display: 'inline-block',
  verticalAlign: 'middle',
  flexShrink: 0,
  ...extraStyle
});

// 🏛️ 1. Official National Emblem of Bangladesh (গণপ্রজাতন্ত্রী বাংলাদেশ সরকার)
export const GovIcon = ({ size = 24, className = '', style = {} }) => (
  <svg viewBox="0 0 32 32" style={baseSvgStyle(size, style)} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="govGreenGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#006a4e" />
        <stop offset="100%" stopColor="#004d38" />
      </linearGradient>
      <linearGradient id="govGoldGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    {/* Outer Green National Seal Circle */}
    <circle cx="16" cy="16" r="15" fill="url(#govGreenGrad)" stroke="#f59e0b" strokeWidth="1" />
    <circle cx="16" cy="16" r="13" stroke="#f59e0b" strokeWidth="0.6" strokeDasharray="1.5 1" opacity="0.8" />
    {/* Red Inner Sun Disc */}
    <circle cx="16" cy="16" r="10.5" fill="#f42a41" />
    {/* Water Ripples at Base */}
    <path d="M9 22.5c1.5-.6 3 .6 4.5 0s3-.6 4.5 0 3 .6 5 0" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M10.5 24.2c1.3-.4 2.7.4 4 0s2.7-.4 4 0 2.7.4 3 0" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
    {/* National Water Lily (Shapla) */}
    {/* Center Petal */}
    <path d="M16 11c-.8 2.5-1.4 5-1.4 7.2 0 1.2.6 1.8 1.4 1.8s1.4-.6 1.4-1.8c0-2.2-.6-4.7-1.4-7.2z" fill="#ffffff" />
    {/* Left Petal */}
    <path d="M16 14.5c-1.5-.5-3.5 1.5-3.8 3.8-.1.8.4 1.4 1.2 1.4 1 0 2.1-1.2 2.6-2.5v-2.7z" fill="#ffffff" opacity="0.95" />
    {/* Right Petal */}
    <path d="M16 14.5c1.5-.5 3.5 1.5 3.8 3.8.1.8-.4 1.4-1.2 1.4-1 0-2.1-1.2-2.6-2.5v-2.7z" fill="#ffffff" opacity="0.95" />
    {/* Flanking Paddy Sheaves (ধানের শীষ) Left & Right */}
    <path d="M9 19c-.5-3 1-6.5 3-8.5" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M23 19c.5-3-1-6.5-3-8.5" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
    {/* Top 3 Jute Leaves */}
    <path d="M16 5.5v3M14.2 6.5l1.8 2M17.8 6.5l-1.8 2" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
    {/* 4 Golden Stars (2 Left, 2 Right) */}
    <circle cx="8" cy="11.5" r="0.9" fill="#fbbf24" />
    <circle cx="6.5" cy="14" r="0.9" fill="#fbbf24" />
    <circle cx="24" cy="11.5" r="0.9" fill="#fbbf24" />
    <circle cx="25.5" cy="14" r="0.9" fill="#fbbf24" />
  </svg>
);

// 🏦 2. Official Bangladesh Bank Emblem (বাংলাদেশ ব্যাংক)
export const BankIcon = ({ size = 24, className = '', style = {} }) => (
  <svg viewBox="0 0 32 32" style={baseSvgStyle(size, style)} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bbGreenGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#006233" />
        <stop offset="100%" stopColor="#004020" />
      </linearGradient>
      <linearGradient id="bbGoldGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    {/* Circular Deep Green Seal */}
    <circle cx="16" cy="16" r="15" fill="url(#bbGreenGrad)" stroke="#f59e0b" strokeWidth="1.2" />
    <circle cx="16" cy="16" r="13.2" stroke="#fbbf24" strokeWidth="0.5" strokeDasharray="1.2 0.8" opacity="0.75" />
    {/* Inner Gold Medallion Rim */}
    <circle cx="16" cy="16" r="11" fill="#004d28" stroke="#fbbf24" strokeWidth="0.8" />
    {/* Bangladesh Bank Royal Bengal Tiger & Vault Watermark Motif */}
    {/* Stylized Tiger Head / Vault Crest in Radiant Gold */}
    <path d="M11 18.5c0-3.5 2.2-6 5-6s5 2.5 5 6c0 1.5-.8 2.5-2.2 2.5-1.2 0-1.8-.8-2.8-.8s-1.6.8-2.8.8c-1.4 0-2.2-1-2.2-2.5z" fill="url(#bbGoldGrad)" />
    {/* Tiger Facial Markings / Vault Stripes */}
    <path d="M16 13v3.5M14 14.5l2 1.5M18 14.5l-2 1.5" stroke="#004d28" strokeWidth="0.9" strokeLinecap="round" />
    <circle cx="14" cy="16.5" r="0.8" fill="#004d28" />
    <circle cx="18" cy="16.5" r="0.8" fill="#004d28" />
    {/* Currency / Monetary Arc at Base */}
    <path d="M12 22.5c2.5.8 5.5.8 8 0" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
    {/* Apex Star of Excellence */}
    <polygon points="16,6.8 17.2,9.2 19.8,9.5 17.8,11.2 18.4,13.8 16,12.4 13.6,13.8 14.2,11.2 12.2,9.5 14.8,9.2" fill="#fbbf24" transform="scale(0.55) translate(13, 3)" />
  </svg>
);

// 🎓 3. Official Bangladesh Public Service Commission Emblem (BPSC / বিসিএস)
export const BcsIcon = ({ size = 24, className = '', style = {} }) => (
  <svg viewBox="0 0 32 32" style={baseSvgStyle(size, style)} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bpscNavyGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1e3a8a" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="bpscGoldGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
    </defs>
    {/* Circular Navy BPSC Cadre Crest */}
    <circle cx="16" cy="16" r="15" fill="url(#bpscNavyGrad)" stroke="#f59e0b" strokeWidth="1.2" />
    {/* Classical Golden Laurel Wreath (কমিশনের মেধা ও শ্রেষ্ঠত্বের প্রতীক) */}
    <path d="M7 16c0 5 3.5 9 9 10s9-5 9-10" stroke="url(#bpscGoldGrad)" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2 1.2" />
    {/* Inner Cadre Shield Badge */}
    <path d="M16 7l6 3v5c0 4.5-3 7.5-6 9-3-1.5-6-4.5-6-9v-5l6-3z" fill="#006a4e" stroke="#fbbf24" strokeWidth="0.9" />
    {/* National Water Lily (Shapla) Inside Shield */}
    <path d="M16 11c-.5 1.5-.9 3-.9 4.3 0 .7.4 1 1 1s1-.3 1-1c0-1.3-.4-2.8-1-4.3z" fill="#ffffff" />
    <path d="M16 13c-.9-.3-2 .9-2.2 2.2 0 .5.3.8.8.8.6 0 1.2-.7 1.4-1.5v-1.5z" fill="#fbbf24" />
    <path d="M16 13c.9-.3 2 .9 2.2 2.2 0 .5-.3.8-.8.8-.6 0-1.2-.7-1.4-1.5v-1.5z" fill="#fbbf24" />
    <path d="M12.5 18c1.5.5 5.5.5 7 0" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" />
    {/* Apex Merit 5-Star Crown */}
    <circle cx="16" cy="5.2" r="1" fill="#fbbf24" />
  </svg>
);

// 📜 4. Official NTRCA Emblem (বেসরকারি শিক্ষক নিবন্ধন ও প্রত্যয়ন কর্তৃপক্ষ)
export const NtrcaIcon = ({ size = 24, className = '', style = {} }) => (
  <svg viewBox="0 0 32 32" style={baseSvgStyle(size, style)} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ntrcaPurpleGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6d28d9" />
        <stop offset="100%" stopColor="#4c1d95" />
      </linearGradient>
      <linearGradient id="ntrcaSunGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#ef4444" />
      </linearGradient>
    </defs>
    {/* Circular Purple Academic Badge */}
    <circle cx="16" cy="16" r="15" fill="url(#ntrcaPurpleGrad)" stroke="#a78bfa" strokeWidth="1" />
    {/* Rising Sunburst of Enlightenment Behind Book */}
    <path d="M16 8l.8 2.5h2.6l-2.1 1.5.8 2.5-2.1-1.5-2.1 1.5.8-2.5-2.1-1.5h2.6z" fill="url(#ntrcaSunGrad)" transform="translate(0,-1)" />
    {/* Sun Rays */}
    <line x1="16" y1="5" x2="16" y2="7.5" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="11.5" y1="6.5" x2="13" y2="8.5" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="20.5" y1="6.5" x2="19" y2="8.5" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
    {/* Open Education Book (জ্ঞানের উন্মুক্ত বই) */}
    <path d="M16 17c-2.5-1.5-6-1.2-8.5 0v7c2.5-1.2 6-1.5 8.5 0 2.5-1.5 6-1.2 8.5 0v-7c-2.5-1.2-6-1.5-8.5 0z" fill="#ffffff" stroke="#c4b5fd" strokeWidth="0.8" strokeLinejoin="round" />
    {/* Book Spine Center Line */}
    <line x1="16" y1="16.5" x2="16" y2="24" stroke="#6d28d9" strokeWidth="1" strokeLinecap="round" />
    {/* Text Lines on Left & Right Pages */}
    <line x1="10" y1="18.5" x2="14" y2="18" stroke="#8b5cf6" strokeWidth="0.8" strokeLinecap="round" />
    <line x1="10" y1="20.5" x2="14" y2="20" stroke="#8b5cf6" strokeWidth="0.8" strokeLinecap="round" />
    <line x1="18" y1="18" x2="22" y2="18.5" stroke="#8b5cf6" strokeWidth="0.8" strokeLinecap="round" />
    <line x1="18" y1="20" x2="22" y2="20.5" stroke="#8b5cf6" strokeWidth="0.8" strokeLinecap="round" />
    {/* Certification Ribbon Seal */}
    <circle cx="16" cy="24.5" r="2.2" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.6" />
    <path d="M14.5 26.5l-1 3 2.5-1 2.5 1-1-3" fill="#f59e0b" />
  </svg>
);

// 🏫 5. Official Directorate of Primary Education Emblem (প্রাথমিক শিক্ষা অধিদপ্তর - DPE)
export const PrimaryIcon = ({ size = 24, className = '', style = {} }) => (
  <svg viewBox="0 0 32 32" style={baseSvgStyle(size, style)} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dpeSkyGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
      <linearGradient id="dpeSunGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    {/* Sky Blue Circular Disc */}
    <circle cx="16" cy="16" r="15" fill="url(#dpeSkyGrad)" stroke="#38bdf8" strokeWidth="1" />
    {/* Rising Sun of Hope & Literacy */}
    <circle cx="16" cy="12" r="6" fill="url(#dpeSunGrad)" />
    {/* Knowledge Pencil (শিক্ষার পেন্সিল) Pointing Upward */}
    <polygon points="16,5 14.5,8.5 17.5,8.5" fill="#f43f5e" />
    <rect x="14.5" y="8.5" width="3" height="6.5" fill="#fbbf24" stroke="#d97706" strokeWidth="0.4" />
    {/* School Children (Boy & Girl) Reading Book */}
    <circle cx="11.5" cy="15" r="2" fill="#ffffff" />
    <circle cx="20.5" cy="15" r="2" fill="#ffffff" />
    {/* Open Primary Book Base */}
    <path d="M16 19.5c-3-1.8-7-1.4-10 0v5.5c3-1.4 7-1.8 10 0 3-1.8 7-1.4 10 0v-5.5c-3-1.4-7-1.8-10 0z" fill="#ffffff" stroke="#0284c7" strokeWidth="0.8" />
    <line x1="16" y1="19" x2="16" y2="25.5" stroke="#0284c7" strokeWidth="1" />
    {/* Bangladesh Green Base Ring */}
    <path d="M6 25c3 2 17 2 20 0" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

// 🚂 6. Official Bangladesh Railway Emblem (বাংলাদেশ রেলওয়ে)
export const RailwayIcon = ({ size = 24, className = '', style = {} }) => (
  <svg viewBox="0 0 32 32" style={baseSvgStyle(size, style)} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="railGreenGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#006a4e" />
        <stop offset="100%" stopColor="#004d38" />
      </linearGradient>
    </defs>
    {/* Outer Green Cogged Railway Track Wheel */}
    <circle cx="16" cy="16" r="15" fill="url(#railGreenGrad)" stroke="#f59e0b" strokeWidth="1.2" />
    {/* Cogged Wheel Ridges */}
    <circle cx="16" cy="16" r="13" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="1.6 1.2" opacity="0.8" />
    {/* Inner Red Boiler Fire Ring */}
    <circle cx="16" cy="16" r="10.8" fill="#dc2626" />
    {/* Locomotive Train Engine Front Silhouette */}
    {/* Cabin & Boiler Body */}
    <path d="M11 11.5c0-1.5 1-2.5 5-2.5s5 1 5 2.5v7.5c0 1-.5 1.5-1.5 1.5h-7c-1 0-1.5-.5-1.5-1.5v-7.5z" fill="#1e293b" stroke="#ffffff" strokeWidth="0.7" />
    {/* Front Windshield Windows */}
    <rect x="12.5" y="11.5" width="3" height="2.2" rx="0.4" fill="#38bdf8" />
    <rect x="16.5" y="11.5" width="3" height="2.2" rx="0.4" fill="#38bdf8" />
    {/* Powerful Yellow Headlight */}
    <circle cx="16" cy="15.8" r="1.5" fill="#facc15" stroke="#ffffff" strokeWidth="0.6" />
    {/* Cowcatcher / Grill at Front */}
    <path d="M10.5 21.5l1.5-2h8l1.5 2z" fill="#475569" stroke="#ffffff" strokeWidth="0.6" />
    {/* Parallel Silver Rails Leading Forward */}
    <line x1="12" y1="21.5" x2="9" y2="27" stroke="#e2e8f0" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="20" y1="21.5" x2="23" y2="27" stroke="#e2e8f0" strokeWidth="1.4" strokeLinecap="round" />
    {/* Rail Ties */}
    <line x1="10.5" y1="24" x2="21.5" y2="24" stroke="#fbbf24" strokeWidth="1" />
    <line x1="9" y1="26.5" x2="23" y2="26.5" stroke="#fbbf24" strokeWidth="1" />
  </svg>
);

// 🛡️ 7. Official Bangladesh Armed Forces & Police Emblem (প্রতিরক্ষা ও পুলিশ)
export const DefenseIcon = ({ size = 24, className = '', style = {} }) => (
  <svg viewBox="0 0 32 32" style={baseSvgStyle(size, style)} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="defRedGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#991b1b" />
      </linearGradient>
    </defs>
    {/* Crimson Red Heraldic Shield Circle */}
    <circle cx="16" cy="16" r="15" fill="url(#defRedGrad)" stroke="#f59e0b" strokeWidth="1.2" />
    {/* Tri-Service Crossed Sabres (সেনাবাহিনী / Army) */}
    <path d="M8 8l16 16M24 8L8 24" stroke="#f1f5f9" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="8" cy="8" r="1.5" fill="#f59e0b" />
    <circle cx="24" cy="8" r="1.5" fill="#f59e0b" />
    {/* Admiralty Anchor (নৌবাহিনী / Navy) & Wings (বিমানবাহিনী / Air Force) */}
    <path d="M16 10v10M12 18c1.5 2 6.5 2 8 0" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" />
    {/* Golden National Star Shield in Center */}
    <path d="M16 8.5l5 2.5v5c0 4-2.5 6.5-5 7.5-2.5-1-5-3.5-5-7.5v-5l5-2.5z" fill="#1e3a8a" stroke="#f59e0b" strokeWidth="1" />
    {/* Golden Water Lily in Shield Heart */}
    <circle cx="16" cy="15" r="1.8" fill="#fbbf24" />
    <circle cx="16" cy="12" r="0.9" fill="#ffffff" />
  </svg>
);

// 🏥 8. Official Directorate General of Health Services Emblem (স্বাস্থ্য অধিদপ্তর - DGHS)
export const HealthcareIcon = ({ size = 24, className = '', style = {} }) => (
  <svg viewBox="0 0 32 32" style={baseSvgStyle(size, style)} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dghsTealGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0d9488" />
        <stop offset="100%" stopColor="#0f766e" />
      </linearGradient>
    </defs>
    {/* Medical Teal Circular Base */}
    <circle cx="16" cy="16" r="15" fill="url(#dghsTealGrad)" stroke="#5eead4" strokeWidth="1" />
    {/* Red Crescent (রেড ক্রিসেন্ট / স্বাস্থ্য সেবার প্রতীক) */}
    <path d="M18.5 7.5c4.5 2 6.5 7.5 4.5 12s-7.5 6.5-12 4.5c4-1 6-4.5 5.5-8.5-.5-3.5-3-6-6.5-6.5 3-1.5 5.5-1.5 8.5-1.5z" fill="#ef4444" />
    {/* Medical Caduceus / Rod of Asclepius in Center */}
    <line x1="16" y1="7" x2="16" y2="25" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="16" cy="7" r="1.4" fill="#fbbf24" />
    {/* Intertwined Healing Serpent */}
    <path d="M14 11c2-1 4 0 4 1.5s-2 2-4 3 4 2 4 3.5-2 2-3 2" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
    {/* Hospital First Aid Cross on Left */}
    <rect x="7" y="14" width="4" height="1.4" rx="0.4" fill="#ffffff" />
    <rect x="8.3" y="12.7" width="1.4" height="4" rx="0.4" fill="#ffffff" />
  </svg>
);

// 💻 9. Official ICT Division Emblem (তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ / আইটি)
export const ItIcon = ({ size = 24, className = '', style = {} }) => (
  <svg viewBox="0 0 32 32" style={baseSvgStyle(size, style)} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ictIndigoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4338ca" />
        <stop offset="100%" stopColor="#312e81" />
      </linearGradient>
      <linearGradient id="ictCoreGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
    </defs>
    {/* High-Tech Indigo Circular Disc */}
    <circle cx="16" cy="16" r="15" fill="url(#ictIndigoGrad)" stroke="#818cf8" strokeWidth="1" />
    {/* PCB Circuit Traces Radiating to Nodes */}
    <path d="M16 6v4M16 22v4M6 16h4M22 16h4M9 9l3 3M23 9l-3 3M9 23l3-3M23 23l-3-3" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" />
    <circle cx="16" cy="6" r="1" fill="#38bdf8" />
    <circle cx="16" cy="26" r="1" fill="#38bdf8" />
    <circle cx="6" cy="16" r="1" fill="#38bdf8" />
    <circle cx="26" cy="16" r="1" fill="#38bdf8" />
    {/* Central Silicon Microprocessor Chip */}
    <rect x="11.5" y="11.5" width="9" height="9" rx="1.8" fill="url(#ictCoreGrad)" stroke="#ffffff" strokeWidth="0.8" />
    {/* Microchip Core Bangladesh Flag Emblem */}
    <circle cx="16" cy="16" r="2.6" fill="#006a4e" />
    <circle cx="15.6" cy="16" r="1.3" fill="#f42a41" />
  </svg>
);

// ⚙️ 10. Official Institution of Engineers, Bangladesh Emblem (IEB / ইঞ্জিনিয়ারিং)
export const EngineeringIcon = ({ size = 24, className = '', style = {} }) => (
  <svg viewBox="0 0 32 32" style={baseSvgStyle(size, style)} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="iebAmberGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#92400e" />
      </linearGradient>
    </defs>
    {/* Technical Amber Gear Wheel Disc */}
    <circle cx="16" cy="16" r="15" fill="url(#iebAmberGrad)" stroke="#fcd34d" strokeWidth="1" />
    {/* Precision 8-Tooth Mechanical Gear */}
    <path
      d="M14.5 6.5h3l.5 2.5 2.2.9 2.2-1.5 2.2 2.2-1.5 2.2.9 2.2 2.5.5v3l-2.5.5-.9 2.2 1.5 2.2-2.2 2.2-2.2-1.5-2.2.9-.5 2.5h-3l-.5-2.5-2.2-.9-2.2 1.5-2.2-2.2 1.5-2.2-.9-2.2-2.5-.5v-3l2.5-.5.9-2.2-1.5-2.2 2.2-2.2 2.2 1.5 2.2-.9z"
      fill="#1e293b"
      stroke="#fbbf24"
      strokeWidth="0.8"
    />
    {/* Inner Drafting Caliper / Compass Divider */}
    <circle cx="16" cy="16" r="5" fill="#f8fafc" />
    <path d="M16 13l-3 7M16 13l3 7M14 17.5h4" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="16" cy="13" r="1" fill="#92400e" />
  </svg>
);

// 🤝 11. Official NGO Affairs Bureau Emblem (এনজিও বিষয়ক ব্যুরো / NGO)
export const NgoIcon = ({ size = 24, className = '', style = {} }) => (
  <svg viewBox="0 0 32 32" style={baseSvgStyle(size, style)} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ngoOrangeGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ea580c" />
        <stop offset="100%" stopColor="#c2410c" />
      </linearGradient>
    </defs>
    {/* Caring Orange Circular Shield */}
    <circle cx="16" cy="16" r="15" fill="url(#ngoOrangeGrad)" stroke="#fdba74" strokeWidth="1" />
    {/* Humanitarian Globe Grid in Background */}
    <circle cx="16" cy="14" r="7" stroke="#ffffff" strokeWidth="0.7" opacity="0.6" />
    <ellipse cx="16" cy="14" rx="3.5" ry="7" stroke="#ffffff" strokeWidth="0.6" opacity="0.6" />
    <line x1="9" y1="14" x2="23" y2="14" stroke="#ffffff" strokeWidth="0.6" opacity="0.6" />
    {/* Cupping Caring Hands Supporting Humanity */}
    <path d="M8 21.5c2-2 4.5-2.5 8-2.5s6 .5 8 2.5c-2 3-5 4.5-8 4.5s-6-1.5-8-4.5z" fill="#ffffff" />
    {/* Three Human Figures Supported by the Hands */}
    <circle cx="16" cy="12.5" r="1.8" fill="#fbbf24" />
    <circle cx="12" cy="14" r="1.4" fill="#ffffff" />
    <circle cx="20" cy="14" r="1.4" fill="#ffffff" />
  </svg>
);

// 📚 12. Official Ministry of Education Emblem (শিক্ষা মন্ত্রণালয় / শিক্ষক নিয়োগ)
export const TeachingIcon = ({ size = 24, className = '', style = {} }) => (
  <svg viewBox="0 0 32 32" style={baseSvgStyle(size, style)} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="teachPinkGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#db2777" />
        <stop offset="100%" stopColor="#9d174d" />
      </linearGradient>
    </defs>
    {/* Scholarly Magenta Disc */}
    <circle cx="16" cy="16" r="15" fill="url(#teachPinkGrad)" stroke="#f472b6" strokeWidth="1" />
    {/* Academic Mortarboard Graduation Cap */}
    <polygon points="16,7 24,11 16,15 8,11" fill="#ffffff" />
    <path d="M11 13v4c2 2 8 2 10 0v-4" stroke="#ffffff" strokeWidth="1" fill="none" />
    <path d="M22 12v5" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" />
    <circle cx="22" cy="17" r="0.8" fill="#fbbf24" />
    {/* Open Book of Knowledge with Flame of Enlightenment */}
    <path d="M16 18c-2.5-1.5-6-1.2-8 0v5c2.5-1.2 5.5-1.5 8 0 2.5-1.5 5.5-1.2 8 0v-5c-2-1.2-5.5-1.5-8 0z" fill="#ffffff" stroke="#fbcfe8" strokeWidth="0.6" />
    {/* Torch Flame in Center */}
    <path d="M16 16.5c-.8 1-1.2 2 0 3 1.2-1 .8-2 0-3z" fill="#fbbf24" />
  </svg>
);

// 🏢 13. Official Corporate & FBCCI Emblem (বাণিজ্য ও শিল্প / প্রাইভেট চাকরি)
export const PrivateIcon = ({ size = 24, className = '', style = {} }) => (
  <svg viewBox="0 0 32 32" style={baseSvgStyle(size, style)} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="privPurpleGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#5b21b6" />
      </linearGradient>
    </defs>
    {/* Executive Purple Disc */}
    <circle cx="16" cy="16" r="15" fill="url(#privPurpleGrad)" stroke="#c4b5fd" strokeWidth="1" />
    {/* Modern High-Rise Corporate Towers */}
    <rect x="8" y="11" width="7" height="14" rx="1" fill="#1e1b4b" stroke="#ffffff" strokeWidth="0.8" />
    <rect x="17" y="7" width="8" height="18" rx="1" fill="#ffffff" />
    {/* Windows on Tall Tower */}
    <rect x="19" y="9" width="1.6" height="1.6" fill="#7c3aed" />
    <rect x="22" y="9" width="1.6" height="1.6" fill="#7c3aed" />
    <rect x="19" y="12" width="1.6" height="1.6" fill="#7c3aed" />
    <rect x="22" y="12" width="1.6" height="1.6" fill="#7c3aed" />
    <rect x="19" y="15" width="1.6" height="1.6" fill="#7c3aed" />
    <rect x="22" y="15" width="1.6" height="1.6" fill="#7c3aed" />
    {/* Commercial Handshake / Growth Trend Line in Gold */}
    <path d="M7 21l6-5 4 3 8-7" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="22 12 25 12 25 15" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ⏰ 14. Official Flexible Employment Emblem (পার্ট-টাইম ও ফ্রিল্যান্স)
export const PartTimeIcon = ({ size = 24, className = '', style = {} }) => (
  <svg viewBox="0 0 32 32" style={baseSvgStyle(size, style)} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="partCyanGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
    </defs>
    {/* Ocean Cyan Disc */}
    <circle cx="16" cy="16" r="15" fill="url(#partCyanGrad)" stroke="#67e8f9" strokeWidth="1" />
    {/* Chronometer Watch Dial */}
    <circle cx="16" cy="16" r="10" fill="#ffffff" stroke="#0284c7" strokeWidth="1.2" />
    {/* Clock Hands Set at 10:10 */}
    <line x1="16" y1="16" x2="16" y2="10" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="16" y1="16" x2="20.5" y2="16" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="16" cy="16" r="1.4" fill="#0284c7" />
    {/* Top Chronograph Pusher */}
    <rect x="14.5" y="4.5" width="3" height="2" rx="0.5" fill="#f59e0b" />
    {/* Portfolio Briefcase Badge at 5 o'clock */}
    <rect x="18" y="19" width="7" height="5" rx="1" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.6" />
    <path d="M20 19v-1c0-.5.5-1 1-1h1c.5 0 1 .5 1 1v1" stroke="#ffffff" strokeWidth="0.6" />
  </svg>
);

// 👩‍💼 15. Official Department of Women Affairs Emblem (মহিলা বিষয়ক অধিদপ্তর - DWA)
export const WomenIcon = ({ size = 24, className = '', style = {} }) => (
  <svg viewBox="0 0 32 32" style={baseSvgStyle(size, style)} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="womenRoseGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#e11d48" />
        <stop offset="100%" stopColor="#be123c" />
      </linearGradient>
    </defs>
    {/* Rose Red Empowerment Disc */}
    <circle cx="16" cy="16" r="15" fill="url(#womenRoseGrad)" stroke="#fecdd3" strokeWidth="1" />
    {/* Protective Laurel Wreath in Gold & Green */}
    <path d="M8 18c0 4.5 3.5 8 8 8s8-3.5 8-8" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1.8 1" />
    {/* Empowered Woman Profile with Floral Lotus Motif */}
    <circle cx="16" cy="11.5" r="3.5" fill="#ffffff" />
    <path d="M16 16c-4 0-7 2.5-7 6.5v1.5h14v-1.5c0-4-3-6.5-7-6.5z" fill="#ffffff" />
    {/* Lotus Blossom in Heart of Emblem */}
    <path d="M16 17c-.8 1.5-1.5 2.5-1.5 3.5 0 1 .7 1.5 1.5 1.5s1.5-.5 1.5-1.5c0-1-.7-2-1.5-3.5z" fill="#f43f5e" />
    <circle cx="16" cy="6" r="1" fill="#fbbf24" />
  </svg>
);

// ⏱️ 16. Official Recent Questions Emblem (রিসেন্ট প্রশ্নব্যাংক)
export const RecentQuestionsIcon = ({ size = 24, className = '', style = {} }) => (
  <svg viewBox="0 0 32 32" style={baseSvgStyle(size, style)} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="recentAmberGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    {/* Amber Gold Disc */}
    <circle cx="16" cy="16" r="15" fill="url(#recentAmberGrad)" stroke="#fde68a" strokeWidth="1" />
    {/* Exam Question Document with Turned Corner */}
    <path d="M9 7h9l5 5v13a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" fill="#ffffff" />
    <path d="M18 7v5h5" fill="#fde68a" />
    {/* Exam Question Lines */}
    <line x1="11.5" y1="12" x2="16" y2="12" stroke="#d97706" strokeWidth="1" strokeLinecap="round" />
    <line x1="11.5" y1="15" x2="20.5" y2="15" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" />
    <line x1="11.5" y1="18" x2="20.5" y2="18" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" />
    {/* Fast Clock Badge at Bottom-Right */}
    <circle cx="21" cy="21" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="1" />
    <polyline points="21 18.5 21 21 23 22.5" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

// 🗂️ 17. Official Subjectwise Questions Emblem (বিষয়ভিত্তিক প্রশ্নব্যাংক)
export const SubjectwiseIcon = ({ size = 24, className = '', style = {} }) => (
  <svg viewBox="0 0 32 32" style={baseSvgStyle(size, style)} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="subjEmeraldGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    {/* Emerald Disc */}
    <circle cx="16" cy="16" r="15" fill="url(#subjEmeraldGrad)" stroke="#a7f3d0" strokeWidth="1" />
    {/* Stack of 3 Subject Books in Different Colors */}
    {/* Book 1 (Bottom - Blue) */}
    <path d="M8 21.5h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H8a2 2 0 0 1-2-2 2 2 0 0 1 2-2z" fill="#2563eb" stroke="#ffffff" strokeWidth="0.7" />
    {/* Book 2 (Middle - Orange) */}
    <path d="M9 16.5h15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a2 2 0 0 1-2-2 2 2 0 0 1 2-2z" fill="#f97316" stroke="#ffffff" strokeWidth="0.7" />
    {/* Book 3 (Top - White with Bookmark) */}
    <path d="M10 11.5h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H10a2 2 0 0 1-2-2 2 2 0 0 1 2-2z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.7" />
    {/* Protruding Red Bookmark Ribbon */}
    <path d="M13 11.5v5l2-1.2 2 1.2v-5" fill="#ef4444" />
  </svg>
);

// 🔲 18. All Categories App Grid Icon (সকল ক্যাটাগরি)
export const AllCategoriesIcon = ({ size = 24, className = '', style = {} }) => (
  <svg viewBox="0 0 32 32" style={baseSvgStyle(size, style)} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="allGridGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
    <rect x="5" y="5" width="9.5" height="9.5" rx="2.5" fill="url(#allGridGrad)" />
    <rect x="17.5" y="5" width="9.5" height="9.5" rx="2.5" fill="#10b981" />
    <rect x="5" y="17.5" width="9.5" height="9.5" rx="2.5" fill="#f59e0b" />
    <rect x="17.5" y="17.5" width="9.5" height="9.5" rx="2.5" fill="#8b5cf6" />
  </svg>
);

/**
 * Universal Category Icon Resolver
 * Returns the exact matching real official SVG logo component for any given category ID or name.
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
    case 'bcs':
      return <BcsIcon {...props} />;
    case 'ntrca':
      return <NtrcaIcon {...props} />;
    case 'primary':
      return <PrimaryIcon {...props} />;
    case 'railway':
    case 'rail':
      return <RailwayIcon {...props} />;
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
    case 'ngo':
    case 'development':
      return <NgoIcon {...props} />;
    case 'teaching':
    case 'teacher':
    case 'education':
      return <TeachingIcon {...props} />;
    case 'private':
    case 'corporate':
    case 'company':
      return <PrivateIcon {...props} />;
    case 'parttime':
    case 'part-time':
      return <PartTimeIcon {...props} />;
    case 'women':
    case 'female':
      return <WomenIcon {...props} />;
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
