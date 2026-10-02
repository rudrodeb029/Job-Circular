import React from 'react';

/**
 * High-fidelity vector illustrations crafted specifically for the Donate experience,
 * replicating the warm cartoon art style shown in the reference designs.
 */

export const PrimaryEducationIllustration = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 400 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
  >
    <defs>
      <linearGradient id="bgEdu" x1="0" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fef3c7" />
        <stop offset="0.6" stopColor="#fed7aa" />
        <stop offset="1" stopColor="#fde047" />
      </linearGradient>
      <linearGradient id="hairGrad" x1="140" y1="50" x2="220" y2="120" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1e293b" />
        <stop offset="1" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="shirtGrad" x1="130" y1="170" x2="210" y2="240" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ea580c" />
        <stop offset="1" stopColor="#c2410c" />
      </linearGradient>
      <linearGradient id="greenHill" x1="0" y1="140" x2="400" y2="240" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34d399" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>
    </defs>

    {/* Warm sunny sky background */}
    <rect width="400" height="240" fill="url(#bgEdu)" />

    {/* Soft hills in background */}
    <path d="M-20 240 Q100 130 220 180 T420 160 L420 240 Z" fill="url(#greenHill)" fillOpacity="0.85" />
    <path d="M-10 240 Q140 180 300 210 T420 200 L420 240 Z" fill="#047857" fillOpacity="0.4" />

    {/* Desk surface */}
    <rect y="210" width="400" height="30" fill="#f8fafc" />
    <line x1="0" y1="210" x2="400" y2="210" stroke="#cbd5e1" strokeWidth="2" />

    {/* Books Stack on Desk (Right side) */}
    <g transform="translate(260, 115)">
      {/* Book 1 (Bottom - Orange) */}
      <rect x="10" y="70" width="85" height="18" rx="4" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
      <path d="M12 70 L20 70 L20 88 L12 88 Z" fill="#fdba74" />
      {/* Book 2 (Middle - Green) */}
      <rect x="15" y="50" width="75" height="18" rx="4" fill="#10b981" stroke="#059669" strokeWidth="1.5" />
      <path d="M17 50 L25 50 L25 68 L17 68 Z" fill="#6ee7b7" />
      {/* Book 3 (Top - Red) */}
      <rect x="22" y="30" width="65" height="18" rx="4" fill="#ef4444" stroke="#dc2626" strokeWidth="1.5" />
      <path d="M24 30 L32 30 L32 48 L24 48 Z" fill="#fca5a5" />

      {/* Pencil Holder Cup (Cyan with pencils) */}
      <rect x="90" y="52" width="22" height="36" rx="4" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.5" />
      {/* Ruler & Pencils sticking out */}
      <rect x="93" y="24" width="4" height="30" rx="1" fill="#fbbf24" stroke="#d97706" />
      <rect x="100" y="32" width="4" height="24" rx="1" fill="#ec4899" stroke="#db2777" />
      <rect x="106" y="28" width="3" height="26" rx="1" fill="#8b5cf6" />
    </g>

    {/* Boy Figure (Center-Left) */}
    <g transform="translate(100, 30)">
      {/* Boy Body & Orange T-Shirt */}
      <path d="M50 180 C50 150 75 140 100 140 C125 140 150 150 150 180 L160 210 L40 210 Z" fill="url(#shirtGrad)" />
      {/* Collar */}
      <path d="M85 142 C92 152 108 152 115 142" stroke="#fdba74" strokeWidth="4" strokeLinecap="round" />

      {/* Neck */}
      <rect x="88" y="118" width="24" height="26" rx="6" fill="#fcd34d" />

      {/* Head */}
      <ellipse cx="100" cy="85" rx="38" ry="42" fill="#fed7aa" />

      {/* Spiky / Messy Boy Hair */}
      <path
        d="M62 75 C60 55 75 35 100 32 C125 28 145 42 142 68 C148 65 152 74 146 82 C140 90 142 98 136 102 C134 76 130 50 100 48 C78 46 68 62 62 75 Z"
        fill="url(#hairGrad)"
      />
      {/* Stray hair tufts */}
      <path d="M102 30 Q110 18 118 28 Q125 15 132 26" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />

      {/* Ears */}
      <ellipse cx="63" cy="88" rx="8" ry="11" fill="#fdbA74" />
      <ellipse cx="137" cy="88" rx="8" ry="11" fill="#fdbA74" />

      {/* Round Black / Pink Glasses */}
      <circle cx="82" cy="82" r="15" fill="#f8fafc" stroke="#dc2626" strokeWidth="3.5" fillOpacity="0.4" />
      <circle cx="118" cy="82" r="15" fill="#f8fafc" stroke="#dc2626" strokeWidth="3.5" fillOpacity="0.4" />
      <line x1="97" y1="82" x2="103" y2="82" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" />

      {/* Eyes through glasses */}
      <circle cx="84" cy="82" r="4.5" fill="#0f172a" />
      <circle cx="120" cy="82" r="4.5" fill="#0f172a" />
      <circle cx="86" cy="80" r="1.5" fill="white" />
      <circle cx="122" cy="80" r="1.5" fill="white" />

      {/* Blushing cheeks */}
      <ellipse cx="73" cy="94" rx="6" ry="3.5" fill="#f87171" fillOpacity="0.5" />
      <ellipse cx="127" cy="94" rx="6" ry="3.5" fill="#f87171" fillOpacity="0.5" />

      {/* Smile */}
      <path d="M93 98 Q100 104 107 98" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />

      {/* Hands Resting on Chin / Cheeks */}
      {/* Left Hand */}
      <path
        d="M66 112 C60 106 58 92 68 88 C76 85 80 94 78 108 Z"
        fill="#fed7aa"
        stroke="#ea580c"
        strokeWidth="1.5"
      />
      {/* Right Hand */}
      <path
        d="M134 112 C140 106 142 92 132 88 C124 85 120 94 122 108 Z"
        fill="#fed7aa"
        stroke="#ea580c"
        strokeWidth="1.5"
      />
      {/* Arms resting on desk */}
      <path d="M48 180 C50 145 68 115 75 110" stroke="#c2410c" strokeWidth="14" strokeLinecap="round" />
      <path d="M152 180 C150 145 132 115 125 110" stroke="#c2410c" strokeWidth="14" strokeLinecap="round" />
    </g>

    {/* Sparkles / floating stars */}
    <path d="M30 45 L33 55 L43 58 L33 61 L30 71 L27 61 L17 58 L27 55 Z" fill="#fbbf24" fillOpacity="0.8" />
    <path d="M350 40 L352 48 L360 50 L352 52 L350 60 L348 52 L340 50 L348 48 Z" fill="#fbbf24" fillOpacity="0.7" />
  </svg>
);

export const GiveHomelessIllustration = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 400 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
  >
    <defs>
      <linearGradient id="bgGive" x1="0" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ccfbf1" />
        <stop offset="0.6" stopColor="#a7f3d0" />
        <stop offset="1" stopColor="#99f6e4" />
      </linearGradient>
    </defs>

    {/* Gentle mint background */}
    <rect width="400" height="240" fill="url(#bgGive)" />

    {/* Floating decorative backdrop blobs */}
    <ellipse cx="200" cy="120" rx="160" ry="85" fill="#f0fdf4" fillOpacity="0.7" />
    <circle cx="80" cy="50" r="28" fill="#5eead4" fillOpacity="0.3" />
    <circle cx="340" cy="180" r="34" fill="#a7f3d0" fillOpacity="0.4" />

    {/* Left Reaching Hand (Graceful line art hand) */}
    <g transform="translate(15, 70)">
      <path
        d="M0 60 C35 55 60 50 85 45 C95 43 110 38 120 48 C126 54 118 64 105 66 C120 66 128 75 116 83 C108 88 95 85 85 86 C98 90 102 98 90 103 C78 107 55 95 30 100 L0 110 Z"
        fill="#f8fafc"
        stroke="#0f766e"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Wrist sleeve cuff */}
      <path d="M0 50 C10 65 10 95 0 115" stroke="#0d9488" strokeWidth="4" />
    </g>

    {/* Right Reaching Hand (Supporting underneath) */}
    <g transform="translate(265, 80)">
      <path
        d="M135 60 C100 55 75 50 50 45 C40 43 25 38 15 48 C9 54 17 64 30 66 C15 66 7 75 19 83 C27 88 40 85 50 86 C37 90 33 98 45 103 C57 107 80 95 105 100 L135 110 Z"
        fill="#f8fafc"
        stroke="#0f766e"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path d="M135 50 C125 65 125 95 135 115" stroke="#0d9488" strokeWidth="4" />
    </g>

    {/* The Letters "G I V E" in Vibrant 3D Isometric Art */}
    <g transform="translate(115, 60)">
      {/* Letter G (Teal / Cyan) */}
      <g transform="translate(0, 10)">
        <path
          d="M38 15 C20 15 8 28 8 46 C8 64 20 78 38 78 C52 78 62 70 65 58 L42 58 L42 46 L76 46 C77 75 58 90 38 90 C12 90 -4 71 -4 46 C-4 21 12 2 38 2 C54 2 67 10 73 22 L61 30 C56 21 48 15 38 15 Z"
          fill="#06b6d4"
          stroke="#0891b2"
          strokeWidth="3"
        />
        {/* Letter G 3D extrusion */}
        <path d="M65 58 L72 63 L72 46 L65 46 Z" fill="#0e7490" />
      </g>

      {/* Letter I (Vibrant Coral Pink / Red) */}
      <g transform="translate(68, 5)">
        <rect x="0" y="5" width="16" height="80" rx="4" fill="#f43f5e" stroke="#e11d48" strokeWidth="3" />
        <rect x="-4" y="2" width="24" height="12" rx="3" fill="#fb7185" stroke="#e11d48" strokeWidth="2.5" />
        <rect x="-4" y="76" width="24" height="12" rx="3" fill="#be123c" stroke="#e11d48" strokeWidth="2.5" />
      </g>

      {/* Letter V (Deep Navy / Violet) */}
      <g transform="translate(100, 12)">
        <path
          d="M2 5 L18 5 L28 62 L38 5 L54 5 L36 82 L20 82 Z"
          fill="#1e293b"
          stroke="#0f172a"
          strokeWidth="3"
        />
        <path d="M28 62 L38 5 L44 5 L33 68 Z" fill="#334155" />
      </g>

      {/* Letter E (Warm Golden Amber) */}
      <g transform="translate(150, 10)">
        <path
          d="M0 5 L46 5 L46 19 L16 19 L16 38 L40 38 L40 51 L16 51 L16 71 L48 71 L48 85 L0 85 Z"
          fill="#f59e0b"
          stroke="#d97706"
          strokeWidth="3"
        />
        <path d="M46 5 L52 11 L52 24 L46 19 Z" fill="#b45309" />
      </g>
    </g>

    {/* Sparkles / Love Hearts floating */}
    <path
      d="M200 35 C200 30 194 25 188 25 C180 25 176 33 188 45 L200 56 L212 45 C224 33 220 25 212 25 C206 25 200 30 200 35 Z"
      fill="#ef4444"
      fillOpacity="0.8"
    />
  </svg>
);

export const FoodAidIllustration = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 400 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
  >
    <rect width="400" height="240" fill="#fef3c7" />
    <circle cx="200" cy="120" rx="140" ry="70" fill="#fde68a" fillOpacity="0.6" />
    <g transform="translate(130, 60)">
      {/* Box crate */}
      <rect x="10" y="60" width="120" height="70" rx="10" fill="#d97706" stroke="#b45309" strokeWidth="3" />
      <path d="M10 85 L130 85" stroke="#b45309" strokeWidth="2.5" />
      {/* Bread & Apples */}
      <ellipse cx="45" cy="50" rx="22" ry="16" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
      <circle cx="85" cy="52" r="16" fill="#ef4444" stroke="#dc2626" strokeWidth="2" />
      <path d="M85 36 Q88 30 92 34" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
      {/* Milk Carton */}
      <rect x="96" y="32" width="22" height="38" rx="4" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
    </g>
  </svg>
);

export const HealthCareIllustration = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 400 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
  >
    <rect width="400" height="240" fill="#fee2e2" />
    <circle cx="200" cy="120" rx="140" ry="70" fill="#fecaca" fillOpacity="0.6" />
    <g transform="translate(135, 60)">
      <rect x="20" y="45" width="90" height="75" rx="12" fill="#ffffff" stroke="#ef4444" strokeWidth="3.5" />
      {/* Red Cross */}
      <rect x="56" y="65" width="18" height="35" rx="3" fill="#ef4444" />
      <rect x="47" y="74" width="36" height="17" rx="3" fill="#ef4444" />
      {/* Handle */}
      <path d="M48 45 C48 30 82 30 82 45" stroke="#ef4444" strokeWidth="4" fill="none" />
    </g>
  </svg>
);

export const WinterClothesIllustration = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 400 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
  >
    <rect width="400" height="240" fill="#e0f2fe" />
    <circle cx="200" cy="120" rx="140" ry="70" fill="#bae6fd" fillOpacity="0.6" />
    <g transform="translate(130, 50)">
      {/* Cozy Sweater */}
      <path d="M40 45 L70 45 L100 45 L120 70 L105 85 L95 70 L95 125 L45 125 L45 70 L35 85 L20 70 Z" fill="#6366f1" stroke="#4f46e5" strokeWidth="3" />
      {/* Knit Pattern */}
      <path d="M55 75 L85 75 M55 95 L85 95 M55 115 L85 115" stroke="#a5b4fc" strokeWidth="2.5" strokeDasharray="3 3" />
    </g>
  </svg>
);

export const CauseIllustration = ({ type, className = '', style = {} }) => {
  switch (type) {
    case 'give_homeless':
      return <GiveHomelessIllustration className={className} style={style} />;
    case 'food_aid':
      return <FoodAidIllustration className={className} style={style} />;
    case 'health_care':
      return <HealthCareIllustration className={className} style={style} />;
    case 'winter_clothes':
      return <WinterClothesIllustration className={className} style={style} />;
    case 'primary_education':
    default:
      return <PrimaryEducationIllustration className={className} style={style} />;
  }
};
